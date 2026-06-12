import { describe, it, expect } from "vitest";
import { layoutToOrder, applyPageReorder } from "./gridReorder";

describe("layoutToOrder", () => {
  it("reads a 3-column grid row-major (top-to-bottom, left-to-right)", () => {
    const layout = [
      { i: "C", x: 2, y: 0 },
      { i: "A", x: 0, y: 0 },
      { i: "B", x: 1, y: 0 },
      { i: "D", x: 0, y: 1 },
    ];
    expect(layoutToOrder(layout)).toEqual(["A", "B", "C", "D"]);
  });

  it("does not mutate the input array", () => {
    const layout = [
      { i: "B", x: 1, y: 0 },
      { i: "A", x: 0, y: 0 },
    ];
    const snapshot = [...layout];
    layoutToOrder(layout);
    expect(layout).toEqual(snapshot);
  });
});

describe("applyPageReorder", () => {
  const stocks = ["A", "B", "C", "D", "E"];

  it("returns the same reference when the page order is unchanged", () => {
    const result = applyPageReorder(stocks, 0, 3, ["A", "B", "C"]);
    expect(result).toBe(stocks);
  });

  it("reorders the first page and keeps the rest intact", () => {
    const result = applyPageReorder(stocks, 0, 3, ["C", "A", "B"]);
    expect(result).toEqual(["C", "A", "B", "D", "E"]);
  });

  it("reorders a later page using the page offset", () => {
    // Page 2 (size 3) of a 5-item list contains D, E.
    const result = applyPageReorder(stocks, 3, 3, ["E", "D"]);
    expect(result).toEqual(["A", "B", "C", "E", "D"]);
  });

  it("preserves items before and after the active page", () => {
    const longer = ["A", "B", "C", "D", "E", "F"];
    // Page 2 (size 3): D, E, F -> F, E, D
    const result = applyPageReorder(longer, 3, 3, ["F", "E", "D"]);
    expect(result).toEqual(["A", "B", "C", "F", "E", "D"]);
  });
});
