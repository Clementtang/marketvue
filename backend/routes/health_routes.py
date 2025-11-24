"""
Enhanced health check routes with system status information.

Provides comprehensive health check endpoints for monitoring:
- Basic health status
- Detailed system information
- Dependency status (cache, external services)
"""

import os
import sys
import time
from datetime import datetime
from flask import Blueprint, jsonify, current_app
from utils.cache import cache
from constants import HTTP_OK

# Application start time for uptime calculation
_start_time = time.time()

# Create blueprint for health routes
health_bp = Blueprint('health', __name__, url_prefix='/api/v1')


def get_cache_status() -> dict:
    """
    Check cache backend status.

    Returns:
        dict: Cache status with backend type and connection status
    """
    try:
        # Try to set and get a test value
        test_key = '_health_check_test'
        cache.set(test_key, 'ok', timeout=10)
        result = cache.get(test_key)
        cache.delete(test_key)

        return {
            'status': 'healthy' if result == 'ok' else 'degraded',
            'backend': current_app.config.get('CACHE_TYPE', 'unknown'),
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'backend': current_app.config.get('CACHE_TYPE', 'unknown'),
            'error': str(e),
        }


def get_uptime() -> dict:
    """
    Calculate application uptime.

    Returns:
        dict: Uptime information in various formats
    """
    uptime_seconds = time.time() - _start_time

    days = int(uptime_seconds // 86400)
    hours = int((uptime_seconds % 86400) // 3600)
    minutes = int((uptime_seconds % 3600) // 60)
    seconds = int(uptime_seconds % 60)

    return {
        'seconds': int(uptime_seconds),
        'formatted': f'{days}d {hours}h {minutes}m {seconds}s',
        'started_at': datetime.fromtimestamp(_start_time).isoformat(),
    }


@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Basic health check endpoint.

    Returns minimal information for load balancer health checks.
    Fast and lightweight response.

    Returns:
        JSON response with status
    """
    return jsonify({
        'status': 'healthy',
        'service': 'stock-dashboard-api',
        'version': '1.0.0',
    }), HTTP_OK


@health_bp.route('/health/detailed', methods=['GET'])
def detailed_health_check():
    """
    Detailed health check endpoint.

    Returns comprehensive system information including:
    - Application version and environment
    - Uptime statistics
    - Cache backend status
    - Python and Flask versions
    - Configuration summary

    Returns:
        JSON response with detailed system status
    """
    # Collect all health metrics
    cache_status = get_cache_status()
    uptime_info = get_uptime()

    # Determine overall status based on dependencies
    overall_status = 'healthy'
    if cache_status['status'] == 'unhealthy':
        overall_status = 'degraded'

    return jsonify({
        'status': overall_status,
        'service': 'stock-dashboard-api',
        'version': '1.0.0',
        'api_version': 'v1',
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'uptime': uptime_info,
        'environment': {
            'debug': current_app.config.get('DEBUG', False),
            'python_version': sys.version.split()[0],
            'flask_version': current_app.__class__.__module__.split('.')[0],
        },
        'dependencies': {
            'cache': cache_status,
        },
        'config': {
            'rate_limit': current_app.config.get('RATELIMIT_DEFAULT', 'unknown'),
            'cache_timeout': current_app.config.get('CACHE_DEFAULT_TIMEOUT', 'unknown'),
            'cors_origins_count': len(current_app.config.get('CORS_ORIGINS', [])),
        },
    }), HTTP_OK


@health_bp.route('/health/ready', methods=['GET'])
def readiness_check():
    """
    Kubernetes-style readiness probe.

    Checks if the application is ready to receive traffic.
    Returns 503 if any critical dependency is unhealthy.

    Returns:
        JSON response with ready status
    """
    cache_status = get_cache_status()

    is_ready = cache_status['status'] != 'unhealthy'
    status_code = HTTP_OK if is_ready else 503

    return jsonify({
        'ready': is_ready,
        'checks': {
            'cache': cache_status['status'],
        },
    }), status_code


@health_bp.route('/health/live', methods=['GET'])
def liveness_check():
    """
    Kubernetes-style liveness probe.

    Simple check to verify the application is running.
    Always returns 200 if the application can respond.

    Returns:
        JSON response with alive status
    """
    return jsonify({
        'alive': True,
        'timestamp': datetime.utcnow().isoformat() + 'Z',
    }), HTTP_OK
