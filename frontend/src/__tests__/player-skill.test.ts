import { gameReducer } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function baseState(): GameState {
  return {
    player: {
      name: "Test",
      level: 7,
      exp: 0,
      expToNext: 500,
      hp: 100,
      maxHp: 100,
      chakra: 60,
      maxChakra: 60,
      gold: 100,
      clan: "force",
      skills: ["spin_slash", "iron_stance", "thousand_thrust", "phantom_clone", "confusion_jutsu", "shinigami_illusion", "flash_step", "smoke_escape", "shadow_clone"],
      items: [],
      statPoints: 0,
      stats: { attack: 20, defense: 10, speed: 12, stealth: 5 },
      equip: { weapon: "kunai_basic", armor: "cloth_basic" },
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
      screen: "battle" as const,
      lastReward: null,
      levelUpPending: false,
      message: "",
    },
  };
}

describe("PLAYER_SKILL: damage skills", () => {
  it("spin_slash deals damage to enemy", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(next.battle.enemy!.hp).toBeLessThan(60);
  });

  it("spin_slash costs 15 chakra", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(next.player.chakra).toBe(45);
  });

  it("thousand_thrust costs 30 chakra", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "thousand_thrust" });
    expect(next.player.chakra).toBe(30);
  });

  it("damage skill no-ops when chakra is insufficient", () => {
    const s = baseState();
    s.player.chakra = 10;
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(next.battle.enemy!.hp).toBe(60);
    expect(next.player.chakra).toBe(10);
  });

  it("damage skill transitions to enemy phase", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(next.battle.phase).toBe("enemy");
  });

  it("logs damage skill use", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(next.battle.log[0]).toContain("ダメージ");
  });
});

describe("PLAYER_SKILL: buff skills", () => {
  it("iron_stance adds defense_up status", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "iron_stance" });
    const status = next.battle.playerStatus.find((e) => e.id === "defense_up");
    expect(status).toBeDefined();
    expect(status?.turns).toBe(3);
  });

  it("iron_stance costs 20 chakra", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "iron_stance" });
    expect(next.player.chakra).toBe(40);
  });
});

describe("PLAYER_SKILL: debuff skills", () => {
  it("confusion_jutsu applies confusion to enemy", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "confusion_jutsu" });
    const status = next.battle.enemyStatus.find((e) => e.id === "confusion");
    expect(status).toBeDefined();
    expect(status?.turns).toBe(3);
  });
});

describe("PLAYER_SKILL: stun skills", () => {
  it("shinigami_illusion stuns enemy for 2 turns", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "shinigami_illusion" });
    const stun = next.battle.enemyStatus.find((e) => e.id === "stun");
    expect(stun?.turns).toBe(2);
  });
});

describe("PLAYER_SKILL: dodge skills", () => {
  it("phantom_clone sets playerDodge to 1", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "phantom_clone" });
    expect(next.battle.playerDodge).toBe(1);
  });

  it("shadow_clone adds shadow_clone status with dodge chance", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "shadow_clone" });
    const status = next.battle.playerStatus.find((e) => e.id === "shadow_clone");
    expect(status).toBeDefined();
    expect(next.battle.playerDodgeChance).toBe(0.5);
  });
});

describe("PLAYER_SKILL: escape skills", () => {
  it("smoke_escape ends battle and returns to home", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "smoke_escape" });
    expect(next.battle.active).toBe(false);
    expect(next.ui.screen).toBe("home");
  });
});

describe("PLAYER_SKILL: guard conditions", () => {
  it("no-ops during enemy phase", () => {
    const s = baseState();
    s.battle.phase = "enemy" as const;
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(next.battle.enemy!.hp).toBe(60);
  });

  it("no-ops for unknown skill id", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_SKILL", skillId: "nonexistent_skill" });
    expect(next.battle.enemy!.hp).toBe(60);
  });
});
