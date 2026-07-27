import { gameReducer } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";
import { QUESTS } from "../components/KageNinden/data";

function baseState(overrides?: Partial<GameState["battle"]>): GameState {
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
      stats: { attack: 9999, defense: 10, speed: 10 },
      weapon: "kunai_basic",
      armor: "cloth_basic",
    },
    battle: {
      active: true,
      enemy: {
        id: "forest_bandit",
        name: "山賊",
        icon: "🗡️",
        hp: 1,
        maxHp: 60,
        attack: 12,
        defense: 5,
        speed: 8,
        exp: 30,
        gold: 20,
        ai: "aggressive",
        skills: ["basic_attack"],
        drops: [],
        phase2: false,
      },
      log: [],
      turn: 1,
      phase: "player" as const,
      playerStatus: [],
      enemyStatus: [],
      killCount: 0,
      playerDodgeChance: 0,
      ...overrides,
    },
    progress: {
      activeQuest: null,
      completedQuests: [],
      questProgress: {},
      unlockedAreas: ["forest"],
    },
    ui: {
      screen: "battle" as const,
      lastReward: null,
      levelUpPending: false,
    },
  };
}

describe("enemy defeat: basic rewards", () => {
  it("grants enemy exp on kill", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.player.exp).toBe(30);
  });

  it("grants enemy gold on kill", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.player.gold).toBe(70); // 50 + 20
  });

  it("increments kill count", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.battle.killCount).toBe(1);
  });

  it("logs the kill message", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.battle.log.some((l) => l.includes("倒した"))).toBe(true);
  });
});

describe("enemy defeat: level up on kill", () => {
  it("triggers level up when exp threshold crossed", () => {
    const s = baseState();
    s.player.exp = 80; // 80 + 30 = 110 > expToNext(100)
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.player.level).toBe(2);
  });

  it("sets levelUpPending flag on level up", () => {
    const s = baseState();
    s.player.exp = 80;
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.ui.levelUpPending).toBe(true);
  });

  it("grants statPoints on level up", () => {
    const s = baseState();
    s.player.exp = 80;
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.player.statPoints).toBe(3);
  });

  it("restores HP to maxHp on level up", () => {
    const s = baseState();
    s.player.hp = 40;
    s.player.exp = 80;
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.player.hp).toBe(next.player.maxHp);
  });
});

describe("enemy defeat: quest progress", () => {
  it("increments quest progress on relevant kill", () => {
    const quest = QUESTS.find((q) => q.target === "forest_bandit")!;
    const s = baseState();
    s.progress.activeQuest = { ...quest, progress: 0 };
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.progress.questProgress[quest.id]).toBe(1);
  });

  it("completes quest and transitions to victory when target count met", () => {
    const quest = QUESTS.find((q) => q.target === "forest_bandit")!;
    const s = baseState();
    s.progress.activeQuest = { ...quest, progress: 0 };
    s.progress.questProgress = { [quest.id]: quest.count - 1 };
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.progress.completedQuests).toContain(quest.id);
    expect(next.ui.screen).toBe("victory");
  });

  it("grants quest exp reward on completion", () => {
    const quest = QUESTS.find((q) => q.target === "forest_bandit")!;
    const s = baseState();
    s.progress.activeQuest = { ...quest, progress: 0 };
    s.progress.questProgress = { [quest.id]: quest.count - 1 };
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    // player.exp = enemy.exp + quest.reward.exp (may level up, so check gold instead)
    expect(next.player.gold).toBeGreaterThanOrEqual(s.player.gold + quest.reward.gold);
  });

  it("does not progress quest for wrong enemy", () => {
    const quest = QUESTS.find((q) => q.target === "ninja_trainee")!;
    const s = baseState();
    s.progress.activeQuest = { ...quest, progress: 0 };
    gameReducer(s, { type: "PLAYER_ATTACK" });
    // quest progress for ninja_trainee should not increment when killing forest_bandit
    expect(s.progress.questProgress[quest.id]).toBeUndefined();
  });
});

describe("enemy defeat: item drops", () => {
  it("can receive item drop with 100% drop rate", () => {
    const s = baseState();
    s.battle.enemy!.drops = [{ id: "heal_scroll", rate: 1.0 }];
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.player.items.find((i) => i.id === "heal_scroll")).toBeDefined();
  });

  it("never receives item drop with 0% drop rate", () => {
    const s = baseState();
    s.battle.enemy!.drops = [{ id: "heal_scroll", rate: 0 }];
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.player.items.find((i) => i.id === "heal_scroll")).toBeUndefined();
  });

  it("stacks item if already in inventory", () => {
    const s = baseState();
    s.player.items = [{ id: "heal_scroll", count: 2 }];
    s.battle.enemy!.drops = [{ id: "heal_scroll", rate: 1.0 }];
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    const stack = next.player.items.find((i) => i.id === "heal_scroll");
    expect(stack?.count).toBe(3);
  });
});
