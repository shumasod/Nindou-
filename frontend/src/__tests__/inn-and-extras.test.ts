import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState, GameAction } from "@/components/KageNinden/reducer";

function applyActions(state: GameState, actions: GameAction[]): GameState {
  return actions.reduce((s, a) => gameReducer(s, a), state);
}

function makePlayer(overrides: Partial<GameState["player"]> = {}): GameState {
  const base = applyActions(INITIAL_STATE, [
    { type: "SELECT_CLAN", clan: "force" },
    { type: "SET_NAME", name: "影丸" },
  ]);
  return { ...base, player: { ...base.player, ...overrides } };
}

// ===== PLAYER_ITEM (追加カバレッジ) =====
describe("PLAYER_ITEM additional", () => {
  function setupBattle(itemId: string, count = 2): GameState {
    const s = makePlayer({ items: [{ id: itemId, count }] });
    return applyActions(s, [{ type: "START_BATTLE", enemyId: "bandit" }]);
  }

  test("heal_scrollが消費されてHPが回復する", () => {
    const s: GameState = { ...setupBattle("heal_scroll"), player: { ...setupBattle("heal_scroll").player, hp: 10 } };
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(after.player.hp).toBeGreaterThan(10);
  });

  test("アイテム使用でitemのcountが1減る", () => {
    const s = setupBattle("heal_scroll", 3);
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    const item = after.player.items.find(it => it.id === "heal_scroll");
    expect(item?.count).toBe(2);
  });

  test("count=1のアイテム使用で配列から除去される", () => {
    const s = setupBattle("heal_scroll", 1);
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    const item = after.player.items.find(it => it.id === "heal_scroll");
    expect(item).toBeUndefined();
  });

  test("存在しないアイテムIDは無視される", () => {
    const s = setupBattle("heal_scroll");
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "not_an_item" });
    expect(after.player.items).toEqual(s.player.items);
  });
});

// ===== PLAYER_ESCAPE =====
describe("PLAYER_ESCAPE", () => {
  function setupBattle(overrides: Partial<GameState["player"]> = {}): GameState {
    const s = makePlayer(overrides);
    return applyActions(s, [
      { type: "START_BATTLE", enemyId: "bandit" },
    ]);
  }

  test("逃走試行でphaseがenemy or playerのまま変わる", () => {
    const s = setupBattle({ stats: { attack: 5, defense: 5, speed: 1, stealth: 1 } });
    const after = gameReducer(s, { type: "PLAYER_ESCAPE" });
    expect(["player", "enemy", "map"]).toContain(after.ui.screen === "map" ? "map" : after.battle.phase);
  });

  test("高い素早さで逃走成功しやすい（100回試行で少なくとも1回成功）", () => {
    let escaped = false;
    for (let i = 0; i < 100; i++) {
      const s = setupBattle({ stats: { attack: 5, defense: 5, speed: 999, stealth: 1 } });
      const after = gameReducer(s, { type: "PLAYER_ESCAPE" });
      if (after.ui.screen === "home") { escaped = true; break; }
    }
    expect(escaped).toBe(true);
  });
});

// ===== PLAYER_DEFEND =====
describe("PLAYER_DEFEND", () => {
  function setupBattle(): GameState {
    const s = makePlayer();
    return applyActions(s, [{ type: "START_BATTLE", enemyId: "bandit" }]);
  }

  test("防御でdefendingステータスが付与される", () => {
    const s = setupBattle();
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    const hasDefend = after.battle.playerStatus.some(e => e.id === "defending");
    expect(hasDefend).toBe(true);
  });

  test("防御後はenemy phaseになる", () => {
    const s = setupBattle();
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(after.battle.phase).toBe("enemy");
  });

  test("既に防御中に再度防御しても二重付与しない", () => {
    const s = setupBattle();
    const defended = gameReducer(s, { type: "PLAYER_DEFEND" });
    const enemyDone = gameReducer(defended, { type: "ENEMY_TURN" });
    const defended2 = gameReducer(enemyDone, { type: "PLAYER_DEFEND" });
    const defCount = defended2.battle.playerStatus.filter(e => e.id === "defending").length;
    expect(defCount).toBeLessThanOrEqual(1);
  });
});

// ===== GO_TO_SCREEN =====
describe("GO_TO_SCREEN transitions", () => {
  test.each([
    ["home" as const],
    ["map" as const],
    ["title" as const],
  ])("screen=%s へ遷移できる", (screen) => {
    const s = makePlayer();
    const after = gameReducer(s, { type: "GO_TO_SCREEN", screen });
    expect(after.ui.screen).toBe(screen);
  });

  test("画面遷移でlevelUpPendingがリセットされる", () => {
    const s: GameState = { ...makePlayer(), ui: { ...makePlayer().ui, levelUpPending: true } };
    const after = gameReducer(s, { type: "GO_TO_SCREEN", screen: "home" });
    expect(after.ui.levelUpPending).toBe(false);
  });
});

// ===== START_QUEST =====
describe("START_QUEST", () => {
  test("無効なクエストIDは無視される", () => {
    const s = makePlayer();
    const after = gameReducer(s, { type: "START_QUEST", questId: "nonexistent_quest_id" });
    expect(after.progress.activeQuest).toBeNull();
  });

  test("有効なクエストがactiveQuestに設定される", () => {
    const s = makePlayer();
    const after = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    expect(after.progress.activeQuest?.id).toBe("q001");
    expect(after.ui.screen).toBe("quest_detail");
  });
});
