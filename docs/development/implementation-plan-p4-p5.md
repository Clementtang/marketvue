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

| 項目                     | 做法                                                                                                                       | 結果         |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------ |
| ESLint strict            | 修正 32 errors + 4 warnings（型別 `any`→具體型別、unused vars 移除、context exports/setState-in-effect 加 eslint-disable） | ✅ `e53bdf3` |
| 前端測試步驟             | `.github/workflows/frontend-quality.yml` 加入 `npm test -- --run`                                                          | ✅ `b7446ba` |
| Python 矩陣更新          | `['3.9','3.10','3.11']` → `['3.11','3.12','3.13']`                                                                         | ✅ `b7446ba` |
| Vercel build 驗證        | `tsc --noEmit` → `tsc -b`（與 Vercel build 一致）                                                                          | ✅ `b7446ba` |
| `continue-on-error` 移除 | ESLint 問題修完後移除                                                                                                      | ✅ `b7446ba` |
| eslint.config.js         | `globalIgnores` 加入 `coverage`, `htmlcov`                                                                                 | ✅ `e53bdf3` |

**驗收**：CI 全綠，無 continue-on-error，前端測試在 CI 中執行。

**狀態**：✅ 完成（2026-03-27）

> **優先序調整原因**：Review Warning #3 指出後續 P4-2~P4-4 的修改都不會被 CI 保護。CI 應先就位作為安全網。

### P4-2. 技術債清理

| 項目                                      | 做法                                                                                                      | 結果         |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------ |
| `.env.production` 從 git 移除             | `git rm --cached`, `.gitignore` 加入 `.env.production`, 建立 `.env.example`（Vercel 已有 `VITE_API_URL`） | ✅ `2cf081a` |
| VisualThemeContext 改用 usePersistedState | 移除自寫 localStorage + useEffect 邏輯，改用 `usePersistedState<VisualTheme>`                             | ✅ `b4493fe` |
| StockListContext `isInitialized` 冗餘移除 | 移除硬編碼 `true` 的 `isInitialized` 和 useEffect guard                                                   | ✅ `3c71e61` |
| Render 冷啟動 retry                       | `useStockData` 的 `retryDelay` 改為呼叫 `calculateRetryDelay`，503 回應使用 5s/10s/15s                    | ✅ `e1d0ed3` |
| DashboardGrid localStorage util 統一      | 10 處直接 `localStorage.*` 呼叫改用 `getLocalStorageItem`/`setLocalStorageItem`/`removeLocalStorageItem`  | ✅ `ec2bc22` |
| Branch protection                         | GitHub Settings 手動操作                                                                                  | ⏳ 待手動    |

**驗收**：`.env.production` 不在 git 中、VisualThemeContext 用 usePersistedState、冷啟動 retry 503→5s/10s/15s、DashboardGrid 無直接 localStorage 操作、無冗餘 code。

**狀態**：✅ 完成（2026-03-27）。Branch protection 待手動操作。

> **新增項目來源**：冷啟動 retry（Review Critical #1）、DashboardGrid localStorage（Review Critical #2）、`.env.example`（Review Warning #4）

### P4-3. 行動裝置響應式

| 項目                          | 做法                                                                                              | 結果         |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ------------ |
| useIsMobile 共用 Hook         | 新建 `src/hooks/useIsMobile.ts`，NewsPanel 改 import 共用版                                       | ✅ `7144de1` |
| GridLayout 單欄               | mobile: `cols={1}`, `rowHeight={300}`, `isDraggable={false}`, `isResizable={false}`, padding 16px | ✅ `7144de1` |
| Header padding                | `py-8` → `py-4 sm:py-8`, title `text-4xl` → `text-2xl sm:text-4xl`                                | ✅ `7144de1` |
| StockListSelector hover→touch | 操作按鈕 mobile 常駐 `opacity-60`，桌面維持 hover 觸發                                            | ✅ `7144de1` |
| SummaryBar 小螢幕             | `hidden sm:flex` → `flex`，mobile 顯示首個 symbol + `+N` 計數                                     | ✅ `7144de1` |

**驗收**：375px viewport 下所有功能可操作，無水平溢出。

**狀態**：✅ 完成（2026-03-27）

**實作備註**：GridLayout 未先抽 `useGridLayout` hook（評估後認為直接加 `isMobile` 條件分支即可，最小改動原則），預估 2-3h 實際約 30min。

> **預估調整原因**：Review Warning #1 指出 DashboardGrid 420 行混合元件上做響應式風險高。改為先抽 hook 再改，預估 1h → 2-3h。

### P4-4. 無障礙（A11y）

| 項目                                | 做法                                                                      | 結果                                        |
| ----------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| ThemeSettings ARIA + ESC            | 加 `role="dialog"`, `aria-modal="true"`, ESC `onKeyDown` handler          | ✅ `2aa22f1`                                |
| ThemeSettings aria-label            | button `title` → `aria-label`（雙語）                                     | ✅ `2aa22f1`                                |
| ThemeSettings focus trap            | `FocusTrap` 包裹 dropdown panel，`clickOutsideDeactivates: true`          | ✅ 補修 2026-03-31                          |
| NewsCard `<div onClick>` → `<a>`    | 改為語義化 `<a href>` + `target="_blank"`，移除 `onClick` + `window.open` | ✅ `2aa22f1`                                |
| StockListSelector inline style 清理 | 內嵌 `<style>` keyframes 移入 `src/index.css`                             | ✅ 補修 2026-03-31（原 `2aa22f1` 標記有誤） |
| Focus trap — CreateListModal        | `FocusTrap` 包裹 modal + `role="dialog"` + `aria-modal="true"`            | ✅ 補修 2026-03-31                          |
| Focus trap — StockListSelector      | `FocusTrap` 包裹 dropdown，`clickOutsideDeactivates: true`                | ✅ 補修 2026-03-31                          |

**技術決策變更**：原計畫用 Radix UI，實作時改為 `focus-trap-react`（named import `{ FocusTrap }`）。Radix Dialog 接管整個 modal DOM 結構，與現有佈局衝突大。`focus-trap-react` 只做 focus trap 不接管 DOM，侵入性更低。
**驗收**：ThemeSettings ESC 可關閉、NewsCard 鍵盤可 Enter 導航、Tab 鍵在所有 modal/dropdown 內循環不逸出。

**狀態**：✅ 完成（2026-03-31 補修完畢）

> **方案決策來源**：Review Warning #2。新增 StockListSelector inline style 清理（Review Suggestion #1）。
> **補修來源**：Phase 4 Code Review FAIL #2（inline style）、FAIL #3（focus trap 零整合）。

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

| 日期       | 版本 | 變更                                                                                                                                                                                                                               |
| ---------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-25 | v1.0 | 初版，從 project-audit-2026-03-23.md 彙整 Phase 4-5 待辦                                                                                                                                                                           |
| 2026-03-26 | v1.1 | 依據 review-p4-p5-plan.md 審閱結果修訂：優先序調整（CI 先行）、新增 5 項遺漏任務至 P4-2、GridLayout 預估調整、Focus trap 決定用 Radix UI、P5-1 新增 GitHub Actions audit、P5-2 baseline 已測量並達標、殘餘觀察擴充至 10 項         |
| 2026-03-27 | v1.2 | Phase 4 實作完成（v1.17.0）：P4-1 CI 修復、P4-2 技術債清理、P4-3 響應式、P4-4 a11y 部分完成（focus trap 待整合）。9 commits `e53bdf3`..`2aa22f1`                                                                                   |
| 2026-03-31 | v1.3 | Phase 4 補修：FAIL #2 inline style 移入 index.css、FAIL #3 focus-trap-react 整合至 3 個元件、CreateListModal 加 role/aria-modal。FAIL #1 eslint-disable 為 reviewer 誤判（rule 是 v7 真實規則），comments 已恢復。Phase 4 全部完成 |
