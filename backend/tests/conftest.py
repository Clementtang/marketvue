"""
Pytest configuration and shared fixtures for MarketVue backend tests
"""
import pytest
import sys
import os
from unittest.mock import Mock, MagicMock
import pandas as pd

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app as flask_app


@pytest.fixture
def app():
    """
    Flask app fixture for testing

    Yields:
        Flask app configured for testing
    """
    from utils.cache import cache

    flask_app.config.update({
        "TESTING": True,
        "CACHE_TYPE": "NullCache",  # Disable caching in tests
        "CACHE_NO_NULL_WARNING": True
    })

    # Reinitialize cache with null cache for testing
    cache.init_app(flask_app, config={
        'CACHE_TYPE': 'NullCache',
        'CACHE_NO_NULL_WARNING': True
    })

    yield flask_app


@pytest.fixture
def client(app):
    """
    Test client fixture

    Args:
        app: Flask app fixture

    Returns:
        Test client for making requests
    """
    return app.test_client()


@pytest.fixture
def mock_yfinance_ticker():
    """
    Mock yfinance Ticker object with sample data

    Returns:
        MagicMock configured with sample stock data
    """
    mock_ticker = MagicMock()

    # Mock history data
    dates = pd.date_range('2025-11-05', periods=5, freq='D')
    mock_ticker.history.return_value = pd.DataFrame({
        'Open': [100.0, 101.0, 102.0, 103.0, 104.0],
        'High': [105.0, 106.0, 107.0, 108.0, 109.0],
        'Low': [98.0, 99.0, 100.0, 101.0, 102.0],
        'Close': [103.0, 104.0, 105.0, 106.0, 107.0],
        'Volume': [1000000, 1100000, 1200000, 1300000, 1400000]
    }, index=dates)

    # Mock info
    mock_ticker.info = {
        'shortName': 'Test Stock',
        'longName': 'Test Stock Inc.',
        'symbol': 'TEST'
    }

    return mock_ticker


@pytest.fixture
def mock_empty_ticker():
    """
    Mock yfinance Ticker with no data (for testing error handling)

    Returns:
        MagicMock with empty DataFrame
    """
    mock_ticker = MagicMock()
    mock_ticker.history.return_value = pd.DataFrame()
    mock_ticker.info = {}
    return mock_ticker


@pytest.fixture
def sample_stock_data():
    """
    Sample stock data for testing

    Returns:
        List of stock data points
    """
    return [
        {
            'date': '2025-11-05',
            'open': 100.0,
            'high': 105.0,
            'low': 98.0,
            'close': 103.0,
            'volume': 1000000
        },
        {
            'date': '2025-11-06',
            'open': 101.0,
            'high': 106.0,
            'low': 99.0,
            'close': 104.0,
            'volume': 1100000
        },
        {
            'date': '2025-11-07',
            'open': 102.0,
            'high': 107.0,
            'low': 100.0,
            'close': 105.0,
            'volume': 1200000
        }
    ]
