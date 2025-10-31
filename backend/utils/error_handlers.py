from flask import jsonify
from werkzeug.exceptions import HTTPException
from marshmallow import ValidationError
import logging

logger = logging.getLogger(__name__)


def register_error_handlers(app):
    """Register error handlers with the Flask app"""

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """Handle Marshmallow validation errors"""
        logger.warning(f"Validation error: {error.messages}")
        return jsonify({
            'error': 'Validation error',
            'details': error.messages
        }), 400

    @app.errorhandler(400)
    def handle_bad_request(error):
        """Handle bad request errors"""
        logger.warning(f"Bad request: {error}")
        return jsonify({
            'error': 'Bad request',
            'message': str(error.description) if hasattr(error, 'description') else 'Invalid request'
        }), 400

    @app.errorhandler(404)
    def handle_not_found(error):
        """Handle not found errors"""
        logger.warning(f"Not found: {error}")
        return jsonify({
            'error': 'Not found',
            'message': str(error.description) if hasattr(error, 'description') else 'Resource not found'
        }), 404

    @app.errorhandler(429)
    def handle_rate_limit_exceeded(error):
        """Handle rate limit exceeded errors"""
        logger.warning(f"Rate limit exceeded: {error}")
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.'
        }), 429

    @app.errorhandler(500)
    def handle_internal_error(error):
        """Handle internal server errors"""
        logger.error(f"Internal server error: {error}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle general HTTP exceptions"""
        logger.warning(f"HTTP exception: {error}")
        return jsonify({
            'error': error.name,
            'message': error.description
        }), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Handle unexpected errors"""
        logger.error(f"Unexpected error: {error}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500
