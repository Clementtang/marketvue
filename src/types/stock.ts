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
  ma20?: number;
  ma60?: number;
}

/**
 * Complete stock data response from API
 */
export interface StockData {
  symbol: string;
  company_name?: {
    'zh-TW': string | null;
    'en-US': string | null;
  };
  data: StockDataPoint[];
  current_price: number | null;
  change: number | null;
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
  error: string;
  details?: string;
}

/**
 * Batch stock request
 */
export interface BatchStockRequest {
  symbols: string[];
  start_date: string;
  end_date: string;
}

/**
 * Batch stock response
 */
export interface BatchStockResponse {
  stocks: StockData[];
  errors: {
    symbol: string;
    error: string;
  }[];
}
