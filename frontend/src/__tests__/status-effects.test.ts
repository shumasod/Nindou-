import { hasStatus, decrementStatus } from "../components/KageNinden/utils";
import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState, StatusEffect } from "../components/KageNinden/types";

// ─── helpers ───────────────────────────────────────────────────────────────

function makeStatus(id: string, turns: number): StatusEffect {
  return { id, name: id, turns };
}

function makeBattleState(overrides: Partial<GameState["battle"]> = {}): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
  return {
    ...s,
    battle: { ...s.battle, ...overrides },
  };
}

// ─── hasStatus ─────────────────────────────────────────────────────────────

describe("hasStatus", () => {
  it("returns true when status is present", () => {
    const effects = [makeStatus("poison", 3), makeStatus("stun", 1)];
    expect(hasStatus(effects, "poison")).toBe(true);
    expect(hasStatus(effects, "stun")).toBe(true);
  });

  it("returns false when status is absent", () => {
    const effects = [makeStatus("poison", 3)];
    expect(hasStatus(effects, "stun")).toBe(false);
  });

  it("returns false on empty array", () => {
    expect(hasStatus([], "poison")).toBe(false);
  });

  it("is case-sensitive", () => {
    const effects = [makeStatus("Poison", 2)];
    expect(hasStatus(effects, "poison")).toBe(false);
  });
});

// ─── decrementStatus ───────────────────────────────────────────────────────

describe("decrementStatus", () => {
  it("decrements turns by 1", () => {
    const result = decrementStatus([makeStatus("poison", 3)]);
    expect(result[0].turns).toBe(2);
  });

  it("removes effects at turns=1 (expire)", () => {
    const result = decrementStatus([makeStatus("stun", 1)]);
    expect(result).toHaveLength(0);
  });

  it("removes expired effects while keeping active ones", () => {
    const effects = [makeStatus("stun", 1), makeStatus("poison", 3)];
    const result = decrementStatus(effects);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("poison");
    expect(result[0].turns).toBe(2);
  });

  it("handles empty array", () => {
    expect(decrementStatus([])).toEqual([]);
  });

  it("decrements all effects independently", () => {
    const effects = [makeStatus("poison", 3), makeStatus("confusion", 2), makeStatus("defending", 1)];
    const result = decrementStatus(effects);
    expect(result).toHaveLength(2);
    expect(result.find((e) => e.id === "poison")?.turns).toBe(2);
    expect(result.find((e) => e.id === "confusion")?.turns).toBe(1);
    expect(result.find((e) => e.id === "defending")).toBeUndefined();
  });
});

// ─── PLAYER_DEFEND via reducer ─────────────────────────────────────────────

describe("PLAYER_DEFEND status application", () => {
  it("adds defending status to playerStatus", () => {
    const s = makeBattleState({ phase: "player", playerStatus: [] });
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(hasStatus(next.battle.playerStatus, "defending")).toBe(true);
  });

  it("defending status has turns=1", () => {
    const s = makeBattleState({ phase: "player", playerStatus: [] });
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    const def = next.battle.playerStatus.find((e) => e.id === "defending");
    expect(def?.turns).toBe(1);
  });

  it("defending status replaces prior defending entry", () => {
    const prior = [makeStatus("defending", 1), makeStatus("poison", 2)];
    const s = makeBattleState({ phase: "player", playerStatus: prior });
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    const defending = next.battle.playerStatus.filter((e) => e.id === "defending");
    expect(defending).toHaveLength(1);
  });

  it("does not clear unrelated status effects", () => {
    const s = makeBattleState({ phase: "player", playerStatus: [makeStatus("poison", 3)] });
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(hasStatus(next.battle.playerStatus, "poison")).toBe(true);
  });
});

// ─── Status decrement via ENEMY_TURN ──────────────────────────────────────

describe("status tick-down during ENEMY_TURN", () => {
  it("decrements playerStatus turns after enemy turn completes", () => {
    const poison: StatusEffect = { id: "poison", name: "毒", turns: 3, value: 5 };
    const s = makeBattleState({
      phase: "enemy",
      playerStatus: [poison],
      enemyStatus: [],
      enemy: { ...makeBattleState().battle.enemy!, hp: 9999, maxHp: 9999 },
    });
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    const p = next.battle.playerStatus.find((e) => e.id === "poison");
    expect(p).toBeDefined();
    expect(p!.turns).toBe(2);
  });

  it("removes playerStatus that expires after enemy turn", () => {
    const stun: StatusEffect = { id: "stun", name: "スタン", turns: 1 };
    const s = makeBattleState({
      phase: "enemy",
      playerStatus: [stun],
      enemyStatus: [],
      enemy: { ...makeBattleState().battle.enemy!, hp: 9999, maxHp: 9999 },
    });
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(hasStatus(next.battle.playerStatus, "stun")).toBe(false);
  });

  it("decrements enemyStatus turns after enemy turn completes", () => {
    const confusion: StatusEffect = { id: "confusion", name: "幻惑", turns: 2 };
    const s = makeBattleState({
      phase: "enemy",
      playerStatus: [],
      enemyStatus: [confusion],
      enemy: { ...makeBattleState().battle.enemy!, hp: 9999, maxHp: 9999 },
    });
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    const c = next.battle.enemyStatus.find((e) => e.id === "confusion");
    expect(c).toBeDefined();
    expect(c!.turns).toBe(1);
  });
});
