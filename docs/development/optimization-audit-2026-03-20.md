# MarketVue 優化審計報告

**日期**：2026-03-20
**版本**：v1.16.1
**審查範圍**：後端（services/routes/utils）、前端（components/hooks/api）、測試、CI/CD、依賴管理

---

## 高優先 — 影響正確性或維護成本

### 1. 前端測試覆蓋率接近零

- **位置**：`src/components/`（40 檔案）、`src/api/`（3 檔案）、`src/contexts/`（5 檔案）
- **問題**：40 個元件 + 5 個 context + 3 個 API client 完全沒有測試
- **未測試的 hooks**：`useStockSearch.ts`（159 LOC）、`useStockListReducer.ts`（245 LOC）
- **影響**：重構或新增功能時無安全網，regression 風險高

### 2. CI 不跑前端測試

- **位置**：`.github/workflows/frontend-quality.yml`
- **問題**：Vitest 沒有被 CI 呼叫；ESLint 設 `continue-on-error: true` 等於沒有品質關卡
- **影響**：即使測試失敗也能 merge，CI 形同虛設

### 3. 後端 News API silent failure

- **位置**：`backend/services/finnhub_news_fetcher.py:89-97`、`google_news_fetcher.py:95-97`
- **問題**：API 失敗一律回傳 `[]`，前端無法區分「沒有新聞」vs「服務掛了」
- **影響**：使用者看到空的新聞列表，不知道是正常還是異常；debug 困難

### 4. CompanyNameService 每次請求重讀 JSON 檔

- **位置**：`backend/services/company_name_service.py:108`
- **問題**：N+1 file I/O — 公司名稱不會在 runtime 變動，但每次 news request 都重新讀檔 + JSON parse
- **影響**：每次新聞請求都有不必要的 I/O 開銷

### 5. CandlestickChart 使用 `any` 型別

- **位置**：`src/components/CandlestickChart.tsx:34, 115`
- **問題**：`Candlestick` 和 `CustomTooltip` 都用 `props: any`，TypeScript 形同虛設
- **影響**：重構 Recharts 相關邏輯時無型別安全保護

---

## 中優先 — 程式碼品質與效能

### 6. `calculateMA` 重複定義

- **位置**：`src/api/stockApi.ts:8-22` vs `src/api/batchStockApi.ts:25-39`
- **問題**：完全相同的 moving average 計算函式寫了兩份
- **建議**：抽至 `src/utils/` 共用

### 7. DashboardGrid localStorage 重複解析

- **位置**：`src/components/DashboardGrid.tsx:130-252`
- **問題**：同一次 layout change 裡 `JSON.parse` 對同一個 key 被呼叫三次
- **影響**：每次拖曳卡片都有不必要的 JSON 解析開銷

### 8. DashboardGrid 未檢查 prefers-reduced-motion

- **位置**：`src/components/DashboardGrid.tsx:44-49`（`useTrail` animation）
- **問題**：NewsPanel 有使用 `shouldReduceMotion()` 檢查，DashboardGrid 沒有
- **影響**：對無障礙需求的使用者可能造成不適

### 9. Stock routes 日期轉換邏輯重複

- **位置**：`backend/routes/stock_routes.py:193-205`（batch）、`258-265`（parallel-batch）
- **問題**：兩個端點複製貼上相同的日期驗證和轉換邏輯
- **建議**：抽至共用函式

### 10. Service 初始化 singleton pattern 重複

- **位置**：`backend/routes/stock_routes.py:25-46` vs `backend/routes/news_routes.py:31-42`
- **問題**：相同的 `get/set_*_service` 全域 singleton 模式在兩個 route 檔案中重複
- **建議**：抽至共用工具或使用 Flask extension pattern

### 11. StockCard prop drilling

- **位置**：`src/components/stock-card/StockCard.tsx:113-140`
- **問題**：`language`、`colorTheme`、`t` 層層傳遞到子元件，但子元件可直接呼叫 `useTranslation()` 等 hooks
- **影響**：增加元件耦合度，子元件不易獨立測試和重用

### 12. `news_schemas.py` 0% 測試覆蓋率

- **位置**：`backend/schemas/news_schemas.py`（24 statements）
- **問題**：完全沒有對應的測試

### 13. NewsCard 未使用的 `language` 參數

- **位置**：`src/components/news/NewsCard.tsx:28`
- **問題**：接受 `language` 參數但不使用，用底線 prefix `_language` 隱藏
- **影響**：API 暗示支援多語言，但實際上沒有

---

## 低優先 — 開發體驗與細節

### 14. 無 Prettier / pre-commit hooks

- **位置**：專案根目錄
- **問題**：沒有 `.prettierrc`，沒有 husky/lint-staged，程式碼格式化未自動化
- **影響**：多人協作時格式不一致

### 15. `happy-dom` + `jsdom` 同時安裝

- **位置**：`package.json` devDependencies
- **問題**：vitest.config.ts 只使用 jsdom，happy-dom 可移除
- **影響**：多餘的依賴增加安裝時間

### 16. 5 個元件超過 300 行

- **位置**：
  - `DashboardGrid.tsx`（426 LOC）
  - `StockManager.tsx`（343 LOC）
  - `StockSearchInput.tsx`（339 LOC）
  - `CandlestickChart.tsx`（294 LOC，接近上限）
  - `ThemeSettings.tsx`（278 LOC）
- **問題**：超過專案 coding style 指南建議的 300 行上限

### 17. StockSearchInput 缺少 a11y 屬性

- **位置**：`src/components/StockSearchInput.tsx:214-315`
- **問題**：下拉選單沒有 `aria-selected`、`aria-live`；鍵盤導航有做但螢幕閱讀器無法正確播報

### 18. Vite 設定極簡

- **位置**：`vite.config.ts`（7 行）
- **問題**：無 resolve aliases、無 bundle 分析、無環境特定設定
- **影響**：缺少進階優化機會

### 19. CSP 設定使用 `unsafe-inline`

- **位置**：`backend/app.py:100-102`
- **問題**：script-src 和 style-src 允許 `unsafe-inline`，削弱 Content Security Policy 保護
- **影響**：降低 XSS 防護效果

---

## 建議執行順序

依「投資報酬率」排序：

| 順序 | 項目                                            | 預估工作量 | 效益                          |
| ---- | ----------------------------------------------- | ---------- | ----------------------------- |
| 1    | 修 CI：加 Vitest、移除 ESLint continue-on-error | 小         | 建立品質關卡                  |
| 2    | 修 silent failure：news API 回傳 error status   | 小         | 改善 debug 能力               |
| 3    | 快取 CompanyNameService                         | 小         | 最明顯的效能改善              |
| 4    | 消除重複碼：calculateMA、stock routes 日期邏輯  | 小         | 降低維護成本                  |
| 5    | 逐步補前端測試：核心 hooks → API client → 元件  | 大（持續） | 建立重構安全網                |
| 6    | CandlestickChart 型別安全                       | 中         | 預防 Recharts 升級 regression |
| 7    | 解除 StockCard prop drilling                    | 中         | 改善元件架構                  |
| 8    | 元件拆分（>300 LOC）                            | 中         | 提升可讀性                    |
| 9    | a11y 改善                                       | 中         | 無障礙合規                    |
| 10   | 加 Prettier + pre-commit hooks                  | 小         | 統一格式                      |
