/**
 * Integration test for DashboardGrid drag -> reorder wiring.
 *
 * The pure ordering helpers are unit-tested in utils/gridReorder.test.ts; this
 * test locks the component wiring: a grid drag (onDragStop) must commit a new
 * order to the watchlist (the single source of truth) via reorderStocks, and
 * the grid must re-render in the new order.
 *
 * react-grid-layout is mocked to expose a button that fires onDragStop with a
 * reversed layout; StockCard is mocked to render just its symbol (no network).
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import type { ReactNode } from "react";

import DashboardGrid from "../DashboardGrid";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../config/queryClient";
import { AppProvider } from "../../contexts/AppContext";
import { VisualThemeProvider } from "../../contexts/VisualThemeContext";
import { ChartProvider } from "../../contexts/ChartContext";
import { StockListProvider, useStockList } from "../../contexts/StockListContext";
import { ToastProvider } from "../../contexts/ToastContext";
import { STOCK_LIST_CONFIG } from "../../config/constants";
import type { StoredStockListData, StockListState } from "../../types/stockList";

// Mock the grid: render children and expose a button that reverses the layout
// (row-major) and fires onDragStop, simulating a drag that reverses card order.
vi.mock("react-grid-layout", () => ({
  default: ({
    children,
    layout,
    onDragStop,
  }: {
    children: ReactNode;
    layout: { i: string }[];
    onDragStop?: (layout: { i: string; x: number; y: number }[]) => void;
  }) => (
    <div data-testid="grid">
      <button
        data-testid="reverse-drag"
        onClick={() => {
          const reversed = layout.map((_, i) => ({
            i: layout[layout.length - 1 - i].i,
            x: i % 3,
            y: Math.floor(i / 3),
          }));
          onDragStop?.(reversed);
        }}
      />
      {children}
    </div>
  ),
}));

// Avoid rendering the real StockCard (which fetches data over the network).
vi.mock("../stock-card", () => ({
  default: ({ symbol }: { symbol: string }) => (
    <div data-testid="card">{symbol}</div>
  ),
}));

function seedWatchlist(stocks: string[]) {
  const state: StockListState = {
    lists: [
      {
        id: STOCK_LIST_CONFIG.DEFAULT_LIST_ID,
        name: "My Watchlist",
        stocks,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        isDefault: true,
      },
    ],
    activeListId: STOCK_LIST_CONFIG.DEFAULT_LIST_ID,
    version: 1,
  };
  const data: StoredStockListData = {
    schemaVersion: STOCK_LIST_CONFIG.SCHEMA_VERSION,
    state,
  };
  localStorage.setItem(STOCK_LIST_CONFIG.STORAGE_KEY, JSON.stringify(data));
}

// Bridge that mirrors App: feeds the watchlist order into DashboardGrid and
// re-renders when the order changes.
function Harness() {
  const { stocks } = useStockList();
  return (
    <DashboardGrid stocks={stocks} startDate="2024-01-01" endDate="2024-02-01" />
  );
}

function renderHarness() {
  return render(
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <VisualThemeProvider>
          <ChartProvider>
            <StockListProvider>
              <ToastProvider>
                <Harness />
              </ToastProvider>
            </StockListProvider>
          </ChartProvider>
        </VisualThemeProvider>
      </AppProvider>
    </QueryClientProvider>,
  );
}

function renderedOrder(): string[] {
  const grid = screen.getByTestId("grid");
  return within(grid)
    .getAllByTestId("card")
    .map((el) => el.textContent ?? "");
}

describe("DashboardGrid drag -> reorder", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("commits a reversed drag to the watchlist order and re-renders", () => {
    seedWatchlist(["AAPL", "GOOGL", "MSFT"]);
    renderHarness();

    expect(renderedOrder()).toEqual(["AAPL", "GOOGL", "MSFT"]);

    fireEvent.click(screen.getByTestId("reverse-drag"));

    // The drag is committed to the watchlist and the grid reflects it.
    expect(renderedOrder()).toEqual(["MSFT", "GOOGL", "AAPL"]);

    // And it is persisted to the single source of truth in localStorage.
    const stored = JSON.parse(
      localStorage.getItem(STOCK_LIST_CONFIG.STORAGE_KEY) as string,
    ) as StoredStockListData;
    expect(stored.state.lists[0].stocks).toEqual(["MSFT", "GOOGL", "AAPL"]);
  });
});
