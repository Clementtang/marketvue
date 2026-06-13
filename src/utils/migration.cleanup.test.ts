import { describe, it, expect, beforeEach } from "vitest";
import { cleanupObsoleteKeys } from "./migration";

describe("cleanupObsoleteKeys", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes obsolete grid-layout keys", () => {
    localStorage.setItem("dashboard-layout", "[]");
    localStorage.setItem("dashboard-layout-version", "snapshot-v20-pagination");

    cleanupObsoleteKeys();

    expect(localStorage.getItem("dashboard-layout")).toBeNull();
    expect(localStorage.getItem("dashboard-layout-version")).toBeNull();
  });

  it("leaves current keys untouched", () => {
    localStorage.setItem("marketvue-stock-lists", "{}");
    localStorage.setItem("chart-type", "line");

    cleanupObsoleteKeys();

    expect(localStorage.getItem("marketvue-stock-lists")).toBe("{}");
    expect(localStorage.getItem("chart-type")).toBe("line");
  });

  it("is a no-op when the keys are absent", () => {
    expect(() => cleanupObsoleteKeys()).not.toThrow();
    expect(localStorage.length).toBe(0);
  });
});
