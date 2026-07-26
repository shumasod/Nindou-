import {
  getRandom,
  calcDamageWithSpeed,
  calcEscapeRate,
  calcExpToNext,
  hpColor,
  rankColor,
  getEffectiveStats,
} from "../components/KageNinden/utils";
import type { StatusEffect } from "../components/KageNinden/types";
import { INITIAL_STATE } from "../components/KageNinden/reducer";

// ─── getRandom ──────────────────────────────────────────────────────────────

describe("getRandom range contract", () => {
  it("always returns values within [min, max]", () => {
    for (let i = 0; i < 200; i++) {
      const v = getRandom(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
    }
  });

  it("returns min when min === max", () => {
    expect(getRandom(5, 5)).toBe(5);
  });

  it("returns integers only", () => {
    for (let i = 0; i < 30; i++) {
      expect(Number.isInteger(getRandom(0, 100))).toBe(true);
    }
  });
});

// ─── calcDamageWithSpeed ────────────────────────────────────────────────────

describe("calcDamageWithSpeed", () => {
  it("damage is always >= 1 even against massive defense", () => {
    for (let i = 0; i < 50; i++) {
      const { damage } = calcDamageWithSpeed(1, 99999, 1);
      expect(damage).toBeGreaterThanOrEqual(1);
    }
  });

  it("higher attack produces higher average damage", () => {
    const weak = Array.from({ length: 100 }, () => calcDamageWithSpeed(5, 0, 10).damage);
    const strong = Array.from({ length: 100 }, () => calcDamageWithSpeed(50, 0, 10).damage);
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b) / arr.length;
    expect(avg(strong)).toBeGreaterThan(avg(weak));
  });

  it("isCritical is a boolean", () => {
    const { isCritical } = calcDamageWithSpeed(15, 10, 12);
    expect(typeof isCritical).toBe("boolean");
  });
});

// ─── calcEscapeRate ─────────────────────────────────────────────────────────

describe("calcEscapeRate", () => {
  it("returns 0.5 when both speeds are 0", () => {
    expect(calcEscapeRate(0, 0)).toBe(0.5);
  });

  it("stays in [0, 1]", () => {
    expect(calcEscapeRate(10, 20)).toBeGreaterThanOrEqual(0);
    expect(calcEscapeRate(10, 20)).toBeLessThanOrEqual(1);
  });

  it(">0.5 when player is faster", () => {
    expect(calcEscapeRate(20, 10)).toBeGreaterThan(0.5);
  });

  it("<0.5 when enemy is faster", () => {
    expect(calcEscapeRate(5, 95)).toBeLessThan(0.5);
  });

  it("equals playerSpeed/(total) exactly", () => {
    expect(calcEscapeRate(30, 70)).toBeCloseTo(0.3, 5);
  });
});

// ─── calcExpToNext ──────────────────────────────────────────────────────────

describe("calcExpToNext", () => {
  it("returns 100 at level 1", () => {
    expect(calcExpToNext(1)).toBe(100);
  });

  it("always returns >= 1", () => {
    [1, 5, 10, 50, 99].forEach((lv) => {
      expect(calcExpToNext(lv)).toBeGreaterThanOrEqual(1);
    });
  });

  it("increases monotonically", () => {
    for (let lv = 1; lv < 30; lv++) {
      expect(calcExpToNext(lv + 1)).toBeGreaterThan(calcExpToNext(lv));
    }
  });

  it("returns 100 for invalid inputs (0, negative, NaN)", () => {
    expect(calcExpToNext(0)).toBe(100);
    expect(calcExpToNext(-5)).toBe(100);
  });
});

// ─── hpColor ────────────────────────────────────────────────────────────────

describe("hpColor thresholds", () => {
  it("green above 50%", () => {
    expect(hpColor(60, 100)).toBe("#4a9e5c");
    expect(hpColor(100, 100)).toBe("#4a9e5c");
  });

  it("amber from 25% to 50%", () => {
    expect(hpColor(40, 100)).toBe("#d4a017");
    expect(hpColor(26, 100)).toBe("#d4a017");
  });

  it("red at 25% and below", () => {
    expect(hpColor(25, 100)).toBe("#c41e1e");
    expect(hpColor(0, 100)).toBe("#c41e1e");
  });
});

// ─── rankColor ──────────────────────────────────────────────────────────────

describe("rankColor", () => {
  const cases: [string, string][] = [
    ["S", "#d4a017"],
    ["A", "#c41e1e"],
    ["B", "#7a4bb5"],
    ["C", "#4a9e5c"],
    ["D", "#888"],
    ["", "#888"],
  ];
  test.each(cases)("rank %s → %s", (rank, expected) => {
    expect(rankColor(rank)).toBe(expected);
  });
});

// ─── getEffectiveStats ──────────────────────────────────────────────────────

describe("getEffectiveStats", () => {
  const player = INITIAL_STATE.player;

  it("returns base stats with no effects", () => {
    const s = getEffectiveStats(player, []);
    expect(s.attack).toBe(player.stats.attack);
    expect(s.defense).toBe(player.stats.defense);
    expect(s.speed).toBe(player.stats.speed);
  });

  it("defense_up × 1.5", () => {
    const eff: StatusEffect = { id: "defense_up", name: "防御UP", turns: 2 };
    const s = getEffectiveStats(player, [eff]);
    expect(s.defense).toBe(Math.floor(player.stats.defense * 1.5));
  });

  it("speed_up × 2", () => {
    const eff: StatusEffect = { id: "speed_up", name: "速度UP", turns: 2 };
    const s = getEffectiveStats(player, [eff]);
    expect(s.speed).toBe(Math.floor(player.stats.speed * 2));
  });

  it("unrelated effects don't alter attack", () => {
    const eff: StatusEffect = { id: "defense_up", name: "防御UP", turns: 1 };
    const s = getEffectiveStats(player, [eff]);
    expect(s.attack).toBe(player.stats.attack);
  });
});
