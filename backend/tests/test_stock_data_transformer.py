"""
Tests for StockDataTransformer service.
"""

import pytest
import pandas as pd
from datetime import datetime
from services.stock_data_transformer import StockDataTransformer


class TestStockDataTransformer:
    """Tests for data transformation functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.transformer = StockDataTransformer()

    def test_convert_to_data_points_basic(self):
        """Test basic DataFrame to data points conversion."""
        # Create sample DataFrame
        data = {
            'Open': [100.0, 101.0],
            'High': [105.0, 106.0],
            'Low': [99.0, 100.0],
            'Close': [104.0, 105.0],
            'Volume': [1000000, 1100000]
        }
        index = pd.to_datetime(['2024-01-01', '2024-01-02'])
        df = pd.DataFrame(data, index=index)

        result = self.transformer.convert_to_data_points(df, 'TEST')

        assert len(result) == 2
        assert result[0]['date'] == '2024-01-01'
        assert result[0]['open'] == 100.0
        assert result[0]['high'] == 105.0
        assert result[0]['low'] == 99.0
        assert result[0]['close'] == 104.0
        assert result[0]['volume'] == 1000000

    def test_convert_to_data_points_empty_dataframe(self):
        """Test conversion with empty DataFrame."""
        df = pd.DataFrame()

        result = self.transformer.convert_to_data_points(df, 'TEST')

        assert result == []

    def test_convert_to_data_points_with_rounding(self):
        """Test that prices are rounded correctly."""
        data = {
            'Open': [100.12345],
            'High': [105.98765],
            'Low': [99.11111],
            'Close': [104.55555],
            'Volume': [1000000]
        }
        index = pd.to_datetime(['2024-01-01'])
        df = pd.DataFrame(data, index=index)

        result = self.transformer.convert_to_data_points(df, 'TEST')

        assert result[0]['open'] == 100.12
        assert result[0]['high'] == 105.99
        assert result[0]['low'] == 99.11
        assert result[0]['close'] == 104.56

    def test_convert_to_data_points_handles_series_values(self):
        """Test handling of Series values (yfinance quirk)."""
        # Simulate yfinance behavior where values might be Series
        data = {
            'Open': [pd.Series([100.0])],
            'High': [pd.Series([105.0])],
            'Low': [pd.Series([99.0])],
            'Close': [pd.Series([104.0])],
            'Volume': [pd.Series([1000000])]
        }
        index = pd.to_datetime(['2024-01-01'])
        df = pd.DataFrame(data, index=index)

        result = self.transformer.convert_to_data_points(df, 'TEST')

        # Should extract values from Series
        assert len(result) == 1
        assert result[0]['close'] == 104.0

    def test_convert_to_data_points_skips_invalid_rows(self):
        """Test that invalid rows are skipped with warning."""
        data = {
            'Open': [100.0, 'invalid', 102.0],
            'High': [105.0, 106.0, 107.0],
            'Low': [99.0, 100.0, 101.0],
            'Close': [104.0, 105.0, 106.0],
            'Volume': [1000000, 1100000, 1200000]
        }
        index = pd.to_datetime(['2024-01-01', '2024-01-02', '2024-01-03'])
        df = pd.DataFrame(data, index=index)

        result = self.transformer.convert_to_data_points(df, 'TEST')

        # Should skip the invalid row
        assert len(result) == 2
        assert result[0]['date'] == '2024-01-01'
        assert result[1]['date'] == '2024-01-03'

    def test_convert_to_data_points_with_zero_volume(self):
        """Test handling of zero volume."""
        data = {
            'Open': [100.0],
            'High': [105.0],
            'Low': [99.0],
            'Close': [104.0],
            'Volume': [0]
        }
        index = pd.to_datetime(['2024-01-01'])
        df = pd.DataFrame(data, index=index)

        result = self.transformer.convert_to_data_points(df, 'TEST')

        assert result[0]['volume'] == 0

    def test_convert_to_data_points_large_volume(self):
        """Test handling of very large volume numbers."""
        data = {
            'Open': [100.0],
            'High': [105.0],
            'Low': [99.0],
            'Close': [104.0],
            'Volume': [10_000_000_000]  # 10 billion
        }
        index = pd.to_datetime(['2024-01-01'])
        df = pd.DataFrame(data, index=index)

        result = self.transformer.convert_to_data_points(df, 'TEST')

        assert result[0]['volume'] == 10_000_000_000

    def test_safe_float_with_scalar(self):
        """Test _safe_float with scalar value."""
        result = self.transformer._safe_float(100.5)
        assert result == 100.5

    def test_safe_float_with_series(self):
        """Test _safe_float with Series value."""
        series = pd.Series([100.5])
        result = self.transformer._safe_float(series)
        assert result == 100.5

    def test_safe_int_with_scalar(self):
        """Test _safe_int with scalar value."""
        result = self.transformer._safe_int(1000)
        assert result == 1000

    def test_safe_int_with_series(self):
        """Test _safe_int with Series value."""
        series = pd.Series([1000])
        result = self.transformer._safe_int(series)
        assert result == 1000
