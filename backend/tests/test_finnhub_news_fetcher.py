"""
Tests for Finnhub News Fetcher

Tests cover:
- Successful article fetching and transformation
- Missing API key handling
- HTTP error handling (timeout, request errors)
- Article validation and filtering
- Response format transformation
"""

import pytest
from unittest.mock import patch, MagicMock
import time

from services.finnhub_news_fetcher import FinnhubNewsFetcher


class TestFinnhubNewsFetcher:
    """Tests for FinnhubNewsFetcher"""

    @pytest.fixture
    def fetcher(self):
        """Create a fetcher with a test API key."""
        return FinnhubNewsFetcher(api_key='test_key')

    @pytest.fixture
    def fetcher_no_key(self):
        """Create a fetcher without an API key."""
        return FinnhubNewsFetcher(api_key=None)

    @pytest.fixture
    def sample_finnhub_response(self):
        """Sample Finnhub API response."""
        return [
            {
                'category': 'company',
                'datetime': 1707465600,
                'headline': 'Apple announces new product line',
                'id': 15805925,
                'image': 'https://example.com/image.jpg',
                'related': 'AAPL',
                'source': 'MarketWatch',
                'summary': 'Shares of Apple Inc. rose 2% after the announcement.',
                'url': 'https://www.marketwatch.com/story/apple-new-product'
            },
            {
                'category': 'company',
                'datetime': 1707379200,
                'headline': 'Apple Q4 earnings beat expectations',
                'id': 15805926,
                'image': 'https://example.com/image2.jpg',
                'related': 'AAPL',
                'source': 'Reuters',
                'summary': 'Apple reported better than expected quarterly earnings.',
                'url': 'https://www.reuters.com/apple-q4-earnings'
            }
        ]

    def test_fetch_success(self, fetcher, sample_finnhub_response):
        """should return transformed articles when API call succeeds"""
        mock_response = MagicMock()
        mock_response.json.return_value = sample_finnhub_response
        mock_response.raise_for_status.return_value = None

        with patch('services.finnhub_news_fetcher.requests.get', return_value=mock_response):
            articles = fetcher.fetch('AAPL')

        assert len(articles) == 2
        assert articles[0]['id'] == 'finnhub_15805925'
        assert articles[0]['headline'] == 'Apple announces new product line'
        assert articles[0]['source'] == 'MarketWatch'
        assert articles[0]['language'] == 'en-US'
        assert articles[0]['url'] == 'https://www.marketwatch.com/story/apple-new-product'

    def test_fetch_returns_all_articles(self, fetcher, sample_finnhub_response):
        """should return all valid articles without truncation"""
        mock_response = MagicMock()
        mock_response.json.return_value = sample_finnhub_response
        mock_response.raise_for_status.return_value = None

        with patch('services.finnhub_news_fetcher.requests.get', return_value=mock_response):
            articles = fetcher.fetch('AAPL')

        assert len(articles) == 2

    def test_fetch_no_api_key(self, fetcher_no_key):
        """should return empty list when API key is not set"""
        with patch.dict('os.environ', {}, clear=True):
            fetcher = FinnhubNewsFetcher(api_key=None)
            articles = fetcher.fetch('AAPL')

        assert articles == []

    def test_fetch_timeout(self, fetcher):
        """should return empty list when request times out"""
        import requests as req
        with patch('services.finnhub_news_fetcher.requests.get',
                   side_effect=req.exceptions.Timeout("Request timed out")):
            articles = fetcher.fetch('AAPL')

        assert articles == []

    def test_fetch_request_error(self, fetcher):
        """should return empty list when request fails"""
        import requests as req
        with patch('services.finnhub_news_fetcher.requests.get',
                   side_effect=req.exceptions.ConnectionError("Connection failed")):
            articles = fetcher.fetch('AAPL')

        assert articles == []

    def test_fetch_unexpected_response_format(self, fetcher):
        """should return empty list when API returns unexpected format"""
        mock_response = MagicMock()
        mock_response.json.return_value = {'error': 'Invalid symbol'}
        mock_response.raise_for_status.return_value = None

        with patch('services.finnhub_news_fetcher.requests.get', return_value=mock_response):
            articles = fetcher.fetch('INVALID')

        assert articles == []

    def test_fetch_filters_invalid_articles(self, fetcher):
        """should filter out articles missing headline or url"""
        raw_data = [
            {
                'headline': 'Valid article',
                'url': 'https://example.com/valid',
                'id': 1,
                'datetime': 1707465600
            },
            {
                'headline': '',
                'url': 'https://example.com/no-headline',
                'id': 2,
                'datetime': 1707465600
            },
            {
                'headline': 'No URL article',
                'url': '',
                'id': 3,
                'datetime': 1707465600
            }
        ]

        mock_response = MagicMock()
        mock_response.json.return_value = raw_data
        mock_response.raise_for_status.return_value = None

        with patch('services.finnhub_news_fetcher.requests.get', return_value=mock_response):
            articles = fetcher.fetch('AAPL')

        assert len(articles) == 1
        assert articles[0]['headline'] == 'Valid article'

    def test_transform_article_format(self, fetcher, sample_finnhub_response):
        """should transform article to unified format with all fields"""
        mock_response = MagicMock()
        mock_response.json.return_value = sample_finnhub_response
        mock_response.raise_for_status.return_value = None

        with patch('services.finnhub_news_fetcher.requests.get', return_value=mock_response):
            articles = fetcher.fetch('AAPL')

        article = articles[0]
        required_fields = ['id', 'headline', 'summary', 'source', 'url', 'image', 'published_at', 'language']
        for field in required_fields:
            assert field in article, f"Missing field: {field}"

    def test_transform_article_datetime(self, fetcher):
        """should correctly format unix timestamp to ISO string"""
        raw_data = [{
            'headline': 'Test',
            'url': 'https://example.com',
            'id': 1,
            'datetime': 1707465600,
            'source': 'Test Source',
            'summary': 'Test summary',
            'image': None
        }]

        mock_response = MagicMock()
        mock_response.json.return_value = raw_data
        mock_response.raise_for_status.return_value = None

        with patch('services.finnhub_news_fetcher.requests.get', return_value=mock_response):
            articles = fetcher.fetch('AAPL')

        assert articles[0]['published_at'] != ''
        assert 'T' in articles[0]['published_at']

    def test_fetch_empty_response(self, fetcher):
        """should return empty list when API returns empty array"""
        mock_response = MagicMock()
        mock_response.json.return_value = []
        mock_response.raise_for_status.return_value = None

        with patch('services.finnhub_news_fetcher.requests.get', return_value=mock_response):
            articles = fetcher.fetch('AAPL')

        assert articles == []

    def test_fetch_http_error(self, fetcher):
        """should return empty list when HTTP error occurs"""
        import requests as req
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = req.exceptions.HTTPError("401 Unauthorized")

        with patch('services.finnhub_news_fetcher.requests.get', return_value=mock_response):
            articles = fetcher.fetch('AAPL')

        assert articles == []
