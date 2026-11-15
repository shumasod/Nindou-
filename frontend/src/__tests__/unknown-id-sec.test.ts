import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function readyState(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  return gameReducer(s, { type: "SET_NAME", name: "テスト" });
}

function battleState(): GameState {
  let s = readyState();
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  return gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
}

describe("不正ID の no-op セキュリティテスト", () => {
  test("存在しない questId で START_QUEST は no-op", () => {
    const s = readyState();
    const after = gameReducer(s, { type: "START_QUEST", questId: "nonexistent_quest_xyz" });
    expect(after.progress.activeQuest).toBeNull();
  });

  test("存在しない enemyId で START_BATTLE は no-op", () => {
    let s = readyState();
    s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    const after = gameReducer(s, { type: "START_BATTLE", enemyId: "nonexistent_enemy_xyz" });
    expect(after.battle.active).toBe(false);
  });

  test("存在しない itemId で PLAYER_ITEM は no-op", () => {
    const s = battleState();
    const hpBefore = s.player.hp;
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "nonexistent_item_xyz" });
    expect(after.player.hp).toBe(hpBefore);
    expect(after.battle.phase).toBe("player");
  });
});
