# Stock News Feature Design

> **Created**: 2026-02-09
> **Version**: 1.14.0
> **Priority**: HIGH
> **Status**: Implemented (v1.14.1 — updated v1.15.0: 72h window, no pagination)

---

## 1. Overview

Add per-stock news viewing to MarketVue. Users can access relevant news articles for any stock in their dashboard via a hover-revealed icon button on each stock card. News is fetched from mixed sources (Finnhub for US stocks, Google News RSS for Asian markets) and displayed in a responsive slide panel (desktop) or full-screen modal (mobile).

### Goals

- View recent news for any tracked stock without leaving the dashboard
- Support bilingual news (English for US stocks, Chinese for TW/HK stocks)
- Minimal UI footprint — news entry point is unobtrusive
- Fast loading with proper caching (15-minute TTL)

### Non-Goals

- Real-time news streaming / push notifications
- News sentiment analysis or AI summaries
- News aggregation page across all stocks
- User-configurable news sources

---

## 2. News Sources

| Market               | Source               | Language | API                                                                       |
| -------------------- | -------------------- | -------- | ------------------------------------------------------------------------- |
| US stocks            | Finnhub Company News | English  | `GET /api/v1/company-news?symbol=AAPL&from=...&to=...`                    |
| TW stocks (.TW/.TWO) | Google News RSS      | zh-TW    | `https://news.google.com/rss/search?q={company_name}+股票&hl=zh-TW&gl=TW` |
| HK stocks (.HK)      | Google News RSS      | zh-TW    | `https://news.google.com/rss/search?q={company_name}&hl=zh-TW&gl=HK`      |
| JP stocks (.T)       | Google News RSS      | en-US    | `https://news.google.com/rss/search?q={company_name_en}&hl=en&gl=JP`      |

### Finnhub Free Tier

- 60 requests/minute
- Company news only for North American stocks
- Returns: headline, summary, source, image URL, datetime, article URL
- API key required (env var: `FINNHUB_API_KEY`)

### Google News RSS

- No API key required
- Returns: title, link, pubDate, source
- No image or summary — need to extract from feed metadata
- Rate limiting: respectful delays (200ms between requests)

---

## 3. Backend API Design

### New Endpoint

```
GET /api/v1/news/{symbol}
```

No pagination parameters. Returns all articles from the past **72 hours**.

**Response Format** (unified across all sources):

```json
{
  "symbol": "AAPL",
  "news": [
    {
      "id": "finnhub_15805925",
      "headline": "Apple announces new product line...",
      "summary": "Shares of Apple Inc. rose 2% after...",
      "source": "MarketWatch",
      "url": "https://www.marketwatch.com/...",
      "image": "https://s.marketwatch.com/...",
      "published_at": "2026-02-09T10:30:00Z",
      "language": "en-US"
    }
  ],
  "total": 12,
  "cached_at": "2026-02-09T10:35:00Z"
}
```

### Backend Architecture

```
backend/
├── routes/
│   └── news_routes.py          # GET /api/v1/news/<symbol>
├── services/
│   ├── news_service.py         # News orchestration (source routing)
│   ├── finnhub_news_fetcher.py # Finnhub API client
│   └── google_news_fetcher.py  # Google News RSS parser
├── schemas/
│   └── news_schemas.py         # Marshmallow validation
└── constants.py                # NEWS_CACHE_TIMEOUT, NEWS_TIME_WINDOW_HOURS
```

### Source Routing Logic (news_service.py)

```python
def get_news(symbol: str) -> dict:
    if is_us_stock(symbol):
        return finnhub_fetcher.fetch(symbol)  # 72h window via API date range
    else:
        company_name = get_company_name(symbol, language)
        return google_news_fetcher.fetch(company_name, symbol)  # 72h post-fetch filter
```

### Caching Strategy

- Cache key: `news:{SYMBOL}` (no date range — always latest)
- TTL: 15 minutes (`CACHE_NEWS_TIMEOUT` already in config.py = 900s)
- Invalidation: TTL-based only (no manual invalidation needed)

### Error Handling

- Finnhub API key missing → return empty news list with warning
- Finnhub rate limit → return cached data or empty with retry-after header
- Google News RSS parse failure → return empty list, log error
- Network timeout (10s) → return cached data or error

---

## 4. Frontend UI Design

### 4.1 News Button on Stock Card

A small `Newspaper` icon button appears in the StockCard header area. Hidden by default on desktop, revealed on card hover. Always visible (but subtle) on mobile.

**Placement**: Between company name and price, vertically centered.

```
Desktop (idle):                    Desktop (card hover):
┌───────────────────────────┐     ┌───────────────────────────┐
│ AAPL          $234.50 USD │     │ AAPL    [📰]  $234.50 USD │
│ Apple Inc.    +2.50 +1.08%│     │ Apple Inc.    +2.50 +1.08%│
└───────────────────────────┘     └───────────────────────────┘

Mobile (always visible, low opacity):
┌───────────────────────────┐
│ AAPL    [📰]  $234.50 USD │  (opacity: 0.4)
│ Apple Inc.    +2.50 +1.08%│
└───────────────────────────┘
```

**Button Specs**:

| Property           | Value                                                       |
| ------------------ | ----------------------------------------------------------- |
| Icon               | Lucide `Newspaper`, 14px                                    |
| Click area         | 24x24px (meets touch target minimum)                        |
| z-index            | 20 (above drag-handle z-10)                                 |
| Desktop visibility | `opacity: 0` → `opacity: 1` on card hover, 200ms transition |
| Mobile visibility  | `opacity: 0.4` always, `opacity: 1` on tap                  |
| Warm theme         | `text-warm-500`, hover: `bg-warm-100/80 rounded-xl`         |
| Classic theme      | `text-gray-400`, hover: `bg-gray-100/80 rounded-lg`         |
| Event handling     | `e.stopPropagation()` to prevent drag trigger               |

### 4.2 News Panel

**Desktop (>=768px)**: Right-side slide panel

- Width: 420px
- Slides in from right edge of viewport
- Semi-transparent backdrop on the left (click to close)
- Does not shift the dashboard grid (overlay)
- Close button + ESC key to dismiss

**Mobile (<768px)**: Bottom sheet / full-screen modal

- Slides up from bottom
- Full viewport width and height
- Back arrow + swipe down to close

### 4.3 News Panel Content

```
┌──────────────────────────────────┐
│  ← AAPL News            [Close] │  ← Header
│──────────────────────────────────│
│                                  │
│  ┌────────────────────────────┐  │
│  │ [img]  Headline text...    │  │  ← News card
│  │        Source · 2 hrs ago  │  │
│  │        Summary text...     │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │        Headline text...    │  │  ← News card (no image)
│  │        Source · 5 hrs ago  │  │
│  │        Summary text...     │  │
│  └────────────────────────────┘  │
│                                  │
│        (all 72h articles shown)  │
│                                  │
└──────────────────────────────────┘
```

**News Card Fields**:

| Field        | Display                     | Notes                                                 |
| ------------ | --------------------------- | ----------------------------------------------------- |
| headline     | Bold, 2 lines max, truncate | Clickable → opens original article in new tab         |
| source       | Small text, gray            | e.g., "MarketWatch"                                   |
| published_at | Relative time               | e.g., "2 hours ago", "3 天前"                         |
| summary      | Normal text, 3 lines max    | Only shown if available (Finnhub has it, RSS may not) |
| image        | 60x60 thumbnail, rounded    | Only shown if available, left-aligned                 |

**Empty State**: "No news found for {symbol}" with icon.

**Loading State**: 3 skeleton cards with shimmer animation.

### 4.4 Frontend Architecture

```
src/
├── components/
│   ├── stock-card/
│   │   └── StockCardHeader.tsx     # MODIFY: add news icon button
│   └── news/
│       ├── NewsPanel.tsx           # Slide panel / modal wrapper
│       ├── NewsPanelHeader.tsx     # Panel header with close button
│       ├── NewsCard.tsx            # Individual news article card
│       ├── NewsCardSkeleton.tsx    # Loading skeleton
│       └── NewsEmptyState.tsx      # Empty state component
├── api/
│   └── newsApi.ts                  # API client for /api/v1/news/{symbol}
├── hooks/
│   └── useNewsData.ts              # React Query hook for news fetching
├── types/
│   └── news.ts                     # NewsArticle, NewsResponse types
└── i18n/
    └── translations.ts             # MODIFY: add news-related strings
```

---

## 5. i18n Additions

```typescript
// New translation keys
news: string; // "News" / "新聞"
newsFor: string; // "News for {symbol}" / "{symbol} 相關新聞"
noNewsFound: string; // "No news found" / "找不到相關新聞"
loadMore: string; // "Load More" / "載入更多"
hoursAgo: string; // "{n} hours ago" / "{n} 小時前"
daysAgo: string; // "{n} days ago" / "{n} 天前"
minutesAgo: string; // "{n} minutes ago" / "{n} 分鐘前"
justNow: string; // "Just now" / "剛剛"
newsLoadError: string; // "Failed to load news" / "新聞載入失敗"
newsRetry: string; // "Retry" / "重試"
openArticle: string; // "Read full article" / "閱讀全文"
```

---

## 6. Implementation Plan

### Phase 1: Backend (news API) — COMPLETED (v1.14.0)

| #   | Task                                | Files                              | Status |
| --- | ----------------------------------- | ---------------------------------- | ------ |
| 1.1 | Create news types/schemas           | `schemas/news_schemas.py`          | Done   |
| 1.2 | Implement Finnhub news fetcher      | `services/finnhub_news_fetcher.py` | Done   |
| 1.3 | Implement Google News RSS fetcher   | `services/google_news_fetcher.py`  | Done   |
| 1.4 | Create news service (orchestration) | `services/news_service.py`         | Done   |
| 1.5 | Create news routes                  | `routes/news_routes.py`            | Done   |
| 1.6 | Register blueprint in app.py        | `app.py`                           | Done   |
| 1.7 | Add constants & env vars            | `constants.py`, `.env.example`     | Done   |
| 1.8 | Backend tests                       | `tests/test_news_*.py`             | Done   |

### Phase 2: Frontend (UI components) — COMPLETED (v1.14.0)

| #   | Task                               | Files                                                        | Status |
| --- | ---------------------------------- | ------------------------------------------------------------ | ------ |
| 2.1 | Add news types                     | `types/news.ts`                                              | Done   |
| 2.2 | Add news API client                | `api/newsApi.ts`                                             | Done   |
| 2.3 | Add useNewsData hook               | `hooks/useNewsData.ts`                                       | Done   |
| 2.4 | Build NewsCard component           | `components/news/NewsCard.tsx`                               | Done   |
| 2.5 | Build NewsPanel (desktop + mobile) | `components/news/NewsPanel.tsx`                              | Done   |
| 2.6 | Build skeleton & empty state       | `components/news/NewsCardSkeleton.tsx`, `NewsEmptyState.tsx` | Done   |
| 2.7 | Add news button to StockCardHeader | `components/stock-card/StockCardHeader.tsx`                  | Done   |
| 2.8 | Add i18n strings                   | `i18n/translations.ts`                                       | Done   |
| 2.9 | Frontend tests                     | `hooks/__tests__/useNewsData.test.ts`                        | Done   |

### Phase 3: Integration & QA — COMPLETED (v1.14.1)

| #   | Task                                            | Status |
| --- | ----------------------------------------------- | ------ |
| 3.1 | End-to-end integration testing (manual)         | Done   |
| 3.2 | Cross-browser testing (Chrome, Firefox, Safari) | Done   |
| 3.3 | Mobile responsive testing                       | Done   |
| 3.4 | Dark mode / theme compatibility                 | Done   |
| 3.5 | Update CHANGELOG, version bump                  | Done   |

### Phase 4: 72h Time Window & Remove Pagination — v1.15.0

| #   | Task                                  | Files                                           | Status |
| --- | ------------------------------------- | ----------------------------------------------- | ------ |
| 4.1 | Add NEWS_TIME_WINDOW_HOURS constant   | `constants.py`                                  | Done   |
| 4.2 | Finnhub: 72h window, remove limit     | `services/finnhub_news_fetcher.py`              | Done   |
| 4.3 | Google News: 72h filter, remove limit | `services/google_news_fetcher.py`               | Done   |
| 4.4 | News service: remove pagination       | `services/news_service.py`                      | Done   |
| 4.5 | Routes: remove limit/page params      | `routes/news_routes.py`                         | Done   |
| 4.6 | Frontend: remove pagination           | `newsApi.ts`, `useNewsData.ts`, `NewsPanel.tsx` | Done   |
| 4.7 | Update tests                          | `tests/test_news_*.py`, `useNewsData.test.ts`   | Done   |
| 4.8 | Update design doc                     | `docs/plans/...design.md`                       | Done   |

---

## 7. Environment Variables

```env
# .env / .env.example
FINNHUB_API_KEY=your_finnhub_api_key_here
NEWS_CACHE_TIMEOUT=900          # 15 minutes (optional, defaults in constants.py)
NEWS_TIME_WINDOW_HOURS=72       # Only show news from the past 72 hours
NEWS_REQUEST_TIMEOUT=10         # Seconds
```

---

## 8. Dependencies

### Backend (new)

```
feedparser>=6.0.0    # RSS feed parsing for Google News
```

### Frontend (no new dependencies)

- Uses existing: React Query, Lucide icons, react-spring, Tailwind CSS

---

## 9. Risk & Mitigation

| Risk                                   | Impact                         | Mitigation                                                           |
| -------------------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| Finnhub API key not set                | US stock news unavailable      | Graceful fallback: return empty list with "news unavailable" message |
| Google News RSS format changes         | RSS parsing breaks             | Defensive parsing with try/catch per field, log warnings             |
| Rate limiting (Finnhub 60/min)         | Burst of news requests blocked | Backend caching (15min TTL) reduces actual API calls significantly   |
| Google News returns irrelevant results | Poor UX                        | Use specific search queries with stock symbol + company name         |
| Large news response payload            | Slow loading                   | 72h time window limits volume naturally, lazy load images            |

---

## 10. Success Criteria

- [x] Users can view news for any stock via hover icon
- [x] US stocks show Finnhub news with images and summaries
- [x] TW/HK stocks show Chinese-language news from Google News
- [x] JP stocks show English-language news from Google News
- [x] News panel is responsive (slide panel on desktop, modal on mobile)
- [x] News is cached for 15 minutes to reduce API calls
- [x] All UI strings are bilingual (en-US / zh-TW)
- [x] Backend tests cover all news service paths (80%+ coverage)
- [x] Frontend hook tests cover loading/error/success states
- [x] Dark mode and both visual themes (classic/warm) supported
- [x] Only news from the past 72 hours is displayed (no article limit)
- [x] No pagination — all articles within 72h window shown at once

---

**Author**: Frieren (Claude Code)
**Last Updated**: 2026-02-11
