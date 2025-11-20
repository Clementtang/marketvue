import { describe, it, expect } from 'vitest';
import {
  formatChartDate,
  formatTimestamp,
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
  formatNumber
} from './formatters';

describe('formatters', () => {
  describe('formatChartDate', () => {
    it('should format date for en-US locale', () => {
      const result = formatChartDate('2025-01-15', 'en-US');
      expect(result).toBe('Jan 15');
    });

    it('should format date for zh-TW locale', () => {
      const result = formatChartDate('2025-01-15', 'zh-TW');
      expect(result).toBe('1/15');
    });

    it('should handle Date objects', () => {
      const date = new Date('2025-03-20');
      const resultEN = formatChartDate(date, 'en-US');
      const resultZH = formatChartDate(date, 'zh-TW');

      expect(resultEN).toBe('Mar 20');
      expect(resultZH).toBe('3/20');
    });

    it('should return empty string for invalid dates', () => {
      const result = formatChartDate('invalid-date', 'en-US');
      expect(result).toBe('');
    });

    it('should default to en-US when language not specified', () => {
      const result = formatChartDate('2025-06-10');
      expect(result).toBe('Jun 10');
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp for en-US locale', () => {
      const timestamp = new Date('2025-01-15').getTime();
      const result = formatTimestamp(timestamp, 'en-US');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });

    it('should format timestamp for zh-TW locale', () => {
      const timestamp = new Date('2025-01-15').getTime();
      const result = formatTimestamp(timestamp, 'zh-TW');
      expect(result).toContain('2025');
    });

    it('should return empty string for invalid timestamp', () => {
      const result = formatTimestamp(NaN, 'en-US');
      expect(result).toBe('');
    });

    it('should default to en-US when language not specified', () => {
      const timestamp = new Date('2025-06-10').getTime();
      const result = formatTimestamp(timestamp);
      expect(result).toContain('June');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD correctly with default decimals', () => {
      const result = formatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('should handle different currencies', () => {
      const resultEUR = formatCurrency(1000, 'EUR', 2);
      expect(resultEUR).toContain('1,000.00');
    });

    it('should handle null values', () => {
      expect(formatCurrency(null)).toBe('N/A');
    });

    it('should handle undefined values', () => {
      expect(formatCurrency(undefined)).toBe('N/A');
    });

    it('should handle NaN values', () => {
      expect(formatCurrency(NaN)).toBe('N/A');
    });

    it('should respect custom decimal places', () => {
      const result = formatCurrency(123.456789, 'USD', 4);
      expect(result).toBe('$123.4568');
    });

    it('should handle zero values', () => {
      const result = formatCurrency(0);
      expect(result).toBe('$0.00');
    });

    it('should handle negative values', () => {
      const result = formatCurrency(-500.25);
      expect(result).toBe('-$500.25');
    });
  });

  describe('formatPercentage', () => {
    it('should format positive percentages with + sign', () => {
      const result = formatPercentage(0.05, 2, true);
      expect(result).toBe('+5.00%');
    });

    it('should format negative percentages', () => {
      const result = formatPercentage(-0.0325, 2, true);
      expect(result).toBe('-3.25%');
    });

    it('should format without + sign when includeSign is false', () => {
      const result = formatPercentage(0.05, 2, false);
      expect(result).toBe('5.00%');
    });

    it('should handle zero percentage', () => {
      const result = formatPercentage(0, 2, true);
      expect(result).toBe('0.00%');
    });

    it('should respect custom decimal places', () => {
      const result = formatPercentage(0.123456, 4, false);
      expect(result).toBe('12.3456%');
    });

    it('should handle null values', () => {
      expect(formatPercentage(null)).toBe('N/A');
    });

    it('should handle undefined values', () => {
      expect(formatPercentage(undefined)).toBe('N/A');
    });

    it('should handle NaN values', () => {
      expect(formatPercentage(NaN)).toBe('N/A');
    });

    it('should default to 2 decimals and include sign', () => {
      expect(formatPercentage(0.1234)).toBe('+12.34%');
    });
  });

  describe('formatLargeNumber', () => {
    it('should format billions with B suffix', () => {
      const result = formatLargeNumber(2500000000, 1);
      expect(result).toBe('2.5B');
    });

    it('should format millions with M suffix', () => {
      const result = formatLargeNumber(7500000, 1);
      expect(result).toBe('7.5M');
    });

    it('should format thousands with K suffix', () => {
      const result = formatLargeNumber(3200, 1);
      expect(result).toBe('3.2K');
    });

    it('should format numbers less than 1000 without suffix', () => {
      const result = formatLargeNumber(850, 1);
      expect(result).toBe('850');
    });

    it('should handle negative numbers', () => {
      expect(formatLargeNumber(-1500000, 1)).toBe('-1.5M');
      expect(formatLargeNumber(-2500, 1)).toBe('-2.5K');
    });

    it('should handle zero', () => {
      const result = formatLargeNumber(0, 1);
      expect(result).toBe('0');
    });

    it('should respect custom decimal places', () => {
      expect(formatLargeNumber(1234567, 2)).toBe('1.23M');
      expect(formatLargeNumber(1234567, 0)).toBe('1M');
    });

    it('should handle null values', () => {
      expect(formatLargeNumber(null)).toBe('N/A');
    });

    it('should handle undefined values', () => {
      expect(formatLargeNumber(undefined)).toBe('N/A');
    });

    it('should handle NaN values', () => {
      expect(formatLargeNumber(NaN)).toBe('N/A');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousands separators', () => {
      const result = formatNumber(1234567, 0);
      expect(result).toBe('1,234,567');
    });

    it('should handle decimals when specified', () => {
      const result = formatNumber(1234.5678, 2);
      expect(result).toBe('1,234.57');
    });

    it('should default to 0 decimal places', () => {
      const result = formatNumber(1234.5678);
      expect(result).toBe('1,235');
    });

    it('should handle small numbers', () => {
      const result = formatNumber(42, 0);
      expect(result).toBe('42');
    });

    it('should handle negative numbers', () => {
      const result = formatNumber(-9876.54, 2);
      expect(result).toBe('-9,876.54');
    });

    it('should handle zero', () => {
      const result = formatNumber(0, 2);
      expect(result).toBe('0.00');
    });

    it('should handle null values', () => {
      expect(formatNumber(null)).toBe('N/A');
    });

    it('should handle undefined values', () => {
      expect(formatNumber(undefined)).toBe('N/A');
    });

    it('should handle NaN values', () => {
      expect(formatNumber(NaN)).toBe('N/A');
    });
  });
});
