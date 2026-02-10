import axios from "axios";
import type { NewsResponse } from "../types/news";
import { API_CONFIG } from "../config/constants";

export async function fetchNews(
  symbol: string,
  limit: number = 10,
  page: number = 1,
): Promise<NewsResponse> {
  const response = await axios.get<NewsResponse>(
    `${API_CONFIG.BASE_URL}/api/v1/news/${encodeURIComponent(symbol)}`,
    {
      params: { limit, page },
      timeout: API_CONFIG.TIMEOUT,
    },
  );
  return response.data;
}
