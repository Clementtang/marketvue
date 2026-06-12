# Work Log — Single source of truth for arrangement (v1.19.0)

**Date:** 2026-06-12
**Scope:** Make the watchlist order the only source of truth for card arrangement.

## Problem

Card arrangement had two independent sources of truth that could drift apart:

1. **Watchlist order** — `stocks: string[]` in `StockListContext`, with a fully
   wired `reorderStocks` action and `REORDER_STOCKS` reducer case.
2. **Grid positions** — a separate `dashboard-layout` localStorage map keyed by
   symbol, managed directly by `DashboardGrid` / react-grid-layout.

Dragging a card only updated (2); reordering elsewhere only updated (1). They
never synced. To keep (2) usable, `DashboardGrid` had grown a pile of defensive
logic: layout versioning (`snapshot-v20-pagination`), a `?reset=true` escape
hatch, forced `h: 1.0` correction on every layout change, and an "all cards
stacked at x=0" repair hack.

## Changes

### `src/components/DashboardGrid.tsx`

- Layout is now **derived** from the current page's slice of `stocks` via
  `useMemo` — no persisted layout, no versioning, no reset handling.
- `onDragStop` reads the dragged layout row-major and commits the new order to
  the watchlist with `actions.reorderStocks(...)`. The watchlist array order is
  the single source of truth; the grid simply renders it.
- Cards are uniform and non-resizable (`isResizable={false}`, fixed `w/h`), so
  order is the only variable — this removes the height/stacking hacks.
- Restored the "jump to the new stock's page on add" UX via a length ref.
- Removed the `localStorage` util imports that are no longer needed here.

### `src/utils/gridReorder.ts` (new) + tests

- `layoutToOrder(layout)` — read a grid layout top-to-bottom, left-to-right.
- `applyPageReorder(stocks, pageStart, pageSize, orderedPage)` — splice a
  reordered page back into the full watchlist; returns the same reference when
  nothing changed (so the component can skip a no-op dispatch).
- `gridReorder.test.ts` — 6 cases covering row-major reads, immutability,
  no-op detection, and page-offset splicing.

## Verification

- `tsc -b` clean, `eslint .` clean, `npm run build` succeeds.
- `vitest run` — 207 tests pass (was 201; +6 for gridReorder).

## Notes

- Stale `dashboard-layout` localStorage entries from older versions are simply
  ignored now (never read). No migration needed.
- Cross-page reordering still happens within a page; the watchlist is the
  durable order and the export/import + list features operate on it directly.
