/**
 * Unified type definitions for stock data and related types
 */

import type { Language } from '../i18n/translations';

/**
 * Stock data point representing a single day's trading data
 */
export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;

  /**
   * 20-day moving average
   * @remarks Only available if sufficient historical data exists (at least 20 data points).
   * Calculated client-side for optimization.
   */
  ma20?: number;

  /**
   * 60-day moving average
   * @remarks Only available if sufficient historical data exists (at least 60 data points).
   * Calculated client-side for optimization.
   */
  ma60?: number;
}

/**
 * Complete stock data response from API
 */
export interface StockData {
  /** Stock ticker symbol (e.g., 'AAPL', '2330.TW') */
  symbol: string;

  /**
   * Company name in multiple languages
   * @remarks Optional field that may not exist for all symbols.
   * Language-specific names can be null if not found in the company_names.json mapping.
   * @example
   * ```typescript
   * {
   *   'zh-TW': '台積電',
   *   'en-US': 'Taiwan Semiconductor Manufacturing Company'
   * }
   * ```
   */
  company_name?: {
    'zh-TW': string | null;
    'en-US': string | null;
  };

  /** Array of historical stock data points (OHLCV format) */
  data: StockDataPoint[];

  /**
   * Most recent closing price
   * @remarks Null if no historical data is available or stock has no recent trading activity
   */
  current_price: number | null;

  /**
   * Price change from previous day in absolute value
   * @remarks Null if insufficient data to calculate (less than 2 data points)
   */
  change: number | null;

  /**
   * Price change from previous day as percentage
   * @remarks Null if insufficient data to calculate (less than 2 data points)
   */
  change_percent: number | null;
}

/**
 * Color theme for stock price display
 */
export interface ColorTheme {
  name: string;
  up: string;
  down: string;
}

/**
 * Chart type options
 */
export type ChartType = 'line' | 'candlestick';

/**
 * Time range configuration
 */
export interface TimeRange {
  value: string;
  label: {
    'en-US': string;
    'zh-TW': string;
  };
  days: number;
}

/**
 * Stock card props
 */
export interface StockCardProps {
  symbol: string;
  startDate: string;
  endDate: string;
  colorTheme: ColorTheme;
  chartType: ChartType;
  language: Language;
}

/**
 * API error response
 */
export interface ApiError {
  /** High-level error message describing what went wrong */
  error: string;

  /**
   * Additional error details or context
   * @remarks Only provided when the backend has additional debugging information
   * (e.g., stack traces in development, validation errors, third-party API errors)
   */
  details?: string;
}

/**
 * Batch stock request payload
 * @remarks Maximum 18 symbols per request to avoid rate limits
 */
export interface BatchStockRequest {
  /** Array of stock ticker symbols to fetch (max 18) */
  symbols: string[];

  /** Start date in YYYY-MM-DD format */
  start_date: string;

  /** End date in YYYY-MM-DD format */
  end_date: string;
}

/**
 * Batch stock response from parallel endpoint
 */
export interface BatchStockResponse {
  /** Successfully fetched stock data */
  stocks: StockData[];

  /**
   * Errors encountered during batch processing
   * @remarks Each error contains the symbol that failed and the error message
   */
  errors: {
    symbol: string;
    error: string;
  }[];
}
