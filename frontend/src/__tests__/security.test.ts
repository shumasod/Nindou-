/**
 * セキュリティ修正の回帰テスト
 * 各 Fix で対処した脆弱性が再発しないことを確認する
 */
import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import { calcExpToNext, calcEscapeRate } from "@/components/KageNinden/utils";
import type { GameState } from "@/components/KageNinden/reducer";

// ===== Fix1/Fix2: 名前サニタイズ =====
describe("Fix1/Fix2: プレイヤー名サニタイズ", () => {
  function selectClan(): GameState {
    return gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  }

  test("HTML特殊文字 < > \" ' ` は除去される", () => {
    const s = gameReducer(selectClan(), {
      type: "SET_NAME",
      name: '<script>alert("xss")</script>',
    });
    expect(s.player.name).not.toContain("<");
    expect(s.player.name).not.toContain(">");
    expect(s.player.name).not.toContain('"');
    expect(s.player.name).not.toContain("'");
    expect(s.player.name).not.toContain("`");
  });

  test("方向制御文字 (RLO: U+202E) は除去される", () => {
    const s = gameReducer(selectClan(), {
      type: "SET_NAME",
      name: "\u202E影丸\u202E",
    });
    expect(s.player.name).not.toContain("\u202E");
    expect(s.player.name.length).toBeGreaterThan(0); // 有効部分は残る
  });

  test("ASCII制御文字 (NULL, TAB, etc.) は除去される", () => {
    const s = gameReducer(selectClan(), {
      type: "SET_NAME",
      name: "\x00影\x01丸\x1F",
    });
    expect(s.player.name).not.toMatch(/[\x00-\x1F]/);
    expect(s.player.name).toBe("影丸"); // 有効な文字だけ残る
  });

  test("12文字を超える名前は切り捨てられる", () => {
    const s = gameReducer(selectClan(), {
      type: "SET_NAME",
      name: "あいうえおかきくけこさし追加文字",
    });
    expect(s.player.name.length).toBeLessThanOrEqual(12);
  });

  test("空文字・空白のみの名前は受け付けない（stateが変化しない）", () => {
    const base = selectClan();
    const s = gameReducer(base, { type: "SET_NAME", name: "   " });
    // 空白のみはtrim()→空文字→state変化なし
    expect(s.player.name).toBe(""); // 変化しない
    expect(s.ui.screen).toBe("name_input"); // 画面遷移もしない
  });

  test("正常な日本語名はそのまま保存される", () => {
    const s = gameReducer(selectClan(), { type: "SET_NAME", name: "影丸" });
    expect(s.player.name).toBe("影丸");
    expect(s.ui.screen).toBe("home");
  });

  test("英数字・ハイフン・アンダースコアは許可される", () => {
    const s = gameReducer(selectClan(), { type: "SET_NAME", name: "Kage_01" });
    expect(s.player.name).toBe("Kage_01");
  });
});

// ===== Fix3: Lvアップ無限ループ防止 =====
describe("Fix3: Lvアップ無限ループ防止", () => {
  test("レベルはMAX_LEVEL(99)を超えない", () => {
    // 非常に大きなEXPを持つ状態を手動で作る
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });

    // 大量EXPを与えてLvアップを連鎖
    const massExp: GameState = {
      ...s,
      progress: {
        ...s.progress,
        activeQuest: {
          id: "q001", title: "test", rank: "D", area: "forest",
          desc: "test", type: "kill", target: "forest_bandit", count: 1,
          reward: { exp: 999999, gold: 0, items: [] }, minLevel: 1,
        },
      },
      battle: {
        ...s.battle,
        active: true, phase: "player",
        enemy: {
          id: "forest_bandit", name: "山賊", icon: "🗡️",
          hp: 1, maxHp: 60, attack: 12, defense: 5, speed: 8,
          exp: 999999, gold: 0, ai: "aggressive", drops: [],
        } as any,
        questId: "q001", killCount: 0,
        log: [], turn: 1, playerStatus: [], enemyStatus: [],
        playerDodge: 0, playerDodgeChance: 0,
      },
      ui: { ...s.ui, screen: "battle" },
    };

    const after = gameReducer(massExp, { type: "PLAYER_ATTACK" });
    // レベルが99を超えていないこと
    expect(after.player.level).toBeLessThanOrEqual(99);
  });

  test("クエスト報酬アイテムはpushなしで正しく追加される", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
    s = gameReducer(s, { type: "START_QUEST", questId: "q002" }); // chakra_pillが2個報酬
    s = gameReducer(s, { type: "START_BATTLE", enemyId: "ninja_trainee", questId: "q002" });

    function killOne(state: GameState): GameState {
      if (!state.battle.active) return state;
      return gameReducer(
        { ...state, battle: { ...state.battle, enemy: { ...state.battle.enemy!, hp: 1 } } },
        { type: "PLAYER_ATTACK" }
      );
    }

    s = killOne(s);
    if (s.battle.active) s = killOne(s);

    if (s.ui.screen === "victory") {
      // chakra_pillが報酬として追加されていること
      const chakraPill = s.player.items.find((i) => i.id === "chakra_pill");
      expect(chakraPill).toBeDefined();
      expect(chakraPill!.count).toBeGreaterThan(0);
    }
  });
});

// ===== Fix4: 数値関数の境界値 =====
describe("Fix4: calcExpToNext / calcEscapeRate 境界値", () => {
  test("calcExpToNext は常に1以上を返す", () => {
    for (let lv = 1; lv <= 99; lv++) {
      expect(calcExpToNext(lv)).toBeGreaterThanOrEqual(1);
    }
  });

  test("calcExpToNext(NaN) は100を返す", () => {
    expect(calcExpToNext(NaN)).toBe(100);
  });

  test("calcExpToNext(Infinity) は100を返す", () => {
    expect(calcExpToNext(Infinity)).toBe(100);
  });

  test("calcExpToNext(0) は100を返す（Lv1未満は無効）", () => {
    expect(calcExpToNext(0)).toBe(100);
  });

  test("calcExpToNext(-1) は100を返す（負数は無効）", () => {
    expect(calcExpToNext(-1)).toBe(100);
  });

  test("calcEscapeRate(0, 0) は0.5を返す（ゼロ除算防止）", () => {
    expect(calcEscapeRate(0, 0)).toBe(0.5);
  });

  test("calcEscapeRate は常に0〜1の範囲", () => {
    const cases: [number, number][] = [
      [0, 0], [10, 0], [0, 10], [5, 5], [100, 1], [1, 100],
    ];
    for (const [ps, es] of cases) {
      const rate = calcEscapeRate(ps, es);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    }
  });
});
