import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { StockData } from '../../types/stock';
import type { Language } from '../../i18n/translations';
import type { ColorTheme } from '../ColorThemeSelector';

interface StockCardHeaderProps {
  stockData: StockData;
  symbol: string;
  language: Language;
  colorTheme: ColorTheme;
}

/**
 * Header component for StockCard
 * Displays company name, current price, and price change
 */
const StockCardHeader = ({
  stockData,
  symbol,
  language,
  colorTheme,
}: StockCardHeaderProps) => {
  // Memoized display name
  const displayName = useMemo(() => {
    if (!stockData.company_name) {
      return stockData.symbol || symbol;
    }

    const companyName = language === 'zh-TW'
      ? stockData.company_name['zh-TW']
      : stockData.company_name['en-US'];

    if (companyName) {
      return `${companyName} (${stockData.symbol})`;
    }

    return stockData.symbol;
  }, [stockData, language, symbol]);

  // Memoized price info
  const priceInfo = useMemo(() => {
    const isPositive = (stockData.change ?? 0) >= 0;
    const upColor = isPositive ? colorTheme.up : colorTheme.down;
    return { isPositive, upColor };
  }, [stockData, colorTheme]);

  return (
    <div className="flex items-start justify-between mb-2 md:mb-3">
      <div className="min-w-0 flex-1">
        <h3
          className="text-base md:text-lg font-bold text-gray-800 dark:text-white truncate"
          title={displayName}
        >
          {displayName}
        </h3>
        <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
          <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            ${stockData.current_price?.toFixed(2) || 'N/A'}
          </span>
          {stockData.change !== null && stockData.change_percent !== null && (
            <div
              className="flex items-center gap-1 text-xs md:text-sm font-medium"
              style={{ color: priceInfo.upColor }}
            >
              {priceInfo.isPositive ? (
                <TrendingUp size={14} className="md:w-4 md:h-4" />
              ) : (
                <TrendingDown size={14} className="md:w-4 md:h-4" />
              )}
              <span className="whitespace-nowrap">
                {priceInfo.isPositive ? '+' : ''}
                {stockData.change.toFixed(2)} ({stockData.change_percent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockCardHeader;
