/**
 * Stock Search Types
 *
 * Type definitions for the stock search/suggestion feature.
 */

import type { Language } from '../i18n/translations';

/**
 * Market identifiers for different stock exchanges
 */
export type MarketCode = 'TW' | 'TWO' | 'US' | 'HK' | 'JP';

/**
 * Bilingual name structure
 */
export interface BilingualName {
  'zh-TW': string;
  'en-US': string;
}

/**
 * Sector/Industry classification
 */
export type SectorCode =
  | 'Semiconductors'
  | 'Electronics'
  | 'Software'
  | 'Internet'
  | 'Financial'
  | 'Consumer'
  | 'Healthcare'
  | 'Industrial'
  | 'Energy'
  | 'Materials'
  | 'Telecom'
  | 'Transportation'
  | 'RealEstate'
  | 'Gaming'
  | 'Automotive'
  | 'Retail';

/**
 * Individual stock entry in the search database
 */
export interface StockEntry {
  /** Stock symbol (e.g., "2330.TW", "AAPL") */
  symbol: string;
  /** Company name in multiple languages */
  name: BilingualName;
  /** Market identifier */
  market: MarketCode;
  /** Industry/sector classification (optional for backward compatibility) */
  sector?: SectorCode;
  /** Alternative names/aliases for search matching */
  aliases?: string[];
}

/**
 * Stock data file structure
 */
export interface StockDataFile {
  /** Version of the data file */
  version: string;
  /** Last update date (ISO 8601) */
  lastUpdated: string;
  /** Array of stock entries */
  stocks: StockEntry[];
}

/**
 * Search result with relevance score
 */
export interface SearchResult {
  /** The matched stock entry */
  stock: StockEntry;
  /** Relevance score (0-100, higher is better) */
  score: number;
  /** Whether this stock is already being tracked */
  isTracked: boolean;
}

/**
 * Search configuration options
 */
export interface SearchOptions {
  /** Maximum number of results to return */
  maxResults?: number;
  /** Current language for name matching priority */
  language?: Language;
  /** List of currently tracked symbols (to mark as tracked) */
  trackedSymbols?: string[];
}

/**
 * Search scoring weights
 */
export const SEARCH_SCORES = {
  /** Exact symbol match */
  SYMBOL_EXACT: 100,
  /** Symbol starts with query */
  SYMBOL_STARTS_WITH: 80,
  /** Symbol contains query */
  SYMBOL_CONTAINS: 60,
  /** Name starts with query */
  NAME_STARTS_WITH: 50,
  /** Alias matches */
  ALIAS_MATCH: 40,
  /** Name contains query */
  NAME_CONTAINS: 30,
} as const;

/**
 * Default search options
 */
export const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
  maxResults: 10,
  language: 'zh-TW',
  trackedSymbols: [],
};

/**
 * Market display information
 */
export interface MarketInfo {
  code: MarketCode;
  label: BilingualName;
  color: string;
}

/**
 * Market information lookup
 */
export const MARKET_INFO: Record<MarketCode, MarketInfo> = {
  TW: {
    code: 'TW',
    label: { 'zh-TW': '台股上市', 'en-US': 'TW Listed' },
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  TWO: {
    code: 'TWO',
    label: { 'zh-TW': '台股上櫃', 'en-US': 'TW OTC' },
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  },
  US: {
    code: 'US',
    label: { 'zh-TW': '美股', 'en-US': 'US' },
    color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  },
  HK: {
    code: 'HK',
    label: { 'zh-TW': '港股', 'en-US': 'HK' },
    color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  JP: {
    code: 'JP',
    label: { 'zh-TW': '日股', 'en-US': 'JP' },
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  },
};
