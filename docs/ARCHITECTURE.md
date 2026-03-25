# MarketVue Architecture

## System Overview

MarketVue is a full-stack application consisting of a React frontend and Flask backend, designed to provide real-time stock market data visualization across multiple international markets.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                           Frontend                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript + Vite + Tailwind CSS v4          │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────┐  ┌────────┐ │  │
│  │  │Components│  │  Context API │  │Services│  │Animation││  │
│  │  │- Stock   │  │  - AppContext│  │- Batch │  │System  ││  │
│  │  │  Card    │  │    (i18n,    │  │  Stock │  │- spring││  │
│  │  │  Module  │  │     theme,   │  │  API   │  │- Fade  ││  │
│  │  │- Manager │  │     date)    │  │  Queue │  │- Count ││  │
│  │  │- Charts  │  │  - Visual    │  │- Axios │  │- Draw  ││  │
│  │  │- Theme   │  │    Theme     │  │- React │  │        ││  │
│  │  │  Guide   │  │  - Chart     │  │  Query │  │        ││  │
│  │  │- Toast   │  │  - Toast     │  │        │  │        ││  │
│  │  └──────────┘  └──────────────┘  └────────┘  └────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
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
│  │  │ - News API │  │ - News       │  │   JSON   │ │  │
│  │  │            │  │   Service    │  │          │ │  │
│  │  │            │  │ - Caching    │  │          │ │  │
│  │  └────────────┘  └──────────────┘  └──────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                    yfinance Library / News APIs
                            │
┌─────────────────────────────────────────────────────────┐
│              External Data Sources                       │
│  Yahoo Finance API / Finnhub API / Google News RSS      │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **React 19**: Latest version with improved performance
- **TypeScript**: Type-safe code
- **Vite 7.1**: Fast build tool and dev server
- **Tailwind CSS v4**: Utility-first CSS with @theme config and CSS custom properties
- **TanStack Query**: Powerful server state management and caching
- **Recharts**: Composable charting library
- **react-spring**: Physics-based animation library
- **Axios**: Promise-based HTTP client
- **date-fns**: Modern date utility library
- **Lucide Icons**: Beautiful SVG icon set
- **modern-screenshot**: High-quality screenshots with modern CSS support
- **Context API**: Global state management (AppContext, ChartContext, StockListContext, ToastContext, VisualThemeContext)
- **Custom Hooks**: Reusable logic (useRetry, useStockData, useNewsData, usePersistedState, useStockListReducer, useStockSearch)
- **Animation System**: Unified animation configuration (animations.ts)
- **Batch API System**: Intelligent request queue and batch processing (batchStockApi)
- **Google Fonts**: Playfair Display (serif), Inter (sans-serif), Noto Sans TC (Chinese)

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
│   ├── stock-card/              # Modular stock card system
│   │   ├── StockCard.tsx        # Main component with pagination
│   │   ├── StockCardHeader.tsx  # Company name, price, change
│   │   ├── StockCardChart.tsx   # Price chart with MA lines
│   │   ├── StockVolumeChart.tsx # Volume bar chart
│   │   ├── StockCardFooter.tsx  # Chart type toggle
│   │   ├── StockCardLoading.tsx # Skeleton loader with shimmer
│   │   ├── StockCardError.tsx   # Error state UI
│   │   └── hooks/
│   │       └── useStockData.ts  # Data fetching with React Query
│   ├── common/
│   │   ├── Toast.tsx            # Toast notification component
│   │   ├── AnimatedNumber.tsx   # Number counting animation
│   │   └── ChartTooltip.tsx     # Chart tooltip component
│   ├── StockManager.tsx         # Add/remove stocks with pagination
│   ├── TimeRangeSelector.tsx    # Date range picker
│   ├── DashboardGrid.tsx        # 3x3 grid layout with stagger animation
│   ├── ScreenshotButton.tsx     # 16:9 screenshot with clipboard copy
│   ├── ThemeSettings.tsx        # Settings modal
│   ├── ThemeGuide.tsx           # Visual theme design guide
│   └── ErrorBoundary.tsx        # Error boundary
├── contexts/                    # React Context providers
│   ├── AppContext.tsx           # i18n, theme, date range
│   ├── ChartContext.tsx         # Chart type (candlestick/line)
│   ├── StockListContext.tsx     # Multi-list stock management
│   ├── ToastContext.tsx         # Toast notifications
│   └── VisualThemeContext.tsx   # Visual theme (Classic/Warm Minimal)
├── hooks/                       # Custom hooks
│   ├── useRetry.ts              # Retry logic for API calls
│   ├── useNewsData.ts           # News data fetching
│   ├── usePersistedState.ts     # localStorage-backed state
│   ├── useStockListReducer.ts   # Stock list state management
│   ├── useStockSearch.ts        # Stock symbol search
│   └── index.ts                 # Hook exports
├── utils/
│   ├── screenshot.ts            # Screenshot utility functions
│   └── animations.ts            # Animation configuration
├── config/
│   └── chartTheme.ts            # Unified theme configuration
├── api/
│   └── batchStockApi.ts         # Batch request queue system
├── i18n/
│   └── translations.ts          # Multi-language support
├── App.tsx                      # Root component
└── main.tsx                     # Application entry
```

### Backend Services (SOLID Architecture)

```
backend/
├── app.py                         # Flask application factory
├── config.py                      # Environment configuration
├── constants.py                   # Magic numbers & constants
├── routes/
│   ├── stock_routes.py            # /api/v1/stock-data, /api/v1/batch-stocks
│   ├── news_routes.py             # /api/v1/news/<symbol>
│   ├── health_routes.py           # /api/v1/health/* endpoints
│   └── legacy_routes.py           # /api/* backward compatibility
├── services/                      # Single Responsibility Services
│   ├── stock_service.py           # Facade/Coordinator (DI)
│   ├── stock_data_fetcher.py      # yfinance API calls
│   ├── stock_data_transformer.py  # DataFrame → Dict conversion
│   ├── price_calculator.py        # Price metrics calculation
│   ├── company_name_service.py    # Multi-language name resolution
│   ├── news_service.py            # News orchestrator (routes by market)
│   ├── finnhub_news_fetcher.py    # Finnhub API (US stocks)
│   └── google_news_fetcher.py     # Google News RSS (TW/HK/JP)
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
User Input → StockManager → App State → localStorage (persist)
                 ↓                           ↓
          Auto-jump to last page ← DashboardGrid → StockCard
```

### 2. Fetch Stock Data (with React Query + Batch Queue)

```
StockCard → useStockData (React Query)
               ↓
         Batch Request Queue (100ms collection window)
               ↓
         Merge multiple requests into single batch
               ↓
         Axios → Flask API → Flask-Caching (5min) → yfinance → Yahoo Finance
               ↓         ↓                    ↓
         React Query ← Response ← Cache Hit/Miss
         Cache (5min stale, 30min GC)
               ↓
         Display with animations
```

### 3. Multi-language Company Names

```
Stock Symbol → Backend Service → JSON Lookup → Return Name
                      ↓
               yfinance fallback (if not in JSON)
```

### 4. Visual Theme System

```
User Selection → VisualThemeContext → localStorage
                       ↓
         Apply theme CSS custom properties
                       ↓
         Components re-render with new theme
```

### 5. Animation System

```
Component Mount → react-spring hooks
                       ↓
         Stagger fade-in (stock cards)
         Number counting (prices)
         Line drawing (charts)
                       ↓
         Smooth 60fps animations
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

### Visual Theme System

- **Dual Theme Architecture**: Classic & Warm Minimal themes
- **Classic Theme**: Modern blue tones, sans-serif fonts, professional feel
- **Warm Minimal Theme**: Warm colors (beige, terracotta), serif fonts (Playfair Display), elegant rounded corners
- **CSS Custom Properties**: Theme-specific color variables
- **Dark/Light Mode**: Both themes support dark mode
- **System Preference Detection**: Auto-detect user's color scheme preference
- **localStorage Persistence**: Remember theme selection across sessions
- **Theme Guide**: Interactive design guide (Warm theme exclusive)

### Animation System

- **react-spring**: Physics-based animations for natural feel
- **Stagger Fade-in**: Stock cards appear sequentially (50ms delay)
- **Number Counting**: Smooth price number animations with configurable duration
- **Line Drawing**: Chart lines draw sequentially (price → MA20 → MA60 → volume)
- **Skeleton Loading**: Shimmer effect during data fetch
- **Hover Micro-interactions**: Scale and shadow effects on cards
- **Performance**: GPU-accelerated transforms, 60fps target
- **Accessibility**: Respects `prefers-reduced-motion`

### Caching Strategy

- **Backend**:
  - Flask-Caching: 5-minute cache for stock data
  - Cache backends: SimpleCache (default) or Redis (production)
  - Automatic fallback to SimpleCache if Redis fails
- **Frontend**:
  - React Query: 5min stale time, 30min garbage collection
  - Intelligent batch request queue (100ms collection delay)
  - Request deduplication (reduces 89% of API calls)
  - localStorage for user preferences and stock lists

### Multi-List Stock Management

- **Multiple Lists**: Users can create, rename, and delete custom stock lists
- **Capacity**: Each list supports up to 9 stocks in a 3x3 grid
- **List Selector**: Tab-based list switching with StockListContext
- **State Management**: useStockListReducer for list CRUD operations
- **Persistence**: All lists and active list saved in localStorage
- **Screenshot Compatible**: Each list can be screenshot independently

### Screenshot Feature (v1.5.0)

- **Library**: modern-screenshot (supports modern CSS)
- **Aspect Ratio**: 16:9 optimized for presentations
- **Output**: High-quality PNG to clipboard
- **Theme Support**: Works with both light/dark modes and visual themes
- **Page Support**: Screenshot current page only (9 stocks max)

### Clipboard Import/Export (v1.5.1)

- **Export**: One-click export all stock symbols to clipboard (comma-separated)
- **Import**: Batch import comma-separated stock symbols
- **Smart Handling**: Automatic `.JP` ↔ `.T` symbol conversion for Japanese stocks
- **Use Cases**: Cross-device sync, watchlist sharing, backup/restore
- **Validation**: Invalid symbols are filtered with toast notifications

## Security Considerations

- CORS configured for localhost development
- Rate limiting (1000 requests/hour)
- No sensitive data stored
- All data from public APIs

## Performance Optimizations

### Frontend

- **Batch Request Queue**: Automatically merges multiple stock requests into single batch API call
  - 100ms collection window
  - Request deduplication
  - Reduces API calls by 89%
- **React Query Caching**: 5min stale time, 30min garbage collection
- **Lazy Chart Rendering**: Double requestAnimationFrame for smooth rendering
- **Component Memoization**: Strategic use of React.memo for expensive components
- **Code Splitting**: Vite code splitting for optimal bundle size
- **GPU-Accelerated Animations**: CSS transforms for 60fps animations
- **Image Optimization**: Google Fonts with font-display: swap

### Backend

- **Flask-Caching**: 5-minute cache for stock data (634x performance improvement)
- **Parallel Batch Processing**: ThreadPoolExecutor for concurrent stock fetching (2-3x faster)
- **Redis Support**: Optional Redis backend for distributed caching
- **Efficient Data Processing**: Optimized DataFrame to Dict conversion
- **SOLID Architecture**: Single responsibility services for maintainability

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

### Completed ✅

- [x] Redis for distributed caching (v1.3.3 - Phase 3 Day 7)
- [x] API versioning (v1.3.5 - Phase 3 Day 9)
- [x] Kubernetes-ready health endpoints (v1.3.5 - Phase 3 Day 9)
- [x] Visual theme system (v1.6.0)
- [x] Animation system with react-spring (v1.7.0)
- [x] Pagination for 18 stocks (v1.5.0)
- [x] Screenshot feature (v1.5.0)
- [x] Clipboard import/export (v1.5.1)
- [x] Batch request queue optimization (v1.4.1)
- [x] React Query integration (v1.4.1)
- [x] Multi-language news integration (v1.15.0) - Finnhub (US) + Google News RSS (TW/HK/JP)

### Planned

- [ ] Real-time WebSocket updates
- [ ] PostgreSQL for user data
- [ ] Microservices for scaling
- [ ] GraphQL API option
- [ ] Server-side rendering (SSR)

---

For more details on specific implementations, see the source code and inline documentation.
