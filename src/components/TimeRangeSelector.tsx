import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format, subMonths, subYears, subDays, startOfYear } from 'date-fns';
import { useTranslation } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import { useChart } from '../contexts/ChartContext';
import { useToast } from '../contexts/ToastContext';

export interface DateRange {
  startDate: string;
  endDate: string;
  preset?: string;
}

const TimeRangeSelector = () => {
  // Use Context
  const { language } = useApp();
  const { dateRange, setDateRange } = useChart();
  const { showToast } = useToast();
  const t = useTranslation(language);

  const [customMode, setCustomMode] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const presets = [
    { label: '1D', value: '1d', days: 1 },
    { label: '5D', value: '5d', days: 5 },
    { label: '1M', value: '1m', months: 1 },
    { label: '3M', value: '3m', months: 3 },
    { label: '6M', value: '6m', months: 6 },
    { label: 'YTD', value: 'ytd', ytd: true },
    { label: '1Y', value: '1y', years: 1 },
    { label: '5Y', value: '5y', years: 5 },
    { label: 'ALL', value: 'all', years: 50 }, // 50 years as "all available data"
  ];

  const handlePresetClick = (preset: typeof presets[0]) => {
    const endDate = new Date();
    let startDate: Date;

    if (preset.ytd) {
      startDate = startOfYear(endDate);
    } else if (preset.days) {
      startDate = subDays(endDate, preset.days);
    } else if (preset.months) {
      startDate = subMonths(endDate, preset.months);
    } else if (preset.years) {
      startDate = subYears(endDate, preset.years);
    } else {
      startDate = subMonths(endDate, 1);
    }

    const range: DateRange = {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      preset: preset.value,
    };

    setDateRange(range);
    setCustomMode(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      showToast('warning', language === 'zh-TW' ? '請選擇開始和結束日期' : 'Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast('error', language === 'zh-TW' ? '開始日期必須早於結束日期' : 'Start date must be before end date');
      return;
    }

    setDateRange({
      startDate,
      endDate,
      preset: 'custom',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors h-full">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{t.timeRange}</h2>

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateRange.preset === preset.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setCustomMode(!customMode)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            dateRange.preset === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Calendar size={18} />
          {t.custom}
        </button>
      </div>

      {/* Custom Date Picker */}
      {customMode && (
        <form onSubmit={handleCustomSubmit} className="border-t dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.startDate}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.endDate}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            {t.applyCustomRange}
          </button>
        </form>
      )}

      {/* Current Range Display */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">{t.currentRange}</span>{' '}
        {dateRange.startDate} {t.to} {dateRange.endDate}
      </div>
    </div>
  );
};

export default TimeRangeSelector;
