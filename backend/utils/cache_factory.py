"""
Cache factory module for creating cache instances.

Supports multiple cache backends:
- SimpleCache: In-memory cache for development
- Redis: Distributed cache for production

The factory pattern allows seamless switching between backends
based on environment configuration.
"""
import logging
from typing import Dict, Any, Optional
from flask import Flask
from flask_caching import Cache

logger = logging.getLogger(__name__)


class CacheFactory:
    """
    Factory for creating and configuring cache instances.

    Supports automatic fallback from Redis to SimpleCache if Redis
    connection fails.

    Example:
        factory = CacheFactory()
        cache = factory.create_cache(app)
    """

    SUPPORTED_BACKENDS = ['SimpleCache', 'redis', 'RedisCache']

    def __init__(self):
        """Initialize cache factory."""
        self._cache: Optional[Cache] = None

    def create_cache(self, app: Flask) -> Cache:
        """
        Create and initialize a cache instance based on app configuration.

        Args:
            app: Flask application instance

        Returns:
            Configured Cache instance

        Raises:
            ValueError: If cache type is not supported
        """
        cache_type = app.config.get('CACHE_TYPE', 'SimpleCache')

        if cache_type not in self.SUPPORTED_BACKENDS:
            raise ValueError(
                f"Unsupported cache type: {cache_type}. "
                f"Supported types: {', '.join(self.SUPPORTED_BACKENDS)}"
            )

        cache_config = self._build_cache_config(app, cache_type)

        # Try to create cache with fallback
        cache = Cache()

        if cache_type.lower() in ['redis', 'rediscache']:
            try:
                cache.init_app(app, config=cache_config)
                # Test Redis connection
                self._test_redis_connection(cache)
                logger.info(f"Redis cache initialized: {app.config.get('CACHE_REDIS_URL', 'N/A')}")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}. Falling back to SimpleCache.")
                cache_config = self._build_simple_cache_config(app)
                cache = Cache()
                cache.init_app(app, config=cache_config)
                logger.info("Fallback to SimpleCache successful")
        else:
            cache.init_app(app, config=cache_config)
            logger.info("SimpleCache initialized")

        self._cache = cache
        return cache

    def _build_cache_config(self, app: Flask, cache_type: str) -> Dict[str, Any]:
        """
        Build cache configuration dictionary based on cache type.

        Args:
            app: Flask application instance
            cache_type: Type of cache backend

        Returns:
            Configuration dictionary for Flask-Caching
        """
        if cache_type.lower() in ['redis', 'rediscache']:
            return self._build_redis_config(app)
        return self._build_simple_cache_config(app)

    def _build_redis_config(self, app: Flask) -> Dict[str, Any]:
        """
        Build Redis cache configuration.

        Args:
            app: Flask application instance

        Returns:
            Redis cache configuration dictionary
        """
        return {
            'CACHE_TYPE': 'RedisCache',
            'CACHE_REDIS_URL': app.config.get('CACHE_REDIS_URL', 'redis://localhost:6379/0'),
            'CACHE_DEFAULT_TIMEOUT': app.config.get('CACHE_DEFAULT_TIMEOUT', 300),
            'CACHE_KEY_PREFIX': app.config.get('CACHE_KEY_PREFIX', 'marketvue:'),
            'CACHE_OPTIONS': {
                'socket_timeout': 5,
                'socket_connect_timeout': 5,
                'retry_on_timeout': True,
            }
        }

    def _build_simple_cache_config(self, app: Flask) -> Dict[str, Any]:
        """
        Build SimpleCache configuration.

        Args:
            app: Flask application instance

        Returns:
            SimpleCache configuration dictionary
        """
        return {
            'CACHE_TYPE': 'SimpleCache',
            'CACHE_DEFAULT_TIMEOUT': app.config.get('CACHE_DEFAULT_TIMEOUT', 300),
            'CACHE_THRESHOLD': 1000,  # Maximum number of items
        }

    def _test_redis_connection(self, cache: Cache) -> None:
        """
        Test Redis connection by setting and getting a test key.

        Args:
            cache: Cache instance to test

        Raises:
            Exception: If Redis connection fails
        """
        test_key = '_cache_factory_test'
        test_value = 'connection_test'

        # Try to set and get a value
        cache.set(test_key, test_value, timeout=10)
        result = cache.get(test_key)

        if result != test_value:
            raise ConnectionError("Redis connection test failed: value mismatch")

        # Clean up test key
        cache.delete(test_key)

    @property
    def cache(self) -> Optional[Cache]:
        """Get the created cache instance."""
        return self._cache


def get_cache_config(app: Flask) -> Dict[str, Any]:
    """
    Get cache configuration based on app settings.

    Convenience function for getting cache config without
    instantiating the factory.

    Args:
        app: Flask application instance

    Returns:
        Cache configuration dictionary
    """
    factory = CacheFactory()
    cache_type = app.config.get('CACHE_TYPE', 'SimpleCache')
    return factory._build_cache_config(app, cache_type)


def create_cache_with_fallback(app: Flask) -> Cache:
    """
    Create cache instance with automatic fallback.

    Convenience function that creates a cache instance using
    the factory pattern.

    Args:
        app: Flask application instance

    Returns:
        Configured Cache instance
    """
    factory = CacheFactory()
    return factory.create_cache(app)
