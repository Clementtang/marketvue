import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useVisualTheme } from '../contexts/VisualThemeContext';
import type { Language } from '../i18n/translations';

interface PageNavigatorProps {
  totalItems: number;
  language: Language;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

/**
 * PageNavigator Component
 * Displays pagination controls for navigating between pages of stock cards
 * Only shown when there are more than 9 stocks (multiple pages)
 */
const PageNavigator = ({
  totalItems,
  language,
  currentPage,
  setCurrentPage,
  itemsPerPage
}: PageNavigatorProps) => {
  const { visualTheme } = useVisualTheme();

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const pageText = language === 'zh-TW' ? '頁' : 'Page';

  return (
    <div className="flex items-center gap-2">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-8 h-8 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          visualTheme === 'warm'
            ? 'rounded-xl bg-warm-100 hover:bg-warm-200 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-700 dark:text-warm-300 disabled:hover:bg-warm-100 dark:disabled:hover:bg-warm-700'
            : 'rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700'
        }`}
        title={language === 'zh-TW' ? '上一頁' : 'Previous page'}
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Indicator */}
      <div className={`flex items-center gap-1 px-3 py-1.5 ${
        visualTheme === 'warm'
          ? 'rounded-xl bg-warm-100 dark:bg-warm-700'
          : 'rounded-lg bg-gray-100 dark:bg-gray-700'
      }`}>
        <span className={`text-sm font-medium ${
          visualTheme === 'warm'
            ? 'text-warm-700 dark:text-warm-300'
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {pageText} {currentPage} / {totalPages}
        </span>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-8 h-8 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          visualTheme === 'warm'
            ? 'rounded-xl bg-warm-100 hover:bg-warm-200 dark:bg-warm-700 dark:hover:bg-warm-600 text-warm-700 dark:text-warm-300 disabled:hover:bg-warm-100 dark:disabled:hover:bg-warm-700'
            : 'rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700'
        }`}
        title={language === 'zh-TW' ? '下一頁' : 'Next page'}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default PageNavigator;
