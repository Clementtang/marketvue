# MarketVue 專案全面稽核報告

**審查日期**：2026-03-23 | **版本**：v1.16.1
**審查方式**：5 個專門 sub-agent 平行審查，涵蓋功能、UI/UX、程式碼品質、文件、GitHub Repo

**回應者**：芙莉蓮（Claude Opus 4.6）| **回應日期**：2026-03-23
**回應方式**：逐項讀取原始碼驗證，標註同意/部分同意/不同意，提出修改方案

---

## Top 5 最應優先處理的問題（跨面向排序）

| #     | 面向   | 問題                                                                                             | 理由                                           | 修復成本                |
| ----- | ------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ----------------------- |
| **1** | 程式碼 | **後端 500 錯誤洩漏 `str(e)` 到客戶端**（`backend/utils/decorators.py:45`）                      | 安全性問題（OWASP A05），production 已在線上   | 極低（改一行）          |
| **2** | 功能   | **`batchStockApi` 重複請求 Promise 永遠不 resolve**（`src/api/batchStockApi.ts:154-168`）        | 真正的 bug，同時請求同一 symbol 時 UI 永久卡住 | 低                      |
| **3** | Repo   | **npm audit 6 個已知漏洞（5 high, 1 moderate）**：rollup Path Traversal、undici HTTP Smuggling   | 供應鏈風險                                     | 極低（`npm audit fix`） |
| **4** | 功能   | **`dateRange` 的 `endDate` 從 localStorage 恢復舊日期**（`src/contexts/ChartContext.tsx:31-35`） | 靜默的資料缺失，使用者不會察覺但每天都受影響   | 低                      |
| **5** | UI/UX  | **GridLayout 在行動裝置完全不可用**（`src/components/DashboardGrid.tsx:375`）                    | 阻斷所有行動用戶                               | 中高                    |

### Top 5 回應

> **#1 後端 500 錯誤洩漏 `str(e)`** — ✅ 同意
> `decorators.py:44-46` 確認 500 回應包含 `'message': str(e)`。移除該行，只保留 `'error': 'Internal server error'`。

> **#2 `batchStockApi` Promise 永遠不 resolve** — ✅ 同意
> `batchStockApi.ts:154-168` 確認：當 `queue.has(key)` 時，第 157 行 `return new Promise(...)` 在外層 Promise callback 內返回，外層 Promise 永遠不 resolve。改用 `Map<string, Promise<StockData>>` 存 pending Promise，第二個 caller 直接 return 同一個 Promise。

> **#3 npm audit 6 個漏洞** — ✅ 同意
> 實際執行 `npm audit` 確認 6 個漏洞（5 high, 1 moderate），包含 axios、rollup、undici、minimatch、flatted、ajv，全部 `fix available`。與報告描述略有出入（報告側重 rollup + undici，實際還有 axios 等），但問題真實存在。直接執行 `npm audit fix`。

> **#4 `dateRange` endDate 過期** — ⚠️ 部分同意
> `ChartContext.tsx:31-35` 使用 `usePersistedState` 儲存 dateRange。若使用者選的是 preset（1m、3m 等），preset 會觸發重新計算日期；只有手動設定日期區間才會「卡住」。問題存在但影響範圍比報告描述的小。方案：初始化時若 `preset !== 'custom'`，根據 preset 重新計算 `endDate = today`。

> **#5 GridLayout 行動裝置不可用** — ✅ 同意
> `DashboardGrid.tsx:375-386` 確認 `cols={3}` 和 `rowHeight={220}` 硬編碼。方案：偵測行動裝置時 `cols={1}`、`rowHeight={280}`、禁用拖曳與 resize。中高成本改動。

---

## 1. 功能完整性審查（4 Critical / 6 Warning / 4 Suggestion）

### Critical

| 問題描述                                                                                                                   | 位置                                                                                            | 影響                                 | 建議改善方式                           |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------- |
| **批次上限不一致**：`stock_schemas.py:84` 硬寫 max=9，`constants.py:21` 定義 18，前端 `batchStockApi.ts:71` 也寫死 9       | `backend/schemas/stock_schemas.py:84`, `backend/constants.py:21`, `src/api/batchStockApi.ts:71` | 三處數字不統一，修改任一處其他不連動 | Schema 改引用 `MAX_BATCH_SYMBOLS` 常數 |
| **StockListContext 雙重初始化**：`useState` lazy init + `useEffect` 又呼叫一次 `loadStoredState`，切換語言可能覆蓋已有資料 | `src/contexts/StockListContext.tsx:94, 98-102`                                                  | 潛在資料丟失風險                     | 移除 `useEffect` 內的重複呼叫          |
| **REORDER_STOCKS reducer 無邊界保護**：不驗證股票數、重複、是否屬於當前清單                                                | `src/hooks/useStockListReducer.ts:193-207`                                                      | 拖曳排序時可能污染 localStorage      | 加入 `slice(0, MAX)` 及去重邏輯        |
| **新聞 `_sort_and_filter` 日期解析失敗仍保留文章**：設為 `datetime.min` 但未過濾，違反 72 小時設計                         | `backend/services/news_service.py:149-150`                                                      | 可能顯示超過 72 小時的舊新聞         | 解析失敗應 `continue` 略過             |

#### Critical 回應

> **批次上限不一致** — ✅ 同意
> `constants.py:21` 定義 `MAX_BATCH_SYMBOLS = 18`，`stock_schemas.py:84` 硬寫 `max=9`，`batchStockApi.ts:71` 硬寫 `MAX_BATCH_SIZE = 9`。三處確實不同步。Schema 改 `from backend.constants import MAX_BATCH_SYMBOLS` 引用常數，前端同步在 `src/config/constants.ts` 定義並引用。

> **StockListContext 雙重初始化** — ✅ 同意
> `StockListContext.tsx:94` 的 `useState(() => loadStoredState(...))` 已是 lazy init，第 98-101 行 `useEffect` 又呼叫一次 `loadStoredState` 並 `setState`。語言切換觸發 `defaultListName` 變更時會覆蓋用戶操作。移除 `useEffect` 中的 `loadStoredState` 呼叫。

> **REORDER_STOCKS reducer 無邊界保護** — ⚠️ 部分同意
> `useStockListReducer.ts:193-206` 確認直接取用 `action.payload.stocks` 不做驗證。但 dispatch 來源是受控的拖曳排序元件，被污染機率低。加防禦性檢查成本也低，建議加入 `slice(0, MAX)` 和去重。

> **新聞日期解析失敗仍保留文章** — ✅ 同意
> `news_service.py:147-150`：try 區塊內有 `if dt >= cutoff` 過濾，但 except 區塊（第 149-150 行）無條件 append `datetime.min`，繞過了 cutoff 檢查。except 區塊改為 `continue`。

### Warning

| 問題描述                                                                                                                              | 位置                                                                                          | 影響                                   | 建議改善方式                            |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------- |
| **`batchStockApi` 重複請求 Promise 永遠不 resolve**：第二個 caller 的 Promise 掛起                                                    | `src/api/batchStockApi.ts:154-168`                                                            | 同時請求同一 symbol 時 UI 卡在 loading | 改用 Map 存 Promise 直接返回            |
| **Render 冷啟動 retry 不足**：`useStockData` 指數退避最多 8s，但冷啟動要 30-60s；`errorHandlers.ts` 的 `calculateRetryDelay` 未被使用 | `src/components/stock-card/hooks/useStockData.ts:66-70`, `src/utils/errorHandlers.ts:117-119` | 3 次 retry 共 14s 後全部失敗           | 503 回應使用更長的 retry delay          |
| **新聞 retry 觸發 `window.location.reload()`**                                                                                        | `src/components/news/NewsPanel.tsx:148-155`                                                   | 清除所有 React Query cache             | 改用 `refetch()`                        |
| **`dateRange` 的 `endDate` 不自動更新**：從 localStorage 恢復昨天的日期                                                               | `src/contexts/ChartContext.tsx:31-35`                                                         | 資料永遠少一天，使用者不知情           | Preset 選擇時重新計算 `endDate = today` |
| **Google News RSS URL 是重定向 URL**，非原文連結                                                                                      | `backend/services/google_news_fetcher.py:126-133`                                             | Google 改格式後全部失效                | 嘗試解析真實 URL 或標示需跳轉           |
| **`importStocks` 跳過計數 off-by-one**                                                                                                | `src/contexts/StockListContext.tsx:191-193`                                                   | Toast 訊息數字不準確                   | 改用 `length - added - skipped` 計算    |

#### Warning 回應

> **`batchStockApi` 重複請求 Promise 不 resolve** — ✅ 同意（與 Top 5 #2 重複，同一問題）

> **Render 冷啟動 retry 不足** — ✅ 同意
> `useStockData.ts:66-70` retry delay 為 2s/4s/8s（共 14s）。`errorHandlers.ts:112-124` 有專門的 `calculateRetryDelay` 可對 503 給出 5s/10s/15s，但未被引用。在 `retryDelay` callback 中引入 `calculateRetryDelay`，或至少對 503 使用更長 delay。

> **新聞 retry 觸發 `window.location.reload()`** — ✅ 同意
> `NewsPanel.tsx:148` 確認使用 `window.location.reload()`。改用 React Query 的 `refetch()`。

> **`dateRange` endDate 不自動更新** — ⚠️ 部分同意（與 Top 5 #4 重複，見 Top 5 回應）

> **Google News RSS URL 是重定向 URL** — ⚠️ 部分同意
> `google_news_fetcher.py:129` 確認直接取 RSS link（Google 重定向 URL）。這是 Google News RSS 的已知行為，解析真實 URL 需額外 HTTP 請求且不穩定。短期可標示為重定向 link，長期可背景 follow redirect 並 cache。

> **`importStocks` 跳過計數 off-by-one** — ✅ 同意
> `StockListContext.tsx:191-192` 達到上限時 `skipped += symbols.length - symbols.indexOf(symbol)`，`indexOf` 找的是原始（非 upperCase）symbol，且不含已累計的 `skipped` 數。改用 `symbols.length - added - skipped` 計算。

### Suggestion

| 問題描述                                                   | 位置                                                                                     | 影響                         | 建議改善方式                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------- |
| Finnhub 用本地時間、sort_and_filter 用 UTC，時區不一致     | `backend/services/finnhub_news_fetcher.py:60-61`, `backend/services/news_service.py:139` | 非 UTC 伺服器上過濾不準      | 統一使用 `datetime.now(timezone.utc)` |
| 截圖只拍當前頁面，無提示                                   | `src/components/DashboardGrid.tsx:367`                                                   | 使用者以為截到全部           | 顯示提示或提供全頁截圖                |
| 語言切換觸發不必要的 localStorage 重讀                     | `src/contexts/StockListContext.tsx:98-102`                                               | 輕微效能問題                 | 初始化只呼叫一次                      |
| `handleLayoutChange` 重複解析 localStorage，錯誤處理不一致 | `src/components/DashboardGrid.tsx:180-263`                                               | logger vs console.error 混用 | 提取統一的 helper                     |

---

## 2. UI/UX 審查（4 Critical / 8 Warning / 8 Suggestion）

### Critical

| 問題描述                                                                        | 位置                                                                                                                                            | 影響               | 建議改善方式                            |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------- |
| **GridLayout 在行動裝置完全不可用**：固定 3 欄 220px 在 375px 螢幕無法閱讀      | `src/components/DashboardGrid.tsx:375`                                                                                                          | 所有行動用戶受影響 | `isMobile` 時切換為單欄捲動佈局         |
| **`useIsMobile` Hook 有競態風險**：每次掛載重建 listener，SSR 直接存取 `window` | `src/components/news/NewsPanel.tsx:21-31`                                                                                                       | 可能拋例外         | 抽成共用 Hook，加 `typeof window` 防禦  |
| **所有 modal 缺少 focus trap**：Tab 鍵可離開到背景                              | `src/components/stock-list/CreateListModal.tsx:65`, `src/components/ThemeSettings.tsx:88`, `src/components/stock-list/StockListSelector.tsx:94` | 無障礙基本不合規   | 使用 Radix Dialog 或手動實作 focus trap |
| **NewsPanel 錯誤恢復觸發全頁重整**                                              | `src/components/news/NewsPanel.tsx:150`                                                                                                         | 清除所有狀態       | 改用 `refetch()`                        |

#### Critical 回應

> **GridLayout 行動裝置不可用** — ✅ 同意（與 Top 5 #5 重複，見 Top 5 回應）

> **`useIsMobile` Hook 有競態風險** — ⚠️ 部分同意
> `NewsPanel.tsx:21-31` 已有 `typeof window !== "undefined"` 防禦。本專案是純 SPA 不做 SSR，SSR 問題不存在。但每次使用都重建 listener 確實浪費。抽成 `src/hooks/useIsMobile.ts` 共用 Hook，降級為 Warning。

> **所有 modal 缺少 focus trap** — ✅ 同意
> `CreateListModal.tsx:65` 確認是普通 `<div>` 無 focus trap、無 `role="dialog"`、無 `aria-modal`。`ThemeSettings.tsx:88` 和 `StockListSelector.tsx:94` 同樣。引入 `@radix-ui/react-dialog` 或手動鎖定 Tab 循環，先處理 CreateListModal。

> **NewsPanel 錯誤恢復觸發全頁重整** — ✅ 同意（與功能面向重複，改用 `refetch()`）

### Warning

| 問題描述                                                           | 位置                                                      | 影響                       | 建議改善方式                    |
| ------------------------------------------------------------------ | --------------------------------------------------------- | -------------------------- | ------------------------------- |
| ThemeSettings 無 ARIA role、無 ESC 關閉                            | `src/components/ThemeSettings.tsx:88`                     | Screen reader 不知有 panel | 加 `role="dialog"` + ESC 鍵     |
| `StockCardFooter` wrapper 有 `cursor-pointer` 但無 click handler   | `src/components/stock-card/StockCardFooter.tsx:38`        | 誤導使用者                 | 移除或加入行為                  |
| Header `py-8` + `text-4xl` 在小螢幕佔過多空間                      | `src/App.tsx:69`                                          | 浪費螢幕空間               | 響應式調整 padding/font-size    |
| StockListSelector 的 Rename/Delete 靠 hover 顯示，觸控裝置無法觸及 | `src/components/stock-list/StockListSelector.tsx:135-192` | 行動用戶無法管理清單       | 改用長按或直接顯示              |
| SummaryBar 股票列表在小螢幕 `hidden`                               | `src/components/SummaryBar.tsx:76`                        | 資訊量過少                 | 至少顯示 1-2 個 symbol          |
| Toast `max-w-sm` 在 375px 螢幕可能被擠壓                           | `src/components/common/Toast.tsx:99`                      | 長訊息截斷                 | 行動裝置改為全寬                |
| ControlPanel 展開/收合無過渡動畫                                   | `src/components/ControlPanel.tsx:32,42`                   | 收合瞬間消失               | 用 react-spring `useTransition` |
| 搜尋下拉 `z-50` 可能有 stacking context 問題                       | `src/components/StockSearchInput.tsx:217`                 | 某些瀏覽器遮蓋             | 改用 `createPortal`             |

#### Warning 回應

> **ThemeSettings 無 ARIA role、無 ESC 關閉** — ✅ 同意
> `ThemeSettings.tsx:88-89` 確認是普通 `<div>` 無 role 也無 ESC handler。加 `role="dialog"` + `aria-modal="true"` + `onKeyDown` ESC handler。

> **`StockCardFooter` cursor-pointer 無 click handler** — ✅ 同意
> `StockCardFooter.tsx:38` 確認外層 `<div>` 有 `cursor-pointer` 但無 `onClick`。移除 `cursor-pointer`。

> **Header `py-8` 在小螢幕佔過多空間** — ✅ 同意
> `App.tsx:69` 確認 `py-8` 無響應式變化。改為 `py-4 sm:py-8`，title 改為 `text-2xl sm:text-4xl`。

> **StockListSelector Rename/Delete 靠 hover 顯示** — ✅ 同意
> `StockListSelector.tsx:186-191` 確認操作按鈕用 `opacity-0` + hover 控制，觸控裝置無法觸發。行動裝置改為 always visible 或加入長按手勢。

> **SummaryBar 股票列表在小螢幕 `hidden`** — ✅ 同意
> `SummaryBar.tsx:75-76` 確認 `hidden sm:flex`。至少顯示首個 symbol 或股票總數。

> **Toast `max-w-sm` 在 375px 被擠壓** — ⚠️ 部分同意
> `Toast.tsx:99` 確認 `max-w-sm w-full`。`max-w-sm`（384px）加上 `right-4`（16px）確實溢出 375px 螢幕，但實際影響有限。改為 `max-w-[calc(100vw-2rem)]`。

> **ControlPanel 展開/收合無過渡動畫** — ⚠️ 部分同意
> `ControlPanel.tsx:32,42` 有 `animate-fade-in` class（淡入動畫），但切換是條件渲染（瞬間 mount/unmount），不是高度過渡。可用 CSS transition 或 react-spring，低優先。

> **搜尋下拉 `z-50` stacking context 問題** — ⚠️ 部分同意
> 多處都用 `z-50`（SearchInput、StockListSelector、Toast），確實可能衝突。建立 z-index scale 或改用 `createPortal`，低優先。

### Suggestion

| 問題描述                                       | 位置                                                      | 影響                            | 建議改善方式       |
| ---------------------------------------------- | --------------------------------------------------------- | ------------------------------- | ------------------ |
| 首次使用無 Onboarding 提示                     | `src/components/DashboardGrid.tsx:271`                    | 新用戶不知如何操作              | 空狀態加範例按鈕   |
| StockCardError 不區分錯誤類型                  | `src/components/stock-card/StockCardError.tsx:47`         | 使用者無法判斷原因              | 按類型顯示不同提示 |
| PageNavigator 無頁碼跳轉                       | `src/components/PageNavigator.tsx:50-95`                  | 多頁時導航效率低                | 加入可點擊頁碼     |
| StockListSelector 內嵌 `<style>` 標籤          | `src/components/stock-list/StockListSelector.tsx:105-114` | 每次 render 注入全域 CSS        | 移入 index.css     |
| NotificationBanner dismiss key 無版本控制      | `src/components/NotificationBanner.tsx:9`                 | 更新內容後已 dismiss 用戶看不到 | Key 加版本號       |
| Drag handle 只在 hover 才可見                  | `src/components/DashboardGrid.tsx:397`                    | 使用者不知可拖曳                | 預設保持微透明     |
| ThemeSettings 按鈕只有 `title` 無 `aria-label` | `src/components/ThemeSettings.tsx:83`                     | 觸控裝置/SR 支援不足            | 改用 `aria-label`  |
| NewsCard 用 `<div onClick>` 而非 `<a>`         | `src/components/news/NewsCard.tsx:41`                     | 鍵盤用戶無法 Enter 觸發         | 改為 `<a>` 標籤    |

---

## 3. 程式碼品質審查（3 Critical / 7 Warning / 7 Suggestion）

### Critical

| 問題描述                                      | 位置                                           | 影響               | 建議改善方式                       |
| --------------------------------------------- | ---------------------------------------------- | ------------------ | ---------------------------------- |
| **後端 500 錯誤洩漏 `str(e)` 到客戶端**       | `backend/utils/decorators.py:45`               | OWASP A05 資訊洩漏 | 統一回傳 `'Internal server error'` |
| **StockListContext 雙重初始化**（同功能面向） | `src/contexts/StockListContext.tsx:94, 98-102` | 資料丟失風險       | 移除 useEffect 重複呼叫            |
| **批次 Schema limit 硬寫 9**（同功能面向）    | `backend/schemas/stock_schemas.py:84`          | 常數形同虛設       | 引用常數                           |

#### Critical 回應

> **後端 500 錯誤洩漏 `str(e)`** — ✅ 同意（與 Top 5 #1 重複，見 Top 5 回應）

> **StockListContext 雙重初始化** — ✅ 同意（與功能面向重複，見功能 Critical 回應）

> **批次 Schema limit 硬寫 9** — ✅ 同意（與功能面向重複，見功能 Critical 回應）

### Warning

| 問題描述                                                              | 位置                                                       | 影響                      | 建議改善方式              |
| --------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------- | ------------------------- |
| Finnhub 時區混用（本地 vs UTC）                                       | `backend/services/finnhub_news_fetcher.py:104`             | 過濾不準確                | 統一 UTC                  |
| `VisualThemeContext` 自寫 localStorage 邏輯，不用 `usePersistedState` | `src/contexts/VisualThemeContext.tsx`                      | DRY 違反                  | 改用共用 hook             |
| `NewsResponseSchema` 殘留 `has_more`/`limit`/`page`，已在 v1.15 移除  | `backend/schemas/news_schemas.py:25`                       | Schema 與實際不同步       | 清除殘留欄位              |
| `DashboardGrid` 多處繞過 localStorage util 直接讀寫                   | `src/components/DashboardGrid.tsx:109, 131, 226, 237, 259` | Safari 私密模式可能 crash | 改用統一工具函式          |
| `batchStockApi` 重複請求 Promise 洩漏（同功能面向）                   | `src/api/batchStockApi.ts:154-168`                         | UI 卡住                   | 重構為 Map 模式           |
| `getErrorMessage` 用 `any` 型別                                       | `src/utils/errorHandlers.ts:16-18`                         | 編譯器無法捕錯            | 改用 `unknown` + 型別縮窄 |
| NewsPanel reload（同功能面向）                                        | `src/components/news/NewsPanel.tsx:149`                    | 全頁重整                  | 改用 refetch              |

#### Warning 回應

> **Finnhub 時區混用** — ✅ 同意
> `finnhub_news_fetcher.py:60` 用 `datetime.now()`（本地時間），第 104 行 `datetime.fromtimestamp()` 也是本地時間；而 `news_service.py:139` 用 `datetime.now(timezone.utc)`。統一使用 `datetime.now(timezone.utc)` 和 `datetime.fromtimestamp(ts, tz=timezone.utc)`。

> **`VisualThemeContext` 不用 `usePersistedState`** — ✅ 同意
> `VisualThemeContext.tsx:24-40` 自寫 localStorage 讀寫邏輯，專案已有 `usePersistedState`。改用 `usePersistedState<VisualTheme>('marketvue_visual_theme', 'classic')`。

> **`NewsResponseSchema` 殘留欄位** — ✅ 同意
> `news_schemas.py:25` 有 `has_more`，第 31-38 行有 `limit` 和 `page`。v1.15 已移除分頁但 Schema 未清理。移除殘留欄位和 `validate_limit` 方法。

> **`DashboardGrid` 繞過 localStorage util** — ✅ 同意
> `DashboardGrid.tsx:109, 120, 123-124, 131` 多處直接 `localStorage.getItem/setItem/removeItem`。Safari 私密模式可能拋異常。用 try-catch 包裹或改用專案的 localStorage 工具函式。

> **`batchStockApi` Promise 洩漏** — ✅ 同意（與 Top 5 #2 重複）

> **`getErrorMessage` 用 `any` 型別** — ✅ 同意
> `errorHandlers.ts:15-18` 確認 `err: any` 和 `t: any`。改為 `err: unknown` + 型別縮窄（`instanceof AxiosError`）；`t` 改用 `TranslationKeys` 型別。

> **NewsPanel reload** — ✅ 同意（與功能面向重複，改用 `refetch()`）

### Suggestion

| 問題描述                                                                                                                                     | 位置                                              | 影響         | 建議改善方式                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------ | ------------------------------------------------- |
| ChartProvider `value` 未 useMemo，每次 render 新引用觸發所有 StockCard re-render                                                             | `src/contexts/ChartContext.tsx`                   | 效能浪費     | `useMemo` 包裹 value                              |
| `calculateMA` 在 `stockApi.ts` 和 `batchStockApi.ts` 重複                                                                                    | `src/api/stockApi.ts`, `src/api/batchStockApi.ts` | DRY 違反     | 提取到 utils                                      |
| `DashboardGrid.tsx` 超過 420 行，職責混合                                                                                                    | `src/components/DashboardGrid.tsx`                | 難以測試維護 | 抽出 `useGridLayout` hook                         |
| `NewsCard` 的 `handleClick` 未用 `useCallback`，破壞 `memo`                                                                                  | `src/components/news/NewsCard.tsx:33`             | 微效能問題   | 加 `useCallback`                                  |
| `GoogleNewsFetcher` 解析失敗 fallback 到 `datetime.now()`                                                                                    | `backend/services/google_news_fetcher.py:145`     | 舊新聞排最前 | 返回空值讓後續處理                                |
| `APP_METADATA.VERSION` 硬寫 `'1.3.4'`，實際已 v1.16.1                                                                                        | `src/config/constants.ts:149`                     | 版本不可信   | 從 package.json 讀取或 build 注入                 |
| **測試盲區**：StockRequestQueue、DashboardGrid localStorage、StockListContext migration、BatchProcessingService、`_sort_and_filter` 均無測試 | 多處                                              | 重構風險高   | 優先補 StockRequestQueue 和 StockListContext 測試 |

### 架構觀察

- 後端 `StockService` 與 `BatchProcessingService` 存在循環依賴（`StockService.__init__` 建立 `BatchProcessingService(self)`），獨立測試困難
- 前端 5 個 Context 職責劃分合理，但 `VisualThemeContext` 的 localStorage 邏輯未複用 `usePersistedState`

---

## 4. 專案文件審查（4 Critical / 6 Warning / 5 Suggestion）

### Critical

| 問題描述                                                                        | 位置                                 | 影響           | 建議改善方式                 |
| ------------------------------------------------------------------------------- | ------------------------------------ | -------------- | ---------------------------- |
| **測試數量三處互相矛盾**：README 寫 145/215，project tree 寫 73，實際為 165/270 | `README.md:441-448`, `README.md:303` | 文件不可信     | 統一更新為實際數字           |
| **README project tree 標注「後端測試 73 tests」**與同文件 Testing 區塊矛盾      | `README.md:303`                      | 自相矛盾       | 刪除或更正 tree 內數字       |
| **`docs/API.md` 完全缺少 News API 端點**                                        | `docs/API.md`                        | API 文件不完整 | 補充 `/api/v1/news/<symbol>` |
| **`docs/ARCHITECTURE.md` 缺少 `news_routes.py` 及 4 個 news service**           | `docs/ARCHITECTURE.md:137-139`       | 架構圖缺漏     | 補充 news 相關模組           |

#### Critical 回應

> **測試數量三處互相矛盾** — ✅ 同意
> 文件問題，不需驗證原始碼。重新計數後統一更新 README.md 和 README_EN.md。

> **README project tree 標注與 Testing 區塊矛盾** — ✅ 同意
> 同上，一併修正。

> **`docs/API.md` 缺少 News API 端點** — ✅ 同意
> 補充 `/api/v1/news/<symbol>` 端點文件。

> **`docs/ARCHITECTURE.md` 缺少 news 相關模組** — ✅ 同意
> 補充 `news_routes.py`、`NewsService`、`FinnhubNewsFetcher`、`GoogleNewsFetcher`。

### Warning

| 問題描述                                        | 位置                                        | 影響                 | 建議改善方式                  |
| ----------------------------------------------- | ------------------------------------------- | -------------------- | ----------------------------- |
| ARCHITECTURE.md 前端 hooks/context 清單過時     | `docs/ARCHITECTURE.md:113-115`              | 文件與程式碼脫節     | 更新實際存在的 contexts/hooks |
| ARCHITECTURE.md Planned 清單包含已完成功能      | `docs/ARCHITECTURE.md:370`                  | 過時資訊             | 移至 Completed                |
| ROADMAP.md 時間軸全部過期（2025 年）            | `ROADMAP.md`                                | 喪失導航價值         | 更新至 2026 或改無時間格式    |
| README Testing 區塊數字錯誤（兩份 README 都是） | `README.md:441-448`, `README_EN.md:441-448` | 外部讀者誤判         | 重新計數後更新                |
| DEPLOYMENT.md 未包含 `FINNHUB_API_KEY` 環境變數 | `docs/DEPLOYMENT.md`                        | 部署可能遺漏         | 補充到環境變數表              |
| ARCHITECTURE.md Pagination System 說明已過時    | `docs/ARCHITECTURE.md:288-295`              | 描述與多清單架構不符 | 更新說明                      |

#### Warning 回應

> **ARCHITECTURE.md 前端 hooks/context 清單過時** — ✅ 同意。更新實際存在的 contexts/hooks。

> **ARCHITECTURE.md Planned 清單包含已完成功能** — ✅ 同意。移至 Completed。

> **ROADMAP.md 時間軸全部過期** — ✅ 同意。更新至 2026 或改為無時間格式。

> **README Testing 區塊數字錯誤** — ✅ 同意。重新計數後更新兩份 README。

> **DEPLOYMENT.md 未包含 `FINNHUB_API_KEY`** — ✅ 同意。補充到環境變數表。

> **ARCHITECTURE.md Pagination System 說明已過時** — ✅ 同意。更新說明。

### Suggestion

| 問題描述                                           | 位置                      | 影響               | 建議改善方式               |
| -------------------------------------------------- | ------------------------- | ------------------ | -------------------------- |
| `docs/` 文件量對個人專案過度工程化（40+ 工作日誌） | `docs/project-history/`   | 維護負擔           | 考慮 .gitignore 或停止維護 |
| `LICENSE` 檔案不存在，但 README 聲稱 MIT           | repo root                 | 法律不完整         | 建立 LICENSE 檔案          |
| `CONTRIBUTING.md` 只有空殼                         | `CONTRIBUTING.md`         | 無實際幫助         | 補全或移除                 |
| ARCHITECTURE.md Vite 版本標注過時                  | `docs/ARCHITECTURE.md:58` | 細節不準確         | 更新或移除次版本號         |
| `optimization-audit-2026-03-20.md` 未 commit       | `docs/development/`       | 與其他 docs 不一致 | commit 或 gitignore        |

---

## 5. GitHub Repo 審查（2 Critical / 7 Warning / 4 Suggestion）

### Critical

| 問題描述                                                                                   | 位置                | 影響                    | 建議改善方式         |
| ------------------------------------------------------------------------------------------ | ------------------- | ----------------------- | -------------------- |
| **npm audit 6 個漏洞**（5 high, 1 moderate）：rollup Path Traversal、undici HTTP Smuggling | `package-lock.json` | 供應鏈風險              | `npm audit fix`      |
| **main 分支無 branch protection**                                                          | GitHub Settings     | 任何人可直接 force push | 啟用 protection rule |

#### Critical 回應

> **npm audit 6 個漏洞** — ✅ 同意（與 Top 5 #3 重複，見 Top 5 回應）

> **main 分支無 branch protection** — ✅ 同意
> 在 GitHub Settings 啟用 branch protection rule（require PR review、prohibit force push）。

### Warning

| 問題描述                                                      | 位置                                        | 影響                         | 建議改善方式                            |
| ------------------------------------------------------------- | ------------------------------------------- | ---------------------------- | --------------------------------------- |
| `.env.production` 被 commit 且 `.gitignore` 未涵蓋            | `.env.production`, `.gitignore`             | 未來可能意外提交 secrets     | 加入 .gitignore，改用 Vercel 環境變數   |
| Backend 無 dependency lock file                               | `backend/`                                  | sub-dependency 版本不確定    | 使用 pip-compile 或 uv                  |
| Backend requirements.txt 版本偏舊（Flask 3.0.0 等）           | `backend/requirements.txt`                  | 可能有未修補漏洞             | 執行 pip-audit 並升級                   |
| npm 31 個可升級套件，含多個 major bump                        | `package.json`                              | 累積升級成本                 | 分批升級                                |
| Frontend CI ESLint `continue-on-error: true`                  | `.github/workflows/frontend-quality.yml:42` | Lint 形同虛設                | 修正問題後移除                          |
| Frontend CI 無測試步驟                                        | `.github/workflows/frontend-quality.yml`    | 前端 regression 無法自動攔截 | 加入 `npm test -- --run`                |
| Backend config 硬編碼 `'dev-secret-key-change-in-production'` | `backend/config.py:35`                      | 可預測 secret key            | Dev fallback 改用 `secrets.token_hex()` |

#### Warning 回應

> **`.env.production` 被 commit 且 `.gitignore` 未涵蓋** — ✅ 同意
> `.gitignore` 有 `.env` 和 `.env.*.local` 但不含 `.env.production`。加入 `.gitignore`，`git rm --cached .env.production`，改用 Vercel 環境變數。

> **Backend 無 dependency lock file** — ✅ 同意。使用 `pip-compile` 或 `uv` 產生 lock file。

> **Backend requirements.txt 版本偏舊** — ✅ 同意。執行 `pip-audit` 檢查後升級。

> **npm 31 個可升級套件** — ✅ 同意。分批升級：patch → minor → major。

> **Frontend CI ESLint `continue-on-error: true`** — ✅ 同意
> `frontend-quality.yml:42` 確認。修正 ESLint 問題後移除 `continue-on-error`。

> **Frontend CI 無測試步驟** — ✅ 同意。加入 `npm test -- --run` 步驟。

> **Backend config 硬編碼 dev secret key** — ✅ 同意
> `config.py:35` 確認 fallback 為可預測字串。改為 `os.getenv('SECRET_KEY') or secrets.token_hex(32)`。

### Suggestion

| 問題描述                                         | 位置                                  | 影響                            | 建議改善方式        |
| ------------------------------------------------ | ------------------------------------- | ------------------------------- | ------------------- |
| 無 issue/PR template                             | `.github/`                            | 貢獻者缺乏指引                  | 新增 templates      |
| docker-compose.yml 使用已棄用的 `version: '3.8'` | `docker-compose.yml`                  | Deprecation warning             | 移除 version 行     |
| 缺少 `Dockerfile.frontend`                       | repo root                             | compose frontend profile 會失敗 | 新增或移除 service  |
| Backend CI 測試矩陣含已 EOL 的 Python 3.9        | `.github/workflows/backend-tests.yml` | 無實際價值                      | 改為 3.11/3.12/3.13 |

---

## 去重後的唯一問題清單

以下問題在多個面向被重複提及，實際為同一問題：

| 問題                        | 出現面向            |
| --------------------------- | ------------------- |
| StockListContext 雙重初始化 | 功能、程式碼        |
| 批次上限 9 vs 18 不一致     | 功能、程式碼        |
| batchStockApi Promise 洩漏  | 功能、程式碼        |
| NewsPanel reload            | 功能、UI/UX、程式碼 |
| Finnhub 時區混用            | 功能、程式碼        |

去重後**唯一問題總數**：約 45 項（17 Critical, 含重複；去重後 10 Critical）

---

## 整體評價

以「開源個人專案」的標準來說，MarketVue 的完成度相當高。功能覆蓋面廣（多市場、多清單、新聞、截圖、雙語、拖曳排序），後端的 SOLID 分層和前端的 Context 拆分都有設計意圖。Commit 歷史乾淨、conventional commit 格式一致，CI/CD 也有基本建置。

問題集中在四個主題：

1. **前後端常數不同步**：多處 magic number 散落在不同檔案，沒有 single source of truth
2. **行動裝置體驗幾乎缺席**：GridLayout、hover 互動、responsive 都偏向桌面
3. **文件維護跟不上開發速度**：News 功能上線後，API 文件、架構文件、測試數量都沒同步更新
4. **錯誤處理兩極化**：有些地方做得很仔細（retry、toast），有些地方直接 `window.location.reload()` 或洩漏 `str(e)`

做得好的地方：

- Skeleton loading 有真實仿真佈局，品質高
- NewsPanel 的 a11y 做得最完整（role、aria-modal、ESC、overflow hidden）
- StockSearchInput 鍵盤導航完整
- Toast 有 `role="alert"` 和 `aria-live`
- vercel.json 的 security headers 配置完善
- Docker 設定有 non-root user、healthcheck
- 程式碼中未發現硬編碼的 API key 或 secret

---

## 回應總結

**回應者**：芙莉蓮（Claude Opus 4.6）| **日期**：2026-03-23

### 統計

| 結果        | 數量 |
| ----------- | ---- |
| ✅ 同意     | 32   |
| ⚠️ 部分同意 | 7    |
| ❌ 不同意   | 0    |

### 部分同意項目摘要

| 問題                           | 理由                                                        |
| ------------------------------ | ----------------------------------------------------------- |
| dateRange endDate 過期         | 影響僅限手動設定日期區間的情境，preset 模式會自動重算       |
| REORDER_STOCKS 無邊界保護      | dispatch 來源受控，實際被污染機率低，但加防禦成本也低       |
| useIsMobile 競態風險           | 已有 `typeof window` 防禦，且本專案不做 SSR，降級為 Warning |
| Google News RSS 重定向 URL     | 已知行為，解析真實 URL 需額外請求且不穩定                   |
| Toast max-w-sm 擠壓            | 實際影響有限，375px 螢幕使用率低                            |
| ControlPanel 無過渡動畫        | 已有 fade-in 動畫，缺的是高度過渡，低優先                   |
| 搜尋下拉 z-50 stacking context | 多處共用 z-50 可能衝突，但目前未有實際 bug report，低優先   |

### 建議修復順序

1. **即刻修復**（< 30 min）：`str(e)` 洩漏、`StockCardFooter` cursor、`APP_METADATA.VERSION`、`NewsResponseSchema` 清理、`npm audit fix`
2. **短期修復**（1-2h）：batchStockApi Promise、StockListContext 雙重初始化、NewsPanel refetch、時區統一、批次上限常數化、`getErrorMessage` 型別
3. **中期改善**（半天-1天）：行動裝置響應式、focus trap、CI 修復、文件全面更新
4. **長期規劃**：測試補充、Backend lock file、branch protection、dependency 升級

---

## Reviewer 二次審閱（Devil's Advocate）

**審閱者**：外部審查員（Claude Opus 4.6）| **日期**：2026-03-23
**審閱對象**：Coding Agent 回應（上方「回應總結」區塊）

---

### 整體觀察

**32 同意 / 7 部分同意 / 0 不同意** — 這個比例本身就是警訊。45 項問題一個都沒反駁，要嘛稽核太保守，要嘛 coding agent 太順從。以結果來看，更像後者。

---

### 部分同意項目逐一質疑

#### 1. dateRange endDate 過期 — Coding Agent 反駁**有誤** 🔴

> Coding Agent 聲稱：「影響僅限手動設定日期區間的情境，preset 模式會自動重算」

**經程式碼驗證，此說法錯誤。**

- `ChartContext.tsx:31-35`：`usePersistedState` 從 localStorage 原封不動地恢復整個 `dateRange` 物件，包括 `endDate` 和 `preset`
- `usePersistedState.ts:28-44`：mount 時讀 localStorage，找到就直接 `setState(JSON.parse(saved))`，不會根據 `preset` 重新計算日期
- `TimeRangeSelector.tsx:40-63`：`handlePresetClick` 確實用 `new Date()` 重算，但只在**使用者點擊按鈕時**觸發
- `App.tsx:115`：`datePreset={dateRange.preset || '1m'}` 只是傳 preset 值顯示 UI 高亮，**不會觸發重算**

場景：使用者昨天選了「1M」，localStorage 儲存 `{preset: '1m', endDate: '2026-03-22'}`。今天打開頁面，UI 顯示「1M」高亮，但 endDate 仍是昨天。**所有 preset 使用者都受影響，不只是手動設定。**

**結論：應維持原始稽核嚴重度，不應降級。修復成本極低（mount 後檢查 preset 存在則重算 endDate），應列入「即刻修復」。**

#### 2. REORDER_STOCKS 無邊界保護 — 反駁合理但結論矛盾

> 「dispatch 來源受控，實際被污染機率低，但加防禦成本也低」

既然成本也低，為什麼要降級為部分同意？應該直接同意並執行。Defense in depth 不是因為攻擊機率高才做的。

#### 3. useIsMobile 競態風險 — 反駁**有效** ✅

經驗證 `NewsPanel.tsx:21-23` 確實已有 `typeof window !== "undefined"` 檢查。原始稽核在這點上有誤。降級為 Warning 合理。

但「本專案不做 SSR」是脆弱的假設 — 未來遷移 Next.js 時會失效。就當前情況，降級可接受。

#### 4. Google News RSS 重定向 URL — 反駁合理

同意這是 trade-off 決策。但建議至少加入 RSS 格式變動的監控或 fallback，而不是完全不處理。

#### 5. Toast max-w-sm 擠壓 — 反駁**不成立** 🔴

> 「375px 螢幕使用率低」

iPhone SE（2nd/3rd gen）、iPhone 12/13 mini 都是 375px。這些不是冷門裝置。用「使用率低」dismiss 一個 CSS 修改成本極低的問題，不是好的工程判斷。

#### 6. ControlPanel 無過渡動畫 — 可接受

低優先合理。

#### 7. 搜尋下拉 z-50 stacking context — 可接受

「目前未有實際 bug report」是合理的降級理由。

---

### 修復順序的問題

#### 即刻修復清單遺漏重要項目

- `npm audit fix` 放在「即刻修復」合理
- **dateRange endDate 問題也應在此** — 修復成本極低，且每天都影響所有使用者
- **branch protection 也應在此** — GitHub Settings 點幾下，不需要任何程式碼修改，不應排在「長期規劃」

#### 測試先行原則被違反

「測試補充」被放在長期規劃最後一項，但 coding agent 要在短期和中期做大量 bug fix 和重構。沒有測試保護的重構是危險的。

至少 `StockRequestQueue` 和 `StockListContext` 的測試應在**修復它們之前**先寫，而不是之後。

#### 缺少依賴關係分析

例如 `batchStockApi` Promise 洩漏的修復可能需要先重構 `StockRequestQueue`，而那又需要先寫測試。修復順序應反映這些依賴。

---

### 回應中完全缺失的部分

1. **Section 1（功能）、Section 2（UI/UX）、Section 3（程式碼品質）沒有逐項回應** — 只在底部給統計數字。30+ 項默認同意但無驗證痕跡。Coding agent 是否實際讀了程式碼行號？

2. **沒有提出任何稽核遺漏的問題** — 好的 coding agent 應能發現「稽核漏看了 X」。零補充代表缺乏深入思考或對報告過度信任。

3. **沒有評估修復之間的依賴關係** — 修復順序是扁平的優先級列表，沒有反映任務間的前後關係。

---

### 建議修正的修復順序

```
1. 即刻修復（< 30 min）：
   - str(e) 洩漏
   - npm audit fix
   - branch protection（GitHub Settings）
   - dateRange endDate 重算
   - StockCardFooter cursor
   - APP_METADATA.VERSION
   - NewsResponseSchema 清理
   - Toast max-w-sm 響應式修正

2. 測試先行（1-2h）：
   - StockRequestQueue 單元測試（重複請求場景）
   - StockListContext 整合測試（語言切換不清空資料）

3. 短期修復（1-2h，有測試保護後）：
   - batchStockApi Promise 洩漏
   - StockListContext 雙重初始化
   - NewsPanel refetch 取代 reload
   - 時區統一
   - 批次上限常數化
   - getErrorMessage 型別修正
   - REORDER_STOCKS 邊界保護

4. 中期改善（半天-1天）：
   - 行動裝置響應式
   - Focus trap
   - CI 修復（ESLint strict + 前端測試步驟）
   - 文件全面更新

5. 長期規劃：
   - Backend lock file
   - Dependency 升級
   - 更多測試覆蓋
```

---

## Coding Agent 二次回應

**回應者**：芙莉蓮（Claude Opus 4.6）| **日期**：2026-03-23
**回應對象**：Reviewer 二次審閱（Devil's Advocate）

---

### 對質疑的逐項回應

#### 1. dateRange endDate 過期 — 接受修正 ✅

Reviewer 是對的，我的判斷有誤。

經重新驗證 `usePersistedState.ts:27-44`：mount 時執行 `setState(JSON.parse(saved))`，原封不動恢復整個 `dateRange` 物件，不會根據 `preset` 重算日期。`TimeRangeSelector.tsx:40-41` 的 `handlePresetClick` 只在使用者主動點擊時觸發。

所以昨天選了 1M 的使用者，今天打開頁面 endDate 仍是昨天。**所有 preset 使用者都受影響**，不只手動設定日期區間。

修正：從「⚠️ 部分同意」升回「✅ 同意」，列入即刻修復。

#### 2. REORDER_STOCKS 無邊界保護 — 接受修正 ✅

Reviewer 說得對。「成本低但我只給部分同意」確實矛盾。Defense in depth 的意義就是不論攻擊機率都要做。

修正：從「⚠️ 部分同意」改為「✅ 同意」。

#### 3. useIsMobile 競態風險 — 維持降級

Reviewer 也同意降級合理。「未來遷移 Next.js 時會失效」是假設性風險，在個人專案中不構成升級理由。

#### 4. Google News RSS 重定向 URL — 補充監控建議

同意加入 RSS 格式變動的 fallback 或監控。例如在 `_parse_rss_entry` 中檢測 Google RSS link 格式，若格式改變則 log warning。

#### 5. Toast max-w-sm — 接受修正 ✅

Reviewer 是對的。iPhone SE / iPhone mini 都是 375px，不是冷門裝置。用「使用率低」dismiss 一個改一行 CSS 的問題是不好的判斷。

修正：從「⚠️ 部分同意」改為「✅ 同意」，列入即刻修復。

#### 6-7. ControlPanel / z-50 — 維持低優先

Reviewer 也同意。

---

### 對「修復順序問題」的回應

#### dateRange 和 branch protection 應列入即刻修復 — 同意 ✅

- dateRange 修復成本極低（mount 後重算 endDate），且每天影響所有使用者
- branch protection 只需 GitHub Settings 操作，不涉及程式碼

#### 測試先行原則 — 同意，但需務實 ✅

Reviewer 說「測試應在修復之前寫」，原則上正確。但需區分：

- **改行為的修復**（batchStockApi 重構、StockListContext 邏輯修改）：確實應先寫測試，否則重構可能引入新 bug
- **刪除或替換的修復**（移除 `str(e)`、移除 `cursor-pointer`、`npm audit fix`）：不需要先寫測試，改完即可驗證

接受 Reviewer 建議的「測試先行」階段，但僅適用於邏輯重構類修復。

#### 缺少依賴關係分析 — 同意 ✅

修復之間確實有前後關係，例如：

- `StockRequestQueue` 測試 → `batchStockApi` Promise 重構
- `StockListContext` 測試 → 雙重初始化修復 → REORDER_STOCKS 邊界保護

---

### 對「完全缺失的部分」的回應

#### 「Section 1-3 沒有逐項回應」 — 事實有誤 ❌

實際上每個 Section 的 Critical 和 Warning 表格後都有「Critical 回應」和「Warning 回應」區塊，逐項標註狀態和驗證結果。Reviewer 可能未注意到這些區塊，或審閱的是回應寫入前的版本。

#### 「沒有提出任何稽核遺漏」 — 接受批評，補充如下

重新審視後，稽核報告確實遺漏了幾個值得注意的問題：

1. **`usePersistedState` 的初始化閃爍**：`useState(defaultValue)` 後在 `useEffect` 中才從 localStorage 恢復，初始 render 會用 defaultValue，造成 UI 閃爍。這影響所有使用此 hook 的 context
2. **`backend/config.py` 的 `CORS_ORIGINS` 用逗號 split**：若 Vercel 域名含逗號（不太可能但有風險）或多餘空格，CORS 會靜默失敗
3. **`Finnhub` 和 `Google News` 的 API key / 配額限制無前端提示**：API 達到 rate limit 時使用者只看到空新聞列表，無明確錯誤提示

---

### 修正後的統計

| 結果        | 原始 | 修正後 |
| ----------- | ---- | ------ |
| ✅ 同意     | 32   | 35     |
| ⚠️ 部分同意 | 7    | 4      |
| ❌ 不同意   | 0    | 0      |

### 採納的修復順序（整合 Reviewer 建議）

```
Phase 1 — 即刻修復（< 30 min，無需測試保護）：
  - str(e) 洩漏（改一行）
  - npm audit fix
  - branch protection（GitHub Settings）
  - dateRange endDate 重算（mount 後檢查 preset）
  - StockCardFooter cursor-pointer 移除
  - APP_METADATA.VERSION 修正
  - NewsResponseSchema 殘留欄位清理
  - Toast max-w-sm 響應式修正
  - Backend dev secret key 改 secrets.token_hex()

Phase 2 — 測試先行（1-2h）：
  - StockRequestQueue 單元測試（重複請求場景）
  - StockListContext 整合測試（初始化、語言切換、匯入計數）
  - news_service._sort_and_filter 單元測試（日期解析失敗場景）

Phase 3 — 有測試保護的修復（1-2h）：
  - batchStockApi Promise 洩漏重構
  - StockListContext 雙重初始化修復
  - REORDER_STOCKS 邊界保護
  - NewsPanel refetch 取代 reload
  - Finnhub/news_service 時區統一
  - 批次上限常數化
  - importStocks 跳過計數修正
  - getErrorMessage 型別修正

Phase 4 — 中期改善（半天-1天）：
  - 行動裝置響應式（GridLayout 單欄、Header padding、hover→touch）
  - Focus trap（CreateListModal 優先）
  - ThemeSettings ARIA + ESC
  - CI 修復（ESLint strict + 前端測試步驟 + Python 矩陣更新）
  - .env.production 從 git 移除
  - VisualThemeContext 改用 usePersistedState

Phase 5 — 文件更新（2-3h）：
  - README 測試數量統一
  - API.md 補 News API
  - ARCHITECTURE.md 補 news 模組 + hooks/context + pagination
  - DEPLOYMENT.md 補 FINNHUB_API_KEY
  - ROADMAP.md 時間軸更新

Phase 6 — 長期規劃：
  - Backend lock file（pip-compile / uv）
  - Dependency 分批升級
  - 更多測試覆蓋
  - Google News RSS 格式監控
```

---

## Reviewer 三次審閱

**審閱者**：外部審查員（Claude Opus 4.6）| **日期**：2026-03-23
**審閱對象**：Coding Agent 二次回應（上方區塊）

---

### 勘誤：Section 1-3 回應確實存在

上次審閱中我指出「Section 1-3 沒有逐項回應」，Coding Agent 在二次回應中反駁「事實有誤」。

**經重新閱讀完整文件，Coding Agent 是對的。** Section 1-3 確實有「Critical 回應」和「Warning 回應」區塊（line 51-63, 76-92, 116-126, 141-165, 192-198, 212-218），且引用了具體行號做驗證。我上次從 line 235 開始讀因此漏看。在此更正。

---

### 二次回應品質評估

整體而言，Coding Agent 二次回應的品質**明顯優於首次回應**：

1. **接受了 dateRange endDate 的修正**，承認原始判斷有誤，不護短
2. **接受了 REORDER_STOCKS 和 Toast 的升級**，邏輯一致
3. **補充了 3 個稽核遺漏問題**（`usePersistedState` 閃爍、CORS split、API quota 無提示），這正是首次回應缺少的獨立思考
4. **修復順序加入「測試先行」階段**，且有合理的區分（邏輯重構需要測試，刪除/替換不需要）

---

### 仍需質疑的點

#### 1. 「測試先行但需務實」的區分是否夠清晰

> Coding Agent：「改行為的修復需要先寫測試，刪除或替換的修復不需要」

這個區分原則上合理，但執行時容易模糊。例如：

- **批次上限常數化**（Phase 3）：看起來是「替換」（改個數字），但如果前端 `MAX_BATCH_SIZE = 9` 是刻意配合後端 schema `max=9` 的切塊邏輯，改成 18 後前端就不切塊了，行為改變。這需要先有測試確認批次行為。
- **importStocks 跳過計數修正**（Phase 3）：改計算公式是行為修改，但被歸在「短期修復」而不是「測試先行」後才動。

建議：Phase 3 每個項目都標註「是否需要先有測試」，而非依賴模糊的分類原則。

#### 2. Phase 5 文件更新排在 Phase 4 之後，但文件問題不依賴程式碼修改

文件更新（README 測試數量、API.md、ARCHITECTURE.md）可以跟任何 Phase 平行進行，不需要等到 Phase 4 完成。放在 Phase 5 會讓它看起來像低優先，但文件不同步是目前 repo 最顯眼的問題之一（外部人第一眼看到的就是 README）。

建議：文件更新標註為「可與 Phase 1-4 平行執行」，或直接併入 Phase 1（文件修正也是 < 30 min 的事）。

#### 3. 補充的 3 個稽核遺漏中，`usePersistedState` 閃爍可能比描述的更嚴重

> 「`useState(defaultValue)` 後在 `useEffect` 中才從 localStorage 恢復，初始 render 會用 defaultValue」

這影響的不只是 UI 閃爍。看 `ChartContext.tsx:31-35`：初始 render 用 `{preset: '1m', endDate: today}` 這個 defaultValue 發出 API 請求，然後 `useEffect` 恢復 localStorage 的值後又觸發一次 API 請求。**等於每次載入都多發一輪不必要的 API 請求**。對 Render free tier 的 rate limit 壓力更大。

建議：這個問題應該納入修復計畫，至少加入 Phase 3 或 4。修法是讓 `usePersistedState` 在 `useState` 的 lazy initializer 中同步讀取 localStorage，而非在 `useEffect` 中異步恢復。

#### 4. Phase 6 缺少結束條件

「長期規劃」沒有任何時間指引或觸發條件。什麼時候做 dependency 升級？等到 npm audit 再次報警？還是每季定期？「更多測試覆蓋」的目標是什麼？80%？目前是多少？

建議：至少加入「下次觸發審查的條件」，例如「每月執行 `npm audit` + `pip-audit`」或「達到 80% coverage 後停止」。

---

### 結論

二次回應品質良好，修復計畫已具可執行性。主要修正建議：

1. Phase 3 每個項目標註是否需要先有測試
2. 文件更新可平行執行，不需等到 Phase 5
3. `usePersistedState` 閃爍 + 雙重 API 請求應納入修復計畫
4. Phase 6 加入觸發條件

**審查結論：可以開始實作。** 建議從 Phase 1 開始，同時平行處理文件更新。

---

## Coding Agent 三次回應

**回應者**：芙莉蓮（Claude Opus 4.6）| **日期**：2026-03-25
**回應對象**：Reviewer 三次審閱

---

### 勘誤致謝

感謝 Reviewer 在三次審閱中承認 Section 1-3 回應確實存在的事實。這樣對話就可以建立在正確的基礎上了呢。

---

### 對四點質疑的逐項回應

#### 1. Phase 3 每個項目標註「是否需要先有測試」— 同意 ✅

Reviewer 舉的例子很精準。批次上限常數化表面上是「換個數字」，但如果前端 `MAX_BATCH_SIZE = 9` 是配合切塊邏輯的，改成 18 後行為就不同了。importStocks 計數修正也是行為變更。

修正如下：

```
Phase 3 — 有測試保護的修復（逐項標註）：
  - batchStockApi Promise 洩漏重構        [需要 Phase 2 測試]
  - StockListContext 雙重初始化修復       [需要 Phase 2 測試]
  - REORDER_STOCKS 邊界保護               [需要 Phase 2 測試]
  - NewsPanel refetch 取代 reload          [不需要，行為替換]
  - Finnhub/news_service 時區統一          [需要 _sort_and_filter 測試]
  - 批次上限常數化                         [需要先確認切塊邏輯，補測試]
  - importStocks 跳過計數修正             [需要 Phase 2 測試]
  - getErrorMessage 型別修正               [不需要，純型別重構]
```

#### 2. 文件更新可平行執行 — 同意 ✅

文件更新不依賴任何程式碼修改。README 測試數量、API.md、ARCHITECTURE.md 都可以在 Phase 1 開始時同步處理。

修正：Phase 5 改為「可與 Phase 1-4 平行執行」的獨立軌道，不再是序列依賴。

#### 3. `usePersistedState` 閃爍 + 雙重 API 請求 — 同意且嚴重度比我描述的高 ✅

經驗證，Reviewer 的分析完全正確：

- `usePersistedState.ts:23`：`useState<T>(defaultValue)` 初始值為 defaultValue
- `usePersistedState.ts:27-44`：`useEffect` 中才從 localStorage 恢復
- `stockApi.ts:64-66`：`queryKey = ['stock', symbol, startDate, endDate]`

所以初始 render 用 defaultValue 的日期範圍（今天的）觸發 API → `useEffect` 恢復 localStorage 的日期範圍（昨天的）→ queryKey 改變 → 觸發第二次 API。**每次頁面載入都多發一輪 API 請求**。

這不只是「UI 閃爍」，對 Render free tier 的 rate limit 壓力是實質的。

修復方案：將 `usePersistedState` 改為同步 lazy initializer：

```typescript
const [state, setState] = useState<T>(() => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
  } catch {
    // fallback to default
  }
  return defaultValue;
});
```

這樣 mount 時就是正確的值，不會有第二次 render 和多餘的 API 請求。

嚴重度：應列入 **Phase 1（即刻修復）**。改動量小（改 `usePersistedState` 一個函式），但影響範圍大（所有使用此 hook 的 context 都受益）。同時也一併修復了 dateRange endDate 的問題（因為初始值就會是 localStorage 的值）。

#### 4. Phase 6 加入觸發條件 — 同意 ✅

```
Phase 6 觸發條件：
  - npm audit / pip-audit：每月第一個工作日執行
  - Dependency 升級：每季或 audit 報 high severity 時
  - 測試覆蓋率目標：前端 70%、後端 80%（目前無覆蓋率數據，Phase 2 完成後測量 baseline）
  - Google News RSS 監控：每次部署後檢查 RSS 格式是否仍有效
```

---

### 最終修復計畫（v3）

```
Phase 1 — 即刻修復（< 30 min，無需測試保護）：
  - usePersistedState 改同步 lazy initializer（根治閃爍 + 雙重 API + dateRange 過期）
  - str(e) 洩漏（改一行）
  - npm audit fix
  - branch protection（GitHub Settings）
  - StockCardFooter cursor-pointer 移除
  - APP_METADATA.VERSION 修正
  - NewsResponseSchema 殘留欄位清理
  - Toast max-w-sm 響應式修正
  - Backend dev secret key 改 secrets.token_hex()

Phase 2 — 測試先行（1-2h）：
  - StockRequestQueue 單元測試（重複請求場景）
  - StockListContext 整合測試（初始化、語言切換、匯入計數）
  - news_service._sort_and_filter 單元測試（日期解析失敗場景）
  - 測量 baseline 覆蓋率

Phase 3 — 有測試保護的修復（1-2h）：
  - batchStockApi Promise 洩漏重構        [需要 Phase 2 測試]
  - StockListContext 雙重初始化修復       [需要 Phase 2 測試]
  - REORDER_STOCKS 邊界保護               [需要 Phase 2 測試]
  - NewsPanel refetch 取代 reload          [不需測試，行為替換]
  - Finnhub/news_service 時區統一          [需要 _sort_and_filter 測試]
  - 批次上限常數化                         [需要先確認切塊邏輯，補測試]
  - importStocks 跳過計數修正             [需要 Phase 2 測試]
  - getErrorMessage 型別修正               [不需測試，純型別重構]

Phase 4 — 中期改善（半天-1天）：
  - 行動裝置響應式（GridLayout 單欄、Header padding、hover→touch）
  - Focus trap（CreateListModal 優先）
  - ThemeSettings ARIA + ESC
  - CI 修復（ESLint strict + 前端測試步驟 + Python 矩陣更新）
  - .env.production 從 git 移除
  - VisualThemeContext 改用 usePersistedState

文件軌道（與 Phase 1-4 平行）：
  - README 測試數量統一
  - API.md 補 News API
  - ARCHITECTURE.md 補 news 模組 + hooks/context + pagination
  - DEPLOYMENT.md 補 FINNHUB_API_KEY
  - ROADMAP.md 時間軸更新

Phase 5 — 長期規劃（附觸發條件）：
  - Backend lock file（pip-compile / uv）
  - Dependency 分批升級（每季或 audit 報 high 時）
  - 更多測試覆蓋（目標：前端 70%、後端 80%）
  - npm audit / pip-audit 月度檢查
  - Google News RSS 格式監控（每次部署後）
```

### 最終統計

| 結果        | 首次 | 二次 | 三次（最終） |
| ----------- | ---- | ---- | ------------ |
| ✅ 同意     | 32   | 35   | 35           |
| ⚠️ 部分同意 | 7    | 4    | 4            |
| ❌ 不同意   | 0    | 0    | 0            |

三次審閱共識：**可以開始實作。**

---

## 實作紀錄

**執行者**：芙莉蓮（Claude Opus 4.6）| **日期**：2026-03-25
**版本**：v1.16.2 | **Commits**：`ca9a03a`..`d8fb771`（10 commits，已 push 至 main）

---

### Phase 1 — 即刻修復 ✅

| 項目                               | Commit    | 做法                                                                                                                                  |
| ---------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `usePersistedState` 同步 lazy init | `c5433a4` | 改寫為 `useState(() => { localStorage.getItem... })`，移除 `useEffect` 和 `isInitialized`。根治閃爍、雙重 API、dateRange 過期三個問題 |
| `str(e)` 洩漏                      | `ca9a03a` | `decorators.py` 移除 `'message': str(e)`                                                                                              |
| `npm audit fix`                    | `9724b5b` | 6 漏洞歸零（axios, rollup, undici, minimatch, flatted, ajv）                                                                          |
| `StockCardFooter` cursor           | `1148b8d` | 移除無 handler 的 `cursor-pointer`                                                                                                    |
| `APP_METADATA.VERSION`             | `1148b8d` | `'1.3.4'` → `'1.16.2'`                                                                                                                |
| `NewsResponseSchema` 清理          | `1148b8d` | 移除 `has_more`、`NewsRequestParamsSchema`（v1.15 殘留）                                                                              |
| Toast 響應式                       | `1148b8d` | `max-w-sm` → `max-w-[calc(100vw-2rem)] sm:max-w-sm`                                                                                   |
| Backend secret key                 | `ca9a03a` | fallback 改為 `secrets.token_hex(32)`                                                                                                 |
| branch protection                  | —         | 需手動在 GitHub Settings 操作（未執行）                                                                                               |

### Phase 2 — 測試先行 ✅

| 測試組                 | Commit    | 數量 | 覆蓋場景                                                              |
| ---------------------- | --------- | ---- | --------------------------------------------------------------------- |
| StockRequestQueue      | `f2d32ef` | 10   | enqueue、batch merge、重複請求 bug baseline、錯誤處理                 |
| StockListContext       | `f2d32ef` | 26   | 雙重初始化 baseline、importStocks 計數、REORDER 無保護 baseline、CRUD |
| news \_sort_and_filter | `f2d32ef` | 16   | 排序、72h 過濾、日期解析失敗 bug baseline、邊界條件                   |

前端 165 → 201 tests | 後端 270 → 286 tests（coverage 95.72%）

### Phase 3 — 有測試保護的修復 ✅

| 項目                        | Commit    | 做法                                                                              | 測試依賴         |
| --------------------------- | --------- | --------------------------------------------------------------------------------- | ---------------- |
| batchStockApi Promise 洩漏  | `407de17` | 新增 `pendingPromises: Map`，重複 key 直接 return 已有 Promise，`.finally()` 清理 | Phase 2 測試     |
| StockListContext 雙重初始化 | `d608a30` | 移除 `useEffect` 中 `loadStoredState`，`isInitialized` 改為常數 `true`            | Phase 2 測試     |
| REORDER_STOCKS 邊界保護     | `ec35062` | 加 `[...new Set()]` 去重 + `.slice(0, MAX)` 上限                                  | Phase 2 測試     |
| NewsPanel refetch           | `9d2482e` | `window.location.reload()` → `refetch()`，`useNewsData` 新增 refetch 回傳         | 不需測試         |
| 新聞日期解析                | `9d2482e` | except 區塊改為 `continue`（跳過而非保留）                                        | Phase 2 測試     |
| 時區統一                    | `9d2482e` | `finnhub_news_fetcher.py` 三處改 `timezone.utc`                                   | Phase 2 測試     |
| 批次上限常數化              | `1148b8d` | 後端 schema 引用 `MAX_BATCH_SYMBOLS`（18），前端同步                              | 確認切塊邏輯安全 |
| importStocks 計數           | `d608a30` | 改 index-based 迴圈，`skipped += symbols.length - i`                              | Phase 2 測試     |
| getErrorMessage 型別        | `1148b8d` | `any` → `unknown` + `Record<string, string>`                                      | 不需測試         |

### 文件軌道（與 Phase 1-3 平行）✅

| 項目               | Commit    | 內容                                          |
| ------------------ | --------- | --------------------------------------------- |
| README / README_EN | `d8fb771` | 測試數量 201/286、覆蓋率 95.72%               |
| API.md             | `d8fb771` | 新增 News API 端點文件                        |
| ARCHITECTURE.md    | `d8fb771` | 補 news 模組、更新 hooks/contexts、多清單架構 |
| DEPLOYMENT.md      | `d8fb771` | 補 FINNHUB_API_KEY 環境變數                   |
| ROADMAP.md         | `d8fb771` | 過期 2025 時間軸改為里程碑格式                |
| CHANGELOG.md       | `d8fb771` | v1.16.2 完整 release notes                    |

### 未完成項目

以下項目屬於 Phase 4（中期改善）和 Phase 5（長期規劃），本階段未執行：

**Phase 4 — 中期改善（待後續排程）：**

- 行動裝置響應式（GridLayout 單欄、Header padding、hover→touch）
- Focus trap（CreateListModal 優先）
- ThemeSettings ARIA + ESC
- CI 修復（ESLint strict + 前端測試步驟 + Python 矩陣更新）
- `.env.production` 從 git 移除
- VisualThemeContext 改用 usePersistedState
- branch protection（GitHub Settings 手動操作）

**Phase 5 — 長期規劃（附觸發條件）：**

- Backend lock file（pip-compile / uv）
- Dependency 分批升級（每季或 audit 報 high 時）
- 更多測試覆蓋（目標：前端 70%、後端 80%）
- npm audit / pip-audit 月度檢查
- Google News RSS 格式監控（每次部署後）
