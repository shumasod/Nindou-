import {
  calcEscapeRate,
  calcExpToNext,
  hpColor,
  rankColor,
  hasStatus,
  decrementStatus,
} from "../components/KageNinden/utils";
import type { StatusEffect } from "../components/KageNinden/types";

describe("calcEscapeRate", () => {
  it("returns 0.5 when both speeds are 0", () => {
    expect(calcEscapeRate(0, 0)).toBe(0.5);
  });

  it("returns 1 when enemy speed is 0", () => {
    expect(calcEscapeRate(10, 0)).toBe(1);
  });

  it("returns 0 when player speed is 0", () => {
    expect(calcEscapeRate(0, 10)).toBe(0);
  });

  it("returns 0.5 when speeds are equal", () => {
    expect(calcEscapeRate(10, 10)).toBe(0.5);
  });

  it("higher player speed gives rate > 0.5", () => {
    expect(calcEscapeRate(20, 10)).toBeCloseTo(0.667, 2);
  });

  it("lower player speed gives rate < 0.5", () => {
    expect(calcEscapeRate(5, 15)).toBeCloseTo(0.25, 2);
  });
});

describe("calcExpToNext", () => {
  it("returns 100 for level 1", () => {
    expect(calcExpToNext(1)).toBe(100);
  });

  it("returns more exp for higher levels", () => {
    expect(calcExpToNext(2)).toBeGreaterThan(calcExpToNext(1));
    expect(calcExpToNext(5)).toBeGreaterThan(calcExpToNext(3));
  });

  it("returns at least 1 for any level", () => {
    expect(calcExpToNext(1)).toBeGreaterThanOrEqual(1);
    expect(calcExpToNext(99)).toBeGreaterThanOrEqual(1);
  });

  it("returns 100 for invalid level (0)", () => {
    expect(calcExpToNext(0)).toBe(100);
  });

  it("returns 100 for NaN", () => {
    expect(calcExpToNext(NaN)).toBe(100);
  });
});

describe("hpColor", () => {
  it("returns green for hp > 50%", () => {
    expect(hpColor(80, 100)).toBe("#4a9e5c");
  });

  it("returns yellow for hp 26-50%", () => {
    expect(hpColor(40, 100)).toBe("#d4a017");
  });

  it("returns red for hp ≤ 25%", () => {
    expect(hpColor(25, 100)).toBe("#c41e1e");
    expect(hpColor(1, 100)).toBe("#c41e1e");
  });

  it("returns green for full hp", () => {
    expect(hpColor(100, 100)).toBe("#4a9e5c");
  });
});

describe("rankColor", () => {
  it("returns gold for S rank", () => {
    expect(rankColor("S")).toBe("#d4a017");
  });

  it("returns red for A rank", () => {
    expect(rankColor("A")).toBe("#c41e1e");
  });

  it("returns purple for B rank", () => {
    expect(rankColor("B")).toBe("#7a4bb5");
  });

  it("returns green for C rank", () => {
    expect(rankColor("C")).toBe("#4a9e5c");
  });

  it("returns dim grey for unknown rank", () => {
    expect(rankColor("D")).toBe("#888");
    expect(rankColor("")).toBe("#888");
  });
});

describe("hasStatus", () => {
  const effects: StatusEffect[] = [
    { id: "poison", name: "毒", turns: 2 },
    { id: "stun", name: "スタン", turns: 1 },
  ];

  it("returns true when status exists", () => {
    expect(hasStatus(effects, "poison")).toBe(true);
    expect(hasStatus(effects, "stun")).toBe(true);
  });

  it("returns false when status not present", () => {
    expect(hasStatus(effects, "defending")).toBe(false);
  });

  it("returns false for empty array", () => {
    expect(hasStatus([], "poison")).toBe(false);
  });
});

describe("decrementStatus", () => {
  it("decrements turns by 1", () => {
    const effects: StatusEffect[] = [{ id: "poison", name: "毒", turns: 3 }];
    const result = decrementStatus(effects);
    expect(result[0].turns).toBe(2);
  });

  it("removes effects that reach 0 turns", () => {
    const effects: StatusEffect[] = [{ id: "stun", name: "スタン", turns: 1 }];
    const result = decrementStatus(effects);
    expect(result).toHaveLength(0);
  });

  it("keeps effects with turns remaining", () => {
    const effects: StatusEffect[] = [
      { id: "poison", name: "毒", turns: 2 },
      { id: "stun", name: "スタン", turns: 1 },
    ];
    const result = decrementStatus(effects);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("poison");
  });

  it("returns empty array when no effects", () => {
    expect(decrementStatus([])).toHaveLength(0);
  });
});
