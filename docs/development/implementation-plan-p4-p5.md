# MarketVue Implementation Plan — Phase 4 & 5

**建立日期**：2026-03-25
**來源**：`docs/development/project-audit-2026-03-23.md`（稽核報告 + Code Review）
**前置完成**：Phase 1-3 已於 v1.16.2 完成（10 commits, `ca9a03a`..`dad6321`）
**Code Review 補修**：4/4 FAIL 已處理（3 修正 + 1 不同意且 reviewer 撤銷），commit `dad6321`

---

## 目標與範圍

Phase 4 聚焦**中期改善**：CI 品質門檻、技術債清理、行動裝置體驗、無障礙合規。
Phase 5 聚焦**長期規劃**：供應鏈安全、依賴管理、監控。

---

## Phase 4 — 中期改善

### P4-1. CI/CD 修復（最優先，建立安全網）

| 項目              | 檔案                                        | 做法                                                   | 預估  |
| ----------------- | ------------------------------------------- | ------------------------------------------------------ | ----- |
| ESLint strict     | `.github/workflows/frontend-quality.yml:42` | 修正 ESLint 問題後移除 `continue-on-error: true`       | 30min |
| 前端測試步驟      | `.github/workflows/frontend-quality.yml`    | 加入 `npm test -- --run` 步驟                          | 5min  |
| Python 矩陣更新   | `.github/workflows/backend-tests.yml:20`    | `['3.9', '3.10', '3.11']` → `['3.11', '3.12', '3.13']` | 5min  |
| Vercel build 驗證 | CI                                          | 確認 CI 用 `tsc -b` 而非 `tsc --noEmit`                | 10min |

**相依關係**：ESLint strict 需先修正所有 lint 問題才能移除 continue-on-error。
**驗收**：CI 全綠，無 continue-on-error，前端測試在 CI 中執行。

**狀態**：待開始

> **優先序調整原因**：Review Warning #3 指出後續 P4-2~P4-4 的修改都不會被 CI 保護。CI 應先就位作為安全網。

### P4-2. 技術債清理

| 項目                                         | 檔案                                                    | 做法                                                                                                           | 預估         |
| -------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------ |
| `.env.production` 從 git 移除                | `.env.production`, `.gitignore`                         | `git rm --cached`, 加入 `.gitignore`。Vercel 已有 `VITE_API_URL`（已驗證）。建立 `.env.example` 給本地開發參考 | 10min        |
| VisualThemeContext 改用 usePersistedState    | `src/contexts/VisualThemeContext.tsx`                   | 移除自寫 localStorage 邏輯，改用共用 hook                                                                      | 15min        |
| StockListContext `isInitialized` 冗餘移除    | `src/contexts/StockListContext.tsx`                     | 移除硬編碼 `true` 的 `isInitialized` 和相關 guard                                                              | 10min        |
| Render 冷啟動 retry 引用 calculateRetryDelay | `src/components/stock-card/hooks/useStockData.ts:66-70` | retryDelay callback 中對 503 回應引用 `errorHandlers.ts` 的 `calculateRetryDelay`（5s/10s/15s）                | 20min        |
| DashboardGrid localStorage util 統一         | `src/components/DashboardGrid.tsx:109,131,226,237,259`  | 5 處直接 `localStorage.getItem/setItem` 改用專案 localStorage 工具函式，避免 Safari 私密模式 crash             | 30min        |
| Branch protection                            | GitHub Settings                                         | 啟用 require PR review + prohibit force push                                                                   | 5min（手動） |

**相依關係**：無。
**驗收**：`.env.production` 不在 git 中、VisualThemeContext 用 usePersistedState、冷啟動 retry 在 30s+ 範圍、DashboardGrid 無直接 localStorage 操作、無冗餘 code。

**狀態**：待開始

> **新增項目來源**：冷啟動 retry（Review Critical #1）、DashboardGrid localStorage（Review Critical #2）、`.env.example`（Review Warning #4）

### P4-3. 行動裝置響應式

| 項目                          | 檔案                                                      | 做法                                                                                                                     | 預估  |
| ----------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----- |
| useIsMobile 共用 Hook         | `src/components/news/NewsPanel.tsx:21-31`                 | 抽成 `src/hooks/useIsMobile.ts`，所有元件共用                                                                            | 15min |
| GridLayout 單欄               | `src/components/DashboardGrid.tsx:375`                    | 先抽 `useGridLayout` hook 簡化元件，再做響應式：`containerWidth < 640` 時 `cols={1}`, `rowHeight={280}`, 禁用拖曳/resize | 2-3h  |
| Header padding                | `src/App.tsx:69`                                          | `py-8` → `py-4 sm:py-8`, title `text-4xl` → `text-2xl sm:text-4xl`                                                       | 5min  |
| StockListSelector hover→touch | `src/components/stock-list/StockListSelector.tsx:186-191` | Rename/Delete 按鈕行動裝置 always visible 或長按觸發                                                                     | 30min |
| SummaryBar 小螢幕 hidden      | `src/components/SummaryBar.tsx:75-76`                     | `hidden sm:flex` 改為至少顯示首個 symbol 或股票總數                                                                      | 15min |

**相依關係**：useIsMobile 應先完成。GridLayout 建議先抽 `useGridLayout` hook 再改響應式。
**驗收**：375px viewport 下所有功能可操作，無水平溢出。

**狀態**：待開始

> **預估調整原因**：Review Warning #1 指出 DashboardGrid 420 行混合元件上做響應式風險高。改為先抽 hook 再改，預估 1h → 2-3h。

### P4-4. 無障礙（A11y）

| 項目                                | 檔案                                                      | 做法                                                     | 預估  |
| ----------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- | ----- |
| Focus trap — CreateListModal        | `src/components/stock-list/CreateListModal.tsx:65`        | 使用 `@radix-ui/react-dialog`                            | 30min |
| Focus trap — StockListSelector      | `src/components/stock-list/StockListSelector.tsx:94`      | 使用 Radix Dialog                                        | 20min |
| ThemeSettings ARIA + ESC            | `src/components/ThemeSettings.tsx:88`                     | 加 `role="dialog"`, `aria-modal="true"`, ESC `onKeyDown` | 15min |
| ThemeSettings aria-label            | `src/components/ThemeSettings.tsx:83`                     | `title` → `aria-label`                                   | 5min  |
| NewsCard `<div onClick>` → `<a>`    | `src/components/news/NewsCard.tsx:41`                     | 改為語義化 `<a>` 標籤，鍵盤可 Enter 觸發                 | 10min |
| StockListSelector inline style 清理 | `src/components/stock-list/StockListSelector.tsx:105-114` | 內嵌 `<style>` 移入 `index.css`                          | 10min |

**技術決策**：Focus trap 方案選定 **Radix UI**。3 個元件需要 focus trap，手動實作每個 modal 都要寫且容易有邊緣 bug。Radix 一勞永逸、a11y 完整。
**相依關係**：無，可獨立完成。
**驗收**：Tab 鍵不離開 modal、ESC 可關閉、screen reader 可識別 dialog。

**狀態**：待開始

> **方案決策來源**：Review Warning #2。新增 StockListSelector inline style 清理（Review Suggestion #1）。

### Phase 4 優先序

```
1. P4-1 CI/CD 修復（安全網先就位）
2. P4-2 技術債清理（低風險收尾，含冷啟動 retry 和 localStorage 統一）
3. P4-3 行動裝置響應式（有 CI 保護）
4. P4-4 無障礙（有 CI 保護）
```

---

## Phase 5 — 長期規劃

### P5-1. 供應鏈安全

| 項目                      | 觸發條件                | 做法                                                                           |
| ------------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| Backend lock file         | 一次性                  | 使用 `pip-compile` 或 `uv` 產生 lock file                                      |
| GitHub Actions 月度 audit | 一次性設定              | 建立 scheduled workflow，每月 1 號跑 `npm audit` + `pip-audit`，結果寫入 issue |
| Dependency 分批升級       | 每季或 audit 報 high 時 | patch → minor → major 分批處理                                                 |

**狀態**：待排程

> **新增項目來源**：GitHub Actions 月度 audit（Review Warning #5），取代原本的口頭「每月第一個工作日」承諾。

### P5-2. 測試覆蓋率

| 項目           | 目標 | 目前（2026-03-26 測量）                                               |
| -------------- | ---- | --------------------------------------------------------------------- |
| 前端覆蓋率     | 70%  | **73.66%** statements / 71.82% branches / 75% functions / 74.3% lines |
| 後端覆蓋率     | 80%  | **95.72%**（286 tests）                                               |
| 優先補測試區域 | —    | `migration.ts`（9.75%）、`useStockListReducer.ts`（45.61%）           |

**結論**：前後端均已達標。不需額外排程補測試。維護性質：新功能開發時同步補測試即可。

**狀態**：已達標，轉為維護模式

> **Baseline 測量來源**：Review Suggestion #2。測量結果顯示已達標，觸發條件不再需要。

### P5-3. 監控

| 項目                     | 觸發條件       | 做法                                                         |
| ------------------------ | -------------- | ------------------------------------------------------------ |
| Google News RSS 格式監控 | 每次部署後     | 檢查 RSS 回傳格式是否仍為預期結構                            |
| API rate limit 前端提示  | 下次 UX 改善時 | Finnhub/Google News 達到 rate limit 時顯示明確提示而非空列表 |

**狀態**：待排程

---

## Code Review 殘餘觀察

以下項目非阻塞，優先序低，記錄備查。標註「已知但暫不處理」。

| #   | 項目                                               | 來源                  | 說明                                           | 建議處理時機               |
| --- | -------------------------------------------------- | --------------------- | ---------------------------------------------- | -------------------------- |
| 1   | REORDER_STOCKS 未驗證 symbol 歸屬                  | Code Review 殘餘      | 可注入任意 symbol，風險低                      | 下次修改 reducer 時        |
| 2   | batchStockApi processBatch unhandled rejection     | Code Review 殘餘      | setTimeout async 邊緣情況，目前 try/catch 完整 | 僅監控                     |
| 3   | ChartProvider value 未 useMemo                     | 稽核 Suggestion       | 每次 render 新引用觸發 re-render               | 效能優化時                 |
| 4   | calculateMA 重複                                   | 稽核 Suggestion       | stockApi.ts 和 batchStockApi.ts 各有一份       | 下次修改 API 層時          |
| 5   | GoogleNewsFetcher 解析失敗 fallback datetime.now() | 稽核 Suggestion       | 舊新聞排最前                                   | 下次修改 news fetcher 時   |
| 6   | Onboarding 提示                                    | 稽核 UI/UX Suggestion | 新用戶不知如何操作                             | 下次 UX 改善時             |
| 7   | StockCardError 錯誤類型區分                        | 稽核 UI/UX Suggestion | 使用者無法判斷原因                             | 下次修改 error handling 時 |
| 8   | PageNavigator 頁碼跳轉                             | 稽核 UI/UX Suggestion | 多頁時導航效率低                               | 下次 UX 改善時             |
| 9   | NotificationBanner dismiss key 版本化              | 稽核 UI/UX Suggestion | 更新內容後已 dismiss 用戶看不到                | 下次更新 banner 時         |
| 10  | Drag handle 預設微透明                             | 稽核 UI/UX Suggestion | 使用者不知可拖曳                               | P4-3 響應式改造時順帶處理  |

---

## 文件管理規範

本規範適用於 MarketVue 所有 Phase 的開發流程。

### 文件職責分工

| 文件                    | 職責                 | 路徑                                                 |
| ----------------------- | -------------------- | ---------------------------------------------------- |
| **Implementation Plan** | 規劃與執行追蹤       | `docs/development/implementation-plan-*.md`          |
| **Audit / Review**      | 稽核發現與回應紀錄   | `docs/development/project-audit-*.md`、`review-*.md` |
| **CHANGELOG**           | 面向使用者的版本紀錄 | `CHANGELOG.md`                                       |

### 更新時機

| 事件                 | 動作                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- |
| 任務完成時           | 更新 plan 文件：標記狀態為「已完成」、記錄 commit hash 和日期                       |
| Phase 完成時         | 更新 plan 文件：標記 Phase 狀態、更新 CHANGELOG、bump 版本號                        |
| 收到 reviewer 回饋時 | 回應寫入 review 文件（不修改 plan），若回應導致 plan 異動則同步更新 plan 並注記來源 |
| 新增待辦項目時       | 加入 plan 文件對應 Phase，不寫入 review 文件                                        |

### 範例：標記任務完成

```markdown
| `.env.production` 從 git 移除 | ... | 10min | ✅ `abc1234` 2026-04-01 |
```

---

## 變更紀錄

| 日期       | 版本 | 變更                                                                                                                                                                                                                       |
| ---------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-25 | v1.0 | 初版，從 project-audit-2026-03-23.md 彙整 Phase 4-5 待辦                                                                                                                                                                   |
| 2026-03-26 | v1.1 | 依據 review-p4-p5-plan.md 審閱結果修訂：優先序調整（CI 先行）、新增 5 項遺漏任務至 P4-2、GridLayout 預估調整、Focus trap 決定用 Radix UI、P5-1 新增 GitHub Actions audit、P5-2 baseline 已測量並達標、殘餘觀察擴充至 10 項 |
