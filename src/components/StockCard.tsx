import { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from '../i18n/translations';
import CandlestickChart from './CandlestickChart';
import ChartTooltip from './common/ChartTooltip';

// Import unified types
import type { StockData, StockDataPoint, StockCardProps } from '../types/stock';

// Import utilities
import { getErrorMessage, shouldRetry, calculateRetryDelay } from '../utils/errorHandlers';

// Import constants
import { API_CONFIG, MA_PERIODS, CHART_CONFIG } from '../config/constants';

const StockCard = ({ symbol, startDate, endDate, colorTheme, chartType, language }: StockCardProps) => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const t = useTranslation(language);

  useEffect(() => {
    fetchStockData();
  }, [symbol, startDate, endDate]);

  // Delay rendering charts until data is loaded and container is ready
  useEffect(() => {
    if (!loading && stockData) {
      // Use double requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
    }
  }, [loading, stockData]);

  // Calculate moving averages (memoized to prevent recalculation on every render)
  const calculateMA = useCallback((data: StockDataPoint[], period: number): StockDataPoint[] => {
    return data.map((point, index) => {
      if (index < period - 1) {
        return { ...point };
      }
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, p) => acc + p.close, 0);
      const ma = sum / period;
      return {
        ...point,
        [`ma${period}`]: ma,
      };
    });
  }, []);

  const fetchStockData = useCallback(async (isRetry = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/stock-data`, {
        symbol: symbol,
        start_date: startDate,
        end_date: endDate,
      }, {
        timeout: API_CONFIG.TIMEOUT,
      });

      // Calculate moving averages
      let processedData = response.data.data;
      processedData = calculateMA(processedData, MA_PERIODS.SHORT);
      processedData = calculateMA(processedData, MA_PERIODS.LONG);

      setStockData({
        ...response.data,
        data: processedData,
      });
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      // Use centralized error handling utility
      const errorMessage = getErrorMessage(err, language, t);
      setError(errorMessage);
      console.error('Error fetching stock data:', err);

      // Auto-retry logic using utility functions
      if (!isRetry && shouldRetry(err, retryCount, API_CONFIG.RETRY_COUNT)) {
        const statusCode = err.response?.status;
        const retryDelay = calculateRetryDelay(retryCount, statusCode);

        console.log(`Retrying in ${retryDelay}ms... (Attempt ${retryCount + 1}/${API_CONFIG.RETRY_COUNT})`);

        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchStockData(true);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [symbol, startDate, endDate, calculateMA, t, language, retryCount]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchStockData();
  }, [fetchStockData]);

  if (loading) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center transition-colors">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 mb-3" size={32} />
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {language === 'zh-TW' ? '載入中...' : 'Loading...'}
        </p>
        {retryCount > 0 && (
          <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
            {language === 'zh-TW'
              ? `重試中 (${retryCount}/${API_CONFIG.RETRY_COUNT})...`
              : `Retrying (${retryCount}/${API_CONFIG.RETRY_COUNT})...`
            }
          </p>
        )}
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center transition-colors">
        <div className="text-red-500 dark:text-red-400 mb-2">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 dark:text-red-400 text-center mb-2 font-medium">{error || t.noDataAvailable}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{symbol}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-sm rounded-lg transition-colors"
        >
          {language === 'zh-TW' ? '重新載入' : 'Retry'}
        </button>
      </div>
    );
  }

  // Memoized computed values to prevent recalculation on every render
  const displayName = useMemo(() => {
    if (!stockData || !stockData.company_name) {
      return stockData?.symbol || symbol;
    }

    const companyName = language === 'zh-TW'
      ? stockData.company_name['zh-TW']
      : stockData.company_name['en-US'];

    if (companyName) {
      return `${companyName} (${stockData.symbol})`;
    }

    return stockData.symbol;
  }, [stockData, language, symbol]);

  const priceInfo = useMemo(() => {
    if (!stockData) return null;

    const isPositive = (stockData.change ?? 0) >= 0;
    const upColor = isPositive ? colorTheme.up : colorTheme.down;

    return { isPositive, upColor };
  }, [stockData, colorTheme]);

  const averageVolume = useMemo(() => {
    if (!stockData || stockData.data.length === 0) {
      return 'N/A';
    }

    const sum = stockData.data.reduce((acc, d) => acc + d.volume, 0);
    const avg = Math.round(sum / stockData.data.length);
    return avg.toLocaleString();
  }, [stockData]);

  // Use unified ChartTooltip component (memoized to prevent recreation on every render)
  const CustomTooltip = useCallback((props: any) => {
    return <ChartTooltip {...props} t={t} showMovingAverages={true} />;
  }, [t]);

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 md:p-4 flex flex-col transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white truncate" title={displayName}>{displayName}</h3>
          <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
            <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              ${stockData.current_price?.toFixed(2) || 'N/A'}
            </span>
            {stockData.change !== null && stockData.change_percent !== null && priceInfo && (
              <div className={`flex items-center gap-1 text-xs md:text-sm font-medium`}
                   style={{ color: priceInfo.upColor }}>
                {priceInfo.isPositive ? <TrendingUp size={14} className="md:w-4 md:h-4" /> : <TrendingDown size={14} className="md:w-4 md:h-4" />}
                <span className="whitespace-nowrap">
                  {priceInfo.isPositive ? '+' : ''}{stockData.change.toFixed(2)}
                  ({stockData.change_percent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-1" style={{ height: `${CHART_CONFIG.CANDLESTICK_HEIGHT}px` }}>
        {isVisible && chartType === 'line' && (
          <ResponsiveContainer width="100%" height={CHART_CONFIG.CANDLESTICK_HEIGHT}>
            <LineChart data={stockData.data}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50 }} />
            <Legend
              wrapperStyle={{ fontSize: '10px' }}
              iconSize={10}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke={priceInfo?.upColor || colorTheme.up}
              strokeWidth={2}
              dot={false}
              name={t.close}
            />
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
              name={t.ma20}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="ma60"
              stroke="#a855f7"
              strokeWidth={1.5}
              dot={false}
              name={t.ma60}
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
        )}
        {isVisible && chartType === 'candlestick' && (
          <CandlestickChart
            data={stockData.data}
            colorTheme={colorTheme}
            language={language}
            showMA={true}
          />
        )}
      </div>

      {/* Volume Chart */}
      <div className="mb-1" style={{ height: `${CHART_CONFIG.VOLUME_HEIGHT}px` }}>
        {isVisible && (
          <ResponsiveContainer width="100%" height={CHART_CONFIG.VOLUME_HEIGHT}>
            <BarChart data={stockData.data}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50 }} />
            <Bar dataKey="volume" fill="#94a3b8" name={t.volume} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 pt-1 pb-2 border-t border-gray-200 dark:border-gray-700">
        {language === 'zh-TW' ? '平均成交量' : 'Avg Volume'}: {averageVolume}
      </div>
    </div>
  );
};

export default StockCard;
