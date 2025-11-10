"""
Tests for StockService

Tests the core stock data fetching and processing functionality.
"""
import pytest
from unittest.mock import patch, MagicMock
from services.stock_service import StockService


class TestStockService:
    """Test cases for StockService"""

    def test_get_stock_data_success(self, mock_yfinance_ticker):
        """Test successful stock data retrieval"""
        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            result = StockService.get_stock_data('AAPL', '2025-11-01', '2025-11-06')

            # Check result structure (no 'success' key, returns data directly)
            assert 'data' in result
            assert 'symbol' in result
            assert len(result['data']) == 5  # 5 days of data
            assert result['symbol'] == 'AAPL'

            # Check data structure
            first_point = result['data'][0]
            assert 'date' in first_point
            assert 'open' in first_point
            assert 'high' in first_point
            assert 'low' in first_point
            assert 'close' in first_point
            assert 'volume' in first_point

    def test_get_stock_data_invalid_symbol(self, mock_empty_ticker):
        """Test handling of invalid stock symbol (should raise ValueError)"""
        with patch('yfinance.Ticker', return_value=mock_empty_ticker):
            with pytest.raises(ValueError, match="No data found"):
                StockService.get_stock_data('INVALID', '2025-11-01', '2025-11-06')

    def test_get_stock_data_network_error(self):
        """Test handling of network errors (should raise ValueError)"""
        with patch('yfinance.Ticker') as mock_ticker:
            mock_ticker.side_effect = Exception("Network error")

            with pytest.raises(ValueError, match="Failed to fetch stock data"):
                StockService.get_stock_data('AAPL', '2025-11-01', '2025-11-06')

    def test_get_company_name_with_mapping(self):
        """Test company name retrieval with pre-defined mapping"""
        result = StockService.get_company_name('AAPL')

        assert isinstance(result, dict)
        assert 'zh-TW' in result
        assert 'en-US' in result

    def test_get_company_name_from_ticker_info(self, mock_yfinance_ticker):
        """Test company name extraction from ticker info"""
        result = StockService.get_company_name(
            'TEST',
            ticker_info=mock_yfinance_ticker.info
        )

        assert isinstance(result, dict)
        assert result['en-US'] == 'Test Stock'

    def test_data_point_conversion(self, mock_yfinance_ticker):
        """Test conversion of DataFrame to data points"""
        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            result = StockService.get_stock_data('TEST', '2025-11-01', '2025-11-06')

            data = result['data']

            # Verify all required fields
            for point in data:
                assert isinstance(point['open'], float)
                assert isinstance(point['high'], float)
                assert isinstance(point['low'], float)
                assert isinstance(point['close'], float)
                assert isinstance(point['volume'], int)
                assert isinstance(point['date'], str)

            # Verify data values are reasonable
            for point in data:
                assert point['high'] >= point['low']
                assert point['high'] >= point['open']
                assert point['high'] >= point['close']
                assert point['low'] <= point['open']
                assert point['low'] <= point['close']
                assert point['volume'] > 0

    def test_result_includes_price_info(self, mock_yfinance_ticker):
        """Test that result includes current price and change info"""
        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            result = StockService.get_stock_data('TEST', '2025-11-01', '2025-11-06')

            assert 'current_price' in result
            assert 'change' in result
            assert 'change_percent' in result
            assert 'company_name' in result


class TestStockServiceEdgeCases:
    """Test edge cases and error handling"""

    def test_special_characters_in_symbol(self):
        """Test handling of special characters in symbol (should raise ValueError)"""
        with patch('yfinance.Ticker') as mock_ticker:
            mock_ticker.side_effect = Exception("Invalid symbol")

            with pytest.raises(ValueError):
                StockService.get_stock_data('INVALID@#$', '2025-11-01', '2025-11-06')

    def test_very_large_volume(self, mock_yfinance_ticker):
        """Test handling of very large volume numbers"""
        # Modify mock to have large volumes
        mock_yfinance_ticker.history.return_value['Volume'] = [
            1000000000, 2000000000, 3000000000, 4000000000, 5000000000
        ]

        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            result = StockService.get_stock_data('TEST', '2025-11-01', '2025-11-06')

            for point in result['data']:
                assert point['volume'] > 0
                assert isinstance(point['volume'], int)

    def test_date_range_validation(self, mock_yfinance_ticker):
        """Test different date ranges"""
        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            # Test normal range
            result = StockService.get_stock_data('AAPL', '2025-11-01', '2025-11-06')
            assert 'data' in result
            assert len(result['data']) > 0

            # Test single day (start == end)
            result2 = StockService.get_stock_data('AAPL', '2025-11-05', '2025-11-05')
            assert 'data' in result2
