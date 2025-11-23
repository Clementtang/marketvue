import { useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { StockDataPoint } from '../../types/stock';
import type { Translations } from '../../i18n/translations';
import { CHART_CONFIG } from '../../config/constants';
import ChartTooltip from '../common/ChartTooltip';

interface StockVolumeChartProps {
  data: StockDataPoint[];
  t: Translations;
  isVisible: boolean;
}

/**
 * Volume chart component for StockCard
 * Displays trading volume as a bar chart
 */
const StockVolumeChart = ({ data, t, isVisible }: StockVolumeChartProps) => {
  // Custom tooltip component
  const CustomTooltip = useCallback(
    (props: any) => <ChartTooltip {...props} t={t} showMovingAverages={false} />,
    [t]
  );

  // Date formatter for X axis
  const formatDate = (value: string) => {
    const date = new Date(value);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Volume formatter for Y axis
  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return String(value);
  };

  if (!isVisible) return null;

  return (
    <div className="mb-1" style={{ height: `${CHART_CONFIG.VOLUME_HEIGHT}px` }}>
      <ResponsiveContainer width="100%" height={CHART_CONFIG.VOLUME_HEIGHT}>
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatDate} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatVolume} />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50 }} />
          <Bar dataKey="volume" fill="#94a3b8" name={t.volume} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockVolumeChart;
