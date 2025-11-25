/**
 * Date Aggregation Utilities
 *
 * Intelligently aggregates stock data based on date range to prevent
 * candlesticks from being squeezed together when the date range is too long.
 *
 * Aggregation Rules:
 * - ≤ 90 days: Daily (no aggregation)
 * - 91-365 days: Weekly aggregation
 * - > 365 days: Monthly aggregation
 */

import type { StockDataPoint } from '../types/stock';
import { format, startOfWeek, startOfMonth, parse } from 'date-fns';

export type TimeInterval = 'daily' | 'weekly' | 'monthly';

/**
 * Determine appropriate time interval based on number of data points
 */
export function determineTimeInterval(dataLength: number): TimeInterval {
  if (dataLength <= 90) {
    return 'daily';
  } else if (dataLength <= 365) {
    return 'weekly';
  } else {
    return 'monthly';
  }
}

/**
 * Aggregate OHLC data to weekly intervals
 * Groups data by week (Monday-Sunday) and calculates:
 * - Open: First day's open
 * - High: Maximum high of the week
 * - Low: Minimum low of the week
 * - Close: Last day's close
 * - Volume: Sum of week's volume
 */
function aggregateToWeekly(data: StockDataPoint[]): StockDataPoint[] {
  if (data.length === 0) return [];

  // Group data by week
  const weeklyGroups = new Map<string, StockDataPoint[]>();

  data.forEach((point) => {
    const date = parse(point.date, 'yyyy-MM-dd', new Date());
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    if (!weeklyGroups.has(weekKey)) {
      weeklyGroups.set(weekKey, []);
    }
    weeklyGroups.get(weekKey)!.push(point);
  });

  // Aggregate each week
  const aggregated: StockDataPoint[] = [];

  weeklyGroups.forEach((weekData, weekKey) => {
    if (weekData.length === 0) return;

    // Sort by date to ensure correct order
    weekData.sort((a, b) => a.date.localeCompare(b.date));

    const open = weekData[0].open;
    const close = weekData[weekData.length - 1].close;
    const high = Math.max(...weekData.map(d => d.high));
    const low = Math.min(...weekData.map(d => d.low));
    const volume = weekData.reduce((sum, d) => sum + d.volume, 0);

    // Calculate MA if exists (use last day's MA as approximation)
    const lastPoint = weekData[weekData.length - 1];
    const ma20 = lastPoint.ma20;
    const ma60 = lastPoint.ma60;

    aggregated.push({
      date: weekKey,
      open,
      high,
      low,
      close,
      volume,
      ma20,
      ma60,
    });
  });

  // Sort by date
  return aggregated.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregate OHLC data to monthly intervals
 * Groups data by month and calculates:
 * - Open: First day's open
 * - High: Maximum high of the month
 * - Low: Minimum low of the month
 * - Close: Last day's close
 * - Volume: Sum of month's volume
 */
function aggregateToMonthly(data: StockDataPoint[]): StockDataPoint[] {
  if (data.length === 0) return [];

  // Group data by month
  const monthlyGroups = new Map<string, StockDataPoint[]>();

  data.forEach((point) => {
    const date = parse(point.date, 'yyyy-MM-dd', new Date());
    const monthStart = startOfMonth(date);
    const monthKey = format(monthStart, 'yyyy-MM-dd');

    if (!monthlyGroups.has(monthKey)) {
      monthlyGroups.set(monthKey, []);
    }
    monthlyGroups.get(monthKey)!.push(point);
  });

  // Aggregate each month
  const aggregated: StockDataPoint[] = [];

  monthlyGroups.forEach((monthData, monthKey) => {
    if (monthData.length === 0) return;

    // Sort by date to ensure correct order
    monthData.sort((a, b) => a.date.localeCompare(b.date));

    const open = monthData[0].open;
    const close = monthData[monthData.length - 1].close;
    const high = Math.max(...monthData.map(d => d.high));
    const low = Math.min(...monthData.map(d => d.low));
    const volume = monthData.reduce((sum, d) => sum + d.volume, 0);

    // Calculate MA if exists (use last day's MA as approximation)
    const lastPoint = monthData[monthData.length - 1];
    const ma20 = lastPoint.ma20;
    const ma60 = lastPoint.ma60;

    aggregated.push({
      date: monthKey,
      open,
      high,
      low,
      close,
      volume,
      ma20,
      ma60,
    });
  });

  // Sort by date
  return aggregated.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregate stock data based on the determined time interval
 *
 * @param data - Original stock data points (daily)
 * @param interval - Target time interval ('daily' | 'weekly' | 'monthly')
 * @returns Aggregated data points
 */
export function aggregateStockData(
  data: StockDataPoint[],
  interval: TimeInterval = 'daily'
): StockDataPoint[] {
  if (data.length === 0) return [];

  switch (interval) {
    case 'weekly':
      return aggregateToWeekly(data);
    case 'monthly':
      return aggregateToMonthly(data);
    case 'daily':
    default:
      return data;
  }
}

/**
 * Smart aggregation - automatically determines and applies appropriate interval
 *
 * @param data - Original stock data points
 * @returns Object containing aggregated data and the interval used
 */
export function smartAggregateStockData(data: StockDataPoint[]): {
  data: StockDataPoint[];
  interval: TimeInterval;
} {
  const interval = determineTimeInterval(data.length);
  const aggregatedData = aggregateStockData(data, interval);

  return {
    data: aggregatedData,
    interval,
  };
}
