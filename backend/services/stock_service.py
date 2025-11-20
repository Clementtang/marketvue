import yfinance as yf
import logging
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from constants import (
    FALLBACK_PERIOD,
    PRICE_DECIMAL_PLACES,
    PERCENT_DECIMAL_PLACES,
    DEFAULT_DATE_RANGE_DAYS
)

logger = logging.getLogger(__name__)


class StockService:
    """
    Service for fetching stock data using yfinance.

    This service provides methods to fetch historical stock data for individual
    symbols or multiple symbols in batch. It uses yfinance as the data source
    and includes caching for company name mappings.

    Examples:
        >>> service = StockService()
        >>> data = service.get_stock_data('AAPL', '2024-01-01', '2024-12-31')
        >>> batch_data = service.get_batch_stocks(['AAPL', 'GOOGL'], '2024-01-01', '2024-12-31')
    """

    def __init__(self):
        """Initialize the StockService with empty company name cache."""
        self._company_names = None

    def _fetch_history(self, ticker: yf.Ticker, symbol: str, start_date: str, end_date: str):
        """
        Fetch historical data from yfinance.

        Args:
            ticker: yfinance Ticker object
            symbol: Stock ticker symbol
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format

        Returns:
            pandas DataFrame with historical data

        Raises:
            ValueError: If no data found for symbol
        """
        hist = ticker.history(start=start_date, end=end_date)

        if hist.empty:
            logger.warning(f"No data returned for {symbol}, trying with period instead")
            hist = ticker.history(period=FALLBACK_PERIOD)

        if hist.empty:
            raise ValueError(f"No data found for symbol {symbol}. Please verify the symbol is correct.")

        return hist

    def _convert_to_data_points(self, hist, symbol: str) -> List[Dict]:
        """
        Convert DataFrame to list of data point dictionaries.

        Args:
            hist: pandas DataFrame with historical data
            symbol: Stock ticker symbol (for logging)

        Returns:
            List of data point dictionaries with OHLCV data
        """
        data_points = []
        for index, row in hist.iterrows():
            try:
                # Handle both scalar and Series values from yfinance
                open_val = float(row['Open']) if not hasattr(row['Open'], 'iloc') else float(row['Open'].iloc[0])
                high_val = float(row['High']) if not hasattr(row['High'], 'iloc') else float(row['High'].iloc[0])
                low_val = float(row['Low']) if not hasattr(row['Low'], 'iloc') else float(row['Low'].iloc[0])
                close_val = float(row['Close']) if not hasattr(row['Close'], 'iloc') else float(row['Close'].iloc[0])
                volume_val = int(row['Volume']) if not hasattr(row['Volume'], 'iloc') else int(row['Volume'].iloc[0])

                data_points.append({
                    'date': index.strftime('%Y-%m-%d'),
                    'open': round(open_val, PRICE_DECIMAL_PLACES),
                    'high': round(high_val, PRICE_DECIMAL_PLACES),
                    'low': round(low_val, PRICE_DECIMAL_PLACES),
                    'close': round(close_val, PRICE_DECIMAL_PLACES),
                    'volume': volume_val
                })
            except (TypeError, ValueError) as e:
                logger.warning(f"Skipping data point for {symbol} at {index}: {str(e)}")
                continue

        return data_points

    def _calculate_price_info(self, data_points: List[Dict]) -> tuple:
        """
        Calculate current price, change, and change percentage.

        Args:
            data_points: List of data point dictionaries

        Returns:
            Tuple of (current_price, change, change_percent)
        """
        current_price = data_points[-1]['close'] if data_points else None
        previous_price = data_points[-2]['close'] if len(data_points) > 1 else None

        change = None
        change_percent = None
        if current_price and previous_price:
            change = round(current_price - previous_price, PRICE_DECIMAL_PLACES)
            change_percent = round((change / previous_price) * 100, PERCENT_DECIMAL_PLACES)

        return current_price, change, change_percent

    def _get_ticker_info_safe(self, ticker: yf.Ticker, symbol: str) -> Optional[Dict]:
        """
        Safely retrieve ticker info.

        Args:
            ticker: yfinance Ticker object
            symbol: Stock ticker symbol (for logging)

        Returns:
            Ticker info dict or None if error
        """
        try:
            return ticker.info
        except Exception as e:
            logger.warning(f"Could not fetch ticker info for {symbol}: {str(e)}")
            return None

    def _load_company_names(self) -> Dict:
        """
        Load company name mappings from JSON file.

        Returns:
            Dictionary mapping stock symbols to company names in multiple languages
        """
        if self._company_names is None:
            try:
                # Get the path to the JSON file
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                json_path = os.path.join(base_dir, 'data', 'company_names.json')

                with open(json_path, 'r', encoding='utf-8') as f:
                    self._company_names = json.load(f)
                logger.info(f"Loaded {len(self._company_names)} company name mappings")
            except Exception as e:
                logger.warning(f"Failed to load company names: {str(e)}")
                self._company_names = {}

        return self._company_names

    def get_company_name(self, symbol: str, ticker_info: Dict = None) -> Dict[str, str]:
        """
        Get company name in multiple languages.

        Args:
            symbol: Stock ticker symbol
            ticker_info: Optional yfinance ticker info dict

        Returns:
            Dictionary with 'zh-TW' and 'en-US' company names

        Examples:
            >>> service = StockService()
            >>> name = service.get_company_name('AAPL')
            >>> print(name['en-US'])
            'Apple Inc.'
        """
        # Load mappings
        mappings = self._load_company_names()

        # Check if we have a mapping for this symbol
        if symbol in mappings:
            return mappings[symbol]

        # Fallback to yfinance data
        result = {
            'zh-TW': None,
            'en-US': None
        }

        if ticker_info:
            # Try different name fields from yfinance
            result['en-US'] = (
                ticker_info.get('shortName') or
                ticker_info.get('longName') or
                ticker_info.get('displayName')
            )

        return result

    def get_stock_data(self, symbol: str, start_date: str, end_date: str) -> Dict:
        """
        Fetch historical stock data for a given symbol.

        Args:
            symbol: Stock ticker symbol (e.g., 'AAPL', 'GOOGL')
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format

        Returns:
            Dictionary containing:
                - symbol: Uppercased ticker symbol
                - company_name: Dict with 'zh-TW' and 'en-US' names
                - data: List of OHLCV data points
                - current_price: Most recent closing price
                - change: Price change from previous day
                - change_percent: Percentage change from previous day

        Raises:
            ValueError: If stock data cannot be fetched or symbol is invalid

        Examples:
            >>> service = StockService()
            >>> data = service.get_stock_data('AAPL', '2024-01-01', '2024-01-31')
            >>> print(data['symbol'])
            'AAPL'
            >>> print(len(data['data']))
            21
        """
        try:
            logger.info(f"Fetching stock data for {symbol} from {start_date} to {end_date}")

            # Initialize ticker and fetch historical data
            ticker = yf.Ticker(symbol)
            hist = self._fetch_history(ticker, symbol, start_date, end_date)

            # Get ticker info for company name lookup
            ticker_info = self._get_ticker_info_safe(ticker, symbol)

            # Convert historical data to data points
            data_points = self._convert_to_data_points(hist, symbol)

            # Calculate price information
            current_price, change, change_percent = self._calculate_price_info(data_points)

            # Get company name
            company_name = self.get_company_name(symbol.upper(), ticker_info)

            # Build response
            result = {
                'symbol': symbol.upper(),
                'company_name': company_name,
                'data': data_points,
                'current_price': current_price,
                'change': change,
                'change_percent': change_percent
            }

            logger.info(f"Successfully fetched {len(data_points)} data points for {symbol}")
            return result

        except Exception as e:
            logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
            raise ValueError(f"Failed to fetch stock data for {symbol}: {str(e)}")

    def get_batch_stocks(self, symbols: List[str], start_date: Optional[str] = None,
                        end_date: Optional[str] = None) -> Dict:
        """
        Fetch data for multiple stocks.

        Args:
            symbols: List of stock ticker symbols (max 18 per request)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format

        Returns:
            Dictionary containing:
                - stocks: List of stock data dictionaries
                - timestamp: ISO format timestamp of the request
                - errors: List of error dictionaries (null if no errors)

        Raises:
            ValueError: If batch data cannot be fetched

        Examples:
            >>> service = StockService()
            >>> batch = service.get_batch_stocks(['AAPL', 'GOOGL'], '2024-01-01', '2024-01-31')
            >>> print(len(batch['stocks']))
            2
            >>> print(batch['errors'])
            None
        """
        try:
            logger.info(f"Fetching batch data for {len(symbols)} stocks")

            # Use default date range if not provided
            if not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            if not start_date:
                start_date = (datetime.now() - timedelta(days=DEFAULT_DATE_RANGE_DAYS)).strftime('%Y-%m-%d')

            stocks_data = []
            errors = []

            for symbol in symbols:
                try:
                    stock_data = self.get_stock_data(symbol, start_date, end_date)
                    stocks_data.append(stock_data)
                except ValueError as e:
                    logger.warning(f"Failed to fetch data for {symbol}: {str(e)}")
                    errors.append({
                        'symbol': symbol.upper(),
                        'error': str(e)
                    })

            result = {
                'stocks': stocks_data,
                'timestamp': datetime.now().isoformat(),
                'errors': errors if errors else None
            }

            logger.info(f"Successfully fetched data for {len(stocks_data)}/{len(symbols)} stocks")
            return result

        except Exception as e:
            logger.error(f"Error fetching batch stocks: {str(e)}")
            raise ValueError(f"Failed to fetch batch stocks: {str(e)}")
