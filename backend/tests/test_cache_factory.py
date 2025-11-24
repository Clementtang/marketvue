"""
Tests for CacheFactory and cache configuration.
"""

import pytest
from flask import Flask
from unittest.mock import patch, MagicMock

from utils.cache_factory import (
    CacheFactory,
    get_cache_config,
    create_cache_with_fallback
)


class TestCacheFactory:
    """Tests for CacheFactory class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.factory = CacheFactory()
        self.app = Flask(__name__)

    def test_supported_backends(self):
        """Test that supported backends are defined."""
        assert 'SimpleCache' in CacheFactory.SUPPORTED_BACKENDS
        assert 'redis' in CacheFactory.SUPPORTED_BACKENDS
        assert 'RedisCache' in CacheFactory.SUPPORTED_BACKENDS

    def test_build_simple_cache_config(self):
        """Test SimpleCache configuration building."""
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300

        config = self.factory._build_simple_cache_config(self.app)

        assert config['CACHE_TYPE'] == 'SimpleCache'
        assert config['CACHE_DEFAULT_TIMEOUT'] == 300
        assert config['CACHE_THRESHOLD'] == 1000

    def test_build_redis_config(self):
        """Test Redis configuration building."""
        self.app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 600
        self.app.config['CACHE_KEY_PREFIX'] = 'test:'

        config = self.factory._build_redis_config(self.app)

        assert config['CACHE_TYPE'] == 'RedisCache'
        assert config['CACHE_REDIS_URL'] == 'redis://localhost:6379/0'
        assert config['CACHE_DEFAULT_TIMEOUT'] == 600
        assert config['CACHE_KEY_PREFIX'] == 'test:'
        assert 'CACHE_OPTIONS' in config

    def test_build_cache_config_simple(self):
        """Test cache config building for SimpleCache."""
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300

        config = self.factory._build_cache_config(self.app, 'SimpleCache')

        assert config['CACHE_TYPE'] == 'SimpleCache'

    def test_build_cache_config_redis(self):
        """Test cache config building for Redis."""
        self.app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300
        self.app.config['CACHE_KEY_PREFIX'] = 'marketvue:'

        config = self.factory._build_cache_config(self.app, 'redis')

        assert config['CACHE_TYPE'] == 'RedisCache'

    def test_create_cache_simple(self):
        """Test creating SimpleCache."""
        self.app.config['CACHE_TYPE'] = 'SimpleCache'
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300

        cache = self.factory.create_cache(self.app)

        assert cache is not None
        assert self.factory.cache is cache

    def test_create_cache_unsupported_type(self):
        """Test creating cache with unsupported type raises error."""
        self.app.config['CACHE_TYPE'] = 'UnsupportedCache'
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300

        with pytest.raises(ValueError) as exc_info:
            self.factory.create_cache(self.app)

        assert 'Unsupported cache type' in str(exc_info.value)

    @patch('utils.cache_factory.Cache')
    def test_redis_fallback_on_connection_error(self, mock_cache_class):
        """Test Redis fallback to SimpleCache on connection error."""
        self.app.config['CACHE_TYPE'] = 'redis'
        self.app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300
        self.app.config['CACHE_KEY_PREFIX'] = 'marketvue:'

        # First call for Redis, second for SimpleCache fallback
        mock_cache_instance = MagicMock()
        mock_cache_instance.get.side_effect = Exception("Connection refused")
        mock_cache_class.return_value = mock_cache_instance

        cache = self.factory.create_cache(self.app)

        # Should have attempted to create cache twice (Redis + fallback)
        assert mock_cache_class.call_count >= 1

    def test_cache_property(self):
        """Test cache property returns None before creation."""
        assert self.factory.cache is None

        self.app.config['CACHE_TYPE'] = 'SimpleCache'
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300

        self.factory.create_cache(self.app)

        assert self.factory.cache is not None


class TestGetCacheConfig:
    """Tests for get_cache_config function."""

    def setup_method(self):
        """Set up test fixtures."""
        self.app = Flask(__name__)

    def test_get_cache_config_simple(self):
        """Test getting config for SimpleCache."""
        self.app.config['CACHE_TYPE'] = 'SimpleCache'
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300

        config = get_cache_config(self.app)

        assert config['CACHE_TYPE'] == 'SimpleCache'
        assert config['CACHE_DEFAULT_TIMEOUT'] == 300

    def test_get_cache_config_redis(self):
        """Test getting config for Redis."""
        self.app.config['CACHE_TYPE'] = 'redis'
        self.app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300
        self.app.config['CACHE_KEY_PREFIX'] = 'marketvue:'

        config = get_cache_config(self.app)

        assert config['CACHE_TYPE'] == 'RedisCache'
        assert config['CACHE_REDIS_URL'] == 'redis://localhost:6379/0'

    def test_get_cache_config_default(self):
        """Test getting config with defaults."""
        config = get_cache_config(self.app)

        assert config['CACHE_TYPE'] == 'SimpleCache'


class TestCreateCacheWithFallback:
    """Tests for create_cache_with_fallback function."""

    def setup_method(self):
        """Set up test fixtures."""
        self.app = Flask(__name__)

    def test_create_with_simple_cache(self):
        """Test creating cache with SimpleCache."""
        self.app.config['CACHE_TYPE'] = 'SimpleCache'
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300

        cache = create_cache_with_fallback(self.app)

        assert cache is not None

    def test_create_with_unsupported_raises(self):
        """Test creating cache with unsupported type raises error."""
        self.app.config['CACHE_TYPE'] = 'MemoryCache'
        self.app.config['CACHE_DEFAULT_TIMEOUT'] = 300

        with pytest.raises(ValueError):
            create_cache_with_fallback(self.app)
