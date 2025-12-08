import { useState } from 'react';
import { Palette, Type, Square, Sparkles, ArrowLeft } from 'lucide-react';
import { useVisualTheme } from '../contexts/VisualThemeContext';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../i18n/translations';

interface ThemeGuideProps {
  onClose: () => void;
}

const ThemeGuide = ({ onClose }: ThemeGuideProps) => {
  const { visualTheme } = useVisualTheme();
  const { language } = useApp();
  const t = useTranslation(language);
  const [selectedSection, setSelectedSection] = useState<'colors' | 'typography' | 'components'>('colors');

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

  return (
    <div className={`min-h-screen transition-colors ${
      visualTheme === 'warm'
        ? 'bg-warm-50 dark:bg-warm-900'
        : 'bg-gray-50 dark:bg-gray-900'
    }`}>
      {/* Header */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedSection('colors')}
            className={`flex items-center gap-2 px-6 py-3 rounded-3xl font-medium transition-all cursor-pointer ${
              selectedSection === 'colors'
                ? visualTheme === 'warm'
                  ? 'bg-warm-accent-500 text-white shadow-md'
                  : 'bg-blue-600 text-white shadow-md'
                : visualTheme === 'warm'
                  ? 'bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-100 hover:bg-warm-200 dark:hover:bg-warm-700'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Palette size={20} />
            {language === 'zh-TW' ? '色彩' : 'Colors'}
          </button>
          <button
            onClick={() => setSelectedSection('typography')}
            className={`flex items-center gap-2 px-6 py-3 rounded-3xl font-medium transition-all cursor-pointer ${
              selectedSection === 'typography'
                ? visualTheme === 'warm'
                  ? 'bg-warm-accent-500 text-white shadow-md'
                  : 'bg-blue-600 text-white shadow-md'
                : visualTheme === 'warm'
                  ? 'bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-100 hover:bg-warm-200 dark:hover:bg-warm-700'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Type size={20} />
            {language === 'zh-TW' ? '字型' : 'Typography'}
          </button>
          <button
            onClick={() => setSelectedSection('components')}
            className={`flex items-center gap-2 px-6 py-3 rounded-3xl font-medium transition-all cursor-pointer ${
              selectedSection === 'components'
                ? visualTheme === 'warm'
                  ? 'bg-warm-accent-500 text-white shadow-md'
                  : 'bg-blue-600 text-white shadow-md'
                : visualTheme === 'warm'
                  ? 'bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-100 hover:bg-warm-200 dark:hover:bg-warm-700'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Square size={20} />
            {language === 'zh-TW' ? '元件' : 'Components'}
          </button>
        </div>

        {/* Colors Section */}
        {selectedSection === 'colors' && (
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
        )}

        {/* Typography Section */}
        {selectedSection === 'typography' && (
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
        )}

        {/* Components Section */}
        {selectedSection === 'components' && (
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
        )}
      </main>
    </div>
  );
};

export default ThemeGuide;
