import { INITIAL_STATE } from "../components/KageNinden/reducer";
import { applyPlayerDamage, applyEnemyDamage } from "../components/KageNinden/reducer/helpers";
import type { GameState, StatusEffect } from "../components/KageNinden/types";

function stateWithHp(hp: number, maxHp: number): GameState {
  return {
    ...INITIAL_STATE,
    player: { ...INITIAL_STATE.player, hp, maxHp },
  };
}

function stateWithDefending(hp: number, maxHp: number): GameState {
  const defending: StatusEffect = { id: "defending", name: "防御中", turns: 1 };
  return {
    ...INITIAL_STATE,
    player: { ...INITIAL_STATE.player, hp, maxHp },
    battle: { ...INITIAL_STATE.battle, playerStatus: [defending] },
  };
}

function stateWithEnemy(enemyHp: number): GameState {
  return {
    ...INITIAL_STATE,
    battle: {
      ...INITIAL_STATE.battle,
      enemy: {
        id: "wolf",
        name: "Wolf",
        icon: "🐺",
        hp: enemyHp,
        maxHp: 100,
        attack: 15,
        defense: 5,
        speed: 10,
        exp: 30,
        gold: 20,
        ai: "aggressive",
        skills: [],
        drops: [],
        phase2: false,
      },
    },
  };
}

describe("applyPlayerDamage without defending", () => {
  it("subtracts full damage from player hp", () => {
    const state = stateWithHp(100, 100);
    const next = applyPlayerDamage(state, 30);
    expect(next.player.hp).toBe(70);
  });

  it("does not reduce hp below 0", () => {
    const state = stateWithHp(10, 100);
    const next = applyPlayerDamage(state, 100);
    expect(next.player.hp).toBe(0);
  });

  it("does not affect maxHp", () => {
    const state = stateWithHp(100, 100);
    const next = applyPlayerDamage(state, 40);
    expect(next.player.maxHp).toBe(100);
  });

  it("does not change other player fields", () => {
    const state = stateWithHp(100, 100);
    const next = applyPlayerDamage(state, 20);
    expect(next.player.gold).toBe(state.player.gold);
    expect(next.player.level).toBe(state.player.level);
  });
});

describe("applyPlayerDamage with defending status", () => {
  it("reduces damage by 50% when defending", () => {
    const state = stateWithDefending(100, 100);
    const next = applyPlayerDamage(state, 40);
    expect(next.player.hp).toBe(80);
  });

  it("damage floors at 0 even when defending", () => {
    const state = stateWithDefending(5, 100);
    const next = applyPlayerDamage(state, 200);
    expect(next.player.hp).toBe(0);
  });

  it("defending with odd damage floors correctly", () => {
    const state = stateWithDefending(100, 100);
    const next = applyPlayerDamage(state, 10);
    expect(next.player.hp).toBe(95);
  });
});

describe("applyEnemyDamage", () => {
  it("subtracts damage from enemy hp", () => {
    const state = stateWithEnemy(80);
    const next = applyEnemyDamage(state, 25);
    expect(next.battle.enemy!.hp).toBe(55);
  });

  it("does not reduce enemy hp below 0", () => {
    const state = stateWithEnemy(20);
    const next = applyEnemyDamage(state, 100);
    expect(next.battle.enemy!.hp).toBe(0);
  });

  it("does not modify enemy maxHp", () => {
    const state = stateWithEnemy(80);
    const next = applyEnemyDamage(state, 30);
    expect(next.battle.enemy!.maxHp).toBe(100);
  });

  it("returns state unchanged if no enemy", () => {
    const next = applyEnemyDamage(INITIAL_STATE, 50);
    expect(next).toBe(INITIAL_STATE);
  });
});
