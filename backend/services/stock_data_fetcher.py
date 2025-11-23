"""
Stock Data Fetcher Service

Responsible for fetching raw stock data from yfinance API.
Single responsibility: Data retrieval from external sources.
"""

import yfinance as yf
import logging
from typing import Optional, Dict, Any

from constants import FALLBACK_PERIOD

logger = logging.getLogger(__name__)


class StockDataFetcher:
    """
    Service for fetching raw stock data from yfinance.

    This service is responsible only for retrieving data from yfinance API.
    It does not transform or calculate any values.

    Examples:
        >>> fetcher = StockDataFetcher()
        >>> ticker = fetcher.create_ticker('AAPL')
        >>> hist = fetcher.fetch_history(ticker, 'AAPL', '2024-01-01', '2024-12-31')
    """

    def create_ticker(self, symbol: str) -> yf.Ticker:
        """
        Create a yfinance Ticker object.

        Args:
            symbol: Stock ticker symbol

        Returns:
            yfinance Ticker object
        """
        return yf.Ticker(symbol)

    def fetch_history(
        self,
        ticker: yf.Ticker,
        symbol: str,
        start_date: str,
        end_date: str
    ) -> Any:
        """
        Fetch historical data from yfinance.

        Args:
            ticker: yfinance Ticker object
            symbol: Stock ticker symbol (for logging)
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format

        Returns:
            pandas DataFrame with historical data

        Raises:
            ValueError: If no data found for symbol
        """
        logger.debug(f"Fetching history for {symbol} from {start_date} to {end_date}")

        hist = ticker.history(start=start_date, end=end_date)

        if hist.empty:
            logger.warning(f"No data returned for {symbol}, trying with period instead")
            hist = ticker.history(period=FALLBACK_PERIOD)

        if hist.empty:
            raise ValueError(
                f"No data found for symbol {symbol}. "
                "Please verify the symbol is correct."
            )

        logger.debug(f"Fetched {len(hist)} data points for {symbol}")
        return hist

    def fetch_ticker_info(
        self,
        ticker: yf.Ticker,
        symbol: str
    ) -> Optional[Dict]:
        """
        Safely retrieve ticker info from yfinance.

        Args:
            ticker: yfinance Ticker object
            symbol: Stock ticker symbol (for logging)

        Returns:
            Ticker info dict or None if error occurs
        """
        try:
            return ticker.info
        except Exception as e:
            logger.warning(f"Could not fetch ticker info for {symbol}: {str(e)}")
            return None
