import { memo, useCallback, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, CandlestickChart as CandlestickIcon } from 'lucide-react';
import type { StockDataPoint } from '../../types/stock';
import type { ColorTheme } from '../ColorThemeSelector';
import type { Translations } from '../../i18n/translations';
import { CHART_CONFIG } from '../../config/constants';
import CandlestickChart from '../CandlestickChart';
import ChartTooltip from '../common/ChartTooltip';
import { smartAggregateStockData, type TimeInterval } from '../../utils/dateAggregation';
import { useChart } from '../../contexts/ChartContext';

interface StockCardChartProps {
  data: StockDataPoint[];
  chartType: 'line' | 'candlestick';
  colorTheme: ColorTheme;
  t: Translations;
  isVisible: boolean;
}

/**
 * Chart component for StockCard
 * Renders either line chart or candlestick chart based on chartType
 *
 * Features:
 * - Smart date aggregation (daily/weekly/monthly based on data length)
 * - Chart type toggle button in top-right corner
 */
const StockCardChart = memo(function StockCardChart({
  data,
  chartType,
  colorTheme,
  t,
  isVisible,
}: StockCardChartProps) {
  const { setChartType } = useChart();

  // Smart aggregation based on data length
  const { data: aggregatedData, interval } = useMemo(() => {
    return smartAggregateStockData(data);
  }, [data]);

  // Memoized price color based on last data point
  const priceColor = useMemo(() => {
    if (aggregatedData.length < 2) return colorTheme.up;
    const lastClose = aggregatedData[aggregatedData.length - 1].close;
    const prevClose = aggregatedData[aggregatedData.length - 2].close;
    return lastClose >= prevClose ? colorTheme.up : colorTheme.down;
  }, [aggregatedData, colorTheme]);

  // Custom tooltip component
  const CustomTooltip = useCallback(
    (props: any) => <ChartTooltip {...props} t={t} showMovingAverages={true} />,
    [t]
  );

  // Date formatter for X axis (adapts to time interval)
  const formatDate = useCallback((value: string) => {
    const date = new Date(value);
    if (interval === 'monthly') {
      // Show month/year for monthly data
      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
    } else if (interval === 'weekly') {
      // Show month/day for weekly data
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      // Daily data
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  }, [interval]);

  // Toggle chart type
  const handleToggleChartType = useCallback(() => {
    const newType = chartType === 'line' ? 'candlestick' : 'line';
    setChartType(newType);
  }, [chartType, setChartType]);

  // Get interval label for display
  const getIntervalLabel = (interval: TimeInterval): string => {
    switch (interval) {
      case 'daily':
        return t.daily || 'Daily';
      case 'weekly':
        return t.weekly || 'Weekly';
      case 'monthly':
        return t.monthly || 'Monthly';
      default:
        return '';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="relative mb-1" style={{ height: `${CHART_CONFIG.CANDLESTICK_HEIGHT}px` }}>
      {/* Chart Type Toggle Button - Top Right Corner */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        {/* Time Interval Badge */}
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
          {getIntervalLabel(interval)}
        </span>

        {/* Chart Type Toggle Button */}
        <button
          onClick={handleToggleChartType}
          className="p-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded shadow-sm border border-gray-200 dark:border-gray-600 transition-colors"
          title={chartType === 'line' ? t.switchToCandlestickChart : t.switchToLineChart}
        >
          {chartType === 'line' ? (
            <CandlestickIcon size={16} />
          ) : (
            <BarChart3 size={16} />
          )}
        </button>
      </div>

      {chartType === 'line' && (
        <ResponsiveContainer width="100%" height={CHART_CONFIG.CANDLESTICK_HEIGHT}>
          <LineChart data={aggregatedData}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatDate} />
            <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50 }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} iconSize={10} />
            <Line
              type="monotone"
              dataKey="close"
              stroke={priceColor}
              strokeWidth={2}
              dot={false}
              name={t.close}
            />
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
              name={t.ma20}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="ma60"
              stroke="#a855f7"
              strokeWidth={1.5}
              dot={false}
              name={t.ma60}
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      {chartType === 'candlestick' && <CandlestickChart data={aggregatedData} showMA={true} />}
    </div>
  );
});

export default StockCardChart;
