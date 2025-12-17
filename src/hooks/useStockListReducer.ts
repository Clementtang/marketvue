/**
 * Stock list state reducer for managing multiple watchlists
 */

import type { StockListState, StockListAction, StockList } from '../types/stockList';
import { STOCK_LIST_CONFIG } from '../config/constants';

/**
 * Generate a unique list ID
 */
function generateListId(): string {
  return `list-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current ISO timestamp
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Create initial state with default list
 */
export function createInitialState(defaultListName = 'My Watchlist'): StockListState {
  const now = getCurrentTimestamp();

  return {
    lists: [
      {
        id: STOCK_LIST_CONFIG.DEFAULT_LIST_ID,
        name: defaultListName,
        stocks: [],
        createdAt: now,
        updatedAt: now,
        isDefault: true,
      },
    ],
    activeListId: STOCK_LIST_CONFIG.DEFAULT_LIST_ID,
    version: 1,
  };
}

/**
 * Stock list reducer
 */
export function stockListReducer(
  state: StockListState,
  action: StockListAction
): StockListState {
  switch (action.type) {
    case 'CREATE_LIST': {
      // Check list limit
      if (state.lists.length >= STOCK_LIST_CONFIG.MAX_LISTS) {
        return state;
      }

      const now = getCurrentTimestamp();
      const newList: StockList = {
        id: generateListId(),
        name: action.payload.name.slice(0, STOCK_LIST_CONFIG.MAX_LIST_NAME_LENGTH),
        stocks: (action.payload.stocks || []).slice(0, STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST),
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...state,
        lists: [...state.lists, newList],
        activeListId: newList.id,
        version: state.version + 1,
      };
    }

    case 'DELETE_LIST': {
      const listToDelete = state.lists.find((l) => l.id === action.payload.id);

      // Cannot delete default list or non-existent list
      if (!listToDelete || listToDelete.isDefault) {
        return state;
      }

      const newLists = state.lists.filter((l) => l.id !== action.payload.id);

      // Switch to default list if deleting the active list
      const newActiveId =
        state.activeListId === action.payload.id
          ? STOCK_LIST_CONFIG.DEFAULT_LIST_ID
          : state.activeListId;

      return {
        ...state,
        lists: newLists,
        activeListId: newActiveId,
        version: state.version + 1,
      };
    }

    case 'RENAME_LIST': {
      const listExists = state.lists.some((l) => l.id === action.payload.id);
      if (!listExists) {
        return state;
      }

      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.payload.id
            ? {
                ...list,
                name: action.payload.name.slice(0, STOCK_LIST_CONFIG.MAX_LIST_NAME_LENGTH),
                updatedAt: getCurrentTimestamp(),
              }
            : list
        ),
        version: state.version + 1,
      };
    }

    case 'SWITCH_LIST': {
      const listExists = state.lists.some((l) => l.id === action.payload.id);
      if (!listExists) {
        return state;
      }

      return {
        ...state,
        activeListId: action.payload.id,
      };
    }

    case 'ADD_STOCK': {
      const activeList = state.lists.find((l) => l.id === state.activeListId);
      if (!activeList) {
        return state;
      }

      // Check stock limit and duplicate
      if (
        activeList.stocks.length >= STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST ||
        activeList.stocks.includes(action.payload.stock)
      ) {
        return state;
      }

      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === state.activeListId
            ? {
                ...list,
                stocks: [...list.stocks, action.payload.stock],
                updatedAt: getCurrentTimestamp(),
              }
            : list
        ),
        version: state.version + 1,
      };
    }

    case 'REMOVE_STOCK': {
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === state.activeListId
            ? {
                ...list,
                stocks: list.stocks.filter((s) => s !== action.payload.stock),
                updatedAt: getCurrentTimestamp(),
              }
            : list
        ),
        version: state.version + 1,
      };
    }

    case 'SET_STOCKS': {
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === state.activeListId
            ? {
                ...list,
                stocks: action.payload.stocks.slice(0, STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST),
                updatedAt: getCurrentTimestamp(),
              }
            : list
        ),
        version: state.version + 1,
      };
    }

    case 'REORDER_STOCKS': {
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === state.activeListId
            ? {
                ...list,
                stocks: action.payload.stocks,
                updatedAt: getCurrentTimestamp(),
              }
            : list
        ),
        version: state.version + 1,
      };
    }

    case 'SAVE_CURRENT_AS_NEW': {
      // Check list limit
      if (state.lists.length >= STOCK_LIST_CONFIG.MAX_LISTS) {
        return state;
      }

      const activeList = state.lists.find((l) => l.id === state.activeListId);
      if (!activeList) {
        return state;
      }

      const now = getCurrentTimestamp();
      const newList: StockList = {
        id: generateListId(),
        name: action.payload.name.slice(0, STOCK_LIST_CONFIG.MAX_LIST_NAME_LENGTH),
        stocks: [...activeList.stocks],
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...state,
        lists: [...state.lists, newList],
        activeListId: newList.id,
        version: state.version + 1,
      };
    }

    case 'IMPORT_STATE': {
      // Used for data migration or cloud sync
      return action.payload;
    }

    default:
      return state;
  }
}
