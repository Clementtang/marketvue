import axios from 'axios';
import type { StockData, StockDataPoint } from '../types/stock';
import { API_CONFIG, MA_PERIODS } from '../config/constants';

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

export interface FetchStockDataParams {
  symbol: string;
  startDate: string;
  endDate: string;
}

/**
 * Fetch stock data from API and calculate moving averages
 */
export async function fetchStockData({
  symbol,
  startDate,
  endDate,
}: FetchStockDataParams): Promise<StockData> {
  const response = await axios.post(
    `${API_CONFIG.BASE_URL}/api/v1/stock-data`,
    {
      symbol: symbol,
      start_date: startDate,
      end_date: endDate,
    },
    {
      timeout: API_CONFIG.TIMEOUT,
    }
  );

  // Calculate moving averages
  let processedData = response.data.data;
  processedData = calculateMA(processedData, MA_PERIODS.SHORT);
  processedData = calculateMA(processedData, MA_PERIODS.LONG);

  return {
    ...response.data,
    data: processedData,
  };
}

/**
 * Generate query key for stock data
 */
export function getStockQueryKey(params: FetchStockDataParams): string[] {
  return ['stock', params.symbol, params.startDate, params.endDate];
}
