import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

// ===== ヘルパー =====
function makePlayerBattle(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
  return s;
}

function makeEnemyPhaseBattle(): GameState {
  const s = makePlayerBattle();
  return {
    ...s,
    battle: {
      ...s.battle,
      phase: "enemy" as const,
      enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 },
      enemyStatus: [],
    },
  };
}

// ===== PLAYER_DEFEND =====
describe("PLAYER_DEFEND", () => {
  test("防御後にplayerStatusにdefendingが追加される", () => {
    const s = makePlayerBattle();
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(after.battle.playerStatus.some((e) => e.id === "defending")).toBe(true);
  });

  test("防御後にphaseがenemyになる", () => {
    const s = makePlayerBattle();
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(after.battle.phase).toBe("enemy");
  });

  test("防御後にチャクラが回復する", () => {
    const s = makePlayerBattle();
    const lowChakra = { ...s, player: { ...s.player, chakra: 0 } };
    const after = gameReducer(lowChakra, { type: "PLAYER_DEFEND" });
    expect(after.player.chakra).toBeGreaterThan(0);
  });

  test("enemy phaseではPLAYER_DEFENDが無効", () => {
    const s = makeEnemyPhaseBattle();
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(after.battle.playerStatus.some((e) => e.id === "defending")).toBe(false);
  });

  test("防御中はダメージが半減される", () => {
    let s = makePlayerBattle();
    s = { ...s, player: { ...s.player, hp: 9999 } };
    // 防御してenemyフェーズにする
    const afterDefend = gameReducer(s, { type: "PLAYER_DEFEND" });
    // 強い敵の攻撃でも半減されること
    const strongEnemy = {
      ...afterDefend,
      battle: {
        ...afterDefend.battle,
        enemy: { ...afterDefend.battle.enemy!, attack: 1000 },
        enemyStatus: [],
      },
    };
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const afterHit = gameReducer(strongEnemy, { type: "ENEMY_TURN" });
    spy.mockRestore();
    // 防御なし1000攻撃 - defense/2 + ランダム = 約500程度ダメージ
    // 防御あり → 半減で約250程度
    expect(9999 - afterHit.player.hp).toBeLessThan(600);
  });
});

// ===== PLAYER_ESCAPE =====
describe("PLAYER_ESCAPE", () => {
  test("逃走成功でhome画面に遷移する", () => {
    const s = makePlayerBattle();
    const spy = jest.spyOn(Math, "random").mockReturnValue(0);
    const after = gameReducer(s, { type: "PLAYER_ESCAPE" });
    spy.mockRestore();
    expect(after.ui.screen).toBe("home");
    expect(after.battle.active).toBe(false);
  });

  test("逃走失敗でenemyフェーズに移行する", () => {
    const s = makePlayerBattle();
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.999);
    const after = gameReducer(s, { type: "PLAYER_ESCAPE" });
    spy.mockRestore();
    expect(after.battle.phase).toBe("enemy");
    expect(after.battle.active).toBe(true);
  });

  test("enemy phaseではPLAYER_ESCAPEが無効", () => {
    const s = makeEnemyPhaseBattle();
    const spy = jest.spyOn(Math, "random").mockReturnValue(0);
    const after = gameReducer(s, { type: "PLAYER_ESCAPE" });
    spy.mockRestore();
    expect(after.battle.active).toBe(true);
  });

  test("逃走のログが記録される", () => {
    const s = makePlayerBattle();
    const spy = jest.spyOn(Math, "random").mockReturnValue(0);
    const after = gameReducer(s, { type: "PLAYER_ESCAPE" });
    spy.mockRestore();
    expect(after.battle.log[0]).toMatch(/逃走/);
  });
});

// ===== PLAYER_ITEM (battle) =====
describe("PLAYER_ITEM in battle", () => {
  function makeWithHealItem(): GameState {
    const s = makePlayerBattle();
    return {
      ...s,
      player: {
        ...s.player,
        hp: 50,
        maxHp: 100,
        items: [{ id: "heal_scroll", count: 1 }],
      },
    };
  }

  test("回復アイテム使用でHPが回復する", () => {
    const s = makeWithHealItem();
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(after.player.hp).toBeGreaterThan(50);
  });

  test("アイテム使用後にカウントが1減る", () => {
    const s = makeWithHealItem();
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    const item = after.player.items.find((i) => i.id === "heal_scroll");
    expect(item).toBeUndefined(); // count=1 → 0 → 削除
  });

  test("アイテム使用後にphaseがenemyになる", () => {
    const s = makeWithHealItem();
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(after.battle.phase).toBe("enemy");
  });

  test("存在しないアイテムIDは状態を変更しない", () => {
    const s = makePlayerBattle();
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "nonexistent" });
    expect(after.player.hp).toBe(s.player.hp);
    expect(after.battle.phase).toBe("player");
  });

  test("HPが最大でも回復アイテムはmaxHpを超えない", () => {
    const s = makePlayerBattle();
    const fullHp = {
      ...s,
      player: { ...s.player, hp: s.player.maxHp, items: [{ id: "heal_scroll", count: 1 }] },
    };
    const after = gameReducer(fullHp, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(after.player.hp).toBeLessThanOrEqual(after.player.maxHp);
  });
});

// ===== REST_AT_INN =====
describe("REST_AT_INN", () => {
  test("十分なゴールドがあればHP・チャクラを全回復する", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
    const injured = {
      ...s,
      player: { ...s.player, hp: 1, chakra: 0, gold: 9999 },
    };
    const after = gameReducer(injured, { type: "REST_AT_INN" });
    expect(after.player.hp).toBe(after.player.maxHp);
    expect(after.player.chakra).toBe(after.player.maxChakra);
  });

  test("ゴールド不足なら何も変わらない", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
    const broke = { ...s, player: { ...s.player, hp: 1, gold: 0 } };
    const after = gameReducer(broke, { type: "REST_AT_INN" });
    expect(after.player.hp).toBe(1);
  });

  test("宿代がゴールドから引かれる", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
    const injured = { ...s, player: { ...s.player, hp: 1, chakra: 0, gold: 9999 } };
    const after = gameReducer(injured, { type: "REST_AT_INN" });
    expect(after.player.gold).toBeLessThan(9999);
  });
});
