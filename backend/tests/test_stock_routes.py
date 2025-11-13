"""
Tests for stock API routes (Flask endpoints)

Tests cover:
- Stock data endpoint success scenarios
- Batch stocks endpoint
- Error handling (404, 500)
- CORS headers
- Input validation
"""
import pytest
from unittest.mock import patch, MagicMock
import json


class TestStockDataEndpoint:
    """Tests for /api/stock-data endpoint"""

    def test_get_stock_endpoint_success(self, client, mock_yfinance_ticker):
        """Test stock data endpoint returns success with valid input"""
        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            response = client.post(
                '/api/stock-data',
                json={
                    'symbol': 'AAPL',
                    'start_date': '2025-11-05',
                    'end_date': '2025-11-09'
                },
                content_type='application/json'
            )

            assert response.status_code == 200
            data = response.get_json()
            # API returns StockService result directly
            assert data['symbol'] == 'AAPL'
            assert len(data['data']) == 5
            assert 'current_price' in data
            assert 'change' in data
            assert 'change_percent' in data

    def test_get_stock_endpoint_invalid_symbol(self, client):
        """Test stock data endpoint handles invalid symbol"""
        with patch('yfinance.Ticker') as mock_ticker:
            # Mock ticker that returns empty data
            mock_instance = MagicMock()
            mock_instance.history.return_value = MagicMock(empty=True)
            mock_ticker.return_value = mock_instance

            response = client.post(
                '/api/stock-data',
                json={
                    'symbol': 'INVALID',
                    'start_date': '2025-11-05',
                    'end_date': '2025-11-09'
                },
                content_type='application/json'
            )

            # Should return 404 for invalid symbol with no data
            assert response.status_code in [404, 500]

    def test_get_stock_endpoint_missing_params(self, client):
        """Test stock data endpoint validation for missing parameters"""
        response = client.post(
            '/api/stock-data',
            json={
                'symbol': 'AAPL'
                # Missing start_date and end_date
            },
            content_type='application/json'
        )

        # Should return validation error (400)
        assert response.status_code == 400

    def test_get_stock_endpoint_invalid_json(self, client):
        """Test stock data endpoint handles malformed JSON"""
        response = client.post(
            '/api/stock-data',
            data='not valid json',
            content_type='application/json'
        )

        # Flask returns 400 for bad JSON, or 500 if it reaches schema validation
        assert response.status_code in [400, 415, 500]


class TestBatchStocksEndpoint:
    """Tests for /api/batch-stocks endpoint"""

    def test_batch_stocks_endpoint_success(self, client, mock_yfinance_ticker):
        """Test batch stocks endpoint with multiple symbols"""
        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            response = client.post(
                '/api/batch-stocks',
                json={
                    'symbols': ['AAPL', 'GOOGL', 'MSFT'],
                    'start_date': '2025-11-05',
                    'end_date': '2025-11-09'
                },
                content_type='application/json'
            )

            assert response.status_code == 200
            data = response.get_json()
            # Batch endpoint returns 'stocks' and 'errors' keys
            assert 'stocks' in data
            # All 3 stocks should be processed
            assert len(data['stocks']) == 3

    def test_batch_stocks_partial_failure(self, client, mock_yfinance_ticker, mock_empty_ticker):
        """Test batch stocks endpoint with some symbols failing"""
        def ticker_side_effect(symbol):
            if symbol == 'INVALID':
                return mock_empty_ticker
            return mock_yfinance_ticker

        with patch('yfinance.Ticker', side_effect=ticker_side_effect):
            response = client.post(
                '/api/batch-stocks',
                json={
                    'symbols': ['AAPL', 'INVALID'],
                    'start_date': '2025-11-05',
                    'end_date': '2025-11-09'
                },
                content_type='application/json'
            )

            # Batch endpoint should still succeed but show failures
            assert response.status_code == 200
            data = response.get_json()
            assert 'stocks' in data
            assert 'errors' in data
            # Should have 1 successful stock and 1 error
            assert len(data['stocks']) == 1
            assert len(data['errors']) == 1

    def test_batch_stocks_empty_list(self, client):
        """Test batch stocks endpoint with empty symbols list"""
        response = client.post(
            '/api/batch-stocks',
            json={
                'symbols': [],
                'start_date': '2025-11-05',
                'end_date': '2025-11-09'
            },
            content_type='application/json'
        )

        # Should return validation error for empty list
        assert response.status_code == 400


class TestErrorHandling:
    """Tests for error handling in routes"""

    def test_error_handling_500(self, client):
        """Test 500 error handling for server errors"""
        with patch('yfinance.Ticker', side_effect=Exception("Network error")):
            response = client.post(
                '/api/stock-data',
                json={
                    'symbol': 'AAPL',
                    'start_date': '2025-11-05',
                    'end_date': '2025-11-09'
                },
                content_type='application/json'
            )

            # Should handle exception gracefully
            assert response.status_code >= 400

    def test_health_endpoint(self, client):
        """Test health check endpoint exists and responds"""
        response = client.get('/api/health')

        # Health endpoint should return 200
        assert response.status_code == 200
        data = response.get_json()
        assert 'status' in data


class TestCORSHeaders:
    """Tests for CORS headers"""

    def test_cors_headers_present(self, client, mock_yfinance_ticker):
        """Test that CORS headers are present in response"""
        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            response = client.post(
                '/api/stock-data',
                json={
                    'symbol': 'AAPL',
                    'start_date': '2025-11-05',
                    'end_date': '2025-11-09'
                },
                content_type='application/json',
                headers={'Origin': 'http://localhost:5173'}
            )

            # Check CORS headers are present
            assert 'Access-Control-Allow-Origin' in response.headers

    def test_cors_options_request(self, client):
        """Test CORS preflight OPTIONS request"""
        response = client.options(
            '/api/stock-data',
            headers={
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'POST'
            }
        )

        # OPTIONS request should succeed
        assert response.status_code in [200, 204]
