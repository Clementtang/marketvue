# MarketVue - Claude Code 專案指南

> 這是 MarketVue 專案的 Claude Code 配置文件，用於團隊協作和 Claude Code Web 環境。
> 個人化設定請放在 `.claude/` 目錄（已在 .gitignore 中）。

---

## 🎯 專案基本資訊

- **專案名稱**：MarketVue
- **描述**：即時多市場股票追蹤儀表板 / Real-time Multi-Market Stock Dashboard
- **當前版本**：v1.3.4
- **授權**：MIT License
- **儲存庫**：https://github.com/Clementtang/marketvue
- **線上 Demo**：https://marketvue.vercel.app

---

## 🛠️ 技術棧

### 前端
- **框架**：React 19 + TypeScript + Vite
- **樣式**：Tailwind CSS
- **圖表**：Recharts 3.3.0
- **HTTP 客戶端**：axios
- **佈局**：react-grid-layout

### 後端
- **框架**：Flask 3.0 + Python 3.11
- **數據源**：yfinance >=0.2.66
- **快取**：Flask-Caching（5 分鐘，634x 效能提升）
- **生產伺服器**：gunicorn

### 部署
- **前端**：Vercel → https://marketvue.vercel.app
- **後端**：Render (Singapore) → https://marketvue-api.onrender.com
  - ⚠️ Free Tier 閒置 15 分鐘後睡眠，冷啟動需 30-60 秒
  - 前端已實作智能重試機制

---

## 📁 專案結構

```
marketvue/
├── backend/                    # Flask 後端
│   ├── app.py                  # 主應用
│   ├── routes/stock_routes.py  # API 路由
│   └── services/stock_service.py
│
├── src/                        # React 前端
│   ├── components/             # React 組件
│   │   ├── StockCard.tsx
│   │   ├── StockManager.tsx
│   │   ├── DashboardGrid.tsx
│   │   └── CandlestickChart.tsx
│   ├── i18n/translations.ts    # 雙語翻譯
│   └── App.tsx
│
├── docs/                       # 專案文檔
├── .claude-public/             # 團隊共享配置（本目錄）
├── CHANGELOG.md                # 版本變更記錄
├── README.md / README_EN.md
└── ROADMAP.md
```

---

## 🌐 雙語支援規範

MarketVue 是**完全雙語專案**（繁體中文 + 英文）。

### 必須雙語
- ✅ 所有 UI 文字（按鈕、標籤、提示）
- ✅ 所有錯誤訊息
- ✅ README 文件（README.md 中文 + README_EN.md 英文）
- ✅ CHANGELOG 主要用英文，可加中文說明

### 不需雙語
- ❌ 程式碼註解（主要用英文）
- ❌ Git commit 訊息（僅英文）
- ❌ API 端點名稱（僅英文）

### 新增翻譯流程

**位置**：`src/i18n/translations.ts`

```typescript
// 1. 新增 interface key
export interface Translations {
  newFeature: string;
}

// 2. 新增兩種語言的翻譯
export const translations: Record<Language, Translations> = {
  'zh-TW': { newFeature: '新功能' },
  'en-US': { newFeature: 'New Feature' },
};

// 3. 在組件中使用
const translations = useTranslation(language);
<button>{translations.newFeature}</button>
```

---

## 📝 編碼規範

### 命名慣例
- **React 組件**：PascalCase (`StockCard.tsx`)
- **工具函式**：camelCase (`formatNumber.ts`)
- **Python 模組**：snake_case (`stock_routes.py`)
- **常數**：UPPER_SNAKE_CASE (`MAX_STOCKS = 18`)
- **翻譯 Keys**：camelCase (`enterStockSymbol`)

### TypeScript / React
- 使用 TypeScript strict mode
- 所有組件使用函數式組件 + Hooks
- Props 必須定義 interface
- 使用 `const` 優於 `let`
- 避免 `any`，使用具體類型

### Python / Flask
- 遵循 PEP 8 風格指南
- 使用 type hints
- 函數和類別需要 docstrings
- 錯誤處理使用明確的 try-except

### CSS / Tailwind
- 優先使用 Tailwind utility classes
- 組件樣式使用 `className`
- 深色模式使用 `dark:` prefix
- 響應式設計使用 `sm:` `md:` `lg:` 等

---

## 🔄 Git Commit 規範

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>: <subject>

<body>

<footer>
```

### Commit Types
- `feat`: 新功能
- `fix`: Bug 修復
- `docs`: 文檔更新
- `style`: 代碼格式（不影響功能）
- `refactor`: 代碼重構
- `test`: 測試相關
- `chore`: 建置工具、依賴更新

### 範例
```bash
feat: add candlestick chart to stock cards

Implemented K-line chart using Recharts with custom SVG rendering.
- Supports Asian/Western color themes
- Handles high-volatility stocks correctly
- Responsive design with dark mode support

Closes #123

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🚀 開發工作流程

### 1. 功能開發

#### Phase 1: 規劃
- 確認需求和設計方案
- 考慮雙語支援和響應式設計
- 評估對現有功能的影響

#### Phase 2: 實作
1. 前端實作（TypeScript + React）
2. 後端實作（Flask，如需要）
3. 新增雙語翻譯到 `translations.ts`
4. 本地測試（前端 + 後端）

#### Phase 3: 文檔更新（重要順序）
1. **CHANGELOG.md** - 記錄變更
   ```markdown
   ## [版本號] - YYYY-MM-DD
   ### Added / Changed / Fixed
   - 變更描述
   ```

2. **README.md + README_EN.md** - 更新使用說明（如需要）

3. **package.json** - 更新版本號
   - 新功能：MINOR +1 (1.2.0 → 1.3.0)
   - Bug 修復：PATCH +1 (1.2.0 → 1.2.1)
   - 破壞性變更：MAJOR +1 (1.2.0 → 2.0.0)

#### Phase 4: Git Commit
- 使用 Conventional Commits 格式
- 清楚描述變更和原因
- 推送到 GitHub

### 2. Bug 修復

#### Phase 1: 診斷
1. 重現問題
2. 定位根本原因
3. 記錄診斷過程

#### Phase 2: 修復
1. 實作修復（最小化變更）
2. 測試修復
3. 更新 CHANGELOG（`### Fixed` 章節）

#### Phase 3: 提交
```bash
fix: correct candlestick rendering for high-volatility stocks

Fixed issue where stocks with >9% daily range extended beyond chart bounds.

Root cause: Fixed 10% price range estimation failed for volatile stocks
Solution: Calculate actual min/max from dataset and pass to component

Tested with 6763.TWO (9.3% volatility) - now renders correctly.

Fixes #456
```

---

## 🧪 測試檢查清單

### 前端測試
- [ ] 新增/移除股票功能
- [ ] 時間範圍切換（5D/1M/3M/6M/1Y）
- [ ] 圖表顯示正確（價格、成交量、K 線）
- [ ] 雙語切換（zh-TW ↔ en-US）
- [ ] 主題切換
  - [ ] 深色 ↔ 淺色模式
  - [ ] Western ↔ Asian 顏色主題
- [ ] 錯誤處理和重試機制
- [ ] 響應式設計（手機、平板、桌面）

### 後端測試
- [ ] API 端點回應正確
- [ ] 快取機制運作
- [ ] 錯誤處理（404, 500, timeout）
- [ ] CORS 設定正確

### 跨瀏覽器
- [ ] Chrome / Edge
- [ ] Safari
- [ ] Firefox

---

## 🚢 部署流程

### 前端（Vercel）
1. 確認所有變更已測試
2. 確認文檔已更新
3. `git push origin main`
4. Vercel 自動部署（1-2 分鐘）
5. 驗證：https://marketvue.vercel.app

### 後端（Render）
1. 確認 `requirements.txt` 已更新
2. 確認環境變數設定正確
3. `git push origin main`
4. Render 自動部署或手動觸發
5. 驗證：https://marketvue-api.onrender.com/api/health

---

## ⚙️ 環境變數

### 前端 `.env`
```bash
VITE_API_URL=http://localhost:5001
# 注意：不要加 /api 後綴
```

### 後端 `backend/.env`
```bash
PORT=5001
PYTHON_VERSION=3.11.0
```

---

## 🎨 核心功能說明

### 股票追蹤
- 最多追蹤 **18 檔股票**（6x3 網格佈局）
- 支援多市場：台灣(.TW, .TWO)、美國、香港(.HK)、日本(.JP)
- 實時價格更新
- 可拖拽排序（react-grid-layout）

### 技術指標
- **MA20**：20 日移動平均線（橙色）
- **MA60**：60 日移動平均線（綠色）
- **平均成交量**：所選時間範圍的平均交易量
- **K 線圖**：蠟燭圖顯示 OHLC（開高低收）

### 自訂功能
- **雙語介面**：繁體中文 ↔ English
- **深色模式**：淺色 ↔ 深色主題
- **顏色主題**：
  - Western（綠漲紅跌）
  - Asian/Eastern（紅漲綠跌）
- **本地儲存**：自動保存用戶偏好和股票清單

---

## 🐛 常見問題

### 1. 後端冷啟動（503 錯誤）
**問題**：Render Free Tier 閒置後睡眠，首次請求需等待
**解決方案**：前端已實作智能重試
- 503 錯誤使用較長重試間隔（5s, 10s, 15s）
- 自動重試最多 3 次
- 顯示友善的等待訊息

### 2. API URL 配置
**問題**：`/api/api` 雙重路徑
**解決方案**：`VITE_API_URL` 不要包含 `/api` 後綴
```bash
✅ VITE_API_URL=http://localhost:5001
❌ VITE_API_URL=http://localhost:5001/api
```

### 3. K 線圖超出範圍
**問題**：高波動股票（>9%）K 線超出圖表底部
**解決方案**：已修復（v1.3.4）
- 使用實際數據範圍計算座標
- 支援所有波動範圍（0.5% - 10%+）

---

## 📚 相關資源

- **開發藍圖**：[ROADMAP.md](../ROADMAP.md)
- **貢獻指南**：[CONTRIBUTING.md](../CONTRIBUTING.md)
- **變更記錄**：[CHANGELOG.md](../CHANGELOG.md)
- **API 文檔**：[docs/API.md](../docs/API.md)
- **架構文檔**：[docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- **部署指南**：[docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)

---

## 🤝 協作提示

### 使用 Claude Code Web
- 本配置文件可在 Web 環境訪問
- Web 端無法訪問 `.claude/` 和 `.todo/` 目錄
- 個人化設定請放在 `.claude/`（不提交到 Git）
- 工作日誌請放在 `.todo/`（不提交到 Git）

### Git 工作流程
1. 從 `main` 分支創建 feature 分支
2. 小步提交，清晰的 commit messages
3. 推送前確認測試通過
4. 需要時創建 Pull Request
5. 部署前確認文檔已更新

---

**最後更新**：2025-11-09
**維護者**：Clement Tang
**License**：MIT

---

> 💡 **提示**：這些規範是指導原則，根據實際情況靈活調整。
> 保持代碼簡潔、可讀、可維護。
