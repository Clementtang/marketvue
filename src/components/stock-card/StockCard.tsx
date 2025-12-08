import { memo, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useChart } from '../../contexts/ChartContext';
import { useVisualTheme } from '../../contexts/VisualThemeContext';
import { useTranslation } from '../../i18n/translations';
import { useStockData } from './hooks/useStockData';
import StockCardHeader from './StockCardHeader';
import StockCardChart from './StockCardChart';
import StockVolumeChart from './StockVolumeChart';
import StockCardFooter from './StockCardFooter';
import StockCardLoading from './StockCardLoading';
import StockCardError from './StockCardError';

interface StockCardProps {
  symbol: string;
  startDate: string;
  endDate: string;
}

/**
 * StockCard Component
 * Displays stock information including price, charts, and volume data
 *
 * This component has been refactored into smaller sub-components:
 * - StockCardHeader: Company name, price, and change
 * - StockCardChart: Price chart (line or candlestick)
 * - StockVolumeChart: Volume bar chart
 * - StockCardFooter: Average volume display
 * - StockCardLoading: Loading state
 * - StockCardError: Error state with retry
 *
 * Data fetching is handled by the useStockData custom hook.
 */
const StockCard = memo(function StockCard({ symbol, startDate, endDate }: StockCardProps) {
  // Get context values
  const { language, colorTheme } = useApp();
  const { chartType } = useChart();
  const { visualTheme } = useVisualTheme();
  const t = useTranslation(language);

  // Fetch stock data using custom hook
  const { stockData, loading, error, retryCount, handleRetry } = useStockData({
    symbol,
    startDate,
    endDate,
    language,
    t,
  });

  // Calculate price color based on last data point
  const priceColor = useMemo(() => {
    if (!stockData || stockData.data.length < 2) return colorTheme.up;
    const lastClose = stockData.data[stockData.data.length - 1].close;
    const prevClose = stockData.data[stockData.data.length - 2].close;
    return lastClose >= prevClose ? colorTheme.up : colorTheme.down;
  }, [stockData, colorTheme]);

  // Loading state
  if (loading && !stockData) {
    return <StockCardLoading language={language} retryCount={retryCount} />;
  }

  // Error state
  if (error && !stockData) {
    return (
      <StockCardError
        error={error}
        symbol={symbol}
        language={language}
        t={t}
        onRetry={handleRetry}
      />
    );
  }

  // No data state
  if (!stockData || !stockData.data || stockData.data.length === 0) {
    return (
      <StockCardError
        error={null}
        symbol={symbol}
        language={language}
        t={t}
        onRetry={handleRetry}
      />
    );
  }

  // Success state - render stock card with all sub-components
  return (
    <div className={`h-full max-h-[220px] overflow-hidden p-3 flex flex-col transition-all duration-300 ${
      visualTheme === 'warm'
        ? 'bg-white dark:bg-warm-800 rounded-3xl shadow-md hover:shadow-xl border border-warm-200/50 dark:border-warm-700/50'
        : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'
    }`}>
      {/* Header with company name and price */}
      <StockCardHeader
        stockData={stockData}
        symbol={symbol}
        language={language}
        colorTheme={colorTheme}
      />

      {/* Price chart (line or candlestick) */}
      <StockCardChart
        data={stockData.data}
        chartType={chartType}
        colorTheme={colorTheme}
        t={t}
        isVisible={true}
      />

      {/* Volume chart */}
      <StockVolumeChart
        data={stockData.data}
        t={t}
        isVisible={true}
      />

      {/* Footer with average volume and legend */}
      <StockCardFooter
        data={stockData.data}
        language={language}
        t={t}
        priceColor={priceColor}
      />
    </div>
  );
});

export default StockCard;
