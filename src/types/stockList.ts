/**
 * Type definitions for stock list management
 */

/**
 * Single stock watchlist
 */
export interface StockList {
  /** Unique identifier (UUID format) */
  id: string;

  /** User-defined list name */
  name: string;

  /** Array of stock symbols in this list */
  stocks: string[];

  /** ISO 8601 timestamp of creation */
  createdAt: string;

  /** ISO 8601 timestamp of last modification */
  updatedAt: string;

  /** Whether this is the default list (cannot be deleted) */
  isDefault?: boolean;
}

/**
 * Stock list management state
 */
export interface StockListState {
  /** All user's watchlists */
  lists: StockList[];

  /** Currently active list ID */
  activeListId: string;

  /** Data version for future sync support */
  version: number;

  /** Last sync timestamp (reserved for future cloud sync) */
  lastSyncedAt?: string;
}

/**
 * Stored data structure in localStorage
 */
export interface StoredStockListData {
  /** Schema version for data migration */
  schemaVersion: number;

  /** Actual state data */
  state: StockListState;
}

/**
 * Actions for stock list reducer
 */
export type StockListAction =
  | { type: 'CREATE_LIST'; payload: { name: string; stocks?: string[] } }
  | { type: 'DELETE_LIST'; payload: { id: string } }
  | { type: 'RENAME_LIST'; payload: { id: string; name: string } }
  | { type: 'SWITCH_LIST'; payload: { id: string } }
  | { type: 'ADD_STOCK'; payload: { stock: string } }
  | { type: 'REMOVE_STOCK'; payload: { stock: string } }
  | { type: 'SET_STOCKS'; payload: { stocks: string[] } }
  | { type: 'REORDER_STOCKS'; payload: { stocks: string[] } }
  | { type: 'SAVE_CURRENT_AS_NEW'; payload: { name: string } }
  | { type: 'IMPORT_STATE'; payload: StockListState };

/**
 * Stock list context type for consumers
 */
export interface StockListContextType {
  /** Current state */
  state: StockListState;

  /** Currently active list */
  activeList: StockList;

  /** Stocks in the active list (convenience accessor) */
  stocks: string[];

  /** Whether max list count has been reached */
  isListLimitReached: boolean;

  /** Whether max stock count per list has been reached */
  isStockLimitReached: boolean;

  /** Available actions */
  actions: {
    /** Create a new list, optionally with initial stocks */
    createList: (name: string, stocks?: string[]) => boolean;

    /** Delete a list by ID (cannot delete default list) */
    deleteList: (id: string) => boolean;

    /** Rename a list */
    renameList: (id: string, name: string) => boolean;

    /** Switch to a different list */
    switchList: (id: string) => void;

    /** Add a stock to the active list */
    addStock: (symbol: string) => boolean;

    /** Remove a stock from the active list */
    removeStock: (symbol: string) => void;

    /** Reorder stocks in the active list */
    reorderStocks: (stocks: string[]) => void;

    /** Save current list as a new list with a different name */
    saveCurrentAsNew: (name: string) => boolean;

    /** Import multiple stocks at once */
    importStocks: (symbols: string[]) => { added: number; skipped: number };

    /** Export current list's stocks */
    exportStocks: () => string[];
  };
}

/**
 * Cloud sync service interface (reserved for future implementation)
 */
export interface CloudSyncService {
  /** Upload local state to cloud */
  upload(state: StockListState): Promise<void>;

  /** Download state from cloud */
  download(): Promise<StockListState | null>;

  /** Sync local and cloud state (handles conflicts) */
  sync(localState: StockListState): Promise<StockListState>;

  /** Get last sync timestamp */
  getLastSyncTime(): Promise<string | null>;
}

/**
 * Sync status for future cloud sync feature
 */
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'conflict';
