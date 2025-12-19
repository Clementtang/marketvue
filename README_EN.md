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
  - Visual Theme System (Classic / Warm Minimal)
    - **Warm Minimal Design**: Warm colors, serif fonts, elegant rounded corners
    - **Classic Design**: Modern blue tones, sans-serif fonts, professional feel
  - Price Change Color Themes (Western red-up/green-down, Eastern green-up/red-down)
  - Dark mode / Light mode
  - System auto-detection or manual switching
  - Design Guide (exclusive to Warm Minimal theme)

- ✨ **Smooth Animations & Interactions**
  - Stock card stagger fade-in animation
  - Smooth price number counting animation
  - Sequential chart line drawing animation
  - Skeleton loading animation (shimmer effect)
  - Hover micro-interactions
  - Unified rounded corner design system (Warm theme exclusive)

- 🌐 **Multi-language Support**
  - Traditional Chinese (zh-TW)
  - English (en-US)
  - Multi-language company name mapping (36+ companies)

- 📋 **Multi-List Management**
  - Up to 5 custom watchlists
  - Each list can track up to 18 stocks
  - Create, rename, delete lists
  - One-click list switching
  - Auto-migration of existing data to default list

- 🔍 **Smart Search Suggestions**
  - Real-time autocomplete (symbol, company name, aliases)
  - Built-in database of 1,128 popular stocks (with sector classification)
  - Bilingual stock names (Chinese/English)
  - Results ranked by relevance score
  - Color-coded market badges (TW Listed/OTC/US/JP/HK)
  - Keyboard navigation (Arrow keys, Enter, Escape)
  - Checkmark indicator for tracked stocks
  - Manual entry for unlisted symbols

- 📐 **Collapsible Control Panel**
  - One-click collapse for stock manager and time range selector
  - Smart summary bar when collapsed (list name, stock count, time range)
  - Maximize dashboard chart viewing area
  - Collapse state automatically remembered
  - Smooth expand/collapse animations

- 💾 **Local Storage**
  - Auto-save tracking list
  - Remember user preference settings
  - Schema versioning for future migrations

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
- **Flask-Caching** - Data caching optimization (Redis support)
- **Flask-Limiter** - API rate limiting
- **Marshmallow** - Request validation
- **Gunicorn** - Production WSGI server
- **SOLID Architecture** - Single responsibility service design
- **API v1** - Versioned REST API (`/api/v1/*`)

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
   - Type stock symbol or company name in the search box
   - Select from dropdown suggestions, or press Enter to add manually
   - Supported formats:
     - Taiwan Listed: `2330.TW` (TSMC)
     - Taiwan OTC: `5904.TWO` (Poya)
     - US Stocks: `AAPL` (Apple)
     - HK Stocks: `0700.HK` (Tencent)
     - JP Stocks: `9983.JP` (FAST RETAILING)
   - Each list can track up to 18 stocks

2. **Manage Watchlists**
   - Click list selector to switch between lists
   - Hover over list items to reveal action buttons
   - Click "Create New List" to add a list (up to 5)
   - Click pencil icon to rename a list
   - Click trash icon to delete non-default lists

3. **Adjust Time Range**
   - Select preset time ranges (1 week, 1 month, 3 months, 6 months, 1 year)
   - Or customize start and end dates

4. **View Stock Information**
   - Check real-time prices and changes
   - Analyze moving average trends (MA20, MA60)
   - Monitor volume trends
   - Toggle Candlestick / Line chart

5. **Screenshot**
   - Click the green "Screenshot" button in the top-right
   - Dashboard screenshot is automatically copied to clipboard
   - Paste directly into presentations, documents, or chat apps
   - Auto-matches current theme (light/dark)

6. **Customize Settings**
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
│   ├── constants.py              # Constants definition
│   ├── requirements.txt          # Python dependencies
│   ├── data/
│   │   └── company_names.json   # Multi-language company name mapping
│   ├── routes/
│   │   └── stock_routes.py      # API routes
│   ├── schemas/
│   │   └── stock_schemas.py     # Request/Response Schema
│   ├── services/                 # SOLID architecture service layer
│   │   ├── stock_service.py     # Coordinator (Facade)
│   │   ├── stock_data_fetcher.py    # Data fetching
│   │   ├── stock_data_transformer.py # Data transformation
│   │   ├── price_calculator.py      # Price calculation
│   │   └── company_name_service.py  # Company name service
│   ├── utils/
│   │   ├── decorators.py        # Error handling decorators
│   │   └── error_handlers.py    # Error handlers
│   └── tests/                    # Backend tests (73 tests)
├── src/                          # React frontend
│   ├── components/
│   │   ├── stock-card/          # Stock card module
│   │   │   ├── StockCard.tsx    # Main component
│   │   │   ├── StockCardHeader.tsx
│   │   │   ├── StockCardChart.tsx
│   │   │   ├── StockVolumeChart.tsx
│   │   │   ├── StockCardFooter.tsx
│   │   │   ├── StockCardLoading.tsx
│   │   │   ├── StockCardError.tsx
│   │   │   └── hooks/useStockData.ts
│   │   ├── stock-list/          # Stock list management module
│   │   │   ├── StockListSelector.tsx  # List selector
│   │   │   ├── CreateListModal.tsx    # Create list modal
│   │   │   ├── RenameListModal.tsx    # Rename modal
│   │   │   ├── DeleteListConfirm.tsx  # Delete confirmation
│   │   │   └── index.ts
│   │   ├── common/
│   │   │   ├── Toast.tsx        # Toast notification component
│   │   │   ├── AnimatedNumber.tsx # Number animation component
│   │   │   └── ChartTooltip.tsx # Chart tooltip component
│   │   ├── StockManager.tsx
│   │   ├── StockSearchInput.tsx  # Stock search input component
│   │   ├── TimeRangeSelector.tsx
│   │   ├── DashboardGrid.tsx
│   │   ├── ScreenshotButton.tsx # Screenshot button component
│   │   ├── ThemeSettings.tsx
│   │   ├── ThemeGuide.tsx       # Theme design guide
│   │   └── ErrorBoundary.tsx    # Error boundary
│   ├── contexts/                 # React Context
│   │   ├── AppContext.tsx       # Application settings
│   │   ├── ChartContext.tsx     # Chart settings
│   │   ├── ToastContext.tsx     # Toast notifications
│   │   ├── VisualThemeContext.tsx # Visual theme
│   │   └── StockListContext.tsx # Stock list management
│   ├── hooks/                    # Custom Hooks
│   │   ├── useRetry.ts          # Retry logic
│   │   ├── useStockListReducer.ts # List state reducer
│   │   ├── useStockSearch.ts    # Stock search hook
│   │   └── index.ts
│   ├── data/
│   │   └── stocks/              # Stock search database
│   │       ├── tw-listed.json   # Taiwan listed (392 stocks)
│   │       ├── tw-otc.json      # Taiwan OTC (156 stocks)
│   │       ├── us-popular.json  # US popular (379 stocks)
│   │       ├── jp-popular.json  # Japan popular (151 stocks)
│   │       ├── hk-popular.json  # Hong Kong popular (50 stocks)
│   │       └── index.ts         # Data export
│   ├── types/
│   │   ├── stockList.ts         # List type definitions
│   │   └── stockSearch.ts       # Search type definitions
│   ├── utils/
│   │   ├── screenshot.ts        # Screenshot utility functions
│   │   ├── animations.ts        # Animation configuration
│   │   └── migration.ts         # Data migration utility
│   ├── config/
│   │   └── chartTheme.ts        # Unified theme configuration
│   ├── i18n/
│   │   └── translations.ts      # Multi-language translations
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
├── docs/                         # 📚 Documentation Center
│   ├── README.md                # Documentation navigation index
│   ├── DOCUMENTATION_GUIDE.md   # Documentation organization guide
│   ├── API.md                   # API documentation
│   ├── ARCHITECTURE.md          # Architecture documentation
│   ├── DEPLOYMENT.md            # Deployment guide
│   ├── DEPLOYMENT_CONFIG.md     # Deployment configuration
│   ├── guides/                  # User guides (planned)
│   ├── development/             # Development docs & planning
│   ├── project-history/         # Project history (organized by Phase)
│   │   ├── phases/              # Phase 1-3 work logs
│   │   ├── optimizations/       # Optimization records
│   │   ├── deployments/         # Deployment verification
│   │   └── archive/             # Archived documents
│   ├── security/                # Security documentation
│   └── workflows/               # Workflow SOPs
├── scripts/
│   └── security-check.sh        # Security check script
├── package.json
├── vercel.json                   # Vercel configuration
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

### Quick Navigation

- **[📖 Documentation Center](./docs/README.md)** - Central navigation and index for all documentation
- **[📋 Documentation Guide](./docs/DOCUMENTATION_GUIDE.md)** - How to organize and maintain project documentation

### Technical Documentation

- **[API Documentation](./docs/API.md)** - Complete API endpoint reference
- **[Architecture Documentation](./docs/ARCHITECTURE.md)** - System architecture and technology stack
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Vercel + Render deployment setup
- **[Deployment Configuration](./docs/DEPLOYMENT_CONFIG.md)** - Environment variables and configuration details

### Project Management

- **[Project Progress Summary](./docs/project-history/PROJECT_PROGRESS_SUMMARY.md)** - Complete Phase 1-3 records
- **[Recent Changes Timeline](./docs/project-history/recent-changes-timeline.md)** - Latest features and optimizations
- **[Changelog](./CHANGELOG.md)** - Version change history
- **[Roadmap](./ROADMAP.md)** - Future plans

### Development Resources

- **[Development Documentation](./docs/development/)** - Technical planning and meeting notes
- **[Project History](./docs/project-history/)** - Work logs organized by phase
  - [Phase 1: CI/CD + Testing Foundation](./docs/project-history/phases/phase1/)
  - [Phase 2: Frontend Refactoring](./docs/project-history/phases/phase2/)
  - [Phase 3: Backend Refactoring](./docs/project-history/phases/phase3/)
- **[Security Documentation](./docs/security/README.md)** - Security audits and implementation guides
- **[Workflows](./docs/workflows/)** - Branch management and quick reference

### Contributing Guide

- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

## 🧪 Testing

```bash
# Frontend tests (145 tests)
npm test

# Backend tests (215 tests)
cd backend && source venv/bin/activate
python -m pytest tests/ -v
```

Test coverage: Frontend 85%+ / Backend 89.87%

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
