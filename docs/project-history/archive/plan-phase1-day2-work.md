# Day 2 Work Plan - StockService Test Expansion

**Date**: 2025-11-11 (Monday)
**Phase**: Phase 1 - Performance & Stability
**Status**: 🚀 Ready to Start
**Estimated Duration**: 3-4 hours

---

## 📋 Goals for Day 2

Based on [phase1-execution-plan.md](./phase1-execution-plan.md) and [Day 1 completion](./day1-completion-report.md):

### Primary Goals
1. ✅ Expand StockService test coverage from 70% to 85%+
2. ✅ Implement comprehensive yfinance mocking strategies
3. ✅ Test `get_batch_stocks()` method (if exists)
4. ✅ Add edge case testing (empty data, malformed responses, network issues)
5. ✅ Document testing patterns for team reference
6. ✅ Reach 60%+ overall project coverage (currently at 59%)

### Success Criteria
- [ ] StockService coverage: 70% → 85%+
- [ ] Overall project coverage: 59% → 60%+
- [ ] All edge cases tested
- [ ] No regression in existing tests
- [ ] Testing patterns documented
- [ ] Code committed and pushed

---

## 🎯 Task Breakdown

### Task 1: Expand StockService Tests (2 hours)

#### 1.1 Additional Test Cases to Implement

**Company Name Resolution** (expand existing coverage):
```python
- test_get_company_name_fallback_logic()
  # Test shortName → longName → None fallback chain

- test_get_company_name_info_access_error()
  # Test handling when ticker.info throws exception

- test_get_company_name_empty_info()
  # Test when ticker.info is empty dict
```

**Data Point Conversion** (expand existing coverage):
```python
- test_convert_to_data_points_with_nan_values()
  # Test handling of NaN/Inf values in DataFrame

- test_convert_to_data_points_date_formatting()
  # Test date format consistency across different timezones

- test_convert_to_data_points_volume_type_conversion()
  # Test proper int conversion for volume (no decimals)
```

**Error Handling** (new comprehensive tests):
```python
- test_empty_history_response()
  # When ticker.history() returns empty DataFrame

- test_none_history_response()
  # When ticker.history() returns None

- test_yfinance_timeout_error()
  # Simulate yfinance timeout exception

- test_yfinance_connection_error()
  # Simulate connection refused error

- test_malformed_data_structure()
  # Test handling of unexpected DataFrame structure
```

**Date Range Handling** (expand existing tests):
```python
- test_period_parameter_validation()
  # Test valid periods: '5d', '1mo', '3mo', '6mo', '1y'

- test_invalid_period_parameter()
  # Test handling of invalid period strings

- test_future_date_handling()
  # Test that future dates are handled gracefully

- test_weekend_date_handling()
  # Test weekend/holiday date adjustments
```

**Price and Volume Edge Cases**:
```python
- test_zero_volume_handling()
  # Test days with zero trading volume

- test_stock_split_price_adjustment()
  # Test data consistency across stock splits

- test_extreme_price_values()
  # Test very low prices (penny stocks) and very high prices

- test_negative_price_handling()
  # Test that negative prices (errors) are caught
```

#### 1.2 Implementation Priority

**High Priority** (Must have today):
1. Empty/None data responses (3 tests)
2. Network error handling (2 tests)
3. Data conversion edge cases (3 tests)
4. **Total**: 8 new tests

**Medium Priority** (Should have today):
1. Company name resolution edge cases (3 tests)
2. Date range validation (2 tests)
3. **Total**: 5 additional tests

**Low Priority** (Nice to have):
1. Price/volume edge cases (4 tests)
2. Stock split handling (1 test)

**Target**: Implement 13-15 new tests today

---

### Task 2: Mock Strategy Improvements (45 minutes)

#### 2.1 Create Additional Mock Fixtures

**Location**: `backend/tests/conftest.py`

```python
@pytest.fixture
def mock_empty_ticker():
    """Mock ticker with empty history (no data available)"""
    mock_ticker = MagicMock()
    mock_ticker.history.return_value = pd.DataFrame()
    mock_ticker.info = {}
    return mock_ticker

@pytest.fixture
def mock_none_ticker():
    """Mock ticker that returns None (API failure)"""
    mock_ticker = MagicMock()
    mock_ticker.history.return_value = None
    mock_ticker.info = None
    return mock_ticker

@pytest.fixture
def mock_malformed_ticker():
    """Mock ticker with malformed data structure"""
    mock_ticker = MagicMock()
    # Missing required columns
    mock_ticker.history.return_value = pd.DataFrame({
        'Date': ['2025-01-01'],
        'Price': [100]  # Missing Open, High, Low, Close, Volume
    })
    mock_ticker.info = {}
    return mock_ticker

@pytest.fixture
def mock_nan_ticker():
    """Mock ticker with NaN/Inf values"""
    mock_ticker = MagicMock()
    mock_ticker.history.return_value = pd.DataFrame({
        'Open': [100, np.nan, 102],
        'High': [105, 106, np.inf],
        'Low': [98, 99, -np.inf],
        'Close': [103, np.nan, 105],
        'Volume': [1000000, 0, 1200000]
    })
    mock_ticker.info = {'shortName': 'Test Stock'}
    return mock_ticker

@pytest.fixture
def mock_network_error():
    """Mock network timeout/connection error"""
    mock_ticker = MagicMock()
    mock_ticker.history.side_effect = requests.exceptions.Timeout(
        "Connection timeout"
    )
    return mock_ticker

@pytest.fixture
def mock_large_dataset_ticker():
    """Mock ticker with 1 year of data (252 trading days)"""
    dates = pd.date_range(start='2024-01-01', periods=252, freq='B')
    mock_ticker = MagicMock()
    mock_ticker.history.return_value = pd.DataFrame({
        'Open': np.random.uniform(95, 105, 252),
        'High': np.random.uniform(100, 110, 252),
        'Low': np.random.uniform(90, 100, 252),
        'Close': np.random.uniform(95, 105, 252),
        'Volume': np.random.randint(500000, 2000000, 252)
    }, index=dates)
    mock_ticker.info = {'shortName': 'Large Dataset Stock'}
    return mock_ticker
```

#### 2.2 Create Helper Functions

```python
# tests/helpers.py (new file)
import pandas as pd
import numpy as np
from typing import Dict, Any

def create_mock_ticker_data(
    days: int = 5,
    base_price: float = 100.0,
    volatility: float = 0.02,
    include_nan: bool = False
) -> pd.DataFrame:
    """
    Create mock stock data for testing

    Args:
        days: Number of days of data
        base_price: Starting price
        volatility: Price volatility (0.02 = 2%)
        include_nan: Whether to include NaN values

    Returns:
        DataFrame with OHLCV data
    """
    data = {
        'Open': [],
        'High': [],
        'Low': [],
        'Close': [],
        'Volume': []
    }

    current_price = base_price

    for i in range(days):
        change = np.random.uniform(-volatility, volatility)
        open_price = current_price
        close_price = current_price * (1 + change)
        high_price = max(open_price, close_price) * 1.01
        low_price = min(open_price, close_price) * 0.99
        volume = np.random.randint(500000, 2000000)

        if include_nan and i == days // 2:
            close_price = np.nan

        data['Open'].append(open_price)
        data['High'].append(high_price)
        data['Low'].append(low_price)
        data['Close'].append(close_price)
        data['Volume'].append(volume)

        current_price = close_price if not np.isnan(close_price) else current_price

    return pd.DataFrame(data)

def assert_stock_data_valid(data: Dict[str, Any]) -> None:
    """
    Validate stock data structure

    Args:
        data: Stock data dictionary from service

    Raises:
        AssertionError if data is invalid
    """
    assert 'symbol' in data
    assert 'data' in data
    assert isinstance(data['data'], list)

    for point in data['data']:
        assert 'date' in point
        assert 'open' in point
        assert 'high' in point
        assert 'low' in point
        assert 'close' in point
        assert 'volume' in point

        # Price validation
        assert point['high'] >= point['low']
        assert point['high'] >= point['open']
        assert point['high'] >= point['close']
        assert point['low'] <= point['open']
        assert point['low'] <= point['close']

        # Volume validation
        assert point['volume'] >= 0
        assert isinstance(point['volume'], int)
```

---

### Task 3: Test Batch Operations (1 hour)

#### 3.1 Investigate Batch Operations

**Action Items**:
1. Check if `get_batch_stocks()` method exists in `services/stock_service.py`
2. Check if `/api/stocks/batch` endpoint exists in `routes/stock_routes.py`
3. If exists: Write comprehensive tests
4. If not exists: Note for Phase 1 Day 6 (API optimization day)

#### 3.2 Batch Operation Tests (if method exists)

```python
# tests/test_stock_service_batch.py (new file)
import pytest
from unittest.mock import patch
from services.stock_service import StockService

class TestBatchOperations:
    """Test cases for batch stock data retrieval"""

    def test_get_batch_stocks_success(self, mock_yfinance_ticker):
        """Test successful batch retrieval"""
        symbols = ['AAPL', 'GOOGL', 'MSFT']

        with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
            service = StockService()
            results = service.get_batch_stocks(symbols, '5d')

            assert len(results) == 3
            assert all(r['success'] for r in results)

    def test_get_batch_stocks_partial_failure(self):
        """Test batch with some failures"""
        # Test mixed success/failure scenarios
        pass

    def test_get_batch_stocks_empty_list(self):
        """Test with empty symbols list"""
        pass

    def test_get_batch_stocks_duplicate_symbols(self):
        """Test handling of duplicate symbols"""
        pass
```

---

### Task 4: Documentation (30 minutes)

#### 4.1 Create Testing Patterns Guide

**File**: `docs/testing-guide.md`

**Content**:
- How to write StockService tests
- Mock fixture usage examples
- Common testing patterns
- Edge cases to consider
- Running tests locally
- Interpreting coverage reports

#### 4.2 Update Day 2 Completion Report

**File**: `docs/code-audit/day2-completion-report.md`

**Sections**:
- Tasks completed
- Tests added (count and list)
- Coverage achieved
- Challenges encountered
- Solutions applied
- Next steps (Day 3)

---

## 📊 Coverage Targets

### Current State (Day 1)
```
services/stock_service.py:  70% ✅
Overall coverage:           59% ✅
```

### Target State (End of Day 2)
```
services/stock_service.py:  85% 🎯 (+15%)
Overall coverage:           60% 🎯 (+1%)
```

### How to Check Coverage

```bash
cd backend

# Run all tests with coverage
pytest --cov=. --cov-report=html --cov-report=term-missing

# Run only StockService tests
pytest tests/test_stock_service.py -v --cov=services/stock_service

# Open HTML report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

---

## 🚨 Risk Assessment

### Potential Issues

1. **Unknown Code Structure**
   - Risk: StockService implementation may differ from expectations
   - Mitigation: Read actual implementation first before writing tests

2. **Complex Edge Cases**
   - Risk: yfinance may have undocumented behaviors
   - Mitigation: Focus on observable behaviors, not implementation details

3. **Time Constraints**
   - Risk: 15 new tests may be ambitious for 3-4 hours
   - Mitigation: Prioritize high/medium priority tests, defer low priority to Day 3

### Contingency Plan

If falling behind schedule:
- ✅ Complete at least 8 high-priority tests
- ✅ Achieve minimum 80% StockService coverage
- ⏭️ Defer documentation to end of day or Day 3 morning
- ⏭️ Defer low-priority edge case tests to Day 3

---

## 📝 Execution Checklist

### Morning (9:00 AM - 12:00 PM)

- [ ] **Setup** (15 min)
  - [ ] git pull origin main
  - [ ] cd backend && source venv/bin/activate
  - [ ] pytest (verify all existing tests pass)
  - [ ] Read `services/stock_service.py` implementation

- [ ] **Read StockService Implementation** (30 min)
  - [ ] Understand actual API signatures
  - [ ] Identify all public methods
  - [ ] Note edge cases from implementation
  - [ ] Check if `get_batch_stocks()` exists

- [ ] **Implement High-Priority Tests** (90 min)
  - [ ] Empty/None data response tests (3 tests)
  - [ ] Network error handling tests (2 tests)
  - [ ] Data conversion edge cases (3 tests)
  - [ ] Run tests and verify they pass

- [ ] **Lunch Break** (12:00 PM - 1:00 PM)

### Afternoon (1:00 PM - 4:00 PM)

- [ ] **Implement Medium-Priority Tests** (60 min)
  - [ ] Company name resolution tests (3 tests)
  - [ ] Date range validation tests (2 tests)
  - [ ] Run tests and verify coverage improvement

- [ ] **Improve Mock Fixtures** (45 min)
  - [ ] Add 5 new fixtures to conftest.py
  - [ ] Create helpers.py with utility functions
  - [ ] Update existing tests to use new fixtures

- [ ] **Batch Operations** (30 min)
  - [ ] Investigate if batch method exists
  - [ ] Write basic batch tests (if applicable)
  - [ ] Or document need for Phase 1 Day 6

- [ ] **Documentation** (30 min)
  - [ ] Create testing-guide.md (or defer to Day 3)
  - [ ] Create day2-completion-report.md
  - [ ] Update CHANGELOG.md

- [ ] **Final Checks** (15 min)
  - [ ] Run full test suite
  - [ ] Check coverage report (target: 85% for StockService)
  - [ ] Git commit and push
  - [ ] Verify all tests pass in clean environment

---

## 🎯 Expected Outcomes

### Deliverables

1. **13-15 new test cases** in `test_stock_service.py`
2. **5 new mock fixtures** in `conftest.py`
3. **Helper utilities** in `tests/helpers.py`
4. **Testing guide** in `docs/testing-guide.md` (or defer to Day 3)
5. **Day 2 completion report** in `docs/code-audit/day2-completion-report.md`
6. **Updated CHANGELOG.md** with Day 2 achievements

### Metrics

- **Tests**: 10 → 23-25 tests (+13-15)
- **StockService Coverage**: 70% → 85%+ (+15%)
- **Overall Coverage**: 59% → 60%+ (+1%)
- **Time**: ~3-4 hours
- **Git Commits**: 2-3 commits (tests, docs, final)

---

## 🔄 Integration with Week 1 Plan

### Progress Tracking

**Week 1 Days 1-2**: Backend Testing Environment
- ✅ Day 1: Testing infrastructure (DONE)
- 🚀 Day 2: StockService expansion (TODAY)
- ⏭️ Day 3-4: Frontend performance optimization
- ⏭️ Day 5-7: Backend tests + API optimization

### Day 3 Preview

After completing Day 2, Day 3 will focus on:
- Frontend performance optimization
- Adding useCallback to StockCard
- Adding useMemo to expensive calculations
- React DevTools Profiler verification

---

## 📚 Reference Materials

### Documentation to Read
- `backend/services/stock_service.py` - Implementation
- `backend/tests/test_stock_service.py` - Existing tests
- `backend/tests/conftest.py` - Current fixtures
- [pytest Documentation](https://docs.pytest.org/)
- [unittest.mock Guide](https://docs.python.org/3/library/unittest.mock.html)

### Testing Best Practices
1. **AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test** (when possible)
3. **Descriptive test names** (test_method_scenario_expectedResult)
4. **Test behavior, not implementation**
5. **Use fixtures for shared setup**
6. **Mock external dependencies** (yfinance)

---

## ✅ Definition of Done

Day 2 is complete when:
- [ ] All high-priority tests implemented and passing
- [ ] StockService coverage ≥ 85%
- [ ] Overall project coverage ≥ 60%
- [ ] No regression in existing tests
- [ ] Mock fixtures improved and documented
- [ ] Day 2 completion report written
- [ ] CHANGELOG.md updated
- [ ] Code committed and pushed to GitHub
- [ ] Clean test run in fresh environment

---

**Document Created**: 2025-11-11 (Monday)
**Author**: MarketVue Team + Claude Code
**Status**: 📋 Ready for Execution
**Next**: Execute Day 2 tasks (3-4 hours)
**Follow-up**: Day 3 - Frontend Performance Optimization
