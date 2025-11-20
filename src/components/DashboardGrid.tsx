import { useState, useEffect, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import StockCard from './StockCard';
import { useTranslation } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';

interface DashboardGridProps {
  stocks: string[];
  startDate: string;
  endDate: string;
}

const DashboardGrid = ({ stocks, startDate, endDate }: DashboardGridProps) => {
  // Use Context
  const { language } = useApp();
  const t = useTranslation(language);

  const [layout, setLayout] = useState<GridLayout.Layout[]>([]);
  const [containerWidth, setContainerWidth] = useState(1200);

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
    // Check layout version and clear if outdated
    const layoutVersion = localStorage.getItem('dashboard-layout-version');
    const CURRENT_VERSION = '5';

    if (layoutVersion !== CURRENT_VERSION) {
      localStorage.removeItem('dashboard-layout');
      localStorage.setItem('dashboard-layout-version', CURRENT_VERSION);
    }

    // Load saved layout from localStorage
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

    const newLayout = stocks.map((symbol, index) => {
      // Use saved layout if exists AND it has valid dimensions
      if (existingLayout[symbol] && existingLayout[symbol].w && existingLayout[symbol].h) {
        return {
          ...existingLayout[symbol],
          i: symbol,
        };
      }
      // Generate default 6x3 grid layout (support up to 18 stocks)
      return {
        i: symbol,
        x: index % 3, // Column (0-2)
        y: Math.floor(index / 3), // Row (0-5 for 18 stocks)
        w: 1, // Width (1 unit = 1/3 of container)
        h: 1, // Height (1 unit = rowHeight)
        minW: 1,
        minH: 1,
        static: false,
      };
    });
    setLayout(newLayout);
  }, [stocks]);

  // Memoized layout change handler
  const handleLayoutChange = useCallback((newLayout: GridLayout.Layout[]) => {
    // Check if all items are stacked vertically (all x=0)
    if (newLayout.length >= 3) {
      const allAtXZero = newLayout.filter(item => item.x === 0).length === newLayout.length;

      if (allAtXZero) {
        const fixedLayout = newLayout.map((item, index) => ({
          ...item,
          x: index % 3,
          y: Math.floor(index / 3),
        }));
        setLayout(fixedLayout);
        localStorage.setItem('dashboard-layout', JSON.stringify(fixedLayout));
        return;
      }
    }

    setLayout(newLayout);
    localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
  }, []);

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
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t.dashboardGrid}</h2>

      <GridLayout
        className="layout"
        layout={layout}
        cols={3}
        rowHeight={350}
        width={Math.max(containerWidth - 48, 300)}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        compactType="horizontal"
        preventCollision={false}
        isResizable={true}
        resizeHandles={['se']}
      >
        {stocks.map((symbol) => (
          <div key={symbol} className="relative">
            {/* Drag Handle */}
            <div className="drag-handle absolute top-2 left-2 right-2 h-6 cursor-move z-10 bg-gradient-to-b from-gray-900/10 to-transparent rounded-t-lg" />

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
  );
};

export default DashboardGrid;
