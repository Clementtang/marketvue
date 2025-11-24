import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration
 *
 * Optimized for stock data fetching with:
 * - 5 minute stale time (matches backend cache)
 * - 10 minute garbage collection time
 * - 3 retries with exponential backoff
 * - Refetch on window focus for fresh data
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes (matches backend cache)
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
  },
});

export default queryClient;
