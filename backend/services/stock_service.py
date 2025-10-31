import yfinance as yf
import logging
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class StockService:
    """Service for fetching stock data using yfinance"""

    # Cache for company name mappings
    _company_names = None

    @classmethod
    def _load_company_names(cls) -> Dict:
        """Load company name mappings from JSON file"""
        if cls._company_names is None:
            try:
                # Get the path to the JSON file
                base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                json_path = os.path.join(base_dir, 'data', 'company_names.json')

                with open(json_path, 'r', encoding='utf-8') as f:
                    cls._company_names = json.load(f)
                logger.info(f"Loaded {len(cls._company_names)} company name mappings")
            except Exception as e:
                logger.warning(f"Failed to load company names: {str(e)}")
                cls._company_names = {}

        return cls._company_names

    @classmethod
    def get_company_name(cls, symbol: str, ticker_info: Dict = None) -> Dict[str, str]:
        """
        Get company name in multiple languages

        Args:
            symbol: Stock ticker symbol
            ticker_info: Optional yfinance ticker info dict

        Returns:
            Dictionary with 'zh-TW' and 'en-US' company names
        """
        # Load mappings
        mappings = cls._load_company_names()

        # Check if we have a mapping for this symbol
        if symbol in mappings:
            return mappings[symbol]

        # Fallback to yfinance data
        result = {
            'zh-TW': None,
            'en-US': None
        }

        if ticker_info:
            # Try different name fields from yfinance
            result['en-US'] = (
                ticker_info.get('shortName') or
                ticker_info.get('longName') or
                ticker_info.get('displayName')
            )

        return result

    @staticmethod
    def get_stock_data(symbol: str, start_date: str, end_date: str) -> Dict:
        """
        Fetch historical stock data for a given symbol

        Args:
            symbol: Stock ticker symbol
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format

        Returns:
            Dictionary containing stock data and metadata

        Raises:
            ValueError: If stock data cannot be fetched
        """
        try:
            logger.info(f"Fetching stock data for {symbol} from {start_date} to {end_date}")

            # Use Ticker().history() instead of yf.download() to avoid data mixing issues
            ticker = yf.Ticker(symbol)
            hist = ticker.history(start=start_date, end=end_date)

            # Get company info for name
            ticker_info = None
            try:
                ticker_info = ticker.info
            except Exception as e:
                logger.warning(f"Could not fetch ticker info for {symbol}: {str(e)}")

            if hist.empty:
                logger.warning(f"No data returned for {symbol}, trying with period instead")
                # Try with period as fallback
                hist = ticker.history(period='3mo')

            if hist.empty:
                raise ValueError(f"No data found for symbol {symbol}. Please verify the symbol is correct.")

            # Convert to list of dictionaries
            data_points = []
            for index, row in hist.iterrows():
                # Handle both scalar and Series values from yfinance
                try:
                    open_val = float(row['Open']) if not hasattr(row['Open'], 'iloc') else float(row['Open'].iloc[0])
                    high_val = float(row['High']) if not hasattr(row['High'], 'iloc') else float(row['High'].iloc[0])
                    low_val = float(row['Low']) if not hasattr(row['Low'], 'iloc') else float(row['Low'].iloc[0])
                    close_val = float(row['Close']) if not hasattr(row['Close'], 'iloc') else float(row['Close'].iloc[0])
                    volume_val = int(row['Volume']) if not hasattr(row['Volume'], 'iloc') else int(row['Volume'].iloc[0])

                    data_points.append({
                        'date': index.strftime('%Y-%m-%d'),
                        'open': round(open_val, 2),
                        'high': round(high_val, 2),
                        'low': round(low_val, 2),
                        'close': round(close_val, 2),
                        'volume': volume_val
                    })
                except (TypeError, ValueError) as e:
                    logger.warning(f"Skipping data point for {symbol} at {index}: {str(e)}")
                    continue

            # Calculate current price and change
            current_price = data_points[-1]['close'] if data_points else None
            previous_price = data_points[-2]['close'] if len(data_points) > 1 else None

            change = None
            change_percent = None
            if current_price and previous_price:
                change = round(current_price - previous_price, 2)
                change_percent = round((change / previous_price) * 100, 2)

            # Get company name
            company_name = StockService.get_company_name(symbol.upper(), ticker_info)

            result = {
                'symbol': symbol.upper(),
                'company_name': company_name,
                'data': data_points,
                'current_price': current_price,
                'change': change,
                'change_percent': change_percent
            }

            logger.info(f"Successfully fetched {len(data_points)} data points for {symbol}")
            return result

        except Exception as e:
            logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
            raise ValueError(f"Failed to fetch stock data for {symbol}: {str(e)}")

    @staticmethod
    def get_stock_news(symbol: str, limit: int = 5) -> Dict:
        """
        Fetch latest news for a given stock symbol

        Args:
            symbol: Stock ticker symbol
            limit: Maximum number of news items to return (default: 5)

        Returns:
            Dictionary containing news items

        Raises:
            ValueError: If news data cannot be fetched
        """
        try:
            logger.info(f"Fetching news for {symbol}, limit: {limit}")

            # Create ticker object
            ticker = yf.Ticker(symbol)

            # Fetch news
            news = ticker.news

            if not news:
                logger.warning(f"No news found for {symbol}")
                return {
                    'symbol': symbol.upper(),
                    'news': []
                }

            # Format news items
            news_items = []
            for item in news[:limit]:
                news_item = {
                    'title': item.get('title', 'No title'),
                    'publisher': item.get('publisher', 'Unknown'),
                    'link': item.get('link', ''),
                    'published_date': datetime.fromtimestamp(
                        item.get('providerPublishTime', 0)
                    ).strftime('%Y-%m-%d %H:%M:%S') if item.get('providerPublishTime') else 'Unknown',
                    'thumbnail': item.get('thumbnail', {}).get('resolutions', [{}])[0].get('url') if item.get('thumbnail') else None
                }
                news_items.append(news_item)

            result = {
                'symbol': symbol.upper(),
                'news': news_items
            }

            logger.info(f"Successfully fetched {len(news_items)} news items for {symbol}")
            return result

        except Exception as e:
            logger.error(f"Error fetching news for {symbol}: {str(e)}")
            raise ValueError(f"Failed to fetch news for {symbol}: {str(e)}")

    @staticmethod
    def get_batch_stocks(symbols: List[str], start_date: Optional[str] = None,
                        end_date: Optional[str] = None) -> Dict:
        """
        Fetch data for multiple stocks

        Args:
            symbols: List of stock ticker symbols (max 9)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format

        Returns:
            Dictionary containing data for all stocks

        Raises:
            ValueError: If batch data cannot be fetched
        """
        try:
            logger.info(f"Fetching batch data for {len(symbols)} stocks")

            # Use default date range if not provided
            if not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            if not start_date:
                start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

            stocks_data = []
            errors = []

            for symbol in symbols:
                try:
                    stock_data = StockService.get_stock_data(symbol, start_date, end_date)
                    stocks_data.append(stock_data)
                except ValueError as e:
                    logger.warning(f"Failed to fetch data for {symbol}: {str(e)}")
                    errors.append({
                        'symbol': symbol.upper(),
                        'error': str(e)
                    })

            result = {
                'stocks': stocks_data,
                'timestamp': datetime.now().isoformat(),
                'errors': errors if errors else None
            }

            logger.info(f"Successfully fetched data for {len(stocks_data)}/{len(symbols)} stocks")
            return result

        except Exception as e:
            logger.error(f"Error fetching batch stocks: {str(e)}")
            raise ValueError(f"Failed to fetch batch stocks: {str(e)}")
