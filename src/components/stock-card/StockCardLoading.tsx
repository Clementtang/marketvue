import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import type { Language } from '../../i18n/translations';
import { useVisualTheme } from '../../contexts/VisualThemeContext';
import { API_CONFIG } from '../../config/constants';

interface StockCardLoadingProps {
  language: Language;
  retryCount: number;
}

/**
 * Loading state component for StockCard
 * Shows spinner and retry count if applicable
 */
const StockCardLoading = memo(function StockCardLoading({ language, retryCount }: StockCardLoadingProps) {
  const { visualTheme } = useVisualTheme();
  return (
    <div className={`h-full shadow-sm p-6 flex flex-col items-center justify-center transition-all duration-300 ${
      visualTheme === 'warm'
        ? 'bg-warm-100 dark:bg-warm-800 rounded-3xl border border-warm-200/50 dark:border-warm-700/50'
        : 'bg-white dark:bg-gray-800 rounded-lg'
    }`}>
      <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 mb-3" size={32} />
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {language === 'zh-TW' ? '載入中...' : 'Loading...'}
      </p>
      {retryCount > 0 && (
        <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
          {language === 'zh-TW'
            ? `重試中 (${retryCount}/${API_CONFIG.RETRY_COUNT})...`
            : `Retrying (${retryCount}/${API_CONFIG.RETRY_COUNT})...`}
        </p>
      )}
    </div>
  );
});

export default StockCardLoading;
