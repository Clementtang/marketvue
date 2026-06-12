/**
 * Pure helpers for translating a react-grid-layout drag into a new watchlist
 * order. The watchlist array order is the single source of truth for card
 * arrangement; these functions keep the grid and the watchlist in sync.
 */

export interface GridPosition {
  /** Item id (the stock symbol). */
  i: string;
  /** Column. */
  x: number;
  /** Row. */
  y: number;
}

/**
 * Read a grid layout in row-major order (top-to-bottom, then left-to-right)
 * and return the resulting list of symbols.
 */
export function layoutToOrder(layout: GridPosition[]): string[] {
  return [...layout]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((item) => item.i);
}

/**
 * Splice a reordered page back into the full watchlist.
 *
 * @param stocks        Full watchlist (single source of truth).
 * @param pageStart     Index of the first item on the current page.
 * @param pageSize      Items per page.
 * @param orderedPage   The current page's symbols in their new order.
 * @returns The new full watchlist, or the original array (same reference) if
 *          the page order is unchanged.
 */
export function applyPageReorder(
  stocks: string[],
  pageStart: number,
  pageSize: number,
  orderedPage: string[],
): string[] {
  const currentPageOrder = stocks.slice(pageStart, pageStart + pageSize);
  if (orderedPage.join(",") === currentPageOrder.join(",")) {
    return stocks;
  }
  return [
    ...stocks.slice(0, pageStart),
    ...orderedPage,
    ...stocks.slice(pageStart + pageSize),
  ];
}
