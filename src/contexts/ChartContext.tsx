import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { format, subMonths } from "date-fns";
import type { DateRange } from "../components/TimeRangeSelector";
import { usePersistedState } from "../hooks/usePersistedState";

interface ChartContextType {
  chartType: "line" | "candlestick";
  setChartType: (type: "line" | "candlestick") => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  itemsPerPage: number;
  /**
   * True while a screenshot is being taken. Charts disable their entry
   * animation so the capture reflects final state immediately rather than a
   * mid-animation frame. Transient (not persisted).
   */
  isExporting: boolean;
  setIsExporting: (value: boolean) => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useChart() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error("useChart must be used within a ChartProvider");
  }
  return context;
}

interface ChartProviderProps {
  children: ReactNode;
}

export function ChartProvider({ children }: ChartProviderProps) {
  // Use persisted state for chart preferences
  const [chartType, setChartType] = usePersistedState<"line" | "candlestick">(
    "chart-type",
    "line",
  );
  const [dateRange, setDateRange] = usePersistedState<DateRange>("date-range", {
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    preset: "1m",
  });

  const itemsPerPage = 9; // 3x3 grid

  const [isExporting, setIsExporting] = useState(false);

  const value: ChartContextType = {
    chartType,
    setChartType,
    dateRange,
    setDateRange,
    itemsPerPage,
    isExporting,
    setIsExporting,
  };

  return (
    <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
  );
}
