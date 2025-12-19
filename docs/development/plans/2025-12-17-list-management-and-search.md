# MarketVue 功能優化計畫

## 狀態

- **Phase 1（清單管理）**：✅ 已完成 - v1.10.0 (2025-12-17)
- **Phase 2（搜尋建議）**：✅ 已完成 - v1.11.0 (2025-12-17)

## 概要

新增兩個功能：
1. **搜尋建議**：輸入時顯示符合的股票建議
2. **清單管理**：支援多個自訂觀察清單

---

## 功能一：搜尋建議

### 方案：靜態股票清單 + 前端即時過濾

**優點**：載入快、離線可用、無 API 成本

### 新增檔案

| 檔案 | 說明 |
|-----|------|
| `src/types/stockSearch.ts` | 型別定義 |
| `src/data/stocks/index.ts` | 統一匯出 |
| `src/data/stocks/tw-listed.json` | 台股上市 (~200 檔熱門) |
| `src/data/stocks/tw-otc.json` | 台股上櫃 (~100 檔熱門) |
| `src/data/stocks/us-popular.json` | 美股熱門 (~200 檔) |
| `src/data/stocks/jp-popular.json` | 日股熱門 (~50 檔) |
| `src/data/stocks/hk-popular.json` | 港股熱門 (~50 檔) |
| `src/hooks/useStockSearch.ts` | 搜尋邏輯 Hook |
| `src/components/StockSearchInput.tsx` | 搜尋輸入元件 |
| `src/components/StockSuggestionDropdown.tsx` | 下拉建議元件 |

### 修改檔案

| 檔案 | 修改內容 |
|-----|---------|
| `src/components/StockManager.tsx` | 整合搜尋元件 |
| `src/i18n/translations.ts` | 新增翻譯 |

### JSON 格式

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-12-17",
  "stocks": [
    {
      "symbol": "2330.TW",
      "name": { "zh-TW": "台積電", "en-US": "TSMC" },
      "market": "TW",
      "aliases": ["台積", "TSMC"]
    }
  ]
}
```

### 搜尋邏輯

- 代號完全匹配：100 分
- 代號開頭匹配：80 分
- 代號包含匹配：60 分
- 名稱開頭匹配：50 分
- 名稱包含匹配：30 分
- 別名匹配：40 分
- 最多顯示 10 筆結果

### UI 互動

1. 輸入 >= 1 字元開始搜尋
2. 顯示下拉建議（代號 + 公司名稱 + 市場標籤）
3. 鍵盤：上/下導航、Enter 選擇、Escape 關閉
4. 已追蹤的股票顯示勾選標記

---

## 功能二：清單管理

### 規格

- 最多 **5 個清單**
- 每清單最多 **18 檔股票**
- 類似瀏覽器書籤資料夾切換
- 預設清單不可刪除

### 新增檔案

| 檔案 | 說明 |
|-----|------|
| `src/types/stockList.ts` | 型別定義 |
| `src/contexts/StockListContext.tsx` | 清單管理 Context |
| `src/hooks/useStockListReducer.ts` | 狀態 Reducer |
| `src/components/StockListSelector.tsx` | 清單切換選擇器 |
| `src/components/CreateListModal.tsx` | 建立清單 Modal |
| `src/components/RenameListModal.tsx` | 重命名 Modal |
| `src/components/DeleteListConfirm.tsx` | 刪除確認 Dialog |
| `src/utils/migration.ts` | 舊資料遷移 |

### 修改檔案

| 檔案 | 修改內容 |
|-----|---------|
| `src/App.tsx` | 整合 StockListProvider，移除現有 stocks 狀態 |
| `src/components/StockManager.tsx` | 使用 useStockList hook |
| `src/config/constants.ts` | 新增 STOCK_LIST_CONFIG |
| `src/i18n/translations.ts` | 新增翻譯 |

### localStorage 結構

```typescript
// key: 'marketvue-stock-lists'
{
  schemaVersion: 1,
  state: {
    lists: [
      {
        id: 'default',
        name: 'My Watchlist',
        stocks: ['2330.TW', 'AAPL'],
        createdAt: '2024-12-17T00:00:00Z',
        updatedAt: '2024-12-17T10:30:00Z',
        isDefault: true
      }
    ],
    activeListId: 'default',
    version: 1
  }
}
```

### UI 設計

```
[當前清單名稱 ▼] [+ 新清單]

下拉選單:
┌─────────────────────────┐
│ ✓ My Watchlist (3)      │  <- 預設，不可刪除
│   Tech Stocks (5)    ⋮  │  <- hover 顯示操作
│   投資組合 A (8)      ⋮  │
├─────────────────────────┤
│ + 建立新清單             │
│ 💾 另存為新清單          │
└─────────────────────────┘
```

### 資料遷移

自動將舊版 `tracked-stocks` 遷移到新格式的預設清單。

---

## 實作順序

### Phase 1：清單管理 ✅ 已完成

1. ✅ 型別定義 `src/types/stockList.ts`
2. ✅ 常數配置 `src/config/constants.ts`
3. ✅ Reducer `src/hooks/useStockListReducer.ts`
4. ✅ Context `src/contexts/StockListContext.tsx`
5. ✅ 遷移邏輯 `src/utils/migration.ts`
6. ✅ 修改 `src/App.tsx` 整合 Provider
7. ✅ UI 元件：StockListSelector, CreateListModal, RenameListModal, DeleteListConfirm
8. ✅ 修改 `src/components/StockManager.tsx`
9. ✅ 翻譯 `src/i18n/translations.ts`
10. ✅ 測試遷移和基本功能

### Phase 2：搜尋建議 ✅ 已完成

1. ✅ 型別定義 `src/types/stockSearch.ts`
2. ✅ 準備 JSON 資料檔（台股、美股、日股、港股）
   - `tw-listed.json` - 台股上市 ~100 檔
   - `tw-otc.json` - 台股上櫃 ~54 檔
   - `us-popular.json` - 美股熱門 ~120 檔
   - `jp-popular.json` - 日股熱門 ~50 檔
   - `hk-popular.json` - 港股熱門 ~50 檔
   - 總計：~374 檔股票
3. ✅ 資料匯出 `src/data/stocks/index.ts`
4. ✅ 搜尋 Hook `src/hooks/useStockSearch.ts`
5. ✅ UI 元件：StockSearchInput（整合搜尋輸入與下拉建議）
6. ✅ 整合到 StockManager
7. ✅ 翻譯
8. ✅ 測試搜尋功能

---

## 關鍵檔案路徑

- `src/App.tsx` - 主應用，整合 StockListProvider
- `src/components/StockManager.tsx` - 股票輸入，整合搜尋和清單 UI
- `src/contexts/AppContext.tsx` - Context 模式參考
- `src/hooks/usePersistedState.ts` - 持久化 Hook
- `src/i18n/translations.ts` - 翻譯檔案
- `src/config/constants.ts` - 常數配置

---

## 翻譯 Key 清單

### 搜尋功能
- `searchPlaceholder` - 搜尋股票代號或名稱
- `noSearchResults` - 找不到符合的股票
- `stockAlreadyTracked` - 已追蹤
- `marketTW/TWO/US/JP/HK` - 市場標籤

### 清單功能
- `stockLists` - 股票清單
- `myWatchlist` - 我的觀察清單
- `createNewList` - 建立新清單
- `saveAsCopy` - 另存為新清單
- `renameList` - 重新命名
- `deleteList` - 刪除清單
- `listName` - 清單名稱
- `deleteListConfirm` - 確定要刪除「{name}」清單嗎？
- `maxListsReached` - 已達清單數量上限（5 個）
- `stockCount` - {count} 檔股票
