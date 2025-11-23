import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { StockData, StockDataPoint } from '../../../types/stock';
import { getErrorMessage, shouldRetry, calculateRetryDelay } from '../../../utils/errorHandlers';
import { API_CONFIG, MA_PERIODS } from '../../../config/constants';
import type { Translations, Language } from '../../../i18n/translations';

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
 * Handles loading states, error handling, and automatic retries
 */
export function useStockData({
  symbol,
  startDate,
  endDate,
  language,
  t,
}: UseStockDataOptions): UseStockDataReturn {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchStockData = useCallback(async (isRetry = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/stock-data`, {
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

      setStockData({
        ...response.data,
        data: processedData,
      });
      setRetryCount(0);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, language, t);
      setError(errorMessage);
      console.error('Error fetching stock data:', err);

      // Auto-retry logic
      if (!isRetry && shouldRetry(err, retryCount, API_CONFIG.RETRY_COUNT)) {
        const statusCode = err.response?.status;
        const retryDelay = calculateRetryDelay(retryCount, statusCode);

        console.log(`Retrying in ${retryDelay}ms... (Attempt ${retryCount + 1}/${API_CONFIG.RETRY_COUNT})`);

        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchStockData(true);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [symbol, startDate, endDate, language, t, retryCount]);

  useEffect(() => {
    fetchStockData();
  }, [symbol, startDate, endDate]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchStockData();
  }, [fetchStockData]);

  return {
    stockData,
    loading,
    error,
    retryCount,
    handleRetry,
  };
}

export default useStockData;
