/**
 * Unified Chart Theme Configuration
 * Centralizes all chart-related colors and styles for consistency
 */

/**
 * Chart line colors for Moving Averages and other indicators
 */
export const CHART_COLORS = {
  // Moving Averages
  MA20: '#3b82f6',     // Blue - 20-day MA
  MA60: '#a855f7',     // Purple - 60-day MA

  // Candlestick MA lines
  MA20_CANDLE: '#ff7300',  // Orange - 20-day MA on candlestick
  MA60_CANDLE: '#84cc16',  // Lime - 60-day MA on candlestick

  // Volume
  VOLUME: '#94a3b8',   // Slate gray - volume bars
  VOLUME_UP: 'rgba(34, 197, 94, 0.6)',    // Green with opacity
  VOLUME_DOWN: 'rgba(239, 68, 68, 0.6)',  // Red with opacity

  // Grid and axis
  GRID: '#e5e7eb',          // Light gray
  GRID_DARK: '#374151',     // Dark gray for dark mode
  AXIS: '#6b7280',          // Gray
  AXIS_DARK: '#9ca3af',     // Lighter gray for dark mode

  // Tooltip
  TOOLTIP_BG: '#ffffff',
  TOOLTIP_BG_DARK: '#1f2937',
  TOOLTIP_BORDER: '#e5e7eb',
  TOOLTIP_BORDER_DARK: '#374151',

  // Reference lines
  REFERENCE_LINE: '#9ca3af',
} as const;

/**
 * Price color themes (Asian vs Western conventions)
 */
export const PRICE_THEMES = {
  ASIAN: {
    id: 'asian',
    name: 'Asian',
    label: {
      'en-US': 'Asian (Red Up / Green Down)',
      'zh-TW': '亞洲 (紅漲綠跌)',
    },
    up: '#dc2626',      // Red for price increase
    down: '#16a34a',    // Green for price decrease
    upBg: 'rgba(220, 38, 38, 0.1)',
    downBg: 'rgba(22, 163, 74, 0.1)',
  },
  WESTERN: {
    id: 'western',
    name: 'Western',
    label: {
      'en-US': 'Western (Green Up / Red Down)',
      'zh-TW': '歐美 (綠漲紅跌)',
    },
    up: '#16a34a',      // Green for price increase
    down: '#dc2626',    // Red for price decrease
    upBg: 'rgba(22, 163, 74, 0.1)',
    downBg: 'rgba(220, 38, 38, 0.1)',
  },
} as const;

/**
 * UI Theme colors for light/dark modes
 */
export const UI_THEME = {
  LIGHT: {
    bg: '#ffffff',
    bgSecondary: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  DARK: {
    bg: '#1f2937',
    bgSecondary: '#111827',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

/**
 * Toast notification colors
 */
export const TOAST_COLORS = {
  success: {
    bg: '#10b981',
    bgLight: '#d1fae5',
    text: '#ffffff',
    textLight: '#065f46',
    icon: '#ffffff',
    iconLight: '#10b981',
  },
  error: {
    bg: '#ef4444',
    bgLight: '#fee2e2',
    text: '#ffffff',
    textLight: '#991b1b',
    icon: '#ffffff',
    iconLight: '#ef4444',
  },
  warning: {
    bg: '#f59e0b',
    bgLight: '#fef3c7',
    text: '#ffffff',
    textLight: '#92400e',
    icon: '#ffffff',
    iconLight: '#f59e0b',
  },
  info: {
    bg: '#3b82f6',
    bgLight: '#dbeafe',
    text: '#ffffff',
    textLight: '#1e40af',
    icon: '#ffffff',
    iconLight: '#3b82f6',
  },
} as const;

/**
 * Get price color based on theme and direction
 */
export function getPriceColor(
  theme: 'asian' | 'western',
  isPositive: boolean
): string {
  const priceTheme = theme === 'asian' ? PRICE_THEMES.ASIAN : PRICE_THEMES.WESTERN;
  return isPositive ? priceTheme.up : priceTheme.down;
}

/**
 * Get price background color based on theme and direction
 */
export function getPriceBgColor(
  theme: 'asian' | 'western',
  isPositive: boolean
): string {
  const priceTheme = theme === 'asian' ? PRICE_THEMES.ASIAN : PRICE_THEMES.WESTERN;
  return isPositive ? priceTheme.upBg : priceTheme.downBg;
}

export type PriceThemeType = typeof PRICE_THEMES.ASIAN | typeof PRICE_THEMES.WESTERN;
export type ToastType = keyof typeof TOAST_COLORS;
