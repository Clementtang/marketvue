/**
 * Formatting utilities for dates, numbers, and currency
 */

export type Language = 'en-US' | 'zh-TW';

/**
 * Format date for chart display based on language
 * @param date - Date string or Date object
 * @param language - Language code
 * @returns Formatted date string
 */
export function formatChartDate(date: string | Date, language: Language = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  if (language === 'zh-TW') {
    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
  }

  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format timestamp to readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @param language - Language code
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number, language: Language = 'en-US'): string {
  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return '';
  }

  if (language === 'zh-TW') {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format currency value
 * @param value - Numeric value to format
 * @param currency - Currency code (USD, TWD, etc.)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = 'USD',
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    // Fallback if currency is invalid
    return `${value.toFixed(decimals)} ${currency}`;
  }
}

/**
 * Format percentage value
 * @param value - Numeric value to format (e.g., 0.05 for 5%)
 * @param decimals - Number of decimal places (default: 2)
 * @param includeSign - Whether to include + sign for positive values
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 2,
  includeSign: boolean = true
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const percentValue = value * 100;
  const formatted = percentValue.toFixed(decimals);

  if (includeSign && percentValue > 0) {
    return `+${formatted}%`;
  }

  return `${formatted}%`;
}

/**
 * Format large numbers with K/M/B suffixes
 * @param value - Numeric value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string with suffix
 */
export function formatLargeNumber(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
  }

  return `${sign}${absValue.toLocaleString()}`;
}

/**
 * Format number with thousands separators
 * @param value - Numeric value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
