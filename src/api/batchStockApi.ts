import axios from 'axios';
import type { StockData, StockDataPoint } from '../types/stock';
import { API_CONFIG, MA_PERIODS } from '../config/constants';
import { logger } from '../utils/logger';

/**
 * Batch Stock API Service
 *
 * Manages batch requests for multiple stocks to avoid rate limit issues.
 * Uses parallel batch endpoint for better performance.
 */

interface BatchStockResponse {
  stocks: StockData[];
  errors: Array<{
    symbol: string;
    error: string;
  }>;
  processing_time_ms: number;
}

/**
 * Calculate moving averages for stock data
 */
const calculateMA = (data: StockDataPoint[], period: number): StockDataPoint[] => {
  return data.map((point, index) => {
    if (index < period - 1) {
      return { ...point };
    }
    const sum = data
      .slice(index - period + 1, index + 1)
      .reduce((acc, p) => acc + p.close, 0);
    const ma = sum / period;
    return {
      ...point,
      [`ma${period}`]: ma,
    };
  });
};

/**
 * Process individual stock data with moving averages
 */
const processStockData = (stockData: StockData): StockData => {
  let processedData = stockData.data || [];
  processedData = calculateMA(processedData, MA_PERIODS.SHORT);
  processedData = calculateMA(processedData, MA_PERIODS.LONG);

  return {
    ...stockData,
    data: processedData,
  };
};

/**
 * Fetch batch stock data using the parallel endpoint
 */
export async function fetchBatchStocks(
  symbols: string[],
  startDate: string,
  endDate: string
): Promise<Map<string, StockData | Error>> {
  const result = new Map<string, StockData | Error>();

  // If no symbols, return empty map
  if (symbols.length === 0) {
    return result;
  }

  // Split into chunks of 9 (MAX_BATCH_STOCKS)
  const MAX_BATCH_SIZE = 9;
  const chunks = [];
  for (let i = 0; i < symbols.length; i += MAX_BATCH_SIZE) {
    chunks.push(symbols.slice(i, i + MAX_BATCH_SIZE));
  }

  logger.debug(`[BatchAPI] Processing ${symbols.length} stocks in ${chunks.length} batch(es)`);

  // Process each chunk
  const promises = chunks.map(async (chunk) => {
    try {
      const response = await axios.post<BatchStockResponse>(
        `${API_CONFIG.BASE_URL}/api/v1/batch-stocks-parallel`,
        {
          symbols: chunk,
          start_date: startDate,
          end_date: endDate,
        },
        {
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      // Process successful responses
      response.data.stocks?.forEach((stock) => {
        const processedStock = processStockData(stock);
        result.set(stock.symbol, processedStock);
      });

      // Handle errors
      response.data.errors?.forEach((error) => {
        result.set(error.symbol, new Error(error.error));
      });

      logger.debug(
        `[BatchAPI] Batch completed: ${response.data.stocks?.length || 0} success, ` +
        `${response.data.errors?.length || 0} errors (${response.data.processing_time_ms}ms)`
      );
    } catch (error) {
      // If entire batch fails, mark all symbols as errors
      chunk.forEach((symbol) => {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Unknown error';
        result.set(symbol, new Error(errorMessage));
      });
      logger.error(`[BatchAPI] Batch request failed:`, error);
    }
  });

  // Wait for all batches to complete
  await Promise.all(promises);

  return result;
}

/**
 * Request queue to manage and batch individual stock requests
 */
class StockRequestQueue {
  private queue: Map<string, {
    symbol: string;
    startDate: string;
    endDate: string;
    resolve: (data: StockData) => void;
    reject: (error: Error) => void;
  }> = new Map();

  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_DELAY = 100; // 100ms delay to collect requests

  /**
   * Add a stock request to the queue
   */
  public enqueue(
    symbol: string,
    startDate: string,
    endDate: string
  ): Promise<StockData> {
    return new Promise((resolve, reject) => {
      const key = `${symbol}:${startDate}:${endDate}`;

      // Check if already queued
      if (this.queue.has(key)) {
        const existing = this.queue.get(key)!;
        // Chain the promise
        return new Promise<StockData>((res, rej) => {
          const originalResolve = existing.resolve;
          existing.resolve = (data) => {
            originalResolve(data);
            res(data);
          };
          const originalReject = existing.reject;
          existing.reject = (error) => {
            originalReject(error);
            rej(error);
          };
        });
      }

      // Add to queue
      this.queue.set(key, { symbol, startDate, endDate, resolve, reject });

      // Reset timer
      if (this.timer) {
        clearTimeout(this.timer);
      }

      // Set new timer to process batch
      this.timer = setTimeout(() => this.processBatch(), this.BATCH_DELAY);
    });
  }

  /**
   * Process all queued requests as a batch
   */
  private async processBatch() {
    if (this.queue.size === 0) return;

    // Get all queued items
    const items = Array.from(this.queue.values());
    this.queue.clear();
    this.timer = null;

    logger.debug(`[RequestQueue] Processing batch of ${items.length} requests`);

    // Group by date range
    const groups = new Map<string, typeof items>();
    items.forEach((item) => {
      const key = `${item.startDate}:${item.endDate}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    // Process each group
    for (const [dateKey, groupItems] of groups) {
      const [startDate, endDate] = dateKey.split(':');
      const symbols = groupItems.map(item => item.symbol);

      try {
        const results = await fetchBatchStocks(symbols, startDate, endDate);

        // Resolve/reject individual promises
        groupItems.forEach((item) => {
          const result = results.get(item.symbol);
          if (result instanceof Error) {
            item.reject(result);
          } else if (result) {
            item.resolve(result);
          } else {
            item.reject(new Error('No data returned'));
          }
        });
      } catch (error) {
        // Reject all items in this group
        groupItems.forEach((item) => {
          item.reject(error instanceof Error ? error : new Error('Batch request failed'));
        });
      }
    }
  }
}

// Create singleton instance
const requestQueue = new StockRequestQueue();

/**
 * Fetch single stock data (queued and batched)
 */
export async function fetchStockDataBatched({
  symbol,
  startDate,
  endDate,
}: {
  symbol: string;
  startDate: string;
  endDate: string;
}): Promise<StockData> {
  return requestQueue.enqueue(symbol, startDate, endDate);
}