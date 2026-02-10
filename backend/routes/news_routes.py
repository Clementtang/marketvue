"""
News Routes - API endpoints for stock news.

Provides:
- GET /api/v1/news/<symbol> - Fetch news for a stock symbol
"""

import logging
import re

from flask import Blueprint, request, jsonify

from services.news_service import NewsService
from utils.cache import cache
from utils.cache_keys import CacheKeyBuilder
from utils.decorators import handle_errors, log_request
from constants import NEWS_CACHE_TIMEOUT, NEWS_DEFAULT_LIMIT, HTTP_OK

logger = logging.getLogger(__name__)

# Create blueprint with versioned API prefix
news_bp = Blueprint('news', __name__, url_prefix='/api/v1')

# News service instance (injected via set_news_service or default)
_news_service = None

# Valid symbol pattern: alphanumeric, dots, hyphens, carets
SYMBOL_PATTERN = re.compile(r'^[A-Za-z0-9.\-^]{1,10}$')


def get_news_service() -> NewsService:
    """Get the NewsService instance for dependency injection."""
    global _news_service
    if _news_service is None:
        _news_service = NewsService()
    return _news_service


def set_news_service(service: NewsService):
    """Set the NewsService instance for dependency injection (used in testing)."""
    global _news_service
    _news_service = service


def make_news_cache_key(*args, **kwargs):
    """Generate cache key for news requests."""
    try:
        symbol = kwargs.get('symbol', '') or request.view_args.get('symbol', '')
        return CacheKeyBuilder.build_news_key(symbol)
    except Exception as e:
        logger.error(f"Error generating news cache key: {e}")
        return None


@news_bp.route('/news/<symbol>', methods=['GET'])
@cache.cached(timeout=NEWS_CACHE_TIMEOUT, make_cache_key=make_news_cache_key)
@handle_errors
@log_request
def get_news(symbol):
    """
    GET /api/v1/news/<symbol>

    Fetch news articles for a given stock symbol.

    Path params:
        symbol: Stock ticker symbol (e.g., 'AAPL', '2330.TW')

    Query params:
        limit: Number of articles per page (default: 10, max: 50)
        page: Page number, 1-indexed (default: 1)

    Returns:
        JSON with news articles in unified format

    Cache:
        Cached for 15 minutes (900 seconds) by symbol
    """
    # Validate symbol format
    if not SYMBOL_PATTERN.match(symbol):
        raise ValueError(
            'Invalid stock symbol format. '
            'Only letters, numbers, dots, hyphens, and carets allowed (max 10 chars).'
        )

    # Parse query parameters
    limit = request.args.get('limit', NEWS_DEFAULT_LIMIT, type=int)
    page = request.args.get('page', 1, type=int)

    # Validate parameters
    if limit < 1 or limit > 50:
        raise ValueError('Limit must be between 1 and 50')
    if page < 1:
        raise ValueError('Page must be 1 or greater')

    # Fetch news
    news_service = get_news_service()
    result = news_service.get_news(
        symbol=symbol.upper(),
        limit=limit,
        page=page
    )

    return jsonify(result), HTTP_OK
