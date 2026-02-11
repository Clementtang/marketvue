export interface NewsArticle {
  id: string;
  headline: string;
  summary: string | null;
  source: string;
  url: string;
  image: string | null;
  published_at: string;
  language: string;
}

export interface NewsResponse {
  symbol: string;
  news: NewsArticle[];
  total: number;
  cached_at: string;
}
