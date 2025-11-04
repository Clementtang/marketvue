import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import StockManager from './components/StockManager';
import TimeRangeSelector from './components/TimeRangeSelector';
import type { DateRange } from './components/TimeRangeSelector';
import DashboardGrid from './components/DashboardGrid';
import ThemeSettings from './components/ThemeSettings';
import type { ThemeMode } from './components/ThemeSettings';
import NotificationBanner from './components/NotificationBanner';
import Footer from './components/Footer';
import { COLOR_THEMES } from './components/ColorThemeSelector';
import type { ColorTheme } from './components/ColorThemeSelector';
import { useTranslation, type Language } from './i18n/translations';
import { TrendingUp } from 'lucide-react';

function App() {
  const [stocks, setStocks] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    preset: '1m',
  });
  const [colorTheme, setColorTheme] = useState<ColorTheme>(COLOR_THEMES[1]); // Default to Western style
  const [themeMode, setThemeMode] = useState<ThemeMode>('system'); // Default to system
  const [language, setLanguage] = useState<Language>('en-US'); // Default to English
  const [isInitialized, setIsInitialized] = useState(false);

  // Get translations
  const t = useTranslation(language);

  // Load stocks, color theme, theme mode, and date range from localStorage
  useEffect(() => {
    const savedStocks = localStorage.getItem('tracked-stocks');
    if (savedStocks) {
      try {
        setStocks(JSON.parse(savedStocks));
      } catch (e) {
        console.error('Failed to load saved stocks:', e);
      }
    }

    const savedColorTheme = localStorage.getItem('color-theme');
    if (savedColorTheme) {
      try {
        setColorTheme(JSON.parse(savedColorTheme));
      } catch (e) {
        console.error('Failed to load saved color theme:', e);
      }
    }

    const savedThemeMode = localStorage.getItem('theme-mode');
    if (savedThemeMode) {
      try {
        setThemeMode(savedThemeMode as ThemeMode);
      } catch (e) {
        console.error('Failed to load saved theme mode:', e);
      }
    }

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      try {
        setLanguage(savedLanguage as Language);
      } catch (e) {
        console.error('Failed to load saved language:', e);
      }
    }

    const savedDateRange = localStorage.getItem('date-range');
    if (savedDateRange) {
      try {
        setDateRange(JSON.parse(savedDateRange));
      } catch (e) {
        console.error('Failed to load saved date range:', e);
      }
    }

    // Mark as initialized
    setIsInitialized(true);
  }, []);

  // Save stocks to localStorage (skip initial render)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('tracked-stocks', JSON.stringify(stocks));
    }
  }, [stocks, isInitialized]);

  // Apply dark mode based on theme mode
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (themeMode === 'dark') {
      applyTheme(true);
    } else if (themeMode === 'light') {
      applyTheme(false);
    } else {
      // System mode
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  const handleAddStock = (symbol: string) => {
    setStocks((prev) => [...prev, symbol]);
  };

  const handleRemoveStock = (symbol: string) => {
    setStocks((prev) => prev.filter((s) => s !== symbol));
  };

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
    localStorage.setItem('date-range', JSON.stringify(range));
  };

  const handleColorThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme);
    localStorage.setItem('color-theme', JSON.stringify(theme));
  };

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('theme-mode', mode);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors flex flex-col">
      {/* Notification Banner */}
      <NotificationBanner t={t} />

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp size={32} />
              <div>
                <h1 className="text-3xl font-bold">{t.appTitle}</h1>
                <p className="text-blue-100 text-sm">
                  {t.appSubtitle}
                </p>
              </div>
            </div>

            {/* Settings Button */}
            <ThemeSettings
              colorTheme={colorTheme}
              onColorThemeChange={handleColorThemeChange}
              themeMode={themeMode}
              onThemeModeChange={handleThemeModeChange}
              language={language}
              onLanguageChange={handleLanguageChange}
              t={t}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
        {/* Stock Manager and Time Range Selector in a grid with 70/30 split */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-6">
          {/* Stock Manager - 70% width on large screens */}
          <div className="lg:col-span-7">
            <StockManager
              stocks={stocks}
              onAddStock={handleAddStock}
              onRemoveStock={handleRemoveStock}
              language={language}
            />
          </div>

          {/* Time Range Selector - 30% width on large screens */}
          <div className="lg:col-span-3">
            <TimeRangeSelector
              currentRange={dateRange}
              onRangeChange={handleRangeChange}
              language={language}
            />
          </div>
        </div>

        {/* Dashboard Grid */}
        <DashboardGrid
          stocks={stocks}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          colorTheme={colorTheme}
          language={language}
        />
      </main>

      {/* Footer */}
      <Footer t={t} />

      {/* Vercel Analytics */}
      <Analytics />

      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </div>
  );
}

export default App;
