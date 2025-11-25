"""
Tests for error handler utilities.

This module tests error handling functionality including:
- ValidationError handling
- HTTP error status codes (400, 404, 429, 500)
- HTTPException handling
- Generic Exception handling
- Error response format
"""

import pytest
from flask import Flask
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException, BadRequest, NotFound, TooManyRequests
from utils.error_handlers import register_error_handlers


@pytest.fixture
def app():
    """Create a Flask app for testing."""
    app = Flask(__name__)
    app.config['TESTING'] = True
    register_error_handlers(app)
    return app


@pytest.fixture
def client(app):
    """Create a test client."""
    return app.test_client()


class TestValidationErrorHandler:
    """Tests for ValidationError handling."""

    def test_validation_error_with_field_errors(self, app, client):
        """Test ValidationError handler with field-specific errors."""
        @app.route('/test/validation')
        def validation_endpoint():
            # Simulate a marshmallow ValidationError
            raise ValidationError({'symbol': ['This field is required.']})

        response = client.get('/test/validation')

        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'Validation error'
        assert 'details' in data
        assert data['details']['symbol'] == ['This field is required.']

    def test_validation_error_with_multiple_fields(self, app, client):
        """Test ValidationError handler with multiple field errors."""
        @app.route('/test/validation2')
        def validation_endpoint():
            raise ValidationError({
                'symbol': ['This field is required.'],
                'period': ['Invalid period value.']
            })

        response = client.get('/test/validation2')

        assert response.status_code == 400
        data = response.get_json()
        assert 'details' in data
        assert 'symbol' in data['details']
        assert 'period' in data['details']

    def test_validation_error_with_string_message(self, app, client):
        """Test ValidationError handler with simple string message."""
        @app.route('/test/validation3')
        def validation_endpoint():
            raise ValidationError('Invalid data provided')

        response = client.get('/test/validation3')

        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'Validation error'


class TestBadRequestHandler:
    """Tests for 400 Bad Request error handling."""

    def test_bad_request_error(self, app, client):
        """Test 400 error handler."""
        @app.route('/test/bad-request')
        def bad_request_endpoint():
            raise BadRequest('Invalid request parameters')

        response = client.get('/test/bad-request')

        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'Bad request'
        assert 'message' in data

    def test_bad_request_with_json_parsing_error(self, app, client):
        """Test 400 error from invalid JSON."""
        @app.route('/test/json-error', methods=['POST'])
        def json_error_endpoint():
            # This will be handled by Flask's built-in 400 handler
            raise BadRequest('Failed to decode JSON object')

        response = client.post('/test/json-error')

        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data


class TestNotFoundHandler:
    """Tests for 404 Not Found error handling."""

    def test_not_found_error(self, app, client):
        """Test 404 error handler."""
        # Request a route that doesn't exist
        response = client.get('/nonexistent/route')

        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'Not found'

    def test_not_found_explicit_raise(self, app, client):
        """Test explicit 404 error raising."""
        @app.route('/test/not-found')
        def not_found_endpoint():
            raise NotFound('Stock symbol not found')

        response = client.get('/test/not-found')

        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data


class TestRateLimitHandler:
    """Tests for 429 Too Many Requests error handling."""

    def test_rate_limit_error(self, app, client):
        """Test 429 error handler."""
        @app.route('/test/rate-limit')
        def rate_limit_endpoint():
            raise TooManyRequests('Rate limit exceeded')

        response = client.get('/test/rate-limit')

        assert response.status_code == 429
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'Rate limit exceeded'


class TestInternalServerErrorHandler:
    """Tests for 500 Internal Server Error handling."""

    def test_internal_server_error(self, app, client):
        """Test 500 error handler."""
        @app.route('/test/server-error')
        def server_error_endpoint():
            # Simulate an unhandled exception that becomes a 500 error
            raise Exception('Database connection failed')

        response = client.get('/test/server-error')

        assert response.status_code == 500
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'Internal server error'

    def test_internal_server_error_no_details_exposed(self, app, client):
        """Test that internal error details are not exposed."""
        @app.route('/test/server-error2')
        def server_error_endpoint():
            # Sensitive error that should not be exposed
            raise Exception('Secret database password is invalid')

        response = client.get('/test/server-error2')

        assert response.status_code == 500
        data = response.get_json()
        # Should not expose the actual exception message
        assert 'Secret database password' not in str(data)


class TestHTTPExceptionHandler:
    """Tests for generic HTTPException handling."""

    def test_http_exception_generic(self, app, client):
        """Test generic HTTPException handler."""
        @app.route('/test/http-exception')
        def http_exception_endpoint():
            # Create a custom HTTP exception
            exc = HTTPException('Custom HTTP error')
            exc.code = 418  # I'm a teapot
            raise exc

        response = client.get('/test/http-exception')

        assert response.status_code == 418
        data = response.get_json()
        assert 'error' in data

    def test_http_exception_with_description(self, app, client):
        """Test HTTPException with description."""
        @app.route('/test/http-exception2')
        def http_exception_endpoint():
            exc = HTTPException()
            exc.code = 403
            exc.description = 'Forbidden access'
            raise exc

        response = client.get('/test/http-exception2')

        assert response.status_code == 403
        data = response.get_json()
        assert 'error' in data


class TestGenericExceptionHandler:
    """Tests for generic Exception handling."""

    def test_generic_exception(self, app, client):
        """Test generic exception handler."""
        @app.route('/test/exception')
        def exception_endpoint():
            raise ValueError('Invalid value provided')

        response = client.get('/test/exception')

        assert response.status_code == 500
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'Internal server error'

    def test_zero_division_error(self, app, client):
        """Test handling of ZeroDivisionError."""
        @app.route('/test/zero-division')
        def zero_division_endpoint():
            result = 1 / 0  # This will raise ZeroDivisionError
            return {'result': result}

        response = client.get('/test/zero-division')

        assert response.status_code == 500
        data = response.get_json()
        assert 'error' in data

    def test_attribute_error(self, app, client):
        """Test handling of AttributeError."""
        @app.route('/test/attribute-error')
        def attribute_error_endpoint():
            obj = None
            obj.nonexistent_method()  # This will raise AttributeError
            return {'result': 'ok'}

        response = client.get('/test/attribute-error')

        assert response.status_code == 500
        data = response.get_json()
        assert 'error' in data


class TestErrorHandlerIntegration:
    """Integration tests for error handlers."""

    def test_multiple_error_handlers_registered(self, app):
        """Test that all error handlers are properly registered."""
        # Check that error handlers are registered
        assert 400 in app.error_handler_spec[None]
        assert 404 in app.error_handler_spec[None]
        assert 429 in app.error_handler_spec[None]
        assert 500 in app.error_handler_spec[None]

    def test_error_response_format_consistency(self, app, client):
        """Test that all error responses follow the same format."""
        # Test various errors and check they all have 'error' key
        @app.route('/test/format1')
        def format1():
            raise ValidationError('test')

        @app.route('/test/format2')
        def format2():
            raise BadRequest('test')

        @app.route('/test/format3')
        def format3():
            raise NotFound('test')

        # All should have 'error' key in response
        for route in ['/test/format1', '/test/format2', '/test/format3']:
            response = client.get(route)
            data = response.get_json()
            assert 'error' in data, f"Missing 'error' key in {route}"
