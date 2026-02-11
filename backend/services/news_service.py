"""
News Service - Orchestrator

Routes news requests to the appropriate fetcher based on stock symbol suffix.
Uses CompanyNameService for search queries in Asian markets.

Single responsibility: Coordinate news fetching across different sources.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

from constants import NEWS_TIME_WINDOW_HOURS

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
        >>> result = service.get_news('AAPL')
        >>> result = service.get_news('2330.TW')
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

    def get_news(self, symbol: str) -> Dict:
        """
        Fetch news for a given stock symbol.

        Routes to the appropriate fetcher based on symbol suffix,
        returns all articles from the past 72 hours sorted by date.

        Args:
            symbol: Stock ticker symbol (e.g., 'AAPL', '2330.TW')

        Returns:
            Dictionary with symbol, news list, total count, cached_at
        """
        symbol = symbol.upper()

        try:
            articles = self._fetch_from_source(symbol)
            articles = self._sort_by_date(articles)
            articles = self._filter_by_time_window(articles)

            return {
                'symbol': symbol,
                'news': articles,
                'total': len(articles),
                'cached_at': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
            }

        except Exception as e:
            logger.error(f"Error fetching news for {symbol}: {str(e)}")
            return {
                'symbol': symbol,
                'news': [],
                'total': 0,
                'cached_at': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
            }

    def _fetch_from_source(self, symbol: str) -> list:
        """Route to the correct fetcher based on symbol suffix."""
        upper_symbol = symbol.upper()

        if upper_symbol.endswith('.TW') or upper_symbol.endswith('.TWO'):
            return self._fetch_google_news(symbol, hl='zh-TW', gl='TW', lang_key='zh-TW')
        elif upper_symbol.endswith('.HK'):
            return self._fetch_google_news(symbol, hl='zh-TW', gl='HK', lang_key='zh-TW')
        elif upper_symbol.endswith('.T'):
            return self._fetch_google_news(symbol, hl='en', gl='JP', lang_key='en-US')
        else:
            return self._finnhub_fetcher.fetch(symbol)

    def _fetch_google_news(
        self,
        symbol: str,
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
    def _sort_by_date(articles: list) -> list:
        """Sort articles by published_at descending (newest first)."""
        def parse_date(article):
            try:
                return datetime.strptime(article.get('published_at', ''), '%Y-%m-%dT%H:%M:%SZ')
            except (ValueError, TypeError):
                return datetime.min
        return sorted(articles, key=parse_date, reverse=True)

    @staticmethod
    def _filter_by_time_window(articles: list) -> list:
        """Filter articles to only include those within the 72h time window."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=NEWS_TIME_WINDOW_HOURS)
        filtered = []
        for article in articles:
            try:
                published = datetime.strptime(
                    article.get('published_at', ''), '%Y-%m-%dT%H:%M:%SZ'
                ).replace(tzinfo=timezone.utc)
                if published >= cutoff:
                    filtered.append(article)
            except (ValueError, TypeError):
                filtered.append(article)
        return filtered

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
