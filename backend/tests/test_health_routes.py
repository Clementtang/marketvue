"""
Tests for enhanced health check routes.
"""

import pytest
from flask import Flask
from unittest.mock import patch, MagicMock
from routes.health_routes import health_bp, get_cache_status, get_uptime
from utils.cache import cache


@pytest.fixture
def app():
    """Create test Flask application."""
    app = Flask(__name__)
    app.config['CACHE_TYPE'] = 'SimpleCache'
    app.config['DEBUG'] = True
    app.config['RATELIMIT_DEFAULT'] = '1000 per hour'
    app.config['CACHE_DEFAULT_TIMEOUT'] = 300
    app.config['CORS_ORIGINS'] = ['http://localhost:5173']

    # Initialize cache
    cache.init_app(app, config={'CACHE_TYPE': 'SimpleCache'})

    # Register blueprint
    app.register_blueprint(health_bp)

    return app


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


class TestHealthEndpoint:
    """Tests for basic health endpoint."""

    def test_health_returns_200(self, client):
        """Test basic health check returns 200."""
        response = client.get('/api/v1/health')

        assert response.status_code == 200

    def test_health_returns_healthy_status(self, client):
        """Test health check returns healthy status."""
        response = client.get('/api/v1/health')
        data = response.get_json()

        assert data['status'] == 'healthy'
        assert data['service'] == 'marketvue-api'
        assert data['version'] == '1.0.0'


class TestDetailedHealthEndpoint:
    """Tests for detailed health endpoint."""

    def test_detailed_health_returns_200(self, client):
        """Test detailed health check returns 200."""
        response = client.get('/api/v1/health/detailed')

        assert response.status_code == 200

    def test_detailed_health_includes_uptime(self, client):
        """Test detailed health includes uptime info."""
        response = client.get('/api/v1/health/detailed')
        data = response.get_json()

        assert 'uptime' in data
        assert 'seconds' in data['uptime']
        assert 'formatted' in data['uptime']
        assert 'started_at' in data['uptime']

    def test_detailed_health_includes_dependencies(self, client):
        """Test detailed health includes dependency status."""
        response = client.get('/api/v1/health/detailed')
        data = response.get_json()

        assert 'dependencies' in data
        assert 'cache' in data['dependencies']

    def test_detailed_health_includes_environment(self, client):
        """Test detailed health includes environment info."""
        response = client.get('/api/v1/health/detailed')
        data = response.get_json()

        assert 'environment' in data
        assert 'python_version' in data['environment']
        assert 'debug' in data['environment']

    def test_detailed_health_includes_config(self, client):
        """Test detailed health includes config summary."""
        response = client.get('/api/v1/health/detailed')
        data = response.get_json()

        assert 'config' in data
        assert 'rate_limit' in data['config']
        assert 'cache_timeout' in data['config']

    def test_detailed_health_includes_api_version(self, client):
        """Test detailed health includes API version."""
        response = client.get('/api/v1/health/detailed')
        data = response.get_json()

        assert data['api_version'] == 'v1'


class TestReadinessEndpoint:
    """Tests for Kubernetes-style readiness probe."""

    def test_readiness_returns_200_when_healthy(self, client):
        """Test readiness returns 200 when all dependencies healthy."""
        response = client.get('/api/v1/health/ready')

        assert response.status_code == 200

    def test_readiness_returns_ready_true(self, client):
        """Test readiness returns ready=true when healthy."""
        response = client.get('/api/v1/health/ready')
        data = response.get_json()

        assert data['ready'] is True
        assert 'checks' in data


class TestLivenessEndpoint:
    """Tests for Kubernetes-style liveness probe."""

    def test_liveness_returns_200(self, client):
        """Test liveness always returns 200."""
        response = client.get('/api/v1/health/live')

        assert response.status_code == 200

    def test_liveness_returns_alive_true(self, client):
        """Test liveness returns alive=true."""
        response = client.get('/api/v1/health/live')
        data = response.get_json()

        assert data['alive'] is True
        assert 'timestamp' in data


class TestGetCacheStatus:
    """Tests for get_cache_status function."""

    def test_cache_status_healthy(self, app):
        """Test cache status returns healthy when cache works."""
        with app.app_context():
            status = get_cache_status()

            assert status['status'] == 'healthy'
            assert status['backend'] == 'SimpleCache'


class TestGetUptime:
    """Tests for get_uptime function."""

    def test_uptime_returns_dict(self):
        """Test uptime returns dictionary with required keys."""
        uptime = get_uptime()

        assert isinstance(uptime, dict)
        assert 'seconds' in uptime
        assert 'formatted' in uptime
        assert 'started_at' in uptime

    def test_uptime_seconds_is_positive(self):
        """Test uptime seconds is positive."""
        uptime = get_uptime()

        assert uptime['seconds'] >= 0

    def test_uptime_formatted_contains_units(self):
        """Test uptime formatted string contains time units."""
        uptime = get_uptime()

        assert 'd' in uptime['formatted']
        assert 'h' in uptime['formatted']
        assert 'm' in uptime['formatted']
        assert 's' in uptime['formatted']
