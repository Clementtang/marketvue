"""
Tests for CompanyNameService.
"""

import pytest
from unittest.mock import patch, mock_open
import json
from services.company_name_service import CompanyNameService


class TestCompanyNameService:
    """Tests for company name resolution functionality."""

    def setup_method(self):
        """Set up test fixtures."""
        self.service = CompanyNameService()
        # Reset cached names for each test
        self.service._company_names = None

    def test_get_company_name_with_mapping(self):
        """Test getting company name from predefined mapping."""
        mock_data = {
            "AAPL": {
                "zh-TW": "蘋果公司",
                "en-US": "Apple Inc."
            }
        }

        with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):
            result = self.service.get_company_name("AAPL")

        assert result["zh-TW"] == "蘋果公司"
        assert result["en-US"] == "Apple Inc."

    def test_get_company_name_case_insensitive(self):
        """Test that symbol lookup is case insensitive."""
        mock_data = {
            "AAPL": {
                "zh-TW": "蘋果公司",
                "en-US": "Apple Inc."
            }
        }

        with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):
            result = self.service.get_company_name("aapl")

        assert result["zh-TW"] == "蘋果公司"
        assert result["en-US"] == "Apple Inc."

    def test_get_company_name_fallback_to_ticker_info(self):
        """Test fallback to yfinance ticker info."""
        mock_data = {}  # No mapping

        ticker_info = {
            "shortName": "Unknown Corp",
            "longName": "Unknown Corporation Inc."
        }

        with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):
            result = self.service.get_company_name("XYZ", ticker_info)

        assert result["zh-TW"] is None
        assert result["en-US"] == "Unknown Corp"

    def test_get_company_name_no_mapping_no_info(self):
        """Test when no mapping and no ticker info available."""
        mock_data = {}

        with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):
            result = self.service.get_company_name("XYZ")

        assert result["zh-TW"] is None
        assert result["en-US"] is None

    def test_get_company_name_file_not_found(self):
        """Test graceful handling of missing file."""
        with patch("builtins.open", side_effect=FileNotFoundError()):
            result = self.service.get_company_name("AAPL")

        assert result["zh-TW"] is None
        assert result["en-US"] is None

    def test_get_company_name_invalid_json(self):
        """Test graceful handling of invalid JSON."""
        with patch("builtins.open", mock_open(read_data="invalid json")):
            result = self.service.get_company_name("AAPL")

        assert result["zh-TW"] is None
        assert result["en-US"] is None

    def test_has_mapping_true(self):
        """Test has_mapping returns True for known symbol."""
        mock_data = {
            "AAPL": {
                "zh-TW": "蘋果公司",
                "en-US": "Apple Inc."
            }
        }

        with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):
            assert self.service.has_mapping("AAPL") is True

    def test_has_mapping_false(self):
        """Test has_mapping returns False for unknown symbol."""
        mock_data = {
            "AAPL": {
                "zh-TW": "蘋果公司",
                "en-US": "Apple Inc."
            }
        }

        with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):
            assert self.service.has_mapping("XYZ") is False

    def test_get_all_mapped_symbols(self):
        """Test getting all mapped symbols."""
        mock_data = {
            "AAPL": {"zh-TW": "蘋果公司", "en-US": "Apple Inc."},
            "GOOGL": {"zh-TW": "Google", "en-US": "Alphabet Inc."},
            "MSFT": {"zh-TW": "微軟", "en-US": "Microsoft Corporation"},
        }

        with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):
            symbols = self.service.get_all_mapped_symbols()

        assert len(symbols) == 3
        assert "AAPL" in symbols
        assert "GOOGL" in symbols
        assert "MSFT" in symbols

    def test_caching_behavior(self):
        """Test that company names are cached after first load."""
        mock_data = {"AAPL": {"zh-TW": "蘋果公司", "en-US": "Apple Inc."}}

        with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))) as m:
            # First call - should load from file
            self.service.get_company_name("AAPL")
            # Second call - should use cache
            self.service.get_company_name("AAPL")

            # File should only be opened once
            assert m.call_count == 1
