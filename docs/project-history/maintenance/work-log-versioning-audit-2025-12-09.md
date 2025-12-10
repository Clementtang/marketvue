# 版本號審查與維護規範建立 - 2025-12-09

## 工作概述

完成 Phase 2 文件更新後，使用者詢問版本號演進是否符合 best practice，觸發了完整的版本號審查與維護規範建立工作。

## 審查結果

### 檢查項目

1. **檢查對象**：CHANGELOG.md 中所有版本號（1.0.0 → 1.7.0）
2. **檢查標準**：[Semantic Versioning 2.0.0](https://semver.org/)
3. **總版本數**：28 個版本

### 發現的問題

#### ❌ 問題 1：版本號重複

**位置**：CHANGELOG.md (2025-11-09)

```markdown
## [1.3.4] - 2025-11-09

### Fixed
- **Build Error**: Fixed TypeScript compilation error
  - TS6133 error - 'domainMin' declared but never used

## [1.3.4] - 2025-11-09 (Earlier Fix)

### Fixed
- **Candlestick Chart Coordinate Calculation**: Fixed critical issue
```

**問題分析**：
- 同一版本號 1.3.4 在 CHANGELOG 中出現兩次
- 兩者都是同一天（2025-11-09）的不同修復
- 違反 Semantic Versioning 規則：每個版本號應該唯一

**建議修正**：
- 第一個應該是 1.3.5
- 第二個保持 1.3.4
- **不建議修改已發布的版本號**（會造成混亂）

**預防措施**：
- 同一天多個修復應該累積到單一版本
- 或者使用遞增版本號（1.3.4, 1.3.5, 1.3.6...）

---

#### ⚠️ 問題 2：移除功能使用 PATCH 版本號

**位置**：1.2.1 (2025-11-04)

```markdown
## [1.2.1] - 2025-11-04

### Removed
- **News Feature**: Completely removed news functionality
  - Removed backend news API endpoint
  - Removed all news-related schemas
  - Deleted NewsPanel.tsx component
```

**問題分析**：
- 移除整個功能模組（News Feature）
- 根據 Semantic Versioning，這是破壞性變更
- 應該使用 MAJOR 版本號 (2.0.0) 或至少 MINOR (1.3.0)

**可接受的辯護**：
- CHANGELOG 註明 News 功能使用率極低
- 功能從未正式發布給一般使用者
- 對現有使用者影響極小

**建議**：
- 未來移除功能應更謹慎判斷版本號
- 如果影響使用者 API，使用 MAJOR
- 如果影響極小，可使用 MINOR 並在 CHANGELOG 說明

---

#### ⚠️ 問題 3：改進功能使用 PATCH 版本號

**位置**：1.3.1 (2025-11-06)

```markdown
## [1.3.1] - 2025-11-06

### Improved
- **Smart 503 Error Handling**: Optimized retry logic
  - 503 errors now use longer retry intervals (5s, 10s, 15s)
  - Better user experience when API service is waking up
```

**問題分析**：
- CHANGELOG 章節為 "Improved"（改進）
- 新增了功能性的優化（更長的重試間隔）
- 根據 Semantic Versioning，"改進" 是向後相容的新功能
- 應該使用 MINOR 版本號 (1.4.0) 而非 PATCH (1.3.1)

**語意化版本定義**：
- PATCH: 向後相容的 **bug 修復**
- MINOR: 向後相容的 **新功能** 和 **改進**

**建議**：
- "Improved" 章節的變更應使用 MINOR 版本號
- 只有 "Fixed" 章節的 bug 修復才使用 PATCH

---

### ✅ 正確的版本演進範例

**新功能使用 MINOR**：
- 1.1.0 → 新增 Production Deployment Support ✅
- 1.3.0 → 新增 18 Stock Support ✅
- 1.5.0 → 新增 Grid Pagination ✅
- 1.6.0 → 新增 Warm Minimal Design ✅
- 1.7.0 → 新增 Phase 2 Motion & Interaction ✅

**Bug 修復使用 PATCH**：
- 1.1.0 → 1.1.1 - 修復 API URL 配置 ✅
- 1.3.2 → 1.3.3 - 修復 Candlestick Chart Rendering ✅

**整體評估**：
- **基本符合** Semantic Versioning
- 主要問題：版本號重複、改進功能誤用 PATCH
- 建議加強版本號判斷的規範

---

## 執行的工作

### 1. 創建版本號維護指南

**檔案位置**：`.claude/versioning-guide.md`

**內容結構**：
1. **基本規則**：MAJOR.MINOR.PATCH 定義
2. **版本號判斷決策樹**：流程圖式的判斷邏輯
3. **常見情境與正確版本號**：實際案例對照表
4. **歷史問題與修正建議**：今天發現的 3 個問題
5. **版本號檢查清單**：發布前必須執行的檢查
6. **CHANGELOG 維護規範**：標準格式和章節使用指南
7. **快速參考卡**：常見關鍵字對應版本號
8. **實際案例研究**：MarketVue 過去版本的分析

**特色功能**：
- 決策樹協助快速判斷版本號
- 檢查清單確保不遺漏重要步驟
- 實際案例研究提供參考
- 常見錯誤分析避免重複犯錯

---

### 2. 更新 .claude/instructions.md

**新增內容**：版本號維護指南的參考連結

**位置**：工作流程 > Phase 3: 文件更新 章節

**修改內容**：
```markdown
3. package.json（更新版本號）
   - 新功能: MINOR +1
   - Bug 修復: PATCH +1
   - 破壞性變更: MAJOR +1
   - 📚 詳細規範參考：.claude/versioning-guide.md
```

---

### 3. 更新 Phase 2 設計文件

**檔案位置**：`docs/design/PHASE_2_PLAN.md`

**更新內容**：
- 標記所有 6 個 Task 為 ✅ 已完成
- 新增實作完成日期和技術細節
- 標記所有測試檢查清單為完成
- 標記所有成功指標為達成
- 新增「額外成就」章節記錄統一設計系統
- 更新狀態為 ✅ 已完成

**額外成就記錄**：
1. Unified Design System: Border-Radius Hierarchy
2. 使用者體驗優化（移除藍色懸停效果）
3. TypeScript 建構修正（Vercel 部署）

---

## 未來工作建議

### 短期（下次版本更新時）

1. **使用版本號檢查清單**：
   - 每次更新版本號前執行 `.claude/versioning-guide.md` 的檢查清單
   - 確保版本號不重複
   - 確保版本號類型正確（MAJOR/MINOR/PATCH）

2. **CHANGELOG 格式檢查**：
   - 確保章節分類正確（Added/Improved/Fixed/Changed/Removed）
   - "Improved" 使用 MINOR 版本號
   - "Fixed" 使用 PATCH 版本號
   - "Removed" 謹慎判斷使用 MAJOR 或 MINOR

3. **版本號一致性**：
   - package.json 版本號
   - CHANGELOG.md 頂部版本號
   - 確保兩者一致

### 中期（Q1 2025）

1. **自動化檢查**：
   - 考慮使用 GitHub Actions 檢查版本號一致性
   - 自動驗證 CHANGELOG 格式
   - Pre-commit hook 檢查版本號規則

2. **版本號策略文件化**：
   - 在 CONTRIBUTING.md 添加版本號更新指南
   - 提供版本號判斷範例
   - 說明何時需要 MAJOR/MINOR/PATCH

### 長期（Q2 2025+）

1. **Release Notes 自動生成**：
   - 基於 CHANGELOG 自動生成 GitHub Release Notes
   - 自動標記版本 tag
   - 自動發布到 npm（如適用）

2. **版本號策略審查**：
   - 每季度審查版本號使用情況
   - 持續改進版本號判斷規則
   - 收集社群反饋

---

## 檔案清單

### 新增檔案

1. `.claude/versioning-guide.md` - 版本號維護指南（完整）
2. `docs/work-log-versioning-audit-2025-12-09.md` - 本工作紀錄

### 修改檔案

1. `.claude/instructions.md` - 新增版本號指南參考
2. `docs/design/PHASE_2_PLAN.md` - 標記 Phase 2 完成
3. `package.json` - 版本號更新為 1.7.0（之前已完成）
4. `CHANGELOG.md` - v1.7.0 發布記錄（之前已完成）

---

## 技術細節

### 版本號判斷決策樹

```
變更類型？
├─ 移除功能 → 影響使用者 API？
│  ├─ 是 → MAJOR
│  └─ 否 → MINOR
├─ 新功能/改進 → MINOR
└─ Bug 修復 → PATCH
```

### CHANGELOG 章節與版本號對應

| 章節 | 版本號 | 範例 |
|------|-------|------|
| Added | MINOR | 1.6.0 → 1.7.0 |
| Improved | MINOR | 1.6.0 → 1.7.0 |
| Fixed | PATCH | 1.7.0 → 1.7.1 |
| Changed | MINOR/MAJOR | 依影響決定 |
| Removed | MAJOR/MINOR | 依影響決定 |
| Technical | PATCH | 1.7.0 → 1.7.1 |

---

## 參考資源

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- `.claude/versioning-guide.md` - MarketVue 版本號維護指南
- `.claude/general-principles.md` - 通用開發原則

---

## 總結

今天的工作建立了完整的版本號維護規範，發現並記錄了歷史版本號的 3 個問題，並提供了未來改進的建議。透過版本號檢查清單和決策樹，未來的版本更新將更加規範和一致。

**關鍵收穫**：
1. ✅ "Improved" 章節應使用 MINOR 版本號
2. ✅ 版本號絕對不能重複
3. ✅ 移除功能需要謹慎判斷 MAJOR/MINOR
4. ✅ 發布前必須檢查版本號一致性

**下次版本更新時記得**：
- 使用 `.claude/versioning-guide.md` 的檢查清單
- 使用決策樹判斷版本號
- 確保 package.json 與 CHANGELOG.md 版本號一致
