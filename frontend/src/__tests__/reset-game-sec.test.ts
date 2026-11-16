import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

describe("RESET_GAME セキュリティテスト", () => {
  test("RESET_GAME で clan が null にリセットされる", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.player.clan).toBeNull();
  });

  test("RESET_GAME でスキルがクリアされる", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.player.skills).toEqual([]);
  });

  test("RESET_GAME でバトル状態がリセットされる", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
    s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.battle.active).toBe(false);
    expect(after.battle.enemy).toBeNull();
  });

  test("RESET_GAME で進捗がクリアされる", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
    s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.progress.activeQuest).toBeNull();
    expect(after.progress.completedQuests).toEqual([]);
  });

  test("RESET_GAME で HP/チャクラが初期値に戻る", () => {
    const after = gameReducer(INITIAL_STATE, { type: "RESET_GAME" });
    expect(after.player.hp).toBe(INITIAL_STATE.player.hp);
    expect(after.player.chakra).toBe(INITIAL_STATE.player.chakra);
  });
});
