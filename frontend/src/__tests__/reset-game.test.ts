import { INITIAL_STATE, INITIAL_PLAYER, gameReducer } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function progressedState(): GameState {
  return {
    ...INITIAL_STATE,
    player: {
      ...INITIAL_PLAYER,
      name: "Naruto",
      level: 15,
      exp: 2000,
      hp: 50,
      maxHp: 200,
      chakra: 10,
      maxChakra: 90,
      gold: 500,
      clan: "force" as any,
      skills: ["spin_slash", "iron_stance"],
      items: [{ id: "heal_scroll", count: 5 }],
      statPoints: 3,
    },
    progress: {
      currentArea: "mountain",
      completedQuests: ["q1", "q2"],
      activeQuest: null,
      unlockedAreas: ["forest", "mountain"],
      questProgress: { q1: 3, q2: 5 },
    },
    battle: {
      ...INITIAL_STATE.battle,
      killCount: 12,
      log: ["倒した！"],
    },
    ui: {
      screen: "gameover",
      message: "test",
      levelUpPending: true,
      lastReward: { exp: 100, gold: 50, items: ["heal_scroll"] },
    },
  };
}

describe("RESET_GAME", () => {
  it("resets player to INITIAL_PLAYER values", () => {
    const state = progressedState();
    const next = gameReducer(state, { type: "RESET_GAME" });
    expect(next.player.level).toBe(INITIAL_PLAYER.level);
    expect(next.player.hp).toBe(INITIAL_PLAYER.hp);
    expect(next.player.gold).toBe(INITIAL_PLAYER.gold);
    expect(next.player.clan).toBe(null);
  });

  it("clears player name", () => {
    const next = gameReducer(progressedState(), { type: "RESET_GAME" });
    expect(next.player.name).toBe("");
  });

  it("resets skills to empty", () => {
    const next = gameReducer(progressedState(), { type: "RESET_GAME" });
    expect(next.player.skills).toHaveLength(0);
  });

  it("resets progress (completedQuests, questProgress)", () => {
    const next = gameReducer(progressedState(), { type: "RESET_GAME" });
    expect(next.progress.completedQuests).toHaveLength(0);
    expect(Object.keys(next.progress.questProgress)).toHaveLength(0);
    expect(next.progress.activeQuest).toBeNull();
  });

  it("resets UI to title screen", () => {
    const next = gameReducer(progressedState(), { type: "RESET_GAME" });
    expect(next.ui.screen).toBe("title");
    expect(next.ui.levelUpPending).toBe(false);
    expect(next.ui.lastReward).toBeNull();
    expect(next.ui.message).toBe("");
  });

  it("resets battle state (killCount, log, active)", () => {
    const next = gameReducer(progressedState(), { type: "RESET_GAME" });
    expect(next.battle.killCount).toBe(0);
    expect(next.battle.log).toHaveLength(0);
    expect(next.battle.active).toBe(false);
    expect(next.battle.enemy).toBeNull();
  });

  it("is idempotent: resetting an already-initial state returns equivalent state", () => {
    const next = gameReducer(INITIAL_STATE, { type: "RESET_GAME" });
    expect(next.player.level).toBe(INITIAL_STATE.player.level);
    expect(next.ui.screen).toBe("title");
    expect(next.progress.completedQuests).toHaveLength(0);
  });

  it("resets statPoints to 0", () => {
    const next = gameReducer(progressedState(), { type: "RESET_GAME" });
    expect(next.player.statPoints).toBe(0);
  });
});
