import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStockData, getStockQueryKey } from "../../../api/stockApi";
import { fetchStockDataBatched } from "../../../api/batchStockApi";
import {
  getErrorMessage,
  calculateRetryDelay,
} from "../../../utils/errorHandlers";
import { API_CONFIG } from "../../../config/constants";
import type { StockData } from "../../../types/stock";
import type { Translations, Language } from "../../../i18n/translations";

// Enable batch API for better performance with multiple stocks
const USE_BATCH_API = true;

interface UseStockDataOptions {
  symbol: string;
  startDate: string;
  endDate: string;
  language: Language;
  t: Translations;
}

interface UseStockDataReturn {
  stockData: StockData | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
  handleRetry: () => void;
}

/**
 * Custom hook for fetching and managing stock data
 * Uses React Query for caching, automatic refetching, and retry logic
 *
 * Benefits over previous implementation:
 * - Automatic caching and deduplication
 * - Background refetching when data becomes stale
 * - Built-in retry with exponential backoff
 * - Optimistic updates support
 * - DevTools integration
 */
export function useStockData({
  symbol,
  startDate,
  endDate,
  language,
  t,
}: UseStockDataOptions): UseStockDataReturn {
  const queryKey = getStockQueryKey({ symbol, startDate, endDate });

  const {
    data: stockData,
    isLoading,
    isFetching,
    error,
    refetch,
    failureCount,
  } = useQuery({
    queryKey,
    queryFn: () => {
      // Use batch API for better performance
      if (USE_BATCH_API) {
        return fetchStockDataBatched({ symbol, startDate, endDate });
      }
      return fetchStockData({ symbol, startDate, endDate });
    },
    // Retry configuration — uses calculateRetryDelay for 503 cold start (5s/10s/15s)
    retry: API_CONFIG.RETRY_COUNT,
    retryDelay: (attemptIndex, error) => {
      const statusCode = (error as { response?: { status?: number } })?.response
        ?.status;
      return calculateRetryDelay(attemptIndex, statusCode);
    },
    // Cache data for longer to reduce requests
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    // Don't throw errors to the error boundary
    throwOnError: false,
  });

  /**
   * Convert error to user-friendly message
   */
  const errorMessage = useMemo(() => {
    if (!error) return null;
    return getErrorMessage(error, language, t);
  }, [error, language, t]);

  /**
   * Manual retry handler
   */
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * Loading state - show loading only if fetching and no cached data
   */
  const loading = useMemo(() => {
    return (isLoading || isFetching) && !stockData;
  }, [isLoading, isFetching, stockData]);

  return {
    stockData: stockData ?? null,
    loading,
    error: errorMessage,
    retryCount: failureCount,
    handleRetry,
  };
}

export default useStockData;
