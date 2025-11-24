import { memo, useMemo } from 'react';
import type { StockDataPoint } from '../../types/stock';
import type { Language } from '../../i18n/translations';

interface StockCardFooterProps {
  data: StockDataPoint[];
  language: Language;
}

/**
 * Footer component for StockCard
 * Displays average volume information
 */
const StockCardFooter = memo(function StockCardFooter({ data, language }: StockCardFooterProps) {
  // Calculate average volume
  const averageVolume = useMemo(() => {
    if (data.length === 0) return 'N/A';

    const sum = data.reduce((acc, d) => acc + d.volume, 0);
    const avg = Math.round(sum / data.length);
    return avg.toLocaleString();
  }, [data]);

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pt-1 pb-2 border-t border-gray-200 dark:border-gray-700">
      {language === 'zh-TW' ? '平均成交量' : 'Avg Volume'}: {averageVolume}
    </div>
  );
});

export default StockCardFooter;
