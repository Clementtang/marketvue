import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""
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
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
