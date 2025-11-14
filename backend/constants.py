"""
Backend application constants
Centralizes magic numbers and configuration values
"""

# Cache configuration
CACHE_TIMEOUT_SECONDS = 300  # 5 minutes
CACHE_DEFAULT_TIMEOUT = 300

# yfinance fallback configuration
FALLBACK_PERIOD = '3mo'  # Fallback period when date range returns no data

# Data rounding precision
PRICE_DECIMAL_PLACES = 2
PERCENT_DECIMAL_PLACES = 2

# Batch request limits
MAX_BATCH_SYMBOLS = 18  # Maximum number of symbols in batch request

# Default date range
DEFAULT_DATE_RANGE_DAYS = 30  # Default to 30 days if not specified

# HTTP status codes (for clarity)
HTTP_OK = 200
HTTP_BAD_REQUEST = 400
HTTP_NOT_FOUND = 404
HTTP_INTERNAL_ERROR = 500

# Logging configuration
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
