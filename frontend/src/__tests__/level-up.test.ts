import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import { checkLevelUp } from "../components/KageNinden/reducer/helpers";
import type { GameState } from "../components/KageNinden/types";

function makeStateAtExp(exp: number, expToNext: number, level = 1): GameState {
  return {
    ...INITIAL_STATE,
    player: {
      ...INITIAL_STATE.player,
      exp,
      expToNext,
      level,
      hp: 80,
      maxHp: 100,
      chakra: 30,
      maxChakra: 50,
      statPoints: 0,
    },
  };
}

describe("checkLevelUp", () => {
  it("does not level up when exp < expToNext", () => {
    const s = makeStateAtExp(50, 100);
    const next = checkLevelUp(s);
    expect(next.player.level).toBe(1);
  });

  it("levels up when exp >= expToNext", () => {
    const s = makeStateAtExp(100, 100);
    const next = checkLevelUp(s);
    expect(next.player.level).toBe(2);
  });

  it("subtracts expToNext from exp on level up", () => {
    const s = makeStateAtExp(150, 100);
    const next = checkLevelUp(s);
    expect(next.player.exp).toBe(50);
  });

  it("grants 3 stat points on level up", () => {
    const s = makeStateAtExp(100, 100);
    const next = checkLevelUp(s);
    expect(next.player.statPoints).toBe(3);
  });

  it("restores HP to new max on level up", () => {
    const s = makeStateAtExp(100, 100);
    const next = checkLevelUp(s);
    expect(next.player.hp).toBe(next.player.maxHp);
  });

  it("restores chakra to new max on level up", () => {
    const s = makeStateAtExp(100, 100);
    const next = checkLevelUp(s);
    expect(next.player.chakra).toBe(next.player.maxChakra);
  });

  it("increases maxHp on level up", () => {
    const s = makeStateAtExp(100, 100);
    const next = checkLevelUp(s);
    expect(next.player.maxHp).toBeGreaterThan(100);
  });

  it("sets levelUpPending flag", () => {
    const s = makeStateAtExp(100, 100);
    const next = checkLevelUp(s);
    expect(next.ui.levelUpPending).toBe(true);
  });

  it("does not set levelUpPending if no level up", () => {
    const s = makeStateAtExp(50, 100);
    const next = checkLevelUp(s);
    expect(next.ui.levelUpPending).toBe(false);
  });

  it("handles multiple level ups in one call (exp overflow)", () => {
    const s = makeStateAtExp(300, 100);
    const next = checkLevelUp(s);
    expect(next.player.level).toBeGreaterThanOrEqual(3);
  });

  it("does not exceed MAX_LEVEL (99)", () => {
    const s = makeStateAtExp(999999, 1, 99);
    const next = checkLevelUp(s);
    expect(next.player.level).toBe(99);
  });
});

describe("level up via battle (PLAYER_ATTACK)", () => {
  function makeAlmostLevelUp(): GameState {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
    s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
    return {
      ...s,
      player: { ...s.player, exp: s.player.expToNext - 1 },
      battle: { ...s.battle, phase: "player" as const, enemy: { ...s.battle.enemy!, hp: 1, maxHp: 9999 } },
    };
  }

  it("levels up when killing enemy provides enough exp", () => {
    const s = makeAlmostLevelUp();
    const initialLevel = s.player.level;
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.player.level).toBeGreaterThan(initialLevel);
  });

  it("levelUpPending is set after level-up from kill", () => {
    const s = makeAlmostLevelUp();
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.ui.levelUpPending).toBe(true);
  });
});
