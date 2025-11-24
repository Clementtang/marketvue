"""
Tests for API versioning and legacy route backward compatibility.
"""

import pytest
from flask import Flask
from unittest.mock import patch, MagicMock
from app import create_app


@pytest.fixture
def app():
    """Create test Flask application."""
    app = create_app('default')
    app.config['TESTING'] = True
    return app


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


class TestAPIVersioning:
    """Tests for API versioning structure."""

    def test_root_endpoint_shows_v1_endpoints(self, client):
        """Test root endpoint lists v1 API endpoints."""
        response = client.get('/')
        data = response.get_json()

        assert response.status_code == 200
        assert 'api_version' in data
        assert data['api_version'] == 'v1'
        assert 'v1' in data['endpoints']

    def test_root_endpoint_shows_deprecated_endpoints(self, client):
        """Test root endpoint lists deprecated endpoints."""
        response = client.get('/')
        data = response.get_json()

        assert 'deprecated' in data['endpoints']
        assert '/api/stock-data' in str(data['endpoints']['deprecated'])


class TestV1Endpoints:
    """Tests for v1 API endpoints."""

    def test_v1_health_endpoint(self, client):
        """Test v1 health endpoint works."""
        response = client.get('/api/v1/health')

        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'

    def test_v1_health_detailed_endpoint(self, client):
        """Test v1 detailed health endpoint works."""
        response = client.get('/api/v1/health/detailed')

        assert response.status_code == 200
        data = response.get_json()
        assert 'uptime' in data
        assert 'dependencies' in data

    def test_v1_health_ready_endpoint(self, client):
        """Test v1 readiness endpoint works."""
        response = client.get('/api/v1/health/ready')

        assert response.status_code == 200
        data = response.get_json()
        assert 'ready' in data

    def test_v1_health_live_endpoint(self, client):
        """Test v1 liveness endpoint works."""
        response = client.get('/api/v1/health/live')

        assert response.status_code == 200
        data = response.get_json()
        assert data['alive'] is True

    def test_v1_stock_data_endpoint_exists(self, client):
        """Test v1 stock data endpoint exists (not 404)."""
        # Test endpoint exists - returns something other than 404
        response = client.post('/api/v1/stock-data', json={
            'symbol': 'INVALID',
            'start_date': 'invalid',
            'end_date': 'invalid'
        })

        # Should NOT be 404 (endpoint exists)
        assert response.status_code != 404

    def test_v1_batch_stocks_endpoint_exists(self, client):
        """Test v1 batch stocks endpoint exists (not 404)."""
        response = client.post('/api/v1/batch-stocks', json={
            'symbols': ['TEST']
        })

        # Should NOT be 404 (endpoint exists)
        assert response.status_code != 404


class TestLegacyEndpoints:
    """Tests for legacy API endpoints (backward compatibility)."""

    def test_legacy_health_endpoint_works(self, client):
        """Test legacy /api/health still works."""
        response = client.get('/api/health')

        assert response.status_code == 200

    def test_legacy_health_has_deprecation_header(self, client):
        """Test legacy health endpoint has deprecation header."""
        response = client.get('/api/health')

        assert 'X-API-Deprecated' in response.headers
        assert response.headers['X-API-Deprecated'] == 'true'

    def test_legacy_health_has_deprecation_notice(self, client):
        """Test legacy health endpoint has deprecation notice."""
        response = client.get('/api/health')

        assert 'X-API-Deprecation-Notice' in response.headers
        assert '/api/v1/' in response.headers['X-API-Deprecation-Notice']

    def test_legacy_stock_data_endpoint_exists(self, client):
        """Test legacy /api/stock-data still exists (not 404)."""
        response = client.post('/api/stock-data', json={
            'symbol': 'INVALID',
            'start_date': 'invalid',
            'end_date': 'invalid'
        })

        # Should NOT be 404 (endpoint exists)
        assert response.status_code != 404
        # Deprecation header should be present
        assert 'X-API-Deprecated' in response.headers

    def test_legacy_batch_stocks_endpoint_exists(self, client):
        """Test legacy /api/batch-stocks still exists (not 404)."""
        response = client.post('/api/batch-stocks', json={
            'symbols': ['TEST']
        })

        # Should NOT be 404 (endpoint exists)
        assert response.status_code != 404
        # Deprecation header should be present
        assert 'X-API-Deprecated' in response.headers


class TestV1AndLegacyConsistency:
    """Tests to ensure v1 and legacy endpoints return consistent data."""

    def test_health_response_consistency(self, client):
        """Test v1 and legacy health return same data structure."""
        v1_response = client.get('/api/v1/health')
        legacy_response = client.get('/api/health')

        v1_data = v1_response.get_json()
        legacy_data = legacy_response.get_json()

        assert v1_data['status'] == legacy_data['status']
        assert v1_data['service'] == legacy_data['service']
