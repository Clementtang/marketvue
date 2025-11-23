/**
 * Stock Card Components
 *
 * This module exports all stock card related components.
 * The main StockCard component is the default export and the primary
 * component to use when displaying stock information.
 *
 * Sub-components are exported for testing and potential reuse:
 * - StockCardHeader: Displays company name and price
 * - StockCardChart: Renders price charts (line/candlestick)
 * - StockVolumeChart: Renders volume bar chart
 * - StockCardFooter: Shows average volume
 * - StockCardLoading: Loading state display
 * - StockCardError: Error state with retry button
 *
 * The useStockData hook is also exported for custom implementations.
 */

// Main component (default export)
export { default } from './StockCard';
export { default as StockCard } from './StockCard';

// Sub-components
export { default as StockCardHeader } from './StockCardHeader';
export { default as StockCardChart } from './StockCardChart';
export { default as StockVolumeChart } from './StockVolumeChart';
export { default as StockCardFooter } from './StockCardFooter';
export { default as StockCardLoading } from './StockCardLoading';
export { default as StockCardError } from './StockCardError';

// Custom hook
export { useStockData } from './hooks/useStockData';
