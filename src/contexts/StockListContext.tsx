/**
 * Stock List Context for managing multiple watchlists
 */

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  StockListState,
  StockListContextType,
  StockList,
  StockListAction,
  StoredStockListData,
} from '../types/stockList';
import { stockListReducer, createInitialState } from '../hooks/useStockListReducer';
import { STOCK_LIST_CONFIG } from '../config/constants';
import { migrateFromLegacyStorage } from '../utils/migration';
import { useApp } from './AppContext';

const StockListContext = createContext<StockListContextType | undefined>(undefined);

/**
 * Hook to access stock list context
 */
export function useStockList() {
  const context = useContext(StockListContext);
  if (context === undefined) {
    throw new Error('useStockList must be used within a StockListProvider');
  }
  return context;
}

interface StockListProviderProps {
  children: ReactNode;
}

/**
 * Load state from localStorage
 */
function loadStoredState(defaultListName: string): StockListState {
  try {
    // First, try to load new format
    const stored = localStorage.getItem(STOCK_LIST_CONFIG.STORAGE_KEY);
    if (stored) {
      const data: StoredStockListData = JSON.parse(stored);
      if (data.schemaVersion === STOCK_LIST_CONFIG.SCHEMA_VERSION) {
        return data.state;
      }
    }

    // Check for legacy data and migrate
    const migratedState = migrateFromLegacyStorage(defaultListName);
    if (migratedState) {
      // Save migrated state to new format
      saveState(migratedState);
      return migratedState;
    }

    // No existing data, return initial state
    return createInitialState(defaultListName);
  } catch (error) {
    console.error('Failed to load stock list state:', error);
    return createInitialState(defaultListName);
  }
}

/**
 * Save state to localStorage
 */
function saveState(state: StockListState): void {
  try {
    const data: StoredStockListData = {
      schemaVersion: STOCK_LIST_CONFIG.SCHEMA_VERSION,
      state,
    };
    localStorage.setItem(STOCK_LIST_CONFIG.STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save stock list state:', error);
  }
}

export function StockListProvider({ children }: StockListProviderProps) {
  const { language } = useApp();

  // Get default list name based on language
  const defaultListName = language === 'zh-TW' ? '我的觀察清單' : 'My Watchlist';

  const [state, setState] = useState<StockListState>(() => loadStoredState(defaultListName));
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize state from localStorage
  useEffect(() => {
    const loadedState = loadStoredState(defaultListName);
    setState(loadedState);
    setIsInitialized(true);
  }, [defaultListName]);

  // Save state to localStorage whenever it changes (after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveState(state);
    }
  }, [state, isInitialized]);

  // Dispatch wrapper
  const dispatch = useCallback((action: StockListAction) => {
    setState((prev) => stockListReducer(prev, action));
  }, []);

  // Computed values
  const activeList = useMemo((): StockList => {
    const found = state.lists.find((l) => l.id === state.activeListId);
    return found || state.lists[0];
  }, [state.lists, state.activeListId]);

  const stocks = useMemo(() => activeList.stocks, [activeList.stocks]);

  const isListLimitReached = state.lists.length >= STOCK_LIST_CONFIG.MAX_LISTS;
  const isStockLimitReached = stocks.length >= STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST;

  // Actions
  const actions = useMemo(
    () => ({
      createList: (name: string, initialStocks?: string[]): boolean => {
        if (isListLimitReached || !name.trim()) {
          return false;
        }
        dispatch({ type: 'CREATE_LIST', payload: { name: name.trim(), stocks: initialStocks } });
        return true;
      },

      deleteList: (id: string): boolean => {
        const list = state.lists.find((l) => l.id === id);
        if (!list || list.isDefault) {
          return false;
        }
        dispatch({ type: 'DELETE_LIST', payload: { id } });
        return true;
      },

      renameList: (id: string, name: string): boolean => {
        if (!name.trim()) {
          return false;
        }
        dispatch({ type: 'RENAME_LIST', payload: { id, name: name.trim() } });
        return true;
      },

      switchList: (id: string): void => {
        dispatch({ type: 'SWITCH_LIST', payload: { id } });
      },

      addStock: (symbol: string): boolean => {
        if (isStockLimitReached || stocks.includes(symbol)) {
          return false;
        }
        dispatch({ type: 'ADD_STOCK', payload: { stock: symbol } });
        return true;
      },

      removeStock: (symbol: string): void => {
        dispatch({ type: 'REMOVE_STOCK', payload: { stock: symbol } });
      },

      reorderStocks: (newStocks: string[]): void => {
        dispatch({ type: 'REORDER_STOCKS', payload: { stocks: newStocks } });
      },

      saveCurrentAsNew: (name: string): boolean => {
        if (isListLimitReached || !name.trim()) {
          return false;
        }
        dispatch({ type: 'SAVE_CURRENT_AS_NEW', payload: { name: name.trim() } });
        return true;
      },

      importStocks: (symbols: string[]): { added: number; skipped: number } => {
        let added = 0;
        let skipped = 0;

        for (const symbol of symbols) {
          const upperSymbol = symbol.toUpperCase().trim();
          if (!upperSymbol) continue;

          if (stocks.length + added >= STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST) {
            skipped += symbols.length - symbols.indexOf(symbol);
            break;
          }

          if (stocks.includes(upperSymbol)) {
            skipped++;
            continue;
          }

          dispatch({ type: 'ADD_STOCK', payload: { stock: upperSymbol } });
          added++;
        }

        return { added, skipped };
      },

      exportStocks: (): string[] => {
        // Convert .T back to .JP for display
        return stocks.map((s) => (s.endsWith('.T') ? s.replace(/\.T$/, '.JP') : s));
      },
    }),
    [dispatch, state.lists, stocks, isListLimitReached, isStockLimitReached]
  );

  const value: StockListContextType = {
    state,
    activeList,
    stocks,
    isListLimitReached,
    isStockLimitReached,
    actions,
  };

  return <StockListContext.Provider value={value}>{children}</StockListContext.Provider>;
}
