import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { StockData } from "../../types/stock";

// Mock axios so no real HTTP requests are made.
// fetchBatchStocks uses axios.post and axios.isAxiosError internally.
vi.mock("axios", () => {
  return {
    default: {
      post: vi.fn(),
      // isAxiosError: return true only when the error has isAxiosError flag set
      isAxiosError: (error: unknown): boolean =>
        typeof error === "object" &&
        error !== null &&
        (error as { isAxiosError?: boolean }).isAxiosError === true,
    },
  };
});

import axios from "axios";
import { fetchStockDataBatched } from "../batchStockApi";

const mockedAxiosPost = vi.mocked(axios.post);

// Helper: build a minimal StockData object
function makeStockData(symbol: string): StockData {
  return {
    symbol,
    data: [],
    current_price: 100,
    change: 1.5,
    change_percent: 1.52,
  };
}

// Helper: build the axios response shape expected by fetchBatchStocks
function makeAxiosResponse(
  stocks: StockData[],
  errors: { symbol: string; error: string }[] = [],
) {
  return {
    data: {
      stocks,
      errors,
      processing_time_ms: 0,
    },
  };
}

describe("StockRequestQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── 基本功能 ─────────────────────────────────────────────────────────────

  describe("基本功能", () => {
    it("should resolve with stock data for a single enqueued symbol", async () => {
      const stockData = makeStockData("AAPL");
      mockedAxiosPost.mockResolvedValueOnce(makeAxiosResponse([stockData]));

      const promise = fetchStockDataBatched({
        symbol: "AAPL",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      // Advance past the 100ms batch delay
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;
      expect(result.symbol).toBe("AAPL");
    });

    it("should call axios.post with the correct payload", async () => {
      mockedAxiosPost.mockResolvedValueOnce(
        makeAxiosResponse([makeStockData("TSLA")]),
      );

      fetchStockDataBatched({
        symbol: "TSLA",
        startDate: "2024-02-01",
        endDate: "2024-02-28",
      });

      await vi.advanceTimersByTimeAsync(100);

      expect(mockedAxiosPost).toHaveBeenCalledOnce();
      expect(mockedAxiosPost).toHaveBeenCalledWith(
        expect.stringContaining("/batch-stocks-parallel"),
        expect.objectContaining({
          symbols: ["TSLA"],
          start_date: "2024-02-01",
          end_date: "2024-02-28",
        }),
        expect.any(Object),
      );
    });
  });

  // ─── 重複請求 bug 驗證 ────────────────────────────────────────────────────

  describe("重複請求處理", () => {
    it("should resolve both promises when the same key is enqueued twice", async () => {
      const stockData = makeStockData("AAPL");
      mockedAxiosPost.mockResolvedValueOnce(makeAxiosResponse([stockData]));

      // Enqueue the same symbol+date combination twice before the batch fires
      const promise1 = fetchStockDataBatched({
        symbol: "AAPL",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
      const promise2 = fetchStockDataBatched({
        symbol: "AAPL",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      await vi.advanceTimersByTimeAsync(100);

      // Both promises should resolve with the same data
      await expect(promise1).resolves.toMatchObject({ symbol: "AAPL" });
      await expect(promise2).resolves.toMatchObject({ symbol: "AAPL" });

      // Only one axios call should be made (deduplicated)
      expect(mockedAxiosPost).toHaveBeenCalledOnce();
    });
  });

  // ─── 批次合併 ─────────────────────────────────────────────────────────────

  describe("批次合併", () => {
    it("should merge multiple different symbols into a single batch request", async () => {
      const symbols = ["AAPL", "GOOGL", "MSFT"];
      mockedAxiosPost.mockResolvedValueOnce(
        makeAxiosResponse(symbols.map(makeStockData)),
      );

      const promises = symbols.map((symbol) =>
        fetchStockDataBatched({
          symbol,
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        }),
      );

      await vi.advanceTimersByTimeAsync(100);

      // All three should resolve
      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      results.forEach((result, i) => {
        expect(result.symbol).toBe(symbols[i]);
      });

      // Only one axios call, not three
      expect(mockedAxiosPost).toHaveBeenCalledOnce();
      expect(mockedAxiosPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ symbols }),
        expect.any(Object),
      );
    });

    it("should reset the timer when a new symbol is enqueued within the delay window", async () => {
      const symbols = ["AAPL", "GOOGL"];
      mockedAxiosPost.mockResolvedValueOnce(
        makeAxiosResponse(symbols.map(makeStockData)),
      );

      const p1 = fetchStockDataBatched({
        symbol: "AAPL",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      // Advance 50ms — batch should NOT have fired yet
      await vi.advanceTimersByTimeAsync(50);
      expect(mockedAxiosPost).not.toHaveBeenCalled();

      // Enqueue second symbol, which resets the 100ms timer
      const p2 = fetchStockDataBatched({
        symbol: "GOOGL",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      // Another 50ms (100ms total from start, but timer was reset at t=50)
      await vi.advanceTimersByTimeAsync(50);
      expect(mockedAxiosPost).not.toHaveBeenCalled();

      // Now advance the remaining 50ms to complete the new 100ms window
      await vi.advanceTimersByTimeAsync(50);

      await Promise.all([p1, p2]);
      expect(mockedAxiosPost).toHaveBeenCalledOnce();
      expect(mockedAxiosPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ symbols }),
        expect.any(Object),
      );
    });

    it("should group symbols with different date ranges into separate batch requests", async () => {
      mockedAxiosPost
        .mockResolvedValueOnce(makeAxiosResponse([makeStockData("AAPL")]))
        .mockResolvedValueOnce(makeAxiosResponse([makeStockData("GOOGL")]));

      const p1 = fetchStockDataBatched({
        symbol: "AAPL",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
      const p2 = fetchStockDataBatched({
        symbol: "GOOGL",
        startDate: "2024-02-01",
        endDate: "2024-02-28",
      });

      await vi.advanceTimersByTimeAsync(100);
      await Promise.all([p1, p2]);

      // Two calls because the date ranges differ
      expect(mockedAxiosPost).toHaveBeenCalledTimes(2);
    });
  });

  // ─── 錯誤處理 ─────────────────────────────────────────────────────────────

  describe("錯誤處理", () => {
    it("should reject when the API response contains an error for the symbol", async () => {
      mockedAxiosPost.mockResolvedValueOnce(
        makeAxiosResponse([], [{ symbol: "AAPL", error: "Symbol not found" }]),
      );

      const promise = fetchStockDataBatched({
        symbol: "AAPL",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
      // Suppress unhandled rejection during timer advance
      promise.catch(() => {});

      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).rejects.toThrow("Symbol not found");
    });

    it("should reject when the API response contains no data for the symbol", async () => {
      // Response has no entry for AAPL at all
      mockedAxiosPost.mockResolvedValueOnce(makeAxiosResponse([]));

      const promise = fetchStockDataBatched({
        symbol: "AAPL",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
      promise.catch(() => {});

      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).rejects.toThrow("No data returned");
    });

    it("should reject all promises in the batch when axios.post throws", async () => {
      // fetchBatchStocks catches the axios error internally and maps each symbol
      // to an Error — it never re-throws. So processBatch resolves the per-symbol
      // promises via item.reject(result), not via the outer catch block.
      // Use an object with isAxiosError:true so the error.message branch is taken.
      const axiosError = Object.assign(new Error("Network failure"), {
        isAxiosError: true,
      });
      mockedAxiosPost.mockRejectedValueOnce(axiosError);

      const symbols = ["AAPL", "GOOGL"];
      const promises = symbols.map((symbol) =>
        fetchStockDataBatched({
          symbol,
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        }),
      );
      // Suppress unhandled rejections during timer advance
      promises.forEach((p) => p.catch(() => {}));

      await vi.advanceTimersByTimeAsync(100);

      await Promise.all(
        promises.map((p) => expect(p).rejects.toThrow("Network failure")),
      );
    });

    it("should reject with 'Unknown error' when axios.post throws a non-Error value", async () => {
      // When the thrown value is not an AxiosError, fetchBatchStocks uses the
      // fallback message "Unknown error" (see batchStockApi.ts line 114).
      mockedAxiosPost.mockRejectedValueOnce("some string error");

      const promise = fetchStockDataBatched({
        symbol: "AAPL",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
      promise.catch(() => {});

      await vi.advanceTimersByTimeAsync(100);

      await expect(promise).rejects.toThrow("Unknown error");
    });
  });
});
