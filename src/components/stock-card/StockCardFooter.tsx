import { memo, useMemo } from 'react';
import type { StockDataPoint } from '../../types/stock';
import type { Language } from '../../i18n/translations';
import type { ColorTheme } from '../ColorThemeSelector';
import type { Translations } from '../../i18n/translations';

interface StockCardFooterProps {
  data: StockDataPoint[];
  language: Language;
  colorTheme: ColorTheme;
  t: Translations;
  priceColor: string;
}

/**
 * Footer component for StockCard
 * Displays average volume information and chart legend
 */
const StockCardFooter = memo(function StockCardFooter({
  data,
  language,
  colorTheme,
  t,
  priceColor
}: StockCardFooterProps) {
  // Calculate average volume
  const averageVolume = useMemo(() => {
    if (data.length === 0) return 'N/A';

    const sum = data.reduce((acc, d) => acc + d.volume, 0);
    const avg = Math.round(sum / data.length);
    return avg.toLocaleString();
  }, [data]);

  return (
    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 pt-1 pb-2 border-t border-gray-200 dark:border-gray-700">
      {/* Average Volume */}
      <div>
        {language === 'zh-TW' ? '平均成交量' : 'Avg Volume'}: {averageVolume}
      </div>

      {/* Chart Legend */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5" style={{ backgroundColor: priceColor }}></div>
          <span>{t.close}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#3b82f6' }}></div>
          <span>{t.ma20}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#a855f7' }}></div>
          <span>{t.ma60}</span>
        </div>
      </div>
    </div>
  );
});

export default StockCardFooter;
