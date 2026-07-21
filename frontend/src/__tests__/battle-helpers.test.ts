import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import { MAX_LEVEL } from "@/components/KageNinden/reducer/helpers";
import type { GameState } from "@/components/KageNinden/reducer";

// ===== 定数テスト =====
describe("constants", () => {
  test("MAX_LEVEL is 99", () => {
    expect(MAX_LEVEL).toBe(99);
  });
});

// ===== ヘルパー: バトル状態セットアップ =====
function makeActiveBattle(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
  return s;
}

// handleEnemyTurn は phase === "enemy" の時のみ実行される
function makeEnemyPhaseBattle(): GameState {
  const s = makeActiveBattle();
  return {
    ...s,
    battle: { ...s.battle, phase: "enemy" as const },
  };
}

// ===== ENEMY_TURN / finalizeEnemyTurn =====
describe("ENEMY_TURN", () => {
  test("敵ターン後にturnが1増加する", () => {
    const battle = makeEnemyPhaseBattle();
    const before = battle.battle.turn;
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const after = gameReducer(battle, { type: "ENEMY_TURN" });
    spy.mockRestore();
    expect(after.battle.turn).toBe(before + 1);
  });

  test("敵ターン後にphaseがplayerに戻る", () => {
    const battle = makeEnemyPhaseBattle();
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const after = gameReducer(battle, { type: "ENEMY_TURN" });
    spy.mockRestore();
    expect(after.battle.phase).toBe("player");
  });

  test("敵ターン後にチャクラが3以上7以下回復する", () => {
    const battle = makeEnemyPhaseBattle();
    const lowChakra = { ...battle, player: { ...battle.player, chakra: 0 } };
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const after = gameReducer(lowChakra, { type: "ENEMY_TURN" });
    spy.mockRestore();
    expect(after.player.chakra).toBeGreaterThanOrEqual(3);
    expect(after.player.chakra).toBeLessThanOrEqual(7);
  });

  test("チャクラはmaxChakraを超えない", () => {
    const battle = makeEnemyPhaseBattle();
    const fullChakra = { ...battle, player: { ...battle.player, chakra: battle.player.maxChakra } };
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.99);
    const after = gameReducer(fullChakra, { type: "ENEMY_TURN" });
    spy.mockRestore();
    expect(after.player.chakra).toBeLessThanOrEqual(after.player.maxChakra);
  });

  test("スタン状態の敵は行動不能メッセージをログに残す", () => {
    const battle = makeEnemyPhaseBattle();
    const stunned = {
      ...battle,
      battle: { ...battle.battle, enemyStatus: [{ id: "stun", name: "スタン", turns: 2 }] },
    };
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const after = gameReducer(stunned, { type: "ENEMY_TURN" });
    spy.mockRestore();
    expect(after.battle.log[0]).toContain("行動不能");
  });

  test("状態異常のturnsが毎敵ターンで1減る", () => {
    const battle = makeEnemyPhaseBattle();
    const withStatus = {
      ...battle,
      battle: {
        ...battle.battle,
        playerStatus: [{ id: "poison", name: "毒", turns: 3 }],
        enemyStatus: [{ id: "stun", name: "スタン", turns: 2 }],
      },
    };
    // poison処理でdmgが発生するのでplayer HPを高く設定
    const highHp = { ...withStatus, player: { ...withStatus.player, hp: 9999 } };
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.99);
    const after = gameReducer(highHp, { type: "ENEMY_TURN" });
    spy.mockRestore();
    const playerPoison = after.battle.playerStatus.find((e) => e.id === "poison");
    const enemyStun    = after.battle.enemyStatus.find((e) => e.id === "stun");
    expect(playerPoison?.turns).toBe(2);
    expect(enemyStun?.turns).toBe(1);
  });

  test("turns=1の状態異常は敵ターン後に除去される", () => {
    const battle = makeEnemyPhaseBattle();
    const withStatus = {
      ...battle,
      battle: { ...battle.battle, playerStatus: [{ id: "defending", name: "防御中", turns: 1 }] },
    };
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const after = gameReducer(withStatus, { type: "ENEMY_TURN" });
    spy.mockRestore();
    expect(after.battle.playerStatus.find((e) => e.id === "defending")).toBeUndefined();
  });
});

// ===== PLAYER_DEFEND =====
describe("PLAYER_DEFEND", () => {
  test("防御後にphaseがenemyになる", () => {
    const battle = makeActiveBattle();
    const after = gameReducer(battle, { type: "PLAYER_DEFEND" });
    expect(after.battle.phase).toBe("enemy");
  });

  test("防御後にdefendingステータスが付与される", () => {
    const battle = makeActiveBattle();
    const after = gameReducer(battle, { type: "PLAYER_DEFEND" });
    expect(after.battle.playerStatus.some((e) => e.id === "defending")).toBe(true);
  });
});

// ===== PLAYER_ESCAPE =====
describe("PLAYER_ESCAPE", () => {
  test("逃走成功時にhomeへ遷移する", () => {
    const battle = makeActiveBattle();
    const fastPlayer = {
      ...battle,
      player: { ...battle.player, stats: { ...battle.player.stats, speed: 9999 } },
    };
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.0);
    const after = gameReducer(fastPlayer, { type: "PLAYER_ESCAPE" });
    spy.mockRestore();
    expect(after.ui.screen).toBe("home");
  });

  test("逃走失敗時にphaseがenemyになる", () => {
    const battle = makeActiveBattle();
    const slowPlayer = {
      ...battle,
      player: { ...battle.player, stats: { ...battle.player.stats, speed: 0 } },
    };
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.99);
    const after = gameReducer(slowPlayer, { type: "PLAYER_ESCAPE" });
    spy.mockRestore();
    expect(after.battle.phase).toBe("enemy");
  });
});
