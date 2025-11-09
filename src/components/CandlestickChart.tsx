import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  Customized,
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
 * Custom candlestick renderer using SVG shapes
 * Draws candlesticks directly using rect and line elements
 */
const Candlesticks = (props: any) => {
  const { xAxisMap, yAxisMap, data, colorTheme } = props;

  if (!xAxisMap || !yAxisMap || !data) return null;

  const xAxis = xAxisMap[0];
  const yAxis = yAxisMap[0];

  if (!xAxis || !yAxis) return null;

  const upColor = colorTheme === 'asian' ? '#ef4444' : '#22c55e';
  const downColor = colorTheme === 'asian' ? '#22c55e' : '#ef4444';

  const candleWidth = 8;

  return (
    <g>
      {data.map((point: StockDataPoint, index: number) => {
        const { open, high, low, close, date } = point;

        // Calculate positions
        const x = xAxis.scale(date) as number;
        const yHigh = yAxis.scale(high) as number;
        const yLow = yAxis.scale(low) as number;
        const yOpen = yAxis.scale(open) as number;
        const yClose = yAxis.scale(close) as number;

        const isUp = close >= open;
        const color = isUp ? upColor : downColor;

        // Body dimensions
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.abs(yClose - yOpen);
        const bodyMinHeight = 1; // Minimum height for doji candles

        return (
          <g key={`candle-${date}-${index}`}>
            {/* Upper wick */}
            <line
              x1={x}
              y1={yHigh}
              x2={x}
              y2={bodyTop}
              stroke={color}
              strokeWidth={1}
            />

            {/* Lower wick */}
            <line
              x1={x}
              y1={bodyTop + bodyHeight}
              x2={x}
              y2={yLow}
              stroke={color}
              strokeWidth={1}
            />

            {/* Body */}
            <rect
              x={x - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={Math.max(bodyHeight, bodyMinHeight)}
              fill={color}
              stroke={color}
              strokeWidth={1}
            />
          </g>
        );
      })}
    </g>
  );
};

/**
 * Custom Tooltip for Candlestick Chart
 */
const CustomTooltip = ({ active, payload, colorTheme, language }: any) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  const isBullish = data.close >= data.open;

  // Color based on theme
  const upColor = colorTheme === 'asian' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  const downColor = colorTheme === 'asian' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
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
          domain={['dataMin', 'dataMax']}
          tick={{ fontSize: 11, fill: 'currentColor' }}
          stroke="currentColor"
          className="text-gray-500 dark:text-gray-400"
          tickFormatter={(value) => value.toFixed(2)}
        />
        <Tooltip
          content={<CustomTooltip colorTheme={colorTheme} language={language} />}
          cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3' }}
        />

        {/* Candlesticks */}
        <Customized component={<Candlesticks colorTheme={colorTheme} />} />

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
