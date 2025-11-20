import { BarChart3, CandlestickChart as CandlestickIcon } from 'lucide-react';
import { useTranslation } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import { useChart } from '../contexts/ChartContext';

const ChartTypeToggle = () => {
  // Use Context
  const { language } = useApp();
  const { chartType, setChartType } = useChart();
  const t = useTranslation(language);

  const toggleChartType = () => {
    const newType = chartType === 'line' ? 'candlestick' : 'line';
    setChartType(newType);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.chartType}
        </label>
        <button
          onClick={toggleChartType}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors"
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
      </div>
    </div>
  );
};

export default ChartTypeToggle;
