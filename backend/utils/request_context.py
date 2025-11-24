"""
Request context utilities for tracking requests across the application.

Provides request_id generation and storage for logging and debugging.
"""
import uuid
from flask import g, request
from functools import wraps
from typing import Optional


def generate_request_id() -> str:
    """
    Generate a unique request ID.

    Returns:
        A UUID4 string for request identification
    """
    return str(uuid.uuid4())


def get_request_id() -> Optional[str]:
    """
    Get the current request ID from Flask's g object.

    Returns:
        The current request ID or None if not in request context
    """
    return getattr(g, 'request_id', None)


def get_client_ip() -> Optional[str]:
    """
    Get the client IP address from the request.

    Handles X-Forwarded-For header for proxy environments.

    Returns:
        Client IP address or None if not in request context
    """
    if not request:
        return None

    # Check for forwarded header (common in production with proxies)
    forwarded_for = request.headers.get('X-Forwarded-For')
    if forwarded_for:
        # Take the first IP in the chain (original client)
        return forwarded_for.split(',')[0].strip()

    return request.remote_addr


def init_request_context(app):
    """
    Initialize request context middleware.

    Adds request_id to every request for tracing.

    Args:
        app: Flask application instance
    """
    @app.before_request
    def add_request_id():
        """Add unique request_id to Flask g object."""
        # Check for existing request_id in header (for distributed tracing)
        existing_id = request.headers.get('X-Request-ID')
        g.request_id = existing_id or generate_request_id()

    @app.after_request
    def add_request_id_header(response):
        """Add request_id to response headers."""
        request_id = get_request_id()
        if request_id:
            response.headers['X-Request-ID'] = request_id
        return response
