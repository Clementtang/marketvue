export interface FetchStockDataParams {
  symbol: string;
  startDate: string;
  endDate: string;
}

/**
 * Generate query key for stock data.
 *
 * Stock data is fetched through the batched endpoint (see
 * {@link fetchStockDataBatched} in `batchStockApi.ts`); this module only owns
 * the React Query key so callers share a single, stable key shape.
 */
export function getStockQueryKey(params: FetchStockDataParams): string[] {
  return ["stock", params.symbol, params.startDate, params.endDate];
}
