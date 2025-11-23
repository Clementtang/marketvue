"""
Stock Data Transformer Service

Responsible for transforming raw DataFrame data into structured dictionaries.
Single responsibility: Data format transformation.
"""

import logging
from typing import Dict, List, Any

from constants import PRICE_DECIMAL_PLACES

logger = logging.getLogger(__name__)


class StockDataTransformer:
    """
    Service for transforming raw stock data into structured format.

    This service converts pandas DataFrame data from yfinance
    into a list of standardized data point dictionaries.

    Examples:
        >>> transformer = StockDataTransformer()
        >>> data_points = transformer.convert_to_data_points(hist, 'AAPL')
    """

    def convert_to_data_points(
        self,
        hist: Any,
        symbol: str
    ) -> List[Dict]:
        """
        Convert DataFrame to list of data point dictionaries.

        Args:
            hist: pandas DataFrame with historical data (OHLCV)
            symbol: Stock ticker symbol (for logging)

        Returns:
            List of data point dictionaries with OHLCV data.
            Each dictionary contains:
                - date: Date string in YYYY-MM-DD format
                - open: Opening price (rounded)
                - high: Highest price (rounded)
                - low: Lowest price (rounded)
                - close: Closing price (rounded)
                - volume: Trading volume
        """
        data_points = []

        for index, row in hist.iterrows():
            try:
                data_point = self._extract_data_point(index, row)
                data_points.append(data_point)
            except (TypeError, ValueError) as e:
                logger.warning(
                    f"Skipping data point for {symbol} at {index}: {str(e)}"
                )
                continue

        logger.debug(f"Transformed {len(data_points)} data points for {symbol}")
        return data_points

    def _extract_data_point(self, index: Any, row: Any) -> Dict:
        """
        Extract a single data point from a DataFrame row.

        Handles both scalar and Series values from yfinance.

        Args:
            index: DataFrame index (timestamp)
            row: DataFrame row with OHLCV data

        Returns:
            Dictionary with date and OHLCV values
        """
        return {
            'date': index.strftime('%Y-%m-%d'),
            'open': round(self._safe_float(row['Open']), PRICE_DECIMAL_PLACES),
            'high': round(self._safe_float(row['High']), PRICE_DECIMAL_PLACES),
            'low': round(self._safe_float(row['Low']), PRICE_DECIMAL_PLACES),
            'close': round(self._safe_float(row['Close']), PRICE_DECIMAL_PLACES),
            'volume': self._safe_int(row['Volume'])
        }

    def _safe_float(self, value: Any) -> float:
        """
        Safely convert a value to float, handling Series objects.

        Args:
            value: Value to convert (scalar or Series)

        Returns:
            Float value
        """
        if hasattr(value, 'iloc'):
            return float(value.iloc[0])
        return float(value)

    def _safe_int(self, value: Any) -> int:
        """
        Safely convert a value to int, handling Series objects.

        Args:
            value: Value to convert (scalar or Series)

        Returns:
            Integer value
        """
        if hasattr(value, 'iloc'):
            return int(value.iloc[0])
        return int(value)
