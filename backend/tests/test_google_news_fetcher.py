"""
Tests for Google News RSS Fetcher

Tests cover:
- Successful RSS feed parsing
- Empty feed handling
- Invalid entry handling
- Rate limiting behavior
- Language determination
- Source extraction
"""

import pytest
from unittest.mock import patch, MagicMock
import time

from services.google_news_fetcher import GoogleNewsFetcher


class TestGoogleNewsFetcher:
    """Tests for GoogleNewsFetcher"""

    @pytest.fixture
    def fetcher(self):
        """Create a fetcher with no delay for testing."""
        return GoogleNewsFetcher(request_delay=0)

    @pytest.fixture
    def sample_feed(self):
        """Sample parsed RSS feed."""
        feed = MagicMock()
        feed.bozo = False
        feed.entries = [
            MagicMock(
                title='台積電股價創新高',
                link='https://news.google.com/articles/abc123',
                published='Mon, 09 Feb 2026 10:00:00 GMT',
                source={'title': '經濟日報'}
            ),
            MagicMock(
                title='半導體產業展望',
                link='https://news.google.com/articles/def456',
                published='Mon, 09 Feb 2026 08:00:00 GMT',
                source={'title': '工商時報'}
            ),
        ]
        # Set up get() for entries
        for entry in feed.entries:
            entry.get = lambda key, default='', _e=entry: getattr(_e, key, default)
        return feed

    @pytest.fixture
    def empty_feed(self):
        """Empty RSS feed."""
        feed = MagicMock()
        feed.bozo = False
        feed.entries = []
        return feed

    @pytest.fixture
    def error_feed(self):
        """RSS feed with parse error and no entries."""
        feed = MagicMock()
        feed.bozo = True
        feed.bozo_exception = Exception("Parse error")
        feed.entries = []
        return feed

    def test_fetch_success(self, fetcher, sample_feed):
        """should return transformed articles from RSS feed"""
        with patch('services.google_news_fetcher.feedparser.parse', return_value=sample_feed):
            articles = fetcher.fetch(
                query='台積電+股票',
                symbol='2330.TW',
                hl='zh-TW',
                gl='TW'
            )

        assert len(articles) == 2
        assert articles[0]['id'] == 'google_2330.TW_0'
        assert articles[0]['headline'] == '台積電股價創新高'
        assert articles[0]['language'] == 'zh-TW'
        assert articles[0]['image'] is None
        assert articles[0]['summary'] is None

    def test_fetch_returns_all_entries(self, fetcher, sample_feed):
        """should return all valid entries without truncation"""
        with patch('services.google_news_fetcher.feedparser.parse', return_value=sample_feed):
            articles = fetcher.fetch(
                query='台積電+股票',
                symbol='2330.TW',
                hl='zh-TW',
                gl='TW'
            )

        assert len(articles) == 2

    def test_fetch_empty_feed(self, fetcher, empty_feed):
        """should return empty list for empty feed"""
        with patch('services.google_news_fetcher.feedparser.parse', return_value=empty_feed):
            articles = fetcher.fetch(
                query='test',
                symbol='TEST'
            )

        assert articles == []

    def test_fetch_parse_error_no_entries(self, fetcher, error_feed):
        """should return empty list when feed has parse error and no entries"""
        with patch('services.google_news_fetcher.feedparser.parse', return_value=error_feed):
            articles = fetcher.fetch(
                query='test',
                symbol='TEST'
            )

        assert articles == []

    def test_fetch_parse_error_with_entries(self, fetcher):
        """should return articles even when feed has minor parse errors"""
        feed = MagicMock()
        feed.bozo = True
        feed.bozo_exception = Exception("Minor parse warning")
        entry = MagicMock()
        entry.get = lambda key, default='': {
            'title': 'Article with parse warning',
            'link': 'https://example.com/article',
            'published': 'Mon, 09 Feb 2026 10:00:00 GMT',
            'source': {'title': 'Test Source'}
        }.get(key, default)
        feed.entries = [entry]

        with patch('services.google_news_fetcher.feedparser.parse', return_value=feed):
            articles = fetcher.fetch(
                query='test',
                symbol='TEST'
            )

        assert len(articles) == 1

    def test_fetch_exception(self, fetcher):
        """should return empty list when unexpected error occurs"""
        with patch('services.google_news_fetcher.feedparser.parse', side_effect=Exception("Network error")):
            articles = fetcher.fetch(
                query='test',
                symbol='TEST'
            )

        assert articles == []

    def test_language_determination_zh_tw(self, fetcher):
        """should determine zh-TW language correctly"""
        result = fetcher._determine_language('zh-TW')
        assert result == 'zh-TW'

    def test_language_determination_en(self, fetcher):
        """should determine en-US language correctly"""
        result = fetcher._determine_language('en')
        assert result == 'en-US'

    def test_language_determination_unknown(self, fetcher):
        """should default to en-US for unknown language"""
        result = fetcher._determine_language('unknown')
        assert result == 'en-US'

    def test_extract_source_with_title(self, fetcher):
        """should extract source title from RSS entry"""
        entry = {'source': {'title': 'Reuters'}}
        result = fetcher._extract_source(entry)
        assert result == 'Reuters'

    def test_extract_source_no_source(self, fetcher):
        """should return None when source is missing"""
        entry = {}
        result = fetcher._extract_source(entry)
        assert result is None

    def test_transform_entry_missing_title(self, fetcher):
        """should return None for entry with empty title"""
        entry = MagicMock()
        entry.get = lambda key, default='': {
            'title': '',
            'link': 'https://example.com'
        }.get(key, default)

        result = fetcher._transform_entry(entry, 'TEST', 0, 'en-US')
        assert result is None

    def test_transform_entry_missing_link(self, fetcher):
        """should return None for entry with empty link"""
        entry = MagicMock()
        entry.get = lambda key, default='': {
            'title': 'Test Title',
            'link': ''
        }.get(key, default)

        result = fetcher._transform_entry(entry, 'TEST', 0, 'en-US')
        assert result is None

    def test_article_id_format(self, fetcher, sample_feed):
        """should generate correct article ID format"""
        with patch('services.google_news_fetcher.feedparser.parse', return_value=sample_feed):
            articles = fetcher.fetch(
                query='test',
                symbol='2330.TW',
                hl='zh-TW',
                gl='TW'
            )

        assert articles[0]['id'] == 'google_2330.TW_0'
        assert articles[1]['id'] == 'google_2330.TW_1'

    def test_rate_limiting(self):
        """should enforce delay between requests"""
        fetcher = GoogleNewsFetcher(request_delay=0.1)

        empty_feed = MagicMock()
        empty_feed.bozo = False
        empty_feed.entries = []

        with patch('services.google_news_fetcher.feedparser.parse', return_value=empty_feed):
            start = time.time()
            fetcher.fetch(query='test1', symbol='T1')
            fetcher.fetch(query='test2', symbol='T2')
            elapsed = time.time() - start

        assert elapsed >= 0.1
