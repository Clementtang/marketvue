"""
Company Name Service

Responsible for managing company name lookups in multiple languages.
Single responsibility: Company name resolution and caching.
"""

import json
import logging
import os
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class CompanyNameService:
    """
    Service for managing company name lookups.

    This service loads and caches company name mappings from a JSON file,
    and provides multilingual company name resolution.

    Examples:
        >>> name_service = CompanyNameService()
        >>> name = name_service.get_company_name('AAPL')
        >>> print(name['en-US'])
        'Apple Inc.'
    """

    def __init__(self, data_dir: Optional[str] = None):
        """
        Initialize the CompanyNameService.

        Args:
            data_dir: Optional directory path for data files.
                     If not provided, defaults to backend/data/
        """
        self._company_names: Optional[Dict] = None
        self._data_dir = data_dir

    def _get_json_path(self) -> str:
        """
        Get the path to the company names JSON file.

        Returns:
            Full path to company_names.json
        """
        if self._data_dir:
            return os.path.join(self._data_dir, 'company_names.json')

        # Default: relative to this file's location
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(base_dir, 'data', 'company_names.json')

    def _load_company_names(self) -> Dict:
        """
        Load company name mappings from JSON file.

        Returns:
            Dictionary mapping stock symbols to company names in multiple languages
        """
        if self._company_names is not None:
            return self._company_names

        try:
            json_path = self._get_json_path()
            with open(json_path, 'r', encoding='utf-8') as f:
                self._company_names = json.load(f)
            logger.info(f"Loaded {len(self._company_names)} company name mappings")
        except FileNotFoundError:
            logger.warning(f"Company names file not found: {json_path}")
            self._company_names = {}
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in company names file: {str(e)}")
            self._company_names = {}
        except Exception as e:
            logger.warning(f"Failed to load company names: {str(e)}")
            self._company_names = {}

        return self._company_names

    def get_company_name(
        self,
        symbol: str,
        ticker_info: Optional[Dict] = None
    ) -> Dict[str, Optional[str]]:
        """
        Get company name in multiple languages.

        Args:
            symbol: Stock ticker symbol
            ticker_info: Optional yfinance ticker info dict for fallback

        Returns:
            Dictionary with 'zh-TW' and 'en-US' company names.
            Values may be None if no name is found.

        Examples:
            >>> service = CompanyNameService()
            >>> name = service.get_company_name('AAPL')
            >>> print(name)
            {'zh-TW': '蘋果公司', 'en-US': 'Apple Inc.'}
        """
        # Normalize symbol to uppercase
        symbol = symbol.upper()

        # Load mappings
        mappings = self._load_company_names()

        # Check if we have a mapping for this symbol
        if symbol in mappings:
            return mappings[symbol]

        # Fallback to yfinance data for English name only
        result: Dict[str, Optional[str]] = {
            'zh-TW': None,
            'en-US': None
        }

        if ticker_info:
            # Try different name fields from yfinance
            result['en-US'] = (
                ticker_info.get('shortName') or
                ticker_info.get('longName') or
                ticker_info.get('displayName')
            )

        return result

    def has_mapping(self, symbol: str) -> bool:
        """
        Check if a symbol has a predefined name mapping.

        Args:
            symbol: Stock ticker symbol

        Returns:
            True if the symbol has a mapping in the JSON file
        """
        mappings = self._load_company_names()
        return symbol.upper() in mappings

    def get_all_mapped_symbols(self) -> list:
        """
        Get all symbols that have name mappings.

        Returns:
            List of stock symbols with predefined name mappings
        """
        mappings = self._load_company_names()
        return list(mappings.keys())
