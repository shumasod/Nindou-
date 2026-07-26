import { gameReducer } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

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
      gold: 100,
      clan: "force",
      skills: ["spin_slash"],
      items: [],
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
      phase: "enemy" as const,
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

describe("ENEMY_TURN: basic behavior", () => {
  it("no-ops during player phase", () => {
    const s = baseState();
    s.battle.phase = "player" as const;
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.battle.log).toHaveLength(0);
    expect(next.battle.phase).toBe("player");
  });

  it("transitions phase back to player after enemy turn", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.battle.phase).toBe("player");
  });

  it("increments turn counter", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.battle.turn).toBe(2);
  });

  it("regens player chakra each turn", () => {
    const s = baseState();
    s.player.chakra = 10;
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.player.chakra).toBeGreaterThan(10);
  });

  it("chakra regen does not exceed maxChakra", () => {
    const s = baseState();
    s.player.chakra = 59;
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.player.chakra).toBeLessThanOrEqual(s.player.maxChakra);
  });

  it("logs the enemy action", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.battle.log.length).toBeGreaterThan(0);
  });

  it("enemy deals damage to player", () => {
    const s = baseState();
    let tookDamage = false;
    for (let i = 0; i < 20; i++) {
      const next = gameReducer(s, { type: "ENEMY_TURN" });
      if (next.player.hp < s.player.hp) { tookDamage = true; break; }
    }
    expect(tookDamage).toBe(true);
  });
});

describe("ENEMY_TURN: poison tick", () => {
  it("applies poison damage each turn", () => {
    const s = baseState();
    s.battle.playerStatus = [{ id: "poison", name: "毒", turns: 3 }];
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    // Poison does 3-8 damage, so player HP must drop even beyond normal attack
    expect(next.battle.log.some((l) => l.includes("毒"))).toBe(true);
  });

  it("poison kills player when hp drops to 0", () => {
    const s = baseState();
    s.player.hp = 1;
    s.battle.playerStatus = [{ id: "poison", name: "毒", turns: 3 }];
    s.battle.enemy!.attack = 0;
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.ui.screen).toBe("gameover");
  });
});

describe("ENEMY_TURN: stun", () => {
  it("stunned enemy does not deal damage", () => {
    const s = baseState();
    s.battle.enemyStatus = [{ id: "stun", name: "スタン", turns: 1 }];
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.player.hp).toBe(s.player.hp);
    expect(next.battle.log.some((l) => l.includes("行動不能"))).toBe(true);
  });
});

describe("ENEMY_TURN: player death", () => {
  it("transitions to gameover when player hp hits 0", () => {
    const s = baseState();
    s.player.hp = 1;
    s.battle.enemy!.attack = 9999;
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.ui.screen).toBe("gameover");
    expect(next.battle.active).toBe(false);
  });
});

describe("ENEMY_TURN: status effect decrement", () => {
  it("decrements status turns each enemy turn", () => {
    const s = baseState();
    s.battle.playerStatus = [{ id: "defense_up", name: "防御UP", turns: 2 }];
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    const status = next.battle.playerStatus.find((e) => e.id === "defense_up");
    expect(status?.turns).toBe(1);
  });

  it("removes status when turns expire", () => {
    const s = baseState();
    s.battle.playerStatus = [{ id: "defense_up", name: "防御UP", turns: 1 }];
    const next = gameReducer(s, { type: "ENEMY_TURN" });
    expect(next.battle.playerStatus.find((e) => e.id === "defense_up")).toBeUndefined();
  });
});
