import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Options for the useRetry hook
 */
export interface UseRetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds before first retry (default: 1000) */
  initialDelay?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Maximum delay cap in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Custom function to determine if should retry based on error */
  shouldRetry?: (error: Error, attemptCount: number) => boolean;
  /** Custom function to calculate delay based on error and attempt */
  calculateDelay?: (error: Error, attemptCount: number) => number;
  /** Callback when retry starts */
  onRetry?: (attemptCount: number, error: Error) => void;
  /** Callback when all retries exhausted */
  onMaxRetriesReached?: (error: Error) => void;
}

/**
 * Return type for the useRetry hook
 */
export interface UseRetryReturn<T> {
  /** Execute the async function with retry logic */
  execute: () => Promise<T | null>;
  /** Whether currently executing (including retries) */
  isLoading: boolean;
  /** Whether currently in a retry attempt */
  isRetrying: boolean;
  /** Current retry attempt count (0 = first attempt, no retries yet) */
  retryCount: number;
  /** Last error encountered */
  error: Error | null;
  /** The successful result */
  data: T | null;
  /** Manually reset the state */
  reset: () => void;
  /** Cancel any pending retry */
  cancel: () => void;
}

/**
 * Default function to determine if an error should trigger a retry
 */
export function defaultShouldRetry(error: any, _attemptCount: number): boolean {
  // Handle null/undefined errors - retry by default
  if (!error) {
    return true;
  }

  // Don't retry for client errors (4xx except 408 timeout, 429 rate limit)
  const statusCode = error?.response?.status;

  // Non-retryable client errors
  if (statusCode === 400 || statusCode === 401 || statusCode === 403 || statusCode === 404) {
    return false;
  }

  // Always retry for network errors
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH') {
    return true;
  }

  // Retry for timeout errors
  if (error.message?.includes('timeout')) {
    return true;
  }

  // Retry for server errors (5xx)
  if (statusCode && statusCode >= 500) {
    return true;
  }

  // By default, retry for other errors
  return true;
}

/**
 * Default function to calculate retry delay with exponential backoff
 */
export function defaultCalculateDelay(
  error: any,
  attemptCount: number,
  initialDelay: number,
  backoffMultiplier: number,
  maxDelay: number
): number {
  const statusCode = error?.response?.status;

  // Cold start (503) needs longer delays - service starting up
  if (statusCode === 503) {
    const coldStartDelays = [5000, 10000, 15000, 20000];
    return Math.min(coldStartDelays[attemptCount] || 20000, maxDelay);
  }

  // Rate limiting (429) - wait longer
  if (statusCode === 429) {
    const retryAfter = error?.response?.headers?.['retry-after'];
    if (retryAfter) {
      return Math.min(parseInt(retryAfter, 10) * 1000, maxDelay);
    }
    return Math.min(10000, maxDelay);
  }

  // Exponential backoff for other errors
  const delay = initialDelay * Math.pow(backoffMultiplier, attemptCount);
  return Math.min(delay, maxDelay);
}

/**
 * Custom hook for executing async functions with automatic retry logic
 *
 * Features:
 * - Configurable max retries
 * - Exponential backoff
 * - Custom shouldRetry and calculateDelay functions
 * - Special handling for 503 (cold start) and 429 (rate limit)
 * - Cancellation support
 * - TypeScript generics for type safety
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error, data } = useRetry(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *   },
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 *
 * // Execute with retry logic
 * useEffect(() => {
 *   execute();
 * }, []);
 * ```
 */
export function useRetry<T>(
  asyncFn: () => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 30000,
    shouldRetry = defaultShouldRetry,
    calculateDelay,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  // Refs for cancellation and cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCancelledRef = useRef(false);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Calculate delay for retry
   */
  const getDelay = useCallback((err: Error, attempt: number): number => {
    if (calculateDelay) {
      return calculateDelay(err, attempt);
    }
    return defaultCalculateDelay(err, attempt, initialDelay, backoffMultiplier, maxDelay);
  }, [calculateDelay, initialDelay, backoffMultiplier, maxDelay]);

  /**
   * Execute the async function with retry logic
   */
  const execute = useCallback(async (): Promise<T | null> => {
    isCancelledRef.current = false;
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    setIsRetrying(false);

    let currentAttempt = 0;

    const attemptExecution = async (): Promise<T | null> => {
      if (isCancelledRef.current || !isMountedRef.current) {
        setIsLoading(false);
        return null;
      }

      try {
        const result = await asyncFn();

        if (!isMountedRef.current) return null;

        setData(result);
        setError(null);
        setIsLoading(false);
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (!isMountedRef.current || isCancelledRef.current) {
          return null;
        }

        setError(error);

        // Check if we should retry
        if (currentAttempt < maxRetries && shouldRetry(error, currentAttempt)) {
          const delay = getDelay(error, currentAttempt);

          onRetry?.(currentAttempt + 1, error);

          currentAttempt++;
          setRetryCount(currentAttempt);
          setIsRetrying(true);

          // Wait for delay before retrying
          return new Promise((resolve) => {
            timeoutRef.current = setTimeout(async () => {
              if (!isCancelledRef.current && isMountedRef.current) {
                const result = await attemptExecution();
                resolve(result);
              } else {
                resolve(null);
              }
            }, delay);
          });
        } else {
          // Max retries reached or shouldn't retry
          setIsLoading(false);
          setIsRetrying(false);

          if (currentAttempt >= maxRetries) {
            onMaxRetriesReached?.(error);
          }

          return null;
        }
      }
    };

    return attemptExecution();
  }, [asyncFn, maxRetries, shouldRetry, getDelay, onRetry, onMaxRetriesReached]);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    isCancelledRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
    setIsRetrying(false);
    setRetryCount(0);
    setError(null);
    setData(null);
  }, []);

  /**
   * Cancel any pending retry
   */
  const cancel = useCallback(() => {
    isCancelledRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
    setIsRetrying(false);
  }, []);

  return {
    execute,
    isLoading,
    isRetrying,
    retryCount,
    error,
    data,
    reset,
    cancel,
  };
}

export default useRetry;
