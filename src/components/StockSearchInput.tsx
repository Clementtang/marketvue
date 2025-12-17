/**
 * Stock Search Input Component
 *
 * A search input with autocomplete suggestions for stock symbols.
 * Supports keyboard navigation and displays market badges.
 */

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Search, Check, X } from 'lucide-react';
import { useStockSearch } from '../hooks/useStockSearch';
import { useApp } from '../contexts/AppContext';
import { useVisualTheme } from '../contexts/VisualThemeContext';
import { useTranslation } from '../i18n/translations';
import { MARKET_INFO, type SearchResult } from '../types/stockSearch';

interface StockSearchInputProps {
  /** Currently tracked stock symbols */
  trackedSymbols: string[];
  /** Callback when a stock is selected */
  onSelectStock: (symbol: string) => void;
  /** Whether adding is disabled (e.g., max limit reached) */
  disabled?: boolean;
  /** Placeholder text override */
  placeholder?: string;
}

export function StockSearchInput({
  trackedSymbols,
  onSelectStock,
  disabled = false,
  placeholder,
}: StockSearchInputProps) {
  const { language } = useApp();
  const { visualTheme } = useVisualTheme();
  const t = useTranslation(language);

  const { query, setQuery, results, clearSearch, isSearching } = useStockSearch({
    language,
    trackedSymbols,
    maxResults: 10,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Open dropdown when searching
  useEffect(() => {
    if (isSearching && results.length > 0) {
      setIsOpen(true);
    }
  }, [isSearching, results.length]);

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [results]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle stock selection
  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.isTracked || disabled) return;

      // Convert .T to user input format is not needed - we pass the original symbol
      onSelectStock(result.stock.symbol);
      clearSearch();
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onSelectStock, clearSearch, disabled]
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      // Allow Enter to submit the raw input if no dropdown
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault();
        // Submit raw input as uppercase
        onSelectStock(query.trim().toUpperCase());
        clearSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        } else if (query.trim()) {
          // Submit raw input
          onSelectStock(query.trim().toUpperCase());
          clearSearch();
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setIsOpen(false);
    }
  };

  // Get display name based on language
  const getDisplayName = (result: SearchResult): string => {
    return result.stock.name[language] || result.stock.name['en-US'];
  };

  // Get market badge info
  const getMarketBadge = (market: string) => {
    const info = MARKET_INFO[market as keyof typeof MARKET_INFO];
    if (!info) return null;
    return {
      label: info.label[language] || info.label['en-US'],
      color: info.color,
    };
  };

  const defaultPlaceholder = t.searchPlaceholder || 'Search stock symbol or name...';

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search
          size={18}
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
            visualTheme === 'warm'
              ? 'text-warm-400 dark:text-warm-500'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (isSearching && results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder || defaultPlaceholder}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            visualTheme === 'warm'
              ? 'border-warm-300 dark:border-warm-600 rounded-2xl focus:ring-2 focus:ring-warm-accent-500 focus:border-transparent'
              : 'border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              clearSearch();
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${
              visualTheme === 'warm'
                ? 'text-warm-400 hover:text-warm-600 hover:bg-warm-100 dark:text-warm-500 dark:hover:text-warm-300 dark:hover:bg-warm-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 w-full mt-1 max-h-80 overflow-y-auto shadow-lg border ${
            visualTheme === 'warm'
              ? 'bg-warm-50 dark:bg-warm-800 border-warm-200 dark:border-warm-700 rounded-2xl'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg'
          }`}
        >
          {results.map((result, index) => {
            const badge = getMarketBadge(result.stock.market);
            const isHighlighted = index === highlightedIndex;
            const isDisabled = result.isTracked;

            return (
              <button
                key={result.stock.symbol}
                type="button"
                onClick={() => handleSelect(result)}
                disabled={isDisabled}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                } ${
                  isHighlighted && !isDisabled
                    ? visualTheme === 'warm'
                      ? 'bg-warm-accent-50 dark:bg-warm-accent-900/30'
                      : 'bg-blue-50 dark:bg-blue-900/30'
                    : ''
                } ${
                  !isDisabled && !isHighlighted
                    ? visualTheme === 'warm'
                      ? 'hover:bg-warm-100 dark:hover:bg-warm-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    : ''
                } ${
                  index === 0
                    ? visualTheme === 'warm'
                      ? 'rounded-t-2xl'
                      : 'rounded-t-lg'
                    : ''
                } ${
                  index === results.length - 1
                    ? visualTheme === 'warm'
                      ? 'rounded-b-2xl'
                      : 'rounded-b-lg'
                    : ''
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {/* Symbol */}
                <div className="flex-shrink-0 w-24">
                  <span
                    className={`font-mono font-semibold ${
                      visualTheme === 'warm'
                        ? 'text-warm-800 dark:text-warm-100'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {result.stock.symbol}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`block truncate ${
                      visualTheme === 'warm'
                        ? 'text-warm-600 dark:text-warm-300'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {getDisplayName(result)}
                  </span>
                </div>

                {/* Market Badge */}
                {badge && (
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                )}

                {/* Tracked Indicator */}
                {result.isTracked && (
                  <Check
                    size={18}
                    className={`flex-shrink-0 ${
                      visualTheme === 'warm'
                        ? 'text-warm-accent-500'
                        : 'text-green-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* No Results Message */}
      {isOpen && isSearching && results.length === 0 && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 w-full mt-1 px-4 py-3 shadow-lg border ${
            visualTheme === 'warm'
              ? 'bg-warm-50 dark:bg-warm-800 border-warm-200 dark:border-warm-700 rounded-2xl text-warm-500 dark:text-warm-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400'
          }`}
        >
          <p className="text-sm text-center">
            {t.noSearchResults || 'No matching stocks found'}
          </p>
          <p className="text-xs text-center mt-1 opacity-70">
            {t.tryEnterSymbol || 'Press Enter to add manually'}
          </p>
        </div>
      )}
    </div>
  );
}

export default StockSearchInput;
