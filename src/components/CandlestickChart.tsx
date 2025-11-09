import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  Bar,
} from 'recharts';
import type { ColorTheme } from './ColorThemeSelector';
import type { Language } from '../i18n/translations';

interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20?: number;
  ma60?: number;
}

interface CandlestickChartProps {
  data: StockDataPoint[];
  colorTheme: ColorTheme;
  language: Language;
  showMA?: boolean;
}

/**
 * Custom candlestick shape component
 * Uses Recharts Bar's coordinate system to render OHLC data
 */
const Candlestick = (props: any) => {
  const { x, y, width, payload, colorTheme, domainMin, domainMax, priceRange } = props;

  if (!payload) return null;

  const { open, high, low, close } = payload;
  const isUp = close > open;

  // Use the color theme object directly - it has up/down colors defined
  const color = isUp ? colorTheme.up : colorTheme.down;

  const centerX = x + width / 2;
  const candleWidth = 8;

  // CORRECT APPROACH: Use the actual chart domain passed from parent
  // The ResponsiveContainer height is 145px, but the actual chart area is smaller
  // because of margins: top(5) + bottom(5) = 10px
  // Actual chart area height = 145 - 10 = 135px

  const chartHeight = 135; // Actual chart area height (145 - top margin - bottom margin)
  const pixelsPerPrice = chartHeight / priceRange;

  // Calculate the Y position for each price point
  // Y increases downward in SVG, so higher prices have lower Y values
  // Formula: y = chartTop + (domainMax - price) * pixelsPerPrice
  // But we don't know chartTop directly. Instead, we use the known 'y' for close price.

  // We know: y is the pixel position for 'close' price
  // So: y = chartTop + (domainMax - close) * pixelsPerPrice
  // Therefore: chartTop = y - (domainMax - close) * pixelsPerPrice

  const chartTop = y - (domainMax - close) * pixelsPerPrice;

  // Now calculate positions for all OHLC prices
  const yHigh = chartTop + (domainMax - high) * pixelsPerPrice;
  const yLow = chartTop + (domainMax - low) * pixelsPerPrice;
  const yOpen = chartTop + (domainMax - open) * pixelsPerPrice;
  const yClose = y; // We already know this

  const bodyTop = Math.min(yOpen, yClose);
  const bodyHeight = Math.abs(yClose - yOpen);

  return (
    <g>
      {/* Upper wick: from high to top of body */}
      <line
        x1={centerX}
        y1={yHigh}
        x2={centerX}
        y2={bodyTop}
        stroke={color}
        strokeWidth={1}
      />

      {/* Body: rectangle from open to close */}
      <rect
        x={centerX - candleWidth / 2}
        y={bodyTop}
        width={candleWidth}
        height={Math.max(bodyHeight, 1)}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />

      {/* Lower wick: from bottom of body to low */}
      <line
        x1={centerX}
        y1={bodyTop + Math.max(bodyHeight, 1)}
        x2={centerX}
        y2={yLow}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

/**
 * Custom Tooltip for Candlestick Chart
 */
const CustomTooltip = ({ active, payload, colorTheme, language }: any) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  const isBullish = data.close > data.open;

  // Convert hex color to Tailwind class based on the theme's up color
  // Asian theme: up=#dc2626 (red), Western theme: up=#16a34a (green)
  const isAsianTheme = colorTheme.up === '#dc2626';
  const upColor = isAsianTheme ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  const downColor = isAsianTheme ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const priceClass = isBullish ? upColor : downColor;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        {data.date}
      </p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">
            {language === 'zh-TW' ? '開盤' : 'Open'}:
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            ${data.open.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">
            {language === 'zh-TW' ? '最高' : 'High'}:
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            ${data.high.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">
            {language === 'zh-TW' ? '最低' : 'Low'}:
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            ${data.low.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">
            {language === 'zh-TW' ? '收盤' : 'Close'}:
          </span>
          <span className={`font-medium ${priceClass}`}>
            ${data.close.toFixed(2)}
          </span>
        </div>
        {data.ma20 && (
          <div className="flex justify-between gap-4">
            <span className="text-orange-600 dark:text-orange-400">MA20:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              ${data.ma20.toFixed(2)}
            </span>
          </div>
        )}
        {data.ma60 && (
          <div className="flex justify-between gap-4">
            <span className="text-lime-600 dark:text-lime-400">MA60:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              ${data.ma60.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


/**
 * Candlestick Chart Component
 *
 * Displays stock price data as candlestick (K-line) chart with optional moving averages.
 * Supports Asian/Western color themes and dark mode.
 *
 * Implementation approach:
 * - Uses Customized component to render candlesticks as SVG shapes
 * - Each candlestick consists of a body (rect) and wicks (lines)
 * - Color based on close vs open price and theme preference
 *
 * @param data - Array of stock data points with OHLC values
 * @param colorTheme - 'asian' (red up/green down) or 'western' (green up/red down)
 * @param language - UI language ('zh-TW' or 'en-US')
 * @param showMA - Whether to show MA20 and MA60 overlays (default: true)
 */
const CandlestickChart = ({ data, colorTheme, language, showMA = true }: CandlestickChartProps) => {
  // Calculate the price range for the entire dataset
  const minLow = Math.min(...data.map(d => d.low));
  const maxHigh = Math.max(...data.map(d => d.high));
  const domainMin = minLow * 0.995; // 0.5% padding
  const domainMax = maxHigh * 1.005; // 0.5% padding
  const priceRange = domainMax - domainMin;

  return (
    <ResponsiveContainer width="100%" height={145}>
      <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          stroke="currentColor"
          className="text-gray-500 dark:text-gray-400"
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />
        <YAxis
          domain={[domainMin, domainMax]}
          tick={{ fontSize: 11, fill: 'currentColor' }}
          stroke="currentColor"
          className="text-gray-500 dark:text-gray-400"
          tickFormatter={(value) => value.toFixed(2)}
        />
        <Tooltip
          content={<CustomTooltip colorTheme={colorTheme} language={language} />}
          cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3' }}
        />

        {/* Candlesticks - using Bar with custom shape */}
        <Bar
          dataKey="close"
          shape={(props: any) => (
            <Candlestick
              {...props}
              colorTheme={colorTheme}
              domainMin={domainMin}
              domainMax={domainMax}
              priceRange={priceRange}
            />
          )}
          isAnimationActive={false}
        />

        {/* MA20 Line (optional) */}
        {showMA && (
          <Line
            type="monotone"
            dataKey="ma20"
            stroke="#ff7300"
            strokeWidth={1.5}
            dot={false}
            name="MA20"
            connectNulls
            isAnimationActive={false}
          />
        )}

        {/* MA60 Line (optional) */}
        {showMA && (
          <Line
            type="monotone"
            dataKey="ma60"
            stroke="#84cc16"
            strokeWidth={1.5}
            dot={false}
            name="MA60"
            connectNulls
            isAnimationActive={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CandlestickChart;
