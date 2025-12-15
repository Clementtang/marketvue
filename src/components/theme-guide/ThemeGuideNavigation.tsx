import { Palette, Type, Square } from 'lucide-react';
import type { Language } from '../../i18n/translations';
import type { VisualTheme } from '../../contexts/VisualThemeContext';

interface ThemeGuideNavigationProps {
  visualTheme: VisualTheme;
  language: Language;
  selectedSection: 'colors' | 'typography' | 'components';
  onSectionChange: (section: 'colors' | 'typography' | 'components') => void;
}

export const ThemeGuideNavigation = ({
  visualTheme,
  language,
  selectedSection,
  onSectionChange,
}: ThemeGuideNavigationProps) => {
  const getButtonClasses = (section: 'colors' | 'typography' | 'components') => {
    const isSelected = selectedSection === section;

    if (isSelected) {
      return visualTheme === 'warm'
        ? 'bg-warm-accent-500 text-white shadow-md'
        : 'bg-blue-600 text-white shadow-md';
    }

    return visualTheme === 'warm'
      ? 'bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-100 hover:bg-warm-200 dark:hover:bg-warm-700'
      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700';
  };

  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={() => onSectionChange('colors')}
        className={`flex items-center gap-2 px-6 py-3 rounded-3xl font-medium transition-all cursor-pointer ${getButtonClasses('colors')}`}
      >
        <Palette size={20} />
        {language === 'zh-TW' ? '色彩' : 'Colors'}
      </button>
      <button
        onClick={() => onSectionChange('typography')}
        className={`flex items-center gap-2 px-6 py-3 rounded-3xl font-medium transition-all cursor-pointer ${getButtonClasses('typography')}`}
      >
        <Type size={20} />
        {language === 'zh-TW' ? '字型' : 'Typography'}
      </button>
      <button
        onClick={() => onSectionChange('components')}
        className={`flex items-center gap-2 px-6 py-3 rounded-3xl font-medium transition-all cursor-pointer ${getButtonClasses('components')}`}
      >
        <Square size={20} />
        {language === 'zh-TW' ? '元件' : 'Components'}
      </button>
    </div>
  );
};
