import { memo, useCallback } from 'react';
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
const StockVolumeChart = memo(function StockVolumeChart({ data, t, isVisible }: StockVolumeChartProps) {
  // Custom tooltip component with forced upward positioning
  const CustomTooltip = useCallback(
    (props: any) => {
      // Force tooltip to appear above the cursor
      const wrapperStyle: React.CSSProperties = {
        transform: 'translateY(-100%)',
        marginTop: '-10px'
      };

      return (
        <div style={wrapperStyle}>
          <ChartTooltip {...props} t={t} showMovingAverages={false} />
        </div>
      );
    },
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
    <div style={{ height: `${CHART_CONFIG.VOLUME_HEIGHT}px` }}>
      <ResponsiveContainer width="100%" height={CHART_CONFIG.VOLUME_HEIGHT}>
        <BarChart data={data} margin={CHART_CONFIG.MARGINS}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatDate} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatVolume} />
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ zIndex: 50 }}
            cursor={{ fill: 'rgba(148, 163, 184, 0.2)' }}
            isAnimationActive={false}
          />
          <Bar dataKey="volume" fill="#94a3b8" name={t.volume} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default StockVolumeChart;
