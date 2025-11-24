import os
import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from config import config
from utils.cache import cache
from utils.cache_factory import get_cache_config
from utils.error_handlers import register_error_handlers
from utils.request_context import init_request_context
from utils.logger import configure_logging, get_logger
from utils.config_validator import validate_config
from routes.stock_routes import stock_bp
from routes.health_routes import health_bp
from routes.legacy_routes import legacy_bp

# Initial basic logging (will be reconfigured in create_app)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_app(config_name='default'):
    """
    Application factory pattern for creating Flask app instances.

    Creates and configures a Flask application with CORS, caching, rate limiting,
    and error handling. This pattern allows for easier testing and multiple
    app instances with different configurations.

    Args:
        config_name: Configuration to use ('development', 'production', or 'default')

    Returns:
        Flask: Configured Flask application instance with all extensions initialized

    Examples:
        >>> app = create_app('development')
        >>> app = create_app('production')
    """
    # Create Flask app
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Configure enhanced logging with request context
    configure_logging(app)

    # Initialize request context middleware (adds request_id)
    init_request_context(app)

    # Add request timing
    @app.before_request
    def start_timer():
        request.start_time = datetime.now()

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

    # Initialize cache with configuration from factory (supports Redis with fallback)
    cache_config = get_cache_config(app)
    cache.init_app(app, config=cache_config)

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
                "'unsafe-inline'",  # Required for inline scripts
                "https://cdn.jsdelivr.net"
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'"  # Required for inline styles
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
    # API v1 routes (primary)
    app.register_blueprint(stock_bp)      # /api/v1/stock-data, /api/v1/batch-stocks
    app.register_blueprint(health_bp)     # /api/v1/health, /api/v1/health/detailed
    # Legacy routes for backward compatibility (deprecated)
    app.register_blueprint(legacy_bp)     # /api/stock-data, /api/batch-stocks, /api/health

    # Register error handlers
    register_error_handlers(app)

    # Root route
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Stock Dashboard API',
            'version': '1.0.0',
            'api_version': 'v1',
            'endpoints': {
                'v1': {
                    'stock_data': '/api/v1/stock-data',
                    'batch_stocks': '/api/v1/batch-stocks',
                    'health': '/api/v1/health',
                    'health_detailed': '/api/v1/health/detailed',
                    'health_ready': '/api/v1/health/ready',
                    'health_live': '/api/v1/health/live',
                },
                'deprecated': {
                    'stock_data': '/api/stock-data (use /api/v1/stock-data)',
                    'batch_stocks': '/api/batch-stocks (use /api/v1/batch-stocks)',
                    'health': '/api/health (use /api/v1/health)',
                },
            }
        })

    # Validate configuration
    try:
        validate_config(app)
        logger.info("Configuration validation passed")
    except Exception as e:
        logger.error(f"Configuration validation failed: {e}")
        # Continue anyway in development, but log the error
        if not app.config['DEBUG']:
            raise

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
