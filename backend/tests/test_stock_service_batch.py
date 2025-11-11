"""
Tests for StockService batch operations

Tests the batch stock data fetching functionality.
"""
import pytest
from unittest.mock import patch, MagicMock
from services.stock_service import StockService


class TestBatchOperations:
    """Test cases for batch stock data retrieval"""

    def test_get_batch_stocks_success(self, mock_yfinance_ticker):
        """Test successful batch retrieval"""
        symbols = ['AAPL', 'GOOGL', 'MSFT']

        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            result = StockService.get_batch_stocks(symbols)

            # Verify result structure
            assert 'stocks' in result
            assert 'timestamp' in result
            assert 'errors' in result

            # Verify all stocks fetched successfully
            assert len(result['stocks']) == 3
            assert result['errors'] is None or len(result['errors']) == 0

            # Verify each stock has correct structure
            for stock in result['stocks']:
                assert 'symbol' in stock
                assert 'data' in stock
                assert 'company_name' in stock

    def test_get_batch_stocks_partial_failure(self, mock_yfinance_ticker, mock_empty_ticker):
        """Test batch with some failures"""
        symbols = ['AAPL', 'INVALID', 'MSFT']

        def ticker_side_effect(symbol):
            if symbol == 'INVALID':
                return mock_empty_ticker
            return mock_yfinance_ticker

        with patch('yfinance.Ticker', side_effect=ticker_side_effect):
            result = StockService.get_batch_stocks(symbols)

            # Should have some successes and some errors
            assert 'stocks' in result
            assert 'errors' in result
            assert len(result['stocks']) == 2  # AAPL and MSFT
            assert len(result['errors']) == 1  # INVALID
            assert result['errors'][0]['symbol'] == 'INVALID'

    def test_get_batch_stocks_empty_list(self):
        """Test with empty symbols list"""
        result = StockService.get_batch_stocks([])

        assert 'stocks' in result
        assert len(result['stocks']) == 0
        assert 'timestamp' in result

    def test_get_batch_stocks_duplicate_symbols(self, mock_yfinance_ticker):
        """Test handling of duplicate symbols"""
        symbols = ['AAPL', 'AAPL', 'MSFT']

        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            result = StockService.get_batch_stocks(symbols)

            # Should process all, including duplicates
            assert len(result['stocks']) == 3

    def test_get_batch_stocks_with_date_range(self, mock_yfinance_ticker):
        """Test batch with custom date range"""
        symbols = ['AAPL', 'GOOGL']

        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            result = StockService.get_batch_stocks(
                symbols,
                start_date='2025-11-01',
                end_date='2025-11-06'
            )

            assert len(result['stocks']) == 2
            assert 'timestamp' in result

    def test_get_batch_stocks_all_failures(self, mock_empty_ticker):
        """Test when all symbols fail"""
        symbols = ['INVALID1', 'INVALID2', 'INVALID3']

        with patch('yfinance.Ticker', return_value=mock_empty_ticker):
            result = StockService.get_batch_stocks(symbols)

            # All should fail
            assert len(result['stocks']) == 0
            assert len(result['errors']) == 3

    def test_get_batch_stocks_default_dates(self, mock_yfinance_ticker):
        """Test that default dates are applied when not provided"""
        symbols = ['AAPL']

        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            # Don't provide start_date or end_date
            result = StockService.get_batch_stocks(symbols)

            assert 'stocks' in result
            assert len(result['stocks']) == 1
            # Should use default 30-day range

    def test_get_batch_stocks_large_list(self, mock_yfinance_ticker):
        """Test with larger list of symbols (performance test)"""
        # Test with 10 symbols
        symbols = [f'STOCK{i}' for i in range(10)]

        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            result = StockService.get_batch_stocks(symbols)

            assert len(result['stocks']) == 10
            assert 'timestamp' in result

    def test_get_batch_stocks_mixed_case_symbols(self, mock_yfinance_ticker):
        """Test symbol case handling"""
        symbols = ['aapl', 'GOOGL', 'MsFt']  # Mixed case

        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            result = StockService.get_batch_stocks(symbols)

            # Should handle all cases
            assert len(result['stocks']) == 3

    def test_get_batch_stocks_error_structure(self, mock_empty_ticker):
        """Test error structure in response"""
        symbols = ['INVALID']

        with patch('yfinance.Ticker', return_value=mock_empty_ticker):
            result = StockService.get_batch_stocks(symbols)

            # Verify error structure
            assert result['errors'] is not None
            assert len(result['errors']) == 1
            error = result['errors'][0]
            assert 'symbol' in error
            assert 'error' in error
            assert error['symbol'] == 'INVALID'
