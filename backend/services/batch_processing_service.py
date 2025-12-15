"""
Batch Processing Service

Handles batch processing of stock data with both sequential and parallel strategies.
Extracted from StockService to follow Single Responsibility Principle.

Single responsibility: Coordinate batch processing of multiple stock data requests.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

from constants import DEFAULT_DATE_RANGE_DAYS

logger = logging.getLogger(__name__)


class BatchProcessingService:
    """
    Service responsible for batch processing of stock data.

    Handles both sequential and parallel processing strategies for fetching
    multiple stocks at once. Depends on StockService for individual stock fetches.

    Attributes:
        _stock_service: StockService instance for fetching individual stocks
        _default_max_workers: Default number of parallel workers

    Examples:
        >>> from services.stock_service import StockService
        >>> stock_service = StockService()
        >>> batch_service = BatchProcessingService(stock_service)
        >>> result = batch_service.process_batch_sequential(
        ...     ['AAPL', 'GOOGL'], '2024-01-01', '2024-12-31'
        ... )
    """

    def __init__(self, stock_service, default_max_workers: int = 5):
        """
        Initialize BatchProcessingService with dependencies.

        Args:
            stock_service: StockService instance for fetching individual stocks
            default_max_workers: Default max workers for parallel processing
        """
        self._stock_service = stock_service
        self._default_max_workers = default_max_workers

    def process_batch_sequential(
        self,
        symbols: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict:
        """
        Process multiple stocks sequentially.

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
            >>> batch_service = BatchProcessingService(stock_service)
            >>> result = batch_service.process_batch_sequential(
            ...     ['AAPL', 'GOOGL'], '2024-01-01', '2024-01-31'
            ... )
            >>> print(len(result['stocks']))
            2
        """
        try:
            logger.info(f"Processing batch data for {len(symbols)} stocks (sequential mode)")

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
                    stock_data = self._stock_service.get_stock_data(
                        symbol, start_date, end_date
                    )
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
                f"Successfully processed {len(stocks_data)}/{len(symbols)} stocks "
                "(sequential mode)"
            )
            return result

        except Exception as e:
            logger.error(f"Error processing batch stocks (sequential): {str(e)}")
            raise ValueError(f"Failed to process batch stocks: {str(e)}")

    def process_batch_parallel(
        self,
        symbols: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        max_workers: Optional[int] = None
    ) -> Dict:
        """
        Process multiple stocks in parallel using ThreadPoolExecutor.

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
            >>> batch_service = BatchProcessingService(stock_service)
            >>> result = batch_service.process_batch_parallel(
            ...     ['AAPL', 'GOOGL', 'MSFT'],
            ...     '2024-01-01',
            ...     '2024-01-31',
            ...     max_workers=3
            ... )
            >>> print(result['processing_time_ms'])
            1523.45
        """
        try:
            start_time = datetime.now()
            workers = max_workers or self._default_max_workers
            logger.info(
                f"Processing batch data for {len(symbols)} stocks "
                f"(parallel mode, {workers} workers)"
            )

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
            with ThreadPoolExecutor(max_workers=workers) as executor:
                # Submit all tasks
                future_to_symbol = {
                    executor.submit(
                        self._stock_service.get_stock_data,
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
                f"Successfully processed {len(stocks_data)}/{len(symbols)} stocks "
                f"in {processing_time:.2f}ms (parallel mode)"
            )
            return result

        except Exception as e:
            logger.error(f"Error processing batch stocks (parallel): {str(e)}")
            raise ValueError(f"Failed to process batch stocks: {str(e)}")
