"""
Tests for cache utilities.

This module tests the caching functionality including:
- Cache key generation
- Cached route decorator
- Cache hit/miss scenarios
"""

import json
import hashlib
import pytest
from unittest.mock import Mock, patch, MagicMock
from flask import Flask, request, jsonify
from utils.cache import make_cache_key, cached_route, cache


@pytest.fixture
def app():
    """Create a Flask app for testing."""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['CACHE_TYPE'] = 'SimpleCache'
    app.config['CACHE_DEFAULT_TIMEOUT'] = 300
    cache.init_app(app)
    return app


@pytest.fixture
def client(app):
    """Create a test client."""
    return app.test_client()


class TestMakeCacheKey:
    """Tests for make_cache_key function."""

    def test_cache_key_with_json_request(self, app):
        """Test cache key generation with JSON request body."""
        with app.test_request_context(
            '/api/stocks',
            method='POST',
            json={'symbol': 'AAPL', 'period': '1mo'}
        ):
            cache_key = make_cache_key()

            # Verify cache key format
            assert cache_key.startswith('cache_')
            assert len(cache_key) == 38  # 'cache_' + 32 char MD5 hash

            # Verify consistency - same input should generate same key
            cache_key2 = make_cache_key()
            assert cache_key == cache_key2

    def test_cache_key_with_query_params(self, app):
        """Test cache key generation with query parameters."""
        with app.test_request_context('/api/stocks?symbol=AAPL&period=1mo'):
            cache_key = make_cache_key()

            assert cache_key.startswith('cache_')
            assert len(cache_key) == 38

    def test_cache_key_different_for_different_requests(self, app):
        """Test that different requests generate different cache keys."""
        with app.test_request_context('/api/stocks', json={'symbol': 'AAPL'}):
            key1 = make_cache_key()

        with app.test_request_context('/api/stocks', json={'symbol': 'GOOGL'}):
            key2 = make_cache_key()

        assert key1 != key2

    def test_cache_key_with_combined_json_and_query(self, app):
        """Test cache key generation with both JSON body and query params."""
        with app.test_request_context(
            '/api/stocks?filter=active',
            method='POST',
            json={'symbol': 'AAPL'}
        ):
            cache_key = make_cache_key()

            assert cache_key.startswith('cache_')
            assert len(cache_key) == 38

    def test_cache_key_with_no_request_data(self, app):
        """Test cache key generation with no request data."""
        with app.test_request_context('/api/health'):
            cache_key = make_cache_key()

            assert cache_key.startswith('cache_')
            assert len(cache_key) == 38

    def test_cache_key_deterministic(self, app):
        """Test that cache key generation is deterministic."""
        request_data = {'symbol': 'AAPL', 'period': '1mo'}

        with app.test_request_context('/api/stocks', json=request_data):
            key1 = make_cache_key()

        with app.test_request_context('/api/stocks', json=request_data):
            key2 = make_cache_key()

        assert key1 == key2

    def test_cache_key_with_different_paths(self, app):
        """Test that different paths generate different cache keys."""
        with app.test_request_context('/api/stocks'):
            key1 = make_cache_key()

        with app.test_request_context('/api/health'):
            key2 = make_cache_key()

        assert key1 != key2

    def test_cache_key_with_complex_json(self, app):
        """Test cache key generation with complex nested JSON."""
        complex_data = {
            'symbols': ['AAPL', 'GOOGL', 'MSFT'],
            'config': {
                'period': '1mo',
                'interval': '1d',
                'adjustments': True
            }
        }

        with app.test_request_context('/api/batch', json=complex_data):
            cache_key = make_cache_key()

            assert cache_key.startswith('cache_')
            assert len(cache_key) == 38


class TestCachedRoute:
    """Tests for cached_route decorator."""

    def test_cached_route_cache_miss(self, app, client):
        """Test cached route decorator on first call (cache miss)."""
        call_count = {'count': 0}

        @app.route('/test/cached')
        @cached_route(timeout=300)
        def cached_endpoint():
            call_count['count'] += 1
            # Return dict directly (more cacheable than Response object)
            return {'result': 'data', 'call': call_count['count']}

        # First call - cache miss
        response1 = client.get('/test/cached')
        assert response1.status_code == 200
        data1 = response1.get_json()
        assert data1['call'] == 1

    def test_cached_route_cache_hit(self, app, client):
        """Test cached route decorator on subsequent call (cache hit)."""
        call_count = {'count': 0}

        @app.route('/test/cached2')
        @cached_route(timeout=300)
        def cached_endpoint():
            call_count['count'] += 1
            return {'result': 'data', 'call': call_count['count']}

        # First call
        response1 = client.get('/test/cached2')
        data1 = response1.get_json()

        # Second call - should hit cache
        response2 = client.get('/test/cached2')
        data2 = response2.get_json()

        # Both should return same data (from first call)
        assert data1['call'] == 1
        assert data2['call'] == 1
        assert call_count['count'] == 1  # Function only called once

    def test_cached_route_different_requests(self, app, client):
        """Test that different requests get cached separately."""
        call_count = {'count': 0}

        @app.route('/test/cached3')
        @cached_route(timeout=300)
        def cached_endpoint():
            symbol = request.args.get('symbol', 'DEFAULT')
            call_count['count'] += 1
            return {'symbol': symbol, 'call': call_count['count']}

        # First request
        response1 = client.get('/test/cached3?symbol=AAPL')
        data1 = response1.get_json()

        # Different request - should not hit cache
        response2 = client.get('/test/cached3?symbol=GOOGL')
        data2 = response2.get_json()

        assert data1['symbol'] == 'AAPL'
        assert data1['call'] == 1
        assert data2['symbol'] == 'GOOGL'
        assert data2['call'] == 2
        assert call_count['count'] == 2

    def test_cached_route_custom_timeout(self, app):
        """Test cached route with custom timeout."""
        @app.route('/test/cached4')
        @cached_route(timeout=60)
        def cached_endpoint():
            return {'result': 'ok'}

        with app.test_client() as client:
            response = client.get('/test/cached4')
            assert response.status_code == 200

    def test_cached_route_with_post_request(self, app, client):
        """Test cached route with POST request and JSON body."""
        call_count = {'count': 0}

        @app.route('/test/cached5', methods=['POST'])
        @cached_route(timeout=300)
        def cached_endpoint():
            data = request.get_json()
            call_count['count'] += 1
            return {
                'received': data,
                'call': call_count['count']
            }

        # First POST request
        response1 = client.post('/test/cached5', json={'symbol': 'AAPL'})
        data1 = response1.get_json()

        # Same POST request - should hit cache
        response2 = client.post('/test/cached5', json={'symbol': 'AAPL'})
        data2 = response2.get_json()

        assert data1['call'] == 1
        assert data2['call'] == 1
        assert call_count['count'] == 1

    def test_cached_route_preserves_function_metadata(self, app):
        """Test that cached_route decorator preserves function metadata."""
        @app.route('/test/cached6')
        @cached_route(timeout=300)
        def cached_endpoint():
            """Test endpoint docstring."""
            return {'result': 'ok'}

        # Check that function name and docstring are preserved
        assert cached_endpoint.__name__ == 'cached_endpoint'
        assert cached_endpoint.__doc__ == 'Test endpoint docstring.'

    @patch('utils.cache.logger')
    def test_cached_route_logs_cache_hit(self, mock_logger, app, client):
        """Test that cache hit is logged."""
        @app.route('/test/cached7')
        @cached_route(timeout=300)
        def cached_endpoint():
            return {'result': 'ok'}

        # First call
        client.get('/test/cached7')

        # Second call - should log cache hit
        client.get('/test/cached7')

        # Check that debug log was called with cache hit message
        debug_calls = [call[0][0] for call in mock_logger.debug.call_args_list]
        assert any('Cache hit for key:' in call for call in debug_calls)

    @patch('utils.cache.logger')
    def test_cached_route_logs_cache_set(self, mock_logger, app, client):
        """Test that cache set is logged."""
        @app.route('/test/cached8')
        @cached_route(timeout=300)
        def cached_endpoint():
            return {'result': 'ok'}

        # First call - should log cache set
        client.get('/test/cached8')

        # Check that debug log was called with cached response message
        debug_calls = [call[0][0] for call in mock_logger.debug.call_args_list]
        assert any('Cached response for key:' in call for call in debug_calls)


class TestCacheIntegration:
    """Integration tests for cache functionality."""

    def test_cache_clear(self, app):
        """Test cache clear functionality."""
        with app.app_context():
            # Set a value
            cache.set('test_key', 'test_value')
            assert cache.get('test_key') == 'test_value'

            # Clear cache
            cache.clear()
            assert cache.get('test_key') is None

    def test_cache_timeout(self, app):
        """Test that cache respects timeout."""
        with app.app_context():
            # Set a value with 1 second timeout
            cache.set('timeout_key', 'timeout_value', timeout=1)
            assert cache.get('timeout_key') == 'timeout_value'

            # After timeout, value should be gone
            import time
            time.sleep(1.1)
            assert cache.get('timeout_key') is None
