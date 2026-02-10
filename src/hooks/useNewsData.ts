import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNews } from "../api/newsApi";
import type { NewsArticle } from "../types/news";

const NEWS_PAGE_SIZE = 10;
const NEWS_STALE_TIME = 15 * 60 * 1000; // 15 minutes

interface UseNewsDataOptions {
  symbol: string;
  enabled: boolean;
}

interface UseNewsDataReturn {
  news: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  fetchNextPage: () => void;
  hasMore: boolean;
}

export function useNewsData({
  symbol,
  enabled,
}: UseNewsDataOptions): UseNewsDataReturn {
  const [page, setPage] = useState(1);
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const { isLoading, error } = useQuery({
    queryKey: ["news", symbol, page],
    queryFn: async () => {
      const response = await fetchNews(symbol, NEWS_PAGE_SIZE, page);
      setAllNews((prev) => {
        if (page === 1) return response.news;
        // Deduplicate by id
        const existingIds = new Set(prev.map((n) => n.id));
        const newArticles = response.news.filter((n) => !existingIds.has(n.id));
        return [...prev, ...newArticles];
      });
      setHasMore(response.has_more);
      return response;
    },
    enabled: enabled && !!symbol,
    staleTime: NEWS_STALE_TIME,
    gcTime: 30 * 60 * 1000,
    throwOnError: false,
  });

  const fetchNextPage = useCallback(() => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Failed to load news"
    : null;

  return {
    news: allNews,
    isLoading,
    error: errorMessage,
    fetchNextPage,
    hasMore,
  };
}
