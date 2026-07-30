import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import { BATTLE_TURN_LIMIT } from "../components/KageNinden/reducer/helpers";
import type { GameState } from "../components/KageNinden/types";

function battleState(turn: number): GameState {
  return {
    ...INITIAL_STATE,
    player: {
      ...INITIAL_STATE.player,
      hp: 100,
      stats: { ...INITIAL_STATE.player.stats, defense: 9999 },
    },
    battle: {
      ...INITIAL_STATE.battle,
      active: true,
      enemy: {
        id: "forest_bandit",
        name: "山賊",
        icon: "🗡️",
        hp: 9999,
        maxHp: 9999,
        attack: 1,
        defense: 9999,
        speed: 8,
        exp: 30,
        gold: 20,
        ai: "aggressive",
        skills: ["basic_attack"],
        drops: [],
        phase2: false,
      },
      turn,
      phase: "enemy" as const,
    },
    ui: { ...INITIAL_STATE.ui, screen: "battle" as const },
  };
}

describe("BATTLE_TURN_LIMIT constant", () => {
  it("is exported as 30", () => {
    expect(BATTLE_TURN_LIMIT).toBe(30);
  });
});

describe("turn limit enforcement", () => {
  it("battle continues below the turn limit", () => {
    const s = battleState(BATTLE_TURN_LIMIT - 1);
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.battle.active).toBe(true);
    expect(next.ui.screen).toBe("battle");
  });

  it("battle ends when turn exceeds limit", () => {
    const s = battleState(BATTLE_TURN_LIMIT);
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.battle.active).toBe(false);
  });

  it("screen transitions to home on draw", () => {
    const s = battleState(BATTLE_TURN_LIMIT);
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.ui.screen).toBe("home");
  });

  it("draw log message is prepended", () => {
    const s = battleState(BATTLE_TURN_LIMIT);
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.battle.log[0]).toContain("引き分け");
  });

  it("turn limit message references BATTLE_TURN_LIMIT value", () => {
    const s = battleState(BATTLE_TURN_LIMIT);
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.battle.log[0]).toContain(String(BATTLE_TURN_LIMIT));
  });

  it("player HP is preserved on draw", () => {
    const s = battleState(BATTLE_TURN_LIMIT);
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.player.hp).toBeGreaterThan(0);
  });

  it("player exp is not changed on draw", () => {
    const s = battleState(BATTLE_TURN_LIMIT);
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.player.exp).toBe(s.player.exp);
  });

  it("player gold is not changed on draw", () => {
    const s = battleState(BATTLE_TURN_LIMIT);
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.player.gold).toBe(s.player.gold);
  });

  it("battle one turn before limit still increments turn", () => {
    const s = battleState(BATTLE_TURN_LIMIT - 1);
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.battle.turn).toBe(BATTLE_TURN_LIMIT);
  });

  it("chakra regens even on the draw turn", () => {
    const s = battleState(BATTLE_TURN_LIMIT);
    s.player.chakra = 5;
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.player.chakra).toBeGreaterThan(5);
  });
});
