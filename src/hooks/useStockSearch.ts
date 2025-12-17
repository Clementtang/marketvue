/**
 * Stock Search Hook
 *
 * Provides fuzzy search functionality for stock symbols and names.
 * Supports multiple markets, bilingual search, and scoring-based ranking.
 */

import { useState, useMemo, useCallback } from 'react';
import { getAllStocks } from '../data/stocks';
import type { StockEntry, SearchResult, SearchOptions } from '../types/stockSearch';
import { SEARCH_SCORES as SCORES, DEFAULT_SEARCH_OPTIONS as DEFAULTS } from '../types/stockSearch';

// Pre-load all stocks once
const allStocks = getAllStocks();

/**
 * Normalize string for comparison (lowercase, trim)
 */
function normalize(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Calculate search score for a stock entry
 */
function calculateScore(stock: StockEntry, query: string, language: 'zh-TW' | 'en-US'): number {
  const normalizedQuery = normalize(query);

  // Extract symbol without market suffix for comparison
  const symbolParts = stock.symbol.split('.');
  const baseSymbol = normalize(symbolParts[0]);
  const fullSymbol = normalize(stock.symbol);

  // Check symbol matches
  if (baseSymbol === normalizedQuery || fullSymbol === normalizedQuery) {
    return SCORES.SYMBOL_EXACT;
  }

  if (baseSymbol.startsWith(normalizedQuery) || fullSymbol.startsWith(normalizedQuery)) {
    return SCORES.SYMBOL_STARTS_WITH;
  }

  if (baseSymbol.includes(normalizedQuery) || fullSymbol.includes(normalizedQuery)) {
    return SCORES.SYMBOL_CONTAINS;
  }

  // Get name in preferred language, fallback to other language
  const primaryName = normalize(stock.name[language]);
  const secondaryName = normalize(stock.name[language === 'zh-TW' ? 'en-US' : 'zh-TW']);

  // Check name matches
  if (primaryName.startsWith(normalizedQuery) || secondaryName.startsWith(normalizedQuery)) {
    return SCORES.NAME_STARTS_WITH;
  }

  // Check aliases
  if (stock.aliases && stock.aliases.length > 0) {
    for (const alias of stock.aliases) {
      const normalizedAlias = normalize(alias);
      if (normalizedAlias === normalizedQuery || normalizedAlias.startsWith(normalizedQuery)) {
        return SCORES.ALIAS_MATCH;
      }
    }
  }

  // Check name contains
  if (primaryName.includes(normalizedQuery) || secondaryName.includes(normalizedQuery)) {
    return SCORES.NAME_CONTAINS;
  }

  // Check alias contains
  if (stock.aliases && stock.aliases.length > 0) {
    for (const alias of stock.aliases) {
      if (normalize(alias).includes(normalizedQuery)) {
        return SCORES.NAME_CONTAINS - 5; // Slightly lower than name contains
      }
    }
  }

  return 0;
}

/**
 * Search stocks based on query string
 */
function searchStocks(query: string, options: SearchOptions = {}): SearchResult[] {
  const { maxResults, language, trackedSymbols } = {
    ...DEFAULTS,
    ...options,
  };

  // Return empty for very short queries
  if (!query || query.trim().length < 1) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const stock of allStocks) {
    const score = calculateScore(stock, query, language);

    if (score > 0) {
      results.push({
        stock,
        score,
        isTracked: trackedSymbols.includes(stock.symbol),
      });
    }
  }

  // Sort by score (descending), then by symbol (ascending)
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.stock.symbol.localeCompare(b.stock.symbol);
  });

  // Limit results
  return results.slice(0, maxResults);
}

/**
 * Hook for stock search functionality
 */
export function useStockSearch(options: SearchOptions = {}) {
  const [query, setQuery] = useState('');

  const mergedOptions = useMemo(
    () => ({
      ...DEFAULTS,
      ...options,
    }),
    [options]
  );

  const results = useMemo(() => {
    return searchStocks(query, mergedOptions);
  }, [query, mergedOptions]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  const hasResults = results.length > 0;
  const isSearching = query.length >= 1;

  return {
    query,
    setQuery,
    results,
    clearSearch,
    hasResults,
    isSearching,
  };
}

// Export search function for direct use
export { searchStocks };
