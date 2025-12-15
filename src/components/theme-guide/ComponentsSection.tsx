import { Sparkles } from 'lucide-react';
import type { Language } from '../../i18n/translations';
import type { VisualTheme } from '../../contexts/VisualThemeContext';

interface ComponentsSectionProps {
  visualTheme: VisualTheme;
  language: Language;
}

export const ComponentsSection = ({ visualTheme, language }: ComponentsSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Buttons */}
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
          {language === 'zh-TW' ? '按鈕' : 'Buttons'}
        </h2>
        <div className="flex flex-wrap gap-4">
          <button className={`px-6 py-3 rounded-3xl font-medium transition-all shadow-md hover:shadow-xl cursor-pointer ${
            visualTheme === 'warm'
              ? 'bg-warm-accent-500 hover:bg-warm-accent-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
            {language === 'zh-TW' ? '主要按鈕' : 'Primary Button'}
          </button>
          <button className={`px-6 py-3 rounded-3xl font-medium transition-all cursor-pointer ${
            visualTheme === 'warm'
              ? 'bg-warm-100 hover:bg-warm-200 text-warm-800 dark:bg-warm-700 dark:hover:bg-warm-600 dark:text-warm-100'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
          }`}>
            {language === 'zh-TW' ? '次要按鈕' : 'Secondary Button'}
          </button>
          <button className={`px-6 py-3 rounded-3xl font-medium transition-all border-2 cursor-pointer ${
            visualTheme === 'warm'
              ? 'border-warm-accent-400 text-warm-accent-600 hover:bg-warm-accent-50 dark:border-warm-accent-600 dark:text-warm-accent-400 dark:hover:bg-warm-accent-900/20'
              : 'border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20'
          }`}>
            {language === 'zh-TW' ? '外框按鈕' : 'Outline Button'}
          </button>
        </div>
      </section>

      {/* Cards */}
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
          {language === 'zh-TW' ? '卡片' : 'Cards'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 transition-all ${
            visualTheme === 'warm'
              ? 'bg-warm-100 dark:bg-warm-700 rounded-3xl border border-warm-200/50 dark:border-warm-600/50'
              : 'bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              visualTheme === 'warm'
                ? 'text-warm-800 dark:text-warm-100 font-serif'
                : 'text-gray-800 dark:text-white'
            }`}>
              {language === 'zh-TW' ? '標準卡片' : 'Standard Card'}
            </h3>
            <p className={`text-sm ${
              visualTheme === 'warm'
                ? 'text-warm-600 dark:text-warm-300'
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {language === 'zh-TW'
                ? '使用大圓角和柔和的邊框，營造溫暖感。'
                : 'Uses large rounded corners and soft borders for warmth.'}
            </p>
          </div>
          <div className={`p-6 transition-all shadow-md hover:shadow-xl ${
            visualTheme === 'warm'
              ? 'bg-white dark:bg-warm-800 rounded-3xl border border-warm-200/50 dark:border-warm-700/50'
              : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              visualTheme === 'warm'
                ? 'text-warm-800 dark:text-warm-100 font-serif'
                : 'text-gray-800 dark:text-white'
            }`}>
              {language === 'zh-TW' ? '白色卡片' : 'White Card'}
            </h3>
            <p className={`text-sm ${
              visualTheme === 'warm'
                ? 'text-warm-600 dark:text-warm-300'
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {language === 'zh-TW'
                ? '白色背景配上增強的陰影效果，提供良好對比。'
                : 'White background with enhanced shadow for good contrast.'}
            </p>
          </div>
        </div>
      </section>

      {/* Badges */}
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
          {language === 'zh-TW' ? '標籤' : 'Badges'}
        </h2>
        <div className="flex flex-wrap gap-3">
          <span className={`px-4 py-2 rounded-full font-medium text-sm border ${
            visualTheme === 'warm'
              ? 'bg-warm-accent-50 dark:bg-warm-accent-900/30 text-warm-accent-700 dark:text-warm-accent-300 border-warm-accent-200 dark:border-warm-accent-700'
              : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
          }`}>
            {language === 'zh-TW' ? '強調標籤' : 'Accent Badge'}
          </span>
          <span className={`px-4 py-2 rounded-full font-medium text-sm border ${
            visualTheme === 'warm'
              ? 'bg-warm-200 dark:bg-warm-700 text-warm-800 dark:text-warm-100 border-warm-300 dark:border-warm-600'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600'
          }`}>
            {language === 'zh-TW' ? '中性標籤' : 'Neutral Badge'}
          </span>
        </div>
      </section>

      {/* Design Principles */}
      <section className={`p-8 transition-all ${
        visualTheme === 'warm'
          ? 'bg-warm-accent-50 dark:bg-warm-accent-900/20 rounded-3xl border border-warm-accent-200/50 dark:border-warm-accent-700/50'
          : 'bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700'
      }`}>
        <div className="flex items-start gap-4">
          <Sparkles size={32} className={visualTheme === 'warm' ? 'text-warm-accent-500' : 'text-blue-600'} />
          <div>
            <h2 className={`text-2xl font-bold mb-4 ${
              visualTheme === 'warm'
                ? 'text-warm-800 dark:text-warm-100 font-serif'
                : 'text-gray-800 dark:text-white'
            }`}>
              {language === 'zh-TW' ? '設計原則' : 'Design Principles'}
            </h2>
            <ul className={`space-y-3 ${
              visualTheme === 'warm'
                ? 'text-warm-700 dark:text-warm-200'
                : 'text-gray-700 dark:text-gray-200'
            }`}>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  <strong>{language === 'zh-TW' ? '溫暖的色調：' : 'Warm Tones: '}</strong>
                  {language === 'zh-TW'
                    ? '使用米色、駝色和陶土色營造舒適、親和的氛圍。'
                    : 'Use beige, taupe, and terracotta to create a comfortable, approachable atmosphere.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  <strong>{language === 'zh-TW' ? '大圓角：' : 'Large Rounded Corners: '}</strong>
                  {language === 'zh-TW'
                    ? '使用 rounded-3xl (1.5rem) 創造柔和、優雅的視覺效果。'
                    : 'Use rounded-3xl (1.5rem) for soft, elegant visual effects.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  <strong>{language === 'zh-TW' ? 'Serif 字體：' : 'Serif Typography: '}</strong>
                  {language === 'zh-TW'
                    ? '在標題和重要文字使用 Playfair Display，增添專業與優雅。'
                    : 'Use Playfair Display for headings and important text to add professionalism and elegance.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  <strong>{language === 'zh-TW' ? '增強陰影：' : 'Enhanced Shadows: '}</strong>
                  {language === 'zh-TW'
                    ? '使用柔和的陰影 (shadow-md, shadow-xl) 創造深度和層次。'
                    : 'Use soft shadows (shadow-md, shadow-xl) to create depth and hierarchy.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>
                  <strong>{language === 'zh-TW' ? '柔和邊框：' : 'Soft Borders: '}</strong>
                  {language === 'zh-TW'
                    ? '使用半透明邊框 (border-warm-200/50) 保持清晰但不突兀。'
                    : 'Use semi-transparent borders (border-warm-200/50) for clarity without harshness.'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
