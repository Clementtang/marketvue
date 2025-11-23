"""
Services Package

This package contains services for stock data operations.

Main Service:
- StockService: Coordinator service (facade pattern)

Specialized Services:
- StockDataFetcher: Data retrieval from yfinance
- StockDataTransformer: Data format transformation
- PriceCalculator: Price calculations and metrics
- CompanyNameService: Company name resolution
"""

from .stock_service import StockService
from .stock_data_fetcher import StockDataFetcher
from .stock_data_transformer import StockDataTransformer
from .price_calculator import PriceCalculator
from .company_name_service import CompanyNameService

__all__ = [
    'StockService',
    'StockDataFetcher',
    'StockDataTransformer',
    'PriceCalculator',
    'CompanyNameService',
]
