import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import type { ColorTheme } from './ColorThemeSelector';
import { useTranslation, type Language } from '../i18n/translations';

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

interface StockData {
  symbol: string;
  company_name?: {
    'zh-TW': string | null;
    'en-US': string | null;
  };
  data: StockDataPoint[];
  current_price: number | null;
  change: number | null;
  change_percent: number | null;
}

interface StockCardProps {
  symbol: string;
  startDate: string;
  endDate: string;
  colorTheme: ColorTheme;
  language: Language;
}

const StockCard = ({ symbol, startDate, endDate, colorTheme, language }: StockCardProps) => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslation(language);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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

  // Calculate moving averages
  const calculateMA = (data: StockDataPoint[], period: number): StockDataPoint[] => {
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
  };

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/stock-data`, {
        symbol: symbol,
        start_date: startDate,
        end_date: endDate,
      });

      // Calculate moving averages
      let processedData = response.data.data;
      processedData = calculateMA(processedData, 20);
      processedData = calculateMA(processedData, 60);

      setStockData({
        ...response.data,
        data: processedData,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || t.failedToFetch;
      setError(errorMessage);
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center transition-colors">
        <p className="text-red-500 dark:text-red-400 text-center mb-2">{error || t.noDataAvailable}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{symbol}</p>
      </div>
    );
  }

  const isPositive = (stockData.change ?? 0) >= 0;
  const upColor = isPositive ? colorTheme.up : colorTheme.down;

  // Get display name based on language
  const getDisplayName = () => {
    if (!stockData.company_name) {
      return stockData.symbol;
    }

    const companyName = language === 'zh-TW'
      ? stockData.company_name['zh-TW']
      : stockData.company_name['en-US'];

    if (companyName) {
      return `${companyName} (${stockData.symbol})`;
    }

    return stockData.symbol;
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 text-xs z-50">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
            {new Date(data.date).toLocaleDateString()}
          </p>
          <div className="space-y-1">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">{t.open}:</span> ${data.open?.toFixed(2)}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">{t.high}:</span> ${data.high?.toFixed(2)}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">{t.low}:</span> ${data.low?.toFixed(2)}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">{t.close}:</span> ${data.close?.toFixed(2)}
            </p>
            {data.ma20 && (
              <p className="text-blue-600 dark:text-blue-400">
                <span className="font-medium">{t.ma20}:</span> ${data.ma20.toFixed(2)}
              </p>
            )}
            {data.ma60 && (
              <p className="text-purple-600 dark:text-purple-400">
                <span className="font-medium">{t.ma60}:</span> ${data.ma60.toFixed(2)}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400 pt-1 border-t dark:border-gray-600">
              <span className="font-medium">{t.volume}:</span> {data.volume?.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 md:p-4 flex flex-col transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white truncate" title={getDisplayName()}>{getDisplayName()}</h3>
          <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
            <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              ${stockData.current_price?.toFixed(2) || 'N/A'}
            </span>
            {stockData.change !== null && stockData.change_percent !== null && (
              <div className={`flex items-center gap-1 text-xs md:text-sm font-medium`}
                   style={{ color: upColor }}>
                {isPositive ? <TrendingUp size={14} className="md:w-4 md:h-4" /> : <TrendingDown size={14} className="md:w-4 md:h-4" />}
                <span className="whitespace-nowrap">
                  {isPositive ? '+' : ''}{stockData.change.toFixed(2)}
                  ({stockData.change_percent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-1" style={{ height: '145px' }}>
        {isVisible && (
          <ResponsiveContainer width="100%" height={145}>
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
              stroke={upColor}
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
      </div>

      {/* Volume Chart */}
      <div className="mb-1" style={{ height: '63px' }}>
        {isVisible && (
          <ResponsiveContainer width="100%" height={63}>
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
        {t.volume}: {stockData.data[stockData.data.length - 1]?.volume.toLocaleString() || 'N/A'}
      </div>
    </div>
  );
};

export default StockCard;
