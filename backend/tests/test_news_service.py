"""
Tests for News Service (orchestration / source routing)

Tests cover:
- Source routing based on symbol suffix
- US stocks -> Finnhub
- TW stocks -> Google News zh-TW
- HK stocks -> Google News zh-TW
- JP stocks -> Google News en
- Company name lookup integration
- 72h time window filtering
- Error handling
"""

import pytest
from datetime import datetime
from unittest.mock import MagicMock, patch

from services.news_service import NewsService


class TestNewsServiceRouting:
    """Tests for source routing logic"""

    @pytest.fixture
    def mock_finnhub(self):
        """Mock FinnhubNewsFetcher."""
        fetcher = MagicMock()
        fetcher.fetch.return_value = [
            {
                'id': 'finnhub_1',
                'headline': 'US Stock News',
                'summary': 'Summary text',
                'source': 'Reuters',
                'url': 'https://example.com/us',
                'image': 'https://example.com/img.jpg',
                'published_at': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'),
                'language': 'en-US'
            }
        ]
        return fetcher

    @pytest.fixture
    def mock_google(self):
        """Mock GoogleNewsFetcher."""
        fetcher = MagicMock()
        fetcher.fetch.return_value = [
            {
                'id': 'google_2330.TW_0',
                'headline': '台積電新聞',
                'summary': None,
                'source': '經濟日報',
                'url': 'https://example.com/tw',
                'image': None,
                'published_at': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'),
                'language': 'zh-TW'
            }
        ]
        return fetcher

    @pytest.fixture
    def mock_name_service(self):
        """Mock CompanyNameService."""
        service = MagicMock()
        service.get_company_name.return_value = {
            'zh-TW': '台積電',
            'en-US': 'TSMC'
        }
        return service

    @pytest.fixture
    def news_service(self, mock_finnhub, mock_google, mock_name_service):
        """Create a NewsService with all mocked dependencies."""
        return NewsService(
            finnhub_fetcher=mock_finnhub,
            google_fetcher=mock_google,
            name_service=mock_name_service
        )

    def test_route_us_stock_to_finnhub(self, news_service, mock_finnhub):
        """should route US stock symbols to Finnhub"""
        news_service.get_news('AAPL')
        mock_finnhub.fetch.assert_called_once()

    def test_route_tw_stock_to_google(self, news_service, mock_google):
        """should route .TW symbols to Google News with zh-TW"""
        news_service.get_news('2330.TW')
        mock_google.fetch.assert_called_once()
        call_kwargs = mock_google.fetch.call_args
        assert call_kwargs[1]['hl'] == 'zh-TW'
        assert call_kwargs[1]['gl'] == 'TW'

    def test_route_two_stock_to_google(self, news_service, mock_google):
        """should route .TWO symbols to Google News with zh-TW"""
        news_service.get_news('6547.TWO')
        mock_google.fetch.assert_called_once()
        call_kwargs = mock_google.fetch.call_args
        assert call_kwargs[1]['hl'] == 'zh-TW'
        assert call_kwargs[1]['gl'] == 'TW'

    def test_route_hk_stock_to_google(self, news_service, mock_google):
        """should route .HK symbols to Google News with zh-TW and gl=HK"""
        news_service.get_news('0700.HK')
        mock_google.fetch.assert_called_once()
        call_kwargs = mock_google.fetch.call_args
        assert call_kwargs[1]['hl'] == 'zh-TW'
        assert call_kwargs[1]['gl'] == 'HK'

    def test_route_jp_stock_to_google(self, news_service, mock_google):
        """should route .T symbols to Google News with en and gl=JP"""
        news_service.get_news('7203.T')
        mock_google.fetch.assert_called_once()
        call_kwargs = mock_google.fetch.call_args
        assert call_kwargs[1]['hl'] == 'en'
        assert call_kwargs[1]['gl'] == 'JP'

    def test_us_stock_does_not_call_google(self, news_service, mock_google):
        """should not call Google fetcher for US stocks"""
        news_service.get_news('AAPL')
        mock_google.fetch.assert_not_called()

    def test_tw_stock_does_not_call_finnhub(self, news_service, mock_finnhub):
        """should not call Finnhub for TW stocks"""
        news_service.get_news('2330.TW')
        mock_finnhub.fetch.assert_not_called()


class TestNewsServiceCompanyNameLookup:
    """Tests for company name lookup integration"""

    @pytest.fixture
    def mock_name_service(self):
        service = MagicMock()
        service.get_company_name.return_value = {
            'zh-TW': '台積電',
            'en-US': 'TSMC'
        }
        return service

    def test_tw_stock_uses_zh_name(self, mock_name_service):
        """should use zh-TW name for TW stock search query"""
        mock_google = MagicMock()
        mock_google.fetch.return_value = []

        service = NewsService(
            finnhub_fetcher=MagicMock(),
            google_fetcher=mock_google,
            name_service=mock_name_service
        )

        service.get_news('2330.TW')
        call_args = mock_google.fetch.call_args
        assert '台積電' in call_args[1]['query']

    def test_jp_stock_uses_en_name(self, mock_name_service):
        """should use en-US name for JP stock search query"""
        mock_google = MagicMock()
        mock_google.fetch.return_value = []

        service = NewsService(
            finnhub_fetcher=MagicMock(),
            google_fetcher=mock_google,
            name_service=mock_name_service
        )

        service.get_news('7203.T')
        call_args = mock_google.fetch.call_args
        assert 'TSMC' in call_args[1]['query']

    def test_tw_query_appends_stock_keyword(self, mock_name_service):
        """should append '+股票' for TW stock queries"""
        mock_google = MagicMock()
        mock_google.fetch.return_value = []

        service = NewsService(
            finnhub_fetcher=MagicMock(),
            google_fetcher=mock_google,
            name_service=mock_name_service
        )

        service.get_news('2330.TW')
        call_args = mock_google.fetch.call_args
        assert call_args[1]['query'] == '台積電+股票'

    def test_fallback_to_symbol_when_no_name(self):
        """should use symbol as fallback when company name is not found"""
        mock_name_service = MagicMock()
        mock_name_service.get_company_name.return_value = {
            'zh-TW': None,
            'en-US': None
        }
        mock_google = MagicMock()
        mock_google.fetch.return_value = []

        service = NewsService(
            finnhub_fetcher=MagicMock(),
            google_fetcher=mock_google,
            name_service=mock_name_service
        )

        service.get_news('9999.TW')
        call_args = mock_google.fetch.call_args
        assert '9999.TW' in call_args[1]['query']


class TestNewsServiceResponseFormat:
    """Tests for response format (no pagination)"""

    @pytest.fixture
    def service_with_articles(self):
        """Create a service that returns articles."""
        recent_date = datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
        mock_finnhub = MagicMock()
        mock_finnhub.fetch.return_value = [
            {
                'id': f'finnhub_{i}',
                'headline': f'Article {i}',
                'summary': None,
                'source': 'Test',
                'url': f'https://example.com/{i}',
                'image': None,
                'published_at': recent_date,
                'language': 'en-US'
            }
            for i in range(25)
        ]
        return NewsService(
            finnhub_fetcher=mock_finnhub,
            google_fetcher=MagicMock(),
            name_service=MagicMock()
        )

    def test_returns_all_articles(self, service_with_articles):
        """should return all articles without pagination"""
        result = service_with_articles.get_news('AAPL')
        assert len(result['news']) == 25
        assert result['total'] == 25

    def test_response_format(self, service_with_articles):
        """should return correct response format"""
        result = service_with_articles.get_news('AAPL')

        assert 'symbol' in result
        assert 'news' in result
        assert 'total' in result
        assert 'cached_at' in result
        assert result['symbol'] == 'AAPL'
        assert 'has_more' not in result


class TestNewsServiceErrorHandling:
    """Tests for error handling"""

    def test_fetcher_exception_returns_empty(self):
        """should return empty news on fetcher exception"""
        mock_finnhub = MagicMock()
        mock_finnhub.fetch.side_effect = Exception("API error")

        service = NewsService(
            finnhub_fetcher=mock_finnhub,
            google_fetcher=MagicMock(),
            name_service=MagicMock()
        )

        result = service.get_news('AAPL')
        assert result['news'] == []
        assert result['total'] == 0

    def test_symbol_uppercase(self):
        """should uppercase the symbol in response"""
        mock_finnhub = MagicMock()
        mock_finnhub.fetch.return_value = []

        service = NewsService(
            finnhub_fetcher=mock_finnhub,
            google_fetcher=MagicMock(),
            name_service=MagicMock()
        )

        result = service.get_news('aapl')
        assert result['symbol'] == 'AAPL'


class TestNewsServiceIsUsStock:
    """Tests for is_us_stock static method"""

    def test_us_stock(self):
        assert NewsService.is_us_stock('AAPL') is True

    def test_tw_stock(self):
        assert NewsService.is_us_stock('2330.TW') is False

    def test_two_stock(self):
        assert NewsService.is_us_stock('6547.TWO') is False

    def test_hk_stock(self):
        assert NewsService.is_us_stock('0700.HK') is False

    def test_jp_stock(self):
        assert NewsService.is_us_stock('7203.T') is False

    def test_case_insensitive(self):
        assert NewsService.is_us_stock('2330.tw') is False
