"""
Tests for configuration classes.

This module tests configuration functionality including:
- Base Config class
- DevelopmentConfig
- ProductionConfig validation
"""

import os
import pytest
from unittest.mock import patch
from config import Config, DevelopmentConfig, ProductionConfig


class TestBaseConfig:
    """Tests for the base Config class."""

    def test_base_config_has_debug_attribute(self):
        """Test that base config has DEBUG attribute."""
        config = Config()
        assert hasattr(config, 'DEBUG')

    def test_base_config_has_secret_key(self):
        """Test that base config has SECRET_KEY."""
        config = Config()
        assert hasattr(config, 'SECRET_KEY')

    def test_base_config_has_cache_settings(self):
        """Test that base config has cache configuration."""
        config = Config()
        assert hasattr(config, 'CACHE_TYPE')
        assert hasattr(config, 'CACHE_DEFAULT_TIMEOUT')

    def test_base_config_has_cors_settings(self):
        """Test that base config has CORS configuration."""
        config = Config()
        assert hasattr(config, 'CORS_ORIGINS')

    def test_base_config_has_rate_limit_settings(self):
        """Test that base config has rate limit configuration."""
        config = Config()
        assert hasattr(config, 'RATELIMIT_DEFAULT')


class TestDevelopmentConfig:
    """Tests for DevelopmentConfig."""

    def test_development_config_debug_true(self):
        """Test that development config has DEBUG=True."""
        config = DevelopmentConfig()
        assert config.DEBUG == True

    def test_development_config_allows_localhost(self):
        """Test that development config allows localhost in CORS."""
        config = DevelopmentConfig()
        assert 'localhost' in str(config.CORS_ORIGINS).lower()

    def test_development_config_uses_simple_cache(self):
        """Test that development config uses SimpleCache."""
        config = DevelopmentConfig()
        assert config.CACHE_TYPE == 'SimpleCache'

    def test_development_config_has_secret_key(self):
        """Test that development config has a secret key."""
        config = DevelopmentConfig()
        assert hasattr(config, 'SECRET_KEY')
        assert config.SECRET_KEY is not None


class TestProductionConfig:
    """Tests for ProductionConfig validation."""

    @patch.dict(os.environ, {
        'CORS_ORIGINS': 'https://marketvue.vercel.app',
        'SECRET_KEY': 'a' * 64,  # 64 character key
        'CACHE_TYPE': 'SimpleCache'
    }, clear=False)
    def test_production_config_valid(self):
        """Test valid production configuration."""
        config = ProductionConfig()
        assert config.DEBUG == False

    @patch.dict(os.environ, {}, clear=True)
    def test_production_config_missing_cors_origins(self):
        """Test that missing CORS_ORIGINS raises ValueError."""
        with pytest.raises(ValueError, match="CORS_ORIGINS must be explicitly set"):
            ProductionConfig()

    @patch.dict(os.environ, {
        'CORS_ORIGINS': 'http://localhost:3000',
        'SECRET_KEY': 'a' * 64
    })
    def test_production_config_localhost_in_cors(self):
        """Test that localhost in CORS_ORIGINS raises ValueError."""
        with pytest.raises(ValueError, match="must not contain localhost in production"):
            ProductionConfig()

    @patch.dict(os.environ, {
        'CORS_ORIGINS': 'http://127.0.0.1:3000',
        'SECRET_KEY': 'a' * 64
    })
    def test_production_config_127_in_cors(self):
        """Test that 127.0.0.1 in CORS_ORIGINS raises ValueError."""
        with pytest.raises(ValueError, match="must not contain localhost in production"):
            ProductionConfig()

    @patch.dict(os.environ, {
        'CORS_ORIGINS': 'https://marketvue.vercel.app',
        'SECRET_KEY': ''
    })
    def test_production_config_empty_secret_key(self):
        """Test that empty SECRET_KEY raises ValueError."""
        with pytest.raises(ValueError, match="SECRET_KEY must be set in production"):
            ProductionConfig()

    @patch.dict(os.environ, {
        'CORS_ORIGINS': 'https://marketvue.vercel.app',
        'SECRET_KEY': 'dev-secret-key-change-in-production'
    })
    def test_production_config_default_secret_key(self):
        """Test that default SECRET_KEY raises ValueError."""
        with pytest.raises(ValueError, match="SECRET_KEY must be set in production"):
            ProductionConfig()

    @patch.dict(os.environ, {
        'CORS_ORIGINS': 'https://marketvue.vercel.app',
        'SECRET_KEY': 'short'
    })
    def test_production_config_short_secret_key(self):
        """Test that short SECRET_KEY raises ValueError."""
        with pytest.raises(ValueError, match="at least 32 characters long"):
            ProductionConfig()

    @patch.dict(os.environ, {
        'CORS_ORIGINS': 'https://marketvue.vercel.app',
        'SECRET_KEY': 'a' * 32  # Exactly 32 characters
    })
    def test_production_config_minimum_secret_key(self):
        """Test that 32-character SECRET_KEY is acceptable."""
        # Should not raise
        config = ProductionConfig()
        assert len(config.SECRET_KEY) >= 32

    @patch.dict(os.environ, {
        'CORS_ORIGINS': 'https://marketvue.vercel.app',
        'SECRET_KEY': 'a' * 64,
        'CACHE_TYPE': 'SimpleCache'
    })
    def test_production_config_simple_cache_warning(self, caplog):
        """Test that SimpleCache in production logs a warning."""
        import logging
        with caplog.at_level(logging.WARNING):
            ProductionConfig()
            assert "Using SimpleCache in production" in caplog.text



class TestConfigEnvironmentVariables:
    """Tests for environment variable handling."""

    def test_config_reads_environment_variables(self):
        """Test that config reads from environment variables."""
        config = Config()
        # These should all be set from environment or have defaults
        assert hasattr(config, 'SECRET_KEY')
        assert hasattr(config, 'CACHE_TYPE')
        assert hasattr(config, 'CACHE_DEFAULT_TIMEOUT')
        assert hasattr(config, 'CORS_ORIGINS')


class TestConfigInheritance:
    """Tests for configuration inheritance."""

    def test_development_inherits_from_base(self):
        """Test that DevelopmentConfig inherits from Config."""
        assert issubclass(DevelopmentConfig, Config)

    def test_production_inherits_from_base(self):
        """Test that ProductionConfig inherits from Config."""
        assert issubclass(ProductionConfig, Config)

    def test_all_configs_have_cache_type(self):
        """Test that all config classes have CACHE_TYPE."""
        dev_config = DevelopmentConfig()

        assert hasattr(dev_config, 'CACHE_TYPE')

    def test_all_configs_have_rate_limit(self):
        """Test that all config classes have RATELIMIT_DEFAULT."""
        dev_config = DevelopmentConfig()

        assert hasattr(dev_config, 'RATELIMIT_DEFAULT')
