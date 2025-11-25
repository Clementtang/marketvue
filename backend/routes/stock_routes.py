from flask import Blueprint, request, jsonify, current_app
from marshmallow import ValidationError
from services.stock_service import StockService
from schemas.stock_schemas import (
    StockDataRequestSchema,
    BatchStocksRequestSchema,
    StockDataResponseSchema,
    BatchStocksResponseSchema
)
from utils.cache import cache
from utils.decorators import handle_errors, log_request
from constants import CACHE_TIMEOUT_SECONDS, HTTP_OK
import logging

logger = logging.getLogger(__name__)

# Create blueprint with versioned API prefix
stock_bp = Blueprint('stock', __name__, url_prefix='/api/v1')

# Stock service instance (injected via create_stock_routes or default)
_stock_service = None


def get_stock_service() -> StockService:
    """
    Get the StockService instance for dependency injection.

    Returns:
        StockService: The injected or default stock service instance
    """
    global _stock_service
    if _stock_service is None:
        _stock_service = StockService()
    return _stock_service


def set_stock_service(service: StockService):
    """
    Set the StockService instance for dependency injection (used in testing).

    Args:
        service: StockService instance to inject
    """
    global _stock_service
    _stock_service = service


# Cache key functions
def make_stock_data_cache_key():
    """
    Generate cache key for stock data requests.

    Creates a unique cache key based on symbol and date range from the request JSON.
    Returns None if request data is invalid or an error occurs.

    Returns:
        str: Cache key in format "stock_data:{SYMBOL}:{start_date}:{end_date}"
        None: If request data is invalid

    Examples:
        >>> # For request: {"symbol": "AAPL", "start_date": "2024-01-01", "end_date": "2024-01-31"}
        >>> # Returns: "stock_data:AAPL:2024-01-01:2024-01-31"
    """
    try:
        data = request.get_json()
        if not data:
            return None

        symbol = data.get('symbol', '').upper()
        start_date = data.get('start_date', '')
        end_date = data.get('end_date', '')

        # Create cache key from request parameters
        cache_key = f"stock_data:{symbol}:{start_date}:{end_date}"
        logger.debug(f"Generated cache key: {cache_key}")
        return cache_key
    except Exception as e:
        logger.error(f"Error generating cache key: {e}")
        return None


def make_batch_stocks_cache_key():
    """
    Generate cache key for batch stocks requests.

    Creates a unique cache key based on sorted symbols list and date range.
    Symbols are sorted alphabetically to ensure consistent cache keys regardless
    of the order they appear in the request.

    Returns:
        str: Cache key in format "batch_stocks:{SYMBOL1,SYMBOL2}:{start_date}:{end_date}"
        None: If request data is invalid

    Examples:
        >>> # For request: {"symbols": ["GOOGL", "AAPL"], "start_date": "2024-01-01"}
        >>> # Returns: "batch_stocks:AAPL,GOOGL:2024-01-01:none"
    """
    try:
        data = request.get_json()
        if not data:
            return None

        symbols = sorted([s.upper() for s in data.get('symbols', [])])
        start_date = data.get('start_date', 'none')
        end_date = data.get('end_date', 'none')

        # Create cache key from request parameters
        symbols_str = ','.join(symbols)
        cache_key = f"batch_stocks:{symbols_str}:{start_date}:{end_date}"
        logger.debug(f"Generated cache key: {cache_key}")
        return cache_key
    except Exception as e:
        logger.error(f"Error generating cache key: {e}")
        return None

# Initialize schemas
stock_data_request_schema = StockDataRequestSchema()
batch_stocks_request_schema = BatchStocksRequestSchema()
stock_data_response_schema = StockDataResponseSchema()
batch_stocks_response_schema = BatchStocksResponseSchema()


@stock_bp.route('/stock-data', methods=['POST'])
@cache.cached(timeout=CACHE_TIMEOUT_SECONDS, make_cache_key=make_stock_data_cache_key)
@handle_errors
@log_request
def get_stock_data():
    """
    POST /api/stock-data
    Get historical stock data for a given symbol

    Request body:
        {
            "symbol": "AAPL",
            "start_date": "2024-01-01",
            "end_date": "2024-12-31"
        }

    Returns:
        Stock data with OHLCV (Open, High, Low, Close, Volume)

    Cache:
        Cached for 5 minutes (300 seconds) based on symbol and date range
    """
    # Validate request data
    data = stock_data_request_schema.load(request.json)

    # Validate date range
    if data['end_date'] < data['start_date']:
        raise ValueError('end_date must be after start_date')

    # Convert dates to strings
    start_date = data['start_date'].strftime('%Y-%m-%d')
    end_date = data['end_date'].strftime('%Y-%m-%d')

    # Fetch stock data using injected service
    stock_service = get_stock_service()
    result = stock_service.get_stock_data(
        symbol=data['symbol'].upper(),
        start_date=start_date,
        end_date=end_date
    )

    return jsonify(result), HTTP_OK


@stock_bp.route('/batch-stocks', methods=['POST'])
@cache.cached(timeout=CACHE_TIMEOUT_SECONDS, make_cache_key=make_batch_stocks_cache_key)
@handle_errors
@log_request
def get_batch_stocks():
    """
    POST /api/batch-stocks
    Get data for multiple stocks (max 18)

    Request body:
        {
            "symbols": ["AAPL", "GOOGL", "MSFT"],
            "start_date": "2024-01-01",  // optional
            "end_date": "2024-12-31"     // optional
        }

    Returns:
        Data for all requested stocks

    Cache:
        Cached for 5 minutes (300 seconds) based on symbols and date range
    """
    # Validate request data
    data = batch_stocks_request_schema.load(request.json)

    symbols = [s.upper() for s in data['symbols']]

    # Convert dates if provided
    start_date = None
    end_date = None

    if data.get('start_date'):
        start_date = data['start_date'].strftime('%Y-%m-%d')
    if data.get('end_date'):
        end_date = data['end_date'].strftime('%Y-%m-%d')

    # Validate date range if both provided
    if start_date and end_date and end_date < start_date:
        raise ValueError('end_date must be after start_date')

    # Fetch batch data using injected service
    stock_service = get_stock_service()
    result = stock_service.get_batch_stocks(
        symbols=symbols,
        start_date=start_date,
        end_date=end_date
    )

    return jsonify(result), HTTP_OK


@stock_bp.route('/batch-stocks-parallel', methods=['POST'])
@cache.cached(timeout=CACHE_TIMEOUT_SECONDS, make_cache_key=make_batch_stocks_cache_key)
@handle_errors
@log_request
def get_batch_stocks_parallel():
    """
    POST /api/v1/batch-stocks-parallel
    Get data for multiple stocks in parallel (max 18)

    This endpoint provides faster batch processing by fetching stock data
    concurrently instead of sequentially. Ideal for fetching 3+ stocks.

    Request body:
        {
            "symbols": ["AAPL", "GOOGL", "MSFT", "TSLA"],
            "start_date": "2024-01-01",  // optional
            "end_date": "2024-12-31",     // optional
            "max_workers": 5              // optional, default: 5
        }

    Returns:
        {
            "stocks": [...],
            "timestamp": "2024-11-25T...",
            "errors": null or [...],
            "processing_time_ms": 1234.56
        }

    Cache:
        Cached for 5 minutes (300 seconds) based on symbols and date range

    Performance:
        - Sequential (batch-stocks): ~3-5s for 5 stocks
        - Parallel (batch-stocks-parallel): ~1-2s for 5 stocks
        - Up to 3x faster for larger batches
    """
    # Validate request data
    data = batch_stocks_request_schema.load(request.json)

    symbols = [s.upper() for s in data['symbols']]

    # Convert dates if provided
    start_date = None
    end_date = None

    if data.get('start_date'):
        start_date = data['start_date'].strftime('%Y-%m-%d')
    if data.get('end_date'):
        end_date = data['end_date'].strftime('%Y-%m-%d')

    # Validate date range if both provided
    if start_date and end_date and end_date < start_date:
        raise ValueError('end_date must be after start_date')

    # Get max_workers from request (default: 5)
    max_workers = request.json.get('max_workers', 5) if request.json else 5
    if not isinstance(max_workers, int) or max_workers < 1 or max_workers > 10:
        raise ValueError('max_workers must be between 1 and 10')

    # Fetch batch data using parallel method
    stock_service = get_stock_service()
    result = stock_service.get_batch_stocks_parallel(
        symbols=symbols,
        start_date=start_date,
        end_date=end_date,
        max_workers=max_workers
    )

    return jsonify(result), HTTP_OK


# Note: Health check endpoint moved to health_routes.py for API v1
