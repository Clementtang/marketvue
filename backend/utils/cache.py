"""
Cache utilities module.

Provides caching helpers and decorators for route caching.
Supports multiple backends (SimpleCache, Redis) via Flask-Caching.
"""
from flask_caching import Cache
from functools import wraps
from flask import request
import hashlib
import json
import logging

logger = logging.getLogger(__name__)

# Initialize cache instance - will be configured by app.py
cache = Cache()


def make_cache_key(*args, **kwargs):
    """
    Generate a cache key based on request path and arguments
    """
    # Get request path
    path = request.path

    # Get request args
    args_dict = request.get_json() if request.is_json else {}
    query_args = request.args.to_dict()

    # Combine all parameters
    cache_dict = {
        'path': path,
        'json': args_dict,
        'query': query_args
    }

    # Create hash
    cache_string = json.dumps(cache_dict, sort_keys=True)
    cache_hash = hashlib.md5(cache_string.encode()).hexdigest()

    return f"cache_{cache_hash}"


def cached_route(timeout=300):
    """
    Decorator for caching route responses.

    Args:
        timeout: Cache timeout in seconds (default: 300)

    Returns:
        Decorated function with caching enabled
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            cache_key = make_cache_key()

            # Try to get from cache
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return cached_response

            # Generate response
            response = f(*args, **kwargs)

            # Cache the response
            cache.set(cache_key, response, timeout=timeout)
            logger.debug(f"Cached response for key: {cache_key}")

            return response

        return decorated_function
    return decorator
