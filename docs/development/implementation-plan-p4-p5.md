# MarketVue Implementation Plan — Phase 4 & 5

**建立日期**：2026-03-25
**來源**：`docs/development/project-audit-2026-03-23.md`（稽核報告 + Code Review）
**前置完成**：Phase 1-3 已於 v1.16.2 完成（10 commits, `ca9a03a`..`dad6321`）

---

## 目標與範圍

Phase 4 聚焦**中期改善**：行動裝置體驗、無障礙合規、CI 品質門檻、技術債清理。
Phase 5 聚焦**長期規劃**：供應鏈安全、依賴管理、測試覆蓋率、監控。

---

## Phase 4 — 中期改善

### P4-1. 行動裝置響應式

| 項目                          | 檔案                                                      | 做法                                                                     | 預估  |
| ----------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ | ----- |
| GridLayout 單欄               | `src/components/DashboardGrid.tsx:375`                    | `containerWidth < 640` 時 `cols={1}`, `rowHeight={280}`, 禁用拖曳/resize | 1h    |
| Header padding                | `src/App.tsx:69`                                          | `py-8` → `py-4 sm:py-8`, title `text-4xl` → `text-2xl sm:text-4xl`       | 5min  |
| StockListSelector hover→touch | `src/components/stock-list/StockListSelector.tsx:186-191` | Rename/Delete 按鈕行動裝置 always visible 或長按觸發                     | 30min |
| SummaryBar 小螢幕 hidden      | `src/components/SummaryBar.tsx:75-76`                     | `hidden sm:flex` 改為至少顯示首個 symbol 或股票總數                      | 15min |
| useIsMobile 共用 Hook         | `src/components/news/NewsPanel.tsx:21-31`                 | 抽成 `src/hooks/useIsMobile.ts`，所有元件共用                            | 15min |

**相依關係**：useIsMobile 應先完成，其他項目可平行。
**驗收**：375px viewport 下所有功能可操作，無水平溢出。

**狀態**：待開始

### P4-2. 無障礙（A11y）

| 項目                             | 檔案                                                 | 做法                                                     | 預估  |
| -------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- | ----- |
| Focus trap — CreateListModal     | `src/components/stock-list/CreateListModal.tsx:65`   | 引入 `@radix-ui/react-dialog` 或手動 Tab 循環            | 30min |
| Focus trap — StockListSelector   | `src/components/stock-list/StockListSelector.tsx:94` | 同上                                                     | 20min |
| ThemeSettings ARIA + ESC         | `src/components/ThemeSettings.tsx:88`                | 加 `role="dialog"`, `aria-modal="true"`, ESC `onKeyDown` | 15min |
| ThemeSettings aria-label         | `src/components/ThemeSettings.tsx:83`                | `title` → `aria-label`                                   | 5min  |
| NewsCard `<div onClick>` → `<a>` | `src/components/news/NewsCard.tsx:41`                | 改為語義化 `<a>` 標籤，鍵盤可 Enter 觸發                 | 10min |

**相依關係**：無，可獨立完成。
**驗收**：Tab 鍵不離開 modal、ESC 可關閉、screen reader 可識別 dialog。

**狀態**：待開始

### P4-3. CI/CD 修復

| 項目              | 檔案                                        | 做法                                                   | 預估  |
| ----------------- | ------------------------------------------- | ------------------------------------------------------ | ----- |
| ESLint strict     | `.github/workflows/frontend-quality.yml:42` | 修正 ESLint 問題後移除 `continue-on-error: true`       | 30min |
| 前端測試步驟      | `.github/workflows/frontend-quality.yml`    | 加入 `npm test -- --run` 步驟                          | 5min  |
| Python 矩陣更新   | `.github/workflows/backend-tests.yml:20`    | `['3.9', '3.10', '3.11']` → `['3.11', '3.12', '3.13']` | 5min  |
| Vercel build 驗證 | CI                                          | 確認 CI 用 `tsc -b` 而非 `tsc --noEmit`                | 10min |

**相依關係**：ESLint strict 需先修正所有 lint 問題才能移除 continue-on-error。
**驗收**：CI 全綠，無 continue-on-error，前端測試在 CI 中執行。

**狀態**：待開始

### P4-4. 技術債清理

| 項目                                      | 檔案                                  | 做法                                                       | 預估         |
| ----------------------------------------- | ------------------------------------- | ---------------------------------------------------------- | ------------ |
| `.env.production` 從 git 移除             | `.env.production`, `.gitignore`       | `git rm --cached`, 加入 `.gitignore`, 改用 Vercel 環境變數 | 10min        |
| VisualThemeContext 改用 usePersistedState | `src/contexts/VisualThemeContext.tsx` | 移除自寫 localStorage 邏輯，改用共用 hook                  | 15min        |
| StockListContext `isInitialized` 冗餘移除 | `src/contexts/StockListContext.tsx`   | 移除硬編碼 `true` 的 `isInitialized` 和相關 guard          | 10min        |
| Branch protection                         | GitHub Settings                       | 啟用 require PR review + prohibit force push               | 5min（手動） |

**相依關係**：無。
**驗收**：`.env.production` 不在 git 中、VisualThemeContext 用 usePersistedState、無冗餘 code。

**狀態**：待開始

### Phase 4 優先序建議

```
1. P4-4 技術債清理（低風險、快速完成）
2. P4-1 useIsMobile 共用 Hook（其他響應式項目依賴）
3. P4-1 其餘響應式項目
4. P4-2 無障礙
5. P4-3 CI/CD 修復
```

---

## Phase 5 — 長期規劃

### P5-1. 供應鏈安全

| 項目                | 觸發條件                | 做法                                      |
| ------------------- | ----------------------- | ----------------------------------------- |
| Backend lock file   | 一次性                  | 使用 `pip-compile` 或 `uv` 產生 lock file |
| npm audit 月度檢查  | 每月第一個工作日        | 執行 `npm audit`，high severity 立即修復  |
| pip-audit 月度檢查  | 每月第一個工作日        | 執行 `pip-audit`，有漏洞則升級            |
| Dependency 分批升級 | 每季或 audit 報 high 時 | patch → minor → major 分批處理            |

**狀態**：待排程

### P5-2. 測試覆蓋率

| 項目           | 目標          | 目前                                               |
| -------------- | ------------- | -------------------------------------------------- |
| 前端覆蓋率     | 70%           | 未測量（201 tests）                                |
| 後端覆蓋率     | 80%（已達成） | 95.72%（286 tests）                                |
| 優先補測試區域 | —             | DashboardGrid localStorage、BatchProcessingService |

**觸發條件**：Phase 4 完成後測量前端 baseline，未達 70% 則排程補測試。

**狀態**：待 Phase 4 完成後觸發

### P5-3. 監控

| 項目                     | 觸發條件       | 做法                                                         |
| ------------------------ | -------------- | ------------------------------------------------------------ |
| Google News RSS 格式監控 | 每次部署後     | 檢查 RSS 回傳格式是否仍為預期結構                            |
| API rate limit 前端提示  | 下次 UX 改善時 | Finnhub/Google News 達到 rate limit 時顯示明確提示而非空列表 |

**狀態**：待排程

---

## Code Review 殘餘觀察

以下項目非阻塞，優先序低，記錄備查：

| 項目                                           | 說明                                           | 建議處理時機                |
| ---------------------------------------------- | ---------------------------------------------- | --------------------------- |
| REORDER_STOCKS 未驗證 symbol 歸屬              | 可注入任意 symbol，風險低                      | 下次修改 reducer 時順帶處理 |
| batchStockApi processBatch unhandled rejection | setTimeout async 邊緣情況，目前 try/catch 完整 | 僅監控，不主動修改          |

---

## 文件管理規範

本規範適用於 MarketVue 所有 Phase 的開發流程。

### 文件職責分工

| 文件                    | 職責                 | 路徑                                        |
| ----------------------- | -------------------- | ------------------------------------------- |
| **Implementation Plan** | 規劃與執行追蹤       | `docs/development/implementation-plan-*.md` |
| **Audit / Review**      | 稽核發現與回應紀錄   | `docs/development/project-audit-*.md`       |
| **CHANGELOG**           | 面向使用者的版本紀錄 | `CHANGELOG.md`                              |

### 更新時機

| 事件                 | 動作                                                          |
| -------------------- | ------------------------------------------------------------- |
| 任務完成時           | 更新 plan 文件：標記狀態為「已完成」、記錄 commit hash 和日期 |
| Phase 完成時         | 更新 plan 文件：標記 Phase 狀態、更新 CHANGELOG、bump 版本號  |
| 收到 reviewer 回饋時 | 回應寫入 audit/review 文件（不修改 plan）                     |
| 新增待辦項目時       | 加入 plan 文件對應 Phase，不寫入 audit 文件                   |

### 範例：標記任務完成

```markdown
| `.env.production` 從 git 移除 | ... | 10min | ✅ `abc1234` 2026-04-01 |
```

---

## 變更紀錄

| 日期       | 版本 | 變更                                                     |
| ---------- | ---- | -------------------------------------------------------- |
| 2026-03-25 | v1.0 | 初版，從 project-audit-2026-03-23.md 彙整 Phase 4-5 待辦 |
