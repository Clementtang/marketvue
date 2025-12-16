"""
Cache Key Builder

Centralized cache key generation for consistent caching strategy across all routes.
Ensures cache key format consistency and makes it easier to update cache key patterns.

Single responsibility: Generate standardized cache keys for various stock data requests.
"""

from typing import List


class CacheKeyBuilder:
    """
    Centralized cache key generation for consistent caching strategy.

    All cache keys follow the pattern: "{resource_type}:{identifiers}:{date_range}"
    This ensures:
    - Consistent format across all endpoints
    - Easy debugging (keys are human-readable)
    - Predictable cache invalidation patterns

    Examples:
        >>> # Single stock
        >>> CacheKeyBuilder.build_stock_key('AAPL', '2024-01-01', '2024-01-31')
        'stock_data:AAPL:2024-01-01:2024-01-31'

        >>> # Batch stocks (symbols are sorted for consistency)
        >>> CacheKeyBuilder.build_batch_key(['GOOGL', 'AAPL'], '2024-01-01', '2024-01-31')
        'batch_stocks:AAPL,GOOGL:2024-01-01:2024-01-31'
    """

    @staticmethod
    def build_stock_key(symbol: str, start_date: str, end_date: str) -> str:
        """
        Generate cache key for single stock data.

        Args:
            symbol: Stock ticker symbol (will be uppercased)
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format

        Returns:
            Cache key string in format "stock_data:{SYMBOL}:{start_date}:{end_date}"

        Examples:
            >>> CacheKeyBuilder.build_stock_key('aapl', '2024-01-01', '2024-01-31')
            'stock_data:AAPL:2024-01-01:2024-01-31'
        """
        return f"stock_data:{symbol.upper()}:{start_date}:{end_date}"

    @staticmethod
    def build_batch_key(
        symbols: List[str],
        start_date: str,
        end_date: str
    ) -> str:
        """
        Generate cache key for batch stock data.

        Symbols are sorted alphabetically to ensure consistent cache keys
        regardless of the order they appear in the request. This prevents
        cache misses due to different symbol orderings.

        Args:
            symbols: List of stock ticker symbols (will be uppercased and sorted)
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format

        Returns:
            Cache key string in format "batch_stocks:{SYMBOL1,SYMBOL2}:{start_date}:{end_date}"

        Examples:
            >>> CacheKeyBuilder.build_batch_key(['GOOGL', 'AAPL'], '2024-01-01', '2024-01-31')
            'batch_stocks:AAPL,GOOGL:2024-01-01:2024-01-31'

            >>> # Order doesn't matter - cache keys are identical
            >>> key1 = CacheKeyBuilder.build_batch_key(['AAPL', 'GOOGL'], '2024-01-01', '2024-01-31')
            >>> key2 = CacheKeyBuilder.build_batch_key(['GOOGL', 'AAPL'], '2024-01-01', '2024-01-31')
            >>> assert key1 == key2
        """
        # Sort symbols for consistent cache keys
        symbols_str = ','.join(sorted([s.upper() for s in symbols]))
        return f"batch_stocks:{symbols_str}:{start_date}:{end_date}"

    @staticmethod
    def build_batch_parallel_key(
        symbols: List[str],
        start_date: str,
        end_date: str,
        max_workers: int = None
    ) -> str:
        """
        Generate cache key for parallel batch stock data.

        Note: max_workers affects processing time but not the actual data returned,
        so we don't include it in the cache key. This allows cache hits across
        different worker configurations.

        Args:
            symbols: List of stock ticker symbols
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            max_workers: Maximum number of parallel workers (not used in cache key)

        Returns:
            Cache key string (same as build_batch_key)

        Examples:
            >>> # max_workers doesn't affect cache key
            >>> key1 = CacheKeyBuilder.build_batch_parallel_key(['AAPL'], '2024-01-01', '2024-01-31', 5)
            >>> key2 = CacheKeyBuilder.build_batch_parallel_key(['AAPL'], '2024-01-01', '2024-01-31', 10)
            >>> assert key1 == key2
        """
        # max_workers affects performance but not data, so we use the same cache key as batch
        return CacheKeyBuilder.build_batch_key(symbols, start_date, end_date)
