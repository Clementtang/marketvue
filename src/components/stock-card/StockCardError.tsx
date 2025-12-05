import { memo } from 'react';
import type { Language, Translations } from '../../i18n/translations';

interface StockCardErrorProps {
  error: string | null;
  symbol: string;
  language: Language;
  t: Translations;
  onRetry: () => void;
}

/**
 * Error state component for StockCard
 * Shows error message and retry button
 */
const StockCardError = memo(function StockCardError({
  error,
  symbol,
  language,
  t,
  onRetry,
}: StockCardErrorProps) {
  return (
    <div className="h-full bg-warm-100 dark:bg-warm-800 rounded-card shadow-warm p-6 flex flex-col items-center justify-center transition-colors">
      <div className="text-red-500 dark:text-red-400 mb-2">
        <svg
          className="w-12 h-12 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-red-500 dark:text-red-400 text-center mb-2 font-medium">
        {error || t.noDataAvailable}
      </p>
      <p className="text-warm-500 dark:text-warm-400 text-sm mb-4">{symbol}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-accent-primary hover:bg-accent-hover dark:bg-accent-secondary dark:hover:bg-accent-hover text-white text-sm rounded-lg transition-colors"
      >
        {language === 'zh-TW' ? '重新載入' : 'Retry'}
      </button>
    </div>
  );
});

export default StockCardError;
