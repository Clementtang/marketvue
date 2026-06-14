# Work Log — Keyboard & mobile reordering (v1.21.0)

**Date:** 2026-06-13
**Scope:** Let users arrange cards on mobile and via keyboard, not only by desktop drag.

## Problem

Card arrangement is MarketVue's core purpose, but the only way to reorder was
dragging cards in the dashboard grid — and grid drag is disabled on mobile
(`isDraggable={!isMobile}`) and is not keyboard accessible. So mobile users
couldn't arrange at all, and keyboard users had no path either.

## Change

`src/components/StockManager.tsx`

- Added a `moveStock(symbol, direction)` helper that swaps a stock with its
  neighbour and commits via `actions.reorderStocks(...)` — the same single
  source of truth used by desktop drag (see v1.19.0).
- Each stock tag now renders "move earlier" (◀) and "move later" (▶) buttons
  around the symbol, with the existing remove (✕) button. Boundary buttons are
  disabled (first can't move earlier, last can't move later).
- Buttons have bilingual `title` + `aria-label` including the symbol.

`src/i18n/translations.ts`

- Added `moveEarlier` / `moveLater` (en-US / zh-TW).

## Why buttons (not mobile drag)

react-grid-layout's touch drag conflicts with page scroll on small screens and
is not keyboard operable. Explicit move buttons are reliable on touch, work with
keyboard/screen readers, and reuse the existing reorder action with zero new
state.

## Verification

- `tsc -b` clean, `eslint` clean, `npm run build` succeeds, `vitest run` — 161 pass.
