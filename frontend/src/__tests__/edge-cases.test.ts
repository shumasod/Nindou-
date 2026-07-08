/**
 * エッジケーステスト
 * 境界値・異常系・稀なゲームシナリオのテスト
 */
import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";
import {
  calcExpToNext,
  calcEscapeRate,
  calcDamage,
  calcDamageWithSpeed,
  getRandom,
  hasStatus,
  decrementStatus,
  hpColor,
  getEffectiveStats,
} from "@/components/KageNinden/utils";
import { ENEMIES, SKILLS, QUESTS, ITEMS } from "@/components/KageNinden/data";
import type { StatusEffect } from "@/components/KageNinden/types";

// ─── ヘルパー ───
function setupPlayer(clan: "force" | "illusion" | "speed" = "force"): GameState {
  let s = INITIAL_STATE;
  s = gameReducer(s, { type: "SELECT_CLAN", clan });
  s = gameReducer(s, { type: "SET_NAME", name: "エッジ忍" });
  return s;
}

function setupBattle(state: GameState, enemyId = "forest_bandit"): GameState {
  let s = gameReducer(state, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId, questId: "q001" });
  return s;
}

// ─── calcExpToNext の境界値 ───
describe("calcExpToNext 境界値テスト", () => {
  test("Lv1 で 100 EXP を返す", () => {
    expect(calcExpToNext(1)).toBe(100);
  });

  test("Lv99 で正の値を返す", () => {
    expect(calcExpToNext(99)).toBeGreaterThan(0);
  });

  test("Lv0 以下で 100 EXP を返す (安全フォールバック)", () => {
    expect(calcExpToNext(0)).toBe(100);
    expect(calcExpToNext(-5)).toBe(100);
  });

  test("NaN 入力でも 100 EXP を返す", () => {
    expect(calcExpToNext(NaN)).toBe(100);
  });

  test("Infinity 入力でも 100 EXP を返す", () => {
    expect(calcExpToNext(Infinity)).toBe(100);
  });

  test("レベルが上がるほど必要EXPが増加する", () => {
    const lv1 = calcExpToNext(1);
    const lv10 = calcExpToNext(10);
    const lv50 = calcExpToNext(50);
    expect(lv10).toBeGreaterThan(lv1);
    expect(lv50).toBeGreaterThan(lv10);
  });
});

// ─── calcEscapeRate の境界値 ───
describe("calcEscapeRate 境界値テスト", () => {
  test("両方0の場合は0.5を返す", () => {
    expect(calcEscapeRate(0, 0)).toBe(0.5);
  });

  test("プレイヤー速度=敵速度 なら 0.5", () => {
    expect(calcEscapeRate(10, 10)).toBe(0.5);
  });

  test("プレイヤー速度が非常に高い場合は 1 に近い", () => {
    const rate = calcEscapeRate(1000, 1);
    expect(rate).toBeGreaterThan(0.99);
  });

  test("プレイヤー速度が0で敵速度が正の場合は 0", () => {
    expect(calcEscapeRate(0, 10)).toBe(0);
  });

  test("返り値は 0〜1 の範囲内", () => {
    for (const [p, e] of [[5, 10], [10, 5], [0, 0], [100, 1]]) {
      const rate = calcEscapeRate(p, e);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    }
  });
});

// ─── calcDamage の境界値 ───
describe("calcDamage 境界値テスト", () => {
  test("攻撃力0でも最低1ダメージ", () => {
    jest.spyOn(Math, "random").mockReturnValue(0); // クリティカルなし
    const { damage } = calcDamage(0, 0);
    expect(damage).toBeGreaterThanOrEqual(1);
    jest.restoreAllMocks();
  });

  test("防御力が非常に高くても最低1ダメージ", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);
    const { damage } = calcDamage(10, 9999);
    expect(damage).toBeGreaterThanOrEqual(1);
    jest.restoreAllMocks();
  });

  test("クリティカル時はダメージが2倍になる", () => {
    // 最初の Math.random でクリティカル判定 (0.05 < critChance 0.1)
    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.05)   // クリティカル
      .mockReturnValueOnce(0.5);   // getRandom 中央値
    const crit = calcDamage(50, 10);

    jest.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)    // 非クリティカル
      .mockReturnValueOnce(0.5);
    const normal = calcDamage(50, 10);

    expect(crit.isCritical).toBe(true);
    expect(normal.isCritical).toBe(false);
    expect(crit.damage).toBeGreaterThan(normal.damage);
    jest.restoreAllMocks();
  });
});

// ─── hasStatus / decrementStatus の境界値 ───
describe("hasStatus / decrementStatus 境界値", () => {
  test("空配列で hasStatus は false", () => {
    expect(hasStatus([], "stun")).toBe(false);
  });

  test("空配列で decrementStatus は空配列", () => {
    expect(decrementStatus([])).toEqual([]);
  });

  test("turns=1 のステータスは decrementStatus 後に消える", () => {
    const effects: StatusEffect[] = [{ id: "stun", name: "スタン", turns: 1 }];
    expect(decrementStatus(effects)).toHaveLength(0);
  });

  test("turns=2 のステータスは decrementStatus 後に turns=1 になる", () => {
    const effects: StatusEffect[] = [{ id: "poison", name: "毒", turns: 2, value: 5 }];
    const result = decrementStatus(effects);
    expect(result).toHaveLength(1);
    expect(result[0].turns).toBe(1);
  });

  test("複数ステータスの一部のみ消える", () => {
    const effects: StatusEffect[] = [
      { id: "stun", name: "スタン", turns: 1 },
      { id: "poison", name: "毒", turns: 3, value: 5 },
    ];
    const result = decrementStatus(effects);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("poison");
  });
});

// ─── hpColor の境界値 ───
describe("hpColor 境界値テスト", () => {
  test("HP=0 で danger 色", () => {
    expect(hpColor(0, 100)).toBe("#c41e1e");
  });

  test("HP=100, max=100 で success 色", () => {
    expect(hpColor(100, 100)).toBe("#4a9e5c");
  });

  test("HP=25, max=100 (25%) で danger 色", () => {
    expect(hpColor(25, 100)).toBe("#c41e1e");
  });

  test("HP=26, max=100 (26%) で warning 色", () => {
    expect(hpColor(26, 100)).toBe("#d4a017");
  });

  test("HP=50, max=100 (50%) で warning 色", () => {
    expect(hpColor(50, 100)).toBe("#d4a017");
  });

  test("HP=51, max=100 (51%) で success 色", () => {
    expect(hpColor(51, 100)).toBe("#4a9e5c");
  });
});

// ─── getEffectiveStats ───
describe("getEffectiveStats バフ適用テスト", () => {
  test("バフなしでは元のステータスそのまま", () => {
    const s = setupPlayer("force");
    const result = getEffectiveStats(s.player, []);
    expect(result.attack).toBe(s.player.stats.attack);
    expect(result.defense).toBe(s.player.stats.defense);
  });

  test("defense_up で防御力が1.5倍", () => {
    const s = setupPlayer("force");
    const original = s.player.stats.defense;
    const result = getEffectiveStats(s.player, [{ id: "defense_up", name: "防御UP", turns: 2 }]);
    expect(result.defense).toBe(Math.floor(original * 1.5));
  });

  test("speed_up で速さが2倍", () => {
    const s = setupPlayer("speed");
    const original = s.player.stats.speed;
    const result = getEffectiveStats(s.player, [{ id: "speed_up", name: "速さUP", turns: 2 }]);
    expect(result.speed).toBe(Math.floor(original * 2));
  });

  test("attack_up で攻撃力が1.5倍", () => {
    const s = setupPlayer("force");
    const original = s.player.stats.attack;
    const result = getEffectiveStats(s.player, [{ id: "attack_up", name: "攻撃UP", turns: 2 }]);
    expect(result.attack).toBe(Math.floor(original * 1.5));
  });
});

// ─── RESET_GAME ───
describe("RESET_GAME アクション", () => {
  test("リセット後は INITIAL_STATE と同等になる", () => {
    let s = setupPlayer("force");
    s = gameReducer(s, { type: "RESET_GAME" });
    expect(s.ui.screen).toBe("title");
    expect(s.player.level).toBe(1);
    expect(s.player.name).toBe("");
    expect(s.progress.completedQuests).toEqual([]);
  });
});

// ─── 防御中の PLAYER_DEFEND ───
describe("PLAYER_DEFEND 重複防御テスト", () => {
  test("防御2回目は defending ステータスが重複しない", () => {
    let s = setupPlayer();
    s = setupBattle(s);
    s = { ...s, battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 }, enemyStatus: [] } };
    // 1回目防御
    s = gameReducer(s, { type: "PLAYER_DEFEND" });
    s = gameReducer(s, { type: "ENEMY_TURN" });
    // 2回目防御
    s = gameReducer(s, { type: "PLAYER_DEFEND" });
    const defendingCount = s.battle.playerStatus.filter((e) => e.id === "defending").length;
    expect(defendingCount).toBeLessThanOrEqual(1);
  });
});

// ─── ALLOCATE_STAT ───
describe("ALLOCATE_STAT アクション", () => {
  test("statPoints 0 の時は割り振れない", () => {
    let s = setupPlayer();
    s = { ...s, player: { ...s.player, statPoints: 0 } };
    const before = s.player.stats.attack;
    s = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(s.player.stats.attack).toBe(before);
  });

  test("statPoints が 1 以上なら attack に割り振れる", () => {
    let s = setupPlayer();
    s = { ...s, player: { ...s.player, statPoints: 3 } };
    const before = s.player.stats.attack;
    s = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(s.player.stats.attack).toBeGreaterThan(before);
    expect(s.player.statPoints).toBe(2);
  });

  test("stealth に割り振れる", () => {
    let s = setupPlayer();
    s = { ...s, player: { ...s.player, statPoints: 1 } };
    const before = s.player.stats.stealth;
    s = gameReducer(s, { type: "ALLOCATE_STAT", stat: "stealth" });
    expect(s.player.stats.stealth).toBeGreaterThan(before);
  });
});

// ─── データ整合性チェック ───
describe("マスターデータ追加チェック", () => {
  test("全スキルのcostは0以上", () => {
    for (const [id, skill] of Object.entries(SKILLS)) {
      expect(skill.cost).toBeGreaterThanOrEqual(0);
    }
  });

  test("全クエストのreward.expは正の値", () => {
    for (const quest of QUESTS) {
      expect(quest.reward.exp).toBeGreaterThan(0);
    }
  });

  test("全アイテムのvalueはundefinedか正の値", () => {
    for (const [id, item] of Object.entries(ITEMS)) {
      if (item.value !== undefined) {
        expect(item.value).toBeGreaterThan(0);
      }
    }
  });

  test("全敵のdrop.rateは0〜1の範囲", () => {
    for (const [id, enemy] of Object.entries(ENEMIES)) {
      for (const drop of enemy.drops) {
        expect(drop.rate).toBeGreaterThanOrEqual(0);
        expect(drop.rate).toBeLessThanOrEqual(1);
      }
    }
  });

  test("全敵のspeedは正の値", () => {
    for (const [id, enemy] of Object.entries(ENEMIES)) {
      expect(enemy.speed).toBeGreaterThan(0);
    }
  });
});

// ─── getRandom ───
describe("getRandom 範囲テスト", () => {
  test("常に min〜max の範囲内", () => {
    for (let i = 0; i < 100; i++) {
      const r = getRandom(3, 8);
      expect(r).toBeGreaterThanOrEqual(3);
      expect(r).toBeLessThanOrEqual(8);
    }
  });

  test("min === max の場合は常にその値", () => {
    for (let i = 0; i < 10; i++) {
      expect(getRandom(5, 5)).toBe(5);
    }
  });
});
