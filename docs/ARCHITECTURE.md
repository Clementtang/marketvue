# MarketVue Architecture

## System Overview

MarketVue is a full-stack application consisting of a React frontend and Flask backend, designed to provide real-time stock market data visualization across multiple international markets.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                       Frontend                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript + Vite                    │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │ Components │  │  State Mgmt  │  │ Services │ │  │
│  │  │  - Stock   │  │  - Local     │  │ - API    │ │  │
│  │  │    Cards   │  │    Storage   │  │   Client │ │  │
│  │  │  - Manager │  │  - Theme     │  │ - Axios  │ │  │
│  │  │  - Charts  │  │  - Language  │  │          │ │  │
│  │  └────────────┘  └──────────────┘  └──────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                    HTTP/JSON (REST API)
                            │
┌─────────────────────────────────────────────────────────┐
│                       Backend                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Flask + Python                                   │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌──────────┐ │  │
│  │  │   Routes   │  │   Services   │  │   Data   │ │  │
│  │  │ - Stock    │  │ - yfinance   │  │ - Company│ │  │
│  │  │   Data API │  │   Integration│  │   Names  │ │  │
│  │  │            │  │ - Caching    │  │   JSON   │ │  │
│  │  └────────────┘  └──────────────┘  └──────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                    yfinance Library
                            │
┌─────────────────────────────────────────────────────────┐
│              External Data Source                        │
│                  Yahoo Finance API                       │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 19**: Latest version with improved performance
- **TypeScript**: Type-safe code
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Composable charting library
- **Axios**: Promise-based HTTP client
- **date-fns**: Modern date utility library
- **Lucide Icons**: Beautiful SVG icon set

### Backend
- **Flask 3.0**: Lightweight Python web framework
- **yfinance**: Yahoo Finance market data downloader
- **Flask-CORS**: Handle cross-origin requests
- **Flask-Caching**: SimpleCache/Redis for performance
- **Flask-Limiter**: Rate limiting
- **Flask-Talisman**: Security headers
- **Marshmallow**: Request validation

## Component Structure

### Frontend Components

```
src/
├── components/
│   ├── StockCard.tsx          # Individual stock display
│   ├── StockManager.tsx       # Add/remove stocks
│   ├── DashboardGrid.tsx      # Grid layout
│   ├── TimeRangeSelector.tsx  # Date range picker
│   ├── ThemeSettings.tsx      # Settings modal
│   └── ColorThemeSelector.tsx # Color theme options
├── i18n/
│   └── translations.ts        # Multi-language support
├── App.tsx                    # Root component
└── main.tsx                   # Application entry
```

### Backend Services (SOLID Architecture)

```
backend/
├── app.py                         # Flask application factory
├── config.py                      # Environment configuration
├── constants.py                   # Magic numbers & constants
├── routes/
│   ├── stock_routes.py            # /api/v1/stock-data, /api/v1/batch-stocks
│   ├── health_routes.py           # /api/v1/health/* endpoints
│   └── legacy_routes.py           # /api/* backward compatibility
├── services/                      # Single Responsibility Services
│   ├── stock_service.py           # Facade/Coordinator (DI)
│   ├── stock_data_fetcher.py      # yfinance API calls
│   ├── stock_data_transformer.py  # DataFrame → Dict conversion
│   ├── price_calculator.py        # Price metrics calculation
│   └── company_name_service.py    # Multi-language name resolution
├── schemas/
│   └── stock_schemas.py           # Marshmallow request validation
├── utils/
│   ├── cache.py                   # Flask-Caching wrapper
│   ├── cache_factory.py           # Redis/SimpleCache factory
│   ├── decorators.py              # @handle_errors, @log_request
│   ├── request_context.py         # Request ID middleware
│   ├── logger.py                  # Structured logging
│   ├── config_validator.py        # Startup config validation
│   └── error_handlers.py          # Global error handlers
└── data/
    └── company_names.json         # Multi-language company names
```

### Service Layer Design

The backend follows **SOLID principles** with **Dependency Injection**:

```
┌─────────────────────────────────────────────────────────────┐
│                    StockService (Facade)                     │
│  Coordinates all operations with injected dependencies       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ StockData   │  │ StockData   │  │ Company             │ │
│  │ Fetcher     │  │ Transformer │  │ NameService         │ │
│  │             │  │             │  │                     │ │
│  │ yfinance    │  │ DataFrame   │  │ JSON + yfinance     │ │
│  │ API calls   │  │ → Dict      │  │ fallback            │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────┐                                            │
│  │ Price       │                                            │
│  │ Calculator  │                                            │
│  │             │                                            │
│  │ Metrics &   │                                            │
│  │ changes     │                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Adds a Stock

```
User Input → StockManager → App State → DashboardGrid → StockCard
                 ↓
          localStorage (persist)
```

### 2. Fetch Stock Data

```
StockCard → Axios → Flask API → yfinance → Yahoo Finance
    ↓           ↓         ↓
 Display ← Response ← Cache Check
```

### 3. Multi-language Company Names

```
Stock Symbol → Backend Service → JSON Lookup → Return Name
                      ↓
               yfinance fallback (if not in JSON)
```

## Key Features Implementation

### Multi-Market Support
- Symbol format detection (`.TW`, `.TWO`, `.HK`, `.JP`)
- Automatic handling of different exchanges
- yfinance handles market-specific data fetching

### Technical Indicators
- MA20/MA60 calculated client-side
- Reduces server load
- Real-time updates on chart

### Theme System
- CSS custom properties for colors
- System preference detection
- localStorage persistence

### Caching Strategy
- Backend: 5-minute cache for stock data
- Cache backends: SimpleCache (default) or Redis (production)
- Automatic fallback to SimpleCache if Redis fails
- Frontend: localStorage for user preferences

## Security Considerations

- CORS configured for localhost development
- Rate limiting (1000 requests/hour)
- No sensitive data stored
- All data from public APIs

## Performance Optimizations

### Frontend
- Lazy chart rendering (double requestAnimationFrame)
- Component memoization where appropriate
- Vite code splitting for production

### Backend
- Flask-Caching for repeated requests
- Efficient data processing
- Minimal computation on server

## Deployment Considerations

### Frontend
- Build with `npm run build`
- Deploy to Vercel, Netlify, or static hosting
- Environment variables for API URL

### Backend
- Production WSGI server (Gunicorn recommended)
- Environment-specific configuration
- CORS update for production domain

## Future Architecture Enhancements

- [ ] Real-time WebSocket updates
- [x] Redis for distributed caching (Phase 3 Day 7)
- [ ] PostgreSQL for user data
- [ ] Microservices for scaling
- [ ] GraphQL API option
- [ ] Server-side rendering (SSR)
- [x] API versioning (Phase 3 Day 9)
- [x] Kubernetes-ready health endpoints (Phase 3 Day 9)

---

For more details on specific implementations, see the source code and inline documentation.
