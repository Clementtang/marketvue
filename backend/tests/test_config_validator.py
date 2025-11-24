"""
Tests for configuration validator.
"""

import pytest
from utils.config_validator import ConfigValidator, ConfigValidationError, validate_config
from flask import Flask


class TestConfigValidator:
    """Tests for ConfigValidator class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.base_config = {
            'CACHE_TYPE': 'SimpleCache',
            'CORS_ORIGINS': ['http://localhost:5173'],
            'LOG_LEVEL': 'INFO',
            'RATELIMIT_DEFAULT': '1000 per hour',
            'CACHE_DEFAULT_TIMEOUT': 300,
            'DEBUG': True,
        }

    def test_valid_config_passes(self):
        """Test that valid configuration passes validation."""
        validator = ConfigValidator(self.base_config)
        assert validator.validate() is True
        assert len(validator.errors) == 0

    def test_invalid_cache_type(self):
        """Test that invalid CACHE_TYPE raises error."""
        config = {**self.base_config, 'CACHE_TYPE': 'InvalidCache'}
        validator = ConfigValidator(config)

        with pytest.raises(ConfigValidationError) as exc_info:
            validator.validate()

        assert 'Invalid CACHE_TYPE' in str(exc_info.value)

    def test_valid_cache_types(self):
        """Test all valid cache types."""
        for cache_type in ['SimpleCache', 'redis', 'RedisCache']:
            config = {**self.base_config, 'CACHE_TYPE': cache_type}
            if cache_type.lower() in ['redis', 'rediscache']:
                config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
            validator = ConfigValidator(config)
            assert validator.validate() is True

    def test_redis_requires_url(self):
        """Test that Redis cache requires REDIS_URL."""
        config = {**self.base_config, 'CACHE_TYPE': 'redis'}
        validator = ConfigValidator(config)

        with pytest.raises(ConfigValidationError) as exc_info:
            validator.validate()

        assert 'REDIS_URL is required' in str(exc_info.value)

    def test_redis_with_valid_url(self):
        """Test Redis with valid URL passes."""
        config = {
            **self.base_config,
            'CACHE_TYPE': 'redis',
            'CACHE_REDIS_URL': 'redis://localhost:6379/0'
        }
        validator = ConfigValidator(config)
        assert validator.validate() is True

    def test_redis_with_invalid_url_scheme(self):
        """Test Redis with invalid URL scheme."""
        config = {
            **self.base_config,
            'CACHE_TYPE': 'redis',
            'CACHE_REDIS_URL': 'http://localhost:6379/0'
        }
        validator = ConfigValidator(config)

        with pytest.raises(ConfigValidationError) as exc_info:
            validator.validate()

        assert 'Invalid Redis URL scheme' in str(exc_info.value)

    def test_invalid_log_level(self):
        """Test that invalid LOG_LEVEL raises error."""
        config = {**self.base_config, 'LOG_LEVEL': 'INVALID'}
        validator = ConfigValidator(config)

        with pytest.raises(ConfigValidationError) as exc_info:
            validator.validate()

        assert 'Invalid LOG_LEVEL' in str(exc_info.value)

    def test_valid_log_levels(self):
        """Test all valid log levels."""
        for level in ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']:
            config = {**self.base_config, 'LOG_LEVEL': level}
            validator = ConfigValidator(config)
            assert validator.validate() is True

    def test_cors_localhost_warning_in_production(self):
        """Test that localhost in CORS generates warning in production."""
        config = {
            **self.base_config,
            'DEBUG': False,
            'CORS_ORIGINS': ['http://localhost:5173']
        }
        validator = ConfigValidator(config)
        validator.validate()

        assert len(validator.warnings) > 0
        assert any('localhost' in w for w in validator.warnings)

    def test_cors_invalid_origin_format(self):
        """Test that invalid CORS origin format raises error."""
        config = {
            **self.base_config,
            'CORS_ORIGINS': ['invalid-origin']
        }
        validator = ConfigValidator(config)

        with pytest.raises(ConfigValidationError) as exc_info:
            validator.validate()

        assert 'Invalid CORS origin' in str(exc_info.value)

    def test_negative_cache_timeout(self):
        """Test that negative cache timeout raises error."""
        config = {**self.base_config, 'CACHE_DEFAULT_TIMEOUT': -1}
        validator = ConfigValidator(config)

        with pytest.raises(ConfigValidationError) as exc_info:
            validator.validate()

        assert 'non-negative' in str(exc_info.value)

    def test_very_high_cache_timeout_warning(self):
        """Test that very high cache timeout generates warning."""
        config = {**self.base_config, 'CACHE_DEFAULT_TIMEOUT': 100000}
        validator = ConfigValidator(config)
        validator.validate()

        assert len(validator.warnings) > 0
        assert any('very high' in w for w in validator.warnings)

    def test_strict_mode_treats_warnings_as_errors(self):
        """Test that strict mode treats warnings as errors."""
        config = {
            **self.base_config,
            'DEBUG': False,
            'CORS_ORIGINS': ['http://localhost:5173']
        }
        validator = ConfigValidator(config)

        with pytest.raises(ConfigValidationError):
            validator.validate(strict=True)


class TestValidateConfigFunction:
    """Tests for validate_config convenience function."""

    def test_validate_config_with_flask_app(self):
        """Test validate_config with Flask app."""
        app = Flask(__name__)
        app.config['CACHE_TYPE'] = 'SimpleCache'
        app.config['CORS_ORIGINS'] = ['http://localhost:5173']
        app.config['LOG_LEVEL'] = 'INFO'
        app.config['RATELIMIT_DEFAULT'] = '1000 per hour'
        app.config['CACHE_DEFAULT_TIMEOUT'] = 300
        app.config['DEBUG'] = True

        assert validate_config(app) is True
