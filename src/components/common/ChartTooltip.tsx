/**
 * Unified chart tooltip component for stock data visualization
 */

import type { StockDataPoint } from '../../types/stock';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  t: {
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    ma20: string;
    ma60: string;
    [key: string]: string;
  };
  showMovingAverages?: boolean;
}

/**
 * Chart tooltip component displaying stock data point information
 */
export function ChartTooltip({ active, payload, t, showMovingAverages = true }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload as StockDataPoint;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 text-xs z-50">
      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
        {new Date(data.date).toLocaleDateString()}
      </p>
      <div className="space-y-1">
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">{t.open}:</span> {formatCurrency(data.open)}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">{t.high}:</span> {formatCurrency(data.high)}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">{t.low}:</span> {formatCurrency(data.low)}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">{t.close}:</span> {formatCurrency(data.close)}
        </p>
        {showMovingAverages && data.ma20 && (
          <p className="text-blue-600 dark:text-blue-400">
            <span className="font-medium">{t.ma20}:</span> {formatCurrency(data.ma20)}
          </p>
        )}
        {showMovingAverages && data.ma60 && (
          <p className="text-purple-600 dark:text-purple-400">
            <span className="font-medium">{t.ma60}:</span> {formatCurrency(data.ma60)}
          </p>
        )}
        <p className="text-gray-600 dark:text-gray-400 pt-1 border-t dark:border-gray-600">
          <span className="font-medium">{t.volume}:</span> {formatNumber(data.volume)}
        </p>
      </div>
    </div>
  );
}

export default ChartTooltip;
