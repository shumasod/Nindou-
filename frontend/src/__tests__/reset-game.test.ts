import { gameReducer, INITIAL_STATE, INITIAL_PLAYER } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function progressedState(): GameState {
  return {
    player: {
      name: "Hanzo",
      level: 10,
      exp: 500,
      expToNext: 800,
      hp: 40,
      maxHp: 200,
      chakra: 10,
      maxChakra: 100,
      gold: 9999,
      clan: "force",
      skills: ["spin_slash", "iron_stance", "thousand_thrust"],
      items: [{ id: "heal_scroll", count: 5 }],
      statPoints: 6,
      stats: { attack: 50, defense: 40, speed: 30, stealth: 20 },
      equip: { weapon: "katana_basic", armor: "light_armor" },
    },
    battle: {
      active: true,
      enemy: {
        id: "demon_lord",
        name: "魔忍王",
        icon: "👹",
        hp: 200,
        maxHp: 500,
        attack: 45,
        defense: 30,
        speed: 25,
        exp: 1000,
        gold: 500,
        ai: "boss",
        skills: [],
        drops: [],
        phase2: true,
      },
      log: ["ダメージ！", "CRITICAL!!"],
      turn: 15,
      phase: "enemy" as const,
      playerStatus: [{ id: "poison", name: "毒", turns: 2 }],
      enemyStatus: [{ id: "stun", name: "スタン", turns: 1 }],
      killCount: 7,
      playerDodge: 1,
      playerDodgeChance: 0.5,
      questId: "q005",
    },
    progress: {
      activeQuest: null,
      completedQuests: ["q001", "q002", "q003"],
      questProgress: { q001: 3, q002: 2, q003: 1 },
      unlockedAreas: ["forest", "dojo", "cave"],
      currentArea: "ruins",
    },
    ui: {
      screen: "battle" as const,
      lastReward: { exp: 500, gold: 200, items: ["heal_scroll"] },
      levelUpPending: true,
      message: "some message",
    },
  };
}

describe("RESET_GAME", () => {
  it("resets player name to empty", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.player.name).toBe(INITIAL_PLAYER.name);
  });

  it("resets player level to 1", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.player.level).toBe(1);
  });

  it("resets player exp to 0", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.player.exp).toBe(0);
  });

  it("resets player hp to initial maxHp", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.player.hp).toBe(INITIAL_PLAYER.maxHp);
  });

  it("resets player gold to initial amount", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.player.gold).toBe(INITIAL_PLAYER.gold);
  });

  it("clears clan to null", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.player.clan).toBeNull();
  });

  it("resets skills to empty", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.player.skills).toHaveLength(0);
  });

  it("resets items to initial inventory", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.player.items).toEqual(INITIAL_PLAYER.items);
  });

  it("deactivates battle", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.battle.active).toBe(false);
    expect(next.battle.enemy).toBeNull();
  });

  it("clears battle log", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.battle.log).toHaveLength(0);
  });

  it("clears completed quests", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.progress.completedQuests).toHaveLength(0);
  });

  it("resets screen to title", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.ui.screen).toBe("title");
  });

  it("clears levelUpPending", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.ui.levelUpPending).toBe(false);
  });

  it("clears lastReward", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.ui.lastReward).toBeNull();
  });

  it("resets statPoints to 0", () => {
    const s = progressedState();
    const next = gameReducer(s, { type: "RESET_GAME" });
    expect(next.player.statPoints).toBe(0);
  });
});
