"""
Price Calculator Service

Responsible for calculating price-related metrics (change, percentage).
Single responsibility: Price calculations and derived values.
"""

import logging
from typing import Dict, List, Optional, Tuple

from constants import PRICE_DECIMAL_PLACES, PERCENT_DECIMAL_PLACES

logger = logging.getLogger(__name__)


class PriceCalculator:
    """
    Service for calculating price-related metrics.

    This service calculates current price, price change,
    and percentage change from data points.

    Examples:
        >>> calculator = PriceCalculator()
        >>> price, change, percent = calculator.calculate_price_info(data_points)
    """

    def calculate_price_info(
        self,
        data_points: List[Dict]
    ) -> Tuple[Optional[float], Optional[float], Optional[float]]:
        """
        Calculate current price, change, and change percentage.

        Args:
            data_points: List of data point dictionaries with 'close' values

        Returns:
            Tuple of (current_price, change, change_percent)
            - current_price: Most recent closing price
            - change: Price difference from previous day
            - change_percent: Percentage change from previous day
            All values are None if insufficient data
        """
        if not data_points:
            logger.warning("No data points provided for price calculation")
            return None, None, None

        current_price = data_points[-1]['close']

        if len(data_points) < 2:
            logger.debug("Only one data point, cannot calculate change")
            return current_price, None, None

        previous_price = data_points[-2]['close']
        change, change_percent = self._calculate_change(
            current_price, previous_price
        )

        return current_price, change, change_percent

    def _calculate_change(
        self,
        current_price: float,
        previous_price: float
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Calculate price change and percentage change.

        Args:
            current_price: Current closing price
            previous_price: Previous closing price

        Returns:
            Tuple of (change, change_percent)
        """
        if current_price is None or previous_price is None:
            return None, None

        if previous_price == 0:
            logger.warning("Previous price is zero, cannot calculate percentage")
            return None, None

        change = round(
            current_price - previous_price,
            PRICE_DECIMAL_PLACES
        )
        change_percent = round(
            (change / previous_price) * 100,
            PERCENT_DECIMAL_PLACES
        )

        return change, change_percent

    def calculate_period_change(
        self,
        data_points: List[Dict],
        start_index: int = 0
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Calculate price change over a specific period.

        Args:
            data_points: List of data point dictionaries with 'close' values
            start_index: Index of the starting data point (default: first point)

        Returns:
            Tuple of (period_change, period_change_percent)
        """
        if not data_points or len(data_points) <= start_index:
            return None, None

        start_price = data_points[start_index]['close']
        end_price = data_points[-1]['close']

        return self._calculate_change(end_price, start_price)
