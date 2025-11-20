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
        SECRET_KEY: Flask secret key for session encryption
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
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

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
    CORS origins should be explicitly set via CORS_ORIGINS environment variable.

    Examples:
        CORS_ORIGINS=https://marketvue.vercel.app,https://marketvue-staging.vercel.app
    """
    DEBUG = False
    # Production CORS should be set via CORS_ORIGINS environment variable
    # Example: CORS_ORIGINS=https://marketvue.vercel.app,https://marketvue-staging.vercel.app


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
