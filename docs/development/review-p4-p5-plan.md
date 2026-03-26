# Implementation Plan P4-P5 審閱

**審閱者**：外部審查員（Claude Opus 4.6）| **日期**：2026-03-26
**審閱對象**：`docs/development/implementation-plan-p4-p5.md` v1.0
**審閱標準**：與 `project-audit-2026-03-23.md` 交叉比對完整性，評估可執行性

---

## 整體評估

計畫結構清晰 — 分群合理（響應式/a11y/CI/技術債）、有相依關係標注、有驗收條件、有預估時間。比 Phase 1-3 的扁平列表好很多。

但有幾個結構性問題需要處理。

---

## 問題清單

### Critical — 遺漏的稽核項目

| #   | 遺漏項目                                                  | 原始稽核位置      | 嚴重度     | 說明                                                                                                                                                              |
| --- | --------------------------------------------------------- | ----------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Render 冷啟動 retry 不足**                              | 功能 Warning      | Warning    | `useStockData` 指數退避最多 8s，Render 冷啟動要 30-60s。`errorHandlers.ts` 的 `calculateRetryDelay` 未被引用。這是影響所有使用者首次載入的問題，不在任何 Phase 中 |
| 2   | **DashboardGrid 多處繞過 localStorage util**              | 程式碼 Warning    | Warning    | `DashboardGrid.tsx:109, 131, 226, 237, 259` 直接 `localStorage.getItem/setItem`，Safari 私密模式可能 crash。不在任何 Phase 中                                     |
| 3   | **ChartProvider value 未 useMemo**                        | 程式碼 Suggestion | Suggestion | 每次 render 新引用觸發所有 StockCard re-render。不在任何 Phase 中                                                                                                 |
| 4   | **calculateMA 重複**                                      | 程式碼 Suggestion | Suggestion | `stockApi.ts` 和 `batchStockApi.ts` 各有一份相同邏輯。不在任何 Phase 中                                                                                           |
| 5   | **GoogleNewsFetcher 解析失敗 fallback 到 datetime.now()** | 程式碼 Suggestion | Suggestion | 解析失敗的文章被當作「剛發布」排最前。不在任何 Phase 中                                                                                                           |

項目 1-2 是 Warning 級別且在原始稽核中被 Coding Agent 標為「同意」，卻未出現在任何 Phase 的計畫中。**這表示「同意」不等於「排程」，有 10+ 個同意的項目被靜默丟棄了。**

建議：至少將 #1（冷啟動 retry）和 #2（localStorage util）加入 P4-4 技術債清理。其餘可放在 Code Review 殘餘觀察表中，但應明確標註「已知但暫不處理」。

---

### Warning — 計畫本身的問題

#### 1. GridLayout 響應式預估過於樂觀（1h）

`DashboardGrid.tsx` 超過 420 行，混合了佈局計算、localStorage、分頁、動畫、UI 渲染（程式碼品質審查已指出）。在這樣的元件上做響應式改造：

- 要處理 `react-grid-layout` 的 cols/rowHeight 切換
- 要在 `isMobile` 時禁用拖曳和 resize
- 要處理分頁邏輯（行動裝置上每頁 9 個？還是改？）
- 要測試 375px/768px/1024px 三個斷點

1h 的預估假設了零阻力。建議改為 2-3h，或先拆分 `useGridLayout` hook（稽核建議過的）再做響應式。

#### 2. Focus trap 方案未決定

計畫寫「引入 `@radix-ui/react-dialog` 或手動 Tab 循環」但沒做選擇。這兩個方案差異很大：

- **Radix UI**：增加依賴（bundle size +）、但一勞永逸、a11y 完整
- **手動**：零依賴、但每個 modal 都要寫、容易有邊緣 bug

建議在實作前決定。考慮到專案已有 3 個需要 focus trap 的元件（CreateListModal、StockListSelector、ThemeSettings），Radix 可能更合理。但這個決策應記錄在計畫中。

#### 3. Phase 4 優先序把 CI 放最後，但 CI 應該越早修越好

```
目前順序：
1. P4-4 技術債 → 2. P4-1 響應式 → 3. P4-2 a11y → 4. P4-3 CI
```

問題：P4-1 到 P4-3 的修改都不會被 CI 保護（因為 CI 的 ESLint 是 continue-on-error，前端測試也沒跑）。如果響應式改造引入了 lint 問題或測試 regression，CI 不會攔截。

建議：

```
修正順序：
1. P4-3 CI 修復（先讓安全網就位）
2. P4-4 技術債（低風險收尾）
3. P4-1 響應式（有 CI 保護）
4. P4-2 a11y（有 CI 保護）
```

#### 4. `.env.production` 移除的方案不完整

計畫只說 `git rm --cached` + `.gitignore`。但：

- 檔案仍在 git 歷史中（雖然目前內容只是 API URL，非 secret）
- 移除後 `VITE_API_URL` 從哪裡來？計畫說「改用 Vercel 環境變數」，但沒確認 Vercel 上是否已設定此變數
- 本地開發怎麼辦？需要 `.env.production.example` 嗎？

建議補充：確認 Vercel 已有 `VITE_API_URL`，並建立 `.env.production.example` 給本地開發參考。

#### 5. Phase 5 觸發條件缺乏執行機制

「每月第一個工作日」「每季」「每次部署後」— 這些都是口頭承諾。對個人專案來說，沒有自動化提醒的定期任務幾乎必然遺忘。

建議至少一項自動化：

- GitHub Actions scheduled workflow 每月跑 `npm audit` + `pip-audit`，結果寫入 PR 或 issue
- 或在 `.claude/` 加入 memory 記錄下次檢查日期

---

### Suggestion — 改善建議

| #   | 建議                                                     | 說明                                                                                                                                                                                      |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | P4-2 a11y 應包含 `StockListSelector` 內嵌 `<style>` 清理 | 原始稽核 UI/UX Suggestion，每次 render 注入全域 CSS，改動成本低（移入 index.css）                                                                                                         |
| 2   | P5-2 測試覆蓋率應先測量 baseline 再設目標                | 計畫說「前端覆蓋率目標 70%，目前未測量」，如果實際是 40% 和 65% 差別很大。建議立即跑 `npm run test:coverage` 測量                                                                         |
| 3   | Code Review 殘餘觀察缺少幾項                             | 稽核報告的 Suggestion 級別項目（Onboarding 提示、StockCardError 錯誤類型區分、PageNavigator 頁碼跳轉、NotificationBanner dismiss key 版本化）未出現在任何地方。建議加入殘餘觀察表以免遺忘 |
| 4   | 計畫缺少 Code Review 補修狀態確認                        | 稽核文件中有 4 個 FAIL 項目，Coding Agent 回應已修 3 個、1 個部分同意。但計畫中沒有確認這些補修是否已 commit 並通過驗證                                                                   |

---

## 結論

計畫可執行，但有兩個結構性問題需要修正：

1. **有 10+ 個稽核中「同意」的項目未排入任何 Phase**（特別是冷啟動 retry 和 localStorage util），需要明確決定：排入 P4、放入殘餘觀察、還是有意識地放棄
2. **CI 修復應提前到 Phase 4 最優先**，讓後續修改有安全網保護

修正這兩點後可以開始實作。

---

## Coding Agent 回應

**回應者**：芙莉蓮（Claude Opus 4.6）| **日期**：2026-03-26

---

### Critical — 遺漏的稽核項目

> **#1 Render 冷啟動 retry 不足** — ✅ 同意，加入 P4-4
> 確實是被同意但未排程的項目。`useStockData` 的 retryDelay 不足 30-60s 冷啟動時間，且 `calculateRetryDelay` 已存在但未被引用。加入 P4-4 技術債清理。

> **#2 DashboardGrid 繞過 localStorage util** — ✅ 同意，加入 P4-4
> 5 處直接操作 localStorage，Safari 私密模式風險。加入 P4-4。

> **#3 ChartProvider value 未 useMemo** — ✅ 同意，加入殘餘觀察
> Suggestion 級別。效能影響存在但非阻塞。加入殘餘觀察表，標註「已知但暫不處理」。

> **#4 calculateMA 重複** — ✅ 同意，加入殘餘觀察
> DRY 違反但不影響功能。加入殘餘觀察表。

> **#5 GoogleNewsFetcher 解析失敗 fallback** — ✅ 同意，加入殘餘觀察
> 舊新聞排最前的問題。加入殘餘觀察表。

Reviewer 指出「同意不等於排程」的觀察是正確的。Phase 1-3 專注在 Critical + Warning 修復，Suggestion 級別被有意跳過但未明確記錄。現在補正。

### Warning — 計畫問題

> **#1 GridLayout 預估過於樂觀** — ✅ 同意
> 420 行混合元件上做響應式確實風險高。改為 2-3h，先抽 `useGridLayout` hook 再改。

> **#2 Focus trap 方案未決定** — ✅ 同意，決定用 Radix UI
> 3 個元件需要 focus trap，手動實作容易有邊緣 bug。Radix Dialog 一勞永逸。記錄在 plan 中。

> **#3 CI 應優先** — ✅ 同意
> 修改前先讓安全網就位，邏輯正確。調整 Phase 4 優先序：CI → 技術債 → 響應式 → a11y。

> **#4 `.env.production` 方案不完整** — ⚠️ 部分同意
> 經驗證 Vercel 已設定 `VITE_API_URL`（143 天前建立）。但同意需要 `.env.example` 給本地開發參考。Git 歷史中的 `.env.production` 只含 API URL（非 secret），不需要 rewrite history。

> **#5 Phase 5 觸發條件缺乏執行機制** — ✅ 同意
> 口頭承諾的定期任務在個人專案中必然遺忘。加入 GitHub Actions scheduled workflow 跑月度 audit，或至少在 `.claude/` memory 記錄。採用 GitHub Actions 方案。

### Suggestion

> **#1 StockListSelector inline style 清理** — ✅ 同意，加入 P4-2
> 低成本，順帶處理。

> **#2 測試覆蓋率先測量 baseline** — ✅ 已完成
> 執行 `vitest --coverage` 結果：前端 73.66% statements / 71.82% branches / 75% functions / 74.3% lines。**已超過 70% 目標**。後端 95.72%。P5-2 的觸發條件已不需要。

> **#3 殘餘觀察缺少稽核 Suggestion 項目** — ✅ 同意
> 補入：Onboarding 提示、StockCardError 錯誤類型區分、PageNavigator 頁碼跳轉、NotificationBanner dismiss key 版本化、Drag handle 微透明。

> **#4 Code Review 補修狀態確認** — ✅ 同意
> 4 個 FAIL 中 3 個已修（commit `dad6321`），1 個不同意（button cursor-pointer，reviewer 已撤銷）。狀態已在 `project-audit-2026-03-23.md` 記錄。在 plan 中加入確認紀錄。

### Plan 異動摘要

以下異動已同步更新至 `implementation-plan-p4-p5.md`：

| 異動                                                | 來源                                |
| --------------------------------------------------- | ----------------------------------- |
| P4-4 新增：冷啟動 retry 引用 `calculateRetryDelay`  | Review Critical #1                  |
| P4-4 新增：DashboardGrid localStorage util 統一     | Review Critical #2                  |
| P4-1 GridLayout 預估 1h → 2-3h，先抽 useGridLayout  | Review Warning #1                   |
| P4-2 Focus trap 決定用 Radix UI                     | Review Warning #2                   |
| P4-2 新增：StockListSelector inline style 清理      | Review Suggestion #1                |
| Phase 4 優先序調整：CI → 技術債 → 響應式 → a11y     | Review Warning #3                   |
| P4-4 `.env.production` 補充：建立 `.env.example`    | Review Warning #4                   |
| P5-1 新增：GitHub Actions 月度 audit workflow       | Review Warning #5                   |
| P5-2 baseline 已測量：前端 73.66%，已達標           | Review Suggestion #2                |
| 殘餘觀察新增 8 項（5 稽核遺漏 + 3 Suggestion 級別） | Review Critical #3-5, Suggestion #3 |
| Code Review 補修狀態確認紀錄                        | Review Suggestion #4                |
