"""
Decorators for route error handling and logging
"""
from functools import wraps
from flask import jsonify
from marshmallow import ValidationError
import logging

logger = logging.getLogger(__name__)


def handle_errors(f):
    """
    Decorator to handle errors in Flask routes

    Catches common exceptions and returns appropriate JSON responses:
    - ValidationError: 400 with validation error details
    - ValueError: 400 with error message
    - Exception: 500 with generic error message

    Args:
        f: Flask route function to wrap

    Returns:
        Wrapped function with error handling
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValidationError as e:
            logger.warning(f"Validation error in {f.__name__}: {e.messages}")
            return jsonify({
                'error': 'Validation failed',
                'details': e.messages
            }), 400
        except ValueError as e:
            logger.warning(f"ValueError in {f.__name__}: {str(e)}")
            return jsonify({
                'error': str(e)
            }), 400
        except Exception as e:
            logger.error(f"Unexpected error in {f.__name__}: {str(e)}", exc_info=True)
            return jsonify({
                'error': 'Internal server error',
                'message': str(e)
            }), 500

    return decorated_function


def log_request(f):
    """
    Decorator to log incoming requests

    Logs request method, path, and remote address

    Args:
        f: Flask route function to wrap

    Returns:
        Wrapped function with request logging
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask import request
        logger.info(f"{request.method} {request.path} from {request.remote_addr}")
        return f(*args, **kwargs)

    return decorated_function
