import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function battlePlayerState(overrides: Partial<GameState["battle"]> = {}): GameState {
  return {
    ...INITIAL_STATE,
    player: {
      ...INITIAL_STATE.player,
      name: "Ryu",
      hp: 80,
      maxHp: 100,
      chakra: 30,
      maxChakra: 50,
    },
    battle: {
      ...INITIAL_STATE.battle,
      active: true,
      phase: "player",
      enemy: {
        id: "bandit",
        name: "野武士",
        icon: "🗡",
        hp: 60,
        maxHp: 60,
        attack: 20,
        defense: 10,
        speed: 8,
        exp: 30,
        gold: 20,
        ai: "aggressive",
        skills: [],
        drops: [],
        phase2: false,
      },
      log: [],
      playerStatus: [],
      enemyStatus: [],
      ...overrides,
    },
  };
}

describe("PLAYER_DEFEND", () => {
  it("adds defending status to playerStatus", () => {
    const s = battlePlayerState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    const defending = next.battle.playerStatus.find((e) => e.id === "defending");
    expect(defending).toBeDefined();
    expect(defending?.name).toBe("防御");
    expect(defending?.turns).toBe(1);
  });

  it("sets phase to enemy", () => {
    const s = battlePlayerState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.battle.phase).toBe("enemy");
  });

  it("does not change player HP", () => {
    const s = battlePlayerState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.player.hp).toBe(s.player.hp);
  });

  it("recovers chakra by 8", () => {
    const s = battlePlayerState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.player.chakra).toBe(38);
  });

  it("caps chakra recovery at maxChakra", () => {
    const s = battlePlayerState({ active: true, phase: "player" });
    const full = { ...s, player: { ...s.player, chakra: 48, maxChakra: 50 } };
    const next = gameReducer(full, { type: "PLAYER_DEFEND" });
    expect(next.player.chakra).toBe(50);
  });

  it("does not change player gold", () => {
    const s = battlePlayerState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.player.gold).toBe(s.player.gold);
  });

  it("adds a log entry", () => {
    const s = battlePlayerState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.battle.log.length).toBeGreaterThan(0);
    expect(next.battle.log[0]).toContain("防御");
  });

  it("replaces existing defending status (no duplicates)", () => {
    const s = battlePlayerState({
      active: true,
      phase: "player",
      playerStatus: [{ id: "defending", name: "防御", turns: 3 }],
    });
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    const defendingAll = next.battle.playerStatus.filter((e) => e.id === "defending");
    expect(defendingAll).toHaveLength(1);
    expect(defendingAll[0].turns).toBe(1);
  });

  it("preserves other statuses", () => {
    const s = battlePlayerState({
      active: true,
      phase: "player",
      playerStatus: [{ id: "poison", name: "毒", turns: 2 }],
    });
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.battle.playerStatus.some((e) => e.id === "poison")).toBe(true);
    expect(next.battle.playerStatus.some((e) => e.id === "defending")).toBe(true);
  });

  it("has no effect when phase is not player", () => {
    const s = battlePlayerState({ active: true, phase: "enemy" });
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next).toBe(s);
  });

  it("does not change battle active status", () => {
    const s = battlePlayerState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.battle.active).toBe(true);
  });

  it("does not change enemy state", () => {
    const s = battlePlayerState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.battle.enemy).toEqual(s.battle.enemy);
  });
});
