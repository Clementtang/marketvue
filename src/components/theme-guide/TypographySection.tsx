import type { Language } from '../../i18n/translations';
import type { VisualTheme } from '../../contexts/VisualThemeContext';

interface TypographySectionProps {
  visualTheme: VisualTheme;
  language: Language;
}

export const TypographySection = ({ visualTheme, language }: TypographySectionProps) => {
  return (
    <div className="space-y-8">
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
          {language === 'zh-TW' ? '字體系統' : 'Font System'}
        </h2>

        {/* Serif Font */}
        <div className="mb-8">
          <h3 className={`text-xl font-semibold mb-4 font-serif ${
            visualTheme === 'warm'
              ? 'text-warm-800 dark:text-warm-100'
              : 'text-gray-800 dark:text-white'
          }`}>
            Playfair Display (Serif)
          </h3>
          <p className={`text-sm mb-4 ${
            visualTheme === 'warm'
              ? 'text-warm-600 dark:text-warm-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {language === 'zh-TW'
              ? '用於標題和重要文字，營造優雅、專業的氛圍。'
              : 'Used for headings and important text to create an elegant, professional atmosphere.'}
          </p>
          <div className="space-y-3">
            <p className={`text-4xl font-serif font-bold ${
              visualTheme === 'warm'
                ? 'text-warm-800 dark:text-warm-100'
                : 'text-gray-800 dark:text-white'
            }`}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className={`text-2xl font-serif ${
              visualTheme === 'warm'
                ? 'text-warm-700 dark:text-warm-200'
                : 'text-gray-700 dark:text-gray-200'
            }`}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>

        {/* Sans Font */}
        <div>
          <h3 className={`text-xl font-semibold mb-4 ${
            visualTheme === 'warm'
              ? 'text-warm-800 dark:text-warm-100'
              : 'text-gray-800 dark:text-white'
          }`}>
            Inter (Sans-serif)
          </h3>
          <p className={`text-sm mb-4 ${
            visualTheme === 'warm'
              ? 'text-warm-600 dark:text-warm-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {language === 'zh-TW'
              ? '用於內文和資料顯示，確保清晰易讀。'
              : 'Used for body text and data display, ensuring clarity and readability.'}
          </p>
          <div className="space-y-3">
            <p className={`text-lg font-semibold ${
              visualTheme === 'warm'
                ? 'text-warm-800 dark:text-warm-100'
                : 'text-gray-800 dark:text-white'
            }`}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className={`text-base ${
              visualTheme === 'warm'
                ? 'text-warm-700 dark:text-warm-200'
                : 'text-gray-700 dark:text-gray-200'
            }`}>
              The quick brown fox jumps over the lazy dog
            </p>
            <p className={`text-sm ${
              visualTheme === 'warm'
                ? 'text-warm-600 dark:text-warm-300'
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
