import { useState, useEffect, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import StockManager from './components/StockManager';
import TimeRangeSelector from './components/TimeRangeSelector';
import DashboardGrid from './components/DashboardGrid';
import ThemeSettings from './components/ThemeSettings';
import ThemeGuide from './components/ThemeGuide';
import NotificationBanner from './components/NotificationBanner';
import Footer from './components/Footer';
import { useTranslation } from './i18n/translations';
import { TrendingUp } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { AppProvider, useApp } from './contexts/AppContext';
import { ChartProvider, useChart } from './contexts/ChartContext';
import { ToastProvider } from './contexts/ToastContext';
import { VisualThemeProvider, useVisualTheme } from './contexts/VisualThemeContext';
import { ToastContainer } from './components/common/Toast';
import { queryClient } from './config/queryClient';

function AppContent() {
  // Use Context hooks
  const { language, colorTheme, setColorTheme, themeMode, setThemeMode, setLanguage } = useApp();
  const { dateRange } = useChart();
  const { visualTheme } = useVisualTheme();

  // Local state (stocks management)
  const [stocks, setStocks] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showThemeGuide, setShowThemeGuide] = useState(false);

  // Get translations
  const t = useTranslation(language);

  // Load stocks from localStorage (other settings handled by Context)
  useEffect(() => {
    const savedStocks = localStorage.getItem('tracked-stocks');
    if (savedStocks) {
      try {
        setStocks(JSON.parse(savedStocks));
      } catch (e) {
        console.error('Failed to load saved stocks:', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save stocks to localStorage (skip initial render)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('tracked-stocks', JSON.stringify(stocks));
    }
  }, [stocks, isInitialized]);

  const handleAddStock = useCallback((symbol: string) => {
    setStocks((prev) => [...prev, symbol]);
  }, []);

  const handleRemoveStock = useCallback((symbol: string) => {
    setStocks((prev) => prev.filter((s) => s !== symbol));
  }, []);

  // Show Theme Guide if requested
  if (showThemeGuide) {
    return (
      <ErrorBoundary language={language}>
        <ThemeGuide onClose={() => setShowThemeGuide(false)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary language={language}>
      <div className={`min-h-screen transition-colors flex flex-col relative ${
        visualTheme === 'warm'
          ? 'warm-gradient-bg noise-texture text-warm-800 dark:text-warm-200'
          : 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
      }`}>
        <NotificationBanner t={t} />

        <header className={`shadow-sm ${
          visualTheme === 'warm'
            ? 'bg-warm-100 dark:bg-warm-800 border-b border-warm-200 dark:border-warm-700'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900'
        }`}>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-4 ${
                visualTheme === 'warm'
                  ? 'text-warm-800 dark:text-warm-100'
                  : 'text-white'
              }`}>
                <TrendingUp size={36} className={visualTheme === 'warm' ? 'text-warm-accent-400' : ''} />
                <div>
                  <h1 className={`text-4xl font-bold ${visualTheme === 'warm' ? 'font-serif' : ''}`}>
                    {t.appTitle}
                  </h1>
                  <p className={`text-sm mt-1 ${
                    visualTheme === 'warm'
                      ? 'text-warm-600 dark:text-warm-400 font-serif'
                      : 'text-blue-100'
                  }`}>
                    {t.appSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={visualTheme === 'warm' ? 'text-warm-800 dark:text-warm-100' : ''}>
                  <ThemeSettings
                    colorTheme={colorTheme}
                    onColorThemeChange={setColorTheme}
                    themeMode={themeMode}
                    onThemeModeChange={setThemeMode}
                    language={language}
                    onLanguageChange={setLanguage}
                    t={t}
                    onOpenThemeGuide={() => setShowThemeGuide(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
          {/* Stock Manager and Time Range Selector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <StockManager
                stocks={stocks}
                onAddStock={handleAddStock}
                onRemoveStock={handleRemoveStock}
              />
            </div>

            <div className="lg:col-span-1">
              <TimeRangeSelector />
            </div>
          </div>

          {/* Dashboard Grid */}
          <DashboardGrid
            stocks={stocks}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </main>

        <Footer />

        {/* Vercel Analytics */}
        <Analytics />

        {/* Vercel Speed Insights */}
        <SpeedInsights />
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <VisualThemeProvider>
          <ChartProvider>
            <ToastProvider>
              <AppContent />
              <ToastContainer />
            </ToastProvider>
          </ChartProvider>
        </VisualThemeProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
