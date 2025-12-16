import { createContext, useContext, type ReactNode } from 'react';
import { format, subMonths } from 'date-fns';
import type { DateRange } from '../components/TimeRangeSelector';
import { usePersistedState } from '../hooks/usePersistedState';

interface ChartContextType {
  chartType: 'line' | 'candlestick';
  setChartType: (type: 'line' | 'candlestick') => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
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
  // Use persisted state for chart preferences
  const [chartType, setChartType] = usePersistedState<'line' | 'candlestick'>('chart-type', 'line');
  const [dateRange, setDateRange] = usePersistedState<DateRange>('date-range', {
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    preset: '1m',
  });

  const itemsPerPage = 9; // 3x3 grid

  const value: ChartContextType = {
    chartType,
    setChartType,
    dateRange,
    setDateRange,
    itemsPerPage,
  };

  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
}
