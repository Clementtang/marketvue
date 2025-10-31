# Stock Dashboard Frontend Guide

## 功能概覽

這個 React 應用程式提供了一個專業的股票追蹤儀表板，包含以下功能：

### 1. 股票管理面板 (StockManager)
**位置:** `src/components/StockManager.tsx`

**功能:**
- 輸入框可新增股票代號
- 顯示當前追蹤的股票列表（最多 9 支）
- 每支股票都有刪除按鈕
- 輸入驗證：避免重複、檢查最大數量
- 資料持久化：使用 localStorage 保存

**使用方式:**
```typescript
<StockManager
  stocks={['AAPL', 'GOOGL']}
  onAddStock={(symbol) => console.log('Added:', symbol)}
  onRemoveStock={(symbol) => console.log('Removed:', symbol)}
/>
```

### 2. 時間範圍選擇器 (TimeRangeSelector)
**位置:** `src/components/TimeRangeSelector.tsx`

**功能:**
- 快速選項按鈕：3M, 6M, 1Y, 2Y, 5Y, YTD
- 自定義日期選擇器（開始日期、結束日期）
- 日期驗證：確保開始日期早於結束日期
- 顯示當前選擇的時間範圍

**使用方式:**
```typescript
<TimeRangeSelector
  currentRange={{
    startDate: '2024-01-01',
    endDate: '2024-10-22',
    preset: '3m'
  }}
  onRangeChange={(range) => console.log('Range changed:', range)}
/>
```

### 3. 3x3 儀表板網格 (DashboardGrid)
**位置:** `src/components/DashboardGrid.tsx`

**功能:**
- 使用 react-grid-layout 實現可拖拉排列
- 3 列 x 最多 3 行的網格佈局
- 每個格子顯示一支股票的圖表
- 拖拉手柄位於每張卡片頂部
- 自動調整佈局以適應股票數量

**使用方式:**
```typescript
<DashboardGrid
  stocks={['AAPL', 'GOOGL', 'MSFT']}
  startDate="2024-01-01"
  endDate="2024-10-22"
  onNewsClick={(symbol, news) => console.log('Show news for:', symbol)}
/>
```

### 4. 股票卡片組件 (StockCard)
**位置:** `src/components/StockCard.tsx`

**功能:**
- 顯示股票代號和名稱
- 當前價格和漲跌幅（紅綠色標示）
- 價格走勢線圖（使用 Recharts）
- 成交量柱狀圖
- 新聞按鈕：點擊展開最新 5 筆新聞
- 載入狀態和錯誤處理

**特色:**
- 自動從 Flask API 獲取數據
- 響應式圖表設計
- 綠色表示上漲，紅色表示下跌
- 成交量自動格式化（K, M）

### 5. 新聞面板 (NewsPanel)
**位置:** `src/components/NewsPanel.tsx`

**功能:**
- 側邊欄模式顯示
- 顯示標題、來源、發布時間
- 新聞縮圖（如果有）
- 點擊可開啟原文連結
- 優雅的進入/退出動畫
- 半透明背景遮罩

**使用方式:**
```typescript
<NewsPanel
  isOpen={true}
  onClose={() => console.log('Close panel')}
  symbol="AAPL"
  news={[
    {
      title: 'Apple announces new product',
      publisher: 'Reuters',
      link: 'https://...',
      published_date: '2024-10-22 10:30:00',
      thumbnail: 'https://...'
    }
  ]}
/>
```

## 技術棧

- **React 18** - UI 框架
- **TypeScript** - 型別安全
- **TailwindCSS** - 樣式框架
- **Recharts** - 圖表庫
- **react-grid-layout** - 可拖拉網格
- **lucide-react** - 圖標庫
- **date-fns** - 日期處理
- **axios** - HTTP 請求

## 樣式設計

### 色彩方案
- **主色調:** 藍色 (#2563eb - blue-600)
- **成功/上漲:** 綠色 (#16a34a - green-600)
- **錯誤/下跌:** 紅色 (#dc2626 - red-600)
- **背景:** 灰色 (#f9fafb - gray-50)
- **卡片:** 白色 (#ffffff)

### 設計原則
- 乾淨專業的介面
- 充足的留白空間
- 清晰的視覺層次
- 響應式設計
- 平滑的過渡動畫

## API 整合

### 環境變數
```bash
VITE_API_URL=http://localhost:5001
```

### API 端點使用

**獲取股票數據:**
```typescript
POST /api/stock-data
Body: {
  symbol: 'AAPL',
  start_date: '2024-01-01',
  end_date: '2024-10-22'
}
```

**獲取新聞:**
```typescript
GET /api/stock-news/{symbol}?limit=5
```

## 檔案結構

```
src/
├── components/
│   ├── StockManager.tsx      # 股票管理
│   ├── TimeRangeSelector.tsx # 時間選擇
│   ├── DashboardGrid.tsx     # 網格佈局
│   ├── StockCard.tsx         # 股票卡片
│   └── NewsPanel.tsx         # 新聞面板
├── App.tsx                   # 主應用
├── App.css                   # 應用樣式
├── index.css                 # 全局樣式
└── main.tsx                  # 入口點
```

## 狀態管理

使用 React Hooks 進行狀態管理：

```typescript
// 股票列表
const [stocks, setStocks] = useState<string[]>([]);

// 時間範圍
const [dateRange, setDateRange] = useState<DateRange>({...});

// 新聞面板
const [newsPanel, setNewsPanel] = useState<{...}>({...});
```

## 本地儲存

股票列表會自動保存到 localStorage：

```typescript
// 儲存
localStorage.setItem('tracked-stocks', JSON.stringify(stocks));

// 讀取
const savedStocks = localStorage.getItem('tracked-stocks');
```

## 使用提示

1. **新增股票:** 在股票管理器輸入代號（如 AAPL, GOOGL），點擊「Add」
2. **選擇時間範圍:** 點擊快速選項或使用自定義日期
3. **拖拉排列:** 在卡片頂部拖拉手柄拖動卡片
4. **查看新聞:** 點擊卡片右上角的新聞圖標
5. **刪除股票:** 在股票管理器點擊股票旁的 X

## 響應式設計

- **桌面:** 完整 3x3 網格佈局
- **平板:** 自動調整卡片大小
- **手機:** 新聞面板全屏顯示

## 效能優化

- 使用 React.memo 減少不必要的重渲染
- 圖表數據僅在必要時更新
- API 請求帶有快取機制（後端 5 分鐘快取）
- 懶加載和代碼分割

## 未來擴展建議

1. 新增暗黑模式
2. 股票比較功能
3. 技術指標（RSI, MACD 等）
4. 價格警報功能
5. 匯出數據為 CSV
6. 多語言支援
7. 自定義主題顏色
8. 股票收藏/分類功能
