# MarketVue 前端優化與測試計劃

## 執行摘要

基於代碼庫分析，MarketVue 是一個使用 React 19.1 + TypeScript + Vite 構建的現代化股票儀表板應用。雖然基礎架構良好，但存在多個性能優化機會。本計劃提供兩個核心階段的優化方案和完整的測試策略。

**優化目標優先級**（根據用戶需求確定）：
1. 🥇 **用戶體驗** - 頁面載入速度、操作流暢度
2. 🥈 **系統穩定性** - 錯誤處理、可靠性
3. 🥉 **開發效率** - 代碼可維護性、測試覆蓋率
4. **未來擴展** - 架構彈性
5. **成本控制** - API 調用優化

**實施方式**：協同合作 - 每步實施前說明，隨時接受反饋

**預期成果**：
- 渲染性能提升 30-50%
- 首次內容繪製時間減少 40%
- 記憶體使用優化 25%
- 用戶體驗指標全面提升
- 測試覆蓋率達到 80%

**時間框架**：5-6 天（平衡方案）

---

## 一、當前狀況分析

### 技術棧
- **框架**: React 19.1.1 + TypeScript 5.9.3
- **構建工具**: Vite 7.1.7
- **狀態管理**: React Hooks (無集中式狀態庫)
- **樣式**: Tailwind CSS 4.1.15
- **圖表**: Recharts 3.3.0 + 自定義 SVG K線圖
- **數據獲取**: Axios 1.12.2
- **監控**: Vercel Analytics + Speed Insights

### 已實現的優化
✅ Vite 快速構建
✅ Recharts 禁用動畫
✅ localStorage 數據持久化
✅ API 請求重試機制
✅ 暗黑模式支持
✅ 響應式設計

### 關鍵性能瓶頸

#### 🔴 高優先級問題
1. **缺少 React 性能優化**
   - 無 `React.memo` 導致不必要的重渲染
   - 無 `useMemo` / `useCallback` 緩存計算
   - 18 個 StockCard 同時重渲染

2. **數據獲取效率低**
   - 每個組件獨立發起 API 請求（18 個並行）
   - 無請求去重和緩存機制
   - 無數據預取策略

3. **大型組件過於耦合**
   - StockCard.tsx (403 行) 包含過多職責
   - 數據獲取、狀態管理、圖表渲染混在一起
   - 難以測試和維護

#### 🟡 中優先級問題
1. 缺少錯誤邊界組件
2. CustomTooltip 重複創建
3. 布局版本管理粗糙
4. 無虛擬滾動支持

#### 🟢 低優先級問題
1. 生產環境未清理 console.log
2. 硬編碼配置值
3. 無 Service Worker 離線支持

---

## 二、優化方案（兩階段執行）

### 第一階段：核心性能優化（2 天）

**目標**：解決最嚴重的性能瓶頸，實現立即可見的效果
**重點**：用戶體驗和系統穩定性

#### 1.1 React 渲染優化

**任務 1: 為 StockCard 添加 React.memo**
```typescript
// src/components/StockCard.tsx
import { memo } from 'react';

const StockCard = memo(({
  symbol,
  startDate,
  endDate,
  colorTheme,
  language,
  chartType,
  onRemove
}) => {
  // ... 組件邏輯
}, (prevProps, nextProps) => {
  // 自定義比較邏輯
  return prevProps.symbol === nextProps.symbol &&
         prevProps.startDate === nextProps.startDate &&
         prevProps.endDate === nextProps.endDate &&
         prevProps.chartType === nextProps.chartType &&
         prevProps.colorTheme === nextProps.colorTheme;
});

export default StockCard;
```

**任務 2: 使用 useMemo 緩存 MA 計算**
```typescript
// src/components/StockCard.tsx
const processedData = useMemo(() => {
  if (!stockData?.data) return [];

  let data = [...stockData.data];
  data = calculateMA(data, 20);
  data = calculateMA(data, 60);

  return data;
}, [stockData?.data]);
```

**任務 3: 使用 useCallback 優化回調函數**
```typescript
// src/App.tsx
const handleRemoveStock = useCallback((symbol: string) => {
  setStocks(prev => prev.filter(s => s !== symbol));
}, []);

const handleDateRangeChange = useCallback((range: DateRange) => {
  setDateRange(range);
}, []);
```

**預期效果**：
- 減少 70% 的不必要重渲染
- MA 計算性能提升 50%
- 記憶體使用減少 20%

#### 1.2 組件拆分（激進拆分策略）

**任務 4: 拆分 StockCard 為子組件**
```
src/components/stock-card/
├── StockCard.tsx (主容器，~80 行)
├── StockCardHeader.tsx (標題、價格、變化，~50 行)
├── StockChartContainer.tsx (圖表容器，~60 行)
├── StockLineChart.tsx (折線圖，~80 行)
├── StockCandlestickChart.tsx (K線圖，~100 行)
├── StockVolumeChart.tsx (成交量圖，~50 行)
├── StockCustomTooltip.tsx (工具提示，~40 行)
└── hooks/
    ├── useStockData.ts (數據獲取邏輯)
    └── useMACalculation.ts (MA 計算邏輯)
```

**拆分原則**：
- 單一職責：每個組件只負責一個功能
- 可重用性：子組件可獨立使用
- 易測試：每個組件可單獨測試

**預期效果**：
- 單一文件從 403 行減少到 < 100 行
- 可測試性提升 80%
- 代碼可讀性顯著改善
- 維護成本降低 40%

#### 1.3 生產環境清理

**任務 5: 移除所有 console 語句**
```typescript
// 創建 src/utils/logger.ts
export const logger = {
  log: import.meta.env.DEV ? console.log : () => {},
  error: import.meta.env.DEV ? console.error : () => {},
  warn: import.meta.env.DEV ? console.warn : () => {},
};

// 全局替換 console.log -> logger.log
```

**任務 6: 提取配置常量**
```typescript
// src/config/constants.ts
export const APP_CONFIG = {
  MAX_STOCKS: 18,
  API_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAYS: {
    503: [5000, 10000, 15000],
    DEFAULT: [1000, 2000, 5000],
  },
  CHART: {
    DISABLE_ANIMATION: true,
    MA_PERIODS: [20, 60],
  },
} as const;
```

#### 1.4 localStorage 數據遷移優化

**任務 7: 實現智能數據遷移（保留用戶數據）**

目前問題：版本更新會直接清空用戶布局配置
```typescript
// DashboardGrid.tsx:43-50 (當前做法)
if (layoutVersion !== CURRENT_VERSION) {
  localStorage.removeItem('dashboard-layout'); // 直接刪除！
}
```

**改進方案**：
```typescript
// src/utils/storageMigration.ts
export const migrateLayoutData = (version: string) => {
  const savedLayout = localStorage.getItem('dashboard-layout');
  const savedVersion = localStorage.getItem('dashboard-layout-version');

  if (!savedLayout || savedVersion === version) {
    return null; // 無需遷移
  }

  try {
    const layout = JSON.parse(savedLayout);

    // 嘗試轉換舊格式到新格式
    const migratedLayout = transformLayout(layout, savedVersion, version);

    if (migratedLayout) {
      localStorage.setItem('dashboard-layout', JSON.stringify(migratedLayout));
      localStorage.setItem('dashboard-layout-version', version);
      return migratedLayout;
    }
  } catch (error) {
    console.warn('Layout migration failed, using defaults:', error);
  }

  // 遷移失敗才清空
  localStorage.removeItem('dashboard-layout');
  return null;
};

// 轉換邏輯
const transformLayout = (layout: any, fromVersion: string, toVersion: string) => {
  // 版本 4 -> 5: 添加新屬性，保留位置
  if (fromVersion === '4' && toVersion === '5') {
    return layout.map((item: any) => ({
      ...item,
      // 保留 x, y, w, h 位置
      // 添加新屬性的默認值
      minW: item.minW || 3,
      minH: item.minH || 2,
    }));
  }

  // 其他版本轉換邏輯
  return layout;
};
```

**預期效果**：
- 版本更新時保留用戶布局
- 提升用戶體驗
- 減少用戶投訴

---

### 第二階段：數據層優化與測試（3-4 天）

**目標**：使用 React Query 優化數據獲取、緩存和狀態管理
**技術選型**：React Query（已確認）
**方案**：純前端優化（無需後端配合）

#### 2.1 實現請求緩存和去重（React Query）

**任務 8: 創建數據緩存層**
```typescript
// src/hooks/useStockDataCache.ts
import { useQuery } from '@tanstack/react-query';

export const useStockData = (symbol: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['stock', symbol, startDate, endDate],
    queryFn: () => fetchStockData(symbol, startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 分鐘
    cacheTime: 30 * 60 * 1000, // 30 分鐘
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

**任務 9: 安裝 React Query**
```bash
npm install @tanstack/react-query
```

**任務 10: 設置 QueryClient Provider**
```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  </React.StrictMode>,
);
```

**配置說明**：
```typescript
// React Query 配置策略
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 分鐘內視為新鮮數據
      cacheTime: 30 * 60 * 1000,       // 30 分鐘後清除緩存
      refetchOnWindowFocus: false,     // 窗口聚焦不自動重新獲取
      retry: 3,                        // 失敗重試 3 次
    },
  },
});
```

**預期效果**：
- 相同數據請求自動去重
- 減少 50-60% 的 API 調用（純前端緩存）
- 自動後台刷新和重試
- 改善用戶體驗（即時顯示緩存數據）

#### 2.2 數據預取優化

**任務 11: 實現智能數據預取**
```typescript
// src/hooks/usePrefetchStocks.ts
export const usePrefetchStocks = () => {
  const queryClient = useQueryClient();

  const prefetch = useCallback((symbols: string[], startDate: string, endDate: string) => {
    symbols.forEach(symbol => {
      queryClient.prefetchQuery({
        queryKey: ['stock', symbol, startDate, endDate],
        queryFn: () => fetchStockData(symbol, startDate, endDate),
      });
    });
  }, [queryClient]);

  return { prefetch };
};
```

**預期效果**：
- 用戶操作更流暢（預取下一個可能查看的數據）
- 減少等待時間

#### 2.3 錯誤處理增強（系統穩定性優先）

**任務 12: 創建錯誤邊界組件**
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h2 className="text-red-700 dark:text-red-400 font-semibold">
            Something went wrong
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300 mt-2">
            {this.state.error?.message}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**任務 13: 包裝關鍵組件（提升系統穩定性）**
```typescript
// src/App.tsx
<DashboardGrid layout={layout} onLayoutChange={handleLayoutChange}>
  {stocks.map(symbol => (
    <ErrorBoundary key={symbol}>
      <StockCard
        symbol={symbol}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        colorTheme={colorTheme}
        language={language}
        chartType={chartType}
        onRemove={handleRemoveStock}
      />
    </ErrorBoundary>
  ))}
</DashboardGrid>
```

**預期效果**：
- 單個股票卡片錯誤不影響其他卡片
- 提升系統穩定性和可靠性
- 改善用戶體驗（部分失敗不影響整體）

#### 2.4 性能監控增強

**任務 14: 添加自定義性能追蹤**
```typescript
// src/utils/performance.ts
export const measurePerformance = (name: string, fn: () => void) => {
  if (!import.meta.env.DEV) return fn();

  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
};

export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const start = performance.now();

    return () => {
      const end = performance.now();
      if (import.meta.env.DEV) {
        console.log(`[Component] ${componentName} render time: ${(end - start).toFixed(2)}ms`);
      }
    };
  });
};
```

**任務 15: Web Vitals 追蹤**
```typescript
// src/utils/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export const reportWebVitals = () => {
  onCLS(console.log);
  onFID(console.log);
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);
};

// src/main.tsx
reportWebVitals();
```

#### 2.5 測試實施（標準測試策略）

**任務 16: 設置測試環境**
```bash
# 安裝測試依賴
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D @playwright/test
npm install -D @lhci/cli
```

**任務 17: 編寫單元測試**
- 目標覆蓋率：80%
- 重點：StockCard、hooks、工具函數

**任務 18: 編寫 E2E 測試**
- 15-20 個關鍵場景
- 覆蓋：添加/刪除股票、主題切換、時間範圍、數據持久化

**任務 19: 性能測試**
- Lighthouse CI 自動化
- 目標：Performance Score ≥ 90

#### 2.6 構建優化（可選）

**任務 20: 配置代碼分割**
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const StockCard = lazy(() => import('./components/StockCard'));
const ThemeSettings = lazy(() => import('./components/ThemeSettings'));

// 使用時
<Suspense fallback={<LoadingSpinner />}>
  <StockCard {...props} />
</Suspense>
```

**任務 21: Vite 構建優化**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'utils': ['axios', 'date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

**任務 22: 安裝構建分析工具**
```bash
npm install -D rollup-plugin-visualizer
```

---

## 三、測試計劃

### 3.1 單元測試（使用 Vitest + React Testing Library）

**設置測試環境**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**配置文件**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
});
```

**測試案例清單**

#### 組件測試
```typescript
// src/components/__tests__/StockCard.test.tsx
describe('StockCard', () => {
  it('應該正確渲染股票資訊', () => {});
  it('應該在載入時顯示載入狀態', () => {});
  it('應該在錯誤時顯示錯誤訊息', () => {});
  it('應該正確計算 MA20 和 MA60', () => {});
  it('應該在點擊刪除時調用 onRemove', () => {});
  it('應該根據 chartType 切換圖表類型', () => {});
});

// src/components/__tests__/StockManager.test.tsx
describe('StockManager', () => {
  it('應該驗證股票代碼格式', () => {});
  it('應該防止添加超過 18 支股票', () => {});
  it('應該防止添加重複股票', () => {});
  it('應該在添加成功後清空輸入框', () => {});
});

// src/components/__tests__/TimeRangeSelector.test.tsx
describe('TimeRangeSelector', () => {
  it('應該正確處理預設時間範圍', () => {});
  it('應該正確處理自定義時間範圍', () => {});
  it('應該驗證結束日期不早於開始日期', () => {});
});
```

#### Hook 測試
```typescript
// src/hooks/__tests__/useStockData.test.ts
describe('useStockData', () => {
  it('應該成功獲取股票數據', async () => {});
  it('應該處理 API 錯誤', async () => {});
  it('應該實現重試機制', async () => {});
  it('應該緩存相同請求', async () => {});
});

// src/hooks/__tests__/useMACalculation.test.ts
describe('useMACalculation', () => {
  it('應該正確計算 MA20', () => {});
  it('應該正確計算 MA60', () => {});
  it('應該處理數據不足的情況', () => {});
});
```

#### 工具函數測試
```typescript
// src/utils/__tests__/performance.test.ts
describe('measurePerformance', () => {
  it('應該測量函數執行時間', () => {});
  it('應該在生產環境關閉', () => {});
});
```

**測試覆蓋率目標**
- 整體覆蓋率：≥ 80%
- 組件覆蓋率：≥ 85%
- Hook 覆蓋率：≥ 90%
- 工具函數覆蓋率：≥ 95%

### 3.2 整合測試

**測試場景**
```typescript
// src/test/integration/StockDashboard.test.tsx
describe('Stock Dashboard Integration', () => {
  it('應該完整流程：添加股票 -> 獲取數據 -> 顯示圖表', async () => {});
  it('應該正確處理多股票並行加載', async () => {});
  it('應該正確保存和恢復用戶偏好', () => {});
  it('應該正確處理主題切換', () => {});
  it('應該正確處理語言切換', () => {});
  it('應該正確處理時間範圍變更', async () => {});
  it('應該正確處理網格佈局拖拽', () => {});
});
```

### 3.3 性能測試

**使用 Lighthouse CI**
```bash
npm install -D @lhci/cli
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run preview',
      url: ['http://localhost:4173'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
  },
};
```

**性能基準測試**
```typescript
// src/test/performance/renderBenchmark.test.ts
describe('Render Performance', () => {
  it('應該在 100ms 內渲染單個 StockCard', () => {});
  it('應該在 500ms 內渲染 18 個 StockCard', () => {});
  it('應該在 50ms 內切換圖表類型', () => {});
  it('應該在 200ms 內計算所有 MA', () => {});
});
```

**記憶體洩漏測試**
```typescript
// src/test/performance/memoryLeak.test.ts
describe('Memory Leak Detection', () => {
  it('應該在卸載組件後正確清理', () => {});
  it('應該在移除股票後釋放記憶體', () => {});
  it('應該正確清理事件監聽器', () => {});
});
```

### 3.4 E2E 測試（使用 Playwright）

**安裝 Playwright**
```bash
npm install -D @playwright/test
npx playwright install
```

**E2E 測試案例**
```typescript
// e2e/stockDashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Stock Dashboard E2E', () => {
  test('用戶可以添加和刪除股票', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 添加股票
    await page.fill('input[placeholder*="2330"]', '2330');
    await page.click('button:has-text("Add")');

    // 驗證股票卡片出現
    await expect(page.locator('text=台積電')).toBeVisible();

    // 刪除股票
    await page.click('[data-testid="remove-2330"]');

    // 驗證股票卡片消失
    await expect(page.locator('text=台積電')).not.toBeVisible();
  });

  test('用戶可以切換主題', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 打開設置
    await page.click('[data-testid="theme-settings"]');

    // 切換到暗黑模式
    await page.click('text=Dark');

    // 驗證暗黑模式已應用
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('用戶可以改變時間範圍', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 添加股票
    await page.fill('input[placeholder*="2330"]', '2330');
    await page.click('button:has-text("Add")');

    // 切換時間範圍
    await page.click('text=3M');

    // 等待數據重新加載
    await page.waitForTimeout(1000);

    // 驗證圖表已更新
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
  });

  test('應用狀態應該持久化', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 添加股票
    await page.fill('input[placeholder*="2330"]', '2330');
    await page.click('button:has-text("Add")');

    // 重新加載頁面
    await page.reload();

    // 驗證股票仍然存在
    await expect(page.locator('text=台積電')).toBeVisible();
  });
});
```

### 3.5 可訪問性測試

**使用 axe-core**
```bash
npm install -D @axe-core/react
```

```typescript
// src/test/a11y/accessibility.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('App 組件應該無可訪問性問題', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('StockCard 組件應該無可訪問性問題', async () => {
    const { container } = render(<StockCard {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 3.6 視覺回歸測試

**使用 Percy 或 Chromatic**
```bash
npm install -D @percy/cli @percy/playwright
```

```typescript
// e2e/visual.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('視覺回歸測試', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 添加股票
  await page.fill('input[placeholder*="2330"]', '2330');
  await page.click('button:has-text("Add")');
  await page.waitForTimeout(2000);

  // 拍攝快照
  await percySnapshot(page, 'Dashboard with Stock');

  // 切換暗黑模式
  await page.click('[data-testid="theme-settings"]');
  await page.click('text=Dark');

  await percySnapshot(page, 'Dashboard Dark Mode');
});
```

---

## 四、測試執行計劃

### 4.1 測試環境設置

**本地開發環境**
```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:a11y": "vitest --run a11y",
    "test:perf": "vitest --run performance",
    "lighthouse": "lhci autorun"
  }
}
```

**CI/CD 流程（GitHub Actions）**
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run lighthouse
```

### 4.2 測試時程表

| 天數 | 主要任務 | 測試類型 | 預計時間 |
|------|---------|---------|---------|
| **Day 1** | React 性能優化 | - | 1 天 |
| **Day 2** | 組件拆分 + localStorage 遷移 | 手動測試 | 1 天 |
| **Day 3** | React Query 整合 | 集成測試 | 1 天 |
| **Day 4** | 錯誤處理 + 性能監控 | - | 1 天 |
| **Day 5** | 單元測試 + 整合測試 | Vitest | 1 天 |
| **Day 6** | E2E 測試 + Lighthouse | Playwright + LHCI | 1 天 |
| **總計** | | | **5-6 天** |

### 4.3 驗收標準

**功能要求**
- ✅ 所有現有功能正常運作
- ✅ 無引入新的 bug
- ✅ 向後兼容 localStorage 數據

**性能要求**
- ✅ Lighthouse Performance Score ≥ 90
- ✅ FCP (First Contentful Paint) < 2s
- ✅ LCP (Largest Contentful Paint) < 3s
- ✅ TBT (Total Blocking Time) < 300ms
- ✅ CLS (Cumulative Layout Shift) < 0.1

**測試覆蓋率要求**
- ✅ 整體代碼覆蓋率 ≥ 80%
- ✅ 關鍵組件覆蓋率 ≥ 90%
- ✅ 所有 E2E 測試通過

**可訪問性要求**
- ✅ WCAG 2.1 Level AA 合規
- ✅ 無 axe-core 嚴重錯誤
- ✅ 鍵盤導航完整支持

**代碼質量要求**
- ✅ ESLint 無錯誤
- ✅ TypeScript 無類型錯誤
- ✅ 無 console.log 在生產構建中

---

## 五、風險評估與緩解

### 5.1 技術風險

| 風險 | 影響程度 | 可能性 | 緩解策略 |
|------|---------|--------|---------|
| React 19 兼容性問題 | 高 | 低 | 使用 React 19 官方遷移指南，充分測試 |
| React Query 學習曲線 | 中 | 中 | 提供團隊培訓，分階段導入 |
| 性能優化過度導致代碼複雜 | 中 | 中 | 保持代碼簡潔，優先選擇可讀性 |
| 構建時間增加 | 低 | 低 | 使用 Vite 緩存和並行構建 |

### 5.2 時程風險

| 風險 | 影響程度 | 可能性 | 緩解策略 |
|------|---------|--------|---------|
| 第三方庫升級衝突 | 高 | 中 | 提前進行兼容性測試 |
| 測試編寫時間超出預期 | 中 | 高 | 預留 20% 緩衝時間 |
| 後端 API 配合延遲 | 中 | 中 | 前端先使用 Mock 數據 |

### 5.3 業務風險

| 風險 | 影響程度 | 可能性 | 緩解策略 |
|------|---------|--------|---------|
| 用戶數據遷移失敗 | 高 | 低 | 實施版本兼容性檢查和降級方案 |
| 性能優化未達預期 | 中 | 低 | 設立明確的性能基準和監控 |
| 破壞現有用戶體驗 | 高 | 低 | 充分的 E2E 測試和 Beta 測試 |

---

## 六、監控與持續改進

### 6.1 性能監控儀表板

**使用 Vercel Analytics + Custom Metrics**
```typescript
// src/utils/analytics.ts
import { track } from '@vercel/analytics';

export const trackPerformance = (metric: string, value: number) => {
  track('Performance', {
    metric,
    value,
    timestamp: Date.now(),
  });
};

// 使用示例
trackPerformance('stock_data_fetch_time', fetchDuration);
trackPerformance('ma_calculation_time', calculationDuration);
trackPerformance('chart_render_time', renderDuration);
```

### 6.2 錯誤追蹤（可選 - 未來功能）

**整合 Sentry**（暫時不實施，但保留在計劃中供參考）

> **註**：根據用戶決策，暫時不使用 Sentry，但保留此功能作為未來選項。
> 當前使用 ErrorBoundary + console.error 進行錯誤處理。

**如需啟用 Sentry，參考以下實施方案**：

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

**Sentry 優勢**：
- 自動捕獲所有錯誤和未處理的 Promise rejection
- Session Replay（錯誤發生時的用戶操作回放）
- 性能追蹤和分析
- 錯誤分組和趨勢分析
- 免費方案：每月 5000 錯誤事件

**何時考慮啟用**：
- 用戶數量增長到一定規模
- 需要更專業的錯誤監控
- 需要了解生產環境的錯誤模式

### 6.3 持續性能審計

**每週自動化 Lighthouse 審計**
```yaml
# .github/workflows/performance.yml
name: Weekly Performance Audit

on:
  schedule:
    - cron: '0 0 * * 0'  # 每週日午夜

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run lighthouse
      - uses: actions/upload-artifact@v3
        with:
          name: lighthouse-report
          path: ./dist/lighthouse-report.html
```

---

## 七、實施檢查清單（5-6 天平衡方案）

### 第一階段：核心性能優化（2 天）

**Day 1: React 性能優化**
- [ ] 為 StockCard 添加 React.memo
- [ ] 為 MA 計算添加 useMemo
- [ ] 為回調函數添加 useCallback
- [ ] 移除所有 console.log
- [ ] 提取配置常量到 constants.ts
- [ ] 驗證性能提升（開發者工具 Profiler）

**Day 2: 組件拆分**
- [ ] 創建 stock-card 目錄結構
- [ ] 拆分 StockCardHeader
- [ ] 拆分 StockChartContainer
- [ ] 拆分圖表組件（Line、Candlestick、Volume）
- [ ] 拆分 CustomTooltip
- [ ] 創建自定義 Hook（useStockData、useMACalculation）
- [ ] 實現 localStorage 智能遷移邏輯
- [ ] 驗證功能正常（手動測試）

### 第二階段：數據層優化與測試（3-4 天）

**Day 3: React Query 整合**
- [ ] 安裝 @tanstack/react-query
- [ ] 設置 QueryClient Provider
- [ ] 實現 useStockData Hook（使用 useQuery）
- [ ] 替換所有數據獲取邏輯
- [ ] 配置 React Query Devtools
- [ ] 測試緩存和去重功能

**Day 4: 錯誤處理與性能監控**
- [ ] 創建 ErrorBoundary 組件
- [ ] 包裝關鍵組件（StockCard）
- [ ] 添加自定義性能追蹤工具
- [ ] 實現 Web Vitals 追蹤
- [ ] 實現數據預取邏輯

**Day 5: 測試實施**
- [ ] 設置 Vitest 測試環境
- [ ] 編寫組件單元測試（StockCard、子組件）
- [ ] 編寫 Hook 測試（useStockData、useMACalculation）
- [ ] 編寫整合測試
- [ ] 目標：測試覆蓋率達到 60-70%

**Day 6: E2E 測試與構建優化**
- [ ] 設置 Playwright 環境
- [ ] 編寫 E2E 測試（10-15 個關鍵場景）
- [ ] 設置 Lighthouse CI
- [ ] 執行 Lighthouse 審計
- [ ] 優化 Vite 構建配置（可選）
- [ ] 安裝構建分析工具
- [ ] 提升測試覆蓋率到 ≥ 80%
- [ ] 修復所有失敗測試

### 驗收階段（並行進行）
- [ ] 執行完整測試套件
- [ ] 驗證所有驗收標準
- [ ] 性能基準測試
- [ ] 手動 QA 測試
- [ ] 準備部署

### 部署與監控（Day 6 下午或 Day 7）
- [ ] 配置性能監控儀表板
- [ ] 設置週期性性能審計
- [ ] 部署到 staging 環境
- [ ] Beta 用戶測試（可選）
- [ ] 部署到 production 環境
- [ ] 監控性能指標

### 未來功能（暫不實施）
- [ ] 整合 Sentry 錯誤追蹤
- [ ] 視覺回歸測試
- [ ] 代碼分割優化
- [ ] 虛擬滾動支持

---

## 八、預期成果

### 性能提升
- **渲染性能**: 減少 30-50% 重渲染次數
- **首次載入時間**: 減少 40%（從 ~3s 到 ~1.8s）
- **API 請求**: 減少 60% 重複請求
- **記憶體使用**: 優化 25%
- **構建體積**: 減少 15%（通過代碼分割）

### 代碼質量
- **可維護性**: 單一組件行數 < 150 行
- **可測試性**: 測試覆蓋率 ≥ 80%
- **類型安全**: 100% TypeScript 類型覆蓋
- **代碼重複**: 減少 30%

### 用戶體驗
- **Lighthouse Performance Score**: 從 ~75 提升到 ≥ 90
- **Core Web Vitals**: 全部達到 "Good" 級別
- **可訪問性**: WCAG 2.1 Level AA 合規
- **錯誤恢復**: 單個組件錯誤不影響整體應用

### 開發體驗
- **熱更新速度**: 保持 < 100ms（Vite 優勢）
- **測試執行速度**: < 30s（單元測試）
- **CI/CD 時間**: < 5min（完整流程）
- **調試效率**: 提升 40%（通過 React Query Devtools）

---

## 九、後續優化建議

### 短期（1-2 個月）
1. 實現虛擬滾動（支持 > 18 支股票）
2. 添加 Service Worker（離線支持）
3. 實現 WebSocket 實時數據更新
4. 優化圖片和靜態資源

### 中期（3-6 個月）
1. 實現後端數據預聚合
2. 添加更多技術指標（RSI、MACD、布林帶）
3. 實現用戶自定義指標
4. 添加圖表註釋功能

### 長期（6-12 個月）
1. 遷移到 React Server Components（如適用）
2. 實現多頁面應用（使用 React Router）
3. 添加用戶認證和個人化設置
4. 實現數據匯出功能（PDF、CSV、Excel）

---

## 十、總結

本優化計劃提供了一個全面、分階段的方案來提升 MarketVue 的前端性能和代碼質量。通過三個階段的實施，我們將：

1. **解決關鍵性能瓶頸**（第一階段）
2. **優化數據層和狀態管理**（第二階段）
3. **實現進階特性和長期可維護性**（第三階段）

同時，完整的測試計劃確保所有優化不會破壞現有功能，並且達到高標準的代碼質量和性能指標。

**總投入時間**: 5-6 天（開發 + 測試）
**預期效益**: 性能提升 30-50%，代碼質量顯著改善
**風險等級**: 低（充分的測試和分階段實施）
**實施方式**: 協同合作（每步實施前說明）
**技術選型**: React Query（激進拆分 + 標準測試）
**後端需求**: 無（純前端優化方案）

---

## 附錄

### A. 參考資源
- [React 19 升級指南](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React Query 文檔](https://tanstack.com/query/latest)
- [Vite 性能優化](https://vitejs.dev/guide/performance.html)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 指南](https://www.w3.org/WAI/WCAG21/quickref/)

### B. 工具列表
- **測試**: Vitest, Playwright, React Testing Library
- **性能**: Lighthouse CI, Web Vitals, Vercel Analytics
- **監控**: Sentry, React Query Devtools
- **構建**: Vite, Rollup Visualizer
- **代碼質量**: ESLint, TypeScript, Prettier

### C. 聯絡資訊
如有疑問或需要協助，請聯繫：
- 技術負責人: [待補充]
- QA 負責人: [待補充]
- DevOps 負責人: [待補充]

---

---

## 十一、用戶決策記錄

本優化計劃已根據用戶需求進行調整：

| 決策項 | 選擇 | 說明 |
|--------|------|------|
| 優先級 | 用戶體驗 > 系統穩定性 > 開發效率 | 重點關注性能和可靠性 |
| 時間框架 | 5-6 天平衡方案 | 兩階段核心優化 |
| 數據緩存 | React Query | 自動緩存、去重、重試 |
| 組件拆分 | 激進拆分 | 單文件 < 100 行 |
| 測試深度 | 標準測試（80% 覆蓋率） | 單元測試 + E2E + Lighthouse |
| localStorage | 保留用戶數據 | 智能遷移邏輯 |
| 後端配合 | 純前端方案 | 無需後端改動 |
| Sentry | 暫不使用 | 保留為未來選項 |
| 依賴管理 | 平衡態度 | React Query + 測試工具 |
| 實施方式 | 協同合作 | 每步說明，隨時反饋 |

---

**文檔版本**: 2.0（根據用戶決策更新）
**最後更新**: 2025-11-14
**狀態**: 已確認，準備實施
**下一步**: 開始第一階段實施
