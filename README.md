# MarketVue

📊 **即時多市場股票追蹤儀表板** | Real-time Multi-Market Stock Dashboard

[English](./README_EN.md) | 繁體中文

> **🚀 準備部署？** 查看完整的[部署指南](./docs/DEPLOYMENT.md)

---

## 📖 專案簡介

MarketVue 是一個現代化的股票追蹤儀表板，支援多個國際市場的即時股票數據追蹤。透過直覺的介面和強大的圖表功能，讓您輕鬆監控投資組合的表現。

## ✨ 主要特色

- 🌏 **多市場支援**
  - 台灣股市（上市 .TW、上櫃 .TWO）
  - 美國股市
  - 香港股市 (.HK)
  - 日本股市 (.JP)

- 📊 **技術指標**
  - MA20（20 日移動平均線）
  - MA60（60 日移動平均線）
  - 即時價格變化追蹤
  - 成交量分析
  - K 線圖 / 折線圖切換

- 📄 **分頁功能**
  - 支援無限追蹤股票
  - 每頁顯示 9 支股票（3x3 網格）
  - 智慧頁面導航（新增股票時自動跳到最後一頁）
  - 前往上一頁/下一頁按鈕
  - 頁碼指示器

- 📸 **截圖功能**
  - 一鍵複製儀表板截圖到剪貼簿
  - 16:9 寬高比優化（適用於簡報）
  - 支援淺色/深色主題
  - 每頁可獨立截圖

- 🎨 **客製化選項**
  - 視覺主題系統（Classic / Warm Minimal）
    - **Warm Minimal 設計**：溫暖色調、襯線字體、優雅圓角
    - **Classic 設計**：現代藍色、無襯線字體、專業感
  - 漲跌顏色主題（西式紅漲綠跌 / 東式綠漲紅跌）
  - 深色模式 / 淺色模式
  - 系統自動偵測或手動切換
  - 設計指南（Warm Minimal 主題專屬）

- ✨ **流暢動畫與互動**
  - 股票卡片階梯式淡入效果（stagger animation）
  - 價格數字平滑計數動畫
  - 圖表線條依序繪製動畫
  - 骨架屏載入動畫（shimmer effect）
  - 懸停微互動（hover effects）
  - 統一的圓角設計系統（Warm 主題專屬）

- 🌐 **多語言支援**
  - 繁體中文
  - English
  - 公司名稱多語言對照（36+ 家公司）

- 💾 **本地儲存**
  - 追蹤列表自動保存
  - 使用者偏好設定記憶

- 📱 **響應式設計**
  - 支援桌面、平板、手機
  - 流暢的使用體驗

## 🛠️ 技術架構

### 前端
- **React 19** - 現代化前端框架
- **TypeScript** - 型別安全
- **Vite** - 快速建構工具
- **Tailwind CSS v4** - 實用優先的 CSS 框架（@theme 配置、CSS 自訂屬性）
- **Recharts** - 強大的圖表庫
- **react-spring** - 物理動畫庫（流暢的彈簧動畫）
- **Axios** - HTTP 請求客戶端
- **date-fns** - 日期處理工具
- **Lucide Icons** - 美觀的圖示庫
- **modern-screenshot** - 高品質螢幕截圖（支援現代 CSS）
- **Context API** - 全局狀態管理 (AppContext, ChartContext, ToastContext, VisualThemeContext)
- **Custom Hooks** - 可重用邏輯 (useRetry, useStockData, useToast)
- **Animation System** - 統一的動畫配置（animations.ts）
- **Google Fonts** - Playfair Display (襯線)、Inter (無襯線)、Noto Sans TC (中文)

### 後端
- **Flask** - 輕量級 Python Web 框架
- **yfinance** - Yahoo Finance 股票數據 API
- **Flask-CORS** - 跨域資源共享支援
- **Flask-Caching** - 資料快取優化（支援 Redis）
- **Flask-Limiter** - API 速率限制
- **Marshmallow** - 請求驗證
- **Gunicorn** - Production WSGI 伺服器
- **SOLID 架構** - 單一職責服務設計
- **API v1** - 版本化 REST API (`/api/v1/*`)

## 📦 安裝步驟

### 前置需求
- Node.js 18+ 和 npm
- Python 3.8+
- Git

### 1. Clone 專案

```bash
git clone https://github.com/Clementtang/marketvue.git
cd marketvue
```

### 2. 前端設定

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

前端服務將在 `http://localhost:5173` 運行

### 3. 後端設定

```bash
# 進入後端目錄
cd backend

# 建立虛擬環境
python3 -m venv venv

# 啟動虛擬環境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 安裝依賴
pip install -r requirements.txt

# 啟動後端服務（使用 Port 5001）
PORT=5001 python app.py
```

後端 API 將在 `http://localhost:5001` 運行

## 🚀 使用說明

1. **添加股票**
   - 在輸入框中輸入股票代碼
   - 支援的格式：
     - 台股上市：`2330.TW`（台積電）
     - 台股上櫃：`5904.TWO`（寶雅）
     - 美股：`AAPL`（蘋果）
     - 港股：`0700.HK`（騰訊）
     - 日股：`9983.JP`（FAST RETAILING）
   - 點擊「新增」按鈕
   - 最多可追蹤 9 支股票

2. **調整時間範圍**
   - 選擇預設時間範圍（1週、1月、3月、6月、1年）
   - 或自訂開始和結束日期

3. **查看股票資訊**
   - 查看即時價格和漲跌幅
   - 分析移動平均線趨勢（MA20、MA60）
   - 查看成交量走勢
   - 切換 K 線圖 / 折線圖

4. **截圖功能**
   - 點擊右上角綠色「截圖」按鈕
   - 儀表板截圖將自動複製到剪貼簿
   - 可直接貼上到簡報、文件或聊天軟體
   - 自動匹配當前主題（淺色/深色）

5. **自訂設定**
   - 點擊右上角設定圖示
   - 調整顏色主題（Western/Eastern）
   - 切換深色/淺色模式
   - 選擇語言（繁中/英文）

## 📊 支援的市場

| 市場 | 代碼格式 | 範例 |
|------|----------|------|
| 台灣上市 | `XXXX.TW` | 2330.TW（台積電）|
| 台灣上櫃 | `XXXX.TWO` | 5904.TWO（寶雅）|
| 美國 | `SYMBOL` | AAPL（蘋果）|
| 香港 | `XXXX.HK` | 0700.HK（騰訊）|
| 日本 | `XXXX.JP` | 9983.JP（UNIQLO）|

## 🌐 多語言公司名稱

MarketVue 內建超過 36 家知名公司的多語言名稱對照，包括：

**台灣股市**
- 台積電 (2330.TW)、鴻海 (2317.TW)、聯發科 (2454.TW)
- 統一超商 (2912.TW)、全家便利商店 (5903.TWO)、寶雅 (5904.TWO)
- 台灣大哥大 (3045.TW)、遠傳電信 (4904.TW)、中華電信 (2412.TW)

**美國股市**
- Apple (AAPL)、Microsoft (MSFT)、Google (GOOGL)
- Tesla (TSLA)、Amazon (AMZN)、NVIDIA (NVDA)

**香港股市**
- 騰訊 (0700.HK)、阿里巴巴 (9988.HK)、友邦保險 (1299.HK)

**日本股市**
- UNIQLO (9983.JP)、MUJI (7453.JP)、LINE Yahoo (4689.JP)

未在對照表中的股票將自動顯示 Yahoo Finance 提供的英文名稱。

## 🗂️ 專案結構

```
marketvue/
├── backend/                       # Flask 後端
│   ├── app.py                    # Flask 主應用
│   ├── config.py                 # 配置檔案
│   ├── constants.py              # 常數定義
│   ├── requirements.txt          # Python 依賴
│   ├── data/
│   │   └── company_names.json   # 公司名稱多語言對照表
│   ├── routes/
│   │   └── stock_routes.py      # API 路由
│   ├── schemas/
│   │   └── stock_schemas.py     # 請求/回應 Schema
│   ├── services/                 # SOLID 架構服務層
│   │   ├── stock_service.py     # 協調器 (Facade)
│   │   ├── stock_data_fetcher.py    # 資料擷取
│   │   ├── stock_data_transformer.py # 資料轉換
│   │   ├── price_calculator.py      # 價格計算
│   │   └── company_name_service.py  # 公司名稱服務
│   ├── utils/
│   │   ├── decorators.py        # 錯誤處理裝飾器
│   │   └── error_handlers.py    # 錯誤處理器
│   └── tests/                    # 後端測試 (73 tests)
├── src/                          # React 前端
│   ├── components/
│   │   ├── stock-card/          # 股票卡片模組
│   │   │   ├── StockCard.tsx    # 主組件
│   │   │   ├── StockCardHeader.tsx
│   │   │   ├── StockCardChart.tsx
│   │   │   ├── StockVolumeChart.tsx
│   │   │   ├── StockCardFooter.tsx
│   │   │   ├── StockCardLoading.tsx
│   │   │   ├── StockCardError.tsx
│   │   │   └── hooks/useStockData.ts
│   │   ├── common/
│   │   │   ├── Toast.tsx        # Toast 通知組件
│   │   │   ├── AnimatedNumber.tsx # 數字動畫組件
│   │   │   └── ChartTooltip.tsx # 圖表提示框組件
│   │   ├── StockManager.tsx
│   │   ├── TimeRangeSelector.tsx
│   │   ├── DashboardGrid.tsx
│   │   ├── ScreenshotButton.tsx # 截圖按鈕組件
│   │   ├── ThemeSettings.tsx
│   │   ├── ThemeGuide.tsx       # 主題設計指南
│   │   └── ErrorBoundary.tsx    # 錯誤邊界
│   ├── contexts/                 # React Context
│   │   ├── AppContext.tsx       # 應用設定
│   │   ├── ChartContext.tsx     # 圖表設定
│   │   ├── ToastContext.tsx     # Toast 通知
│   │   └── VisualThemeContext.tsx # 視覺主題
│   ├── hooks/                    # Custom Hooks
│   │   ├── useRetry.ts          # 重試邏輯
│   │   └── index.ts
│   ├── utils/
│   │   ├── screenshot.ts        # 截圖工具函式
│   │   └── animations.ts        # 動畫配置與工具
│   ├── config/
│   │   └── chartTheme.ts        # 統一主題配置
│   ├── i18n/
│   │   └── translations.ts      # 多語言翻譯
│   ├── App.tsx                   # 根組件
│   └── main.tsx                  # 入口點
├── docs/                         # 📚 文件中心
│   ├── README.md                # 文件導航索引
│   ├── DOCUMENTATION_GUIDE.md   # 文件組織指南
│   ├── API.md                   # API 文件
│   ├── ARCHITECTURE.md          # 架構文件
│   ├── DEPLOYMENT.md            # 部署指南
│   ├── DEPLOYMENT_CONFIG.md     # 部署配置
│   ├── guides/                  # 使用指南（規劃中）
│   ├── development/             # 開發文件與規劃
│   ├── project-history/         # 專案歷史（按 Phase 組織）
│   │   ├── phases/              # Phase 1-3 工作日誌
│   │   ├── optimizations/       # 優化記錄
│   │   ├── deployments/         # 部署驗證
│   │   └── archive/             # 歸檔文件
│   ├── security/                # 安全文件
│   └── workflows/               # 工作流程 SOP
├── scripts/
│   └── security-check.sh        # 安全檢查腳本
├── package.json
├── vercel.json                   # Vercel 配置
├── README.md
└── README_EN.md
```

## ⚠️ 注意事項

### 免費託管服務限制

本專案的後端 API 使用 **Render Free Tier** 託管，有以下特性：

- **冷啟動時間**: 服務在 15 分鐘無活動後會進入睡眠狀態
- **首次訪問**: 喚醒服務需要 30-60 秒，請耐心等待
- **自動重試**: 前端已實施智能重試機制，會自動處理冷啟動情況
- **用戶體驗**: 首次載入時會顯示「服務可能正在啟動中」的友善提示

這是正常行為，不是錯誤。後續訪問將會快速響應。

## 📚 文件

### 快速導航

- **[📖 文件中心](./docs/README.md)** - 所有文件的中央導航與索引
- **[📋 文件組織指南](./docs/DOCUMENTATION_GUIDE.md)** - 如何組織和維護專案文件

### 技術文件

- **[API 文件](./docs/API.md)** - 完整的 API 端點說明
- **[架構文件](./docs/ARCHITECTURE.md)** - 系統架構與技術選型
- **[部署指南](./docs/DEPLOYMENT.md)** - Vercel + Render 部署設定
- **[部署配置](./docs/DEPLOYMENT_CONFIG.md)** - 環境變數與配置詳情

### 專案管理

- **[專案進度總結](./docs/project-history/PROJECT_PROGRESS_SUMMARY.md)** - Phase 1-3 完整記錄
- **[近期變更時間線](./docs/project-history/recent-changes-timeline.md)** - 最新功能與優化
- **[變更日誌](./CHANGELOG.md)** - 版本變更記錄
- **[開發路線圖](./ROADMAP.md)** - 未來規劃

### 開發資源

- **[開發文件](./docs/development/)** - 技術規劃與會議記錄
- **[專案歷史](./docs/project-history/)** - 按階段組織的工作日誌
  - [Phase 1: CI/CD + 測試基礎](./docs/project-history/phases/phase1/)
  - [Phase 2: 前端重構](./docs/project-history/phases/phase2/)
  - [Phase 3: 後端重構](./docs/project-history/phases/phase3/)
- **[安全文件](./docs/security/README.md)** - 安全審計與實作指南
- **[工作流程](./docs/workflows/)** - 分支管理與快速參考

### 貢獻指南

- **[貢獻指南](./CONTRIBUTING.md)** - 如何參與專案開發（規劃中）

## 🧪 測試

```bash
# 前端測試 (130 tests)
npm test

# 後端測試 (73 tests)
cd backend && source venv/bin/activate
python -m pytest tests/ -v
```

測試覆蓋率：前端 85%+ / 後端 87%+

## 🤝 貢獻

歡迎貢獻！請查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何參與專案開發。

## 📝 授權

本專案採用 MIT License - 詳見 [LICENSE](./LICENSE) 檔案

## 🙏 致謝

- 股票數據來源：[yfinance](https://pypi.org/project/yfinance/)
- 圖表庫：[Recharts](https://recharts.org/)
- 圖示：[Lucide Icons](https://lucide.dev/)
- 建構工具：[Vite](https://vitejs.dev/)

---

⭐ 如果您覺得這個專案有幫助，歡迎給個 Star！
