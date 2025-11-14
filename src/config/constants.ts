/**
 * Application-wide configuration constants
 * Centralizes magic numbers and hard-coded values for better maintainability
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY_BASE: 2000, // 2 seconds base delay for exponential backoff
} as const;

/**
 * Chart Configuration
 */
export const CHART_CONFIG = {
  // Heights (in pixels)
  STOCK_CARD_HEIGHT: 235,
  CANDLESTICK_HEIGHT: 145,
  VOLUME_HEIGHT: 80,

  // Margins (for Recharts)
  MARGINS: {
    top: 5,
    right: 5,
    left: -20,
    bottom: 5,
  },

  // Chart display settings
  CANDLESTICK_WIDTH_PERCENT: 0.8,
  ANIMATION_DURATION: 300, // milliseconds
} as const;

/**
 * Color Themes for Stock Price Display
 */
export const COLOR_THEMES = {
  WESTERN: {
    name: 'Western',
    up: '#16a34a', // Green for price increase
    down: '#dc2626', // Red for price decrease
  },
  ASIAN: {
    name: 'Asian',
    up: '#dc2626', // Red for price increase
    down: '#16a34a', // Green for price decrease
  },
} as const;

/**
 * Time Range Configurations
 */
export const TIME_RANGES = {
  '5d': {
    days: 5,
    label: {
      'en-US': '5 Days',
      'zh-TW': '5 天',
    },
  },
  '1mo': {
    days: 30,
    label: {
      'en-US': '1 Month',
      'zh-TW': '1 個月',
    },
  },
  '3mo': {
    days: 90,
    label: {
      'en-US': '3 Months',
      'zh-TW': '3 個月',
    },
  },
  '6mo': {
    days: 180,
    label: {
      'en-US': '6 Months',
      'zh-TW': '6 個月',
    },
  },
  '1y': {
    days: 365,
    label: {
      'en-US': '1 Year',
      'zh-TW': '1 年',
    },
  },
  'ytd': {
    days: -1, // Special value for "year to date"
    label: {
      'en-US': 'YTD',
      'zh-TW': '今年至今',
    },
  },
} as const;

/**
 * Moving Average Periods
 */
export const MA_PERIODS = {
  SHORT: 20,
  LONG: 60,
} as const;

/**
 * LocalStorage Keys
 */
export const STORAGE_KEYS = {
  STOCKS: 'stocks',
  LAYOUT: 'dashboard-layout',
  LANGUAGE: 'language',
  COLOR_THEME: 'colorTheme',
} as const;

/**
 * Grid Layout Configuration
 */
export const GRID_CONFIG = {
  COLS: 12,
  ROW_HEIGHT: 30,
  COMPACT_TYPE: 'vertical' as const,
  PREVENT_COLLISION: false,
  MARGIN: [10, 10] as [number, number],
  CONTAINER_PADDING: [10, 10] as [number, number],
} as const;

/**
 * Default Stock Symbols
 */
export const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
] as const;

/**
 * Application Metadata
 */
export const APP_METADATA = {
  NAME: 'MarketVue',
  VERSION: '1.3.4',
  DESCRIPTION: 'Real-time multi-market stock dashboard',
} as const;

/**
 * Validation Constants
 */
export const VALIDATION = {
  MIN_STOCK_SYMBOL_LENGTH: 1,
  MAX_STOCK_SYMBOL_LENGTH: 10,
  MAX_STOCK_CARDS: 20,
} as const;
