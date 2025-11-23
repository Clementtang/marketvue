"""
Tests for PriceCalculator service.
"""

import pytest
from services.price_calculator import PriceCalculator


class TestPriceCalculator:
    """Tests for price calculation functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.calculator = PriceCalculator()

    def test_calculate_price_info_with_valid_data(self):
        """Test price calculation with valid data points."""
        data_points = [
            {'close': 100.00},
            {'close': 105.00},
            {'close': 110.00},
        ]
        current_price, change, change_percent = self.calculator.calculate_price_info(
            data_points
        )

        assert current_price == 110.00
        assert change == 5.00
        assert change_percent == pytest.approx(4.76, rel=0.01)

    def test_calculate_price_info_with_empty_list(self):
        """Test price calculation with empty data."""
        current_price, change, change_percent = self.calculator.calculate_price_info([])

        assert current_price is None
        assert change is None
        assert change_percent is None

    def test_calculate_price_info_with_single_point(self):
        """Test price calculation with single data point."""
        data_points = [{'close': 100.00}]
        current_price, change, change_percent = self.calculator.calculate_price_info(
            data_points
        )

        assert current_price == 100.00
        assert change is None
        assert change_percent is None

    def test_calculate_price_info_negative_change(self):
        """Test price calculation with negative change."""
        data_points = [
            {'close': 100.00},
            {'close': 95.00},
        ]
        current_price, change, change_percent = self.calculator.calculate_price_info(
            data_points
        )

        assert current_price == 95.00
        assert change == -5.00
        assert change_percent == -5.00

    def test_calculate_period_change(self):
        """Test period change calculation."""
        data_points = [
            {'close': 100.00},
            {'close': 105.00},
            {'close': 110.00},
            {'close': 120.00},
        ]
        change, change_percent = self.calculator.calculate_period_change(data_points)

        assert change == 20.00
        assert change_percent == 20.00

    def test_calculate_period_change_with_start_index(self):
        """Test period change with custom start index."""
        data_points = [
            {'close': 100.00},
            {'close': 105.00},
            {'close': 110.00},
            {'close': 120.00},
        ]
        change, change_percent = self.calculator.calculate_period_change(
            data_points, start_index=1
        )

        assert change == 15.00
        assert change_percent == pytest.approx(14.29, rel=0.01)

    def test_calculate_period_change_empty_list(self):
        """Test period change with empty list."""
        change, change_percent = self.calculator.calculate_period_change([])

        assert change is None
        assert change_percent is None

    def test_calculate_period_change_invalid_start_index(self):
        """Test period change with invalid start index."""
        data_points = [{'close': 100.00}]
        change, change_percent = self.calculator.calculate_period_change(
            data_points, start_index=5
        )

        assert change is None
        assert change_percent is None

    def test_rounding_precision(self):
        """Test that values are rounded correctly."""
        data_points = [
            {'close': 100.00},
            {'close': 103.33333},
        ]
        current_price, change, change_percent = self.calculator.calculate_price_info(
            data_points
        )

        # Should be rounded to 2 decimal places
        assert current_price == 103.33333
        assert change == 3.33  # rounded
        assert change_percent == 3.33  # rounded
