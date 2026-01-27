# MarketVue 專案 Claude 指南

## 📚 通用設定參考

請先閱讀上層目錄的通用設定（適用於所有專案）：

- **`../../.claude/character.md`** - 芙莉蓮角色設定
  - 個性特質、語氣風格
  - 使用 `say` 指令總結工作
  - 雙語溝通原則

- **`../../.claude/general-principles.md`** - 通用開發原則
  - 文件完整性（CHANGELOG、README、註解）
  - Git Commit 規範（Conventional Commits）
  - 語意化版本控制（Semantic Versioning）
  - 程式碼品質標準（TypeScript + Python）
  - 測試、錯誤處理、效能優化原則

---

## 🎯 MarketVue 專案特定規範

### 專案基本資訊

- **專案名稱**：MarketVue
- **描述**：即時多市場股票追蹤儀表板 / Real-time Multi-Market Stock Dashboard
- **當前版本**：v1.4.0
- **授權**：MIT License
- **儲存庫**：https://github.com/Clementtang/marketvue.git
- **本地路徑**：`/Users/clementtang/marketvue`

⚠️ **重要**：所有檔案操作都應該使用這個路徑，不要使用 `/tmp/` 或其他臨時路徑。

### 技術棧

#### 前端
- React 19.1.1 + TypeScript + Vite 7.1.7
- Tailwind CSS 4.1.15
- Recharts 3.3.0（圖表）
- axios 1.12.2（HTTP）
- react-grid-layout 1.5.2（網格佈局）

#### 後端
- Flask 3.0.0 + Python 3.11.0
- yfinance >=0.2.66（股票數據）
- Flask-Caching 2.1.0（5 分鐘快取，634x 效能提升）
- gunicorn 21.2.0（生產伺服器）

#### 部署
- **前端**：Vercel (https://marketvue.vercel.app)
- **後端**：Render Free Tier - Singapore (https://marketvue-api.onrender.com)
  - ⚠️ 閒置 15 分鐘後睡眠，冷啟動需 30-60 秒
  - 前端已實作智能重試機制（503 錯誤特殊處理）

⚠️ **部署配置重要原則**：
1. **永遠優先使用 MCP 確認狀態**：在修改任何部署相關配置前，必須先使用 MCP 工具檢查當前狀態
   - Vercel: `mcp__vercel__get_project`, `mcp__vercel__list_deployments`
   - Render: `mcp__render__get_service`, `mcp__render__list_services`
2. **參考配置文件**：詳細的部署配置記錄在 `docs/DEPLOYMENT_CONFIG.md`
3. **避免錯誤假設**：不要假設需要重新配置已經正常運作的服務

### 核心功能

- **股票追蹤**：最多 18 檔股票（6x3 網格）
- **多市場支援**：台灣（.TW, .TWO）、美國、香港（.HK）、日本（.JP）
- **技術指標**：MA20、MA60、平均成交量
- **自訂功能**：雙語（zh-TW/en-US）、深色/淺色模式、Eastern/Western 顏色主題

### 雙語支援要求 🌐

**必須雙語**：
- ✅ 所有 UI 文字（按鈕、標籤、標題）
- ✅ 所有錯誤訊息
- ✅ README.md (中文) + README_EN.md (英文)
- ✅ CHANGELOG 主要用英文，可加中文說明

**不需雙語**：
- ❌ 程式碼註解（主要用英文）
- ❌ Git commit 訊息（僅英文）
- ❌ 內部 TODO 文件（用繁中）

#### 新增翻譯流程

**位置**：`src/i18n/translations.ts`（目前 92+ keys）

```typescript
// 1. 新增 interface key
export interface Translations {
  newKey: string;
}

// 2. 新增兩種語言的翻譯
export const translations: Record<Language, Translations> = {
  'zh-TW': { newKey: '中文翻譯' },
  'en-US': { newKey: 'English Translation' },
};

// 3. 在元件中使用
const translations = useTranslation(language);
<button>{translations.newKey}</button>
```

### 專案結構

```
/Users/clementtang/marketvue/
├── backend/                          # Flask 後端
│   ├── app.py                        # 主應用
│   ├── config.py                     # 設定
│   ├── constants.py                  # 常數定義
│   ├── requirements.txt              # Python 依賴
│   ├── data/company_names.json       # 36+ 公司名稱對照
│   ├── routes/stock_routes.py        # API 路由
│   ├── schemas/stock_schemas.py      # 請求/回應 Schema
│   ├── services/                     # SOLID 架構服務層
│   │   ├── stock_service.py          # 協調器 (Facade + DI)
│   │   ├── stock_data_fetcher.py     # 資料擷取
│   │   ├── stock_data_transformer.py # 資料轉換
│   │   ├── price_calculator.py       # 價格計算
│   │   └── company_name_service.py   # 公司名稱服務
│   ├── utils/
│   │   ├── decorators.py             # 錯誤處理裝飾器
│   │   └── error_handlers.py         # 錯誤處理器
│   └── tests/                        # 後端測試 (73 tests, 87%+ coverage)
│
├── src/                              # React 前端
│   ├── components/
│   │   ├── stock-card/               # 股票卡片模組（拆分後）
│   │   │   ├── StockCard.tsx         # 主組件
│   │   │   ├── StockCardHeader.tsx   # 標題與價格
│   │   │   ├── StockCardChart.tsx    # 股價圖表
│   │   │   ├── StockVolumeChart.tsx  # 成交量圖表
│   │   │   ├── StockCardFooter.tsx   # 底部資訊
│   │   │   ├── StockCardLoading.tsx  # 載入狀態
│   │   │   ├── StockCardError.tsx    # 錯誤狀態
│   │   │   └── hooks/useStockData.ts # 資料擷取 Hook
│   │   ├── common/
│   │   │   └── Toast.tsx             # Toast 通知組件
│   │   ├── StockManager.tsx          # 股票管理（最多 18 檔）
│   │   ├── DashboardGrid.tsx         # 儀表板網格（6x3）
│   │   ├── ErrorBoundary.tsx         # 錯誤邊界
│   │   └── ...
│   ├── contexts/                     # React Context
│   │   ├── AppContext.tsx            # 應用設定（語言、主題）
│   │   ├── ChartContext.tsx          # 圖表設定（日期、類型）
│   │   └── ToastContext.tsx          # Toast 通知狀態
│   ├── hooks/                        # Custom Hooks
│   │   ├── useRetry.ts               # 重試邏輯（指數退避）
│   │   └── index.ts
│   ├── config/
│   │   └── chartTheme.ts             # 統一主題配置
│   ├── i18n/translations.ts          # 雙語翻譯 (92+ keys)
│   └── App.tsx
│
├── docs/                             # 文件
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── security/                     # 安全文件
│   └── work-log-*.md                 # 工作日誌
│
├── scripts/
│   └── security-check.sh             # 安全檢查腳本
│
├── .claude/instructions.md           # 本檔案
├── .todo/                            # 內部 TODO（不進 Git）
├── vercel.json                       # Vercel 配置
├── CHANGELOG.md
├── README.md / README_EN.md
├── ROADMAP.md
└── package.json
```

### API 相關

#### 環境變數
```bash
# 前端 .env
VITE_API_URL=http://localhost:5001  # 不要加 /api 後綴

# 後端 backend/.env
PORT=5001
PYTHON_VERSION=3.11.0
```

#### 快取策略
- **快取類型**：SimpleCache（記憶體）
- **快取時間**：5 分鐘
- **快取端點**：`/api/stock-data/<symbol>`, `/api/batch-stocks`
- **效能提升**：634x faster (1.92s → 0.003s)

#### 錯誤處理與重試

**503 錯誤（冷啟動）**：
```typescript
// StockCard.tsx 智能重試邏輯
const coldStartDelays = [5000, 10000, 15000]; // 5s, 10s, 15s
errorMessage = language === 'zh-TW'
  ? '服務可能正在啟動中（首次訪問需要 30-60 秒），請稍候...'
  : 'Service may be starting up...';
```

**其他錯誤**：指數退避、最多 3 次重試、30 秒 timeout

### 命名慣例

- **React 元件**：PascalCase.tsx (`StockCard.tsx`)
- **工具函式**：camelCase.ts (`formatNumber.ts`)
- **Python 模組**：snake_case.py (`stock_routes.py`)
- **常數**：UPPER_SNAKE_CASE (`MAX_STOCKS`)
- **翻譯 Keys**：camelCase (`enterStockSymbol`)

---

## 🔄 工作流程

### 功能開發流程

#### Phase 1: 規劃
1. 建立 TODO tracking 文件：`.todo/YYYYMMDD_feature_name.md`
2. 設計方案（考慮雙語、效能、UX）
3. 與使用者確認（使用 `AskUserQuestion`）

#### Phase 2: 實作
1. 使用 `TodoWrite` 建立追蹤清單
2. 前端實作（TypeScript + React）
3. 後端實作（Flask，如需要）
4. 新增雙語翻譯
5. 測試

#### Phase 3: 文件更新（順序重要！）
```
1. CHANGELOG.md
   ## [版本號] - YYYY-MM-DD
   ### Added / Changed / Fixed / Improved

2. README.md + README_EN.md（如影響使用方式）

3. package.json（更新版本號）
   - 新功能/改進: MINOR +1 (例: 1.6.0 → 1.7.0)
   - Bug 修復: PATCH +1 (例: 1.7.0 → 1.7.1)
   - 破壞性變更: MAJOR +1 (例: 1.7.0 → 2.0.0)
   - 📚 **詳細規範參考**: .claude/versioning-guide.md
   - ⚠️ **重要**: "Improved" 章節使用 MINOR，不是 PATCH
   - ⚠️ **檢查清單**: 發布前執行版本號檢查清單

4. 其他文件（如適用）
```

#### Phase 4: Git Commit
```bash
feat: <subject>

<body>

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

#### Phase 5: 總結
```bash
say "工作完成了呢。[簡短描述完成的工作]"
```

### Bug 修復流程

#### Phase 1: 診斷
1. 重現問題
2. 定位根本原因
3. 記錄診斷過程（`.todo/YYYYMMDD_bugfix_description.md`）

#### Phase 2: 修復
1. 實作修復（最小化變更範圍）
2. 測試修復
3. 更新 CHANGELOG（`### Fixed` 章節）

#### Phase 3: Git Commit
```bash
fix: <subject>

<body>

Fixes #issue_number

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

### TODO 追蹤系統

#### 6 維度分類
1. **Phase**: P0（緊急）、P1（短期）、P2（中期）、P3（長期）
2. **Category**: Feature、Enhancement、Bug Fix、Tech Debt、Documentation、Infrastructure
3. **Effort**: S（1-4h）、M（1-3d）、L（1-2w）、XL（2+w）
4. **Impact**: High、Medium、Low
5. **Status**: 📋 Backlog、🎯 Planned、🚧 In Progress、✅ Done、❌ Cancelled
6. **Module**: Frontend、Backend、Infrastructure、Docs、Full-stack

#### TODO 檔案位置
- **任務清單**：`.todo/detailed-tasks.md`
- **每日工作記錄**：`.todo/work-logs/YYYY-MM-DD.md`（繁體中文，12 個章節）
- **專案記錄**：`.todo/YYYYMMDD_feature_name.md`

#### 使用 TodoWrite 工具
```typescript
[
  {
    "content": "實作功能",
    "activeForm": "實作中：功能",
    "status": "in_progress"  // 同時只能有一個 in_progress
  },
  {
    "content": "更新文件",
    "activeForm": "更新中：文件",
    "status": "pending"
  }
]
```

**規則**：
- 同時只能有一個 TODO 處於 `in_progress`
- 完成一個任務後，立即標記為 `completed`
- 開始新任務前，將其標記為 `in_progress`

### 測試檢查清單（手動）

#### 前端測試
- [ ] 新增/移除股票功能正常
- [ ] 時間範圍切換正常
- [ ] 圖表顯示正確
- [ ] 雙語切換正常（zh-TW ↔ en-US）
- [ ] 主題切換正常（深色 ↔ 淺色、Western ↔ Eastern）
- [ ] 錯誤處理正常顯示
- [ ] 重試機制正常運作

#### 後端測試
- [ ] API 端點正常回應
- [ ] 快取機制運作
- [ ] 錯誤處理正確
- [ ] CORS 設定正確

#### 跨瀏覽器測試
- [ ] Chrome/Edge
- [ ] Safari
- [ ] Firefox

### 部署流程

⚠️ **在任何部署操作前，必須先用 MCP 確認當前狀態！**

#### 前端（Vercel）
1. **檢查狀態**：
   ```bash
   mcp__vercel__get_project(
     projectId="prj_rsbQtqLdXJGJIkZXa7uYud603dk5",
     teamId="team_3hW0eIvgcozexFfsxMd60TNj"
   )
   ```
2. 確認變更（測試通過、文件更新、版本號更新）
3. `git push origin main`
4. Vercel 自動建構部署（1-2 分鐘）
5. **驗證部署**：
   ```bash
   mcp__vercel__list_deployments(...)
   # Check: readyState === "READY"
   ```
6. 檢查 https://marketvue.vercel.app

#### 後端（Render）
1. **檢查狀態**：
   ```bash
   mcp__render__get_service(serviceId="srv-d447klili9vc73dt8h1g")
   # Check: suspended === "not_suspended"
   ```
2. 確認變更（requirements.txt 更新、環境變數設定）
3. `git push origin main`
4. 手動部署（如需要）：Render Dashboard → Manual Deploy
5. **驗證健康狀態**：
   ```bash
   curl https://marketvue-api.onrender.com/api/health
   # Expected: {"service":"marketvue-api","status":"healthy"}
   ```

#### 部署配置詳情
- 完整的部署配置和 IDs 記錄在：`docs/DEPLOYMENT_CONFIG.md`
- MCP 命令參考和故障排除檢查清單也在該文件中

---

## 📋 完成檢查清單

### 功能開發完成
- [ ] 功能實作完成（型別安全、錯誤處理）
- [ ] 所有 UI 文字有雙語翻譯
- [ ] 錯誤訊息有雙語翻譯
- [ ] 測試過中英文切換
- [ ] CHANGELOG.md 已更新
- [ ] README 已更新（如需要）
- [ ] package.json 版本號已更新
- [ ] 手動測試通過
- [ ] Commit message 遵循規範
- [ ] Push 到 remote 成功
- [ ] TodoWrite 清單已更新

### Bug 修復完成
- [ ] Bug 已修復
- [ ] 問題根本原因已識別
- [ ] 沒有引入新問題
- [ ] 問題不再重現
- [ ] CHANGELOG.md 已更新（Fixed 章節）
- [ ] 診斷和修復過程已記錄
- [ ] Commit message 清楚描述修復內容

---

## 🔗 相關資源

### 開發規範與指南
- **通用設定**：`../../.claude/character.md`, `../../.claude/general-principles.md`
- **版本號維護指南**：`.claude/versioning-guide.md` ⭐ 更新版本號前必讀
- **專案文件**：`/Users/clementtang/marketvue/docs/`

### 專案文件
- **開發藍圖**：`ROADMAP.md`
- **貢獻指南**：`CONTRIBUTING.md`
- **變更記錄**：`CHANGELOG.md`

---

**記住**：這些規範是指導原則，不是死板的規則。根據實際情況靈活調整。保持專業、簡潔、友善的芙莉蓮風格呢。
