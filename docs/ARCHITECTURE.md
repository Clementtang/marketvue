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
│  │  │ - News API │  │ - Caching    │  │   JSON   │ │  │
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
- **Flask-Caching**: SimpleCache for performance

## Component Structure

### Frontend Components

```
src/
├── components/
│   ├── StockCard.tsx          # Individual stock display
│   ├── StockManager.tsx       # Add/remove stocks
│   ├── DashboardGrid.tsx      # Grid layout
│   ├── TimeRangeSelector.tsx  # Date range picker
│   ├── NewsPanel.tsx          # News sidebar
│   ├── ThemeSettings.tsx      # Settings modal
│   └── ColorThemeSelector.tsx # Color theme options
├── i18n/
│   └── translations.ts        # Multi-language support
├── App.tsx                    # Root component
└── main.tsx                   # Application entry
```

### Backend Services

```
backend/
├── app.py                     # Flask application
├── config.py                  # Configuration
├── routes/
│   └── stock_routes.py       # API endpoints
├── services/
│   └── stock_service.py      # Business logic
└── data/
    └── company_names.json    # Multi-language names
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
- Backend: 10-minute cache for news
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
- [ ] Redis for distributed caching
- [ ] PostgreSQL for user data
- [ ] Microservices for scaling
- [ ] GraphQL API option
- [ ] Server-side rendering (SSR)

---

For more details on specific implementations, see the source code and inline documentation.
