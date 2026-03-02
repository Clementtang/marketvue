"""
Backend application constants.

Centralizes all magic numbers and configuration values to provide a single
source of truth. This makes the codebase more maintainable and easier to
configure globally.
"""

# Cache configuration
CACHE_TIMEOUT_SECONDS = 300  # 5 minutes - How long to cache stock data responses
CACHE_DEFAULT_TIMEOUT = 300  # Default timeout for all cached endpoints

# yfinance fallback configuration
FALLBACK_PERIOD = '3mo'  # Fallback period when date range returns no data

# Data rounding precision
PRICE_DECIMAL_PLACES = 2  # Number of decimal places for stock prices
PERCENT_DECIMAL_PLACES = 2  # Number of decimal places for percentage changes

# Batch request limits
MAX_BATCH_SYMBOLS = 18  # Maximum number of symbols allowed in single batch request

# Default date range
DEFAULT_DATE_RANGE_DAYS = 30  # Default date range when not specified in request

# HTTP status codes (for code clarity and consistency)
HTTP_OK = 200  # Successful request
HTTP_BAD_REQUEST = 400  # Client error - invalid input
HTTP_NOT_FOUND = 404  # Resource not found
HTTP_INTERNAL_ERROR = 500  # Server error

# News feature configuration
NEWS_CACHE_TIMEOUT = 900  # 15 minutes - How long to cache news responses
NEWS_TIME_WINDOW_HOURS = 72  # Only show news from the past 72 hours
NEWS_REQUEST_TIMEOUT = 10  # Seconds - timeout for external news API requests
NEWS_DATE_FORMAT = '%Y-%m-%dT%H:%M:%SZ'  # ISO 8601 UTC format for news timestamps

# Logging configuration
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'  # Standard log format
LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'  # Date format for logs
