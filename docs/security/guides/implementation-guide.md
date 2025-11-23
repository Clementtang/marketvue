# MarketVue 安全改善實施指南

本指南提供具體的代碼範例和步驟,用於修復安全審計報告中發現的問題。

**相關文件**: `security-audit-2025-11-21.md`
**目標**: 修復所有高優先級和中優先級安全問題

---

## 目錄

1. [緊急修復](#1-緊急修復)
2. [重要改善](#2-重要改善)
3. [測試驗證](#3-測試驗證)
4. [部署檢查清單](#4-部署檢查清單)

---

## 1. 緊急修復

### 1.1 修復 SECRET_KEY

#### 步驟 1: 生成強 SECRET_KEY

```bash
# 生成安全的密鑰
python3 -c "import secrets; print(secrets.token_hex(32))"
# 輸出範例: 8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a
```

#### 步驟 2: 更新 backend/config.py

```python
"""
Application configuration module.

Loads environment variables and provides configuration classes for different
deployment environments (development, production).
"""
import os
import secrets
from dotenv import load_dotenv

load_dotenv()


class Config:
    """
    Base configuration class.
    """
    # Flask settings
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

    @property
    def SECRET_KEY(self):
        """
        Get SECRET_KEY from environment with validation.
        Raises ValueError if not set properly in production.
        """
        secret = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

        # In production, ensure SECRET_KEY is properly set
        if not self.DEBUG and (not secret or secret == 'dev-secret-key-change-in-production'):
            raise ValueError(
                "SECRET_KEY must be set in production environment. "
                "Generate one using: python -c 'import secrets; print(secrets.token_hex(32))'"
            )
        return secret

    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')

    # Cache settings
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'SimpleCache')
    CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_DEFAULT_TIMEOUT', '300'))
    CACHE_NEWS_TIMEOUT = int(os.getenv('CACHE_NEWS_TIMEOUT', '900'))

    # Rate limiting settings
    RATELIMIT_STORAGE_URL = os.getenv('RATELIMIT_STORAGE_URL', 'memory://')
    RATELIMIT_DEFAULT = os.getenv('RATELIMIT_DEFAULT', '1000 per hour')
    RATELIMIT_HEADERS_ENABLED = True

    # Stock API settings
    MAX_BATCH_STOCKS = int(os.getenv('MAX_BATCH_STOCKS', '9'))
    DEFAULT_STOCK_PERIOD = os.getenv('DEFAULT_STOCK_PERIOD', '1mo')

    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')


class DevelopmentConfig(Config):
    """Development environment configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production environment configuration."""
    DEBUG = False

    def __init__(self):
        super().__init__()
        self._validate_production_config()

    def _validate_production_config(self):
        """Validate critical production configuration."""
        # Validate CORS
        cors_origins = os.getenv('CORS_ORIGINS')
        if not cors_origins or 'localhost' in cors_origins.lower():
            raise ValueError(
                "CORS_ORIGINS must be explicitly set in production without localhost. "
                "Example: CORS_ORIGINS=https://marketvue.vercel.app"
            )

        # Validate SECRET_KEY
        secret = os.getenv('SECRET_KEY')
        if not secret or secret == 'dev-secret-key-change-in-production':
            raise ValueError(
                "SECRET_KEY must be set in production. "
                "Generate: python -c 'import secrets; print(secrets.token_hex(32))'"
            )


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

#### 步驟 3: 在 Render.com 設置環境變數

1. 登入 Render.com Dashboard
2. 選擇 `marketvue-api` service
3. 進入 **Environment** 標籤
4. 添加環境變數:
   - Key: `SECRET_KEY`
   - Value: (貼上步驟 1 生成的密鑰)
5. 添加環境變數:
   - Key: `FLASK_ENV`
   - Value: `production`
6. 點擊 **Save Changes**

#### 步驟 4: 更新 .env.example

```bash
# backend/.env.example

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False

# CRITICAL: Generate a secure SECRET_KEY for production
# Run: python -c 'import secrets; print(secrets.token_hex(32))'
SECRET_KEY=your-secure-secret-key-here-change-me

PORT=5000

# CORS Settings
# Comma-separated list of allowed origins (NO localhost in production!)
CORS_ORIGINS=https://marketvue.vercel.app

# Cache Settings
CACHE_TYPE=SimpleCache
CACHE_DEFAULT_TIMEOUT=300
CACHE_NEWS_TIMEOUT=900

# Rate Limiting
RATELIMIT_STORAGE_URL=memory://
RATELIMIT_DEFAULT=1000 per hour

# Stock API Settings
MAX_BATCH_STOCKS=9
DEFAULT_STOCK_PERIOD=1mo

# Logging
LOG_LEVEL=INFO
```

---

### 1.2 添加 HTTP 安全標頭

#### 步驟 1: 安裝 Flask-Talisman

```bash
cd backend
pip install flask-talisman==1.1.0
pip freeze > requirements.txt
```

#### 步驟 2: 更新 backend/app.py

```python
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from config import config
from utils.cache import cache
from utils.error_handlers import register_error_handlers
from routes.stock_routes import stock_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app(config_name='default'):
    """
    Application factory pattern for creating Flask app instances.
    """
    # Create Flask app
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Set log level from config
    logging.getLogger().setLevel(app.config['LOG_LEVEL'])

    # Initialize CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": False,
            "max_age": 600
        }
    })

    # Initialize cache
    cache.init_app(app, config={
        'CACHE_TYPE': app.config['CACHE_TYPE'],
        'CACHE_DEFAULT_TIMEOUT': app.config['CACHE_DEFAULT_TIMEOUT']
    })

    # Initialize rate limiter
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=[app.config['RATELIMIT_DEFAULT']],
        storage_uri=app.config['RATELIMIT_STORAGE_URL'],
        headers_enabled=app.config['RATELIMIT_HEADERS_ENABLED']
    )

    # Apply rate limiting to stock routes
    limiter.limit("1000 per hour")(stock_bp)
    limiter.limit("100 per minute")(stock_bp)

    # Security headers
    if not app.config['DEBUG']:
        # Production: Use Talisman for comprehensive security headers
        csp = {
            'default-src': "'self'",
            'script-src': [
                "'self'",
                "'unsafe-inline'",  # 需要用於內聯腳本,考慮移除
                "https://cdn.jsdelivr.net"
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'"  # 需要用於內聯樣式
            ],
            'img-src': ["'self'", "data:", "https:"],
            'font-src': ["'self'", "data:"],
            'connect-src': ["'self'"],
            'frame-ancestors': "'none'",
        }

        Talisman(
            app,
            force_https=True,
            strict_transport_security=True,
            strict_transport_security_max_age=31536000,  # 1 year
            content_security_policy=csp,
            content_security_policy_nonce_in=['script-src'],
            referrer_policy='strict-origin-when-cross-origin',
            feature_policy={
                'geolocation': "'none'",
                'camera': "'none'",
                'microphone': "'none'"
            }
        )
        logger.info("Security headers enabled (Talisman)")
    else:
        # Development: Add basic security headers without HTTPS enforcement
        @app.after_request
        def add_security_headers(response):
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            return response

        logger.info("Development security headers enabled")

    # Register blueprints
    app.register_blueprint(stock_bp)

    # Register error handlers
    register_error_handlers(app)

    # Root route
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Stock Dashboard API',
            'version': '1.0.0',
            'endpoints': {
                'stock_data': '/api/stock-data',
                'batch_stocks': '/api/batch-stocks',
                'health': '/api/health'
            }
        })

    # Health check with detailed info
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'service': 'stock-dashboard-api',
            'version': '1.0.0',
            'environment': config_name
        })

    # Log startup
    logger.info(f"Flask app created with config: {config_name}")
    logger.info(f"CORS origins: {app.config['CORS_ORIGINS']}")
    logger.info(f"Cache type: {app.config['CACHE_TYPE']}")
    logger.info(f"Rate limit: {app.config['RATELIMIT_DEFAULT']}")

    return app


# Create app instance
app = create_app(os.getenv('FLASK_ENV', 'default'))


if __name__ == '__main__':
    # Run the app
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

    logger.info(f"Starting Flask app on port {port}, debug={debug}")

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
```

---

### 1.3 修復 npm 依賴漏洞

#### 步驟 1: 更新 js-yaml

```bash
# 在專案根目錄執行
npm audit fix

# 如果自動修復失敗,手動更新
npm install js-yaml@latest
```

#### 步驟 2: 驗證修復

```bash
npm audit

# 應該顯示: found 0 vulnerabilities
```

#### 步驟 3: 提交更新

```bash
git add package.json package-lock.json
git commit -m "security: fix js-yaml vulnerability (GHSA-mh29-5h37-fv8m)"
```

---

### 1.4 添加前端安全標頭 (Vercel)

#### 創建 vercel.json

在專案根目錄創建 `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-DNS-Prefetch-Control",
          "value": "on"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ],
  "env": {
    "VITE_API_URL": "https://marketvue-api.onrender.com"
  }
}
```

---

## 2. 重要改善

### 2.1 增強速率限制與審計日誌

#### 創建 backend/utils/audit_logger.py

```python
"""
Security audit logging utility.
Logs all API requests for security monitoring and analysis.
"""
import logging
from datetime import datetime
from flask import request, g
import json

logger = logging.getLogger(__name__)


class AuditLogger:
    """
    Middleware for logging all API requests with security context.
    """

    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        """Initialize audit logging with Flask app."""

        @app.before_request
        def before_request():
            """Record request start time."""
            g.start_time = datetime.utcnow()
            g.request_id = self._generate_request_id()

        @app.after_request
        def after_request(response):
            """Log request details after processing."""
            if hasattr(g, 'start_time'):
                duration = (datetime.utcnow() - g.start_time).total_seconds()

                audit_log = {
                    'request_id': getattr(g, 'request_id', 'unknown'),
                    'timestamp': datetime.utcnow().isoformat(),
                    'method': request.method,
                    'path': request.path,
                    'ip': request.remote_addr,
                    'user_agent': request.user_agent.string[:200],  # Limit length
                    'status_code': response.status_code,
                    'duration_seconds': round(duration, 3),
                    'content_length': response.content_length or 0,
                }

                # Log level based on status code
                if response.status_code >= 500:
                    logger.error(f"Server Error: {json.dumps(audit_log)}")
                elif response.status_code >= 400:
                    logger.warning(f"Client Error: {json.dumps(audit_log)}")
                elif response.status_code >= 300:
                    logger.info(f"Redirect: {json.dumps(audit_log)}")
                else:
                    logger.debug(f"Success: {json.dumps(audit_log)}")

                # Add request ID to response headers for debugging
                response.headers['X-Request-ID'] = audit_log['request_id']

            return response

    @staticmethod
    def _generate_request_id():
        """Generate unique request ID."""
        import uuid
        return str(uuid.uuid4())[:8]
```

#### 更新 backend/app.py 以使用審計日誌

```python
# 在 create_app() 函數中添加:
from utils.audit_logger import AuditLogger

def create_app(config_name='default'):
    # ... 現有代碼 ...

    # Initialize audit logger
    audit_logger = AuditLogger(app)
    logger.info("Audit logging enabled")

    # ... 其餘代碼 ...
```

---

### 2.2 改善錯誤訊息處理

#### 更新 backend/utils/error_handlers.py

```python
from flask import jsonify, current_app
from werkzeug.exceptions import HTTPException
from marshmallow import ValidationError
import logging

logger = logging.getLogger(__name__)


def sanitize_error_message(error, is_production=True):
    """
    Sanitize error messages to prevent information leakage.

    Args:
        error: The error object or message
        is_production: Whether running in production mode

    Returns:
        Sanitized error message string
    """
    if not is_production:
        # Development: return full error for debugging
        return str(error)

    # Production: return generic messages
    error_str = str(error).lower()

    # Map specific errors to generic messages
    if 'connection' in error_str or 'timeout' in error_str:
        return 'Service temporarily unavailable. Please try again later.'
    elif 'not found' in error_str or 'no data' in error_str:
        return 'The requested resource could not be found.'
    elif 'invalid' in error_str or 'validation' in error_str:
        return 'Invalid request parameters.'
    else:
        return 'An error occurred while processing your request.'


def register_error_handlers(app):
    """Register error handlers with the Flask app"""

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """Handle Marshmallow validation errors"""
        logger.warning(f"Validation error: {error.messages}")
        return jsonify({
            'error': 'Validation error',
            'details': error.messages
        }), 400

    @app.errorhandler(400)
    def handle_bad_request(error):
        """Handle bad request errors"""
        logger.warning(f"Bad request: {error}")
        message = str(error.description) if hasattr(error, 'description') else 'Invalid request'
        message = sanitize_error_message(message, not app.config['DEBUG'])
        return jsonify({
            'error': 'Bad request',
            'message': message
        }), 400

    @app.errorhandler(404)
    def handle_not_found(error):
        """Handle not found errors"""
        logger.warning(f"Not found: {request.path}")
        return jsonify({
            'error': 'Not found',
            'message': 'The requested endpoint does not exist'
        }), 404

    @app.errorhandler(429)
    def handle_rate_limit_exceeded(error):
        """Handle rate limit exceeded errors"""
        logger.warning(f"Rate limit exceeded: {request.remote_addr}")
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.',
            'retry_after': getattr(error, 'description', '60 seconds')
        }), 429

    @app.errorhandler(500)
    def handle_internal_error(error):
        """Handle internal server errors"""
        logger.error(f"Internal server error: {error}", exc_info=True)
        message = sanitize_error_message(error, not app.config['DEBUG'])
        return jsonify({
            'error': 'Internal server error',
            'message': message
        }), 500

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle general HTTP exceptions"""
        logger.warning(f"HTTP exception: {error}")
        return jsonify({
            'error': error.name,
            'message': error.description
        }), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Handle unexpected errors"""
        logger.error(f"Unexpected error: {error}", exc_info=True)
        message = sanitize_error_message(error, not app.config['DEBUG'])
        return jsonify({
            'error': 'Internal server error',
            'message': message
        }), 500
```

---

### 2.3 加強輸入驗證

#### 更新 backend/schemas/stock_schemas.py

```python
from marshmallow import Schema, fields, validate, validates, ValidationError, validates_schema
from datetime import datetime, timedelta


class StockDataRequestSchema(Schema):
    """Schema for stock data request validation"""
    symbol = fields.Str(
        required=True,
        validate=validate.Length(min=1, max=10),
        error_messages={'required': 'Stock symbol is required'}
    )
    start_date = fields.Date(
        required=True,
        format='%Y-%m-%d',
        error_messages={'required': 'Start date is required'}
    )
    end_date = fields.Date(
        required=True,
        format='%Y-%m-%d',
        error_messages={'required': 'End date is required'}
    )

    @validates('symbol')
    def validate_symbol(self, value):
        """Validate stock symbol format"""
        # Allow alphanumeric, dots, hyphens, and carets (for indices)
        allowed_chars = set('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-^')
        if not all(c in allowed_chars for c in value.upper()):
            raise ValidationError(
                'Invalid stock symbol format. Only letters, numbers, dots, hyphens, and carets allowed.'
            )

        # Additional length check
        if len(value) > 10:
            raise ValidationError('Stock symbol cannot exceed 10 characters')

        return value.upper()

    @validates('start_date')
    def validate_start_date(self, value):
        """Validate start date"""
        today = datetime.now().date()

        # Prevent querying too far in the past (performance/abuse prevention)
        max_history = today - timedelta(days=365 * 20)  # 20 years
        if value < max_history:
            raise ValidationError('Start date cannot be more than 20 years ago')

        # Prevent future dates
        if value > today:
            raise ValidationError('Start date cannot be in the future')

        return value

    @validates('end_date')
    def validate_end_date(self, value):
        """Validate end date"""
        if value > datetime.now().date():
            raise ValidationError('End date cannot be in the future')
        return value

    @validates_schema
    def validate_date_range(self, data, **kwargs):
        """Validate date range"""
        if 'start_date' in data and 'end_date' in data:
            if data['end_date'] < data['start_date']:
                raise ValidationError(
                    {'end_date': ['End date must be after start date']}
                )

            # Prevent excessively large date ranges (performance)
            max_range = timedelta(days=365 * 5)  # 5 years
            if (data['end_date'] - data['start_date']) > max_range:
                raise ValidationError(
                    {'date_range': ['Date range cannot exceed 5 years']}
                )


class BatchStocksRequestSchema(Schema):
    """Schema for batch stock request validation"""
    symbols = fields.List(
        fields.Str(validate=validate.Length(min=1, max=10)),
        required=True,
        validate=validate.Length(min=1, max=9),
        error_messages={
            'required': 'Symbols list is required',
            'max': 'Maximum 9 stocks allowed in batch request'
        }
    )
    start_date = fields.Date(
        format='%Y-%m-%d',
        load_default=None,
        allow_none=True
    )
    end_date = fields.Date(
        format='%Y-%m-%d',
        load_default=None,
        allow_none=True
    )

    @validates('symbols')
    def validate_symbols(self, value):
        """Validate each symbol in the list"""
        allowed_chars = set('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-^')

        for symbol in value:
            if not symbol:
                raise ValidationError('Empty symbol not allowed')

            if not all(c in allowed_chars for c in symbol.upper()):
                raise ValidationError(
                    f'Invalid stock symbol format: {symbol}. '
                    'Only letters, numbers, dots, hyphens, and carets allowed.'
                )

            if len(symbol) > 10:
                raise ValidationError(f'Symbol too long: {symbol}')

        # Check for duplicates
        if len(value) != len(set(s.upper() for s in value)):
            raise ValidationError('Duplicate symbols not allowed')

        return [s.upper() for s in value]

    @validates_schema
    def validate_date_range(self, data, **kwargs):
        """Validate date range if both dates provided"""
        start = data.get('start_date')
        end = data.get('end_date')

        if start and end:
            if end < start:
                raise ValidationError(
                    {'end_date': ['End date must be after start date']}
                )

            # Prevent excessively large date ranges
            max_range = timedelta(days=365 * 5)
            if (end - start) > max_range:
                raise ValidationError(
                    {'date_range': ['Date range cannot exceed 5 years']}
                )


class StockDataPointSchema(Schema):
    """Schema for a single stock data point"""
    date = fields.Str()
    open = fields.Float()
    high = fields.Float()
    low = fields.Float()
    close = fields.Float()
    volume = fields.Int()


class StockDataResponseSchema(Schema):
    """Schema for stock data response"""
    symbol = fields.Str()
    data = fields.List(fields.Nested(StockDataPointSchema))
    current_price = fields.Float(allow_none=True)
    change = fields.Float(allow_none=True)
    change_percent = fields.Float(allow_none=True)


class BatchStocksResponseSchema(Schema):
    """Schema for batch stocks response"""
    stocks = fields.List(fields.Nested(StockDataResponseSchema))
    timestamp = fields.DateTime()
```

---

## 3. 測試驗證

### 3.1 本地測試安全標頭

```bash
# 啟動後端服務
cd backend
FLASK_ENV=production SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))') \
CORS_ORIGINS=http://localhost:5173 \
python app.py

# 在另一個終端測試安全標頭
curl -I http://localhost:5000/api/health

# 應該看到:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
```

### 3.2 測試速率限制

```bash
# 快速發送多個請求測試速率限制
for i in {1..105}; do
  curl -X POST http://localhost:5000/api/stock-data \
    -H "Content-Type: application/json" \
    -d '{"symbol":"AAPL","start_date":"2024-01-01","end_date":"2024-01-31"}' \
    -s -o /dev/null -w "%{http_code}\n"
done

# 前 100 個應該返回 200
# 之後應該返回 429 (Too Many Requests)
```

### 3.3 測試輸入驗證

```bash
# 測試無效的股票符號
curl -X POST http://localhost:5000/api/stock-data \
  -H "Content-Type: application/json" \
  -d '{"symbol":"INVALID@SYMBOL","start_date":"2024-01-01","end_date":"2024-01-31"}'

# 應該返回 400 Bad Request with validation error

# 測試未來日期
curl -X POST http://localhost:5000/api/stock-data \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","start_date":"2025-01-01","end_date":"2025-12-31"}'

# 應該返回 400 Bad Request
```

---

## 4. 部署檢查清單

### 4.1 Render.com 後端部署

- [ ] 設置 `SECRET_KEY` 環境變數(強隨機值)
- [ ] 設置 `FLASK_ENV=production`
- [ ] 設置 `CORS_ORIGINS` (不含 localhost)
- [ ] 設置 `LOG_LEVEL=INFO`
- [ ] 驗證 `requirements.txt` 包含 `flask-talisman`
- [ ] 測試 health endpoint: `https://marketvue-api.onrender.com/api/health`
- [ ] 測試安全標頭: `curl -I https://marketvue-api.onrender.com/api/health`

### 4.2 Vercel 前端部署

- [ ] 確認 `vercel.json` 已提交
- [ ] 設置 `VITE_API_URL` 環境變數
- [ ] 測試前端可以連接後端 API
- [ ] 驗證安全標頭: `curl -I https://marketvue.vercel.app`
- [ ] 測試 CORS: 從前端調用後端 API
- [ ] 驗證 HTTPS 重定向正常工作

### 4.3 安全驗證

使用在線工具驗證安全設置:

1. **Security Headers**:
   - 訪問: https://securityheaders.com/
   - 輸入: https://marketvue.vercel.app
   - 目標: 獲得 A 或 A+ 評級

2. **SSL Labs**:
   - 訪問: https://www.ssllabs.com/ssltest/
   - 輸入後端 URL
   - 目標: 獲得 A 評級

3. **Mozilla Observatory**:
   - 訪問: https://observatory.mozilla.org/
   - 掃描前端和後端
   - 目標: 獲得 B+ 或更高評級

---

## 5. 回滾計劃

如果部署後出現問題,按照以下步驟回滾:

### 5.1 快速回滾(緊急情況)

```bash
# Git 回滾到上一個 commit
git revert HEAD
git push origin main

# Render.com 會自動重新部署上一個版本
```

### 5.2 部分回滾

如果只有特定功能有問題:

1. **移除 Talisman** (如果導致問題):
```python
# 在 backend/app.py 中暫時註釋掉 Talisman 相關代碼
# if not app.config['DEBUG']:
#     Talisman(app, ...)
```

2. **放寬 CORS** (如果前端無法連接):
```python
# 臨時允許更多來源
CORS_ORIGINS=https://marketvue.vercel.app,https://marketvue-staging.vercel.app
```

---

## 6. 監控和告警

### 6.1 設置日誌監控

建議使用以下服務監控應用程式:

1. **Sentry** (錯誤追蹤):
```bash
pip install sentry-sdk[flask]
```

```python
# backend/app.py
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="YOUR_SENTRY_DSN",
    integrations=[FlaskIntegration()],
    environment=config_name,
    traces_sample_rate=0.1
)
```

2. **Render.com Logs**: 在 Dashboard 中監控日誌

### 6.2 健康檢查監控

使用 UptimeRobot 或類似服務監控:
- https://marketvue-api.onrender.com/api/health
- https://marketvue.vercel.app

---

## 7. 後續步驟

完成所有修復後:

1. **更新文檔**:
   - 更新 README.md 包含安全設置說明
   - 更新 DEPLOYMENT.md 包含環境變數要求

2. **團隊培訓**:
   - 向團隊說明新的安全措施
   - 更新開發者指南

3. **定期審計**:
   - 設置每月安全掃描提醒
   - 每季度進行完整安全審計

4. **自動化**:
   - 設置 GitHub Actions 自動運行安全掃描
   - 設置 Dependabot 自動更新依賴

---

**完成這些步驟後,MarketVue 的安全性將大幅提升!**

如有任何問題,請參考主要安全審計報告: `security-audit-2025-11-21.md`
