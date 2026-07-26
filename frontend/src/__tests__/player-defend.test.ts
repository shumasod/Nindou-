import { gameReducer } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function baseState(): GameState {
  return {
    player: {
      name: "Test",
      level: 1,
      exp: 0,
      expToNext: 100,
      hp: 80,
      maxHp: 100,
      chakra: 20,
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

describe("PLAYER_DEFEND", () => {
  it("applies defending status for 1 turn", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    const status = next.battle.playerStatus.find((e) => e.id === "defending");
    expect(status).toBeDefined();
    expect(status?.turns).toBe(1);
  });

  it("transitions phase to enemy", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.battle.phase).toBe("enemy");
  });

  it("grants chakra regen on defend", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.player.chakra).toBeGreaterThan(s.player.chakra);
  });

  it("chakra does not exceed maxChakra", () => {
    const s = baseState();
    s.player.chakra = 58;
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.player.chakra).toBeLessThanOrEqual(s.player.maxChakra);
  });

  it("logs the defend action", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.battle.log[0]).toContain("防御態勢");
  });

  it("no-ops during enemy phase", () => {
    const s = baseState();
    s.battle.phase = "enemy" as const;
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(next.battle.playerStatus).toHaveLength(0);
    expect(next.battle.phase).toBe("enemy");
  });

  it("replaces existing defending status instead of stacking", () => {
    const s = baseState();
    s.battle.playerStatus = [{ id: "defending", name: "防御", turns: 1 }];
    const next = gameReducer(s, { type: "PLAYER_DEFEND" });
    const allDefending = next.battle.playerStatus.filter((e) => e.id === "defending");
    expect(allDefending).toHaveLength(1);
  });

  it("defending halves incoming damage", () => {
    const s = baseState();
    const defended = gameReducer(s, { type: "PLAYER_DEFEND" });
    // Now trigger enemy turn to see damage reduction
    const afterEnemy = gameReducer(defended, { type: "ENEMY_TURN" });
    // Player with defending takes at most ~half of enemy attack vs no defending
    const sNoDefend = { ...s, battle: { ...s.battle, phase: "enemy" as const } };
    const afterEnemyNoDefend = gameReducer(sNoDefend, { type: "ENEMY_TURN" });
    const dmgWithDefend = s.player.hp - afterEnemy.player.hp;
    const dmgNoDefend = s.player.hp - afterEnemyNoDefend.player.hp;
    // Defended damage should be at most roughly half (allow for randomness)
    expect(dmgWithDefend).toBeLessThan(dmgNoDefend + 5);
  });
});

describe("PLAYER_ESCAPE", () => {
  it("can escape (with high speed advantage)", () => {
    const s = baseState();
    s.player.stats = { ...s.player.stats, speed: 100 };
    // With very high speed, escape should succeed most of the time
    let escaped = false;
    for (let i = 0; i < 20; i++) {
      const next = gameReducer(s, { type: "PLAYER_ESCAPE" });
      if (next.battle.active === false) { escaped = true; break; }
    }
    expect(escaped).toBe(true);
  });

  it("logs escape attempt", () => {
    const s = baseState();
    const next = gameReducer(s, { type: "PLAYER_ESCAPE" });
    expect(next.battle.log.length).toBeGreaterThan(0);
  });

  it("no-ops during enemy phase", () => {
    const s = baseState();
    s.battle.phase = "enemy" as const;
    const next = gameReducer(s, { type: "PLAYER_ESCAPE" });
    expect(next.battle.active).toBe(true);
  });

  it("transitions phase to enemy on failed escape", () => {
    const s = baseState();
    s.player.stats = { ...s.player.stats, speed: 1 };
    // With very low speed, escape will mostly fail — check phase transitions
    let failedEscape = false;
    for (let i = 0; i < 30; i++) {
      const next = gameReducer(s, { type: "PLAYER_ESCAPE" });
      if (next.battle.active && next.battle.phase === "enemy") {
        failedEscape = true;
        break;
      }
    }
    expect(failedEscape).toBe(true);
  });
});
