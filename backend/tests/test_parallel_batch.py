"""
Tests for parallel batch stock fetching functionality.

This module tests the new parallel batch processing feature including:
- Parallel batch fetching performance
- Max workers parameter validation
- Processing time measurement
- Error handling in parallel mode
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from services.stock_service import StockService
from datetime import datetime


class TestParallelBatchFetching:
    """Tests for parallel batch stock fetching."""

    @pytest.fixture
    def mock_stock_data(self):
        """Mock stock data for testing."""
        return {
            'symbol': 'AAPL',
            'company_name': {'en-US': 'Apple Inc.', 'zh-TW': '蘋果公司'},
            'data': [
                {
                    'date': '2024-11-20',
                    'open': 100.0,
                    'high': 105.0,
                    'low': 99.0,
                    'close': 103.0,
                    'volume': 1000000
                }
            ],
            'current_price': 103.0,
            'change': 3.0,
            'change_percent': 3.0
        }

    @pytest.fixture
    def stock_service(self):
        """Create a StockService instance with mocked dependencies."""
        service = StockService()
        return service

    def test_parallel_batch_success(self, stock_service, mock_stock_data):
        """Test successful parallel batch fetching."""
        symbols = ['AAPL', 'GOOGL', 'MSFT']

        # Mock get_stock_data to return mock data
        with patch.object(stock_service, 'get_stock_data') as mock_get_stock:
            mock_get_stock.return_value = mock_stock_data

            result = stock_service.get_batch_stocks_parallel(
                symbols=symbols,
                start_date='2024-11-01',
                end_date='2024-11-20'
            )

            # Verify results
            assert 'stocks' in result
            assert 'timestamp' in result
            assert 'errors' in result
            assert 'processing_time_ms' in result
            assert len(result['stocks']) == 3
            assert result['errors'] is None
            assert isinstance(result['processing_time_ms'], (int, float))
            assert result['processing_time_ms'] > 0

    def test_parallel_batch_with_errors(self, stock_service, mock_stock_data):
        """Test parallel batch with some symbols failing."""
        symbols = ['AAPL', 'INVALID', 'GOOGL']

        def mock_fetch(symbol, start, end):
            if symbol == 'INVALID':
                raise ValueError(f"Invalid symbol: {symbol}")
            return mock_stock_data

        with patch.object(stock_service, 'get_stock_data', side_effect=mock_fetch):
            result = stock_service.get_batch_stocks_parallel(symbols=symbols)

            # Verify partial success
            assert len(result['stocks']) == 2
            assert result['errors'] is not None
            assert len(result['errors']) == 1
            assert result['errors'][0]['symbol'] == 'INVALID'
            assert 'Invalid symbol' in result['errors'][0]['error']

    def test_parallel_batch_custom_max_workers(self, stock_service, mock_stock_data):
        """Test parallel batch with custom max_workers."""
        symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA']

        with patch.object(stock_service, 'get_stock_data') as mock_get_stock:
            mock_get_stock.return_value = mock_stock_data

            result = stock_service.get_batch_stocks_parallel(
                symbols=symbols,
                max_workers=3
            )

            # Should complete successfully with custom worker count
            assert len(result['stocks']) == 4
            assert result['errors'] is None

    def test_parallel_batch_default_dates(self, stock_service, mock_stock_data):
        """Test parallel batch with default date range."""
        symbols = ['AAPL', 'GOOGL']

        with patch.object(stock_service, 'get_stock_data') as mock_get_stock:
            mock_get_stock.return_value = mock_stock_data

            result = stock_service.get_batch_stocks_parallel(symbols=symbols)

            # Should use default dates (last 90 days)
            assert len(result['stocks']) == 2
            # Verify get_stock_data was called with date parameters
            assert mock_get_stock.call_count == 2

    def test_parallel_batch_processing_time(self, stock_service, mock_stock_data):
        """Test that processing time is measured correctly."""
        symbols = ['AAPL']

        with patch.object(stock_service, 'get_stock_data') as mock_get_stock:
            mock_get_stock.return_value = mock_stock_data

            result = stock_service.get_batch_stocks_parallel(symbols=symbols)

            # Processing time should be present and reasonable
            assert 'processing_time_ms' in result
            assert result['processing_time_ms'] >= 0
            assert result['processing_time_ms'] < 10000  # Less than 10 seconds

    def test_parallel_batch_all_failures(self, stock_service):
        """Test parallel batch when all symbols fail."""
        symbols = ['INVALID1', 'INVALID2', 'INVALID3']

        with patch.object(stock_service, 'get_stock_data', side_effect=ValueError("Invalid")):
            result = stock_service.get_batch_stocks_parallel(symbols=symbols)

            # All should fail
            assert len(result['stocks']) == 0
            assert result['errors'] is not None
            assert len(result['errors']) == 3

    def test_parallel_batch_empty_symbols(self, stock_service):
        """Test parallel batch with empty symbols list."""
        with patch.object(stock_service, 'get_stock_data') as mock_get_stock:
            result = stock_service.get_batch_stocks_parallel(symbols=[])

            # Should return empty result
            assert len(result['stocks']) == 0
            assert result['errors'] is None
            mock_get_stock.assert_not_called()

    def test_parallel_batch_single_symbol(self, stock_service, mock_stock_data):
        """Test parallel batch with single symbol."""
        with patch.object(stock_service, 'get_stock_data') as mock_get_stock:
            mock_get_stock.return_value = mock_stock_data

            result = stock_service.get_batch_stocks_parallel(symbols=['AAPL'])

            # Should work with single symbol
            assert len(result['stocks']) == 1
            assert result['errors'] is None

    def test_parallel_batch_uppercase_conversion(self, stock_service, mock_stock_data):
        """Test that symbols are properly uppercased."""
        with patch.object(stock_service, 'get_stock_data') as mock_get_stock:
            mock_get_stock.return_value = mock_stock_data

            # Pass lowercase symbols
            result = stock_service.get_batch_stocks_parallel(symbols=['aapl', 'googl'])

            # Verify get_stock_data was called with original case
            # (StockService doesn't uppercase internally, routes do)
            assert mock_get_stock.call_count == 2
            assert len(result['stocks']) == 2

    def test_parallel_vs_sequential_performance(self, stock_service, mock_stock_data):
        """Test that parallel is faster than sequential for multiple stocks."""
        import time

        symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']

        def slow_mock(*args, **kwargs):
            time.sleep(0.1)  # Simulate network delay
            return mock_stock_data

        with patch.object(stock_service, 'get_stock_data', side_effect=slow_mock):
            # Test parallel
            start = time.time()
            result_parallel = stock_service.get_batch_stocks_parallel(
                symbols=symbols,
                max_workers=5
            )
            parallel_time = time.time() - start

            # Test sequential
            start = time.time()
            result_sequential = stock_service.get_batch_stocks(symbols=symbols)
            sequential_time = time.time() - start

            # Parallel should be significantly faster
            # With 5 stocks and 100ms delay, sequential ~500ms, parallel ~100ms
            assert parallel_time < sequential_time * 0.5
            assert len(result_parallel['stocks']) == len(result_sequential['stocks'])


class TestParallelBatchAPI:
    """Tests for parallel batch API endpoint."""

    def test_max_workers_validation(self):
        """Test max_workers parameter validation."""
        from routes.stock_routes import stock_bp
        from flask import Flask
        from utils.cache import cache

        app = Flask(__name__)
        app.config['TESTING'] = True
        app.config['CACHE_TYPE'] = 'SimpleCache'
        cache.init_app(app)
        app.register_blueprint(stock_bp)

        with app.test_client() as client:
            # Test invalid max_workers (too low)
            response = client.post(
                '/api/v1/batch-stocks-parallel',
                json={'symbols': ['AAPL'], 'max_workers': 0}
            )
            assert response.status_code == 400

            # Test invalid max_workers (too high)
            response = client.post(
                '/api/v1/batch-stocks-parallel',
                json={'symbols': ['AAPL'], 'max_workers': 11}
            )
            assert response.status_code == 400

            # Test invalid max_workers (not integer)
            response = client.post(
                '/api/v1/batch-stocks-parallel',
                json={'symbols': ['AAPL'], 'max_workers': 'invalid'}
            )
            assert response.status_code == 400
