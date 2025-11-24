"""
Enhanced logging utilities with request context.

Provides structured logging with automatic inclusion of request_id,
client IP, and endpoint information.
"""
import logging
import json
from datetime import datetime
from typing import Optional, Any, Dict
from flask import request, has_request_context

from .request_context import get_request_id, get_client_ip


class ContextualFormatter(logging.Formatter):
    """
    Custom formatter that includes request context in log messages.

    Adds request_id, client_ip, and endpoint to each log entry
    when in a request context.
    """

    def format(self, record: logging.LogRecord) -> str:
        """
        Format the log record with request context.

        Args:
            record: The log record to format

        Returns:
            Formatted log string
        """
        # Add request context if available
        if has_request_context():
            record.request_id = get_request_id() or '-'
            record.client_ip = get_client_ip() or '-'
            record.endpoint = request.endpoint or '-'
            record.method = request.method
            record.path = request.path
        else:
            record.request_id = '-'
            record.client_ip = '-'
            record.endpoint = '-'
            record.method = '-'
            record.path = '-'

        return super().format(record)


class StructuredLogger:
    """
    Wrapper for Python logger with structured logging support.

    Provides methods for logging with automatic context enrichment.
    """

    def __init__(self, name: str):
        """
        Initialize the structured logger.

        Args:
            name: Logger name (typically __name__)
        """
        self._logger = logging.getLogger(name)

    def _enrich_extra(self, extra: Optional[Dict] = None) -> Dict:
        """
        Enrich extra dict with request context.

        Args:
            extra: Additional context to include

        Returns:
            Enriched extra dictionary
        """
        enriched = extra.copy() if extra else {}

        if has_request_context():
            enriched.update({
                'request_id': get_request_id(),
                'client_ip': get_client_ip(),
                'endpoint': request.endpoint,
                'method': request.method,
                'path': request.path,
            })

        return enriched

    def debug(self, msg: str, extra: Optional[Dict] = None, **kwargs):
        """Log debug message with context."""
        self._logger.debug(msg, extra=self._enrich_extra(extra), **kwargs)

    def info(self, msg: str, extra: Optional[Dict] = None, **kwargs):
        """Log info message with context."""
        self._logger.info(msg, extra=self._enrich_extra(extra), **kwargs)

    def warning(self, msg: str, extra: Optional[Dict] = None, **kwargs):
        """Log warning message with context."""
        self._logger.warning(msg, extra=self._enrich_extra(extra), **kwargs)

    def error(self, msg: str, extra: Optional[Dict] = None, **kwargs):
        """Log error message with context."""
        self._logger.error(msg, extra=self._enrich_extra(extra), **kwargs)

    def exception(self, msg: str, extra: Optional[Dict] = None, **kwargs):
        """Log exception with traceback and context."""
        self._logger.exception(msg, extra=self._enrich_extra(extra), **kwargs)

    def critical(self, msg: str, extra: Optional[Dict] = None, **kwargs):
        """Log critical message with context."""
        self._logger.critical(msg, extra=self._enrich_extra(extra), **kwargs)


def get_logger(name: str) -> StructuredLogger:
    """
    Get a structured logger instance.

    Args:
        name: Logger name (typically __name__)

    Returns:
        StructuredLogger instance
    """
    return StructuredLogger(name)


def configure_logging(app):
    """
    Configure application logging with contextual formatting.

    Args:
        app: Flask application instance
    """
    log_level = app.config.get('LOG_LEVEL', 'INFO')

    # Create formatter with request context
    formatter = ContextualFormatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - '
            '[%(request_id)s] [%(client_ip)s] [%(method)s %(path)s] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Add console handler with formatter
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Set werkzeug logger to WARNING to reduce noise
    logging.getLogger('werkzeug').setLevel(logging.WARNING)


def log_request_summary(response):
    """
    Log a summary of the completed request.

    Args:
        response: Flask response object

    Returns:
        The response object (for use in after_request)
    """
    logger = get_logger(__name__)

    # Calculate response time if start_time was set
    duration = '-'
    if hasattr(request, 'start_time'):
        duration = f"{(datetime.now() - request.start_time).total_seconds() * 1000:.2f}ms"

    logger.info(
        f"Request completed: {response.status_code} in {duration}",
        extra={
            'status_code': response.status_code,
            'duration': duration,
            'content_length': response.content_length,
        }
    )

    return response
