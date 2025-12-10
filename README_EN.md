# MarketVue

📊 **Real-time Multi-Market Stock Dashboard** | 即時多市場股票追蹤儀表板

English | [繁體中文](./README.md)

> **🚀 Ready to Deploy?** Check out the complete [Deployment Guide](./docs/DEPLOYMENT.md)

---

## 📖 About

MarketVue is a modern stock tracking dashboard that supports real-time stock data monitoring across multiple international markets. With an intuitive interface and powerful charting capabilities, you can easily monitor your investment portfolio's performance.

## ✨ Key Features

- 🌏 **Multi-Market Support**
  - Taiwan Stock Market (Listed .TW, OTC .TWO)
  - US Stock Market
  - Hong Kong Stock Market (.HK)
  - Japan Stock Market (.JP)

- 📊 **Technical Indicators**
  - MA20 (20-day Moving Average)
  - MA60 (60-day Moving Average)
  - Real-time price change tracking
  - Volume analysis
  - Candlestick / Line chart toggle

- 📄 **Pagination**
  - Support unlimited stock tracking
  - 9 stocks per page (3x3 grid)
  - Smart page navigation (auto-jump to last page when adding stock)
  - Previous/Next page buttons
  - Page indicator

- 📸 **Screenshot**
  - One-click copy dashboard screenshot to clipboard
  - 16:9 aspect ratio optimized (for presentations)
  - Support light/dark themes
  - Each page can be screenshot independently

- 🎨 **Customization Options**
  - Color themes for price changes (Western red-up/green-down, Eastern green-up/red-down)
  - Dark mode / Light mode
  - System auto-detection or manual switching

- 🌐 **Multi-language Support**
  - Traditional Chinese (zh-TW)
  - English (en-US)
  - Multi-language company name mapping (36+ companies)

- 💾 **Local Storage**
  - Auto-save tracking list
  - Remember user preference settings

- ⚡ **Performance Optimization**
  - Intelligent batch request mechanism (automatically merges multiple requests)
  - Request queue and deduplication (100ms collection delay)
  - Advanced caching strategy (5min stale time, 30min cache)
  - Parallel batch processing (supports up to 18 stocks)
  - Avoids rate limit issues (reduces 89% API requests)

- 📱 **Responsive Design**
  - Support for desktop, tablet, and mobile
  - Smooth user experience

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern frontend framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS v4** - Utility-first CSS framework (@theme config, CSS custom properties)
- **TanStack Query** - Powerful server state management and caching
- **Recharts** - Powerful charting library
- **react-spring** - Physics-based animation library
- **Axios** - HTTP client
- **date-fns** - Date utility library
- **Lucide Icons** - Beautiful icon library
- **modern-screenshot** - High-quality screenshots (supports modern CSS)
- **Context API** - Global state management (AppContext, ChartContext, ToastContext, VisualThemeContext)
- **Custom Hooks** - Reusable logic (useRetry, useStockData, useToast)
- **Animation System** - Unified animation configuration (animations.ts)
- **Batch API System** - Intelligent request queue and batch processing (batchStockApi)
- **Google Fonts** - Playfair Display (serif), Inter (sans-serif), Noto Sans TC (Chinese)

### Backend
- **Flask** - Lightweight Python web framework
- **yfinance** - Yahoo Finance stock data API
- **Flask-CORS** - Cross-origin resource sharing support
- **Flask-Caching** - Data caching optimization

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Clementtang/marketvue.git
cd marketvue
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at `http://localhost:5173`

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend service (using Port 5001)
PORT=5001 python app.py
```

Backend API will run at `http://localhost:5001`

## 🚀 Usage Guide

1. **Add Stocks**
   - Enter stock ticker symbol in the input box
   - Supported formats:
     - Taiwan Listed: `2330.TW` (TSMC)
     - Taiwan OTC: `5904.TWO` (Poya)
     - US Stocks: `AAPL` (Apple)
     - HK Stocks: `0700.HK` (Tencent)
     - JP Stocks: `9983.JP` (FAST RETAILING)
   - Click "Add" button
   - Track up to 9 stocks simultaneously

2. **Adjust Time Range**
   - Select preset time ranges (1 week, 1 month, 3 months, 6 months, 1 year)
   - Or customize start and end dates

3. **View Stock Information**
   - Check real-time prices and changes
   - Analyze moving average trends (MA20, MA60)
   - Monitor volume trends

4. **Customize Settings**
   - Click settings icon in top-right corner
   - Adjust color theme (Western/Eastern)
   - Toggle dark/light mode
   - Select language (Chinese/English)

## 📊 Supported Markets

| Market | Ticker Format | Example |
|--------|---------------|---------|
| Taiwan Listed | `XXXX.TW` | 2330.TW (TSMC) |
| Taiwan OTC | `XXXX.TWO` | 5904.TWO (Poya) |
| United States | `SYMBOL` | AAPL (Apple) |
| Hong Kong | `XXXX.HK` | 0700.HK (Tencent) |
| Japan | `XXXX.JP` | 9983.JP (UNIQLO) |

## 🌐 Multi-language Company Names

MarketVue includes built-in multi-language name mappings for 36+ major companies:

**Taiwan Stocks**
- TSMC (2330.TW), Hon Hai (2317.TW), MediaTek (2454.TW)
- President Chain Store (2912.TW), Taiwan FamilyMart (5903.TWO), Poya (5904.TWO)
- Taiwan Mobile (3045.TW), Far EasTone Telecom (4904.TW), Chunghwa Telecom (2412.TW)

**US Stocks**
- Apple (AAPL), Microsoft (MSFT), Google (GOOGL)
- Tesla (TSLA), Amazon (AMZN), NVIDIA (NVDA)

**Hong Kong Stocks**
- Tencent (0700.HK), Alibaba (9988.HK), AIA (1299.HK)

**Japan Stocks**
- UNIQLO (9983.JP), MUJI (7453.JP), LINE Yahoo (4689.JP)

Stocks not in the mapping table will automatically display English names provided by Yahoo Finance.

## 🗂️ Project Structure

```
marketvue/
├── backend/                       # Flask backend
│   ├── app.py                    # Flask main application
│   ├── config.py                 # Configuration file
│   ├── requirements.txt          # Python dependencies
│   ├── data/
│   │   └── company_names.json   # Multi-language company name mapping
│   ├── routes/
│   │   └── stock_routes.py      # API routes
│   └── services/
│       └── stock_service.py     # yfinance integration
├── src/                          # React frontend
│   ├── components/
│   │   ├── StockCard.tsx        # Stock card component
│   │   ├── StockManager.tsx     # Stock manager component
│   │   ├── TimeRangeSelector.tsx # Time range selector
│   │   ├── DashboardGrid.tsx    # Dashboard grid
│   │   ├── ThemeSettings.tsx    # Theme settings
│   │   └── ColorThemeSelector.tsx # Color theme selector
│   ├── i18n/
│   │   └── translations.ts      # Multi-language translations
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
├── docs/                         # Documentation
│   ├── API.md                   # API documentation
│   └── ARCHITECTURE.md          # Architecture documentation
├── package.json
├── README.md
└── README_EN.md
```

## ⚠️ Important Notes

### Free Hosting Service Limitations

The backend API of this project is hosted on **Render Free Tier** with the following characteristics:

- **Cold Start Time**: Service enters sleep mode after 15 minutes of inactivity
- **First Visit**: Waking up the service takes 30-60 seconds, please be patient
- **Auto Retry**: Frontend implements smart retry mechanism to automatically handle cold starts
- **User Experience**: Displays a friendly "Service may be starting up" message on first load

This is normal behavior, not an error. Subsequent visits will respond quickly.

## 📚 Documentation

- [API Documentation](./docs/API.md) - Complete API endpoint reference
- [Architecture Documentation](./docs/ARCHITECTURE.md) - System architecture and tech stack
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to the project
- [Changelog](./CHANGELOG.md) - Version history

## 🤝 Contributing

Contributions are welcome! Please check [CONTRIBUTING.md](./CONTRIBUTING.md) to learn how to participate in project development.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- Stock data source: [yfinance](https://pypi.org/project/yfinance/)
- Chart library: [Recharts](https://recharts.org/)
- Icons: [Lucide Icons](https://lucide.dev/)
- Build tool: [Vite](https://vitejs.dev/)

---

⭐ If you find this project helpful, please give it a star!
