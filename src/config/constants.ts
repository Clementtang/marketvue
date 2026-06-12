/**
 * Application-wide configuration constants
 * Centralizes magic numbers and hard-coded values for better maintainability
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5001",
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY_BASE: 2000, // 2 seconds base delay for exponential backoff
} as const;

/**
 * Chart Configuration
 * SNAPSHOT MODE: Optimized heights for 16:9 aspect ratio
 */
export const CHART_CONFIG = {
  // Heights (in pixels) - SNAPSHOT MODE
  STOCK_CARD_HEIGHT: 220, // Optimized for snapshot
  CANDLESTICK_HEIGHT: 85, // Reduced to save vertical space
  VOLUME_HEIGHT: 45, // Reduced to save vertical space

  // Margins (for Recharts)
  MARGINS: {
    top: 0, // Reduced from 5 to 0 to maximize chart area
    right: 5,
    left: 0, // Changed from -20 to 0 to prevent Y-axis labels from extending beyond card left edge
    bottom: 0, // Reduced from 5 to 0 to eliminate whitespace below X-axis
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
    name: "Western",
    up: "#16a34a", // Green for price increase
    down: "#dc2626", // Red for price decrease
  },
  ASIAN: {
    name: "Asian",
    up: "#dc2626", // Red for price increase
    down: "#16a34a", // Green for price decrease
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
 * Stock List Management Configuration
 */
export const STOCK_LIST_CONFIG = {
  /** Maximum number of watchlists per user */
  MAX_LISTS: 5,

  /** Maximum stocks per list */
  MAX_STOCKS_PER_LIST: 18,

  /** Maximum characters for list name */
  MAX_LIST_NAME_LENGTH: 30,

  /** Default list ID (cannot be deleted) */
  DEFAULT_LIST_ID: "default",

  /** localStorage key for stock lists */
  STORAGE_KEY: "marketvue-stock-lists",

  /** Legacy localStorage key (for migration) */
  LEGACY_STORAGE_KEY: "tracked-stocks",

  /** Current schema version */
  SCHEMA_VERSION: 1,
} as const;
