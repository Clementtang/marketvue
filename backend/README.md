# Stock Dashboard API

Flask-based REST API for fetching stock market data using yfinance.

## Features

- Historical stock data (OHLCV)
- Batch stock queries (up to 9 stocks)
- Rate limiting (100 requests/hour)
- Response caching
- CORS enabled
- Comprehensive error handling
- Request validation with Marshmallow

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

### 1. Get Stock Data

**POST** `/api/stock-data`

Fetch historical stock data for a symbol.

**Request Body:**
```json
{
  "symbol": "AAPL",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

**Response:**
```json
{
  "symbol": "AAPL",
  "data": [
    {
      "date": "2024-01-01",
      "open": 150.00,
      "high": 155.00,
      "low": 149.00,
      "close": 154.00,
      "volume": 10000000
    }
  ],
  "current_price": 154.00,
  "change": 4.00,
  "change_percent": 2.67
}
```

### 2. Batch Stock Query

**POST** `/api/batch-stocks`

Fetch data for multiple stocks (max 9).

**Request Body:**
```json
{
  "symbols": ["AAPL", "GOOGL", "MSFT"],
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

Note: `start_date` and `end_date` are optional. Defaults to last 30 days.

**Response:**
```json
{
  "stocks": [
    {
      "symbol": "AAPL",
      "data": [...],
      "current_price": 154.00,
      "change": 4.00,
      "change_percent": 2.67
    }
  ],
  "timestamp": "2024-01-15T10:30:00",
  "errors": null
}
```

### 3. Health Check

**GET** `/api/health`

Check API status.

**Response:**
```json
{
  "status": "healthy",
  "service": "stock-dashboard-api"
}
```

## Rate Limiting

- Default: 100 requests per hour per IP
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Caching

- Stock data: 5 minutes (300 seconds)
- Configurable via environment variables

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

## Development

### Project Structure

```
backend/
├── app.py                    # Main application
├── config.py                 # Configuration
├── requirements.txt          # Dependencies
├── routes/
│   └── stock_routes.py      # API endpoints
├── services/
│   └── stock_service.py     # Business logic
├── schemas/
│   └── stock_schemas.py     # Validation schemas
└── utils/
    ├── cache.py             # Caching utilities
    └── error_handlers.py    # Error handling
```

### Adding New Endpoints

1. Define schema in `schemas/stock_schemas.py`
2. Implement service logic in `services/stock_service.py`
3. Create route in `routes/stock_routes.py`
4. Register route in `app.py`

## Testing

Run the API and test with curl:

```bash
# Test stock data
curl -X POST http://localhost:5000/api/stock-data \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "start_date": "2024-01-01", "end_date": "2024-01-31"}'

# Test batch stocks
curl -X POST http://localhost:5000/api/batch-stocks \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["AAPL", "GOOGL", "MSFT"]}'
```

## Deployment

### Production Settings

1. Set environment variables:
   - `FLASK_ENV=production`
   - `FLASK_DEBUG=False`
   - Generate secure `SECRET_KEY`

2. Use production-grade cache (Redis):
   ```
   CACHE_TYPE=RedisCache
   CACHE_REDIS_URL=redis://localhost:6379/0
   ```

3. Use production WSGI server (gunicorn):
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

## License

MIT
