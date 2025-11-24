import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStockData, getStockQueryKey } from '../../../api/stockApi';
import { getErrorMessage } from '../../../utils/errorHandlers';
import { API_CONFIG } from '../../../config/constants';
import type { StockData } from '../../../types/stock';
import type { Translations, Language } from '../../../i18n/translations';

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
    queryFn: () => fetchStockData({ symbol, startDate, endDate }),
    // Retry configuration
    retry: API_CONFIG.RETRY_COUNT,
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s...
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
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
