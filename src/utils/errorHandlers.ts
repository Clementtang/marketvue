/**
 * Error handling utilities for API requests
 */

import type { Language } from '../i18n/translations';
import type { AxiosError } from 'axios';

/**
 * Get user-friendly error message based on error type
 * @param err - The error object (typically from axios)
 * @param language - Current language
 * @param t - Translation object
 * @returns User-friendly error message
 */
export function getErrorMessage(
  err: any,
  language: Language,
  t: any
): string {
  const statusCode = (err as AxiosError)?.response?.status;
  const errorData = (err as AxiosError)?.response?.data as any;

  // Timeout errors
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return language === 'zh-TW'
      ? '請求逾時，請稍後再試'
      : 'Request timeout, please try again later';
  }

  // HTTP status code specific errors
  switch (statusCode) {
    case 503:
      // Free tier cold start
      return language === 'zh-TW'
        ? '服務可能正在啟動中（首次訪問需要 30-60 秒），請稍候...'
        : 'Service may be starting up (first visit takes 30-60 seconds), please wait...';

    case 429:
      return t.rateLimitExceeded;

    case 404:
      // Extract symbol from error or context if available
      return language === 'zh-TW'
        ? '找不到股票代號，請檢查代號是否正確'
        : 'Stock symbol not found, please check the symbol';

    case 500:
      return language === 'zh-TW'
        ? '伺服器錯誤，請稍後再試'
        : 'Server error, please try again later';

    case 400:
      // Bad request - may have specific error message from server
      if (errorData?.error) {
        return errorData.error;
      }
      return language === 'zh-TW'
        ? '請求參數錯誤'
        : 'Invalid request parameters';
  }

  // Server provided error message
  if (errorData?.error) {
    return errorData.error;
  }

  // Network offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return language === 'zh-TW'
      ? '網路連線中斷，請檢查網路連線'
      : 'Network connection lost, please check your connection';
  }

  // Default fallback
  return t.failedToFetch;
}

/**
 * Determine if an error should trigger a retry
 * @param error - The error object
 * @param retryCount - Current retry count
 * @param maxRetries - Maximum number of retries
 * @returns True if should retry
 */
export function shouldRetry(
  error: any,
  retryCount: number,
  maxRetries: number = 3
): boolean {
  const statusCode = (error as AxiosError)?.response?.status;

  // Don't retry if max retries reached
  if (retryCount >= maxRetries) {
    return false;
  }

  // Don't retry for client errors that won't be fixed by retrying
  if (statusCode === 404 || statusCode === 429 || statusCode === 400) {
    return false;
  }

  // Retry for network errors, timeouts, and server errors
  return true;
}

/**
 * Calculate retry delay based on error type and retry count
 * @param retryCount - Current retry count (0-indexed)
 * @param statusCode - HTTP status code if available
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(
  retryCount: number,
  statusCode?: number
): number {
  // Cold start (503) needs longer delays
  if (statusCode === 503) {
    const coldStartDelays = [5000, 10000, 15000];
    return coldStartDelays[retryCount] || 15000;
  }

  // Exponential backoff for other errors, max 5 seconds
  return Math.min(1000 * Math.pow(2, retryCount), 5000);
}

/**
 * Error message for specific symbol
 * @param symbol - Stock symbol
 * @param language - Current language
 * @returns Error message with symbol
 */
export function getSymbolErrorMessage(
  symbol: string,
  language: Language
): string {
  return language === 'zh-TW'
    ? `找不到股票代號 ${symbol}，請檢查代號是否正確`
    : `Stock symbol ${symbol} not found, please check the symbol`;
}

/**
 * Check if error is a network error
 * @param error - The error object
 * @returns True if network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT' ||
    error.message?.includes('network') ||
    error.message?.includes('timeout') ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  );
}

/**
 * Check if error is a server error (5xx)
 * @param error - The error object
 * @returns True if server error
 */
export function isServerError(error: any): boolean {
  const statusCode = (error as AxiosError)?.response?.status;
  return statusCode !== undefined && statusCode >= 500 && statusCode < 600;
}
