import { describe, it, expect } from "vitest";
import { buildBar } from "../utils/chart.js";

describe("buildBar()", () => {
  it("returns all filled when value equals maxValue", () => {
    const bar = buildBar(100, 100, 10);
    expect(bar).toBe("██████████");
    expect(bar).toHaveLength(10);
  });

  it("returns all empty when value is 0", () => {
    const bar = buildBar(0, 100, 10);
    expect(bar).toBe("░░░░░░░░░░");
    expect(bar).toHaveLength(10);
  });

  it("returns all empty when maxValue is 0", () => {
    const bar = buildBar(0, 0, 10);
    expect(bar).toBe("░░░░░░░░░░");
    expect(bar).toHaveLength(10);
  });

  it("returns half filled for value = maxValue / 2", () => {
    const bar = buildBar(50, 100, 10);
    expect(bar).toBe("█████░░░░░");
    expect(bar).toHaveLength(10);
  });

  it("uses default width of 20", () => {
    const bar = buildBar(0, 100);
    expect(bar).toHaveLength(20);
  });

  it("rounds filled portion correctly", () => {
    // 33% of 10 = 3.3 → rounds to 3
    const bar = buildBar(33, 100, 10);
    expect(bar).toHaveLength(10);
    const filled = (bar.match(/█/g) ?? []).length;
    expect(filled).toBe(3);
  });

  it("handles value greater than maxValue (clamps to full)", () => {
    const bar = buildBar(200, 100, 10);
    // filled = Math.round(2) * width = 20, clamped to 10
    expect(bar).toHaveLength(10);
    expect(bar).not.toContain("░");
  });

  it("handles width of 1", () => {
    expect(buildBar(100, 100, 1)).toBe("█");
    expect(buildBar(0, 100, 1)).toBe("░");
  });
});
