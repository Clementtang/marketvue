"""
Legacy routes for backward compatibility.

Provides redirects from old /api/* paths to new /api/v1/* paths.
This ensures existing clients continue to work during migration.

Deprecation Notice:
    These routes are deprecated and will be removed in a future version.
    Please update your client to use /api/v1/* endpoints.
"""

import logging
from flask import Blueprint, redirect, url_for, request, jsonify
from functools import wraps
from constants import HTTP_OK

logger = logging.getLogger(__name__)

# Create blueprint for legacy routes (no prefix, will handle /api/*)
legacy_bp = Blueprint('legacy', __name__, url_prefix='/api')


@legacy_bp.after_request
def add_deprecation_headers_to_all(response):
    """Add deprecation headers to all legacy responses."""
    response.headers['X-API-Deprecated'] = 'true'
    response.headers['X-API-Deprecation-Notice'] = (
        'This endpoint is deprecated. Please use /api/v1/* instead.'
    )
    return response


def add_deprecation_warning(response):
    """Add deprecation warning header to response."""
    response.headers['X-API-Deprecated'] = 'true'
    response.headers['X-API-Deprecation-Notice'] = (
        'This endpoint is deprecated. Please use /api/v1/* instead.'
    )
    return response


def deprecated_redirect(new_endpoint: str, preserve_method: bool = True):
    """
    Decorator factory for creating deprecated route handlers.

    Args:
        new_endpoint: The new v1 endpoint to redirect to
        preserve_method: Whether to preserve the HTTP method (for POST, etc.)

    Returns:
        Decorator function that handles the deprecation
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Log deprecation warning
            logger.warning(
                f"Deprecated endpoint accessed: {request.path} -> {new_endpoint}"
            )

            # For GET requests, we can use a redirect
            if request.method == 'GET' and not preserve_method:
                new_url = url_for(new_endpoint, **kwargs)
                response = redirect(new_url, code=301)  # Permanent redirect
                return add_deprecation_warning(response)

            # For POST and other methods, we need to forward the request
            # This is handled by calling the original function
            return f(*args, **kwargs)

        return decorated_function
    return decorator


@legacy_bp.route('/stock-data', methods=['POST'])
@deprecated_redirect('stock.get_stock_data')
def legacy_stock_data():
    """
    Legacy endpoint for stock data.
    Forwards to /api/v1/stock-data.

    Deprecated:
        Use POST /api/v1/stock-data instead.
    """
    # Import here to avoid circular imports
    from routes.stock_routes import get_stock_data
    response = get_stock_data()

    # Add deprecation warning to response
    if isinstance(response, tuple):
        json_response, status_code = response
        final_response = json_response
        final_response = add_deprecation_warning(final_response)
        return final_response, status_code

    return add_deprecation_warning(response)


@legacy_bp.route('/batch-stocks', methods=['POST'])
@deprecated_redirect('stock.get_batch_stocks')
def legacy_batch_stocks():
    """
    Legacy endpoint for batch stocks.
    Forwards to /api/v1/batch-stocks.

    Deprecated:
        Use POST /api/v1/batch-stocks instead.
    """
    from routes.stock_routes import get_batch_stocks
    response = get_batch_stocks()

    if isinstance(response, tuple):
        json_response, status_code = response
        final_response = json_response
        final_response = add_deprecation_warning(final_response)
        return final_response, status_code

    return add_deprecation_warning(response)


@legacy_bp.route('/health', methods=['GET'])
@deprecated_redirect('health.health_check')
def legacy_health():
    """
    Legacy health check endpoint.
    Forwards to /api/v1/health.

    Deprecated:
        Use GET /api/v1/health instead.
    """
    from routes.health_routes import health_check
    response = health_check()

    if isinstance(response, tuple):
        json_response, status_code = response
        final_response = json_response
        final_response = add_deprecation_warning(final_response)
        return final_response, status_code

    return add_deprecation_warning(response)
