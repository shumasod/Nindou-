import { gameReducer } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";
import { ENEMIES } from "../components/KageNinden/data";

function baseState(): GameState {
  return {
    player: {
      name: "Test",
      level: 1,
      exp: 0,
      expToNext: 100,
      hp: 100,
      maxHp: 100,
      chakra: 30,
      maxChakra: 60,
      gold: 50,
      clan: "force",
      skills: ["spin_slash"],
      items: [],
      statPoints: 0,
      stats: { attack: 15, defense: 10, speed: 10, stealth: 5 },
      equip: { weapon: "kunai_basic", armor: "cloth_basic" },
    },
    battle: {
      active: false,
      enemy: null,
      log: [],
      turn: 1,
      phase: "player" as const,
      playerStatus: [],
      enemyStatus: [],
      killCount: 0,
      playerDodge: 0,
      playerDodgeChance: 0,
      questId: null,
    },
    progress: {
      activeQuest: null,
      completedQuests: [],
      questProgress: {},
      unlockedAreas: ["forest"],
      currentArea: "forest",
    },
    ui: {
      screen: "home" as const,
      lastReward: null,
      levelUpPending: false,
      message: "",
    },
  };
}

describe("START_BATTLE", () => {
  it("sets battle active to true", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(next.battle.active).toBe(true);
  });

  it("sets the correct enemy", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(next.battle.enemy?.id).toBe("forest_bandit");
    expect(next.battle.enemy?.name).toBe("山賊");
  });

  it("initializes enemy hp to full", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    const template = ENEMIES["forest_bandit"];
    expect(next.battle.enemy?.hp).toBe(template.hp);
    expect(next.battle.enemy?.maxHp).toBe(template.hp);
  });

  it("resets turn counter to 1", () => {
    const s = baseState();
    s.battle.turn = 5;
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(next.battle.turn).toBe(1);
  });

  it("clears status effects", () => {
    const s = baseState();
    s.battle.playerStatus = [{ id: "poison", name: "毒", turns: 2 }];
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(next.battle.playerStatus).toHaveLength(0);
  });

  it("transitions screen to battle", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(next.ui.screen).toBe("battle");
  });

  it("sets phase to player at battle start", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(next.battle.phase).toBe("player");
  });

  it("no-ops for unknown enemy id", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "nonexistent_enemy" });
    expect(next.battle.active).toBe(false);
    expect(next.battle.enemy).toBeNull();
  });

  it("enemy phase2 starts as false", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "demon_lord" });
    expect(next.battle.enemy?.phase2).toBe(false);
  });

  it("resets kill count to 0", () => {
    const s = baseState();
    s.battle.killCount = 5;
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(next.battle.killCount).toBe(0);
  });

  it("logs appearance message", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "START_BATTLE", enemyId: "ninja_trainee" });
    expect(next.battle.log.length).toBeGreaterThan(0);
  });

  it("ambush adds stun to enemy", () => {
    const s = baseState();
    // High stealth stat increases ambush chance
    s.player.stats = { ...s.player.stats, stealth: 100 } as typeof s.player.stats;
    let ambushOccurred = false;
    for (let i = 0; i < 30; i++) {
      const next = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
      if (next.battle.enemyStatus.some((e) => e.id === "stun")) {
        ambushOccurred = true;
        break;
      }
    }
    expect(ambushOccurred).toBe(true);
  });
});
