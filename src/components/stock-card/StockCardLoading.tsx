import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import type { Language } from '../../i18n/translations';
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
  return (
    <div className="h-full bg-warm-100 dark:bg-warm-800 rounded-card shadow-warm p-6 flex flex-col items-center justify-center transition-colors">
      <Loader2 className="animate-spin text-accent-primary dark:text-accent-secondary mb-3" size={32} />
      <p className="text-warm-600 dark:text-warm-300 text-sm">
        {language === 'zh-TW' ? '載入中...' : 'Loading...'}
      </p>
      {retryCount > 0 && (
        <p className="text-warm-500 dark:text-warm-400 text-xs mt-2">
          {language === 'zh-TW'
            ? `重試中 (${retryCount}/${API_CONFIG.RETRY_COUNT})...`
            : `Retrying (${retryCount}/${API_CONFIG.RETRY_COUNT})...`}
        </p>
      )}
    </div>
  );
});

export default StockCardLoading;
