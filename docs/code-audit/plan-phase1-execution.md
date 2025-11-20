# Phase 1 執行計劃：效能優化與穩定性基礎

**階段目標**: 建立測試基礎設施 + 核心效能優化
**預計時間**: 2 週（10-12 個工作天）
**優先級**: P0 - 立即處理
**開始日期**: 2025-11-10
**目標完成**: 2025-11-24

---

## 📊 Phase 1 總覽

### 核心目標
1. ✅ **後端測試覆蓋率**: 0% → 70%+
2. ✅ **前端渲染效能**: 減少 30-50% 不必要的 re-renders
3. ✅ **API 查詢效能**: 9 個股票從 9-18 秒降至 2-4 秒
4. ✅ **代碼可維護性**: 拆分 360 行大組件，實作 Context API

### 工作量分配
| 任務 | 工作量 | 優先級 | 負責區域 |
|-----|--------|--------|---------|
| 建立測試覆蓋 (後端) | XL (16h) | ⭐⭐⭐⭐⭐ | Backend |
| 添加效能優化 Hooks | M (2-4h) | ⭐⭐⭐⭐⭐ | Frontend |
| 拆分 StockCard 組件 | L (4-8h) | ⭐⭐⭐⭐⭐ | Frontend |
| 優化批次查詢效能 | M (2-4h) | ⭐⭐⭐⭐⭐ | Backend |
| 實作 Context API | L (4-8h) | ⭐⭐⭐⭐ | Frontend |
| 添加 Type Hints | M (2-4h) | ⭐⭐⭐⭐ | Backend |

**總工作量**: 30-44 小時 (約 2 週)

---

## 🗓️ 兩週執行時間表

### Week 1: 測試基礎 + 前端效能 (Day 1-7)

#### Day 1-2: 後端測試環境建立
**目標**: 建立測試框架和基礎設施

**Day 1 (週日 2025-11-10)**
- [ ] 安裝測試依賴 (pytest, pytest-cov, pytest-mock)
- [ ] 建立測試目錄結構
- [ ] 設定 pytest.ini 配置
- [ ] 建立第一個測試範例
- [ ] 驗證測試可以運行

**Day 2 (週一 2025-11-11)**
- [ ] 建立 StockService 測試套件
- [ ] 實作 yfinance mock
- [ ] 撰寫基礎功能測試
- [ ] 達成 30% 覆蓋率

**產出**:
- `backend/tests/` 目錄結構
- `backend/pytest.ini`
- `backend/tests/test_stock_service.py`
- `backend/tests/conftest.py` (fixtures)

---

#### Day 3-4: 前端效能優化
**目標**: 添加 useCallback 和 useMemo

**Day 3 (週二 2025-11-12)**
- [ ] 審查所有組件的 re-render 問題
- [ ] 在 StockCard 添加 useCallback
  - fetchStockData
  - displayName 計算
- [ ] 在 StockCard 添加 useMemo
  - calculateMA
  - priceRange 計算
- [ ] 測試渲染次數減少

**Day 4 (週三 2025-11-13)**
- [ ] 在 DashboardGrid 添加 useCallback
  - handleLayoutChange
  - handleRemoveStock
- [ ] 在 CandlestickChart 添加 useMemo
  - 價格範圍計算
  - 數據轉換
- [ ] 使用 React DevTools Profiler 驗證改善
- [ ] 更新測試確保功能正常

**產出**:
- 更新的組件代碼
- 效能改善報告
- Before/After 截圖

---

#### Day 5-7: 後端測試擴展 + API 優化

**Day 5 (週四 2025-11-14)**
- [ ] 建立 routes 測試
- [ ] 測試 GET /api/stock/:symbol
- [ ] 測試 POST /api/stocks/batch
- [ ] 測試錯誤處理情境
- [ ] 達成 50% 覆蓋率

**Day 6 (週五 2025-11-15)**
- [ ] 實作 ThreadPoolExecutor 並行處理
- [ ] 優化批次查詢邏輯
- [ ] 建立效能基準測試
- [ ] 驗證 9 個股票查詢時間降至 2-4 秒

**Day 7 (週六 2025-11-16)**
- [ ] 完成剩餘測試 (utils, config)
- [ ] 達成 70% 覆蓋率目標
- [ ] 建立 CI 測試流程
- [ ] Week 1 總結報告

**產出**:
- 完整測試套件
- 優化的批次查詢代碼
- 效能基準報告
- Week 1 總結文檔

---

### Week 2: 架構重構 (Day 8-14)

#### Day 8-10: 拆分 StockCard 大組件

**Day 8 (週日 2025-11-17)**
- [ ] 分析 StockCard.tsx 依賴關係
- [ ] 設計新的組件結構
- [ ] 建立 `src/components/StockCard/` 目錄
- [ ] 抽取 useStockData Hook
- [ ] 測試 Hook 獨立運作

**Day 9 (週一 2025-11-18)**
- [ ] 拆分子組件:
  - StockCardHeader.tsx
  - StockCardChart.tsx
  - StockCardVolume.tsx
  - StockCardFooter.tsx
- [ ] 抽取 utils.ts (formatters, calculations)
- [ ] 測試各子組件

**Day 10 (週二 2025-11-19)**
- [ ] 重組 index.tsx (主組件)
- [ ] 確保所有功能正常
- [ ] 更新測試
- [ ] 驗證效能沒有退化

**產出**:
- 模組化的 StockCard 組件結構
- 可重用的 Hook 和 utils
- 組件文檔

---

#### Day 11-12: 實作 Context API

**Day 11 (週三 2025-11-20)**
- [ ] 建立 `src/contexts/AppContext.tsx`
- [ ] 建立 `src/contexts/ThemeContext.tsx`
- [ ] 實作 context providers
- [ ] 實作 useApp 和 useTheme hooks

**Day 12 (週四 2025-11-21)**
- [ ] 重構 App.tsx 使用 Context
- [ ] 移除 Props Drilling (3 層傳遞)
- [ ] 更新所有消費 context 的組件
- [ ] 測試 context 變更

**產出**:
- Context API 架構
- 簡化的 props 傳遞
- 更新的組件代碼

---

#### Day 13-14: Type Hints + Phase 1 收尾

**Day 13 (週五 2025-11-22)**
- [ ] 為所有 Python 函數添加 type hints
- [ ] routes/stock_routes.py
- [ ] services/stock_service.py
- [ ] utils/
- [ ] app.py, config.py
- [ ] 使用 mypy 驗證型別

**Day 14 (週六 2025-11-23)**
- [ ] 運行完整測試套件
- [ ] 修復任何回歸問題
- [ ] 效能驗證測試
- [ ] 建立 Phase 1 完成報告
- [ ] 更新 CHANGELOG.md
- [ ] 準備 Phase 2

**產出**:
- 完整的型別標註
- Phase 1 完成報告
- 更新的文檔

---

## 🛠️ 詳細實作指南

### Task 1: 建立後端測試基礎設施

#### 1.1 安裝依賴

```bash
cd backend
pip install pytest pytest-cov pytest-mock pytest-flask
pip freeze > requirements.txt
```

#### 1.2 建立目錄結構

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py           # Shared fixtures
│   ├── test_stock_service.py
│   ├── test_stock_routes.py
│   ├── test_utils.py
│   └── test_config.py
├── pytest.ini
└── .coveragerc
```

#### 1.3 配置文件

**pytest.ini**:
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --verbose
    --cov=.
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=70
```

**.coveragerc**:
```ini
[run]
source = .
omit =
    tests/*
    venv/*
    */site-packages/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise AssertionError
    raise NotImplementedError
    if __name__ == .__main__.:
```

#### 1.4 Fixtures (conftest.py)

```python
import pytest
from app import app as flask_app
from unittest.mock import Mock, MagicMock

@pytest.fixture
def app():
    """Flask app fixture"""
    flask_app.config.update({
        "TESTING": True,
    })
    yield flask_app

@pytest.fixture
def client(app):
    """Test client fixture"""
    return app.test_client()

@pytest.fixture
def mock_yfinance():
    """Mock yfinance Ticker"""
    mock_ticker = MagicMock()

    # Mock history data
    import pandas as pd
    mock_ticker.history.return_value = pd.DataFrame({
        'Open': [100, 101, 102],
        'High': [105, 106, 107],
        'Low': [98, 99, 100],
        'Close': [103, 104, 105],
        'Volume': [1000000, 1100000, 1200000]
    })

    # Mock info
    mock_ticker.info = {
        'shortName': 'Test Stock',
        'longName': 'Test Stock Inc.'
    }

    return mock_ticker
```

#### 1.5 範例測試 (test_stock_service.py)

```python
import pytest
from unittest.mock import patch, MagicMock
from services.stock_service import StockService

class TestStockService:
    """Test cases for StockService"""

    def test_get_stock_data_success(self, mock_yfinance):
        """Test successful stock data retrieval"""
        with patch('yfinance.Ticker', return_value=mock_yfinance):
            service = StockService()
            result = service.get_stock_data('AAPL', '5d')

            assert result['success'] is True
            assert 'data' in result
            assert len(result['data']) > 0
            assert result['symbol'] == 'AAPL'

    def test_get_stock_data_invalid_symbol(self):
        """Test handling of invalid symbol"""
        with patch('yfinance.Ticker') as mock_ticker:
            mock_ticker.return_value.history.return_value = None

            service = StockService()
            result = service.get_stock_data('INVALID', '5d')

            assert result['success'] is False
            assert 'error' in result

    def test_get_stock_data_network_error(self):
        """Test handling of network errors"""
        with patch('yfinance.Ticker') as mock_ticker:
            mock_ticker.side_effect = Exception("Network error")

            service = StockService()
            result = service.get_stock_data('AAPL', '5d')

            assert result['success'] is False
            assert 'error' in result

    def test_calculate_ma(self):
        """Test moving average calculation"""
        service = StockService()
        data = [
            {'close': 100, 'date': '2025-01-01'},
            {'close': 102, 'date': '2025-01-02'},
            {'close': 104, 'date': '2025-01-03'},
        ]

        ma = service._calculate_ma(data, period=2)

        assert len(ma) == len(data)
        assert ma[0] is None  # Not enough data
        assert ma[1] == 101.0  # (100 + 102) / 2
        assert ma[2] == 103.0  # (102 + 104) / 2

    @pytest.mark.parametrize("period,expected", [
        ('5d', 5),
        ('1mo', 30),
        ('3mo', 90),
        ('6mo', 180),
        ('1y', 365),
    ])
    def test_period_mapping(self, period, expected):
        """Test period string to days conversion"""
        service = StockService()
        days = service._get_days_from_period(period)
        assert days == expected
```

---

### Task 2: 前端效能優化 - useCallback & useMemo

#### 2.1 StockCard.tsx 優化

**Before (問題)**:
```typescript
// ❌ 每次渲染都創建新函數
const fetchStockData = async () => {
  // ...
};

// ❌ 每次渲染都重新計算
const displayName = stock.name || stock.symbol;

// ❌ 每次渲染都重新計算
const ma20Data = calculateMA(stockData, 20);
```

**After (優化)**:
```typescript
import { useCallback, useMemo } from 'react';

// ✅ 使用 useCallback 緩存函數
const fetchStockData = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await axios.get(
      `${API_URL}/api/stock/${stock.symbol}`,
      { params: { period: timeRange } }
    );

    if (response.data.success) {
      setStockData(response.data.data);
    }
  } catch (err) {
    handleError(err);
  } finally {
    setLoading(false);
  }
}, [stock.symbol, timeRange]); // 只在依賴改變時重建

// ✅ 使用 useMemo 緩存計算結果
const displayName = useMemo(() =>
  stock.name || stock.symbol,
  [stock.name, stock.symbol]
);

// ✅ 使用 useMemo 緩存昂貴計算
const ma20Data = useMemo(() =>
  calculateMA(stockData, 20),
  [stockData]
);

const ma60Data = useMemo(() =>
  calculateMA(stockData, 60),
  [stockData]
);

// ✅ 緩存價格範圍計算
const priceRange = useMemo(() => {
  if (!stockData.length) return { min: 0, max: 100 };

  const prices = stockData.flatMap(d => [d.low, d.high]);
  const dataMin = Math.min(...prices);
  const dataMax = Math.max(...prices);
  const padding = (dataMax - dataMin) * 0.1;

  return {
    min: dataMin - padding,
    max: dataMax + padding
  };
}, [stockData]);
```

#### 2.2 驗證效能改善

使用 React DevTools Profiler:

```typescript
// 在 App.tsx 包裹 Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="StockCard" onRender={onRenderCallback}>
  <StockCard {...props} />
</Profiler>
```

**預期結果**:
- Before: 每次父組件更新都 re-render (10-20ms)
- After: 只在 props 真正改變時 re-render (2-5ms)
- **改善**: 50-75% 減少渲染時間

---

### Task 3: 優化批次查詢效能

#### 3.1 當前問題 (串行處理)

```python
# ❌ 問題：串行執行，9 個股票需要 9-18 秒
@stock_bp.route('/stocks/batch', methods=['POST'])
def get_multiple_stocks():
    data = request.get_json()
    symbols = data.get('symbols', [])
    period = data.get('period', '5d')

    results = []
    for symbol in symbols:  # 串行執行
        result = stock_service.get_stock_data(symbol, period)
        results.append(result)

    return jsonify({'stocks': results})
```

#### 3.2 解決方案 (並行處理)

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

logger = logging.getLogger(__name__)

@stock_bp.route('/stocks/batch', methods=['POST'])
def get_multiple_stocks():
    """
    批次查詢多個股票數據（並行處理）

    使用 ThreadPoolExecutor 並行查詢，顯著減少總查詢時間。

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
    import time
    start_time = time.time()

    data = request.get_json()
    symbols = data.get('symbols', [])
    period = data.get('period', '5d')

    if not symbols:
        return jsonify({'error': 'No symbols provided'}), 400

    # 限制最大並行數量（避免 API rate limit）
    max_workers = min(len(symbols), 10)

    results = []
    successful = 0
    failed = 0

    # ✅ 使用 ThreadPoolExecutor 並行處理
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
                result = future.result(timeout=30)  # 30 秒超時
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
        f"Batch query completed: {successful}/{len(symbols)} successful, "
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

#### 3.3 效能基準測試

```python
# tests/test_batch_performance.py
import pytest
import time
from unittest.mock import patch

class TestBatchPerformance:
    """批次查詢效能測試"""

    def test_batch_query_performance(self, client, mock_yfinance):
        """測試批次查詢效能改善"""
        symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN',
                   'META', 'NVDA', 'AMD', 'INTC']

        with patch('yfinance.Ticker', return_value=mock_yfinance):
            start = time.time()

            response = client.post('/api/stocks/batch', json={
                'symbols': symbols,
                'period': '5d'
            })

            duration = time.time() - start

            assert response.status_code == 200
            data = response.get_json()

            assert data['total'] == 9
            assert data['successful'] == 9

            # ✅ 驗證效能改善：9 個股票應在 5 秒內完成
            assert duration < 5.0, f"Batch query took {duration}s, expected < 5s"
            assert data['duration_ms'] < 5000

            print(f"✅ Batch query: {duration:.2f}s for {len(symbols)} stocks")
            print(f"   Average: {duration/len(symbols):.2f}s per stock")
```

**預期效能改善**:
- Before (串行): 9 個股票 = 9-18 秒
- After (並行): 9 個股票 = 2-4 秒
- **改善**: 75-80% 時間減少

---

### Task 4: 拆分 StockCard 大組件

#### 4.1 新的目錄結構

```
src/components/StockCard/
├── index.tsx                 # 主組件 (80 行)
├── useStockData.ts           # 數據獲取 Hook (120 行)
├── StockCardHeader.tsx       # 標題 + 刪除按鈕 (60 行)
├── StockCardChart.tsx        # 價格圖表 + MA (100 行)
├── StockCardVolume.tsx       # 成交量圖表 (60 行)
├── StockCardFooter.tsx       # 底部資訊 (40 行)
├── utils.ts                  # 工具函數 (60 行)
├── types.ts                  # 型別定義 (30 行)
└── styles.ts                 # 樣式常數 (optional)
```

#### 4.2 useStockData Hook

```typescript
// src/components/StockCard/useStockData.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { StockData, TimeRange } from './types';

interface UseStockDataOptions {
  symbol: string;
  timeRange: TimeRange;
  apiUrl: string;
}

interface UseStockDataReturn {
  data: StockData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStockData({
  symbol,
  timeRange,
  apiUrl
}: UseStockDataOptions): UseStockDataReturn {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${apiUrl}/api/stock/${symbol}`,
        {
          params: { period: timeRange },
          timeout: 30000
        }
      );

      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeRange, apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response?.status === 503) {
      return 'Service temporarily unavailable. Retrying...';
    }
    if (err.response?.status === 404) {
      return 'Stock symbol not found';
    }
    if (err.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
  }
  return 'Failed to fetch stock data';
}
```

#### 4.3 主組件 (index.tsx)

```typescript
// src/components/StockCard/index.tsx
import React from 'react';
import { useStockData } from './useStockData';
import { StockCardHeader } from './StockCardHeader';
import { StockCardChart } from './StockCardChart';
import { StockCardVolume } from './StockCardVolume';
import { StockCardFooter } from './StockCardFooter';
import type { Stock, TimeRange, ColorTheme, ChartType, Language } from './types';

interface StockCardProps {
  stock: Stock;
  timeRange: TimeRange;
  onRemove: (symbol: string) => void;
  colorTheme: ColorTheme;
  chartType: ChartType;
  language: Language;
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  timeRange,
  onRemove,
  colorTheme,
  chartType,
  language
}) => {
  const { data, loading, error, refetch } = useStockData({
    symbol: stock.symbol,
    timeRange,
    apiUrl: import.meta.env.VITE_API_URL
  });

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <StockCardHeader
          stock={stock}
          onRemove={onRemove}
        />
        <div className="text-red-500 text-center py-8">
          <p>{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <StockCardHeader
        stock={stock}
        onRemove={onRemove}
        loading={loading}
      />

      <StockCardChart
        data={data}
        colorTheme={colorTheme}
        chartType={chartType}
        loading={loading}
      />

      <StockCardVolume
        data={data}
        colorTheme={colorTheme}
        loading={loading}
      />

      <StockCardFooter
        data={data}
        language={language}
        loading={loading}
      />
    </div>
  );
};
```

#### 4.4 子組件範例

```typescript
// src/components/StockCard/StockCardHeader.tsx
import React from 'react';
import type { Stock } from './types';

interface StockCardHeaderProps {
  stock: Stock;
  onRemove: (symbol: string) => void;
  loading?: boolean;
}

export const StockCardHeader: React.FC<StockCardHeaderProps> = ({
  stock,
  onRemove,
  loading = false
}) => {
  const displayName = stock.name || stock.symbol;

  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-semibold">
          {loading ? (
            <span className="animate-pulse bg-gray-300 h-6 w-32 block"></span>
          ) : (
            displayName
          )}
        </h3>
        <p className="text-sm text-gray-500">{stock.symbol}</p>
      </div>

      <button
        onClick={() => onRemove(stock.symbol)}
        className="text-red-500 hover:text-red-700"
        aria-label={`Remove ${stock.symbol}`}
      >
        ✕
      </button>
    </div>
  );
};
```

---

### Task 5: 實作 Context API

#### 5.1 AppContext 設計

```typescript
// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Language, ColorTheme, ChartType, TimeRange } from '../types';

interface AppContextValue {
  // State
  language: Language;
  colorTheme: ColorTheme;
  chartType: ChartType;
  darkMode: boolean;

  // Actions
  setLanguage: (lang: Language) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setChartType: (type: ChartType) => void;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() =>
    (localStorage.getItem('language') as Language) || 'zh-TW'
  );

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() =>
    (localStorage.getItem('colorTheme') as ColorTheme) || 'asian'
  );

  const [chartType, setChartTypeState] = useState<ChartType>(() =>
    (localStorage.getItem('chartType') as ChartType) || 'line'
  );

  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('darkMode') === 'true'
  );

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem('colorTheme', theme);
  }, []);

  const setChartType = useCallback((type: ChartType) => {
    setChartTypeState(type);
    localStorage.setItem('chartType', type);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      return newValue;
    });
  }, []);

  const value = {
    language,
    colorTheme,
    chartType,
    darkMode,
    setLanguage,
    setColorTheme,
    setChartType,
    toggleDarkMode
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

#### 5.2 使用 Context (Before/After)

**Before (Props Drilling)**:
```typescript
// ❌ Props 經過 3 層傳遞
<App>
  <DashboardGrid
    language={language}
    colorTheme={colorTheme}
    chartType={chartType}
  >
    <StockCard
      language={language}
      colorTheme={colorTheme}
      chartType={chartType}
    >
      <CandlestickChart
        colorTheme={colorTheme}
      />
    </StockCard>
  </DashboardGrid>
</App>
```

**After (Context API)**:
```typescript
// ✅ 使用 Context，無需 props 傳遞
<AppProvider>
  <App>
    <DashboardGrid>
      <StockCard>
        <CandlestickChart />
      </StockCard>
    </DashboardGrid>
  </App>
</AppProvider>

// 在任何組件中直接使用
function CandlestickChart() {
  const { colorTheme } = useApp();
  // ...
}
```

---

### Task 6: 添加 Python Type Hints

#### 6.1 StockService 範例

```python
# services/stock_service.py
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import yfinance as yf
import pandas as pd

class StockService:
    """股票數據服務"""

    def get_stock_data(
        self,
        symbol: str,
        period: str = '5d'
    ) -> Dict[str, Union[bool, str, List[Dict[str, Any]]]]:
        """
        獲取股票數據

        Args:
            symbol: 股票代碼 (e.g., 'AAPL', '2330.TW')
            period: 時間範圍 ('5d', '1mo', '3mo', '6mo', '1y')

        Returns:
            {
                'success': bool,
                'symbol': str,
                'data': List[StockDataPoint],
                'error': Optional[str]
            }
        """
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)

            if hist.empty:
                return self._error_response(symbol, "No data available")

            data_points = self._convert_to_data_points(hist)
            company_name = self._get_company_name(ticker)

            return {
                'success': True,
                'symbol': symbol,
                'name': company_name,
                'data': data_points
            }

        except Exception as e:
            return self._error_response(symbol, str(e))

    def _convert_to_data_points(
        self,
        hist: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        """
        轉換 DataFrame 為數據點列表

        Args:
            hist: yfinance 歷史數據 DataFrame

        Returns:
            數據點列表
        """
        data_points: List[Dict[str, Any]] = []

        for date, row in hist.iterrows():
            data_points.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': float(row['Open']),
                'high': float(row['High']),
                'low': float(row['Low']),
                'close': float(row['Close']),
                'volume': int(row['Volume'])
            })

        return data_points

    def _get_company_name(self, ticker: yf.Ticker) -> Optional[str]:
        """
        獲取公司名稱

        Args:
            ticker: yfinance Ticker 對象

        Returns:
            公司名稱，若無法獲取則返回 None
        """
        try:
            info = ticker.info
            return info.get('shortName') or info.get('longName')
        except Exception:
            return None

    def _error_response(
        self,
        symbol: str,
        error_msg: str
    ) -> Dict[str, Union[bool, str]]:
        """
        構建錯誤響應

        Args:
            symbol: 股票代碼
            error_msg: 錯誤訊息

        Returns:
            錯誤響應字典
        """
        return {
            'success': False,
            'symbol': symbol,
            'error': error_msg
        }

    @staticmethod
    def _calculate_ma(
        data: List[Dict[str, Any]],
        period: int
    ) -> List[Optional[float]]:
        """
        計算移動平均線

        Args:
            data: 數據點列表
            period: MA 週期

        Returns:
            MA 值列表（前 period-1 個為 None）
        """
        ma_values: List[Optional[float]] = []

        for i in range(len(data)):
            if i < period - 1:
                ma_values.append(None)
            else:
                window = data[i - period + 1:i + 1]
                avg = sum(d['close'] for d in window) / period
                ma_values.append(round(avg, 2))

        return ma_values
```

#### 6.2 使用 mypy 驗證

```bash
# 安裝 mypy
pip install mypy

# 運行型別檢查
mypy services/ routes/ utils/ app.py config.py

# 應該顯示：
# Success: no issues found in X source files
```

---

## 📊 驗收標準

### Phase 1 完成標準

#### 後端測試
- [ ] 測試覆蓋率達到 70%+
- [ ] 所有 services/ 測試通過
- [ ] 所有 routes/ 測試通過
- [ ] CI 測試流程建立

#### 前端效能
- [ ] StockCard re-render 減少 50%+
- [ ] React DevTools Profiler 驗證通過
- [ ] 無功能回歸

#### API 效能
- [ ] 批次查詢 9 個股票 < 5 秒
- [ ] 效能基準測試通過
- [ ] 無 timeout 錯誤

#### 代碼架構
- [ ] StockCard 拆分為 6+ 個模組
- [ ] Context API 實作完成
- [ ] Props Drilling 消除
- [ ] 所有 Python 函數有 type hints
- [ ] mypy 驗證通過

#### 文檔
- [ ] CHANGELOG.md 更新
- [ ] Phase 1 完成報告
- [ ] 效能改善數據記錄

---

## 🚨 風險與緩解

### 風險 1: 測試建立時間超出預期
**緩解策略**:
- 優先實作核心功能測試
- 使用測試覆蓋率工具識別關鍵路徑
- 可接受 60% 覆蓋率作為 MVP

### 風險 2: 效能優化引入 Bug
**緩解策略**:
- 先建立測試再重構
- 小步驟提交，易於回滾
- 使用 React DevTools 仔細驗證

### 風險 3: API 並行處理 Rate Limit
**緩解策略**:
- 限制 max_workers=10
- 實作 exponential backoff
- 監控 API 錯誤率

### 風險 4: 組件拆分破壞現有功能
**緩解策略**:
- 保留原始 StockCard.tsx 作為參考
- 逐步遷移功能
- 每個子組件單獨測試

---

## 📈 成功指標

### 量化指標
- **測試覆蓋率**: 0% → 70%+
- **Re-render 次數**: 減少 50%+
- **批次查詢時間**: 9-18s → 2-4s
- **StockCard 代碼行數**: 360 → 80 (主組件)
- **Type Hints 覆蓋**: 0% → 100%

### 質量指標
- [ ] 無功能回歸
- [ ] 無效能退化
- [ ] CI 測試通過
- [ ] 代碼審查通過
- [ ] 用戶體驗無變化

---

## 🔄 每日檢查清單

### 每日開始
- [ ] 查看 Phase 1 進度
- [ ] 確認今日任務
- [ ] git pull origin main
- [ ] 運行測試確保乾淨狀態

### 每日結束
- [ ] 運行測試套件
- [ ] 更新進度文檔
- [ ] Git commit with clear message
- [ ] Push to remote branch
- [ ] 記錄遇到的問題和解決方案

---

## 📚 參考資源

### 測試
- [pytest Documentation](https://docs.pytest.org/)
- [pytest-flask](https://pytest-flask.readthedocs.io/)
- [Python Testing Best Practices](https://realpython.com/pytest-python-testing/)

### 效能優化
- [React useCallback](https://react.dev/reference/react/useCallback)
- [React useMemo](https://react.dev/reference/react/useMemo)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

### 並行處理
- [ThreadPoolExecutor](https://docs.python.org/3/library/concurrent.futures.html)
- [Python Concurrency](https://realpython.com/python-concurrency/)

### Context API
- [React Context](https://react.dev/reference/react/createContext)
- [Context Best Practices](https://kentcdodds.com/blog/how-to-use-react-context-effectively)

---

**文件建立**: 2025-11-10
**最後更新**: 2025-11-10
**狀態**: 準備開始執行
**下一步**: 開始 Day 1 - 建立後端測試環境
