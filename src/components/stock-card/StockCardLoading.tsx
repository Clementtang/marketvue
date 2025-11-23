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
const StockCardLoading = ({ language, retryCount }: StockCardLoadingProps) => {
  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center transition-colors">
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
};

export default StockCardLoading;
