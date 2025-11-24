import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import type { StockData, StockDataPoint } from '../../../types/stock';
import { getErrorMessage, shouldRetry as checkShouldRetry, calculateRetryDelay } from '../../../utils/errorHandlers';
import { API_CONFIG, MA_PERIODS } from '../../../config/constants';
import type { Translations, Language } from '../../../i18n/translations';
import { useRetry } from '../../../hooks/useRetry';

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
 * Uses useRetry hook for automatic retry logic with exponential backoff
 */
export function useStockData({
  symbol,
  startDate,
  endDate,
  language,
  t,
}: UseStockDataOptions): UseStockDataReturn {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Async function to fetch stock data from API
   */
  const fetchStockData = useCallback(async (): Promise<StockData> => {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/api/v1/stock-data`, {
      symbol: symbol,
      start_date: startDate,
      end_date: endDate,
    }, {
      timeout: API_CONFIG.TIMEOUT,
    });

    // Calculate moving averages
    let processedData = response.data.data;
    processedData = calculateMA(processedData, MA_PERIODS.SHORT);
    processedData = calculateMA(processedData, MA_PERIODS.LONG);

    return {
      ...response.data,
      data: processedData,
    };
  }, [symbol, startDate, endDate]);

  /**
   * Custom shouldRetry function using existing error handlers
   */
  const shouldRetry = useCallback((error: any, attemptCount: number) => {
    return checkShouldRetry(error, attemptCount, API_CONFIG.RETRY_COUNT);
  }, []);

  /**
   * Custom calculateDelay function using existing error handlers
   */
  const calculateDelay = useCallback((error: any, attemptCount: number) => {
    const statusCode = error?.response?.status;
    return calculateRetryDelay(attemptCount, statusCode);
  }, []);

  /**
   * Callback when retry starts
   */
  const onRetry = useCallback((attemptCount: number, _error: Error) => {
    console.log(`Retrying... (Attempt ${attemptCount}/${API_CONFIG.RETRY_COUNT})`);
  }, []);

  /**
   * Callback when max retries reached
   */
  const onMaxRetriesReached = useCallback((error: any) => {
    console.error('Max retries reached:', error.message);
  }, []);

  /**
   * Use the useRetry hook for automatic retry logic
   */
  const {
    execute,
    isLoading,
    retryCount,
    error,
    data,
    reset,
  } = useRetry(fetchStockData, {
    maxRetries: API_CONFIG.RETRY_COUNT,
    shouldRetry,
    calculateDelay,
    onRetry,
    onMaxRetriesReached,
  });

  /**
   * Update stockData when data changes
   */
  useEffect(() => {
    if (data) {
      setStockData(data);
      setErrorMessage(null);
    }
  }, [data]);

  /**
   * Update error message when error changes
   */
  useEffect(() => {
    if (error) {
      const message = getErrorMessage(error, language, t);
      setErrorMessage(message);
    } else {
      setErrorMessage(null);
    }
  }, [error, language, t]);

  /**
   * Fetch data when symbol or date range changes
   */
  useEffect(() => {
    reset();
    setStockData(null);
    setErrorMessage(null);
    execute();
  }, [symbol, startDate, endDate]);

  /**
   * Manual retry handler
   */
  const handleRetry = useCallback(() => {
    reset();
    setErrorMessage(null);
    execute();
  }, [reset, execute]);

  /**
   * Memoize the loading state
   * Show loading if executing and no cached data
   */
  const loading = useMemo(() => {
    return isLoading && !stockData;
  }, [isLoading, stockData]);

  return {
    stockData,
    loading,
    error: errorMessage,
    retryCount,
    handleRetry,
  };
}

export default useStockData;
