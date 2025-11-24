# MarketVue API Documentation

This document describes the REST API endpoints provided by the MarketVue backend.

## Base URL

```
# Current version (recommended)
http://localhost:5001/api/v1

# Legacy (deprecated - will be removed in future versions)
http://localhost:5001/api
```

## API Versioning

MarketVue uses URL-based API versioning. The current version is **v1**.

| Version | Status | Base Path |
|---------|--------|-----------|
| v1 | Current | `/api/v1` |
| (none) | Deprecated | `/api` |

**Deprecation Notice:** The legacy `/api/*` endpoints still work but return deprecation headers:
- `X-API-Deprecated: true`
- `X-API-Deprecation-Notice: This endpoint is deprecated. Please use /api/v1/* instead.`

---

## Endpoints

### 1. Get Stock Data

Fetch historical stock data for a specific symbol.

**Endpoint:** `POST /api/v1/stock-data`

**Request Body:**
```json
{
  "symbol": "AAPL",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbol | string | Yes | Stock ticker symbol (e.g., "AAPL", "2330.TW") |
| start_date | string | Yes | Start date in YYYY-MM-DD format |
| end_date | string | Yes | End date in YYYY-MM-DD format |

**Response:** `200 OK`
```json
{
  "symbol": "AAPL",
  "company_name": {
    "zh-TW": "蘋果",
    "en-US": "Apple"
  },
  "data": [
    {
      "date": "2024-01-02",
      "open": 187.15,
      "high": 188.44,
      "low": 183.89,
      "close": 185.64,
      "volume": 82488800
    },
    ...
  ],
  "current_price": 185.64,
  "change": -1.51,
  "change_percent": -0.81
}
```

**Error Responses:**

- `400 Bad Request` - Invalid parameters
```json
{
  "error": "Missing required field: symbol"
}
```

- `404 Not Found` - Symbol not found
```json
{
  "error": "No data found for symbol INVALID. Please verify the symbol is correct."
}
```

---

### 2. Get Batch Stock Data

Fetch data for multiple stocks in a single request.

**Endpoint:** `POST /api/v1/batch-stocks`

**Request Body:**
```json
{
  "symbols": ["AAPL", "GOOGL", "MSFT"],
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbols | array | Yes | Array of stock symbols (max 9) |
| start_date | string | No | Start date (defaults to 30 days ago) |
| end_date | string | No | End date (defaults to today) |

**Response:** `200 OK`
```json
{
  "stocks": [
    {
      "symbol": "AAPL",
      "company_name": {
        "zh-TW": "蘋果",
        "en-US": "Apple"
      },
      "data": [...],
      "current_price": 185.64,
      "change": -1.51,
      "change_percent": -0.81
    },
    ...
  ],
  "timestamp": "2024-10-31T12:00:00",
  "errors": null
}
```

**With Errors:**
```json
{
  "stocks": [...],
  "timestamp": "2024-10-31T12:00:00",
  "errors": [
    {
      "symbol": "INVALID",
      "error": "No data found for symbol INVALID"
    }
  ]
}
```

---

### 3. Health Check Endpoints

Monitor service health and readiness.

#### Basic Health Check
**Endpoint:** `GET /api/v1/health`

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "service": "stock-dashboard-api",
  "version": "1.0.0"
}
```

#### Detailed Health Check
**Endpoint:** `GET /api/v1/health/detailed`

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "service": "stock-dashboard-api",
  "version": "1.0.0",
  "api_version": "v1",
  "timestamp": "2025-11-24T04:30:00Z",
  "uptime": {
    "seconds": 3600,
    "formatted": "0d 1h 0m 0s",
    "started_at": "2025-11-24T03:30:00"
  },
  "environment": {
    "debug": false,
    "python_version": "3.9.6"
  },
  "dependencies": {
    "cache": {"status": "healthy", "backend": "SimpleCache"}
  },
  "config": {
    "rate_limit": "1000 per hour",
    "cache_timeout": 300
  }
}
```

#### Kubernetes Readiness Probe
**Endpoint:** `GET /api/v1/health/ready`

**Response:** `200 OK` (ready) or `503 Service Unavailable` (not ready)
```json
{
  "ready": true,
  "checks": {
    "cache": "healthy"
  }
}
```

#### Kubernetes Liveness Probe
**Endpoint:** `GET /api/v1/health/live`

**Response:** `200 OK`
```json
{
  "alive": true,
  "timestamp": "2025-11-24T04:30:00Z"
}
```

---

## Stock Symbol Formats

MarketVue supports various stock exchanges with specific ticker formats:

| Exchange | Format | Example | Description |
|----------|--------|---------|-------------|
| Taiwan Listed | `XXXX.TW` | `2330.TW` | Taiwan Stock Exchange (TWSE) |
| Taiwan OTC | `XXXX.TWO` | `5904.TWO` | Taipei Exchange (TPEx) |
| US Stocks | `SYMBOL` | `AAPL` | NYSE, NASDAQ |
| Hong Kong | `XXXX.HK` | `0700.HK` | Hong Kong Stock Exchange |
| Japan | `XXXX.JP` | `9983.JP` | Tokyo Stock Exchange (use .T for yfinance) |

**Note:** While the frontend displays `.JP` for Japanese stocks, yfinance internally uses `.T` format.

---

## Data Fields

### Stock Data Point
| Field | Type | Description |
|-------|------|-------------|
| date | string | Trading date (YYYY-MM-DD) |
| open | float | Opening price |
| high | float | Highest price of the day |
| low | float | Lowest price of the day |
| close | float | Closing price |
| volume | integer | Trading volume |

### Company Name
| Field | Type | Description |
|-------|------|-------------|
| zh-TW | string/null | Traditional Chinese company name |
| en-US | string/null | English company name |

---

## Rate Limiting

- **Rate Limit:** 1000 requests per hour per IP
- **Headers:**
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

**Rate Limit Exceeded Response:** `429 Too Many Requests`
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

---

## Caching

The API implements caching to improve performance:

- Stock data is cached for **5 minutes**
- Cache is automatically invalidated on new requests after expiry

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Something went wrong on the server |

---

## Examples

### Fetch Taiwan Stock (TSMC)
```bash
curl -X POST http://localhost:5001/api/v1/stock-data \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "2330.TW",
    "start_date": "2024-10-01",
    "end_date": "2024-10-31"
  }'
```

### Fetch Multiple Stocks
```bash
curl -X POST http://localhost:5001/api/v1/batch-stocks \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["AAPL", "2330.TW", "0700.HK"],
    "start_date": "2024-10-01",
    "end_date": "2024-10-31"
  }'
```

### Check Service Health
```bash
curl http://localhost:5001/api/v1/health
curl http://localhost:5001/api/v1/health/detailed
```

---

## Notes

- All dates should be in `YYYY-MM-DD` format
- Prices are in the stock's native currency
- Data source: [yfinance](https://pypi.org/project/yfinance/)
- Market data may be delayed by 15-20 minutes depending on the exchange
- Historical data availability depends on the stock and data provider

---

For questions or issues, please open an issue on [GitHub](https://github.com/Clementtang/marketvue/issues).
