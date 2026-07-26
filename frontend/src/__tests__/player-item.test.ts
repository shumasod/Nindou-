import { gameReducer } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function baseState(): GameState {
  return {
    player: {
      name: "Test",
      level: 1,
      exp: 0,
      expToNext: 100,
      hp: 50,
      maxHp: 100,
      chakra: 20,
      maxChakra: 60,
      gold: 200,
      clan: "force",
      skills: ["spin_slash"],
      items: [
        { id: "heal_scroll", count: 2 },
        { id: "chakra_pill", count: 1 },
        { id: "antidote", count: 1 },
        { id: "smoke_bomb", count: 1 },
      ],
      statPoints: 0,
      stats: { attack: 15, defense: 10, speed: 10 },
      weapon: "kunai_basic",
      armor: "cloth_basic",
    },
    battle: {
      active: true,
      enemy: {
        id: "forest_bandit",
        name: "山賊",
        icon: "🗡️",
        hp: 60,
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

describe("PLAYER_ITEM: heal_scroll", () => {
  it("restores HP by item value", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(next.player.hp).toBe(90); // 50 + 40
  });

  it("does not exceed maxHp", () => {
    const s = baseState();
    s.player.hp = 80;
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(next.player.hp).toBe(100);
  });

  it("decrements item count", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    const stack = next.player.items.find((i) => i.id === "heal_scroll");
    expect(stack?.count).toBe(1);
  });

  it("removes item when count reaches 0", () => {
    const s = baseState();
    s.player.items = [{ id: "heal_scroll", count: 1 }];
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(next.player.items.find((i) => i.id === "heal_scroll")).toBeUndefined();
  });

  it("logs the heal action", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(next.battle.log[0]).toContain("HP");
  });

  it("transitions phase to enemy after use", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(next.battle.phase).toBe("enemy");
  });
});

describe("PLAYER_ITEM: chakra_pill", () => {
  it("restores chakra by item value", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "chakra_pill" });
    expect(next.player.chakra).toBe(45); // 20 + 25
  });

  it("does not exceed maxChakra", () => {
    const s = baseState();
    s.player.chakra = 50;
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "chakra_pill" });
    expect(next.player.chakra).toBe(60);
  });

  it("logs the chakra recovery", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "chakra_pill" });
    expect(next.battle.log[0]).toContain("チャクラ");
  });
});

describe("PLAYER_ITEM: antidote", () => {
  it("removes poison status", () => {
    const s = baseState();
    s.battle.playerStatus = [{ id: "poison", name: "毒", turns: 3 }];
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "antidote" });
    expect(next.battle.playerStatus.find((e) => e.id === "poison")).toBeUndefined();
  });

  it("removes paralyze status", () => {
    const s = baseState();
    s.battle.playerStatus = [{ id: "paralyze", name: "麻痺", turns: 2 }];
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "antidote" });
    expect(next.battle.playerStatus.find((e) => e.id === "paralyze")).toBeUndefined();
  });

  it("preserves non-ailment status effects", () => {
    const s = baseState();
    s.battle.playerStatus = [
      { id: "poison", name: "毒", turns: 2 },
      { id: "defending", name: "防御", turns: 1 },
    ];
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "antidote" });
    expect(next.battle.playerStatus.find((e) => e.id === "defending")).toBeDefined();
  });
});

describe("PLAYER_ITEM: smoke_bomb", () => {
  it("ends battle and returns to home", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "smoke_bomb" });
    expect(next.battle.active).toBe(false);
    expect(next.ui.screen).toBe("home");
  });
});

describe("PLAYER_ITEM: guard conditions", () => {
  it("no-ops during enemy phase", () => {
    const s = baseState();
    s.battle.phase = "enemy" as const;
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(next.player.hp).toBe(s.player.hp);
  });

  it("no-ops for unknown item", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ITEM", itemId: "nonexistent_item" });
    expect(next.player.hp).toBe(s.player.hp);
  });
});
