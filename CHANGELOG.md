# Changelog

All notable changes to MarketVue will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2025-11-04

### Fixed
- **News Feature**: Fixed broken news functionality by adapting to yfinance API changes
  - Updated news data parsing to handle new nested structure (data now in `content` field)
  - Fixed title, publisher, link, and thumbnail extraction from new API response format
  - Changed date parsing from Unix timestamp to ISO 8601 format string
  - All markets (US, Taiwan, Hong Kong, Japan) now display news correctly
  - Resolves P0 priority issue from project roadmap

### Technical
- Updated `StockService.get_stock_news()` in backend/services/stock_service.py
- Added comprehensive comments explaining the new API structure
- Improved date parsing with proper ISO format handling and error fallbacks

## [1.2.0] - 2025-11-04

### Added
- **Notification Banner**: Added dismissible warning banner about free hosting limitations
  - Displays information about backend sleep time and first-load delays
  - Banner remembers dismissal state using localStorage
  - Responsive design with yellow warning styling
  - Bilingual support (English and Traditional Chinese)
- **Enhanced Footer**: New footer component with improved functionality
  - MarketVue branding with copyright year
  - Author information with GitHub profile link
  - Repository link with GitHub icon
  - Responsive layout for desktop and mobile
  - Replaced old footer that only showed yfinance attribution
- **Vercel Analytics**: Integrated Vercel Analytics for visitor tracking
  - Added @vercel/analytics package (v1.5.0)
  - Configured Analytics component for React/Vite
  - Enables page view and visitor analytics in Vercel dashboard
- **Vercel Speed Insights**: Integrated Vercel Speed Insights for performance monitoring
  - Added @vercel/speed-insights package (v1.2.0)
  - Configured SpeedInsights component for React/Vite
  - Enables Core Web Vitals and performance tracking in Vercel dashboard

### Changed
- **Application Branding**: Updated application name from "Stock Dashboard" to "MarketVue"
  - Updated browser title in index.html
  - Updated all UI text in translations (English and Traditional Chinese)
  - Changed header subtitle to "Real-time Multi-Market Stock Dashboard" / "即時多市場股票追蹤儀表板"
- **Render Deployment**: Updated backend deployment configuration
  - Changed deployment region from Oregon to Singapore for better latency in Asia
  - Configured health check path (/api/health) for improved deployment reliability
  - Ensures faster API response times for Asian users
- **Package Version**: Bumped version to 1.2.0

### Fixed
- **Dark Mode Styling**: Improved notification banner appearance in dark mode
  - Adjusted background opacity from 20% to 30% for better visibility
  - Changed border color to lighter yellow-700/50 to remove harsh orange line
  - Brightened icon and text colors (yellow-400 and yellow-100) for better contrast
  - Updated hover effects for better visual feedback
- **Footer Layout**: Fixed footer positioning to stick to viewport bottom
  - Added flexbox layout to App container (flex flex-col)
  - Made main content area flexible with flex-grow
  - Changed footer margin from mt-12 to mt-auto for proper alignment
  - Footer now stays at bottom when content is short, without being sticky

### Technical
- Created NotificationBanner component with localStorage integration
- Created Footer component with bilingual link support
- Added new translation keys: freeHostingNotice, madeBy, viewOnGitHub
- Integrated new components into main App.tsx layout
- Implemented flexbox-based footer positioning for responsive layouts
- **Project Management**: Established TODO tracking system
  - Created `.todo/` directory for internal task management (excluded from Git)
  - Added `ROADMAP.md` for public-facing development roadmap
  - Organized tasks with 6-dimensional classification (Phase, Category, Effort, Impact, Status, Module)
  - Documented Q1-Q4 2025 feature planning

## [1.1.1] - 2025-11-04

### Fixed
- **API URL Configuration**: Corrected duplicate `/api` path in environment variables
  - Removed `/api` suffix from `VITE_API_URL` base URL
  - Fixed double `/api/api` path issue causing API request failures in production
  - Updated `.env.example` and `.env.production` with correct configuration

## [1.1.0] - 2025-11-03

### Added
- **Production Deployment Support**: Complete deployment configuration for Vercel + Render
  - Environment variable configuration (.env.example, .env.production)
  - Render deployment configuration (render.yaml)
  - Comprehensive bilingual deployment guide (docs/DEPLOYMENT.md)
- **Gunicorn**: Production-ready WSGI server for Flask backend
- **TypeScript Type Definitions**: Added @types/react-grid-layout for production builds

### Changed
- Updated CORS configuration with production environment documentation
- Enhanced README with deployment guide link

### Documentation
- Added complete deployment guide in English and Traditional Chinese
- Updated README files with deployment links

## [1.0.0] - 2025-10-31

### Added
- **Multi-Market Support**: Track stocks from Taiwan (Listed/OTC), US, Hong Kong, and Japan markets
- **Technical Indicators**: MA20 and MA60 moving averages with interactive charts
- **Real-time Data**: Live stock prices and changes powered by yfinance
- **News Integration**: Access latest stock-related news with one click
- **Multi-language UI**: Full support for Traditional Chinese and English
- **Company Name Mapping**: Built-in translations for 36+ major companies
- **Theme Customization**:
  - Color themes (Western red-up/green-down, Eastern green-up/red-down)
  - Dark mode / Light mode with system auto-detection
- **Interactive Charts**:
  - Price charts with Recharts
  - Volume analysis
  - Moving average overlays
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Local Storage**: Auto-save tracked stocks and user preferences
- **Stock Management**: Track up to 9 stocks simultaneously
- **Time Range Selection**: Preset ranges (1W, 1M, 3M, 6M, 1Y) or custom dates

### Technical
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Flask, yfinance, Flask-CORS, Flask-Caching
- **Build Tools**: Vite for fast development and optimized production builds
- **Icons**: Lucide Icons library
- **Date Handling**: date-fns for reliable date operations

### Documentation
- Comprehensive README in both Chinese and English
- API documentation
- Architecture documentation
- Contributing guidelines
- MIT License

---

## 🗺️ Future Development

> 📍 **查看專案發展規劃：** [ROADMAP.md](./ROADMAP.md)

本專案持續開發中，未來功能規劃請參考 [ROADMAP.md](./ROADMAP.md)，包含：
- **Q1 2025**: K線圖、18檔股票支援、API優化
- **Q2 2025**: 技術指標擴充、匯出數據、測試提升
- **Q3-Q4 2025**: 投資組合追蹤、行動應用、AI洞察

---

**Note**: This is the initial release of MarketVue. We welcome feedback and contributions!
