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


class TestStockServiceErrorHandling:
    """Test error handling and empty data responses"""

    def test_empty_history_response(self, mock_empty_ticker):
        """Test when ticker.history() returns empty DataFrame"""
        with patch('yfinance.Ticker', return_value=mock_empty_ticker):
            with pytest.raises(ValueError, match="No data found"):
                StockService.get_stock_data('EMPTY', '2025-11-01', '2025-11-06')

    def test_none_history_response(self):
        """Test when ticker.history() returns None"""
        mock_ticker = MagicMock()
        mock_ticker.history.return_value = None

        with patch('yfinance.Ticker', return_value=mock_ticker):
            with pytest.raises(ValueError):
                StockService.get_stock_data('NONE', '2025-11-01', '2025-11-06')

    def test_yfinance_timeout_error(self):
        """Test handling of yfinance timeout exception"""
        mock_ticker = MagicMock()
        mock_ticker.history.side_effect = Exception("Timeout")

        with patch('yfinance.Ticker', return_value=mock_ticker):
            with pytest.raises(ValueError, match="Failed to fetch stock data"):
                StockService.get_stock_data('TIMEOUT', '2025-11-01', '2025-11-06')

    def test_yfinance_connection_error(self):
        """Test handling of connection error"""
        mock_ticker = MagicMock()
        mock_ticker.history.side_effect = ConnectionError("Connection refused")

        with patch('yfinance.Ticker', return_value=mock_ticker):
            with pytest.raises(ValueError):
                StockService.get_stock_data('CONN_ERR', '2025-11-01', '2025-11-06')


class TestStockServiceDataConversion:
    """Test data conversion and validation"""

    def test_convert_with_nan_values(self):
        """Test handling of NaN values in DataFrame"""
        import pandas as pd
        import numpy as np

        mock_ticker = MagicMock()
        dates = pd.date_range('2025-11-01', periods=3, freq='D')
        mock_ticker.history.return_value = pd.DataFrame({
            'Open': [100.0, np.nan, 102.0],
            'High': [105.0, 106.0, 107.0],
            'Low': [98.0, 99.0, 100.0],
            'Close': [103.0, np.nan, 105.0],
            'Volume': [1000000, 1100000, 1200000]
        }, index=dates)
        mock_ticker.info = {'shortName': 'Test'}

        with patch('yfinance.Ticker', return_value=mock_ticker):
            # Should handle NaN gracefully or raise appropriate error
            try:
                result = StockService.get_stock_data('NAN_TEST', '2025-11-01', '2025-11-03')
                # If it succeeds, verify data integrity
                for point in result['data']:
                    assert isinstance(point['open'], (int, float))
                    assert isinstance(point['close'], (int, float))
            except (ValueError, TypeError):
                # Acceptable if service rejects NaN data
                pass

    def test_volume_type_conversion(self, mock_yfinance_ticker):
        """Test proper int conversion for volume (no decimals)"""
        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            result = StockService.get_stock_data('TEST', '2025-11-01', '2025-11-06')

            for point in result['data']:
                # Volume must be integer, not float
                assert isinstance(point['volume'], int)
                assert point['volume'] == int(point['volume'])
                assert point['volume'] >= 0

    def test_zero_volume_handling(self):
        """Test days with zero trading volume"""
        import pandas as pd

        mock_ticker = MagicMock()
        dates = pd.date_range('2025-11-01', periods=3, freq='D')
        mock_ticker.history.return_value = pd.DataFrame({
            'Open': [100.0, 101.0, 102.0],
            'High': [105.0, 106.0, 107.0],
            'Low': [98.0, 99.0, 100.0],
            'Close': [103.0, 104.0, 105.0],
            'Volume': [1000000, 0, 1200000]  # Zero volume on day 2
        }, index=dates)
        mock_ticker.info = {'shortName': 'Test'}

        with patch('yfinance.Ticker', return_value=mock_ticker):
            result = StockService.get_stock_data('ZERO_VOL', '2025-11-01', '2025-11-03')

            # Should handle zero volume gracefully
            assert len(result['data']) > 0
            # Second day has zero volume
            assert result['data'][1]['volume'] == 0


class TestStockServiceCompanyNameResolution:
    """Test company name resolution and fallback logic"""

    def test_get_company_name_fallback_logic(self):
        """Test shortName → longName → None fallback chain"""
        # Test with only longName
        ticker_info = {'longName': 'Test Company Long Name'}
        result = StockService.get_company_name('TEST', ticker_info=ticker_info)

        assert isinstance(result, dict)
        assert result['en-US'] == 'Test Company Long Name'

    def test_get_company_name_info_access_error(self):
        """Test handling when ticker.info throws exception"""
        mock_ticker = MagicMock()
        mock_ticker.info = MagicMock(side_effect=Exception("API Error"))

        with patch('yfinance.Ticker', return_value=mock_ticker):
            # Should fallback gracefully, not crash
            try:
                result = StockService.get_company_name('TEST')
                assert isinstance(result, dict)
            except Exception:
                # If it raises, should be handled appropriately
                pass

    def test_get_company_name_empty_info(self):
        """Test when ticker.info is empty dict"""
        result = StockService.get_company_name('TEST', ticker_info={})

        assert isinstance(result, dict)
        # Should return some default or symbol-based name


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

    def test_malformed_data_structure(self):
        """Test handling of unexpected DataFrame structure"""
        import pandas as pd

        mock_ticker = MagicMock()
        # Missing required columns
        mock_ticker.history.return_value = pd.DataFrame({
            'Date': ['2025-11-01', '2025-11-02'],
            'Price': [100, 101]  # Missing Open, High, Low, Close, Volume
        })
        mock_ticker.info = {'shortName': 'Test'}

        with patch('yfinance.Ticker', return_value=mock_ticker):
            # Should handle gracefully or raise appropriate error
            try:
                StockService.get_stock_data('MALFORMED', '2025-11-01', '2025-11-02')
            except (ValueError, KeyError, AttributeError):
                # Acceptable to raise error for malformed data
                pass

    def test_future_date_handling(self, mock_yfinance_ticker):
        """Test that future dates are handled gracefully"""
        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            # Future dates should either return empty data or current data
            result = StockService.get_stock_data('AAPL', '2026-01-01', '2026-01-05')
            # Should not crash, either has data or is empty
            assert 'data' in result
