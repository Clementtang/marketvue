import { memo, useCallback, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { StockDataPoint } from '../../types/stock';
import type { ColorTheme } from '../ColorThemeSelector';
import type { Translations } from '../../i18n/translations';
import { CHART_CONFIG } from '../../config/constants';
import CandlestickChart from '../CandlestickChart';
import ChartTooltip from '../common/ChartTooltip';
import { smartAggregateStockData } from '../../utils/dateAggregation';

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
  // Different formats help users naturally understand the time scale
  const formatDate = useCallback((value: string) => {
    const date = new Date(value);
    if (interval === 'monthly') {
      // Monthly: Show "Jan'24" format for clarity
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]}'${date.getFullYear().toString().slice(2)}`;
    } else if (interval === 'weekly') {
      // Weekly: Show "1/15" (month/day) format
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else {
      // Daily: Show "1/15" (month/day) format
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  }, [interval]);

  if (!isVisible) return null;

  return (
    <div className="relative" style={{ height: `${CHART_CONFIG.CANDLESTICK_HEIGHT}px` }}>
      {chartType === 'line' && (
        <ResponsiveContainer width="100%" height={CHART_CONFIG.CANDLESTICK_HEIGHT}>
          <LineChart data={aggregatedData} margin={CHART_CONFIG.MARGINS}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatDate} />
            <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 50 }}
            />
            {/* Legend removed - now shown in footer */}
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
