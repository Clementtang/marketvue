import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
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

    # Set log level from config
    logging.getLogger().setLevel(app.config['LOG_LEVEL'])

    # Initialize CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
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
