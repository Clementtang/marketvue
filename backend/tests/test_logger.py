"""
Tests for enhanced logging utilities.
"""

import pytest
import logging
from flask import Flask
from unittest.mock import patch, MagicMock

from utils.logger import (
    ContextualFormatter,
    StructuredLogger,
    get_logger,
    configure_logging
)
from utils.request_context import init_request_context


class TestContextualFormatter:
    """Tests for ContextualFormatter class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.formatter = ContextualFormatter(
            fmt='%(levelname)s - [%(request_id)s] - %(message)s'
        )

    def test_format_without_request_context(self):
        """Test formatting outside of request context."""
        record = logging.LogRecord(
            name='test',
            level=logging.INFO,
            pathname='test.py',
            lineno=1,
            msg='Test message',
            args=(),
            exc_info=None
        )

        formatted = self.formatter.format(record)

        assert 'INFO' in formatted
        assert 'Test message' in formatted
        assert '[-]' in formatted  # No request_id

    def test_format_with_request_context(self):
        """Test formatting within request context."""
        app = Flask(__name__)
        init_request_context(app)

        with app.test_request_context('/test'):
            # Simulate before_request running
            from flask import g
            g.request_id = 'test-request-id'

            record = logging.LogRecord(
                name='test',
                level=logging.INFO,
                pathname='test.py',
                lineno=1,
                msg='Test message',
                args=(),
                exc_info=None
            )

            formatted = self.formatter.format(record)

            assert 'test-request-id' in formatted
            assert 'Test message' in formatted


class TestStructuredLogger:
    """Tests for StructuredLogger class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.logger = StructuredLogger('test')
        self.app = Flask(__name__)

    def test_debug_logging(self):
        """Test debug level logging."""
        with patch.object(self.logger._logger, 'debug') as mock_debug:
            self.logger.debug('Debug message')
            mock_debug.assert_called_once()

    def test_info_logging(self):
        """Test info level logging."""
        with patch.object(self.logger._logger, 'info') as mock_info:
            self.logger.info('Info message')
            mock_info.assert_called_once()

    def test_warning_logging(self):
        """Test warning level logging."""
        with patch.object(self.logger._logger, 'warning') as mock_warning:
            self.logger.warning('Warning message')
            mock_warning.assert_called_once()

    def test_error_logging(self):
        """Test error level logging."""
        with patch.object(self.logger._logger, 'error') as mock_error:
            self.logger.error('Error message')
            mock_error.assert_called_once()

    def test_exception_logging(self):
        """Test exception logging."""
        with patch.object(self.logger._logger, 'exception') as mock_exception:
            self.logger.exception('Exception message')
            mock_exception.assert_called_once()

    def test_critical_logging(self):
        """Test critical level logging."""
        with patch.object(self.logger._logger, 'critical') as mock_critical:
            self.logger.critical('Critical message')
            mock_critical.assert_called_once()

    def test_extra_enrichment_with_context(self):
        """Test that extra dict is enriched with request context."""
        init_request_context(self.app)

        with self.app.test_request_context('/test'):
            from flask import g
            g.request_id = 'test-123'

            enriched = self.logger._enrich_extra({'custom': 'value'})

            assert enriched['custom'] == 'value'
            assert enriched['request_id'] == 'test-123'
            assert 'endpoint' in enriched

    def test_extra_enrichment_without_context(self):
        """Test extra dict without request context."""
        enriched = self.logger._enrich_extra({'custom': 'value'})

        assert enriched['custom'] == 'value'
        assert 'request_id' not in enriched


class TestGetLogger:
    """Tests for get_logger function."""

    def test_get_logger_returns_structured_logger(self):
        """Test that get_logger returns a StructuredLogger."""
        logger = get_logger('test.module')

        assert isinstance(logger, StructuredLogger)

    def test_get_logger_with_different_names(self):
        """Test getting loggers with different names."""
        logger1 = get_logger('module1')
        logger2 = get_logger('module2')

        assert logger1._logger.name == 'module1'
        assert logger2._logger.name == 'module2'


class TestConfigureLogging:
    """Tests for configure_logging function."""

    def setup_method(self):
        """Set up test fixtures."""
        self.app = Flask(__name__)
        self.app.config['LOG_LEVEL'] = 'DEBUG'

    def test_configure_logging_sets_level(self):
        """Test that configure_logging sets the log level."""
        configure_logging(self.app)

        root_logger = logging.getLogger()
        assert root_logger.level == logging.DEBUG

    def test_configure_logging_adds_handler(self):
        """Test that configure_logging adds a handler."""
        configure_logging(self.app)

        root_logger = logging.getLogger()
        assert len(root_logger.handlers) > 0

    def test_configure_logging_uses_contextual_formatter(self):
        """Test that configure_logging uses ContextualFormatter."""
        configure_logging(self.app)

        root_logger = logging.getLogger()
        handler = root_logger.handlers[0]
        assert isinstance(handler.formatter, ContextualFormatter)
