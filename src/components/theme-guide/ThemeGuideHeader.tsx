import { ArrowLeft } from 'lucide-react';
import type { Language } from '../../i18n/translations';
import type { VisualTheme } from '../../contexts/VisualThemeContext';

interface ThemeGuideHeaderProps {
  visualTheme: VisualTheme;
  language: Language;
  onClose: () => void;
}

export const ThemeGuideHeader = ({ visualTheme, language, onClose }: ThemeGuideHeaderProps) => {
  return (
    <header className={`shadow-sm ${
      visualTheme === 'warm'
        ? 'bg-warm-100 dark:bg-warm-800 border-b border-warm-200 dark:border-warm-700'
        : 'bg-white dark:bg-gray-800'
    }`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                visualTheme === 'warm'
                  ? 'hover:bg-warm-200/30 dark:hover:bg-warm-700/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowLeft size={24} className={visualTheme === 'warm' ? 'text-warm-800 dark:text-warm-100' : 'text-gray-800 dark:text-white'} />
            </button>
            <div>
              <h1 className={`text-3xl font-bold ${
                visualTheme === 'warm'
                  ? 'text-warm-800 dark:text-warm-100 font-serif'
                  : 'text-gray-800 dark:text-white'
              }`}>
                {language === 'zh-TW' ? 'Warm Minimal Design 風格指南' : 'Warm Minimal Design Style Guide'}
              </h1>
              <p className={`text-sm mt-1 ${
                visualTheme === 'warm'
                  ? 'text-warm-600 dark:text-warm-400 font-serif'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {language === 'zh-TW' ? '探索溫暖、優雅的設計系統' : 'Explore the warm and elegant design system'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
