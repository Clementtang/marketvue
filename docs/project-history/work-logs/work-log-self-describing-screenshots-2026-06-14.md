# Work Log — Self-describing screenshots (v1.22.0)

**Date:** 2026-06-14
**Scope:** Make shared screenshots self-explanatory by baking a caption into the image.

## Problem

The screenshot captures only `#dashboard-grid-layout` (the card grid). A pasted
image carried no context — which watchlist, what date range — so the recipient
(or the user, later) couldn't tell what they were looking at. The whole point is
"arrange stocks, screenshot, share", so the image should describe itself.

## Change

### Caption inside the captured element

`DashboardGrid` renders a caption at the top of `#dashboard-grid-layout`, shown
only while exporting (`isExporting`):

- Left: the active watchlist name (`activeList.name`).
- Right: `MarketVue · <startDate> ～ <endDate>`.

Because it lives inside the captured element and is gated on `isExporting`, it
appears in the PNG but not in the normal UI.

### Unified export flag across all capture paths

Previously only capture-all set `isExporting` (to disable chart animation).
Single-page screenshot/download didn't, so they wouldn't have shown the caption
and could catch a chart mid-animation.

`ScreenshotButton` now owns `isExporting` for **every** path
(`handlePrimary`, `handleDownload`, `handleCaptureAll`): set it true, wait for an
actual paint (`nextPaint`, double rAF), capture, then clear it in `finally`.
`DashboardGrid.prepareFullCapture` no longer manages the flag (it still does the
data prefetch, render-all, and paint wait).

## Files

- `src/components/ScreenshotButton.tsx` — `useChart().setIsExporting`; `nextPaint`
  helper; wrap all three capture handlers.
- `src/components/DashboardGrid.tsx` — read `isExporting` + `activeList`; render
  the caption; drop `setIsExporting` from prepare/cleanup.

## Verification

- `tsc -b` clean, `eslint` clean, `npm run build` succeeds (no warnings).
- `vitest run` — 165 tests pass (existing DashboardGrid reorder test still green;
  it renders with `isExporting` false, so the caption is absent there).

## Note

The caption is on by default for every screenshot. If a clean, caption-less
image is ever wanted, gate it behind a toggle — the rendering is already
isolated behind `isExporting`.
