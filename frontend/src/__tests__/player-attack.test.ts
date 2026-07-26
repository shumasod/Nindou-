import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function makePlayerTurn(enemyHp = 500): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
  return {
    ...s,
    battle: {
      ...s.battle,
      phase: "player" as const,
      enemy: { ...s.battle.enemy!, hp: enemyHp, maxHp: enemyHp },
    },
  };
}

describe("PLAYER_ATTACK — basic", () => {
  it("is a no-op when phase is not player", () => {
    const s = { ...makePlayerTurn(), battle: { ...makePlayerTurn().battle, phase: "enemy" as const } };
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next).toBe(s);
  });

  it("is a no-op when enemy is null", () => {
    const s = { ...makePlayerTurn(), battle: { ...makePlayerTurn().battle, enemy: null } };
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next).toBe(s);
  });

  it("reduces enemy HP", () => {
    const s = makePlayerTurn(500);
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.battle.enemy!.hp).toBeLessThan(500);
  });

  it("transitions phase to enemy after attack", () => {
    const s = makePlayerTurn(500);
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.battle.phase).toBe("enemy");
  });

  it("adds an attack log entry", () => {
    const s = makePlayerTurn(500);
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.battle.log[0]).toContain("ダメージ");
  });
});

describe("PLAYER_ATTACK — kill", () => {
  it("kills enemy when HP drops to 0", () => {
    const s = makePlayerTurn(1);
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    const killed = next.battle.enemy === null || next.battle.enemy!.hp <= 0 || !next.battle.active || next.progress.questProgress["q001"] >= 1;
    expect(killed).toBe(true);
  });

  it("awards EXP after kill", () => {
    const s = makePlayerTurn(1);
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.player.exp).toBeGreaterThan(s.player.exp);
  });

  it("awards gold after kill", () => {
    const s = makePlayerTurn(1);
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.player.gold).toBeGreaterThan(s.player.gold);
  });

  it("increments questProgress after kill", () => {
    const s = makePlayerTurn(1);
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.progress.questProgress["q001"] ?? 0).toBeGreaterThanOrEqual(1);
  });

  it("logs the kill message", () => {
    const s = makePlayerTurn(1);
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    const killedInLog = next.battle.log.some((l) => l.includes("倒した"));
    expect(killedInLog).toBe(true);
  });

  it("increments killCount after kill", () => {
    const s = makePlayerTurn(1);
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.battle.killCount).toBeGreaterThan(s.battle.killCount);
  });
});

describe("PLAYER_ATTACK — defending reduction", () => {
  it("enemy taking damage is always at least 1", () => {
    const s = {
      ...makePlayerTurn(500),
      player: {
        ...makePlayerTurn(500).player,
        stats: { attack: 1, defense: 1, speed: 1, stealth: 1 },
      },
      battle: {
        ...makePlayerTurn(500).battle,
        enemy: { ...makePlayerTurn(500).battle.enemy!, defense: 9999, hp: 500 },
      },
    };
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    const dmg = 500 - (next.battle.enemy?.hp ?? 0);
    expect(dmg).toBeGreaterThanOrEqual(1);
  });
});
