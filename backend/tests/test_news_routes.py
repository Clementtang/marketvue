"""
Tests for News Routes (Flask endpoints)

Tests cover:
- GET /api/v1/news/<symbol> success
- Invalid symbol format
- Error handling
"""

import pytest
from unittest.mock import patch, MagicMock
import json

from routes.news_routes import set_news_service, get_news_service


class TestNewsEndpoint:
    """Tests for GET /api/v1/news/<symbol> endpoint"""

    @pytest.fixture(autouse=True)
    def setup_mock_service(self):
        """Set up mock news service for each test."""
        self.mock_service = MagicMock()
        self.mock_service.get_news.return_value = {
            'symbol': 'AAPL',
            'news': [
                {
                    'id': 'finnhub_1',
                    'headline': 'Apple announces new product',
                    'summary': 'Summary text',
                    'source': 'Reuters',
                    'url': 'https://example.com/article',
                    'image': 'https://example.com/image.jpg',
                    'published_at': '2026-02-09T10:00:00Z',
                    'language': 'en-US'
                }
            ],
            'total': 1,
            'cached_at': '2026-02-09T10:05:00Z'
        }
        set_news_service(self.mock_service)
        yield
        set_news_service(None)

    def test_get_news_success(self, client):
        """should return news for valid symbol"""
        response = client.get('/api/v1/news/AAPL')

        assert response.status_code == 200
        data = response.get_json()
        assert data['symbol'] == 'AAPL'
        assert len(data['news']) == 1
        assert data['news'][0]['headline'] == 'Apple announces new product'
        assert 'total' in data
        assert 'cached_at' in data

    def test_get_news_no_pagination_params(self, client):
        """should call service without limit/page params"""
        client.get('/api/v1/news/AAPL')
        call_kwargs = self.mock_service.get_news.call_args[1]
        assert 'limit' not in call_kwargs
        assert 'page' not in call_kwargs
        assert call_kwargs['symbol'] == 'AAPL'

    def test_get_news_tw_stock(self, client):
        """should handle TW stock symbol with dot"""
        self.mock_service.get_news.return_value = {
            'symbol': '2330.TW',
            'news': [],
            'total': 0,
            'cached_at': '2026-02-09T10:05:00Z'
        }

        response = client.get('/api/v1/news/2330.TW')

        assert response.status_code == 200
        self.mock_service.get_news.assert_called_once()

    def test_get_news_hk_stock(self, client):
        """should handle HK stock symbol"""
        self.mock_service.get_news.return_value = {
            'symbol': '0700.HK',
            'news': [],
            'total': 0,
            'cached_at': '2026-02-09T10:05:00Z'
        }

        response = client.get('/api/v1/news/0700.HK')

        assert response.status_code == 200

    def test_get_news_invalid_symbol(self, client):
        """should return 400 for invalid symbol format"""
        response = client.get('/api/v1/news/INVALID@SYMBOL!')

        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data

    def test_get_news_symbol_too_long(self, client):
        """should return 400 for symbol longer than 10 chars"""
        response = client.get('/api/v1/news/VERYLONGSYMBOL')

        assert response.status_code == 400

    def test_get_news_service_error(self, client):
        """should handle service exception gracefully"""
        self.mock_service.get_news.side_effect = Exception("Service error")

        response = client.get('/api/v1/news/AAPL')

        assert response.status_code == 500
        data = response.get_json()
        assert 'error' in data

    def test_get_news_symbol_uppercased(self, client):
        """should uppercase the symbol before passing to service"""
        client.get('/api/v1/news/aapl')
        call_kwargs = self.mock_service.get_news.call_args[1]
        assert call_kwargs['symbol'] == 'AAPL'
