import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";
import { checkLevelUp } from "@/components/KageNinden/reducer/helpers";

function makeForcePlayer(name = "影丸"): GameState {
  const s1 = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  return gameReducer(s1, { type: "SET_NAME", name });
}

function makeSpeedPlayer(): GameState {
  const s1 = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "speed" });
  return gameReducer(s1, { type: "SET_NAME", name: "迅丸" });
}

function makeIllusionPlayer(): GameState {
  const s1 = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "illusion" });
  return gameReducer(s1, { type: "SET_NAME", name: "幻丸" });
}

// ===== レベルアップ =====
describe("checkLevelUp", () => {
  test("EXPが閾値を超えるとレベルが上がる", () => {
    const base = makeForcePlayer();
    const s: GameState = { ...base, player: { ...base.player, exp: 100, expToNext: 100 } };
    const after = checkLevelUp(s);
    expect(after.player.level).toBe(2);
    expect(after.player.exp).toBe(0);
  });

  test("レベルアップでstatPoints+3が付与される", () => {
    const base = makeForcePlayer();
    const s: GameState = { ...base, player: { ...base.player, exp: 100, expToNext: 100, statPoints: 0 } };
    const after = checkLevelUp(s);
    expect(after.player.statPoints).toBe(3);
  });

  test("レベルアップでHPが最大値まで回復する", () => {
    const base = makeForcePlayer();
    const s: GameState = {
      ...base,
      player: { ...base.player, exp: 100, expToNext: 100, hp: 50, maxHp: 100 },
    };
    const after = checkLevelUp(s);
    expect(after.player.hp).toBe(after.player.maxHp);
  });

  test("レベルアップで最大HP・チャクラが増加する", () => {
    const base = makeForcePlayer();
    const prevMaxHp = base.player.maxHp;
    const prevMaxChakra = base.player.maxChakra;
    const s: GameState = { ...base, player: { ...base.player, exp: 100, expToNext: 100 } };
    const after = checkLevelUp(s);
    expect(after.player.maxHp).toBeGreaterThan(prevMaxHp);
    expect(after.player.maxChakra).toBeGreaterThan(prevMaxChakra);
  });

  test("EXPが足りなければレベルアップしない", () => {
    const base = makeForcePlayer();
    const s: GameState = { ...base, player: { ...base.player, exp: 50, expToNext: 100 } };
    const after = checkLevelUp(s);
    expect(after.player.level).toBe(1);
    expect(after.player.exp).toBe(50);
  });

  test("複数レベルまとめて上がる（大量EXP）", () => {
    const base = makeForcePlayer();
    // 100 expToNext at Lv1; after Lv2 expToNext grows. Give 10000 exp.
    const s: GameState = { ...base, player: { ...base.player, exp: 10000, expToNext: 100 } };
    const after = checkLevelUp(s);
    expect(after.player.level).toBeGreaterThan(3);
  });

  test("Lv3でforce流派のiron_stanceスキルが解放される", () => {
    const base = makeForcePlayer();
    // Give enough exp to reach Lv3
    const s: GameState = { ...base, player: { ...base.player, exp: 10000, expToNext: 100 } };
    const after = checkLevelUp(s);
    if (after.player.level >= 3) {
      expect(after.player.skills).toContain("iron_stance");
    }
  });

  test("Lv3でillusion流派のconfusion_jutsuスキルが解放される", () => {
    const base = makeIllusionPlayer();
    const s: GameState = { ...base, player: { ...base.player, exp: 10000, expToNext: 100 } };
    const after = checkLevelUp(s);
    if (after.player.level >= 3) {
      expect(after.player.skills).toContain("confusion_jutsu");
    }
  });

  test("Lv3でspeed流派のsmoke_escapeスキルが解放される", () => {
    const base = makeSpeedPlayer();
    const s: GameState = { ...base, player: { ...base.player, exp: 10000, expToNext: 100 } };
    const after = checkLevelUp(s);
    if (after.player.level >= 3) {
      expect(after.player.skills).toContain("smoke_escape");
    }
  });

  test("levelUpPendingがtrueになる", () => {
    const base = makeForcePlayer();
    const s: GameState = {
      ...base,
      player: { ...base.player, exp: 100, expToNext: 100 },
      ui: { ...base.ui, levelUpPending: false },
    };
    const after = checkLevelUp(s);
    expect(after.ui.levelUpPending).toBe(true);
  });

  test("MAX_LEVEL(99)を超えない", () => {
    const base = makeForcePlayer();
    const s: GameState = {
      ...base,
      player: { ...base.player, level: 99, exp: 9999999, expToNext: 1 },
    };
    const after = checkLevelUp(s);
    expect(after.player.level).toBe(99);
  });
});

// ===== ALLOCATE_STAT =====
describe("ALLOCATE_STAT", () => {
  test("ポイントがあれば攻撃力を+1できる", () => {
    const base = makeForcePlayer();
    const s: GameState = { ...base, player: { ...base.player, statPoints: 3 } };
    const after = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(after.player.stats.attack).toBe(s.player.stats.attack + 1);
    expect(after.player.statPoints).toBe(2);
  });

  test("ポイントがあれば防御力を+1できる", () => {
    const base = makeForcePlayer();
    const s: GameState = { ...base, player: { ...base.player, statPoints: 1 } };
    const after = gameReducer(s, { type: "ALLOCATE_STAT", stat: "defense" });
    expect(after.player.stats.defense).toBe(s.player.stats.defense + 1);
    expect(after.player.statPoints).toBe(0);
  });

  test("ポイントがあれば素早さを+1できる", () => {
    const base = makeForcePlayer();
    const s: GameState = { ...base, player: { ...base.player, statPoints: 2 } };
    const after = gameReducer(s, { type: "ALLOCATE_STAT", stat: "speed" });
    expect(after.player.stats.speed).toBe(s.player.stats.speed + 1);
  });

  test("ポイントがあれば隠密を+1できる", () => {
    const base = makeForcePlayer();
    const s: GameState = { ...base, player: { ...base.player, statPoints: 1 } };
    const after = gameReducer(s, { type: "ALLOCATE_STAT", stat: "stealth" });
    expect(after.player.stats.stealth).toBe(s.player.stats.stealth + 1);
  });

  test("statPoints 0ではステータスが変わらない", () => {
    const base = makeForcePlayer();
    const s: GameState = { ...base, player: { ...base.player, statPoints: 0 } };
    const after = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(after.player.stats.attack).toBe(s.player.stats.attack);
    expect(after.player.statPoints).toBe(0);
  });

  test("複数回振り分けができる", () => {
    const base = makeForcePlayer();
    const s: GameState = { ...base, player: { ...base.player, statPoints: 3, stats: { ...base.player.stats, attack: 10 } } };
    const after1 = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    const after2 = gameReducer(after1, { type: "ALLOCATE_STAT", stat: "attack" });
    const after3 = gameReducer(after2, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(after3.player.stats.attack).toBe(10 + 3); // 3 allocations × 1
    expect(after3.player.statPoints).toBe(0);
  });
});
