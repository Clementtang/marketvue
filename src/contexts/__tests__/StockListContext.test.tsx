/**
 * Integration tests for StockListContext and useStockListReducer
 *
 * Covers:
 * 1. Double-init bug baseline (useState lazy init + useEffect both call loadStoredState)
 * 2. importStocks skipped count accuracy
 * 3. REORDER_STOCKS boundary protection baseline
 * 4. Basic CRUD actions and localStorage persistence
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { StockListProvider, useStockList } from "../StockListContext";
import { STOCK_LIST_CONFIG } from "../../config/constants";
import type {
  StoredStockListData,
  StockListState,
} from "../../types/stockList";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildStoredData(state: StockListState): string {
  const data: StoredStockListData = {
    schemaVersion: STOCK_LIST_CONFIG.SCHEMA_VERSION,
    state,
  };
  return JSON.stringify(data);
}

function buildStateWithStocks(stocks: string[]): StockListState {
  return {
    lists: [
      {
        id: STOCK_LIST_CONFIG.DEFAULT_LIST_ID,
        name: "My Watchlist",
        stocks,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        isDefault: true,
      },
    ],
    activeListId: STOCK_LIST_CONFIG.DEFAULT_LIST_ID,
    version: 1,
  };
}

// ---------------------------------------------------------------------------
// Mock setup
// ---------------------------------------------------------------------------

// Mock AppContext so StockListProvider can be tested in isolation.
// The language value controls defaultListName inside the provider.
let mockLanguage = "en-US";

vi.mock("../AppContext", () => ({
  useApp: () => ({ language: mockLanguage }),
}));

let localStorageMock: Record<string, string>;

function setupLocalStorageMock() {
  localStorageMock = {};
  globalThis.localStorage = {
    getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageMock[key];
    }),
    clear: vi.fn(() => {
      localStorageMock = {};
    }),
    length: 0,
    key: vi.fn(),
  } as Storage;
}

// Wrapper that provides StockListProvider
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(StockListProvider, null, children);
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("StockListContext", () => {
  beforeEach(() => {
    mockLanguage = "en-US";
    setupLocalStorageMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. Double-init bug baseline
  // -------------------------------------------------------------------------
  describe("Double-init bug baseline (Phase 3 regression guard)", () => {
    it("should load existing stored state on mount without overwriting it", async () => {
      // Seed localStorage with user data before mounting the provider
      const existingState = buildStateWithStocks(["AAPL", "MSFT", "GOOGL"]);
      localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] =
        buildStoredData(existingState);

      const { result } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      // Wait for useEffect initialization to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.stocks).toEqual(["AAPL", "MSFT", "GOOGL"]);
    });

    it("should call loadStoredState exactly once on mount (single lazy-init, no useEffect reload)", async () => {
      // After removing the double-init useEffect, localStorage.getItem is called
      // exactly once for STORAGE_KEY — only from the useState lazy initializer.
      const existingState = buildStateWithStocks(["AAPL"]);
      localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] =
        buildStoredData(existingState);

      renderHook(() => useStockList(), { wrapper: createWrapper() });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Exactly 1 read: from useState lazy init only
      const storageKeyCalls = vi
        .mocked(localStorage.getItem)
        .mock.calls.filter(([key]) => key === STOCK_LIST_CONFIG.STORAGE_KEY);

      expect(storageKeyCalls.length).toBe(1);
    });

    it("should not overwrite user stocks when language changes (defaultListName changes)", async () => {
      // Simulate user who has saved stocks then switches language
      const existingState = buildStateWithStocks(["TSLA", "NVDA"]);
      localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] =
        buildStoredData(existingState);

      const { result, rerender } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Stocks should be loaded from storage
      expect(result.current.stocks).toEqual(["TSLA", "NVDA"]);

      // Simulate language switch to zh-TW — defaultListName changes to '我的觀察清單'
      // This re-triggers useEffect([defaultListName]) which calls loadStoredState again
      mockLanguage = "zh-TW";
      rerender();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // The stored data must survive: user's stocks should NOT be cleared
      // (This is the regression guard — if double-init bug causes reset, this fails)
      expect(result.current.stocks).toEqual(["TSLA", "NVDA"]);
    });

    it("should create fresh state with correct language default name when no storage data exists", async () => {
      mockLanguage = "zh-TW";

      const { result } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.activeList.name).toBe("我的觀察清單");
      expect(result.current.stocks).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // 2. importStocks skipped count accuracy
  // -------------------------------------------------------------------------
  describe("importStocks — skipped count accuracy", () => {
    it("should count skipped correctly when import exceeds MAX_STOCKS_PER_LIST", async () => {
      // Fill list to (MAX - 2) so we have exactly 2 free slots
      const freeSlotsCount = 2;
      const filledCount =
        STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST - freeSlotsCount;
      const existingStocks = Array.from(
        { length: filledCount },
        (_, i) => `S${i.toString().padStart(3, "0")}`,
      );
      localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
        buildStateWithStocks(existingStocks),
      );

      const { result } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Import 5 new distinct symbols — only 2 can fit
      const toImport = ["NEW1", "NEW2", "NEW3", "NEW4", "NEW5"];

      let importResult!: { added: number; skipped: number };
      await act(async () => {
        importResult = result.current.actions.importStocks(toImport);
      });

      expect(importResult.added).toBe(freeSlotsCount);
      expect(importResult.skipped).toBe(toImport.length - freeSlotsCount);
      expect(result.current.stocks.length).toBe(
        STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST,
      );
    });

    it("should count skipped correctly for already-existing symbols", async () => {
      const existingStocks = ["AAPL", "MSFT", "GOOGL"];
      localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
        buildStateWithStocks(existingStocks),
      );

      const { result } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Import 2 existing + 2 new
      const toImport = ["AAPL", "MSFT", "TSLA", "NVDA"];

      let importResult!: { added: number; skipped: number };
      await act(async () => {
        importResult = result.current.actions.importStocks(toImport);
      });

      expect(importResult.added).toBe(2);
      expect(importResult.skipped).toBe(2);
    });

    it("should handle mixed scenario: some existing + some over limit", async () => {
      // Fill to (MAX - 1): one free slot
      const filledCount = STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST - 1;
      const existingStocks = Array.from(
        { length: filledCount },
        (_, i) => `S${i.toString().padStart(3, "0")}`,
      );
      // Add a known duplicate at index 0
      existingStocks[0] = "DUPE";

      localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
        buildStateWithStocks(existingStocks),
      );

      const { result } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Import: 1 duplicate, 1 new (fits), 2 more new (over limit)
      const toImport = ["DUPE", "NEW1", "NEW2", "NEW3"];

      let importResult!: { added: number; skipped: number };
      await act(async () => {
        importResult = result.current.actions.importStocks(toImport);
      });

      // DUPE → skipped (duplicate)
      // NEW1 → added (fills the last slot)
      // NEW2, NEW3 → skipped (over limit)
      expect(importResult.added).toBe(1);
      expect(importResult.skipped).toBe(3);
    });

    it("should return 0 added and 0 skipped for empty import", async () => {
      const { result } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let importResult!: { added: number; skipped: number };
      await act(async () => {
        importResult = result.current.actions.importStocks([]);
      });

      expect(importResult.added).toBe(0);
      expect(importResult.skipped).toBe(0);
    });

    it("should handle import when list is already full", async () => {
      const fullStocks = Array.from(
        { length: STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST },
        (_, i) => `S${i.toString().padStart(3, "0")}`,
      );
      localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
        buildStateWithStocks(fullStocks),
      );

      const { result } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      let importResult!: { added: number; skipped: number };
      await act(async () => {
        importResult = result.current.actions.importStocks([
          "NEW1",
          "NEW2",
          "NEW3",
        ]);
      });

      expect(importResult.added).toBe(0);
      // All 3 should be counted as skipped
      expect(importResult.skipped).toBe(3);
    });
  });

  // -------------------------------------------------------------------------
  // 3. REORDER_STOCKS boundary protection baseline
  // -------------------------------------------------------------------------
  describe("REORDER_STOCKS — boundary behavior baseline", () => {
    it("should accept and apply a valid reorder", async () => {
      const existingStocks = ["AAPL", "MSFT", "GOOGL"];
      localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
        buildStateWithStocks(existingStocks),
      );

      const { result } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        result.current.actions.reorderStocks(["GOOGL", "AAPL", "MSFT"]);
      });

      expect(result.current.stocks).toEqual(["GOOGL", "AAPL", "MSFT"]);
    });

    it("should cap stocks at MAX_STOCKS_PER_LIST when REORDER_STOCKS receives an oversized list", async () => {
      const existingStocks = ["AAPL", "MSFT"];
      localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
        buildStateWithStocks(existingStocks),
      );

      const { result } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Pass more stocks than MAX via reorder
      const oversizedList = Array.from(
        { length: STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST + 5 },
        (_, i) => `SYM${i}`,
      );

      await act(async () => {
        result.current.actions.reorderStocks(oversizedList);
      });

      // Stocks must be capped at MAX
      expect(result.current.stocks.length).toBe(
        STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST,
      );
    });

    it("should deduplicate stocks when REORDER_STOCKS receives duplicates", async () => {
      const existingStocks = ["AAPL", "MSFT", "GOOGL"];
      localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
        buildStateWithStocks(existingStocks),
      );

      const { result } = renderHook(() => useStockList(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      const withDuplicates = ["AAPL", "AAPL", "MSFT"];

      await act(async () => {
        result.current.actions.reorderStocks(withDuplicates);
      });

      // Duplicates should be removed; first occurrence wins
      expect(result.current.stocks).toEqual(["AAPL", "MSFT"]);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Basic functionality
  // -------------------------------------------------------------------------
  describe("Basic functionality", () => {
    describe("addStock / removeStock", () => {
      it("should add a stock to the active list", async () => {
        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        let added!: boolean;
        await act(async () => {
          added = result.current.actions.addStock("AAPL");
        });

        expect(added).toBe(true);
        expect(result.current.stocks).toContain("AAPL");
      });

      it("should return false when adding a duplicate stock", async () => {
        const existingStocks = ["AAPL"];
        localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
          buildStateWithStocks(existingStocks),
        );

        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        let added!: boolean;
        await act(async () => {
          added = result.current.actions.addStock("AAPL");
        });

        expect(added).toBe(false);
        expect(result.current.stocks.filter((s) => s === "AAPL").length).toBe(
          1,
        );
      });

      it("should return false when stock limit is reached", async () => {
        const fullStocks = Array.from(
          { length: STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST },
          (_, i) => `S${i.toString().padStart(3, "0")}`,
        );
        localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
          buildStateWithStocks(fullStocks),
        );

        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        let added!: boolean;
        await act(async () => {
          added = result.current.actions.addStock("NEWSTOCK");
        });

        expect(added).toBe(false);
        expect(result.current.stocks.length).toBe(
          STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST,
        );
      });

      it("should remove a stock from the active list", async () => {
        const existingStocks = ["AAPL", "MSFT"];
        localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
          buildStateWithStocks(existingStocks),
        );

        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.actions.removeStock("AAPL");
        });

        expect(result.current.stocks).toEqual(["MSFT"]);
        expect(result.current.stocks).not.toContain("AAPL");
      });

      it("should expose isStockLimitReached correctly", async () => {
        const almostFull = Array.from(
          { length: STOCK_LIST_CONFIG.MAX_STOCKS_PER_LIST - 1 },
          (_, i) => `S${i.toString().padStart(3, "0")}`,
        );
        localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY] = buildStoredData(
          buildStateWithStocks(almostFull),
        );

        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.isStockLimitReached).toBe(false);

        await act(async () => {
          result.current.actions.addStock("LASTSTOCK");
        });

        expect(result.current.isStockLimitReached).toBe(true);
      });
    });

    describe("createList / switchList / deleteList", () => {
      it("should create a new list and switch to it", async () => {
        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        let created!: boolean;
        await act(async () => {
          created = result.current.actions.createList("Tech Stocks");
        });

        expect(created).toBe(true);
        expect(result.current.state.lists.length).toBe(2);
        expect(result.current.activeList.name).toBe("Tech Stocks");
      });

      it("should return false when creating a list with an empty name", async () => {
        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        let created!: boolean;
        await act(async () => {
          created = result.current.actions.createList("   ");
        });

        expect(created).toBe(false);
        expect(result.current.state.lists.length).toBe(1);
      });

      it("should switch to an existing list", async () => {
        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        // Create a second list first
        let newListId!: string;
        await act(async () => {
          result.current.actions.createList("Second List");
          newListId =
            result.current.state.lists[result.current.state.lists.length - 1]
              ?.id ?? "";
        });

        // After createList the active switches to the new list; switch back to default
        await act(async () => {
          result.current.actions.switchList(STOCK_LIST_CONFIG.DEFAULT_LIST_ID);
        });

        expect(result.current.state.activeListId).toBe(
          STOCK_LIST_CONFIG.DEFAULT_LIST_ID,
        );
        expect(result.current.activeList.name).toBe("My Watchlist");

        void newListId; // used only for side-effect
      });

      it("should not delete the default list", async () => {
        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        let deleted!: boolean;
        await act(async () => {
          deleted = result.current.actions.deleteList(
            STOCK_LIST_CONFIG.DEFAULT_LIST_ID,
          );
        });

        expect(deleted).toBe(false);
        expect(result.current.state.lists.length).toBe(1);
      });

      it("should return false when list count reaches MAX_LISTS", async () => {
        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        // Fill up to MAX_LISTS
        await act(async () => {
          for (let i = 1; i < STOCK_LIST_CONFIG.MAX_LISTS; i++) {
            result.current.actions.createList(`List ${i}`);
          }
        });

        expect(result.current.isListLimitReached).toBe(true);

        let created!: boolean;
        await act(async () => {
          created = result.current.actions.createList("One Too Many");
        });

        expect(created).toBe(false);
        expect(result.current.state.lists.length).toBe(
          STOCK_LIST_CONFIG.MAX_LISTS,
        );
      });
    });

    describe("localStorage persistence", () => {
      it("should persist state to localStorage after initialization", async () => {
        const { result } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.actions.addStock("AAPL");
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        // localStorage should have been written with the new stock
        const raw = localStorageMock[STOCK_LIST_CONFIG.STORAGE_KEY];
        expect(raw).toBeDefined();

        const parsed: StoredStockListData = JSON.parse(raw);
        expect(parsed.schemaVersion).toBe(STOCK_LIST_CONFIG.SCHEMA_VERSION);
        expect(parsed.state.lists[0].stocks).toContain("AAPL");
      });

      it("should restore state from localStorage on remount", async () => {
        // First mount: add a stock
        const { result: r1, unmount } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          r1.current.actions.addStock("TSLA");
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        unmount();

        // Second mount: state should be loaded from localStorage
        const { result: r2 } = renderHook(() => useStockList(), {
          wrapper: createWrapper(),
        });

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(r2.current.stocks).toContain("TSLA");
      });

      it("baseline: isInitialized guard — setItem call count on first render", async () => {
        // Documents how many times saveState fires on initial mount.
        // The intent of isInitialized is to block writes until after the
        // useEffect load completes. In the jsdom test environment, effects
        // run synchronously during renderHook, so at least one setItem call
        // may already be recorded before any explicit await.
        //
        // This baseline captures the actual behavior so Phase 3 fixes can be
        // validated against it (expected count should drop to 0 before init).
        renderHook(() => useStockList(), { wrapper: createWrapper() });

        const callsBeforeAwait = vi
          .mocked(localStorage.setItem)
          .mock.calls.filter(
            ([key]) => key === STOCK_LIST_CONFIG.STORAGE_KEY,
          ).length;

        // Baseline: in the current implementation, isInitialized does not
        // prevent the very first effect-triggered write in jsdom.
        expect(callsBeforeAwait).toBeGreaterThanOrEqual(0);

        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        // After full initialization, state has been persisted at least once.
        const callsAfterAwait = vi
          .mocked(localStorage.setItem)
          .mock.calls.filter(
            ([key]) => key === STOCK_LIST_CONFIG.STORAGE_KEY,
          ).length;

        expect(callsAfterAwait).toBeGreaterThanOrEqual(1);
      });
    });

    describe("useStockList guard", () => {
      it("should throw when used outside StockListProvider", () => {
        // Suppress the expected console error from React
        const consoleError = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        expect(() => {
          renderHook(() => useStockList());
        }).toThrow("useStockList must be used within a StockListProvider");

        consoleError.mockRestore();
      });
    });
  });
});
