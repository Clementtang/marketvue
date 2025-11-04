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

- 🎨 **客製化選項**
  - 漲跌顏色主題（西式紅漲綠跌 / 東式綠漲紅跌）
  - 深色模式 / 淺色模式
  - 系統自動偵測或手動切換

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
- **Tailwind CSS** - 實用優先的 CSS 框架
- **Recharts** - 強大的圖表庫
- **Axios** - HTTP 請求客戶端
- **date-fns** - 日期處理工具
- **Lucide Icons** - 美觀的圖示庫

### 後端
- **Flask** - 輕量級 Python Web 框架
- **yfinance** - Yahoo Finance 股票數據 API
- **Flask-CORS** - 跨域資源共享支援
- **Flask-Caching** - 資料快取優化

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

4. **自訂設定**
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
│   ├── requirements.txt          # Python 依賴
│   ├── data/
│   │   └── company_names.json   # 公司名稱多語言對照表
│   ├── routes/
│   │   └── stock_routes.py      # API 路由
│   └── services/
│       └── stock_service.py     # yfinance 整合
├── src/                          # React 前端
│   ├── components/
│   │   ├── StockCard.tsx        # 股票卡片組件
│   │   ├── StockManager.tsx     # 股票管理組件
│   │   ├── TimeRangeSelector.tsx # 時間範圍選擇器
│   │   ├── DashboardGrid.tsx    # 儀表板網格
│   │   ├── ThemeSettings.tsx    # 主題設定
│   │   └── ColorThemeSelector.tsx # 顏色主題選擇器
│   ├── i18n/
│   │   └── translations.ts      # 多語言翻譯
│   ├── App.tsx                   # 根組件
│   └── main.tsx                  # 入口點
├── docs/                         # 文件
│   ├── API.md                   # API 文件
│   └── ARCHITECTURE.md          # 架構文件
├── package.json
├── README.md
└── README_EN.md
```

## 📚 文件

- [API 文件](./docs/API.md) - 完整的 API 端點說明
- [架構文件](./docs/ARCHITECTURE.md) - 系統架構與技術選型
- [貢獻指南](./CONTRIBUTING.md) - 如何參與專案開發
- [變更日誌](./CHANGELOG.md) - 版本變更記錄

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
