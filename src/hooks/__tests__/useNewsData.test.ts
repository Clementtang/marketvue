import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import type { ReactNode } from "react";
import { useNewsData } from "../useNewsData";
import * as newsApi from "../../api/newsApi";

vi.mock("../../api/newsApi");

const mockNewsResponse = {
  symbol: "AAPL",
  news: [
    {
      id: "test-1",
      headline: "Apple announces new product",
      summary: "Apple Inc. revealed its latest innovation.",
      source: "MarketWatch",
      url: "https://example.com/article-1",
      image: "https://example.com/image-1.jpg",
      published_at: "2026-02-09T10:30:00Z",
      language: "en-US",
    },
    {
      id: "test-2",
      headline: "AAPL stock rises",
      summary: null,
      source: "Reuters",
      url: "https://example.com/article-2",
      image: null,
      published_at: "2026-02-09T08:00:00Z",
      language: "en-US",
    },
  ],
  total: 2,
  cached_at: "2026-02-09T10:35:00Z",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useNewsData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not fetch when disabled", () => {
    const fetchNewsSpy = vi.mocked(newsApi.fetchNews);

    renderHook(() => useNewsData({ symbol: "AAPL", enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(fetchNewsSpy).not.toHaveBeenCalled();
  });

  it("should return loading state initially when enabled", () => {
    vi.mocked(newsApi.fetchNews).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(
      () => useNewsData({ symbol: "AAPL", enabled: true }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.news).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should return news data on success", async () => {
    vi.mocked(newsApi.fetchNews).mockResolvedValue(mockNewsResponse);

    const { result } = renderHook(
      () => useNewsData({ symbol: "AAPL", enabled: true }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.news).toHaveLength(2);
    expect(result.current.news[0].headline).toBe("Apple announces new product");
    expect(result.current.error).toBeNull();
  });

  it("should return error message on failure", async () => {
    vi.mocked(newsApi.fetchNews).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(
      () => useNewsData({ symbol: "AAPL", enabled: true }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.news).toEqual([]);
  });

  it("should call fetchNews with symbol only", async () => {
    const fetchNewsSpy = vi
      .mocked(newsApi.fetchNews)
      .mockResolvedValue(mockNewsResponse);

    renderHook(() => useNewsData({ symbol: "AAPL", enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(fetchNewsSpy).toHaveBeenCalledWith("AAPL");
    });
  });

  it("should not fetch when symbol is empty", () => {
    const fetchNewsSpy = vi.mocked(newsApi.fetchNews);

    renderHook(() => useNewsData({ symbol: "", enabled: true }), {
      wrapper: createWrapper(),
    });

    expect(fetchNewsSpy).not.toHaveBeenCalled();
  });
});
