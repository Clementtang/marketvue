"""
Configuration validation utilities.

Validates application configuration at startup to catch
misconfigurations early.
"""
import os
import logging
from typing import List, Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class ConfigValidationError(Exception):
    """Raised when configuration validation fails."""
    pass


class ConfigValidator:
    """
    Validates application configuration.

    Checks for required values, valid formats, and security concerns.
    """

    VALID_CACHE_TYPES = ['SimpleCache', 'redis', 'RedisCache']
    VALID_LOG_LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']

    def __init__(self, app_config: dict):
        """
        Initialize validator with app configuration.

        Args:
            app_config: Flask app.config dictionary
        """
        self.config = app_config
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def validate(self, strict: bool = False) -> bool:
        """
        Run all validation checks.

        Args:
            strict: If True, treat warnings as errors

        Returns:
            True if validation passes, False otherwise

        Raises:
            ConfigValidationError: If strict mode and validation fails
        """
        self.errors = []
        self.warnings = []

        # Run all validators
        self._validate_cache_type()
        self._validate_redis_url()
        self._validate_cors_origins()
        self._validate_log_level()
        self._validate_rate_limit()
        self._validate_timeouts()

        # Log results
        for warning in self.warnings:
            logger.warning(f"Config warning: {warning}")

        for error in self.errors:
            logger.error(f"Config error: {error}")

        # Determine if validation passed
        has_errors = len(self.errors) > 0
        has_warnings = len(self.warnings) > 0

        if strict and (has_errors or has_warnings):
            all_issues = self.errors + self.warnings
            raise ConfigValidationError(
                f"Configuration validation failed: {'; '.join(all_issues)}"
            )

        if has_errors:
            raise ConfigValidationError(
                f"Configuration validation failed: {'; '.join(self.errors)}"
            )

        return True

    def _validate_cache_type(self):
        """Validate CACHE_TYPE configuration."""
        cache_type = self.config.get('CACHE_TYPE', 'SimpleCache')

        if cache_type not in self.VALID_CACHE_TYPES:
            self.errors.append(
                f"Invalid CACHE_TYPE '{cache_type}'. "
                f"Valid options: {', '.join(self.VALID_CACHE_TYPES)}"
            )

    def _validate_redis_url(self):
        """Validate REDIS_URL if Redis cache is enabled."""
        cache_type = self.config.get('CACHE_TYPE', 'SimpleCache')

        if cache_type.lower() in ['redis', 'rediscache']:
            redis_url = self.config.get('CACHE_REDIS_URL')

            if not redis_url:
                self.errors.append(
                    "REDIS_URL is required when CACHE_TYPE is 'redis'"
                )
                return

            # Validate URL format
            try:
                parsed = urlparse(redis_url)
                if parsed.scheme not in ['redis', 'rediss']:
                    self.errors.append(
                        f"Invalid Redis URL scheme '{parsed.scheme}'. "
                        "Expected 'redis' or 'rediss'"
                    )
            except Exception as e:
                self.errors.append(f"Invalid Redis URL format: {e}")

    def _validate_cors_origins(self):
        """Validate CORS_ORIGINS configuration."""
        cors_origins = self.config.get('CORS_ORIGINS', [])

        if not cors_origins:
            self.warnings.append("CORS_ORIGINS is empty")
            return

        debug = self.config.get('DEBUG', False)

        for origin in cors_origins:
            # Check for localhost in production
            if not debug and ('localhost' in origin or '127.0.0.1' in origin):
                self.warnings.append(
                    f"CORS origin '{origin}' contains localhost. "
                    "This should not be used in production."
                )

            # Validate URL format
            if not origin.startswith(('http://', 'https://')):
                self.errors.append(
                    f"Invalid CORS origin '{origin}'. "
                    "Must start with http:// or https://"
                )

    def _validate_log_level(self):
        """Validate LOG_LEVEL configuration."""
        log_level = self.config.get('LOG_LEVEL', 'INFO')

        if log_level.upper() not in self.VALID_LOG_LEVELS:
            self.errors.append(
                f"Invalid LOG_LEVEL '{log_level}'. "
                f"Valid options: {', '.join(self.VALID_LOG_LEVELS)}"
            )

    def _validate_rate_limit(self):
        """Validate rate limit configuration."""
        rate_limit = self.config.get('RATELIMIT_DEFAULT', '')

        if not rate_limit:
            self.warnings.append("RATELIMIT_DEFAULT is not set")
            return

        # Basic format check (e.g., "1000 per hour")
        parts = rate_limit.split()
        if len(parts) < 3 or parts[1] != 'per':
            self.warnings.append(
                f"Rate limit format '{rate_limit}' may be invalid. "
                "Expected format: 'N per period' (e.g., '1000 per hour')"
            )

    def _validate_timeouts(self):
        """Validate timeout configurations."""
        cache_timeout = self.config.get('CACHE_DEFAULT_TIMEOUT', 300)

        if cache_timeout < 0:
            self.errors.append(
                f"CACHE_DEFAULT_TIMEOUT must be non-negative, got {cache_timeout}"
            )

        if cache_timeout > 86400:  # 24 hours
            self.warnings.append(
                f"CACHE_DEFAULT_TIMEOUT is very high ({cache_timeout}s). "
                "This may cause stale data issues."
            )


def validate_config(app) -> bool:
    """
    Validate Flask application configuration.

    Convenience function for validating config at startup.

    Args:
        app: Flask application instance

    Returns:
        True if validation passes

    Raises:
        ConfigValidationError: If validation fails
    """
    validator = ConfigValidator(app.config)
    return validator.validate(strict=False)
