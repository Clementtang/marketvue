# Day 1 任務清單（方案 A）

**日期**: 2025-11-12 (週二)
**工作時間**: 10 小時
**目標**: 前端效能優化 + Routes 測試開始

---

## ⏰ 時間規劃

```
09:00-09:30  準備與設定 (30m)
09:30-12:00  StockCard 優化 (2.5h)
12:00-13:00  午休
13:00-14:00  DashboardGrid + CandlestickChart (1h)
14:00-18:00  Routes 測試實作 (4h)
18:00-19:00  文檔與提交 (1h)
```

---

## 📋 詳細任務清單

### Phase 1: 準備 (30 分鐘)

- [ ] **環境檢查**
  - [ ] `git pull origin main`
  - [ ] `cd frontend && npm install`
  - [ ] `cd backend && source venv/bin/activate`
  - [ ] `npm run dev` 測試前端啟動
  - [ ] `python -m pytest` 測試後端測試

- [ ] **工具準備**
  - [ ] 安裝 React DevTools（如未安裝）
  - [ ] 打開 VSCode
  - [ ] 準備番茄鐘計時器

---

### Phase 2: StockCard 優化 (2.5 小時)

#### 步驟 1: 添加 Hook 導入 (5 分鐘)
```typescript
// src/components/StockCard.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
```

#### 步驟 2: useCallback 優化 (1 小時)

- [ ] **calculateMA 包裝**
  ```typescript
  const calculateMA = useCallback((data: StockDataPoint[], period: number): StockDataPoint[] => {
    return data.map((point, index) => {
      if (index < period - 1) {
        return { ...point };
      }
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, p) => acc + p.close, 0);
      const ma = sum / period;
      return {
        ...point,
        [`ma${period}`]: ma,
      };
    });
  }, []);
  ```

- [ ] **fetchStockData 包裝**
  ```typescript
  const fetchStockData = useCallback(async (isRetry = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(/* ... */);
      let processedData = response.data.data;
      processedData = calculateMA(processedData, 20);
      processedData = calculateMA(processedData, 60);
      setStockData({
        ...response.data,
        data: processedData,
      });
      setRetryCount(0);
    } catch (err: any) {
      // 錯誤處理...
    } finally {
      setLoading(false);
    }
  }, [symbol, startDate, endDate, calculateMA]);
  ```

- [ ] **handleRetry 包裝**
  ```typescript
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchStockData();
  }, [fetchStockData]);
  ```

- [ ] **CustomTooltip 包裝**
  ```typescript
  const CustomTooltip = useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 ...">
          {/* Tooltip 內容 */}
        </div>
      );
    }
    return null;
  }, [t, language]); // 添加依賴
  ```

#### 步驟 3: useMemo 優化 (1 小時)

- [ ] **displayName**
  ```typescript
  const displayName = useMemo(() => {
    if (!stockData || !stockData.company_name) {
      return stockData?.symbol || symbol;
    }

    const companyName = language === 'zh-TW'
      ? stockData.company_name['zh-TW']
      : stockData.company_name['en-US'];

    if (companyName) {
      return `${companyName} (${stockData.symbol})`;
    }

    return stockData.symbol;
  }, [stockData, language, symbol]);
  ```

- [ ] **priceInfo**
  ```typescript
  const priceInfo = useMemo(() => {
    if (!stockData) return null;

    const isPositive = (stockData.change ?? 0) >= 0;
    const upColor = isPositive ? colorTheme.up : colorTheme.down;

    return { isPositive, upColor };
  }, [stockData, colorTheme]);
  ```

- [ ] **averageVolume**
  ```typescript
  const averageVolume = useMemo(() => {
    if (!stockData || stockData.data.length === 0) {
      return 'N/A';
    }

    const sum = stockData.data.reduce((acc, d) => acc + d.volume, 0);
    const avg = Math.round(sum / stockData.data.length);
    return avg.toLocaleString();
  }, [stockData]);
  ```

#### 步驟 4: 更新 JSX 使用優化值 (20 分鐘)

- [ ] 移除 `getDisplayName()` 函數定義
- [ ] 更新 JSX:
  ```typescript
  <h3 title={displayName}>{displayName}</h3>

  <span style={{ color: priceInfo?.upColor }}>
    {priceInfo?.isPositive ? '▲' : '▼'}
  </span>

  <p>{averageVolume}</p>
  ```

#### 步驟 5: 測試 StockCard (10 分鐘)

- [ ] 瀏覽器打開應用
- [ ] 測試添加股票
- [ ] 測試刪除股票
- [ ] 測試時間範圍切換
- [ ] 確認無錯誤

---

### Phase 3: DashboardGrid + CandlestickChart (1 小時)

#### DashboardGrid 優化 (30 分鐘)

- [ ] **updateWidth useCallback**
  ```typescript
  const updateWidth = useCallback(() => {
    const container = document.getElementById('grid-container');
    if (container && container.offsetWidth > 0) {
      setContainerWidth(container.offsetWidth);
    }
  }, []);
  ```

- [ ] **handleLayoutChange useCallback**
  ```typescript
  const handleLayoutChange = useCallback((newLayout: GridLayout.Layout[]) => {
    if (newLayout.length >= 3) {
      const allAtXZero = newLayout.filter(item => item.x === 0).length === newLayout.length;

      if (allAtXZero) {
        const fixedLayout = newLayout.map((item, index) => ({
          ...item,
          x: index % 3,
          y: Math.floor(index / 3),
        }));
        setLayout(fixedLayout);
        localStorage.setItem('dashboard-layout', JSON.stringify(fixedLayout));
        return;
      }
    }

    setLayout(newLayout);
    localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
  }, []);
  ```

#### CandlestickChart 優化 (30 分鐘)

- [ ] **priceRangeInfo useMemo**
  ```typescript
  const priceRangeInfo = useMemo(() => {
    const minLow = Math.min(...data.map(d => d.low));
    const maxHigh = Math.max(...data.map(d => d.high));
    const domainMin = minLow * 0.995;
    const domainMax = maxHigh * 1.005;
    const priceRange = domainMax - domainMin;

    return { minLow, maxHigh, domainMin, domainMax, priceRange };
  }, [data]);

  const { domainMin, domainMax, priceRange } = priceRangeInfo;
  ```

---

### Phase 4: 效能測試 (30 分鐘)

- [ ] **React DevTools Profiler 測試**
  1. 開啟 Chrome DevTools → Profiler
  2. 點擊 Record 🔴
  3. 執行以下操作：
     - 添加 3 個股票
     - 切換主題
     - 切換語言
     - 改變時間範圍
  4. 停止 Record ⏹
  5. 查看 Flamegraph
  6. 記錄 re-render 次數

- [ ] **記錄改善數據**
  ```
  改善前：
  - 添加股票 re-renders: ?
  - 主題切換 re-renders: ?
  - 語言切換 re-renders: ?

  改善後：
  - 添加股票 re-renders: ?
  - 主題切換 re-renders: ?
  - 語言切換 re-renders: ?

  改善率: ?%
  ```

- [ ] **回歸測試**
  - [ ] 所有功能正常
  - [ ] 無視覺問題
  - [ ] 無 console 錯誤

---

### Phase 5: Routes 測試開始 (4 小時)

#### 步驟 1: 建立測試檔案 (15 分鐘)

```bash
cd backend/tests
touch test_stock_routes.py
```

#### 步驟 2: 導入與 Fixtures (15 分鐘)

```python
# backend/tests/test_stock_routes.py
import pytest
from unittest.mock import patch, MagicMock
from app import app
from services.stock_service import StockService

@pytest.fixture
def client():
    """Flask test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client
```

#### 步驟 3: 實作 8 個測試 (3 小時)

- [ ] **test_get_stock_endpoint_success**
  ```python
  def test_get_stock_endpoint_success(client, mock_yfinance_ticker):
      """測試股票數據端點成功"""
      with patch('yfinance.Ticker', return_value=mock_yfinance_ticker):
          response = client.post('/api/stock-data', json={
              'symbol': 'AAPL',
              'start_date': '2025-01-01',
              'end_date': '2025-01-05'
          })

          assert response.status_code == 200
          data = response.get_json()
          assert data['success'] is True
          assert data['symbol'] == 'AAPL'
          assert len(data['data']) == 5
  ```

- [ ] **test_get_stock_endpoint_invalid_symbol**
- [ ] **test_batch_stocks_endpoint_success**
- [ ] **test_batch_stocks_partial_failure**
- [ ] **test_batch_stocks_empty_list**
- [ ] **test_error_handling_404**
- [ ] **test_error_handling_500**
- [ ] **test_cors_headers**

#### 步驟 4: 運行測試 (30 分鐘)

```bash
cd backend
pytest tests/test_stock_routes.py -v
```

- [ ] 修復失敗的測試
- [ ] 確保所有測試通過
- [ ] 檢查覆蓋率

---

### Phase 6: 文檔與提交 (1 小時)

#### Day 1 完成報告 (30 分鐘)

```markdown
# Day 1 完成報告（方案 A）

**日期**: 2025-11-12
**狀態**: ✅ 完成
**工作時間**: 10 小時

## 完成項目

### 前端效能優化
- ✅ StockCard 優化（4 useCallback, 3 useMemo）
- ✅ DashboardGrid 優化（2 useCallback）
- ✅ CandlestickChart 優化（1 useMemo）

### 效能改善
- Re-renders 減少：?%
- StockCard 渲染時間：-?%
- 測試：React DevTools Profiler 驗證

### Routes 測試
- ✅ 8 個 Routes 測試實作
- ✅ 測試全部通過
- 整體測試：32 → 40 個

## 遇到的問題
1. [記錄問題]
2. [解決方案]

## 明日計劃
Day 2: 完成 Phase 1（測試覆蓋率 70% + CI/CD）
```

#### Git 提交 (30 分鐘)

```bash
# 前端優化 commit
git add src/components/StockCard.tsx src/components/DashboardGrid.tsx src/components/CandlestickChart.tsx
git commit -m "perf: optimize React components with useCallback and useMemo

Optimizations:
- StockCard: 4 useCallback, 3 useMemo
- DashboardGrid: 2 useCallback
- CandlestickChart: 1 useMemo

Performance improvement: -X% re-renders
Tested with React DevTools Profiler
"

# Routes 測試 commit
git add backend/tests/test_stock_routes.py
git commit -m "test: add 8 Routes tests for stock API endpoints

Tests added:
- GET /api/stock-data success
- Invalid symbol handling
- Batch stocks endpoint
- Partial failures
- Empty list handling
- Error responses (404, 500)
- CORS headers

All tests passing (32 → 40 total)
"

git push origin <branch-name>
```

---

## ✅ Day 1 驗收標準

完成以下所有項目才算完成 Day 1：

- [ ] **前端優化**
  - [ ] StockCard re-renders 減少 ≥ 30%
  - [ ] 所有優化已實作
  - [ ] React DevTools 測試完成

- [ ] **Routes 測試**
  - [ ] 8 個測試全部通過
  - [ ] 總測試數 ≥ 40

- [ ] **品質保證**
  - [ ] 無功能回歸
  - [ ] 無視覺問題
  - [ ] 無 console 錯誤

- [ ] **文檔與提交**
  - [ ] Day 1 完成報告撰寫
  - [ ] Git commits 已推送

---

## 💡 執行技巧

### 時間管理
- 🍅 使用番茄鐘（25 分鐘工作 + 5 分鐘休息）
- ⏰ 嚴格按時間表執行
- 🚫 避免完美主義（先完成，再完美）

### 測試策略
- 每完成一個優化立即測試
- 發現問題立即修復
- 保持測試覆蓋率

### 當遇到問題
1. 先搜尋錯誤訊息
2. 檢查相關文檔
3. 嘗試簡化問題
4. 記錄問題和解決方案

### 休息時間
- 中午 12:00-13:00 必須休息
- 每 2 小時起來走動
- 保持水分充足

---

## 🎯 成功要素

1. **專注**: 關閉無關通知
2. **節奏**: 保持穩定工作節奏
3. **測試**: 每個變更立即驗證
4. **記錄**: 記錄進度和問題
5. **品質**: 不妥協代碼品質

---

**開始時間**: 09:00
**預計結束**: 19:00
**實際工作**: 10 小時

**準備好了嗎？讓我們開始 Day 1！** 🚀
