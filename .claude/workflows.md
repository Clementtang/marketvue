# 協作流程規範 (Collaboration Workflows)

> MarketVue 專案中 Claude 助理與開發者的協作流程

## 通用工作流程

### 接收任務
```
1. 理解需求
   ├─ 仔細閱讀使用者的描述
   ├─ 識別關鍵需求和限制
   └─ 如有疑問，使用 AskUserQuestion 工具詢問

2. 確認範圍
   ├─ 確認是否影響雙語功能（zh-TW + en-US）
   ├─ 確認是否需要更新文件
   └─ 確認是否需要更新版本號

3. 建立 TODO 清單
   └─ 使用 TodoWrite 工具建立任務追蹤
```

### 執行任務
```
1. 開始工作前
   ├─ 標記第一個 TODO 為 in_progress
   └─ 確保只有一個 TODO 處於 in_progress 狀態

2. 實作過程
   ├─ 遵循 general-principles.md 的程式碼標準
   ├─ 遵循 marketvue-guidelines.md 的專案規範
   └─ 完成一個任務後，立即標記為 completed

3. 測試
   ├─ 提供手動測試步驟
   └─ 列出需要檢查的項目
```

### 完成任務
```
1. 文件更新
   ├─ 更新 CHANGELOG.md
   ├─ 更新 README（如需要）
   └─ 更新 package.json 版本號（如需要）

2. Git commit
   ├─ 遵循 Conventional Commits 格式
   ├─ 撰寫清楚的 commit message
   └─ Push 到 remote

3. 使用 say 指令總結
   └─ 使用語音總結完成的工作
```

## 功能開發流程 (Feature Development)

### Phase 1: 規劃階段
```
1. 建立 TODO tracking 文件
   位置: .todo/YYYYMMDD_feature_name.md
   內容:
   ├─ 背景與需求
   ├─ 解決方案設計
   ├─ 實施步驟
   ├─ 測試計畫
   └─ 影響評估

2. 設計方案
   ├─ 考慮現有架構
   ├─ 考慮雙語支援需求
   ├─ 考慮效能影響
   └─ 考慮使用者體驗

3. 與使用者確認
   └─ 使用 AskUserQuestion 確認設計方向
```

### Phase 2: 實作階段
```
1. 建立 TodoWrite 追蹤清單
   範例:
   - [ ] 實作前端元件
   - [ ] 實作後端 API（如需要）
   - [ ] 新增雙語翻譯
   - [ ] 更新文件

2. 前端實作
   ├─ 建立或修改 React 元件
   ├─ 使用 TypeScript 確保型別安全
   ├─ 遵循現有命名慣例
   └─ 新增必要的翻譯 keys

3. 後端實作（如需要）
   ├─ 建立或修改 Flask routes
   ├─ 實作 service 層邏輯
   ├─ 新增必要的驗證
   └─ 考慮快取策略

4. 測試
   └─ 提供完整的手動測試清單
```

### Phase 3: 文件更新
```
順序很重要！按照以下順序更新：

1. CHANGELOG.md
   格式:
   ## [版本號] - YYYY-MM-DD

   ### Added
   - **功能名稱**: 功能描述
     - 詳細說明 1
     - 詳細說明 2
     - 影響說明

2. README.md / README_EN.md
   更新時機:
   ├─ 新增主要功能
   ├─ 變更使用方式
   ├─ 更新技術棧
   └─ 變更安裝步驟

3. package.json
   更新 version 欄位:
   ├─ 新功能: MINOR 版本 +1
   ├─ Bug 修復: PATCH 版本 +1
   └─ 破壞性變更: MAJOR 版本 +1

4. 其他文件（如適用）
   ├─ API.md（新 API 端點）
   ├─ ARCHITECTURE.md（架構變更）
   └─ DEPLOYMENT.md（部署流程變更）
```

### Phase 4: Git Commit
```
1. 檢查變更
   git status
   git diff

2. 暫存檔案
   git add <files>

3. Commit message 格式
   feat: <subject>

   <body>

   <footer>

   範例:
   feat: add CSV export functionality for stock data

   Implemented CSV export feature allowing users to download
   historical price data and technical indicators (MA20, MA60).

   - Added export button to StockCard component
   - Created CSV generation utility function
   - Updated bilingual translations (zh-TW, en-US)
   - Added documentation to README

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>

4. Push
   git push origin main
```

### Phase 5: 總結工作
```
使用 say 指令總結:

say "工作完成了呢。今天實作了 [功能名稱]。主要包含 [重點 1]、[重點 2]、[重點 3]。文件都已更新，程式碼也 push 了。"

範例:
say "工作完成了呢。今天實作了 CSV 匯出功能。主要包含股票卡片的匯出按鈕、CSV 生成邏輯，以及雙語翻譯支援。文件都已更新，程式碼也 push 了。"
```

## Bug 修復流程 (Bug Fix)

### Phase 1: 診斷
```
1. 重現問題
   ├─ 確認問題的具體症狀
   ├─ 確認觸發條件
   └─ 確認影響範圍

2. 定位根本原因
   ├─ 檢查相關程式碼
   ├─ 檢查最近的變更
   ├─ 檢查錯誤日誌
   └─ 檢查相關 issue

3. 記錄診斷過程
   位置: .todo/YYYYMMDD_bugfix_description.md
   內容:
   ├─ 問題描述
   ├─ 重現步驟
   ├─ 根本原因分析
   ├─ 解決方案
   └─ 預防措施
```

### Phase 2: 修復
```
1. 實作修復
   ├─ 最小化變更範圍
   ├─ 確保不引入新問題
   └─ 考慮邊界情況

2. 測試修復
   ├─ 驗證問題已解決
   ├─ 驗證沒有副作用
   └─ 測試相關功能

3. 更新文件
   CHANGELOG.md:
   ### Fixed
   - **問題描述**: 修復說明
     - 根本原因
     - 解決方法
     - 影響範圍
```

### Phase 3: Git Commit
```
Commit message 格式:
fix: <subject>

<body>

<footer>

範例:
fix: correct volume display to show average instead of last day

Previously showed volume of the last trading day in the date range,
which appeared unchanged when switching time ranges with the same end date.
Now displays average volume across the entire selected time range.

- Changed calculation in StockCard.tsx
- Updated bilingual labels (zh-TW / en-US)
- Better reflects trading activity over the period

Fixes #123

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 文件更新流程 (Documentation Update)

### 更新 CHANGELOG
```
位置: /Users/clementtang/stock-dashboard/CHANGELOG.md

格式:
## [Unreleased]

## [版本號] - YYYY-MM-DD

### Added (新功能)
- **功能名稱**: 描述
  - 詳細點 1
  - 詳細點 2

### Changed (變更)
- 變更描述

### Fixed (修復)
- **Bug 描述**: 修復說明
  - 根本原因
  - 解決方法

### Improved (改進)
- **改進項目**: 改進說明
  - 效能數據（如適用）
  - 使用者體驗提升

### Removed (移除)
- 移除功能說明
  - 移除原因
  - 替代方案

### Technical Details (技術細節)
- 技術實作細節
```

### 更新 README
```
更新時機:
1. 新增主要功能
2. 變更使用方式
3. 更新技術棧
4. 變更安裝步驟
5. 新增支援的市場或股票數量

注意:
- 同時更新 README.md（中文）和 README_EN.md（英文）
- 保持兩個檔案內容同步
- 更新範例程式碼（如適用）
```

### 更新 API 文件
```
位置: /Users/clementtang/stock-dashboard/docs/API.md

更新時機:
1. 新增 API 端點
2. 變更請求/回應格式
3. 新增錯誤碼
4. 變更認證方式

內容:
├─ 端點路徑和方法
├─ 請求參數
├─ 回應格式
├─ 錯誤碼
└─ 範例
```

## TODO 追蹤流程

### 建立 TODO 清單
```typescript
使用 TodoWrite 工具:

[
  {
    "content": "實作 CSV 匯出功能",
    "activeForm": "實作中：CSV 匯出功能",
    "status": "in_progress"
  },
  {
    "content": "新增雙語翻譯",
    "activeForm": "新增中：雙語翻譯",
    "status": "pending"
  },
  {
    "content": "更新 CHANGELOG",
    "activeForm": "更新中：CHANGELOG",
    "status": "pending"
  }
]
```

### 更新 TODO 狀態
```
規則:
1. 同時只能有一個 TODO 處於 in_progress
2. 完成一個任務後，立即標記為 completed
3. 開始新任務前，將其標記為 in_progress
4. 不再相關的任務應該從清單移除

範例:
任務 1 完成 → 標記為 completed
任務 2 開始 → 標記為 in_progress
任務 3 仍然 → 保持 pending
```

### 建立詳細追蹤文件
```
位置: .todo/YYYYMMDD_feature_or_bugfix_name.md

結構:
# [功能/修復名稱]

## 📋 背景與需求
描述為什麼需要這個變更

## 🎯 目標
列出具體目標

## 💡 解決方案設計
詳細設計說明

## 🚀 實施步驟
1. 步驟 1
2. 步驟 2
...

## ✅ 測試計畫
- [ ] 測試項目 1
- [ ] 測試項目 2

## 📊 影響評估
- 效能影響
- 使用者體驗影響
- 技術債影響

## 📝 實施記錄
記錄實際實施過程

## 🎉 完成檢查清單
- [ ] 程式碼實作
- [ ] 測試完成
- [ ] 文件更新
- [ ] Git commit
- [ ] Push 到 remote
```

## 每日工作記錄流程

### 建立每日記錄
```
位置: .todo/work-logs/YYYY-MM-DD.md
語言: 繁體中文

結構（12 個章節）:

# YYYY 年 MM 月 DD 日工作記錄

## 📋 工作摘要
- 主要完成的任務
- 時間分配

## 🔍 問題診斷與排查
詳細記錄問題的診斷過程

## 🛠️ 問題解決
記錄解決方案的選擇和實施

## 💡 改進方案設計
記錄設計思路和決策

## 🚀 實施
詳細記錄實施過程

## 📊 成果統計
- 修改的檔案數量
- 新增/刪除的程式碼行數
- Git commit hash

## 🎯 技術亮點
記錄值得注意的技術細節

## 📝 學習與收穫
記錄從這次工作中學到的東西

## 🚀 部署狀態
記錄部署相關資訊

## ✅ 測試建議
提供測試建議

## 📅 時間分配
記錄時間使用情況

## 🎉 總結
總結今日工作
```

### 更新時機
```
1. 完成重要功能後
2. 解決複雜問題後
3. 一天工作結束時
4. 使用者明確要求時
```

## 雙語處理流程

### 新增 UI 文字
```
步驟 1: 在 translations.ts 新增 key
位置: /Users/clementtang/stock-dashboard/src/i18n/translations.ts

export interface Translations {
  // ... 現有 keys
  newKey: string;
}

export const translations: Record<Language, Translations> = {
  'zh-TW': {
    // ... 現有翻譯
    newKey: '中文翻譯',
  },
  'en-US': {
    // ... existing translations
    newKey: 'English Translation',
  },
};

步驟 2: 在元件中使用
const translations = useTranslation(language);
<button>{translations.newKey}</button>

步驟 3: 測試
- [ ] 切換到中文，檢查顯示
- [ ] 切換到英文，檢查顯示
- [ ] 確認無遺漏的文字
```

### 新增錯誤訊息
```
規則:
1. 所有使用者可見的錯誤訊息都必須雙語
2. 根據錯誤類型提供具體訊息
3. 避免技術術語，使用友善的語言

範例:
if (error.response?.status === 503) {
  errorMessage = language === 'zh-TW'
    ? '服務可能正在啟動中（首次訪問需要 30-60 秒），請稍候...'
    : 'Service may be starting up (first visit takes 30-60 seconds), please wait...';
}
```

## 版本控制流程

### 決定版本號
```
根據 Semantic Versioning:

MAJOR.MINOR.PATCH

MAJOR: 不相容的 API 變更
- 移除功能
- 改變 API 格式
- 破壞性變更

MINOR: 向下相容的新功能
- 新增功能
- 新增 API 端點
- 效能改進

PATCH: 向下相容的 Bug 修復
- 修復 Bug
- 文件更新
- 小幅優化

範例:
1.3.0 → 1.3.1: 修復 503 錯誤處理（PATCH）
1.3.1 → 1.4.0: 新增 CSV 匯出（MINOR）
1.4.0 → 2.0.0: 改變 API 格式（MAJOR）
```

### 更新版本號
```
位置: /Users/clementtang/stock-dashboard/package.json

修改:
{
  "version": "1.3.1",  // 更新這裡
  ...
}

確認:
- CHANGELOG.md 中的版本號一致
- Git tag 與版本號一致（如使用 tags）
```

## 部署流程

### 前端部署（Vercel）
```
1. 確認變更
   - 所有測試通過
   - 文件已更新
   - 版本號已更新

2. Push 到 main
   git push origin main

3. 自動部署
   - Vercel 自動檢測 push
   - 開始建構（約 1-2 分鐘）
   - 自動部署到 production

4. 部署後檢查
   - [ ] 訪問 https://marketvue.vercel.app
   - [ ] 檢查新功能運作正常
   - [ ] 檢查雙語功能正常
   - [ ] 檢查主題切換正常
```

### 後端部署（Render）
```
1. 確認變更
   - 所有測試通過
   - requirements.txt 已更新（如新增依賴）
   - 環境變數已設定（如需要）

2. Push 到 main
   git push origin main

3. 手動部署（如需要）
   - 進入 Render Dashboard
   - 選擇 marketvue-api service
   - 點擊 "Manual Deploy"
   - 等待建構完成（約 2-3 分鐘）

4. 部署後檢查
   - [ ] 訪問 https://marketvue-api.onrender.com/api/health
   - [ ] 檢查回應 HTTP 200
   - [ ] 檢查前端可以取得資料
   - [ ] 檢查錯誤處理正常
```

## 錯誤處理流程

### 遇到技術問題
```
1. 記錄問題
   - 完整的錯誤訊息
   - 重現步驟
   - 環境資訊

2. 分析原因
   - 檢查最近的變更
   - 檢查相關程式碼
   - 搜尋類似問題

3. 提出解決方案
   - 列出可能的解決方法
   - 分析每種方法的優缺點
   - 使用 AskUserQuestion 與使用者討論

4. 實施並驗證
   - 實作選定的解決方案
   - 測試是否解決問題
   - 確認沒有引入新問題

5. 記錄與預防
   - 在工作記錄中記錄過程
   - 更新文件（如適用）
   - 考慮如何預防類似問題
```

### 遇到不確定的情況
```
使用 AskUserQuestion 工具:

範例:
{
  "questions": [
    {
      "question": "CSV 匯出功能應該包含哪些資料？",
      "header": "匯出內容",
      "options": [
        {
          "label": "只有價格資料",
          "description": "只包含開盤、最高、最低、收盤價"
        },
        {
          "label": "價格 + 技術指標",
          "description": "包含價格和 MA20、MA60"
        },
        {
          "label": "完整資料",
          "description": "包含價格、技術指標、成交量"
        }
      ],
      "multiSelect": false
    }
  ]
}
```

## 溝通規範

### 回報進度
```
時機:
- 開始新任務時
- 完成重要步驟時
- 遇到問題時
- 完成任務時

範例:
"好的，我開始實作 CSV 匯出功能。先建立 TODO 清單追蹤進度。"

"CSV 生成邏輯完成了。接下來處理雙語翻譯。"

"遇到一個問題：Recharts 的資料格式不適合直接匯出。有兩種解決方案..."

"CSV 匯出功能完成了。所有文件都已更新，程式碼也 push 了。"
```

### 使用 say 指令總結
```
時機: 完成重要工作後

格式:
say "工作完成了呢。[簡短描述工作內容和成果]"

範例:
say "工作完成了呢。今天實作了智能重試邏輯，針對 503 錯誤使用較長的重試間隔來處理 Render Free tier 的冷啟動。所有文件都已更新，版本升級到 1.3.1，程式碼也已經提交並推送了。"
```

### 語氣和風格
```
參考 character.md 中的芙莉蓮設定:

✅ 應該:
- 簡潔直接
- 專業但親切
- 適當使用「呢」、「嗯」等語助詞
- 不使用 emoji（除非使用者要求）

❌ 不應該:
- 過度熱情或誇張
- 使用過多表情符號
- 說廢話或重複
- 假設使用者的意圖
```

## 檢查清單

### 功能開發完成檢查清單
```
程式碼:
- [ ] 功能實作完成
- [ ] 型別安全（TypeScript）
- [ ] 錯誤處理完善
- [ ] 效能考量

雙語支援:
- [ ] 所有 UI 文字有雙語翻譯
- [ ] 錯誤訊息有雙語翻譯
- [ ] 測試過中英文切換

文件:
- [ ] CHANGELOG.md 已更新
- [ ] README.md 已更新（如需要）
- [ ] README_EN.md 已更新（如需要）
- [ ] package.json 版本號已更新
- [ ] API 文件已更新（如適用）

測試:
- [ ] 手動測試通過
- [ ] 雙語功能正常
- [ ] 主題切換正常
- [ ] 錯誤處理正常
- [ ] 跨瀏覽器測試（主要瀏覽器）

Git:
- [ ] Commit message 遵循規範
- [ ] Commit 包含所有必要檔案
- [ ] Push 到 remote 成功

TODO:
- [ ] TodoWrite 清單已更新
- [ ] 詳細追蹤文件已建立（如需要）
- [ ] 每日工作記錄已更新（如重要功能）
```

### Bug 修復完成檢查清單
```
修復:
- [ ] Bug 已修復
- [ ] 問題根本原因已識別
- [ ] 沒有引入新問題

測試:
- [ ] 問題不再重現
- [ ] 相關功能正常運作
- [ ] 邊界情況已測試

文件:
- [ ] CHANGELOG.md 已更新（Fixed 章節）
- [ ] 診斷和修復過程已記錄

Git:
- [ ] Commit message 清楚描述修復內容
- [ ] 包含 Fixes #issue_number（如適用）
```

---

**這些流程是指導原則，不是死板的規則。根據實際情況靈活調整。**
