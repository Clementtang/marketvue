"""
Finnhub News Fetcher

Fetches company news from the Finnhub API for US stocks.
Single responsibility: Retrieve and transform Finnhub news data.
"""

import logging
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import requests

from constants import NEWS_DATE_FORMAT, NEWS_REQUEST_TIMEOUT, NEWS_TIME_WINDOW_HOURS

logger = logging.getLogger(__name__)


class FinnhubNewsFetcher:
    """
    Fetches company news from the Finnhub API.

    Supports dependency injection for testing via api_key and base_url params.

    Examples:
        >>> fetcher = FinnhubNewsFetcher()
        >>> articles = fetcher.fetch('AAPL')
    """

    BASE_URL = "https://finnhub.io/api/v1"

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: int = NEWS_REQUEST_TIMEOUT
    ):
        self._api_key = api_key or os.getenv('FINNHUB_API_KEY')
        self._base_url = base_url or self.BASE_URL
        self._timeout = timeout

    def fetch(self, symbol: str) -> List[Dict]:
        """
        Fetch company news from Finnhub for a given symbol.

        Returns all articles from the past 72 hours.

        Args:
            symbol: Stock ticker symbol (e.g., 'AAPL')

        Returns:
            List of news article dictionaries in unified format
        """
        if not self._api_key:
            logger.warning("FINNHUB_API_KEY not set, returning empty news list")
            return []

        try:
            today = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(hours=NEWS_TIME_WINDOW_HOURS)).strftime('%Y-%m-%d')

            url = f"{self._base_url}/company-news"
            params = {
                'symbol': symbol.upper(),
                'from': start_date,
                'to': today,
                'token': self._api_key
            }

            response = requests.get(url, params=params, timeout=self._timeout)
            response.raise_for_status()

            raw_articles = response.json()

            if not isinstance(raw_articles, list):
                logger.warning(f"Unexpected Finnhub response format for {symbol}")
                return []

            articles = [
                self._transform_article(article)
                for article in raw_articles
                if self._is_valid_article(article)
            ]

            logger.info(f"Fetched {len(articles)} articles from Finnhub for {symbol}")
            return articles

        except requests.exceptions.Timeout:
            logger.error(f"Finnhub request timed out for {symbol}")
            return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Finnhub request failed for {symbol}: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error fetching Finnhub news for {symbol}: {str(e)}")
            return []

    def _transform_article(self, article: Dict) -> Dict:
        """Transform a Finnhub article to the unified format."""
        published_at = ""
        if article.get('datetime'):
            try:
                published_at = datetime.fromtimestamp(
                    article['datetime']
                ).strftime(NEWS_DATE_FORMAT)
            except (ValueError, OSError):
                published_at = ""

        return {
            'id': f"finnhub_{article.get('id', '')}",
            'headline': article.get('headline', ''),
            'summary': article.get('summary', None),
            'source': article.get('source', None),
            'url': article.get('url', ''),
            'image': article.get('image', None),
            'published_at': published_at,
            'language': 'en-US'
        }

    def _is_valid_article(self, article: Dict) -> bool:
        """Check if an article has the minimum required fields."""
        return bool(article.get('headline') and article.get('url'))
