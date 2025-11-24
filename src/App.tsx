import { useState, useEffect, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import StockManager from './components/StockManager';
import TimeRangeSelector from './components/TimeRangeSelector';
import ChartTypeToggle from './components/ChartTypeToggle';
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
        {/* Stock Manager, Chart Type Toggle, and Time Range Selector in a grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Stock Manager - 50% width on large screens */}
          <div className="lg:col-span-6">
            <StockManager
              stocks={stocks}
              onAddStock={handleAddStock}
              onRemoveStock={handleRemoveStock}
            />
          </div>

          {/* Chart Type Toggle - 20% width on large screens */}
          <div className="lg:col-span-2">
            <ChartTypeToggle />
          </div>

          {/* Time Range Selector - 30% width on large screens */}
          <div className="lg:col-span-4">
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

      {/* Footer */}
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
