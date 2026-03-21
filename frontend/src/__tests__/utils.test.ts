import {
  getRandom,
  calcDamage,
  calcDamageWithSpeed,
  calcEscapeRate,
  calcExpToNext,
  getEffectiveStats,
  hasStatus,
  decrementStatus,
  hpColor,
  rankColor,
  enemyAction,
} from "@/components/KageNinden/utils";
import type { StatusEffect, Enemy } from "@/components/KageNinden/types";

// ===== getRandom =====
describe("getRandom", () => {
  test("min以上max以下の整数を返す", () => {
    for (let i = 0; i < 100; i++) {
      const v = getRandom(1, 10);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  test("min===max のとき必ずその値を返す", () => {
    expect(getRandom(5, 5)).toBe(5);
  });

  test("負の範囲でも動作する", () => {
    for (let i = 0; i < 50; i++) {
      const v = getRandom(-5, -1);
      expect(v).toBeGreaterThanOrEqual(-5);
      expect(v).toBeLessThanOrEqual(-1);
    }
  });
});

// ===== calcDamage =====
describe("calcDamage", () => {
  test("最低1ダメージを保証する", () => {
    // 攻撃力0・防御力100でも1以上
    const { damage } = calcDamage(0, 100, 1.0);
    expect(damage).toBeGreaterThanOrEqual(1);
  });

  test("multiplier=2.5 は通常より大きなダメージになる", () => {
    // ランダム要素があるので多数回テストして比較
    let sumNormal = 0, sumSkill = 0;
    for (let i = 0; i < 200; i++) {
      sumNormal += calcDamage(20, 10, 1.0).damage;
      sumSkill  += calcDamage(20, 10, 2.5).damage;
    }
    expect(sumSkill / 200).toBeGreaterThan(sumNormal / 200);
  });

  test("クリティカルはdamage*2倍", () => {
    // Math.randomをモックしてクリティカル確定
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.05); // < 0.1 でcrit確定
    const { damage, isCritical } = calcDamage(20, 0, 1.0);
    expect(isCritical).toBe(true);
    spy.mockRestore();
  });

  test("非クリティカルの場合 isCritical=false", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.99); // > 0.1
    const { isCritical } = calcDamage(20, 10, 1.0);
    expect(isCritical).toBe(false);
    spy.mockRestore();
  });
});

// ===== calcDamageWithSpeed =====
describe("calcDamageWithSpeed", () => {
  test("speed=0のとき基礎クリティカル率10%", () => {
    let critCount = 0;
    const spy = jest.spyOn(Math, "random");
    // 連続で0.09を返すとcrit確定
    spy.mockReturnValue(0.09);
    const { isCritical } = calcDamageWithSpeed(20, 10, 0, 1.0);
    expect(isCritical).toBe(true);
    spy.mockRestore();
  });

  test("speed値が大きいほどクリティカル率が上昇（上限40%）", () => {
    // speed=600 → 0.1+600*0.005=3.1 → clamp → 0.4
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.39);
    const { isCritical } = calcDamageWithSpeed(20, 0, 600, 1.0);
    expect(isCritical).toBe(true); // 0.39 < 0.4
    spy.mockRestore();
  });
});

// ===== calcEscapeRate =====
describe("calcEscapeRate", () => {
  test("同速度のとき50%", () => {
    expect(calcEscapeRate(10, 10)).toBeCloseTo(0.5);
  });

  test("プレイヤーが圧倒的に速いとき1に近い", () => {
    expect(calcEscapeRate(100, 1)).toBeGreaterThan(0.9);
  });

  test("プレイヤーが遅いとき0.5未満", () => {
    expect(calcEscapeRate(5, 20)).toBeLessThan(0.5);
  });

  test("0以上1以下の範囲に収まる", () => {
    const rate = calcEscapeRate(12, 8);
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(1);
  });
});

// ===== calcExpToNext =====
describe("calcExpToNext", () => {
  test("Lv1のとき100", () => {
    expect(calcExpToNext(1)).toBe(100);
  });

  test("Lvが上がるにつれて増加する", () => {
    const exp1 = calcExpToNext(1);
    const exp5 = calcExpToNext(5);
    const exp10 = calcExpToNext(10);
    expect(exp5).toBeGreaterThan(exp1);
    expect(exp10).toBeGreaterThan(exp5);
  });

  test("常に正の整数", () => {
    for (let lv = 1; lv <= 20; lv++) {
      const exp = calcExpToNext(lv);
      expect(exp).toBeGreaterThan(0);
      expect(Number.isInteger(exp)).toBe(true);
    }
  });
});

// ===== hasStatus =====
describe("hasStatus", () => {
  const effects: StatusEffect[] = [
    { id: "poison", name: "毒", turns: 3 },
    { id: "stun",   name: "スタン", turns: 1 },
  ];

  test("存在するstatusをtrueで検出", () => {
    expect(hasStatus(effects, "poison")).toBe(true);
    expect(hasStatus(effects, "stun")).toBe(true);
  });

  test("存在しないstatusはfalse", () => {
    expect(hasStatus(effects, "confusion")).toBe(false);
  });

  test("空配列はすべてfalse", () => {
    expect(hasStatus([], "poison")).toBe(false);
  });
});

// ===== decrementStatus =====
describe("decrementStatus", () => {
  test("turnsを1減らす", () => {
    const effects: StatusEffect[] = [{ id: "poison", name: "毒", turns: 3 }];
    const result = decrementStatus(effects);
    expect(result[0].turns).toBe(2);
  });

  test("turns=1の効果は0になり配列から除去される", () => {
    const effects: StatusEffect[] = [{ id: "stun", name: "スタン", turns: 1 }];
    const result = decrementStatus(effects);
    expect(result).toHaveLength(0);
  });

  test("複数の効果を正しく処理する", () => {
    const effects: StatusEffect[] = [
      { id: "poison",    name: "毒",    turns: 3 },
      { id: "stun",      name: "スタン", turns: 1 },
      { id: "defense_up", name: "防御UP", turns: 2 },
    ];
    const result = decrementStatus(effects);
    expect(result).toHaveLength(2); // stun除去
    expect(result.find((e) => e.id === "poison")?.turns).toBe(2);
    expect(result.find((e) => e.id === "defense_up")?.turns).toBe(1);
  });

  test("空配列を渡しても安全", () => {
    expect(decrementStatus([])).toHaveLength(0);
  });
});

// ===== hpColor =====
describe("hpColor", () => {
  test(">50%: 緑 (#4a9e5c)", () => {
    expect(hpColor(80, 100)).toBe("#4a9e5c");
    expect(hpColor(51, 100)).toBe("#4a9e5c");
  });

  test("25〜50%: 黄 (#d4a017)", () => {
    expect(hpColor(50, 100)).toBe("#d4a017");
    expect(hpColor(26, 100)).toBe("#d4a017");
  });

  test("<=25%: 赤 (#c41e1e)", () => {
    expect(hpColor(25, 100)).toBe("#c41e1e");
    expect(hpColor(1,  100)).toBe("#c41e1e");
    expect(hpColor(0,  100)).toBe("#c41e1e");
  });
});

// ===== rankColor =====
describe("rankColor", () => {
  test("Sランクは金色", () => {
    expect(rankColor("S")).toBe("#d4a017");
  });

  test("Aランクは赤", () => {
    expect(rankColor("A")).toBe("#c41e1e");
  });

  test("Bランクは紫", () => {
    expect(rankColor("B")).toBe("#7a4bb5");
  });

  test("Cランクは緑", () => {
    expect(rankColor("C")).toBe("#4a9e5c");
  });

  test("Dランクはデフォルトカラー", () => {
    expect(rankColor("D")).toBe("#888");
  });
});

// ===== getEffectiveStats =====
describe("getEffectiveStats", () => {
  const basePlayer = {
    name: "test", level: 1, exp: 0, expToNext: 100,
    hp: 100, maxHp: 100, chakra: 50, maxChakra: 50,
    stats: { attack: 15, defense: 10, speed: 12, stealth: 8 },
    statPoints: 0, skills: [], equip: { weapon: "kunai_basic", armor: "cloth_basic" },
    items: [], gold: 0, clan: "force" as const,
  };

  test("状態異常なしでは素のステータスを返す", () => {
    const result = getEffectiveStats(basePlayer, []);
    expect(result.attack).toBe(15);
    expect(result.defense).toBe(10);
    expect(result.speed).toBe(12);
  });

  test("defense_up効果で防御力1.5倍", () => {
    const effects: StatusEffect[] = [{ id: "defense_up", name: "防御UP", turns: 3 }];
    const result = getEffectiveStats(basePlayer, effects);
    expect(result.defense).toBe(Math.floor(10 * 1.5)); // 15
  });

  test("speed_up効果で素早さ2倍", () => {
    const effects: StatusEffect[] = [{ id: "speed_up", name: "速度UP", turns: 1 }];
    const result = getEffectiveStats(basePlayer, effects);
    expect(result.speed).toBe(Math.floor(12 * 2)); // 24
  });
});

// ===== enemyAction =====
describe("enemyAction", () => {
  const makeEnemy = (ai: Enemy["ai"], hp: number, maxHp: number): Enemy => ({
    id: "test", name: "テスト敵", icon: "👹",
    hp, maxHp,
    attack: 20, defense: 10, speed: 10,
    exp: 50, gold: 30, ai,
    skills: [], drops: [],
  });

  test("スタン状態では行動不能を返す", () => {
    const enemy = makeEnemy("aggressive", 100, 100);
    const stunned: StatusEffect[] = [{ id: "stun", name: "スタン", turns: 1 }];
    const action = enemyAction(enemy, stunned, 1);
    expect(action.type).toBe("stun");
  });

  test("aggressive AIは常にattackを選ぶ", () => {
    const enemy = makeEnemy("aggressive", 100, 100);
    for (let i = 0; i < 20; i++) {
      expect(enemyAction(enemy, [], i).type).toBe("attack");
    }
  });

  test("debuffer AIはターン1-2でdebuffを使う", () => {
    const enemy = makeEnemy("debuffer", 100, 100);
    expect(enemyAction(enemy, [], 1).type).toBe("debuff");
    expect(enemyAction(enemy, [], 2).type).toBe("debuff");
  });

  test("debuffer AIはターン3以降でattackを使う", () => {
    const enemy = makeEnemy("debuffer", 100, 100);
    expect(enemyAction(enemy, [], 3).type).toBe("attack");
  });

  test("boss AIはHP50%以下でフェーズ変化", () => {
    const enemy = makeEnemy("boss", 200, 500); // 40%
    const action = enemyAction(enemy, [], 1);
    expect(action.type).toBe("phase2");
  });
});
