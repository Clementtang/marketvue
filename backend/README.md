# MarketVue Backend API

> **Version**: 1.9.1
> **Python**: 3.11.0
> **Flask**: 3.0.0

Flask-based REST API for fetching multi-market stock data using yfinance. Built with **SOLID principles** and comprehensive testing (215 tests, 89.87% coverage).

## Features

### Core Functionality
- **Historical Stock Data**: OHLCV (Open, High, Low, Close, Volume) for multiple markets
- **Batch Queries**:
  - Sequential processing (up to 9 stocks)
  - Parallel processing (up to 18 stocks, 2-3x faster)
- **Multi-language Company Names**: 36+ companies with zh-TW/en-US names
- **API Versioning**: URL-based versioning (`/api/v1/*`)
- **Kubernetes-ready Health Endpoints**: `/health`, `/health/detailed`, `/health/ready`, `/health/live`

### Performance & Reliability
- **Flask-Caching**: 5-minute cache (634x performance improvement)
- **Redis Support**: Optional Redis backend for distributed caching
- **Parallel Batch Processing**: ThreadPoolExecutor for concurrent stock fetching
- **Rate Limiting**: 1000 requests/hour per IP
- **Request Validation**: Marshmallow schemas
- **Comprehensive Error Handling**: Structured error responses with request IDs
- **CORS Enabled**: Configurable origins

### Architecture
- **SOLID Design**: Single responsibility services with dependency injection
- **Service Layer Pattern**: Clean separation of concerns
- **Request Context**: Unique request ID tracking for debugging
- **Structured Logging**: JSON-formatted logs with request correlation

## Setup

### Prerequisites

- Python 3.11 or higher
- pip

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
```

5. (Optional) Modify .env file with your settings

### Running the API

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

For complete API documentation, see [docs/API.md](../docs/API.md).

### Base URL

```
# Current version (recommended)
http://localhost:5001/api/v1

# Legacy (deprecated)
http://localhost:5001/api
```

### Quick Reference

#### 1. Get Stock Data (Single)

**POST** `/api/v1/stock-data`

```bash
curl -X POST http://localhost:5001/api/v1/stock-data \
  -H "Content-Type: application/json" \
  -d '{"symbol": "2330.TW", "start_date": "2024-10-01", "end_date": "2024-10-31"}'
```

#### 2. Batch Stocks (Sequential)

**POST** `/api/v1/batch-stocks` - Max 9 stocks

```bash
curl -X POST http://localhost:5001/api/v1/batch-stocks \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["AAPL", "2330.TW", "0700.HK"], "start_date": "2024-10-01"}'
```

#### 3. Batch Stocks (Parallel) 🚀

**POST** `/api/v1/batch-stocks-parallel` - Max 18 stocks, 2-3x faster

```bash
curl -X POST http://localhost:5001/api/v1/batch-stocks-parallel \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"], "max_workers": 5}'
```

#### 4. Health Check Endpoints

```bash
# Basic health check
curl http://localhost:5001/api/v1/health

# Detailed health check
curl http://localhost:5001/api/v1/health/detailed

# Kubernetes readiness probe
curl http://localhost:5001/api/v1/health/ready

# Kubernetes liveness probe
curl http://localhost:5001/api/v1/health/live
```

### Supported Stock Markets

| Market | Format | Example |
|--------|--------|---------|
| Taiwan Listed | `XXXX.TW` | `2330.TW` (TSMC) |
| Taiwan OTC | `XXXX.TWO` | `5904.TWO` (Poya) |
| US Stocks | `SYMBOL` | `AAPL` (Apple) |
| Hong Kong | `XXXX.HK` | `0700.HK` (Tencent) |
| Japan | `XXXX.T` | `9983.T` (UNIQLO) |

## Rate Limiting

- **Limit**: 1000 requests per hour per IP
- **Headers**:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

**429 Response:**
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

## Caching

### Backend Caching (Flask-Caching)
- **Duration**: 5 minutes (300 seconds)
- **Backends**:
  - **SimpleCache** (default): In-memory cache for development
  - **Redis** (production): Distributed cache with persistence
- **Performance**: 634x improvement (cached vs uncached)
- **Auto-fallback**: Automatically falls back to SimpleCache if Redis fails

### Cache Configuration

```bash
# SimpleCache (default)
CACHE_TYPE=SimpleCache
CACHE_DEFAULT_TIMEOUT=300

# Redis (production)
CACHE_TYPE=RedisCache
CACHE_REDIS_URL=redis://localhost:6379/0
CACHE_DEFAULT_TIMEOUT=300
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (validation error)
- `404`: Resource not found (invalid symbol)
- `429`: Rate limit exceeded
- `500`: Internal server error

**Error Response Format:**
```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": {}
}
```

## SOLID Architecture

MarketVue backend follows **SOLID principles** with a clean service layer pattern and dependency injection.

### Architecture Overview

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

### SOLID Principles Applied

#### 1. Single Responsibility Principle (SRP)
Each service has one clear responsibility:

- **StockDataFetcher**: Fetches raw data from yfinance API
- **StockDataTransformer**: Converts DataFrame to dictionary format
- **PriceCalculator**: Computes price metrics and changes
- **CompanyNameService**: Resolves multi-language company names
- **StockService**: Coordinates all services (Facade pattern)

#### 2. Open/Closed Principle (OCP)
Services are open for extension, closed for modification:

- New data sources can be added by implementing the same interface
- New metrics can be added to PriceCalculator without changing existing code
- New validation rules can be added to schemas independently

#### 3. Liskov Substitution Principle (LSP)
Dependencies are injected, allowing easy substitution:

```python
# app.py
stock_data_fetcher = StockDataFetcher()
stock_data_transformer = StockDataTransformer()
price_calculator = PriceCalculator()
company_name_service = CompanyNameService(company_names_path)

stock_service = StockService(
    stock_data_fetcher,
    stock_data_transformer,
    price_calculator,
    company_name_service
)
```

#### 4. Interface Segregation Principle (ISP)
Each service exposes only the methods it needs:

- Routes depend only on specific service methods
- No "god object" with too many responsibilities

#### 5. Dependency Inversion Principle (DIP)
High-level modules (routes) depend on abstractions (service interfaces), not concrete implementations:

```python
# routes/stock_routes.py
@stock_bp.route('/stock-data', methods=['POST'])
def get_stock_data():
    # Depends on StockService abstraction
    result = stock_service.get_stock_data(...)
```

### Project Structure

```
backend/
├── app.py                         # Flask application factory with DI
├── config.py                      # Environment configuration
├── constants.py                   # Magic numbers & constants
├── requirements.txt               # Python dependencies
├── routes/
│   ├── stock_routes.py            # Stock data endpoints (/api/v1/stock-data, /api/v1/batch-stocks)
│   ├── health_routes.py           # Health check endpoints (/api/v1/health/*)
│   └── legacy_routes.py           # Backward compatibility (/api/*)
├── services/                      # SOLID service layer
│   ├── stock_service.py           # Facade/Coordinator (DI container)
│   ├── stock_data_fetcher.py      # Single responsibility: yfinance API calls
│   ├── stock_data_transformer.py  # Single responsibility: DataFrame → Dict
│   ├── price_calculator.py        # Single responsibility: Price metrics
│   └── company_name_service.py    # Single responsibility: Multi-language names
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
├── data/
│   └── company_names.json         # Multi-language company name mapping
└── tests/                         # 215 tests, 89.87% coverage
    ├── conftest.py                # Pytest fixtures
    ├── test_routes/               # Route integration tests
    ├── test_services/             # Service unit tests
    └── test_utils/                # Utility tests
```

### Adding New Features

#### 1. Add a New Service

```python
# services/new_feature_service.py
class NewFeatureService:
    def __init__(self, dependency_a, dependency_b):
        self.dependency_a = dependency_a
        self.dependency_b = dependency_b

    def perform_operation(self, data):
        # Single responsibility logic here
        pass
```

#### 2. Inject Service into StockService

```python
# app.py
new_feature_service = NewFeatureService(dep_a, dep_b)

stock_service = StockService(
    stock_data_fetcher,
    stock_data_transformer,
    price_calculator,
    company_name_service,
    new_feature_service  # Injected dependency
)
```

#### 3. Create New Route

```python
# routes/new_feature_routes.py
@new_feature_bp.route('/new-endpoint', methods=['POST'])
def new_endpoint():
    result = stock_service.new_feature_operation(...)
    return jsonify(result), 200
```

#### 4. Write Tests

```python
# tests/test_services/test_new_feature_service.py
def test_new_feature_service():
    service = NewFeatureService(mock_dep_a, mock_dep_b)
    result = service.perform_operation(test_data)
    assert result == expected_output
```

## Testing

### Run Tests

```bash
# Activate virtual environment
source venv/bin/activate

# Run all tests with coverage
python -m pytest tests/ -v --cov=. --cov-report=term-missing

# Run specific test file
python -m pytest tests/test_services/test_stock_service.py -v

# Run with detailed output
python -m pytest tests/ -vv
```

### Test Statistics

- **Total Tests**: 215 tests
- **Coverage**: 89.87%
- **Test Types**:
  - Route integration tests
  - Service unit tests
  - Utility tests
  - Error handling tests
  - Cache tests

### Manual API Testing

```bash
# Test single stock
curl -X POST http://localhost:5001/api/v1/stock-data \
  -H "Content-Type: application/json" \
  -d '{"symbol": "2330.TW", "start_date": "2024-10-01", "end_date": "2024-10-31"}'

# Test batch stocks (parallel)
curl -X POST http://localhost:5001/api/v1/batch-stocks-parallel \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["AAPL", "GOOGL", "MSFT", "TSLA"], "max_workers": 4}'

# Test health endpoints
curl http://localhost:5001/api/v1/health
curl http://localhost:5001/api/v1/health/detailed
```

## Deployment

### Production Environment Variables

```bash
# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=<generate-secure-random-key>
PORT=5001

# CORS Configuration
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT=1000 per hour

# Cache Configuration (Redis recommended)
CACHE_TYPE=RedisCache
CACHE_REDIS_URL=redis://localhost:6379/0
CACHE_DEFAULT_TIMEOUT=300
```

### Production WSGI Server (Gunicorn)

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn (4 workers)
gunicorn -w 4 -b 0.0.0.0:5001 app:app --timeout 120

# Run with Gunicorn (auto-scale workers)
gunicorn -w $(( 2 * $(nproc) + 1 )) -b 0.0.0.0:5001 app:app --timeout 120
```

### Render.com Deployment

This project is deployed on Render.com. Key configurations:

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT app:app --timeout 120`
- **Environment**: Python 3.11
- **Auto-Deploy**: Enabled on main branch

### Health Check Endpoints for Kubernetes/Docker

```yaml
# Kubernetes Deployment Example
apiVersion: v1
kind: Pod
metadata:
  name: marketvue-backend
spec:
  containers:
  - name: api
    image: marketvue-backend:latest
    ports:
    - containerPort: 5001
    livenessProbe:
      httpGet:
        path: /api/v1/health/live
        port: 5001
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /api/v1/health/ready
        port: 5001
      initialDelaySeconds: 5
      periodSeconds: 5
```

## Documentation

- **[API Documentation](../docs/API.md)** - Complete API reference with examples
- **[Architecture Documentation](../docs/ARCHITECTURE.md)** - System architecture and design
- **[Deployment Guide](../docs/DEPLOYMENT.md)** - Vercel + Render deployment setup

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

## License

MIT
