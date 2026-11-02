import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
describe("START_QUEST セキュリティテスト", () => {
  test("存在しないクエストはno-op", () => {
    const s = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "nonexistent_quest" });
    expect(s).toEqual(INITIAL_STATE);
  });
  test("quest_detailに遷移する", () => {
    const s = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    expect(s.ui.screen).toBe("quest_detail");
  });
  test("activeQuestがセットされる", () => {
    const s = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    expect(s.progress.activeQuest).not.toBeNull();
    expect(s.progress.activeQuest?.id).toBe("q001");
  });
  test("progressが0にリセットされる", () => {
    const s = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    expect(s.progress.activeQuest?.progress).toBe(0);
  });
  test("別クエストで上書きできる", () => {
    let s = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    s = gameReducer(s, { type: "START_QUEST", questId: "q002" });
    expect(s.progress.activeQuest?.id).toBe("q002");
  });
});
