"""
Google News RSS Fetcher

Parses Google News RSS feeds for Asian market stocks (TW, HK, JP).
Single responsibility: Retrieve and transform Google News RSS data.
"""

import logging
import time
from datetime import datetime
from email.utils import parsedate_to_datetime
from typing import Dict, List, Optional
from urllib.parse import quote

import feedparser

from constants import NEWS_REQUEST_TIMEOUT

logger = logging.getLogger(__name__)


class GoogleNewsFetcher:
    """
    Fetches news from Google News RSS feeds.

    Supports dependency injection for testing.

    Examples:
        >>> fetcher = GoogleNewsFetcher()
        >>> articles = fetcher.fetch('台積電', symbol='2330.TW', hl='zh-TW', gl='TW')
    """

    BASE_URL = "https://news.google.com/rss/search"
    REQUEST_DELAY = 0.2  # 200ms between requests to be respectful

    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout: int = NEWS_REQUEST_TIMEOUT,
        request_delay: float = 0.2
    ):
        self._base_url = base_url or self.BASE_URL
        self._timeout = timeout
        self._request_delay = request_delay
        self._last_request_time = 0.0

    def fetch(
        self,
        query: str,
        symbol: str,
        limit: int = 10,
        hl: str = "zh-TW",
        gl: str = "TW"
    ) -> List[Dict]:
        """
        Fetch news from Google News RSS for a given search query.

        Args:
            query: Search query (company name + optional keywords)
            symbol: Stock symbol for ID generation
            limit: Maximum number of articles to return
            hl: Language/locale parameter (e.g., 'zh-TW', 'en')
            gl: Country/region parameter (e.g., 'TW', 'HK', 'JP')

        Returns:
            List of news article dictionaries in unified format
        """
        try:
            self._respect_rate_limit()

            encoded_query = quote(query)
            url = f"{self._base_url}?q={encoded_query}&hl={hl}&gl={gl}"

            feed = feedparser.parse(url)

            if feed.bozo and not feed.entries:
                logger.warning(f"Google News RSS parse error for '{query}': {feed.bozo_exception}")
                return []

            language = self._determine_language(hl)
            articles = []

            for i, entry in enumerate(feed.entries[:limit]):
                try:
                    article = self._transform_entry(entry, symbol, i, language)
                    if article:
                        articles.append(article)
                except Exception as e:
                    logger.warning(f"Failed to parse RSS entry for '{query}': {str(e)}")
                    continue

            logger.info(f"Fetched {len(articles)} articles from Google News for '{query}'")
            return articles

        except Exception as e:
            logger.error(f"Unexpected error fetching Google News for '{query}': {str(e)}")
            return []

    def _respect_rate_limit(self):
        """Enforce minimum delay between requests."""
        now = time.time()
        elapsed = now - self._last_request_time
        if elapsed < self._request_delay:
            time.sleep(self._request_delay - elapsed)
        self._last_request_time = time.time()

    def _transform_entry(
        self,
        entry: Dict,
        symbol: str,
        index: int,
        language: str
    ) -> Optional[Dict]:
        """Transform an RSS feed entry to the unified format."""
        title = entry.get('title', '')
        link = entry.get('link', '')

        if not title or not link:
            return None

        published_at = self._parse_published_date(entry)
        source = self._extract_source(entry)

        return {
            'id': f"google_{symbol}_{index}",
            'headline': title,
            'summary': None,
            'source': source,
            'url': link,
            'image': None,
            'published_at': published_at,
            'language': language
        }

    def _parse_published_date(self, entry: Dict) -> str:
        """Parse the published date from an RSS entry."""
        published = entry.get('published', '')
        if not published:
            return datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')

        try:
            dt = parsedate_to_datetime(published)
            return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        except (ValueError, TypeError):
            return datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')

    def _extract_source(self, entry: Dict) -> Optional[str]:
        """Extract the source name from an RSS entry."""
        source_detail = entry.get('source', {})
        if hasattr(source_detail, 'get'):
            return source_detail.get('title', None)
        return None

    def _determine_language(self, hl: str) -> str:
        """Determine the full language tag from the hl parameter."""
        language_map = {
            'zh-TW': 'zh-TW',
            'en': 'en-US',
            'ja': 'ja-JP',
        }
        return language_map.get(hl, 'en-US')
