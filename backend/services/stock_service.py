"""
Stock Service - Coordinator

Main service that orchestrates stock data operations by coordinating
specialized services. Implements the Facade pattern for backward compatibility.

Single responsibility: Coordinate data flow between specialized services.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

from constants import DEFAULT_DATE_RANGE_DAYS

from .stock_data_fetcher import StockDataFetcher
from .stock_data_transformer import StockDataTransformer
from .price_calculator import PriceCalculator
from .company_name_service import CompanyNameService

logger = logging.getLogger(__name__)


class StockService:
    """
    Coordinator service for fetching and processing stock data.

    This service orchestrates the flow between specialized services:
    - StockDataFetcher: Retrieves raw data from yfinance
    - StockDataTransformer: Transforms DataFrame to dictionaries
    - PriceCalculator: Calculates price metrics
    - CompanyNameService: Resolves company names

    Supports dependency injection for testing and flexibility.

    Examples:
        >>> # Default usage
        >>> service = StockService()
        >>> data = service.get_stock_data('AAPL', '2024-01-01', '2024-12-31')

        >>> # With custom dependencies (for testing)
        >>> fetcher = MockStockDataFetcher()
        >>> service = StockService(fetcher=fetcher)
    """

    def __init__(
        self,
        fetcher: Optional[StockDataFetcher] = None,
        transformer: Optional[StockDataTransformer] = None,
        calculator: Optional[PriceCalculator] = None,
        name_service: Optional[CompanyNameService] = None
    ):
        """
        Initialize StockService with optional dependencies.

        Args:
            fetcher: Stock data fetcher service (default: new instance)
            transformer: Data transformer service (default: new instance)
            calculator: Price calculator service (default: new instance)
            name_service: Company name service (default: new instance)
        """
        self._fetcher = fetcher or StockDataFetcher()
        self._transformer = transformer or StockDataTransformer()
        self._calculator = calculator or PriceCalculator()
        self._name_service = name_service or CompanyNameService()

    def get_stock_data(self, symbol: str, start_date: str, end_date: str) -> Dict:
        """
        Fetch historical stock data for a given symbol.

        Orchestrates the data flow:
        1. Fetch raw data from yfinance
        2. Transform to data points
        3. Calculate price metrics
        4. Resolve company name

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
        """
        try:
            logger.info(f"Fetching stock data for {symbol} from {start_date} to {end_date}")

            # Step 1: Create ticker and fetch raw data
            ticker = self._fetcher.create_ticker(symbol)
            hist = self._fetcher.fetch_history(ticker, symbol, start_date, end_date)

            # Step 2: Get ticker info for company name lookup
            ticker_info = self._fetcher.fetch_ticker_info(ticker, symbol)

            # Step 3: Transform historical data to data points
            data_points = self._transformer.convert_to_data_points(hist, symbol)

            # Step 4: Calculate price information
            current_price, change, change_percent = self._calculator.calculate_price_info(
                data_points
            )

            # Step 5: Get company name
            company_name = self._name_service.get_company_name(
                symbol.upper(),
                ticker_info
            )

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

        except ValueError:
            # Re-raise ValueError as-is
            raise
        except Exception as e:
            logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
            raise ValueError(f"Failed to fetch stock data for {symbol}: {str(e)}")

    def get_batch_stocks(
        self,
        symbols: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict:
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
        """
        try:
            logger.info(f"Fetching batch data for {len(symbols)} stocks")

            # Use default date range if not provided
            if not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            if not start_date:
                start_date = (
                    datetime.now() - timedelta(days=DEFAULT_DATE_RANGE_DAYS)
                ).strftime('%Y-%m-%d')

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

            logger.info(
                f"Successfully fetched data for {len(stocks_data)}/{len(symbols)} stocks"
            )
            return result

        except Exception as e:
            logger.error(f"Error fetching batch stocks: {str(e)}")
            raise ValueError(f"Failed to fetch batch stocks: {str(e)}")

    def get_batch_stocks_parallel(
        self,
        symbols: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        max_workers: int = 5
    ) -> Dict:
        """
        Fetch data for multiple stocks in parallel using ThreadPoolExecutor.

        This method provides better performance for batch requests by fetching
        stock data concurrently instead of sequentially.

        Args:
            symbols: List of stock ticker symbols (max 18 per request)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format
            max_workers: Maximum number of parallel workers (default: 5)

        Returns:
            Dictionary containing:
                - stocks: List of stock data dictionaries
                - timestamp: ISO format timestamp of the request
                - errors: List of error dictionaries (null if no errors)
                - processing_time_ms: Total processing time in milliseconds

        Raises:
            ValueError: If batch data cannot be fetched

        Examples:
            >>> service = StockService()
            >>> batch = service.get_batch_stocks_parallel(
            ...     ['AAPL', 'GOOGL', 'MSFT'],
            ...     '2024-01-01',
            ...     '2024-01-31'
            ... )
            >>> print(len(batch['stocks']))
            3
        """
        try:
            start_time = datetime.now()
            logger.info(f"Fetching batch data for {len(symbols)} stocks (parallel mode)")

            # Use default date range if not provided
            if not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            if not start_date:
                start_date = (
                    datetime.now() - timedelta(days=DEFAULT_DATE_RANGE_DAYS)
                ).strftime('%Y-%m-%d')

            stocks_data = []
            errors = []

            # Use ThreadPoolExecutor for parallel fetching
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                # Submit all tasks
                future_to_symbol = {
                    executor.submit(
                        self.get_stock_data,
                        symbol,
                        start_date,
                        end_date
                    ): symbol
                    for symbol in symbols
                }

                # Collect results as they complete
                for future in as_completed(future_to_symbol):
                    symbol = future_to_symbol[future]
                    try:
                        stock_data = future.result()
                        stocks_data.append(stock_data)
                    except ValueError as e:
                        logger.warning(f"Failed to fetch data for {symbol}: {str(e)}")
                        errors.append({
                            'symbol': symbol.upper(),
                            'error': str(e)
                        })
                    except Exception as e:
                        logger.error(f"Unexpected error for {symbol}: {str(e)}")
                        errors.append({
                            'symbol': symbol.upper(),
                            'error': f"Unexpected error: {str(e)}"
                        })

            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            result = {
                'stocks': stocks_data,
                'timestamp': datetime.now().isoformat(),
                'errors': errors if errors else None,
                'processing_time_ms': round(processing_time, 2)
            }

            logger.info(
                f"Successfully fetched data for {len(stocks_data)}/{len(symbols)} stocks "
                f"in {processing_time:.2f}ms (parallel mode)"
            )
            return result

        except Exception as e:
            logger.error(f"Error fetching batch stocks (parallel): {str(e)}")
            raise ValueError(f"Failed to fetch batch stocks: {str(e)}")

    # Backward compatibility methods (deprecated but maintained)
    def get_company_name(self, symbol: str, ticker_info: Dict = None) -> Dict[str, str]:
        """
        Get company name in multiple languages.

        Deprecated: Use CompanyNameService directly for better separation.

        Args:
            symbol: Stock ticker symbol
            ticker_info: Optional yfinance ticker info dict

        Returns:
            Dictionary with 'zh-TW' and 'en-US' company names
        """
        return self._name_service.get_company_name(symbol, ticker_info)
