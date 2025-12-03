import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { BarChart3, CandlestickChart as CandlestickIcon } from 'lucide-react';
import StockCard from './stock-card';
import ScreenshotButton from './ScreenshotButton';
import PageNavigator from './PageNavigator';
import { useTranslation } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import { useChart } from '../contexts/ChartContext';

interface DashboardGridProps {
  stocks: string[];
  startDate: string;
  endDate: string;
}

const DashboardGrid = ({ stocks, startDate, endDate }: DashboardGridProps) => {
  // Use Context
  const { language } = useApp();
  const { chartType, setChartType, currentPage, setCurrentPage, itemsPerPage } = useChart();
  const t = useTranslation(language);

  const [layout, setLayout] = useState<GridLayout.Layout[]>([]);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Calculate paginated stocks
  const paginatedStocks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return stocks.slice(startIndex, endIndex);
  }, [stocks, currentPage, itemsPerPage]);

  // Smart page navigation when stocks change
  const previousStocksRef = useRef<string[]>([]);
  useEffect(() => {
    const previousStocks = previousStocksRef.current;

    // Check if stocks actually changed (not just re-rendered)
    const stocksString = stocks.join(',');
    const previousStocksString = previousStocks.join(',');

    if (stocksString !== previousStocksString && previousStocks.length > 0) {
      const totalPages = Math.ceil(stocks.length / itemsPerPage);

      // Stock was added (array grew) - jump to last page to show the new stock
      if (stocks.length > previousStocks.length) {
        setCurrentPage(totalPages);
      }
      // Stock was removed (array shrunk) - stay on current page if valid
      else if (stocks.length < previousStocks.length) {
        // If current page is now out of range, go to last valid page
        if (currentPage > totalPages) {
          setCurrentPage(totalPages);
        }
        // Otherwise stay on current page
      }

      previousStocksRef.current = stocks;
    } else if (previousStocks.length === 0) {
      // First load, initialize the ref
      previousStocksRef.current = stocks;
    }
  }, [stocks, currentPage, itemsPerPage, setCurrentPage]);

  // Memoized width update handler
  const updateWidth = useCallback(() => {
    const container = document.getElementById('grid-container');
    if (container && container.offsetWidth > 0) {
      setContainerWidth(container.offsetWidth);
    }
  }, []);

  // Update container width on resize
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, [updateWidth]);

  // Generate layout for 3x3 grid
  useEffect(() => {
    // Check URL parameter for reset
    const urlParams = new URLSearchParams(window.location.search);
    const shouldReset = urlParams.get('reset') === 'true';

    if (shouldReset) {
      localStorage.removeItem('dashboard-layout');
      localStorage.removeItem('dashboard-layout-version');
      // Remove reset parameter from URL
      urlParams.delete('reset');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }

    // Check layout version
    const layoutVersion = localStorage.getItem('dashboard-layout-version');
    if (layoutVersion !== 'snapshot-v20-pagination') {
      // Clear old layout when upgrading to pagination version
      localStorage.removeItem('dashboard-layout');
      localStorage.setItem('dashboard-layout-version', 'snapshot-v20-pagination');
    }

    // Load saved layout from localStorage (contains ALL stocks, not just current page)
    const savedLayout = localStorage.getItem('dashboard-layout');
    let existingLayout: Record<string, GridLayout.Layout> = {};

    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout) as GridLayout.Layout[];
        existingLayout = parsed.reduce((acc, item) => {
          acc[item.i] = item;
          return acc;
        }, {} as Record<string, GridLayout.Layout>);
      } catch (e) {
        console.error('Failed to load saved layout:', e);
        localStorage.removeItem('dashboard-layout');
      }
    }

    // Generate layout for current page's stocks only
    const newLayout = paginatedStocks.map((symbol, index) => {
      // Use saved layout if exists for this stock
      if (existingLayout[symbol]) {
        return {
          ...existingLayout[symbol],
          i: symbol,
          h: 1.0, // Force update height to current setting (220px)
          minH: 1.0,
          static: false,
        };
      }
      // Generate default 3x3 grid layout for new stocks
      // SNAPSHOT MODE: Using h: 1.0 for compact card height (220px)
      const row = Math.floor(index / 3);
      return {
        i: symbol,
        x: index % 3, // Column (0-2)
        y: row * 1.0, // Row position for auto-compaction
        w: 1, // Width (1 unit = 1/3 of container)
        h: 1.0, // Height (1.0 units = 220px * 1.0 = 220px)
        minW: 1,
        minH: 1.0,
        static: false, // Allow auto-repositioning for compaction
      };
    });
    setLayout(newLayout);
  }, [paginatedStocks]);

  // Memoized layout change handler
  const handleLayoutChange = useCallback((newLayout: GridLayout.Layout[]) => {
    // Force update all items to have correct h value
    const correctedLayout = newLayout.map((item) => ({
      ...item,
      h: 1.0, // Always enforce correct height (220px)
      minH: 1.0,
      static: false,
    }));

    // Check if all items are stacked vertically (all x=0)
    if (correctedLayout.length >= 3) {
      const allAtXZero = correctedLayout.filter(item => item.x === 0).length === correctedLayout.length;

      if (allAtXZero) {
        const fixedLayout = correctedLayout.map((item, index) => ({
          ...item,
          x: index % 3,
          y: Math.floor(index / 3) * 1.0,
        }));
        setLayout(fixedLayout);

        // Merge with existing layout from other pages
        const savedLayout = localStorage.getItem('dashboard-layout');
        let allLayouts: Record<string, GridLayout.Layout> = {};
        if (savedLayout) {
          try {
            const parsed = JSON.parse(savedLayout) as GridLayout.Layout[];
            allLayouts = parsed.reduce((acc, item) => {
              acc[item.i] = item;
              return acc;
            }, {} as Record<string, GridLayout.Layout>);
          } catch (e) {
            console.error('Failed to parse saved layout:', e);
          }
        }

        // Update with current page's layout
        fixedLayout.forEach(item => {
          allLayouts[item.i] = item;
        });

        localStorage.setItem('dashboard-layout', JSON.stringify(Object.values(allLayouts)));
        return;
      }
    }

    setLayout(correctedLayout);

    // Merge current page layout with existing layouts from other pages
    const savedLayout = localStorage.getItem('dashboard-layout');
    let allLayouts: Record<string, GridLayout.Layout> = {};
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout) as GridLayout.Layout[];
        allLayouts = parsed.reduce((acc, item) => {
          acc[item.i] = item;
          return acc;
        }, {} as Record<string, GridLayout.Layout>);
      } catch (e) {
        console.error('Failed to parse saved layout:', e);
      }
    }

    // Update with current page's layout
    correctedLayout.forEach(item => {
      allLayouts[item.i] = item;
    });

    localStorage.setItem('dashboard-layout', JSON.stringify(Object.values(allLayouts)));
  }, []);

  // Toggle chart type handler - must be before early return to follow Hooks rules
  const handleToggleChartType = useCallback(() => {
    const newType = chartType === 'line' ? 'candlestick' : 'line';
    setChartType(newType);
  }, [chartType, setChartType]);

  if (stocks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center transition-colors">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg
            className="w-24 h-24 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t.noStocksAddedYet}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t.addStocksToStart}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors" id="grid-container">
      {/* Dashboard Header - constrained to grid width */}
      <div
        className="flex items-center justify-between mb-4 mx-auto"
        style={{ maxWidth: Math.max(containerWidth - 48, 300) }}
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t.dashboardGrid}</h2>

        <div className="flex items-center gap-3">
          {/* Page Navigator (only show if multiple pages) */}
          <PageNavigator totalItems={stocks.length} language={language} />

          {/* Chart Type Toggle Button */}
          <button
            onClick={handleToggleChartType}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors shadow-sm"
            title={chartType === 'line' ? t.switchToCandlestickChart : t.switchToLineChart}
          >
            {chartType === 'line' ? (
              <>
                <CandlestickIcon size={18} />
                <span className="text-sm font-medium">{t.candlestickChart}</span>
              </>
            ) : (
              <>
                <BarChart3 size={18} />
                <span className="text-sm font-medium">{t.lineChart}</span>
              </>
            )}
          </button>

          {/* Screenshot Button */}
          <ScreenshotButton targetElementId="dashboard-grid-layout" language={language} />
        </div>
      </div>

      <div id="dashboard-grid-layout">
        <GridLayout
          className="layout"
          layout={layout}
          cols={3}
          rowHeight={220}
          width={Math.max(containerWidth - 48, 300)}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          compactType="vertical"
          preventCollision={false}
          isResizable={true}
          resizeHandles={['se']}
        >
        {paginatedStocks.map((symbol) => (
          <div key={symbol} className="relative">
            {/* Drag Handle - transparent for minimal design */}
            <div className="drag-handle absolute top-2 left-2 right-2 h-6 cursor-move z-10" />

            {/* Stock Card */}
            <StockCard
              symbol={symbol}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        ))}
      </GridLayout>
      </div>
    </div>
  );
};

export default DashboardGrid;
