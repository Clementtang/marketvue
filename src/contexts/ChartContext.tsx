import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { format, subMonths } from 'date-fns';
import type { DateRange } from '../components/TimeRangeSelector';

interface ChartContextType {
  chartType: 'line' | 'candlestick';
  setChartType: (type: 'line' | 'candlestick') => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export function useChart() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useChart must be used within a ChartProvider');
  }
  return context;
}

interface ChartProviderProps {
  children: ReactNode;
}

export function ChartProvider({ children }: ChartProviderProps) {
  const [chartType, setChartTypeState] = useState<'line' | 'candlestick'>('line');
  const [dateRange, setDateRangeState] = useState<DateRange>({
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    preset: '1m',
  });
  const [currentPage, setCurrentPageState] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const itemsPerPage = 9; // 3x3 grid

  // Load from localStorage on mount
  useEffect(() => {
    const savedChartType = localStorage.getItem('chart-type');
    if (savedChartType === 'candlestick' || savedChartType === 'line') {
      setChartTypeState(savedChartType);
    }

    const savedDateRange = localStorage.getItem('date-range');
    if (savedDateRange) {
      try {
        setDateRangeState(JSON.parse(savedDateRange));
      } catch (e) {
        console.error('Failed to load saved date range:', e);
      }
    }

    setIsInitialized(true);
  }, []);

  // Save to localStorage with wrapper functions
  const setChartType = (type: 'line' | 'candlestick') => {
    setChartTypeState(type);
    if (isInitialized) {
      localStorage.setItem('chart-type', type);
    }
  };

  const setDateRange = (range: DateRange) => {
    setDateRangeState(range);
    if (isInitialized) {
      localStorage.setItem('date-range', JSON.stringify(range));
    }
  };

  const setCurrentPage = (page: number) => {
    setCurrentPageState(page);
    // No need to persist page number to localStorage
    // Always start from page 1 on refresh
  };

  const value: ChartContextType = {
    chartType,
    setChartType,
    dateRange,
    setDateRange,
    currentPage,
    setCurrentPage,
    itemsPerPage,
  };

  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
}
