# Changelog

All notable changes to MarketVue will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## Future Roadmap

### Planned Features
- [ ] Portfolio tracking and performance calculation
- [ ] Price alerts and notifications
- [ ] Technical indicator expansion (RSI, MACD, Bollinger Bands)
- [ ] Candlestick charts
- [ ] Stock comparison view
- [ ] Export data functionality
- [ ] User accounts and cloud sync
- [ ] Mobile app (React Native)

### Under Consideration
- [ ] Cryptocurrency support
- [ ] Forex rates
- [ ] Fundamental data integration
- [ ] AI-powered insights
- [ ] Social features (share watchlists, discuss stocks)

---

**Note**: This is the initial release of MarketVue. We welcome feedback and contributions!
