import type { Language } from '../../i18n/translations';
import type { VisualTheme } from '../../contexts/VisualThemeContext';

interface ColorsSectionProps {
  visualTheme: VisualTheme;
  language: Language;
}

const warmColors = [
  { name: 'warm-50', hex: '#FBF9F6', class: 'bg-warm-50' },
  { name: 'warm-100', hex: '#F7F3ED', class: 'bg-warm-100' },
  { name: 'warm-200', hex: '#F0EBE3', class: 'bg-warm-200' },
  { name: 'warm-300', hex: '#E8E0D5', class: 'bg-warm-300' },
  { name: 'warm-400', hex: '#D4C9BA', class: 'bg-warm-400' },
  { name: 'warm-500', hex: '#B8AA96', class: 'bg-warm-500' },
  { name: 'warm-600', hex: '#9B8B76', class: 'bg-warm-600' },
  { name: 'warm-700', hex: '#6B5D4F', class: 'bg-warm-700' },
  { name: 'warm-800', hex: '#4A4036', class: 'bg-warm-800' },
  { name: 'warm-900', hex: '#2F2B26', class: 'bg-warm-900' },
];

const accentColors = [
  { name: 'warm-accent-50', hex: '#FFF4E6', class: 'bg-warm-accent-50' },
  { name: 'warm-accent-100', hex: '#FFE8CC', class: 'bg-warm-accent-100' },
  { name: 'warm-accent-200', hex: '#FFD699', class: 'bg-warm-accent-200' },
  { name: 'warm-accent-300', hex: '#FFBB66', class: 'bg-warm-accent-300' },
  { name: 'warm-accent-400', hex: '#E88433', class: 'bg-warm-accent-400' },
  { name: 'warm-accent-500', hex: '#CC6A28', class: 'bg-warm-accent-500' },
  { name: 'warm-accent-600', hex: '#A65420', class: 'bg-warm-accent-600' },
  { name: 'warm-accent-700', hex: '#804018', class: 'bg-warm-accent-700' },
  { name: 'warm-accent-800', hex: '#5C2D10', class: 'bg-warm-accent-800' },
  { name: 'warm-accent-900', hex: '#3D2408', class: 'bg-warm-accent-900' },
];

export const ColorsSection = ({ visualTheme, language }: ColorsSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Warm Colors */}
      <section className={`p-8 transition-all ${
        visualTheme === 'warm'
          ? 'bg-white dark:bg-warm-800 rounded-3xl shadow-md border border-warm-200/50 dark:border-warm-700/50'
          : 'bg-white dark:bg-gray-800 rounded-lg shadow'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 ${
          visualTheme === 'warm'
            ? 'text-warm-800 dark:text-warm-100 font-serif'
            : 'text-gray-800 dark:text-white'
        }`}>
          {language === 'zh-TW' ? '主色系 (Warm)' : 'Primary Colors (Warm)'}
        </h2>
        <p className={`text-sm mb-6 ${
          visualTheme === 'warm'
            ? 'text-warm-600 dark:text-warm-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {language === 'zh-TW'
            ? '溫暖的中性色調，用於背景、文字和邊框。'
            : 'Warm neutral tones for backgrounds, text, and borders.'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {warmColors.map((color) => (
            <div key={color.name} className="space-y-2">
              <div className={`${color.class} h-24 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm`} />
              <div className="text-sm">
                <p className={`font-mono font-semibold ${
                  visualTheme === 'warm'
                    ? 'text-warm-800 dark:text-warm-100'
                    : 'text-gray-800 dark:text-white'
                }`}>
                  {color.name}
                </p>
                <p className={`font-mono text-xs ${
                  visualTheme === 'warm'
                    ? 'text-warm-600 dark:text-warm-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {color.hex}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Accent Colors */}
      <section className={`p-8 transition-all ${
        visualTheme === 'warm'
          ? 'bg-white dark:bg-warm-800 rounded-3xl shadow-md border border-warm-200/50 dark:border-warm-700/50'
          : 'bg-white dark:bg-gray-800 rounded-lg shadow'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 ${
          visualTheme === 'warm'
            ? 'text-warm-800 dark:text-warm-100 font-serif'
            : 'text-gray-800 dark:text-white'
        }`}>
          {language === 'zh-TW' ? '強調色 (Warm Accent)' : 'Accent Colors (Warm Accent)'}
        </h2>
        <p className={`text-sm mb-6 ${
          visualTheme === 'warm'
            ? 'text-warm-600 dark:text-warm-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {language === 'zh-TW'
            ? '陶土色與焦糖色調，用於按鈕、標籤和強調元素。'
            : 'Terracotta and caramel tones for buttons, badges, and emphasis.'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {accentColors.map((color) => (
            <div key={color.name} className="space-y-2">
              <div className={`${color.class} h-24 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm`} />
              <div className="text-sm">
                <p className={`font-mono font-semibold ${
                  visualTheme === 'warm'
                    ? 'text-warm-800 dark:text-warm-100'
                    : 'text-gray-800 dark:text-white'
                }`}>
                  {color.name}
                </p>
                <p className={`font-mono text-xs ${
                  visualTheme === 'warm'
                    ? 'text-warm-600 dark:text-warm-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {color.hex}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
