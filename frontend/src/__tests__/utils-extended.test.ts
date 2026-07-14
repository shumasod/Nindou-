import {
  calcEscapeRate,
  getEffectiveStats,
  enemyAction,
} from "@/components/KageNinden/utils";
import type { StatusEffect, Enemy } from "@/components/KageNinden/types";

// ===== calcEscapeRate edge cases =====
describe("calcEscapeRate edge cases", () => {
  test("両方0のとき0.5を返す", () => {
    expect(calcEscapeRate(0, 0)).toBe(0.5);
  });

  test("playerSpeed=0, enemySpeed>0のとき0", () => {
    expect(calcEscapeRate(0, 10)).toBe(0);
  });

  test("敵Speed=0, playerSpeed>0のとき1", () => {
    expect(calcEscapeRate(10, 0)).toBe(1);
  });

  test("結果は常に0以上1以下", () => {
    const cases = [
      [1, 99], [50, 50], [99, 1], [1, 1], [100, 0], [0, 100],
    ] as const;
    for (const [p, e] of cases) {
      const rate = calcEscapeRate(p, e);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    }
  });

  test("プレイヤーが速いほど成功率が高い", () => {
    const slow  = calcEscapeRate(5, 20);
    const equal = calcEscapeRate(10, 10);
    const fast  = calcEscapeRate(20, 5);
    expect(fast).toBeGreaterThan(equal);
    expect(equal).toBeGreaterThan(slow);
  });

  test("speed比例計算が正確", () => {
    expect(calcEscapeRate(30, 70)).toBeCloseTo(0.3);
    expect(calcEscapeRate(70, 30)).toBeCloseTo(0.7);
  });
});

// ===== getEffectiveStats: attack_up =====
describe("getEffectiveStats - attack_up", () => {
  const basePlayer = {
    name: "test", level: 1, exp: 0, expToNext: 100,
    hp: 100, maxHp: 100, chakra: 50, maxChakra: 50,
    stats: { attack: 20, defense: 10, speed: 12, stealth: 8 },
    statPoints: 0, skills: [],
    equip: { weapon: "kunai_basic", armor: "cloth_basic" },
    items: [], gold: 0, clan: "force" as const,
  };

  test("attack_up効果で攻撃力1.5倍", () => {
    const effects: StatusEffect[] = [{ id: "attack_up", name: "攻撃UP", turns: 2 }];
    const result = getEffectiveStats(basePlayer, effects);
    expect(result.attack).toBe(Math.floor(20 * 1.5));
  });

  test("複数効果を同時に適用する", () => {
    const effects: StatusEffect[] = [
      { id: "defense_up", name: "防御UP", turns: 2 },
      { id: "speed_up",   name: "速度UP", turns: 1 },
    ];
    const result = getEffectiveStats(basePlayer, effects);
    expect(result.defense).toBe(Math.floor(10 * 1.5));
    expect(result.speed).toBe(Math.floor(12 * 2));
    expect(result.attack).toBe(20);
  });

  test("ステルスは状態異常で変化しない", () => {
    const effects: StatusEffect[] = [{ id: "attack_up", name: "攻撃UP", turns: 1 }];
    const result = getEffectiveStats(basePlayer, effects);
    expect(result.stealth).toBe(8);
  });
});

// ===== enemyAction: balanced / tank / speed / boss-phase2 =====
describe("enemyAction - additional AI", () => {
  const makeEnemy = (
    ai: Enemy["ai"],
    hp: number,
    maxHp: number,
    phase2 = false
  ): Enemy => ({
    id: "test", name: "テスト敵", icon: "👹",
    hp, maxHp, attack: 20, defense: 10, speed: 10,
    exp: 50, gold: 30, ai, skills: [], drops: [], phase2,
  });

  describe("balanced AI", () => {
    test("HP満タンのときattackを返す", () => {
      const spy = jest.spyOn(Math, "random").mockReturnValue(0.99);
      const enemy = makeEnemy("balanced", 100, 100);
      expect(enemyAction(enemy, [], 1).type).toBe("attack");
      spy.mockRestore();
    });

    test("HP20%以下でrandom<0.4のとき逃走", () => {
      const spy = jest.spyOn(Math, "random").mockReturnValue(0.3);
      const enemy = makeEnemy("balanced", 19, 100);
      expect(enemyAction(enemy, [], 1).type).toBe("escape");
      spy.mockRestore();
    });

    test("HP50%以下でrandom<0.3のとき防御", () => {
      // 40/100=0.4 < 0.5, not < 0.2, so only one random() call for defend check
      const spy = jest.spyOn(Math, "random").mockReturnValue(0.1);
      const enemy = makeEnemy("balanced", 40, 100);
      expect(enemyAction(enemy, [], 1).type).toBe("defend");
      spy.mockRestore();
    });
  });

  describe("tank AI", () => {
    test("HP満タンのときattackを返す", () => {
      const spy = jest.spyOn(Math, "random").mockReturnValue(0.99);
      const enemy = makeEnemy("tank", 100, 100);
      expect(enemyAction(enemy, [], 1).type).toBe("attack");
      spy.mockRestore();
    });

    test("HP50%以下でrandom<0.4のとき防御", () => {
      const spy = jest.spyOn(Math, "random").mockReturnValue(0.3);
      const enemy = makeEnemy("tank", 40, 100);
      expect(enemyAction(enemy, [], 1).type).toBe("defend");
      spy.mockRestore();
    });
  });

  describe("speed AI", () => {
    test("random<0.3のとき回避態勢", () => {
      const spy = jest.spyOn(Math, "random").mockReturnValue(0.2);
      const enemy = makeEnemy("speed", 100, 100);
      expect(enemyAction(enemy, [], 1).type).toBe("dodge");
      spy.mockRestore();
    });

    test("random>=0.3のとき攻撃", () => {
      const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
      const enemy = makeEnemy("speed", 100, 100);
      expect(enemyAction(enemy, [], 1).type).toBe("attack");
      spy.mockRestore();
    });
  });

  describe("boss AI phase2", () => {
    test("phase2中でrandom<0.3のとき呪いの波動", () => {
      const spy = jest.spyOn(Math, "random").mockReturnValue(0.2);
      const enemy = makeEnemy("boss", 100, 500, true);
      expect(enemyAction(enemy, [], 5).type).toBe("boss_skill");
      spy.mockRestore();
    });

    test("phase2中でrandom>=0.3かつ<0.5のとき混沌の術", () => {
      const spy = jest.spyOn(Math, "random").mockReturnValue(0.4);
      const enemy = makeEnemy("boss", 100, 500, true);
      expect(enemyAction(enemy, [], 5).type).toBe("boss_aoe");
      spy.mockRestore();
    });

    test("phase2中でrandom>=0.5のとき通常攻撃", () => {
      const spy = jest.spyOn(Math, "random").mockReturnValue(0.8);
      const enemy = makeEnemy("boss", 100, 500, true);
      expect(enemyAction(enemy, [], 5).type).toBe("attack");
      spy.mockRestore();
    });
  });

  describe("unknown AI fallback", () => {
    test("不明なAIタイプでもattackを返す", () => {
      const enemy = makeEnemy("aggressive" as Enemy["ai"], 100, 100);
      (enemy as { ai: string }).ai = "unknown_type";
      expect(enemyAction(enemy, [], 1).type).toBe("attack");
    });
  });
});
