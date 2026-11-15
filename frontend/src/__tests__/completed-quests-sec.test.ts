import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";

describe("完了クエスト管理 セキュリティテスト", () => {
  test("RESET_GAME で completedQuests がクリアされる", () => {
    const after = gameReducer(INITIAL_STATE, { type: "RESET_GAME" });
    expect(after.progress.completedQuests).toEqual([]);
  });

  test("RESET_GAME で unlockedAreas が初期値に戻る", () => {
    const after = gameReducer(INITIAL_STATE, { type: "RESET_GAME" });
    expect(after.progress.unlockedAreas).toEqual(["forest"]);
  });

  test("RESET_GAME で activeQuest が null になる", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
    s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.progress.activeQuest).toBeNull();
  });

  test("存在しない questId で START_QUEST しても completedQuests は変わらない", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
    const before = s.progress.completedQuests.length;
    const after = gameReducer(s, { type: "START_QUEST", questId: "nonexistent_quest_xyz" });
    expect(after.progress.completedQuests.length).toBe(before);
  });

  test("クエスト開始で activeQuest がセットされる", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
    const after = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    expect(after.progress.activeQuest).not.toBeNull();
    expect(after.progress.activeQuest?.id).toBe("q001");
  });
});
