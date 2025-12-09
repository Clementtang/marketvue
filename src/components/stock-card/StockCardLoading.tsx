import { memo } from 'react';
import type { Language } from '../../i18n/translations';
import { useVisualTheme } from '../../contexts/VisualThemeContext';
import { API_CONFIG } from '../../config/constants';

interface StockCardLoadingProps {
  language: Language;
  retryCount: number;
}

/**
 * Loading state component for StockCard
 * Shows skeleton screen with shimmer animation
 */
const StockCardLoading = memo(function StockCardLoading({ language, retryCount }: StockCardLoadingProps) {
  const { visualTheme } = useVisualTheme();

  const skeletonClass = visualTheme === 'warm'
    ? 'bg-warm-200 dark:bg-warm-700'
    : 'bg-gray-200 dark:bg-gray-700';

  return (
    <div className={`h-full shadow-sm p-3 flex flex-col transition-all duration-300 ${
      visualTheme === 'warm'
        ? 'bg-warm-100 dark:bg-warm-800 rounded-3xl border border-warm-200/50 dark:border-warm-700/50'
        : 'bg-white dark:bg-gray-800 rounded-lg'
    }`}>
      {/* Header Skeleton - mimics StockCardHeader */}
      <div className="mb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          {/* Left: Company name & symbol placeholders */}
          <div className="flex-1 space-y-1.5">
            <div className={`h-5 w-32 rounded ${skeletonClass} animate-shimmer`} />
            <div className={`h-3 w-20 rounded ${skeletonClass} animate-shimmer`} />
          </div>
          {/* Right: Price & change placeholders */}
          <div className="space-y-1.5">
            <div className={`h-5 w-24 rounded ${skeletonClass} animate-shimmer`} />
            <div className={`h-3 w-20 rounded ml-auto ${skeletonClass} animate-shimmer`} />
          </div>
        </div>
      </div>

      {/* Chart Skeleton - mimics chart area */}
      <div className="flex-1 mb-3 relative">
        <div className={`h-full w-full rounded ${skeletonClass} animate-shimmer`} />
      </div>

      {/* Footer Skeleton - mimics legend/statistics */}
      <div className="space-y-2">
        <div className="flex gap-3">
          <div className={`h-3 w-16 rounded ${skeletonClass} animate-shimmer`} />
          <div className={`h-3 w-16 rounded ${skeletonClass} animate-shimmer`} />
          <div className={`h-3 w-16 rounded ${skeletonClass} animate-shimmer`} />
        </div>
        {retryCount > 0 && (
          <p className="text-gray-500 dark:text-gray-500 text-xs text-center mt-2">
            {language === 'zh-TW'
              ? `重試中 (${retryCount}/${API_CONFIG.RETRY_COUNT})...`
              : `Retrying (${retryCount}/${API_CONFIG.RETRY_COUNT})...`}
          </p>
        )}
      </div>
    </div>
  );
});

export default StockCardLoading;
