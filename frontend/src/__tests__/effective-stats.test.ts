import { getEffectiveStats } from "../components/KageNinden/utils";
import { INITIAL_PLAYER } from "../components/KageNinden/reducer";
import type { StatusEffect } from "../components/KageNinden/types";

const base = INITIAL_PLAYER.stats; // { attack: 15, defense: 10, speed: 12, stealth: 8 }

const noStatus: StatusEffect[] = [];

describe("getEffectiveStats with no status effects", () => {
  it("returns base stats unchanged", () => {
    const result = getEffectiveStats(INITIAL_PLAYER, noStatus);
    expect(result.attack).toBe(base.attack);
    expect(result.defense).toBe(base.defense);
    expect(result.speed).toBe(base.speed);
    expect(result.stealth).toBe(base.stealth);
  });
});

describe("getEffectiveStats with defense_up", () => {
  const statusEffects: StatusEffect[] = [{ id: "defense_up", name: "防御強化", turns: 2 }];

  it("multiplies defense by 1.5 (floored)", () => {
    const result = getEffectiveStats(INITIAL_PLAYER, statusEffects);
    expect(result.defense).toBe(Math.floor(base.defense * 1.5));
  });

  it("does not affect attack or speed", () => {
    const result = getEffectiveStats(INITIAL_PLAYER, statusEffects);
    expect(result.attack).toBe(base.attack);
    expect(result.speed).toBe(base.speed);
  });
});

describe("getEffectiveStats with speed_up", () => {
  const statusEffects: StatusEffect[] = [{ id: "speed_up", name: "速度強化", turns: 2 }];

  it("doubles speed (floored)", () => {
    const result = getEffectiveStats(INITIAL_PLAYER, statusEffects);
    expect(result.speed).toBe(Math.floor(base.speed * 2));
  });

  it("does not affect attack or defense", () => {
    const result = getEffectiveStats(INITIAL_PLAYER, statusEffects);
    expect(result.attack).toBe(base.attack);
    expect(result.defense).toBe(base.defense);
  });
});

describe("getEffectiveStats with attack_up", () => {
  const statusEffects: StatusEffect[] = [{ id: "attack_up", name: "攻撃強化", turns: 2 }];

  it("multiplies attack by 1.5 (floored)", () => {
    const result = getEffectiveStats(INITIAL_PLAYER, statusEffects);
    expect(result.attack).toBe(Math.floor(base.attack * 1.5));
  });

  it("does not affect defense or speed", () => {
    const result = getEffectiveStats(INITIAL_PLAYER, statusEffects);
    expect(result.defense).toBe(base.defense);
    expect(result.speed).toBe(base.speed);
  });
});

describe("getEffectiveStats with multiple buffs", () => {
  const multi: StatusEffect[] = [
    { id: "defense_up", name: "防御強化", turns: 2 },
    { id: "speed_up", name: "速度強化", turns: 1 },
  ];

  it("applies all buffs independently", () => {
    const result = getEffectiveStats(INITIAL_PLAYER, multi);
    expect(result.defense).toBe(Math.floor(base.defense * 1.5));
    expect(result.speed).toBe(Math.floor(base.speed * 2));
  });
});

describe("getEffectiveStats with irrelevant status", () => {
  const unrelated: StatusEffect[] = [{ id: "poison", name: "毒", turns: 2 }];

  it("does not modify any stats for non-buff status", () => {
    const result = getEffectiveStats(INITIAL_PLAYER, unrelated);
    expect(result.attack).toBe(base.attack);
    expect(result.defense).toBe(base.defense);
    expect(result.speed).toBe(base.speed);
  });
});
