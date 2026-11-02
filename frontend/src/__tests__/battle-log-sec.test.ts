import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function battleState(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  return gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
}

describe("バトルログ セキュリティテスト", () => {
  test("START_BATTLE でバトルログが初期化される", () => {
    const s = battleState();
    expect(Array.isArray(s.battle.log)).toBe(true);
    expect(s.battle.log.length).toBeLessThanOrEqual(1);
  });

  test("PLAYER_ATTACK 後にログが追加される", () => {
    const s = battleState();
    const highHp: GameState = { ...s, battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 } } };
    const after = gameReducer(highHp, { type: "PLAYER_ATTACK" });
    expect(after.battle.log.length).toBeGreaterThan(0);
  });

  test("バトルログは最大10件", () => {
    let s = battleState();
    const highHp: GameState = { ...s, battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 } } };
    for (let i = 0; i < 15; i++) {
      s = gameReducer(highHp, { type: "PLAYER_ATTACK" });
    }
    expect(s.battle.log.length).toBeLessThanOrEqual(10);
  });

  test("RESET_GAME でバトルログがクリアされる", () => {
    const s = battleState();
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.battle.log).toEqual([]);
  });
});
