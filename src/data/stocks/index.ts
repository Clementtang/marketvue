/**
 * Stock Data Index
 *
 * Unified export for all stock data files.
 * Provides lazy loading and combined access to all market data.
 */

import type { StockDataFile, StockEntry } from '../../types/stockSearch';

// Import all stock data files
import twListedData from './tw-listed.json';
import twOtcData from './tw-otc.json';
import usPopularData from './us-popular.json';
import jpPopularData from './jp-popular.json';
import hkPopularData from './hk-popular.json';

// Type assertions for JSON imports
const twListed = twListedData as StockDataFile;
const twOtc = twOtcData as StockDataFile;
const usPopular = usPopularData as StockDataFile;
const jpPopular = jpPopularData as StockDataFile;
const hkPopular = hkPopularData as StockDataFile;

/**
 * Get all stock entries combined from all markets
 */
export function getAllStocks(): StockEntry[] {
  return [
    ...twListed.stocks,
    ...twOtc.stocks,
    ...usPopular.stocks,
    ...jpPopular.stocks,
    ...hkPopular.stocks,
  ];
}

/**
 * Get stock entries by market
 */
export function getStocksByMarket(market: 'TW' | 'TWO' | 'US' | 'JP' | 'HK'): StockEntry[] {
  switch (market) {
    case 'TW':
      return twListed.stocks;
    case 'TWO':
      return twOtc.stocks;
    case 'US':
      return usPopular.stocks;
    case 'JP':
      return jpPopular.stocks;
    case 'HK':
      return hkPopular.stocks;
    default:
      return [];
  }
}

/**
 * Get stock data file metadata
 */
export function getStockDataInfo(): {
  totalStocks: number;
  markets: { market: string; count: number; lastUpdated: string }[];
} {
  const markets = [
    { market: 'TW (Listed)', count: twListed.stocks.length, lastUpdated: twListed.lastUpdated },
    { market: 'TWO (OTC)', count: twOtc.stocks.length, lastUpdated: twOtc.lastUpdated },
    { market: 'US', count: usPopular.stocks.length, lastUpdated: usPopular.lastUpdated },
    { market: 'JP', count: jpPopular.stocks.length, lastUpdated: jpPopular.lastUpdated },
    { market: 'HK', count: hkPopular.stocks.length, lastUpdated: hkPopular.lastUpdated },
  ];

  const totalStocks = markets.reduce((sum, m) => sum + m.count, 0);

  return { totalStocks, markets };
}

// Export individual data files for direct access if needed
export { twListed, twOtc, usPopular, jpPopular, hkPopular };
