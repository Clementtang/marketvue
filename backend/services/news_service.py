"""
News Service - Orchestrator

Routes news requests to the appropriate fetcher based on stock symbol suffix.
Uses CompanyNameService for search queries in Asian markets.

Single responsibility: Coordinate news fetching across different sources.
"""

import logging
from datetime import datetime
from typing import Dict, Optional

from .company_name_service import CompanyNameService
from .finnhub_news_fetcher import FinnhubNewsFetcher
from .google_news_fetcher import GoogleNewsFetcher

logger = logging.getLogger(__name__)


class NewsService:
    """
    Orchestrates news fetching from multiple sources based on stock market.

    Routing logic:
    - .TW / .TWO suffix -> Google News (zh-TW, gl=TW)
    - .HK suffix -> Google News (zh-TW, gl=HK)
    - .T suffix -> Google News (en, gl=JP)
    - Everything else -> Finnhub API

    Supports dependency injection for testing.

    Examples:
        >>> service = NewsService()
        >>> result = service.get_news('AAPL', limit=10, page=1)
        >>> result = service.get_news('2330.TW', limit=10, page=1)
    """

    def __init__(
        self,
        finnhub_fetcher: Optional[FinnhubNewsFetcher] = None,
        google_fetcher: Optional[GoogleNewsFetcher] = None,
        name_service: Optional[CompanyNameService] = None
    ):
        self._finnhub_fetcher = finnhub_fetcher or FinnhubNewsFetcher()
        self._google_fetcher = google_fetcher or GoogleNewsFetcher()
        self._name_service = name_service or CompanyNameService()

    def get_news(self, symbol: str, limit: int = 10, page: int = 1) -> Dict:
        """
        Fetch news for a given stock symbol.

        Routes to the appropriate fetcher based on symbol suffix,
        applies pagination, and returns a unified response.

        Args:
            symbol: Stock ticker symbol (e.g., 'AAPL', '2330.TW')
            limit: Number of articles per page
            page: Page number (1-indexed)

        Returns:
            Dictionary with symbol, news list, total count, has_more flag, cached_at
        """
        symbol = symbol.upper()

        try:
            fetch_limit = limit * page
            articles = self._fetch_from_source(symbol, fetch_limit)

            start_index = (page - 1) * limit
            paginated = articles[start_index:start_index + limit]
            total = len(articles)
            has_more = start_index + limit < total

            return {
                'symbol': symbol,
                'news': paginated,
                'total': total,
                'has_more': has_more,
                'cached_at': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
            }

        except Exception as e:
            logger.error(f"Error fetching news for {symbol}: {str(e)}")
            return {
                'symbol': symbol,
                'news': [],
                'total': 0,
                'has_more': False,
                'cached_at': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
            }

    def _fetch_from_source(self, symbol: str, limit: int) -> list:
        """Route to the correct fetcher based on symbol suffix."""
        upper_symbol = symbol.upper()

        if upper_symbol.endswith('.TW') or upper_symbol.endswith('.TWO'):
            return self._fetch_google_news(symbol, limit, hl='zh-TW', gl='TW', lang_key='zh-TW')
        elif upper_symbol.endswith('.HK'):
            return self._fetch_google_news(symbol, limit, hl='zh-TW', gl='HK', lang_key='zh-TW')
        elif upper_symbol.endswith('.T'):
            return self._fetch_google_news(symbol, limit, hl='en', gl='JP', lang_key='en-US')
        else:
            return self._finnhub_fetcher.fetch(symbol, limit)

    def _fetch_google_news(
        self,
        symbol: str,
        limit: int,
        hl: str,
        gl: str,
        lang_key: str
    ) -> list:
        """Fetch news from Google News with company name lookup."""
        company_name = self._get_search_query(symbol, lang_key)
        query = self._build_search_query(company_name, symbol, lang_key)

        return self._google_fetcher.fetch(
            query=query,
            symbol=symbol,
            limit=limit,
            hl=hl,
            gl=gl
        )

    def _get_search_query(self, symbol: str, lang_key: str) -> str:
        """Get the company name for search queries."""
        names = self._name_service.get_company_name(symbol)

        if lang_key == 'zh-TW':
            name = names.get('zh-TW') or names.get('en-US') or symbol
        else:
            name = names.get('en-US') or names.get('zh-TW') or symbol

        return name

    def _build_search_query(self, company_name: str, symbol: str, lang_key: str) -> str:
        """Build the search query string for Google News."""
        if lang_key == 'zh-TW':
            return f"{company_name}+股票"
        return company_name

    @staticmethod
    def is_us_stock(symbol: str) -> bool:
        """Check if a symbol represents a US stock."""
        upper = symbol.upper()
        return not (
            upper.endswith('.TW') or
            upper.endswith('.TWO') or
            upper.endswith('.HK') or
            upper.endswith('.T')
        )
