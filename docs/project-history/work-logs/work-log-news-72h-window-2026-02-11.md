# 工作日誌：新聞功能 72h 時間窗口 + 移除分頁

**日期**：2026-02-11
**版本**：v1.14.1 → v1.15.0
**類別**：功能改進 (Feature Improvement)

---

## 任務概述

統一所有新聞來源的時間窗口為 72 小時，並移除文章數量限制與分頁機制。使用者可一次瀏覽 72h 內所有相關新聞。

### 變更動機

- Finnhub 原固定抓 7 天 → 統一為 72 小時
- Google News RSS 原無時間過濾 → 新增 post-fetch 72h 過濾
- 原 default 10 篇 / max 50 篇限制 → 移除，顯示全部
- 原有分頁 (limit/page) → 移除，一次載入

---

## 後端變更

| 檔案                                       | 變更                                                           |
| ------------------------------------------ | -------------------------------------------------------------- |
| `backend/constants.py`                     | 新增 `NEWS_TIME_WINDOW_HOURS = 72`，移除 `NEWS_DEFAULT_LIMIT`  |
| `backend/services/finnhub_news_fetcher.py` | `timedelta(days=7)` → `timedelta(hours=72)`，移除 `limit` 參數 |
| `backend/services/google_news_fetcher.py`  | 新增 `_filter_by_time_window()` 方法，移除 `limit` 參數        |
| `backend/services/news_service.py`         | 移除分頁邏輯，新增 72h 過濾，簡化回傳格式                      |
| `backend/routes/news_routes.py`            | 移除 `limit`/`page` query params                               |

## 前端變更

| 檔案                                | 變更                                                |
| ----------------------------------- | --------------------------------------------------- |
| `src/api/newsApi.ts`                | 移除 `limit`/`page` 參數                            |
| `src/types/news.ts`                 | 移除 `has_more` 欄位                                |
| `src/hooks/useNewsData.ts`          | 移除分頁 state 和 `fetchNextPage`，簡化為單次 fetch |
| `src/components/news/NewsPanel.tsx` | 移除 "Load More" 按鈕                               |

## 測試更新

| 檔案                                         | 變更                              |
| -------------------------------------------- | --------------------------------- |
| `backend/tests/test_news_service.py`         | 移除分頁測試，新增回傳格式測試    |
| `backend/tests/test_news_routes.py`          | 移除 limit/page 測試              |
| `backend/tests/test_finnhub_news_fetcher.py` | 移除 limit 測試，新增全量回傳測試 |
| `backend/tests/test_google_news_fetcher.py`  | 新增 72h 過濾測試                 |
| `src/hooks/__tests__/useNewsData.test.ts`    | 移除分頁測試                      |

---

## 驗證結果

| 項目                        | 結果                       |
| --------------------------- | -------------------------- |
| Backend pytest              | 272 passed, 88.7% coverage |
| TypeScript (`tsc --noEmit`) | 零錯誤                     |
| Vitest                      | 165 passed                 |
| `npm run build`             | 成功                       |

---

## 環境設定

- 在 Render 後端服務設定 `FINNHUB_API_KEY` 環境變數
- 本地開發需在 `.env` 設定 `FINNHUB_API_KEY` 才能取得美股新聞

---

## API 變更摘要

**Before (v1.14.1)**:

```
GET /api/v1/news/{symbol}?limit=10&page=1
→ { symbol, news[], total, has_more, cached_at }
```

**After (v1.15.0)**:

```
GET /api/v1/news/{symbol}
→ { symbol, news[], total, cached_at }
```

72h 內所有文章一次回傳，不分頁。
