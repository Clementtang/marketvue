import { useState, useEffect, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import StockManager from './components/StockManager';
import TimeRangeSelector from './components/TimeRangeSelector';
import DashboardGrid from './components/DashboardGrid';
import ThemeSettings from './components/ThemeSettings';
import NotificationBanner from './components/NotificationBanner';
import Footer from './components/Footer';
import { useTranslation } from './i18n/translations';
import { TrendingUp } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { AppProvider, useApp } from './contexts/AppContext';
import { ChartProvider, useChart } from './contexts/ChartContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/common/Toast';
import { queryClient } from './config/queryClient';

function AppContent() {
  // Use Context hooks
  const { language, colorTheme, setColorTheme, themeMode, setThemeMode, setLanguage } = useApp();
  const { dateRange } = useChart();

  // Local state (stocks management)
  const [stocks, setStocks] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

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

  return (
    <ErrorBoundary language={language}>
      <div className="min-h-screen bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-100 transition-colors flex flex-col">
        <NotificationBanner t={t} />

        <header className="bg-warm-100 dark:bg-warm-800 border-b border-warm-200 dark:border-warm-700 shadow-warm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp size={32} className="text-accent-primary" />
                <div>
                  <h1 className="text-3xl font-semibold text-warm-800 dark:text-warm-50">{t.appTitle}</h1>
                  <p className="text-warm-600 dark:text-warm-300 text-sm">
                    {t.appSubtitle}
                  </p>
                </div>
              </div>

              <ThemeSettings
                colorTheme={colorTheme}
                onColorThemeChange={setColorTheme}
                themeMode={themeMode}
                onThemeModeChange={setThemeMode}
                language={language}
                onLanguageChange={setLanguage}
                t={t}
              />
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
        <ChartProvider>
          <ToastProvider>
            <AppContent />
            <ToastContainer />
          </ToastProvider>
        </ChartProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
