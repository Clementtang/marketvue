import { memo, useMemo } from 'react';
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
const StockCardHeader = memo(function StockCardHeader({
  stockData,
  symbol,
  language,
  colorTheme,
}: StockCardHeaderProps) {
  // Determine if this is a Taiwan or Japan stock (ends with .TW, .TWO, or .T)
  const isAsianStock = useMemo(() => {
    return stockData.symbol.endsWith('.TW') ||
           stockData.symbol.endsWith('.TWO') ||
           stockData.symbol.endsWith('.T');
  }, [stockData.symbol]);

  // Memoized display name (company name only, without symbol)
  const displayName = useMemo(() => {
    if (!stockData.company_name) {
      return stockData.symbol || symbol;
    }

    const companyName = language === 'zh-TW'
      ? stockData.company_name['zh-TW']
      : stockData.company_name['en-US'];

    return companyName || stockData.symbol;
  }, [stockData, language, symbol]);

  // Memoized price info
  const priceInfo = useMemo(() => {
    const isPositive = (stockData.change ?? 0) >= 0;
    const upColor = isPositive ? colorTheme.up : colorTheme.down;
    return { isPositive, upColor };
  }, [stockData, colorTheme]);

  // Get currency code based on symbol
  const getCurrency = (symbol: string): string => {
    if (symbol.endsWith('.TW') || symbol.endsWith('.TWO')) return 'TWD';
    if (symbol.endsWith('.T')) return 'JPY';
    if (symbol.endsWith('.HK')) return 'HKD';
    return 'USD'; // Default for US stocks and others
  };

  // Format price with thousand separators
  const formatPrice = (price: number, currency: string): string => {
    if (currency === 'JPY') {
      // Japanese Yen: no decimals, with thousand separators
      return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    // Others: 2 decimals, with thousand separators
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const currency = getCurrency(stockData.symbol);
  const formattedPrice = stockData.current_price
    ? formatPrice(stockData.current_price, currency)
    : 'N/A';

  return (
    <div className="flex items-start justify-between mb-1.5 gap-2">
      {/* Left: Symbol/Company Name (different order based on stock type) */}
      <div className="flex flex-col justify-start min-w-0 overflow-hidden">
        {isAsianStock ? (
          // Taiwan/Japan stock: Company name (top), Symbol (bottom, no parentheses)
          <>
            <h3
              className="text-base font-bold text-gray-800 dark:text-white truncate leading-tight"
              title={displayName}
            >
              {displayName}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {stockData.symbol}
            </span>
          </>
        ) : (
          // US/Other stock: Symbol (top), Company name (bottom)
          <>
            <h3
              className="text-base font-bold text-gray-800 dark:text-white whitespace-nowrap leading-tight"
              title={stockData.symbol}
            >
              {stockData.symbol}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate" title={displayName}>
              {displayName}
            </span>
          </>
        )}
      </div>

      {/* Right: Price (top), Change (bottom) */}
      <div className="flex flex-col items-end justify-start flex-shrink-0">
        <div className="flex items-baseline gap-1">
          <span className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap leading-tight">
            {formattedPrice}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
            {currency}
          </span>
        </div>
        {stockData.change !== null && stockData.change_percent !== null && (
          <div
            className="flex items-center gap-0.5 text-xs font-medium whitespace-nowrap"
            style={{ color: priceInfo.upColor }}
          >
            {priceInfo.isPositive ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span>
              {priceInfo.isPositive ? '+' : ''}
              {formatPrice(Math.abs(stockData.change), currency)} ({stockData.change_percent.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default StockCardHeader;
