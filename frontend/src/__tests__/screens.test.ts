/**
 * 画面遷移テスト
 * ゲームフロー全体の画面遷移とプレイヤーキャラ作成フローを検証
 */
import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState, GameAction } from "@/components/KageNinden/reducer";

function apply(state: GameState, actions: GameAction[]): GameState {
  return actions.reduce((s, a) => gameReducer(s, a), state);
}

// ===== 初期画面 =====
describe("初期状態", () => {
  test("ゲーム開始時はtitle画面", () => {
    expect(INITIAL_STATE.ui.screen).toBe("title");
  });

  test("プレイヤー名は空文字", () => {
    expect(INITIAL_STATE.player.name).toBe("");
  });

  test("流派はnull", () => {
    expect(INITIAL_STATE.player.clan).toBeNull();
  });

  test("戦闘は非アクティブ", () => {
    expect(INITIAL_STATE.battle.active).toBe(false);
    expect(INITIAL_STATE.battle.enemy).toBeNull();
  });
});

// ===== キャラクター作成フロー =====
describe("キャラクター作成フロー", () => {
  test("title → clan_select", () => {
    const s = gameReducer(INITIAL_STATE, { type: "GO_TO_SCREEN", screen: "clan_select" });
    expect(s.ui.screen).toBe("clan_select");
  });

  test("clan_select → SELECT_CLAN → name_input", () => {
    const s = apply(INITIAL_STATE, [
      { type: "GO_TO_SCREEN", screen: "clan_select" },
      { type: "SELECT_CLAN", clan: "force" },
    ]);
    expect(s.ui.screen).toBe("name_input");
    expect(s.player.clan).toBe("force");
  });

  test("name_input → SET_NAME → home", () => {
    const s = apply(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "speed" },
      { type: "SET_NAME", name: "疾風" },
    ]);
    expect(s.ui.screen).toBe("home");
    expect(s.player.name).toBe("疾風");
  });

  test("全流派でキャラクター作成できる", () => {
    for (const clan of ["force", "illusion", "speed"] as const) {
      const s = apply(INITIAL_STATE, [
        { type: "SELECT_CLAN", clan },
        { type: "SET_NAME", name: `忍_${clan}` },
      ]);
      expect(s.ui.screen).toBe("home");
      expect(s.player.clan).toBe(clan);
    }
  });
});

// ===== ホーム ↔ マップ遷移 =====
describe("ホーム ↔ マップ遷移", () => {
  function atHome(): GameState {
    return apply(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "force" },
      { type: "SET_NAME", name: "影丸" },
    ]);
  }

  test("home → map", () => {
    const s = gameReducer(atHome(), { type: "GO_TO_SCREEN", screen: "map" });
    expect(s.ui.screen).toBe("map");
  });

  test("map → home", () => {
    const s = apply(atHome(), [
      { type: "GO_TO_SCREEN", screen: "map" },
      { type: "GO_TO_SCREEN", screen: "home" },
    ]);
    expect(s.ui.screen).toBe("home");
  });

  test("home → map → quest_detail", () => {
    const s = apply(atHome(), [
      { type: "GO_TO_SCREEN", screen: "map" },
      { type: "START_QUEST", questId: "q001" },
    ]);
    expect(s.ui.screen).toBe("quest_detail");
    expect(s.progress.activeQuest?.id).toBe("q001");
  });

  test("quest_detail → map（戻る）", () => {
    const s = apply(atHome(), [
      { type: "GO_TO_SCREEN", screen: "map" },
      { type: "START_QUEST", questId: "q001" },
      { type: "GO_TO_SCREEN", screen: "map" },
    ]);
    expect(s.ui.screen).toBe("map");
  });
});

// ===== 戦闘フロー =====
describe("戦闘フロー画面遷移", () => {
  function beforeBattle(): GameState {
    return apply(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "force" },
      { type: "SET_NAME", name: "影丸" },
      { type: "START_QUEST", questId: "q001" },
    ]);
  }

  test("quest_detail → START_BATTLE → battle", () => {
    const s = gameReducer(beforeBattle(), {
      type: "START_BATTLE",
      enemyId: "forest_bandit",
      questId: "q001",
    });
    expect(s.ui.screen).toBe("battle");
    expect(s.battle.active).toBe(true);
  });

  test("battle → 逃走成功 → home", () => {
    let s = gameReducer(beforeBattle(), {
      type: "START_BATTLE",
      enemyId: "forest_bandit",
      questId: "q001",
    });
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.0); // 逃走確率100%
    s = gameReducer(s, { type: "PLAYER_ESCAPE" });
    spy.mockRestore();
    expect(s.ui.screen).toBe("home");
  });

  test("battle → クエスト完了 → victory", () => {
    let s = gameReducer(beforeBattle(), {
      type: "START_BATTLE",
      enemyId: "forest_bandit",
      questId: "q001",
    });

    // 目標3体を一撃で倒す
    function killOne(state: GameState): GameState {
      return gameReducer(
        { ...state, battle: { ...state.battle, enemy: { ...state.battle.enemy!, hp: 1 } } },
        { type: "PLAYER_ATTACK" }
      );
    }

    s = killOne(s);
    if (s.battle.active) s = killOne(s);
    if (s.battle.active) s = killOne(s);

    expect(s.ui.screen).toBe("victory");
  });

  test("victory → home への帰還", () => {
    // victoryからhomeへ遷移
    let s = apply(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "force" },
      { type: "SET_NAME", name: "影丸" },
    ]);
    s = { ...s, ui: { ...s.ui, screen: "victory" } };
    const after = gameReducer(s, { type: "GO_TO_SCREEN", screen: "home" });
    expect(after.ui.screen).toBe("home");
  });

  test("gameover → RESET_GAME → title", () => {
    let s = apply(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "force" },
      { type: "SET_NAME", name: "影丸" },
    ]);
    s = { ...s, ui: { ...s.ui, screen: "gameover" } };
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.ui.screen).toBe("title");
    expect(after.player.name).toBe("");
  });
});

// ===== スキル/アイテム/鍛錬 画面遷移（GO_TO_SCREEN) =====
describe("その他画面遷移", () => {
  function atHome(): GameState {
    return apply(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "illusion" },
      { type: "SET_NAME", name: "幻丸" },
    ]);
  }

  test.each(["skills", "shop", "train"] as const)("home → %s 画面に遷移できる", (screen) => {
    const s = gameReducer(atHome(), { type: "GO_TO_SCREEN", screen });
    expect(s.ui.screen).toBe(screen);
  });

  test("どの画面からでも home に戻れる", () => {
    const screens = ["map", "skills", "shop", "quest_detail"] as const;
    for (const screen of screens) {
      const s = apply(atHome(), [
        { type: "GO_TO_SCREEN", screen },
        { type: "GO_TO_SCREEN", screen: "home" },
      ]);
      expect(s.ui.screen).toBe("home");
    }
  });
});

// ===== 不変条件テスト =====
describe("ゲーム不変条件", () => {
  function makeState(): GameState {
    return apply(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "force" },
      { type: "SET_NAME", name: "影丸" },
    ]);
  }

  test("HPは常に0以上maxHp以下", () => {
    const s = makeState();
    // アイテム使用後もHPは上限を超えない
    const damaged: GameState = { ...s, player: { ...s.player, hp: 30 } };
    const after = apply(damaged, [
      { type: "START_QUEST", questId: "q001" },
      { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
      { type: "PLAYER_ITEM", itemId: "heal_scroll" },
    ]);
    expect(after.player.hp).toBeGreaterThanOrEqual(0);
    expect(after.player.hp).toBeLessThanOrEqual(after.player.maxHp);
  });

  test("チャクラは常に0以上maxChakra以下", () => {
    const s = makeState();
    const after = apply(s, [
      { type: "START_QUEST", questId: "q001" },
      { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
      { type: "PLAYER_ITEM", itemId: "chakra_pill" },
    ]);
    expect(after.player.chakra).toBeGreaterThanOrEqual(0);
    expect(after.player.chakra).toBeLessThanOrEqual(after.player.maxChakra);
  });

  test("completedQuestsは重複を含まない（正常フロー）", () => {
    let s = apply(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "force" },
      { type: "SET_NAME", name: "影丸" },
      { type: "START_QUEST", questId: "q001" },
      { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" },
    ]);

    function killOne(state: GameState): GameState {
      if (!state.battle.active) return state;
      return gameReducer(
        { ...state, battle: { ...state.battle, enemy: { ...state.battle.enemy!, hp: 1 } } },
        { type: "PLAYER_ATTACK" }
      );
    }

    s = killOne(s);
    if (s.battle.active) s = killOne(s);
    if (s.battle.active) s = killOne(s);

    const ids = s.progress.completedQuests;
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test("RESET後はすべての状態が初期値", () => {
    const played = apply(INITIAL_STATE, [
      { type: "SELECT_CLAN", clan: "force" },
      { type: "SET_NAME", name: "影丸" },
      { type: "ALLOCATE_STAT", stat: "attack" }, // SPは0なので変化しないが操作
    ]);
    const reset = gameReducer(played, { type: "RESET_GAME" });

    expect(reset.player.name).toBe("");
    expect(reset.player.clan).toBeNull();
    expect(reset.player.level).toBe(1);
    expect(reset.player.exp).toBe(0);
    expect(reset.ui.screen).toBe("title");
    expect(reset.battle.active).toBe(false);
    expect(reset.progress.completedQuests).toHaveLength(0);
  });
});
