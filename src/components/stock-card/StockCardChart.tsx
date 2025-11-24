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
import type { StockDataPoint } from '../../types/stock';
import type { ColorTheme } from '../ColorThemeSelector';
import type { Translations } from '../../i18n/translations';
import { CHART_CONFIG } from '../../config/constants';
import CandlestickChart from '../CandlestickChart';
import ChartTooltip from '../common/ChartTooltip';

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
 */
const StockCardChart = memo(function StockCardChart({
  data,
  chartType,
  colorTheme,
  t,
  isVisible,
}: StockCardChartProps) {
  // Memoized price color based on last data point
  const priceColor = useMemo(() => {
    if (data.length < 2) return colorTheme.up;
    const lastClose = data[data.length - 1].close;
    const prevClose = data[data.length - 2].close;
    return lastClose >= prevClose ? colorTheme.up : colorTheme.down;
  }, [data, colorTheme]);

  // Custom tooltip component
  const CustomTooltip = useCallback(
    (props: any) => <ChartTooltip {...props} t={t} showMovingAverages={true} />,
    [t]
  );

  // Date formatter for X axis
  const formatDate = (value: string) => {
    const date = new Date(value);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (!isVisible) return null;

  return (
    <div className="mb-1" style={{ height: `${CHART_CONFIG.CANDLESTICK_HEIGHT}px` }}>
      {chartType === 'line' && (
        <ResponsiveContainer width="100%" height={CHART_CONFIG.CANDLESTICK_HEIGHT}>
          <LineChart data={data}>
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
      {chartType === 'candlestick' && <CandlestickChart data={data} showMA={true} />}
    </div>
  );
});

export default StockCardChart;
