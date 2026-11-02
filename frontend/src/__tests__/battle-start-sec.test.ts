import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function setupPlayer(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  return s;
}

describe("START_BATTLE セキュリティテスト", () => {
  test("存在しない敵IDはno-op（状態変化なし）", () => {
    const base = setupPlayer();
    const after = gameReducer(base, { type: "START_BATTLE", enemyId: "nonexistent_enemy" });
    expect(after).toEqual(base);
  });

  test("バトル開始でscreen='battle'になる", () => {
    const base = setupPlayer();
    const after = gameReducer(base, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(after.ui.screen).toBe("battle");
  });

  test("バトル開始でbattle.active=trueになる", () => {
    const base = setupPlayer();
    const after = gameReducer(base, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(after.battle.active).toBe(true);
  });

  test("enemy.maxHp は enemy.hp と等しい（初期値）", () => {
    const base = setupPlayer();
    const after = gameReducer(base, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(after.battle.enemy).not.toBeNull();
    expect(after.battle.enemy!.maxHp).toBe(after.battle.enemy!.hp);
  });

  test("killCountが0で初期化される", () => {
    const base = setupPlayer();
    const after = gameReducer(base, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(after.battle.killCount).toBe(0);
  });

  test("questIdを指定するとbattle.questIdに設定される", () => {
    const base = setupPlayer();
    const after = gameReducer(base, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
    expect(after.battle.questId).toBe("q001");
  });
});
