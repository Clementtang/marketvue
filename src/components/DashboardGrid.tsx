import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { BarChart3, CandlestickChart as CandlestickIcon } from "lucide-react";
import { useTrail, animated } from "@react-spring/web";
import StockCard from "./stock-card";
import ScreenshotButton from "./ScreenshotButton";
import PageNavigator from "./PageNavigator";
import { useTranslation } from "../i18n/translations";
import { useApp } from "../contexts/AppContext";
import { useChart } from "../contexts/ChartContext";
import { useVisualTheme } from "../contexts/VisualThemeContext";
import { useStockList } from "../contexts/StockListContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { animations } from "../utils/animations";
import { layoutToOrder, applyPageReorder } from "../utils/gridReorder";

interface DashboardGridProps {
  stocks: string[];
  startDate: string;
  endDate: string;
}

// Card height in grid row units (1 row = rowHeight px).
const CARD_H = 1;
// Columns in the desktop grid.
const COLS = 3;

const DashboardGrid = ({ stocks, startDate, endDate }: DashboardGridProps) => {
  const { language } = useApp();
  const { chartType, setChartType, itemsPerPage } = useChart();
  const { visualTheme } = useVisualTheme();
  const { actions } = useStockList();
  const t = useTranslation(language);
  const isMobile = useIsMobile();

  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(1200);

  const cols = isMobile ? 1 : COLS;

  // The current page's slice of the single source of truth (watchlist order).
  const pageStart = (currentPage - 1) * itemsPerPage;
  const paginatedStocks = useMemo(
    () => stocks.slice(pageStart, pageStart + itemsPerPage),
    [stocks, pageStart, itemsPerPage],
  );

  // Layout is DERIVED from the watchlist order — there is no separate persisted
  // layout. Position in the array is the single source of truth; dragging a card
  // commits a new order back to the watchlist (see handleDragStop).
  const layout = useMemo<GridLayout.Layout[]>(
    () =>
      paginatedStocks.map((symbol, index) => ({
        i: symbol,
        x: index % cols,
        y: Math.floor(index / cols) * CARD_H,
        w: 1,
        h: CARD_H,
        minW: 1,
        maxW: 1,
        minH: CARD_H,
        maxH: CARD_H,
        static: false,
      })),
    [paginatedStocks, cols],
  );

  // Stagger animation for stock cards
  const trails = useTrail(paginatedStocks.length, {
    from: { opacity: 0, transform: "translateY(20px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: animations.gentle,
    reset: true,
  });

  // Keep pagination sensible as the watchlist changes: jump to the last page
  // when a stock is added (so the new card is visible), and clamp the page if
  // it falls out of range after a removal.
  const previousLengthRef = useRef(stocks.length);
  useEffect(() => {
    const previousLength = previousLengthRef.current;
    const totalPages = Math.max(1, Math.ceil(stocks.length / itemsPerPage));

    if (stocks.length > previousLength) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(totalPages);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    previousLengthRef.current = stocks.length;
  }, [stocks.length, itemsPerPage, currentPage]);

  // Measure the container so GridLayout gets an accurate width.
  const updateWidth = useCallback(() => {
    const container = document.getElementById("grid-container");
    if (container && container.offsetWidth > 0) {
      setContainerWidth(container.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateWidth, 100);
    window.addEventListener("resize", updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateWidth);
    };
  }, [updateWidth]);

  // Commit a drag as a reorder of the watchlist (the single source of truth).
  // The dragged layout is read row-major (top-to-bottom, left-to-right) to
  // derive the new order for the current page, then spliced into the full list.
  const handleDragStop = useCallback(
    (newLayout: GridLayout.Layout[]) => {
      const orderedPage = layoutToOrder(newLayout);
      const newStocks = applyPageReorder(
        stocks,
        pageStart,
        itemsPerPage,
        orderedPage,
      );
      if (newStocks !== stocks) {
        actions.reorderStocks(newStocks);
      }
    },
    [stocks, pageStart, itemsPerPage, actions],
  );

  const handleToggleChartType = useCallback(() => {
    setChartType(chartType === "line" ? "candlestick" : "line");
  }, [chartType, setChartType]);

  if (stocks.length === 0) {
    return (
      <div
        className={`rounded-lg shadow-sm p-12 text-center transition-colors ${
          visualTheme === "warm"
            ? "bg-warm-100 dark:bg-warm-800"
            : "bg-white dark:bg-gray-800"
        }`}
      >
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
        <p className="text-gray-500 dark:text-gray-400">{t.addStocksToStart}</p>
      </div>
    );
  }

  return (
    <div
      className={`shadow-sm p-6 transition-colors ${
        visualTheme === "warm"
          ? "bg-warm-100 dark:bg-warm-800 rounded-3xl border border-warm-200/50 dark:border-warm-700/50"
          : "bg-white dark:bg-gray-800 rounded-lg"
      }`}
      id="grid-container"
    >
      {/* Dashboard Header - constrained to grid width */}
      <div
        className="flex items-center justify-between mb-4 mx-auto"
        style={{ maxWidth: Math.max(containerWidth - 48, 300) }}
      >
        <h2
          className={`text-xl font-semibold ${
            visualTheme === "warm"
              ? "text-warm-800 dark:text-warm-100 font-serif"
              : "text-gray-800 dark:text-white"
          }`}
        >
          {t.dashboardGrid}
        </h2>

        <div className="flex items-center gap-3">
          <PageNavigator
            totalItems={stocks.length}
            language={language}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />

          {/* Chart Type Toggle Button */}
          <button
            onClick={handleToggleChartType}
            className={`flex items-center gap-2 px-3 py-2 text-white transition-colors shadow-sm ${
              visualTheme === "warm"
                ? "bg-warm-accent-500 hover:bg-warm-accent-600 dark:bg-warm-accent-600 dark:hover:bg-warm-accent-700 rounded-2xl"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg"
            }`}
            title={
              chartType === "line"
                ? t.switchToCandlestickChart
                : t.switchToLineChart
            }
          >
            {chartType === "line" ? (
              <>
                <CandlestickIcon size={18} />
                <span className="text-sm font-medium">
                  {t.candlestickChart}
                </span>
              </>
            ) : (
              <>
                <BarChart3 size={18} />
                <span className="text-sm font-medium">{t.lineChart}</span>
              </>
            )}
          </button>

          {/* Screenshot Button */}
          <ScreenshotButton
            targetElementId="dashboard-grid-layout"
            language={language}
          />
        </div>
      </div>

      <div id="dashboard-grid-layout">
        <GridLayout
          className="layout"
          layout={layout}
          cols={cols}
          rowHeight={isMobile ? 300 : 220}
          width={Math.max(containerWidth - (isMobile ? 16 : 48), 300)}
          onDragStop={handleDragStop}
          draggableHandle=".drag-handle"
          compactType="vertical"
          preventCollision={false}
          isDraggable={!isMobile}
          isResizable={false}
        >
          {trails.map((style, index) => {
            const symbol = paginatedStocks[index];
            return (
              <animated.div
                key={symbol}
                className="relative group/card"
                style={style}
              >
                {/* Drag Handle - grip icon at top-left corner */}
                <div className="drag-handle absolute top-1.5 left-1.5 w-5 h-5 cursor-grab active:cursor-grabbing z-10 flex items-center justify-center opacity-0 group-hover/card:opacity-40 transition-opacity duration-200 rounded">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    className="text-gray-400 dark:text-gray-500"
                  >
                    <circle cx="2" cy="2" r="1" fill="currentColor" />
                    <circle cx="6" cy="2" r="1" fill="currentColor" />
                    <circle cx="2" cy="6" r="1" fill="currentColor" />
                    <circle cx="6" cy="6" r="1" fill="currentColor" />
                  </svg>
                </div>

                {/* Stock Card */}
                <StockCard
                  symbol={symbol}
                  startDate={startDate}
                  endDate={endDate}
                />
              </animated.div>
            );
          })}
        </GridLayout>
      </div>
    </div>
  );
};

export default DashboardGrid;
