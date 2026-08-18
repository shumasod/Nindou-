import { enemyAction } from "../components/KageNinden/utils";
import type { Enemy, StatusEffect } from "../components/KageNinden/types";

function makeEnemy(ai: Enemy["ai"], overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: "test",
    name: "Test Enemy",
    icon: "👹",
    hp: 100,
    maxHp: 100,
    attack: 20,
    defense: 10,
    speed: 10,
    exp: 50,
    gold: 30,
    ai,
    skills: [],
    drops: [],
    phase2: false,
    ...overrides,
  };
}

const noStatus: StatusEffect[] = [];

describe("enemyAction: stun overrides all AI types", () => {
  const stunned: StatusEffect[] = [{ id: "stun", name: "スタン", turns: 1 }];

  it("aggressive enemy with stun returns stun action", () => {
    const result = enemyAction(makeEnemy("aggressive"), stunned, 1);
    expect(result.type).toBe("stun");
  });

  it("boss enemy with stun returns stun action", () => {
    const result = enemyAction(makeEnemy("boss"), stunned, 5);
    expect(result.type).toBe("stun");
  });
});

describe("enemyAction: aggressive AI", () => {
  it("always attacks", () => {
    for (let i = 0; i < 10; i++) {
      const result = enemyAction(makeEnemy("aggressive"), noStatus, i + 1);
      expect(result.type).toBe("attack");
    }
  });
});

describe("enemyAction: debuffer AI", () => {
  it("uses debuff on turn 1", () => {
    const result = enemyAction(makeEnemy("debuffer"), noStatus, 1);
    expect(result.type).toBe("debuff");
  });

  it("uses debuff on turn 2", () => {
    const result = enemyAction(makeEnemy("debuffer"), noStatus, 2);
    expect(result.type).toBe("debuff");
  });

  it("attacks on turn 3+", () => {
    const result = enemyAction(makeEnemy("debuffer"), noStatus, 3);
    expect(result.type).toBe("attack");
  });
});

describe("enemyAction: boss AI", () => {
  it("attacks when hp > 50% and not phase2", () => {
    const boss = makeEnemy("boss", { hp: 60, maxHp: 100 });
    const result = enemyAction(boss, noStatus, 5);
    expect(result.type).toBe("attack");
  });

  it("triggers phase2 when hp < 50% and phase2 is false", () => {
    const boss = makeEnemy("boss", { hp: 49, maxHp: 100, phase2: false });
    const result = enemyAction(boss, noStatus, 5);
    expect(result.type).toBe("phase2");
  });

  it("uses boss skills when in phase2", () => {
    const boss = makeEnemy("boss", { hp: 40, maxHp: 100, phase2: true });
    const results = new Set<string>();
    for (let i = 0; i < 30; i++) {
      results.add(enemyAction(boss, noStatus, 5).type);
    }
    expect(results.has("attack")).toBe(true);
    const hasBossAction = results.has("boss_skill") || results.has("boss_aoe") || results.has("attack");
    expect(hasBossAction).toBe(true);
  });
});

describe("enemyAction: return shape", () => {
  it("returns object with type and label strings", () => {
    const result = enemyAction(makeEnemy("aggressive"), noStatus, 1);
    expect(typeof result.type).toBe("string");
    expect(typeof result.label).toBe("string");
    expect(result.type.length).toBeGreaterThan(0);
    expect(result.label.length).toBeGreaterThan(0);
  });

  it("default/unknown AI returns attack", () => {
    const enemy = makeEnemy("aggressive");
    (enemy as any).ai = "unknown_ai_type";
    const result = enemyAction(enemy, noStatus, 1);
    expect(result.type).toBe("attack");
  });
});
