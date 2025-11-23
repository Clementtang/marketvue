import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRetry, defaultShouldRetry, defaultCalculateDelay } from '../useRetry';

describe('useRetry Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Execution', () => {
    it('should execute async function successfully', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useRetry(mockFn));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe(null);

      await act(async () => {
        await result.current.execute();
      });

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result.current.data).toBe('success');
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle async function that returns object', async () => {
      const mockData = { id: 1, name: 'test' };
      const mockFn = vi.fn().mockResolvedValue(mockData);
      const { result } = renderHook(() => useRetry(mockFn));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should set error when async function fails with no retries', async () => {
      const mockError = new Error('Test error');
      const mockFn = vi.fn().mockRejectedValue(mockError);
      const { result } = renderHook(() =>
        useRetry(mockFn, { maxRetries: 0 })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toBe(null);
    });

    it('should return null data on error', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Error'));
      const { result } = renderHook(() =>
        useRetry(mockFn, { maxRetries: 0 })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe(null);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset state when reset is called', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const { result } = renderHook(() => useRetry(mockFn));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('success');

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
      expect(result.current.retryCount).toBe(0);
      expect(result.current.isLoading).toBe(false);
    });

    it('should reset error state', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));
      const { result } = renderHook(() =>
        useRetry(mockFn, { maxRetries: 0 })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).not.toBe(null);

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Custom shouldRetry', () => {
    it('should use custom shouldRetry function', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Fail'));
      const customShouldRetry = vi.fn().mockReturnValue(false);

      const { result } = renderHook(() =>
        useRetry(mockFn, {
          maxRetries: 3,
          shouldRetry: customShouldRetry,
        })
      );

      await act(async () => {
        await result.current.execute();
      });

      // Should only be called once since shouldRetry returns false
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(customShouldRetry).toHaveBeenCalled();
    });

    it('should pass error and attemptCount to shouldRetry', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('TestError'));
      const customShouldRetry = vi.fn().mockReturnValue(false);

      const { result } = renderHook(() =>
        useRetry(mockFn, {
          maxRetries: 3,
          shouldRetry: customShouldRetry,
        })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(customShouldRetry).toHaveBeenCalledWith(
        expect.any(Error),
        0
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-Error thrown values', async () => {
      const mockFn = vi.fn().mockRejectedValue('string error');
      const { result } = renderHook(() =>
        useRetry(mockFn, { maxRetries: 0 })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('string error');
    });

    it('should handle multiple execute calls', async () => {
      const mockFn = vi.fn()
        .mockResolvedValueOnce('first')
        .mockResolvedValueOnce('second');

      const { result } = renderHook(() => useRetry(mockFn));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('first');

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('second');
    });

    it('should handle number thrown as error', async () => {
      const mockFn = vi.fn().mockRejectedValue(404);
      const { result } = renderHook(() =>
        useRetry(mockFn, { maxRetries: 0 })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('404');
    });

    it('should handle object thrown as error', async () => {
      const mockFn = vi.fn().mockRejectedValue({ code: 'ERR' });
      const { result } = renderHook(() =>
        useRetry(mockFn, { maxRetries: 0 })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useRetry(mockFn));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isRetrying).toBe(false);
      expect(result.current.retryCount).toBe(0);
      expect(result.current.error).toBe(null);
      expect(result.current.data).toBe(null);
    });

    it('should provide execute function', () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useRetry(mockFn));

      expect(typeof result.current.execute).toBe('function');
    });

    it('should provide reset function', () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useRetry(mockFn));

      expect(typeof result.current.reset).toBe('function');
    });

    it('should provide cancel function', () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useRetry(mockFn));

      expect(typeof result.current.cancel).toBe('function');
    });
  });
});

describe('defaultShouldRetry', () => {
  describe('Non-retryable errors', () => {
    it('should not retry for 404 errors', () => {
      const error = { response: { status: 404 } };
      expect(defaultShouldRetry(error, 0)).toBe(false);
    });

    it('should not retry for 401 errors', () => {
      const error = { response: { status: 401 } };
      expect(defaultShouldRetry(error, 0)).toBe(false);
    });

    it('should not retry for 403 errors', () => {
      const error = { response: { status: 403 } };
      expect(defaultShouldRetry(error, 0)).toBe(false);
    });

    it('should not retry for 400 errors', () => {
      const error = { response: { status: 400 } };
      expect(defaultShouldRetry(error, 0)).toBe(false);
    });
  });

  describe('Retryable errors', () => {
    it('should retry for 500 errors', () => {
      const error = { response: { status: 500 } };
      expect(defaultShouldRetry(error, 0)).toBe(true);
    });

    it('should retry for 502 errors', () => {
      const error = { response: { status: 502 } };
      expect(defaultShouldRetry(error, 0)).toBe(true);
    });

    it('should retry for 503 errors', () => {
      const error = { response: { status: 503 } };
      expect(defaultShouldRetry(error, 0)).toBe(true);
    });

    it('should retry for 504 errors', () => {
      const error = { response: { status: 504 } };
      expect(defaultShouldRetry(error, 0)).toBe(true);
    });

    it('should retry for timeout errors (ECONNABORTED)', () => {
      const error = { code: 'ECONNABORTED' };
      expect(defaultShouldRetry(error, 0)).toBe(true);
    });

    it('should retry for timeout errors (ETIMEDOUT)', () => {
      const error = { code: 'ETIMEDOUT' };
      expect(defaultShouldRetry(error, 0)).toBe(true);
    });

    it('should retry for network unreachable errors', () => {
      const error = { code: 'ENETUNREACH' };
      expect(defaultShouldRetry(error, 0)).toBe(true);
    });

    it('should retry for timeout message errors', () => {
      const error = { message: 'Request timeout' };
      expect(defaultShouldRetry(error, 0)).toBe(true);
    });
  });

  describe('Generic errors', () => {
    it('should retry for generic errors', () => {
      const error = new Error('Generic error');
      expect(defaultShouldRetry(error, 0)).toBe(true);
    });

    it('should retry for undefined error', () => {
      expect(defaultShouldRetry(undefined, 0)).toBe(true);
    });
  });
});

describe('defaultCalculateDelay', () => {
  describe('Cold start (503) delays', () => {
    it('should return 5000ms for first 503 retry', () => {
      const error = { response: { status: 503 } };
      expect(defaultCalculateDelay(error, 0, 1000, 2, 30000)).toBe(5000);
    });

    it('should return 10000ms for second 503 retry', () => {
      const error = { response: { status: 503 } };
      expect(defaultCalculateDelay(error, 1, 1000, 2, 30000)).toBe(10000);
    });

    it('should return 15000ms for third 503 retry', () => {
      const error = { response: { status: 503 } };
      expect(defaultCalculateDelay(error, 2, 1000, 2, 30000)).toBe(15000);
    });

    it('should return 20000ms for fourth+ 503 retry', () => {
      const error = { response: { status: 503 } };
      expect(defaultCalculateDelay(error, 3, 1000, 2, 30000)).toBe(20000);
    });

    it('should cap 503 delay at maxDelay', () => {
      const error = { response: { status: 503 } };
      expect(defaultCalculateDelay(error, 3, 1000, 2, 15000)).toBe(15000);
    });
  });

  describe('Rate limit (429) delays', () => {
    it('should use retry-after header when present', () => {
      const error = {
        response: {
          status: 429,
          headers: { 'retry-after': '5' }
        }
      };
      expect(defaultCalculateDelay(error, 0, 1000, 2, 30000)).toBe(5000);
    });

    it('should cap retry-after at maxDelay', () => {
      const error = {
        response: {
          status: 429,
          headers: { 'retry-after': '60' }
        }
      };
      expect(defaultCalculateDelay(error, 0, 1000, 2, 30000)).toBe(30000);
    });

    it('should return 10000ms without retry-after header', () => {
      const error = { response: { status: 429 } };
      expect(defaultCalculateDelay(error, 0, 1000, 2, 30000)).toBe(10000);
    });
  });

  describe('Exponential backoff', () => {
    it('should return initialDelay for first retry', () => {
      const error = { response: { status: 500 } };
      expect(defaultCalculateDelay(error, 0, 1000, 2, 30000)).toBe(1000);
    });

    it('should double delay for second retry', () => {
      const error = { response: { status: 500 } };
      expect(defaultCalculateDelay(error, 1, 1000, 2, 30000)).toBe(2000);
    });

    it('should quadruple delay for third retry', () => {
      const error = { response: { status: 500 } };
      expect(defaultCalculateDelay(error, 2, 1000, 2, 30000)).toBe(4000);
    });

    it('should use custom backoffMultiplier', () => {
      const error = { response: { status: 500 } };
      expect(defaultCalculateDelay(error, 1, 1000, 3, 30000)).toBe(3000);
    });

    it('should cap delay at maxDelay', () => {
      const error = { response: { status: 500 } };
      expect(defaultCalculateDelay(error, 10, 1000, 2, 5000)).toBe(5000);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined error', () => {
      expect(defaultCalculateDelay(undefined, 0, 1000, 2, 30000)).toBe(1000);
    });

    it('should handle null error', () => {
      expect(defaultCalculateDelay(null, 0, 1000, 2, 30000)).toBe(1000);
    });

    it('should handle error without response', () => {
      const error = new Error('Network error');
      expect(defaultCalculateDelay(error, 0, 1000, 2, 30000)).toBe(1000);
    });
  });
});
