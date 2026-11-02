import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function battleState(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  return gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
}

describe("キルカウント セキュリティテスト", () => {
  test("START_BATTLE でキルカウントが 0 で初期化される", () => {
    const s = battleState();
    expect(s.battle.killCount).toBe(0);
  });

  test("RESET_GAME でバトル状態が初期化される", () => {
    const s = battleState();
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.battle.killCount).toBe(0);
    expect(after.battle.active).toBe(false);
  });

  test("バトル中は killCount が非負", () => {
    const s = battleState();
    expect(s.battle.killCount).toBeGreaterThanOrEqual(0);
  });

  test("turn は常に正の整数", () => {
    const s = battleState();
    expect(s.battle.turn).toBeGreaterThan(0);
    expect(Number.isInteger(s.battle.turn)).toBe(true);
  });
});
