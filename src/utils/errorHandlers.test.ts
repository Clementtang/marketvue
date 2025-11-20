import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  shouldRetry,
  calculateRetryDelay,
  getSymbolErrorMessage,
  isNetworkError,
  isServerError
} from './errorHandlers';

describe('errorHandlers', () => {
  const mockTranslations = {
    failedToFetch: 'Failed to fetch data',
    rateLimitExceeded: 'Rate limit exceeded, please try again later'
  };

  describe('getErrorMessage', () => {
    it('should return timeout message for ECONNABORTED', () => {
      const error = { code: 'ECONNABORTED' };
      const resultEN = getErrorMessage(error, 'en-US', mockTranslations);
      const resultZH = getErrorMessage(error, 'zh-TW', mockTranslations);

      expect(resultEN).toContain('timeout');
      expect(resultZH).toContain('逾時');
    });

    it('should return timeout message for timeout in message', () => {
      const error = { message: 'Request timeout occurred' };
      const result = getErrorMessage(error, 'en-US', mockTranslations);

      expect(result).toContain('timeout');
    });

    it('should return cold start message for 503 status', () => {
      const error = { response: { status: 503 } };
      const resultEN = getErrorMessage(error, 'en-US', mockTranslations);
      const resultZH = getErrorMessage(error, 'zh-TW', mockTranslations);

      expect(resultEN).toContain('starting up');
      expect(resultZH).toContain('啟動中');
    });

    it('should return rate limit message for 429 status', () => {
      const error = { response: { status: 429 } };
      const result = getErrorMessage(error, 'en-US', mockTranslations);

      expect(result).toBe(mockTranslations.rateLimitExceeded);
    });

    it('should return not found message for 404 status', () => {
      const error = { response: { status: 404 } };
      const resultEN = getErrorMessage(error, 'en-US', mockTranslations);
      const resultZH = getErrorMessage(error, 'zh-TW', mockTranslations);

      expect(resultEN).toContain('not found');
      expect(resultZH).toContain('找不到');
    });

    it('should return server error message for 500 status', () => {
      const error = { response: { status: 500 } };
      const resultEN = getErrorMessage(error, 'en-US', mockTranslations);
      const resultZH = getErrorMessage(error, 'zh-TW', mockTranslations);

      expect(resultEN).toContain('Server error');
      expect(resultZH).toContain('伺服器錯誤');
    });

    it('should return custom error message for 400 with error data', () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Custom bad request error' }
        }
      };
      const result = getErrorMessage(error, 'en-US', mockTranslations);

      expect(result).toBe('Custom bad request error');
    });

    it('should return generic bad request message for 400 without error data', () => {
      const error = { response: { status: 400 } };
      const resultEN = getErrorMessage(error, 'en-US', mockTranslations);
      const resultZH = getErrorMessage(error, 'zh-TW', mockTranslations);

      expect(resultEN).toContain('Invalid request');
      expect(resultZH).toContain('請求參數錯誤');
    });

    it('should return server error message from error data if available', () => {
      const error = {
        response: {
          status: 502,
          data: { error: 'Gateway error occurred' }
        }
      };
      const result = getErrorMessage(error, 'en-US', mockTranslations);

      expect(result).toBe('Gateway error occurred');
    });

    it('should return network lost message when offline', () => {
      // Mock navigator.onLine
      const originalOnLine = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine');
      Object.defineProperty(Navigator.prototype, 'onLine', {
        configurable: true,
        get: () => false
      });

      const error = {};
      const resultEN = getErrorMessage(error, 'en-US', mockTranslations);
      const resultZH = getErrorMessage(error, 'zh-TW', mockTranslations);

      expect(resultEN).toContain('Network connection lost');
      expect(resultZH).toContain('網路連線中斷');

      // Restore original
      if (originalOnLine) {
        Object.defineProperty(Navigator.prototype, 'onLine', originalOnLine);
      }
    });

    it('should return default fallback message for unknown errors', () => {
      const error = { someUnknownProperty: 'value' };
      const result = getErrorMessage(error, 'en-US', mockTranslations);

      expect(result).toBe(mockTranslations.failedToFetch);
    });
  });

  describe('shouldRetry', () => {
    it('should not retry if max retries reached', () => {
      const error = { response: { status: 500 } };
      const result = shouldRetry(error, 3, 3);

      expect(result).toBe(false);
    });

    it('should not retry for 404 errors', () => {
      const error = { response: { status: 404 } };
      const result = shouldRetry(error, 0, 3);

      expect(result).toBe(false);
    });

    it('should not retry for 429 rate limit errors', () => {
      const error = { response: { status: 429 } };
      const result = shouldRetry(error, 0, 3);

      expect(result).toBe(false);
    });

    it('should not retry for 400 bad request errors', () => {
      const error = { response: { status: 400 } };
      const result = shouldRetry(error, 0, 3);

      expect(result).toBe(false);
    });

    it('should retry for 500 server errors', () => {
      const error = { response: { status: 500 } };
      const result = shouldRetry(error, 0, 3);

      expect(result).toBe(true);
    });

    it('should retry for 503 service unavailable errors', () => {
      const error = { response: { status: 503 } };
      const result = shouldRetry(error, 1, 3);

      expect(result).toBe(true);
    });

    it('should retry for network errors', () => {
      const error = { code: 'ECONNABORTED' };
      const result = shouldRetry(error, 0, 3);

      expect(result).toBe(true);
    });

    it('should respect custom max retries', () => {
      const error = { response: { status: 500 } };
      expect(shouldRetry(error, 0, 5)).toBe(true);
      expect(shouldRetry(error, 5, 5)).toBe(false);
    });
  });

  describe('calculateRetryDelay', () => {
    it('should return 5 seconds for first 503 retry', () => {
      const result = calculateRetryDelay(0, 503);
      expect(result).toBe(5000);
    });

    it('should return 10 seconds for second 503 retry', () => {
      const result = calculateRetryDelay(1, 503);
      expect(result).toBe(10000);
    });

    it('should return 15 seconds for third 503 retry', () => {
      const result = calculateRetryDelay(2, 503);
      expect(result).toBe(15000);
    });

    it('should return 15 seconds for additional 503 retries', () => {
      const result = calculateRetryDelay(5, 503);
      expect(result).toBe(15000);
    });

    it('should use exponential backoff for other errors', () => {
      expect(calculateRetryDelay(0, 500)).toBe(1000);  // 1 * 2^0
      expect(calculateRetryDelay(1, 500)).toBe(2000);  // 1 * 2^1
      expect(calculateRetryDelay(2, 500)).toBe(4000);  // 1 * 2^2
    });

    it('should cap exponential backoff at 5 seconds', () => {
      expect(calculateRetryDelay(10, 500)).toBe(5000);
      expect(calculateRetryDelay(20, 500)).toBe(5000);
    });

    it('should handle undefined status code', () => {
      const result = calculateRetryDelay(1);
      expect(result).toBe(2000);
    });
  });

  describe('getSymbolErrorMessage', () => {
    it('should return error message with symbol for en-US', () => {
      const result = getSymbolErrorMessage('AAPL', 'en-US');
      expect(result).toContain('AAPL');
      expect(result).toContain('not found');
    });

    it('should return error message with symbol for zh-TW', () => {
      const result = getSymbolErrorMessage('2330.TW', 'zh-TW');
      expect(result).toContain('2330.TW');
      expect(result).toContain('找不到');
    });
  });

  describe('isNetworkError', () => {
    it('should return true for ECONNABORTED code', () => {
      const error = { code: 'ECONNABORTED' };
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for ETIMEDOUT code', () => {
      const error = { code: 'ETIMEDOUT' };
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for network in message', () => {
      const error = { message: 'network error occurred' };
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for timeout in message', () => {
      const error = { message: 'Request timeout' };
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = { response: { status: 404 } };
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should return true for 500 status', () => {
      const error = { response: { status: 500 } };
      expect(isServerError(error)).toBe(true);
    });

    it('should return true for 503 status', () => {
      const error = { response: { status: 503 } };
      expect(isServerError(error)).toBe(true);
    });

    it('should return true for 599 status', () => {
      const error = { response: { status: 599 } };
      expect(isServerError(error)).toBe(true);
    });

    it('should return false for 404 status', () => {
      const error = { response: { status: 404 } };
      expect(isServerError(error)).toBe(false);
    });

    it('should return false for 400 status', () => {
      const error = { response: { status: 400 } };
      expect(isServerError(error)).toBe(false);
    });

    it('should return false for undefined status', () => {
      const error = {};
      expect(isServerError(error)).toBe(false);
    });
  });
});
