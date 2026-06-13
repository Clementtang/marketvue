# Work Log — v1.21.0 follow-ups (perf, capture timing, tests, cleanup)

**Date:** 2026-06-13
**Scope:** Four follow-ups after the mobile/keyboard reordering feature, all
under the 1.21.0 release. (Mobile/keyboard reordering has its own log:
`work-log-mobile-keyboard-reorder-2026-06-13.md`.)

## 2. Bundle code-splitting (`perf`)

The build emitted a single ~1,124 KB app chunk and warned about the 500 KB
limit.

- `vite.config.ts`: `manualChunks` splits `node_modules` into `react-vendor`,
  `recharts` (incl. d3), `react-grid-layout`, and a catch-all `vendor`.
- `App.tsx`: `ThemeGuide` (full-screen, on-demand) is now `React.lazy` +
  `Suspense`.

Result: main app chunk ~261 KB, no chunk-size warning; large libs load in
parallel and cache across deploys.

## 3. Deterministic "capture all" (`fix`)

The full-watchlist screenshot waited a fixed 600 ms, but the line chart's entry
animation runs ~1 s (`animationDuration=1000`, last line begins at 400 ms) —
longer than the wait — so freshly mounted page-2 line charts could be captured
mid-animation.

- `ChartContext`: add transient `isExporting`.
- `StockCardChart`: line series use `isAnimationActive={!isExporting}` (volume
  and candlestick were already static).
- `DashboardGrid.prepareFullCapture`: set `isExporting`, then wait for an actual
  paint (double `requestAnimationFrame` + 150 ms measure margin) instead of a
  blind timer; clear the flag in `endFullCapture`.

## 4. DashboardGrid drag → reorder test (`test`)

`gridReorder` helpers were unit-tested; the component wiring was not.

- `DashboardGrid.reorder.test.tsx`: mocks `react-grid-layout` to fire
  `onDragStop` with a reversed layout and mocks `StockCard` to avoid network;
  asserts the grid re-renders in the new order and the order is persisted to
  localStorage.
- `src/test/setup.ts`: added a `matchMedia` stub for jsdom.

## 5. Obsolete localStorage cleanup (`chore`)

Since v1.19.0 arrangement is derived from the watchlist order, so the old
`dashboard-layout` / `dashboard-layout-version` keys are never read.

- `migration.ts`: `cleanupObsoleteKeys()` removes them (idempotent).
- `main.tsx`: called once at startup.
- `migration.cleanup.test.ts`: covers removal, no-op, and leaving current keys.

## Verification

- `tsc -b` clean, `eslint .` clean, `npm run build` succeeds (no warnings).
- `vitest run` — 165 tests pass.
