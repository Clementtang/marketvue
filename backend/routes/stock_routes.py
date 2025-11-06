from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from services.stock_service import StockService
from schemas.stock_schemas import (
    StockDataRequestSchema,
    BatchStocksRequestSchema,
    StockDataResponseSchema,
    BatchStocksResponseSchema
)
from utils.cache import cache
import logging

logger = logging.getLogger(__name__)

# Create blueprint
stock_bp = Blueprint('stock', __name__, url_prefix='/api')


# Cache key functions
def make_stock_data_cache_key():
    """Generate cache key for stock data requests based on symbol and date range"""
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
    """Generate cache key for batch stocks requests"""
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
@cache.cached(timeout=300, make_cache_key=make_stock_data_cache_key)
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
    try:
        # Validate request data
        data = stock_data_request_schema.load(request.json)

        # Validate date range
        if data['end_date'] < data['start_date']:
            return jsonify({
                'error': 'end_date must be after start_date'
            }), 400

        # Convert dates to strings
        start_date = data['start_date'].strftime('%Y-%m-%d')
        end_date = data['end_date'].strftime('%Y-%m-%d')

        # Fetch stock data
        result = StockService.get_stock_data(
            symbol=data['symbol'].upper(),
            start_date=start_date,
            end_date=end_date
        )

        return jsonify(result), 200

    except ValidationError as e:
        logger.warning(f"Validation error: {e.messages}")
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400

    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        return jsonify({'error': str(e)}), 404

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@stock_bp.route('/batch-stocks', methods=['POST'])
@cache.cached(timeout=300, make_cache_key=make_batch_stocks_cache_key)
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
    try:
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
            return jsonify({
                'error': 'end_date must be after start_date'
            }), 400

        # Fetch batch data
        result = StockService.get_batch_stocks(
            symbols=symbols,
            start_date=start_date,
            end_date=end_date
        )

        return jsonify(result), 200

    except ValidationError as e:
        logger.warning(f"Validation error: {e.messages}")
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400

    except ValueError as e:
        logger.error(f"Value error: {str(e)}")
        return jsonify({'error': str(e)}), 404

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@stock_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'stock-dashboard-api'
    }), 200
