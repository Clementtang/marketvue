# Work Log — Capture all stocks across pages (v1.20.0)

**Date:** 2026-06-12
**Scope:** Let the screenshot include every stock, not just the current page.

## Problem

The dashboard paginates at 9 cards (3×3), but the watchlist holds up to 18.
The screenshot only captured the visible page, so a user with two pages could
never produce a single image of their whole watchlist — directly at odds with
MarketVue's purpose (arrange stocks, then screenshot).

The naive fix — render all pages and capture — risks photographing loading
skeletons, because off-page cards have not fetched their data yet.

## Solution

A new **"All"** screenshot action orchestrated by `DashboardGrid`:

1. **Pre-warm the cache.** `prepareFullCapture` calls
   `queryClient.ensureQueryData` for every symbol using the *same* query key
   (`getStockQueryKey`) and fetcher (`fetchStockDataBatched`) the cards use.
   The existing request queue batches all symbols into one backend call. Uses
   `Promise.allSettled` so one failing symbol doesn't block the rest.
2. **Render everything.** Sets `isCapturingAll`, which makes `displayStocks`
   the full watchlist on a single page. The stagger animation is set to
   `immediate` so cards aren't captured mid-fade.
3. **Wait + capture.** Waits 600ms for React + Recharts to settle, then
   `ScreenshotButton` captures via the shared `captureScreenshot`.
4. **Restore.** `endFullCapture` returns to the paginated view in a `finally`.

Because the cards read the just-prefetched, fresh cache entries and the query
client has `refetchOnMount: false`, off-page cards render immediately with data
rather than skeletons.

### API

`ScreenshotButton` gained an optional `fullCapture?: { prepare, cleanup }`
prop. When present (only when `stocks.length > itemsPerPage`), it renders the
"All" button; otherwise the toolbar is unchanged.

## Files

- `src/components/DashboardGrid.tsx` — `isCapturingAll` state, `displayStocks`,
  `prepareFullCapture` / `endFullCapture`, disable drag during capture.
- `src/components/ScreenshotButton.tsx` — `fullCapture` prop + "All" button +
  `handleCaptureAll`.
- `src/i18n/translations.ts` — `screenshotAll`, `screenshotAllTitle`.

## Verification

- `tsc -b` clean, `eslint .` clean, `npm run build` succeeds.
- `vitest run` — 161 tests pass.
- Note: the capture timing (600ms settle) is the one heuristic here; if very
  large watchlists ever show a partial chart, raise the delay or gate on a
  per-card "ready" signal.
