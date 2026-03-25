import { useQuery } from "@tanstack/react-query";
import { fetchNews } from "../api/newsApi";
import type { NewsArticle } from "../types/news";

const NEWS_STALE_TIME = 15 * 60 * 1000; // 15 minutes

interface UseNewsDataOptions {
  symbol: string;
  enabled: boolean;
}

interface UseNewsDataReturn {
  news: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useNewsData({
  symbol,
  enabled,
}: UseNewsDataOptions): UseNewsDataReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["news", symbol],
    queryFn: () => fetchNews(symbol),
    enabled: enabled && !!symbol,
    staleTime: NEWS_STALE_TIME,
    gcTime: 30 * 60 * 1000,
    throwOnError: false,
  });

  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Failed to load news"
    : null;

  return {
    news: data?.news ?? [],
    isLoading,
    error: errorMessage,
    refetch: () => void refetch(),
  };
}
