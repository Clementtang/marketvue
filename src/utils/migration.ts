/**
 * Data migration utilities for stock list management
 */

import type { StockListState, StockList } from '../types/stockList';
import { STOCK_LIST_CONFIG } from '../config/constants';

/**
 * Migrate from legacy localStorage format ('tracked-stocks') to new format
 *
 * Legacy format: string[] of stock symbols in localStorage['tracked-stocks']
 * New format: StockListState with multiple lists support
 *
 * @param defaultListName - Name for the default list (language-dependent)
 * @returns Migrated StockListState or null if no legacy data exists
 */
export function migrateFromLegacyStorage(defaultListName: string): StockListState | null {
  try {
    const legacyData = localStorage.getItem(STOCK_LIST_CONFIG.LEGACY_STORAGE_KEY);

    if (!legacyData) {
      return null;
    }

    const legacyStocks = JSON.parse(legacyData) as string[];

    // Validate that it's an array of strings
    if (!Array.isArray(legacyStocks) || !legacyStocks.every((s) => typeof s === 'string')) {
      console.warn('Invalid legacy stock data format, skipping migration');
      return null;
    }

    // Filter and limit stocks
    const validStocks = legacyStocks
      .filter((s) => s && typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim().toUpperCase())
      .slice(0, STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST);

    const now = new Date().toISOString();

    const defaultList: StockList = {
      id: STOCK_LIST_CONFIG.DEFAULT_LIST_ID,
      name: defaultListName,
      stocks: validStocks,
      createdAt: now,
      updatedAt: now,
      isDefault: true,
    };

    const migratedState: StockListState = {
      lists: [defaultList],
      activeListId: STOCK_LIST_CONFIG.DEFAULT_LIST_ID,
      version: 1,
    };

    // Remove legacy data after successful migration
    localStorage.removeItem(STOCK_LIST_CONFIG.LEGACY_STORAGE_KEY);

    console.info(
      `Successfully migrated ${validStocks.length} stocks from legacy format`
    );

    return migratedState;
  } catch (error) {
    console.error('Failed to migrate legacy stock data:', error);
    return null;
  }
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  const hasLegacyData = localStorage.getItem(STOCK_LIST_CONFIG.LEGACY_STORAGE_KEY) !== null;
  const hasNewData = localStorage.getItem(STOCK_LIST_CONFIG.STORAGE_KEY) !== null;

  return hasLegacyData && !hasNewData;
}

/**
 * Export stock list state for backup
 */
export function exportStateAsJson(state: StockListState): string {
  return JSON.stringify(
    {
      schemaVersion: STOCK_LIST_CONFIG.SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      state,
    },
    null,
    2
  );
}

/**
 * Import stock list state from backup JSON
 */
export function importStateFromJson(json: string): StockListState | null {
  try {
    const data = JSON.parse(json);

    // Validate schema version
    if (data.schemaVersion !== STOCK_LIST_CONFIG.SCHEMA_VERSION) {
      console.warn('Incompatible schema version:', data.schemaVersion);
      return null;
    }

    const state = data.state as StockListState;

    // Basic validation
    if (!state.lists || !Array.isArray(state.lists) || !state.activeListId) {
      console.warn('Invalid state structure');
      return null;
    }

    // Ensure there's always a default list
    const hasDefaultList = state.lists.some(
      (l) => l.id === STOCK_LIST_CONFIG.DEFAULT_LIST_ID || l.isDefault
    );

    if (!hasDefaultList) {
      console.warn('No default list found in imported data');
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to import state from JSON:', error);
    return null;
  }
}
