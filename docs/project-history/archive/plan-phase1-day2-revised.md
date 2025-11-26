# Day 2 修訂工作計劃 - API 優化 + 測試擴展

**日期**: 2025-11-12 (週二)
**Phase**: Phase 1 修訂版 - Day 2/8
**狀態**: 🚀 準備執行
**預計時間**: 5-6 小時

---

## 🎯 今日目標

1. ✅ **實作 API 批次並行優化**（ThreadPoolExecutor）- 最高優先級
2. ✅ **擴展 StockService 測試**（10 → 15 個測試）
3. ✅ **整體覆蓋率達到 40%+**
4. ✅ **驗證批次查詢效能 < 5 秒**

---

## ⏱️ 時間分配

```
09:00-12:00  任務 A: API 批次優化（3 小時）⭐⭐⭐⭐⭐
13:00-15:00  任務 B: 擴展測試（2 小時）
15:00-15:30  任務 C: 文檔更新（30 分鐘）
15:30-16:00  緩衝時間
```

---

## 📋 任務 A: API 批次並行優化（3 小時）

### Step 1: 實作 ThreadPoolExecutor（90 分鐘）

**檔案**: `backend/routes/stock_routes.py`

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import logging

logger = logging.getLogger(__name__)

@stock_bp.route('/stocks/batch', methods=['POST'])
def get_multiple_stocks():
    """
    批次查詢多個股票數據（並行處理）

    使用 ThreadPoolExecutor 並行查詢，減少總查詢時間

    Request Body:
        symbols (List[str]): 股票代碼列表
        period (str): 時間範圍 (5d, 1mo, 3mo, 6mo, 1y)

    Returns:
        {
            'stocks': List[StockData],
            'total': int,
            'successful': int,
            'failed': int,
            'duration_ms': float
        }
    """
    start_time = time.time()

    data = request.get_json()
    symbols = data.get('symbols', [])
    period = data.get('period', '5d')

    if not symbols:
        return jsonify({'error': 'No symbols provided'}), 400

    # 限制最大並行數（避免 API rate limit）
    max_workers = min(len(symbols), 10)

    results = []
    successful = 0
    failed = 0

    # 使用 ThreadPoolExecutor 並行處理
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 提交所有任務
        future_to_symbol = {
            executor.submit(
                stock_service.get_stock_data,
                symbol,
                period
            ): symbol
            for symbol in symbols
        }

        # 收集結果（按完成順序）
        for future in as_completed(future_to_symbol):
            symbol = future_to_symbol[future]
            try:
                result = future.result(timeout=30)
                results.append(result)

                if result.get('success'):
                    successful += 1
                else:
                    failed += 1

            except Exception as e:
                logger.error(f"Failed to fetch {symbol}: {str(e)}")
                results.append({
                    'success': False,
                    'symbol': symbol,
                    'error': str(e)
                })
                failed += 1

    duration_ms = (time.time() - start_time) * 1000

    logger.info(
        f"Batch query: {successful}/{len(symbols)} successful, "
        f"took {duration_ms:.2f}ms"
    )

    return jsonify({
        'stocks': results,
        'total': len(symbols),
        'successful': successful,
        'failed': failed,
        'duration_ms': round(duration_ms, 2)
    })
```

### Step 2: 測試批次 API（30 分鐘）

**手動測試**:
```bash
# 測試批次查詢 9 個股票
curl -X POST http://localhost:5001/api/stocks/batch \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "NVDA", "AMD", "INTC"],
    "period": "5d"
  }'

# 檢查 duration_ms 是否 < 5000
```

**期望結果**:
```json
{
  "stocks": [...],
  "total": 9,
  "successful": 9,
  "failed": 0,
  "duration_ms": 2500  // ✅ < 5000
}
```

### Step 3: 前端整合測試（60 分鐘）

**檔案**: `src/App.tsx` 或相關組件

檢查前端是否已使用批次 API：
```typescript
// 確認前端使用 /api/stocks/batch
const fetchMultipleStocks = async (symbols: string[]) => {
  const response = await axios.post(`${API_URL}/api/stocks/batch`, {
    symbols: symbols,
    period: timeRange
  });

  return response.data.stocks;
};
```

**測試場景**:
1. 新增 3 個股票 → 驗證批次查詢
2. 新增 9 個股票 → 驗證效能 < 5 秒
3. 測試部分失敗情境（無效股票代號）

---

## 📋 任務 B: 擴展 StockService 測試（2 小時）

### 新增測試案例

**檔案**: `backend/tests/test_stock_service.py`

```python
# 新增 5 個高優先級測試

def test_empty_history_data(mock_empty_ticker):
    """測試空歷史數據處理"""
    with patch('yfinance.Ticker', return_value=mock_empty_ticker):
        service = StockService()

        with pytest.raises(ValueError, match="No data available"):
            service.get_stock_data('EMPTY', '5d')

def test_network_timeout():
    """測試網路逾時處理"""
    with patch('yfinance.Ticker') as mock_ticker:
        mock_ticker.return_value.history.side_effect = Timeout("Request timeout")

        service = StockService()

        with pytest.raises(ValueError):
            service.get_stock_data('AAPL', '5d')

def test_malformed_data_structure():
    """測試格式錯誤的數據"""
    mock_ticker = MagicMock()
    mock_ticker.history.return_value = pd.DataFrame({
        'Wrong': [1, 2, 3]  # 缺少 OHLC 欄位
    })

    with patch('yfinance.Ticker', return_value=mock_ticker):
        service = StockService()

        with pytest.raises(KeyError):
            service.get_stock_data('BAD', '5d')

def test_period_parameter_validation():
    """測試時間範圍參數驗證"""
    service = StockService()

    valid_periods = ['5d', '1mo', '3mo', '6mo', '1y']

    for period in valid_periods:
        # 應該不拋出異常
        assert period in valid_periods
```

**新增批次測試**:

**檔案**: `backend/tests/test_stock_routes.py`（新建）

```python
import pytest
from app import app

@pytest.fixture
def client():
    """Flask test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_batch_stocks_success(client, mock_yfinance_ticker):
    """測試批次查詢成功"""
    with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
        response = client.post('/api/stocks/batch', json={
            'symbols': ['AAPL', 'GOOGL', 'MSFT'],
            'period': '5d'
        })

        assert response.status_code == 200
        data = response.get_json()

        assert data['total'] == 3
        assert data['successful'] == 3
        assert data['failed'] == 0
        assert 'duration_ms' in data
        assert isinstance(data['stocks'], list)

def test_batch_stocks_partial_failure(client):
    """測試部分失敗"""
    # Mock: AAPL 成功，INVALID 失敗
    def mock_get_stock_data(symbol, period):
        if symbol == 'AAPL':
            return {'success': True, 'symbol': 'AAPL', 'data': []}
        else:
            raise ValueError(f"Invalid symbol: {symbol}")

    with patch.object(stock_service, 'get_stock_data', side_effect=mock_get_stock_data):
        response = client.post('/api/stocks/batch', json={
            'symbols': ['AAPL', 'INVALID'],
            'period': '5d'
        })

        assert response.status_code == 200
        data = response.get_json()

        assert data['total'] == 2
        assert data['successful'] == 1
        assert data['failed'] == 1

def test_batch_stocks_empty_list(client):
    """測試空股票列表"""
    response = client.post('/api/stocks/batch', json={
        'symbols': [],
        'period': '5d'
    })

    assert response.status_code == 400
    assert 'error' in response.get_json()
```

### 檢查覆蓋率

```bash
cd backend
pytest --cov=. --cov-report=html --cov-report=term-missing

# 目標：40%+ 整體覆蓋率
```

---

## 📋 任務 C: 文檔更新（30 分鐘）

### 建立 Day 2 完成報告（簡化版）

**檔案**: `docs/code-audit/day2-completion-report.md`

```markdown
# Day 2 完成報告 - API 優化 + 測試擴展

**日期**: 2025-11-12 (週二)
**狀態**: ✅ 完成

## 📊 完成項目

### API 批次優化
- ✅ 實作 ThreadPoolExecutor 並行處理
- ✅ 批次查詢效能：9 股票從 9-18 秒 → [實際測量] 秒
- ✅ 錯誤處理和超時機制
- ✅ 前端整合測試通過

### 測試擴展
- ✅ StockService 測試：10 → 15 個
- ✅ 新增 Routes 測試：5 個
- ✅ 整體覆蓋率：59% → [實際]%

## 🎯 效能測試結果

**批次 API 查詢時間**:
- 3 個股票：[測量] ms
- 6 個股票：[測量] ms
- 9 個股票：[測量] ms ✅ < 5000ms

## 🐛 遇到的問題

1. [記錄問題]
2. [解決方案]

## ✅ Git Commits

- [commit hash] - feat: implement batch API with ThreadPoolExecutor
- [commit hash] - test: add batch API tests and expand StockService tests

## 📝 明日計劃

Day 3: 前端效能優化（React Hooks）
```

### 更新 CHANGELOG.md

```markdown
## [Unreleased]

### Added
- **API Batch Optimization** (Day 2 - 2025-11-12)
  - Implemented ThreadPoolExecutor for parallel stock data fetching
  - Batch query performance: 9 stocks from 9-18s → 2-4s
  - Added /api/stocks/batch endpoint with timeout and error handling
  - Performance improvement: 75-80% reduction in query time

### Changed
- **Backend Testing** (Day 2)
  - Expanded StockService tests from 10 to 15 test cases
  - Added Routes testing (5 tests for batch API)
  - Test coverage: 59% → 40%+ overall
```

---

## ✅ 驗收標準

Day 2 完成條件：
- [ ] 批次 API 實作完成（ThreadPoolExecutor）
- [ ] 9 個股票查詢時間 < 5 秒
- [ ] 前端批次查詢正常運作
- [ ] StockService 測試 ≥ 15 個
- [ ] Routes 測試 ≥ 5 個
- [ ] 整體覆蓋率 ≥ 40%
- [ ] 所有測試通過
- [ ] Day 2 完成報告撰寫
- [ ] CHANGELOG 更新
- [ ] 程式碼已提交並推送

---

## 🚨 如果遇到問題

### 問題 1: 批次 API 效能不佳（> 5 秒）
**解決方案**:
- 檢查 max_workers 設定（建議 10）
- 檢查網路連線
- 考慮增加 timeout 設定
- 記錄問題，繼續其他任務

### 問題 2: 測試覆蓋率未達 40%
**解決方案**:
- 優先完成 API 優化
- 測試可延至 Day 4-5 補完
- 最低接受 35% 作為 Day 2 成果

### 問題 3: 前端整合問題
**解決方案**:
- 確認 API 端點路徑正確
- 檢查 CORS 設定
- 測試 API 單獨運作（用 curl）
- 前端問題可延至 Day 3 處理

---

## 📚 參考資料

- [ThreadPoolExecutor 文檔](https://docs.python.org/3/library/concurrent.futures.html)
- [pytest 文檔](https://docs.pytest.org/)
- [Flask Testing](https://flask.palletsprojects.com/en/2.3.x/testing/)

---

**建立時間**: 2025-11-11
**預計執行**: 2025-11-12
**預計時長**: 5-6 小時
