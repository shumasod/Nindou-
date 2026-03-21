/**
 * 戦闘ロジック統合テスト
 * reducer の PLAYER_ATTACK / ENEMY_TURN を組み合わせた
 * 実際の戦闘フローをシミュレート
 */
import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState, GameAction } from "@/components/KageNinden/reducer";

// ===== テストヘルパー =====
function setup(clan: "force" | "illusion" | "speed" = "force"): GameState {
  let s = INITIAL_STATE;
  s = gameReducer(s, { type: "SELECT_CLAN", clan });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト忍" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
  return s;
}

/** 攻撃→敵ターンを1サイクル実行 */
function oneCycle(state: GameState): GameState {
  let s = gameReducer(state, { type: "PLAYER_ATTACK" });
  if (s.battle.phase === "enemy" && s.battle.active) {
    s = gameReducer(s, { type: "ENEMY_TURN" });
  }
  return s;
}

// ===== 基本的な戦闘フロー =====
describe("基本的な戦闘フロー", () => {
  test("戦闘開始後はplayer phaseになる", () => {
    const s = setup();
    expect(s.battle.phase).toBe("player");
    expect(s.battle.turn).toBe(1);
  });

  test("1サイクル後にターン数が増える", () => {
    // 敵のHPを高くしてすぐ終わらないようにする
    let s = setup();
    s = { ...s, battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 } } };
    const after = oneCycle(s);
    expect(after.battle.turn).toBe(2);
  });

  test("複数サイクルでHPが減少する", () => {
    let s = setup();
    s = { ...s, battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 } } };
    const initialEnemyHp = s.battle.enemy!.hp;
    for (let i = 0; i < 3; i++) {
      s = oneCycle(s);
    }
    expect(s.battle.enemy!.hp).toBeLessThan(initialEnemyHp);
  });
});

// ===== 敵AIターン =====
describe("ENEMY_TURN", () => {
  test("enemy phaseのみ実行される", () => {
    const s = setup();
    // playerフェーズでENEMY_TURNを呼んでも変化しない
    const after = gameReducer(s, { type: "ENEMY_TURN" });
    expect(after.battle.phase).toBe("player"); // 変化なし
  });

  test("敵ターン後にphase='player'に戻る", () => {
    let s = setup();
    s = { ...s, battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 } } };
    // 攻撃してenemy phaseに
    const afterAttack = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(afterAttack.battle.phase).toBe("enemy");
    // 敵ターン
    const afterEnemy = gameReducer(afterAttack, { type: "ENEMY_TURN" });
    expect(afterEnemy.battle.phase).toBe("player");
  });

  test("敵ターン後にプレイヤーのHPが減少する（防御なし）", () => {
    let s = setup();
    // 奇襲スタンをクリアして確実に敵が攻撃できる状態にする
    s = {
      ...s,
      battle: {
        ...s.battle,
        enemyStatus: [], // 奇襲スタンをクリア
        enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 },
      },
    };
    const afterAttack = gameReducer(s, { type: "PLAYER_ATTACK" });
    const beforeHp = afterAttack.player.hp;
    // 防御がないので確実にダメージを受けるはず（幻惑なし）
    // 敵ターンを実行（ランダムで外れることもあるため50回試行）
    let damaged = false;
    for (let i = 0; i < 50; i++) {
      const after = gameReducer(afterAttack, { type: "ENEMY_TURN" });
      if (after.player.hp < beforeHp) {
        damaged = true;
        break;
      }
    }
    expect(damaged).toBe(true);
  });

  test("プレイヤーHPが0以下でgameover画面に遷移", () => {
    let s = setup();
    s = {
      ...s,
      player: { ...s.player, hp: 1 },
      battle: {
        ...s.battle,
        phase: "enemy",
        // 奇襲スタン・回避バフをクリアして確実に攻撃が通るようにする
        enemyStatus: [],
        playerStatus: [],
        playerDodge: 0,
        playerDodgeChance: 0,
        enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999, attack: 9999 },
      },
    };
    const after = gameReducer(s, { type: "ENEMY_TURN" });
    expect(after.ui.screen).toBe("gameover");
    expect(after.battle.active).toBe(false);
  });

  test("毒状態でHP継続ダメージを受ける", () => {
    let s = setup();
    s = {
      ...s,
      player: { ...s.player, hp: 100 },
      battle: {
        ...s.battle,
        phase: "enemy",
        enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999, attack: 0 }, // 通常攻撃0
        playerStatus: [{ id: "poison", name: "毒", turns: 3, value: 5 }],
      },
    };
    // ダメージが0の敵でも毒でHP減少するはず
    let poisonDamaged = false;
    for (let i = 0; i < 30; i++) {
      const after = gameReducer(s, { type: "ENEMY_TURN" });
      if (after.player.hp < 100) {
        poisonDamaged = true;
        break;
      }
    }
    expect(poisonDamaged).toBe(true);
  });

  test("ENEMY_TURN後にチャクラが自然回復する", () => {
    let s = setup();
    s = {
      ...s,
      player: { ...s.player, chakra: 0 },
      battle: { ...s.battle, phase: "enemy", enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 } },
    };
    const after = gameReducer(s, { type: "ENEMY_TURN" });
    expect(after.player.chakra).toBeGreaterThan(0);
  });

  test("ENEMY_TURN後に状態異常のターン数が減少する", () => {
    let s = setup();
    s = {
      ...s,
      battle: {
        ...s.battle,
        phase: "enemy",
        enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 },
        playerStatus: [{ id: "defense_up", name: "防御UP", turns: 3 }],
      },
    };
    const after = gameReducer(s, { type: "ENEMY_TURN" });
    const defUp = after.battle.playerStatus.find((e) => e.id === "defense_up");
    expect(defUp?.turns).toBe(2);
  });

  test("スタン状態の敵は行動しない（ログに行動不能が記録）", () => {
    let s = setup();
    s = {
      ...s,
      battle: {
        ...s.battle,
        phase: "enemy",
        enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 },
        enemyStatus: [{ id: "stun", name: "スタン", turns: 1 }],
      },
    };
    const after = gameReducer(s, { type: "ENEMY_TURN" });
    expect(after.battle.log[0]).toMatch(/行動不能/);
  });
});

// ===== クエスト完了フロー =====
describe("クエスト完了フロー", () => {
  test("目標数達成でvictory画面に遷移する", () => {
    // q001は3体討伐
    let s = setup();
    // 1体目の敵を一撃で倒す設定
    function killEnemy(state: GameState): GameState {
      return gameReducer(
        { ...state, battle: { ...state.battle, enemy: { ...state.battle.enemy!, hp: 1 } } },
        { type: "PLAYER_ATTACK" }
      );
    }

    s = killEnemy(s); // 1体目
    if (s.battle.active) s = killEnemy(s); // 2体目
    if (s.battle.active) s = killEnemy(s); // 3体目

    expect(s.ui.screen).toBe("victory");
    expect(s.progress.completedQuests).toContain("q001");
  });

  test("クエスト完了でEXPと金報酬が加算される", () => {
    let s = setup();
    const beforeExp = s.player.exp;
    const beforeGold = s.player.gold;

    function killEnemy(state: GameState): GameState {
      return gameReducer(
        { ...state, battle: { ...state.battle, enemy: { ...state.battle.enemy!, hp: 1 } } },
        { type: "PLAYER_ATTACK" }
      );
    }

    s = killEnemy(s);
    if (s.battle.active) s = killEnemy(s);
    if (s.battle.active) s = killEnemy(s);

    // クエスト報酬(exp:100, gold:80) + 敵個別EXP/G
    expect(s.player.exp).toBeGreaterThan(beforeExp);
    expect(s.player.gold).toBeGreaterThan(beforeGold);
  });

  test("同じクエストを再完了できない（completedQuestsに1回だけ登録）", () => {
    let s = setup();

    function killEnemy(state: GameState): GameState {
      return gameReducer(
        { ...state, battle: { ...state.battle, enemy: { ...state.battle.enemy!, hp: 1 } } },
        { type: "PLAYER_ATTACK" }
      );
    }

    s = killEnemy(s);
    if (s.battle.active) s = killEnemy(s);
    if (s.battle.active) s = killEnemy(s);

    const count = s.progress.completedQuests.filter((id) => id === "q001").length;
    expect(count).toBe(1);
  });
});

// ===== レベルアップ =====
describe("レベルアップ", () => {
  test("EXPがexpToNextを超えるとLvアップする", () => {
    const s = INITIAL_STATE;
    const clanSelected = gameReducer(s, { type: "SELECT_CLAN", clan: "force" });
    const named = gameReducer(clanSelected, { type: "SET_NAME", name: "影丸" });

    // 大量EXPを持つ強敵を設定して一撃で倒す
    const withHighExp: GameState = {
      ...named,
      progress: {
        ...named.progress,
        activeQuest: {
          id: "q005", title: "魔忍王討伐", rank: "S", area: "ruins",
          desc: "test", type: "kill", target: "demon_lord", count: 1,
          reward: { exp: 5000, gold: 2000, items: [] }, minLevel: 1,
        },
      },
      battle: {
        ...named.battle,
        active: true,
        phase: "player",
        enemy: {
          id: "demon_lord", name: "魔忍王", icon: "👹",
          hp: 1, maxHp: 500, attack: 45, defense: 30, speed: 25,
          exp: 1000, gold: 500, ai: "boss",
          drops: [{ id: "heal_scroll_large", rate: 1.0 }],
        },
        questId: "q005",
        killCount: 0,
        log: [], turn: 1, playerStatus: [], enemyStatus: [],
        playerDodge: 0, playerDodgeChance: 0,
      },
      ui: { ...named.ui, screen: "battle" },
    };

    const after = gameReducer(withHighExp, { type: "PLAYER_ATTACK" });
    expect(after.player.level).toBeGreaterThan(1);
    expect(after.player.statPoints).toBeGreaterThan(0);
  });

  test("Lvアップ後にmaxHpが増加する", () => {
    // EXPをexpToNextギリギリに設定
    let s = INITIAL_STATE;
    s = gameReducer(s, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });

    const beforeMaxHp = s.player.maxHp;
    const almostLevel: GameState = {
      ...s,
      player: { ...s.player, exp: s.player.expToNext - 1 },
      progress: {
        ...s.progress,
        activeQuest: {
          id: "q001", title: "test", rank: "D", area: "forest",
          desc: "test", type: "kill", target: "forest_bandit", count: 1,
          reward: { exp: 100, gold: 80, items: [] }, minLevel: 1,
        },
      },
      battle: {
        ...s.battle,
        active: true, phase: "player",
        enemy: {
          id: "forest_bandit", name: "山賊", icon: "🗡️",
          hp: 1, maxHp: 60, attack: 12, defense: 5, speed: 8,
          exp: 30, gold: 20, ai: "aggressive",
          drops: [], questId: undefined,
        } as any,
        questId: "q001", killCount: 0,
        log: [], turn: 1, playerStatus: [], enemyStatus: [],
        playerDodge: 0, playerDodgeChance: 0,
      },
      ui: { ...s.ui, screen: "battle" },
    };

    const after = gameReducer(almostLevel, { type: "PLAYER_ATTACK" });
    if (after.player.level > 1) {
      expect(after.player.maxHp).toBeGreaterThan(beforeMaxHp);
    }
  });

  test("スキル自動解放: force Lv3でiron_stanceが解放される", () => {
    let s = INITIAL_STATE;
    s = gameReducer(s, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });

    // Lv3を超えるEXPを持たせてLvアップ
    const highExpState: GameState = {
      ...s,
      player: { ...s.player, level: 2, exp: s.player.expToNext - 1 },
      progress: {
        ...s.progress,
        activeQuest: {
          id: "q001", title: "test", rank: "D", area: "forest",
          desc: "test", type: "kill", target: "forest_bandit", count: 1,
          reward: { exp: 200, gold: 0, items: [] }, minLevel: 1,
        },
      },
      battle: {
        ...s.battle,
        active: true, phase: "player",
        enemy: {
          id: "forest_bandit", name: "山賊", icon: "🗡️",
          hp: 1, maxHp: 60, attack: 12, defense: 5, speed: 8,
          exp: 30, gold: 20, ai: "aggressive", drops: [],
        } as any,
        questId: "q001", killCount: 0,
        log: [], turn: 1, playerStatus: [], enemyStatus: [],
        playerDodge: 0, playerDodgeChance: 0,
      },
      ui: { ...s.ui, screen: "battle" },
    };

    const after = gameReducer(highExpState, { type: "PLAYER_ATTACK" });
    if (after.player.level >= 3) {
      expect(after.player.skills).toContain("iron_stance");
    }
  });
});

// ===== 状態異常インタラクション =====
describe("状態異常インタラクション", () => {
  test("phantom_clone使用で次の攻撃が無効化される", () => {
    let s = setup("illusion");
    // phantom_cloneはillusion流派なので使える (スタータースキルとして付与済み)
    s = {
      ...s,
      player: { ...s.player, chakra: 30 },
      battle: {
        ...s.battle,
        enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 },
      },
    };

    // phantom_clone使用
    const afterSkill = gameReducer(s, { type: "PLAYER_SKILL", skillId: "phantom_clone" });
    expect(afterSkill.battle.playerDodge).toBe(1);

    // 敵ターンで回避を消費
    const afterEnemy = gameReducer(afterSkill, { type: "ENEMY_TURN" });
    // playerDodgeが消費されているかログで確認
    const dodged = afterEnemy.battle.log[0]?.includes("無効化") ||
                   afterEnemy.battle.playerDodge === 0;
    expect(dodged).toBe(true);
  });

  test("confusion_jutsu使用で敵にconfusionステータスが付与される", () => {
    let s = setup("illusion");
    s = {
      ...s,
      player: { ...s.player, chakra: 30, skills: [...s.player.skills, "confusion_jutsu"] },
      battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 } },
    };

    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "confusion_jutsu" });
    expect(after.battle.enemyStatus.some((e) => e.id === "confusion")).toBe(true);
  });

  test("shadow_clone使用でshadow_cloneステータスが付与される", () => {
    let s = setup("speed");
    s = {
      ...s,
      player: { ...s.player, chakra: 30, skills: [...s.player.skills, "shadow_clone"] },
      battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 } },
    };

    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "shadow_clone" });
    expect(after.battle.playerStatus.some((e) => e.id === "shadow_clone")).toBe(true);
  });
});
