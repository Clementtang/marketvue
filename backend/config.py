"""
Application configuration module.

Loads environment variables and provides configuration classes for different
deployment environments (development, production).
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """
    Base configuration class.

    Provides default configuration values for all environments.
    Environment-specific configs inherit from this class.

    Attributes:
        DEBUG: Debug mode flag
        CORS_ORIGINS: List of allowed CORS origins
        CACHE_TYPE: Type of cache backend to use
        CACHE_DEFAULT_TIMEOUT: Default cache timeout in seconds
        CACHE_NEWS_TIMEOUT: News-specific cache timeout in seconds
        RATELIMIT_STORAGE_URL: Storage backend for rate limiting
        RATELIMIT_DEFAULT: Default rate limit per endpoint
        RATELIMIT_HEADERS_ENABLED: Enable rate limit headers in responses
        MAX_BATCH_STOCKS: Maximum number of stocks in batch request
        DEFAULT_STOCK_PERIOD: Default period for stock data
        LOG_LEVEL: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Flask settings
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

    @property
    def SECRET_KEY(self):
        """
        Get SECRET_KEY from environment with validation.
        Raises ValueError if not set properly in production.

        Returns:
            str: The secret key for Flask session encryption

        Raises:
            ValueError: If SECRET_KEY is not properly set in production
        """
        secret = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

        # In production, ensure SECRET_KEY is properly set
        if not self.DEBUG and (not secret or secret == 'dev-secret-key-change-in-production'):
            raise ValueError(
                "SECRET_KEY must be set in production environment. "
                "Generate one using: python -c 'import secrets; print(secrets.token_hex(32))'"
            )

        # Validate minimum length for security
        if not self.DEBUG and len(secret) < 32:
            raise ValueError(
                "SECRET_KEY must be at least 32 characters long. "
                "Generate one using: python -c 'import secrets; print(secrets.token_hex(32))'"
            )

        return secret

    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')

    # Cache settings
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'SimpleCache')
    CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_DEFAULT_TIMEOUT', '300'))  # 5 minutes
    CACHE_NEWS_TIMEOUT = int(os.getenv('CACHE_NEWS_TIMEOUT', '900'))  # 15 minutes

    # Rate limiting settings
    RATELIMIT_STORAGE_URL = os.getenv('RATELIMIT_STORAGE_URL', 'memory://')
    RATELIMIT_DEFAULT = os.getenv('RATELIMIT_DEFAULT', '1000 per hour')  # Increased for development
    RATELIMIT_HEADERS_ENABLED = True

    # Stock API settings
    MAX_BATCH_STOCKS = int(os.getenv('MAX_BATCH_STOCKS', '9'))
    DEFAULT_STOCK_PERIOD = os.getenv('DEFAULT_STOCK_PERIOD', '1mo')

    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')


class DevelopmentConfig(Config):
    """
    Development environment configuration.

    Enables debug mode and uses permissive settings for local development.
    Inherits all base configuration from Config class.
    """
    DEBUG = True


class ProductionConfig(Config):
    """
    Production environment configuration.

    Disables debug mode and uses strict settings for production deployment.
    Validates critical configuration values on initialization.

    Examples:
        CORS_ORIGINS=https://marketvue.vercel.app,https://marketvue-staging.vercel.app
        SECRET_KEY=<64-character-hex-string>
    """
    DEBUG = False

    def __init__(self):
        """Initialize and validate production configuration."""
        super().__init__()
        self._validate_production_config()

    def _validate_production_config(self):
        """
        Validate critical production configuration.

        Raises:
            ValueError: If any critical configuration is missing or invalid
        """
        # Validate CORS
        cors_origins = os.getenv('CORS_ORIGINS')
        if not cors_origins:
            raise ValueError(
                "CORS_ORIGINS must be explicitly set in production. "
                "Example: CORS_ORIGINS=https://marketvue.vercel.app"
            )

        # Check for localhost in CORS (should not be in production)
        if 'localhost' in cors_origins.lower() or '127.0.0.1' in cors_origins:
            raise ValueError(
                "CORS_ORIGINS must not contain localhost in production. "
                "Only production URLs should be allowed."
            )

        # Validate SECRET_KEY (will raise if invalid)
        _ = self.SECRET_KEY

        # Validate other critical settings
        if self.CACHE_TYPE == 'SimpleCache':
            import logging
            logging.warning(
                "Using SimpleCache in production. Consider using Redis or Memcached for better performance."
            )


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
