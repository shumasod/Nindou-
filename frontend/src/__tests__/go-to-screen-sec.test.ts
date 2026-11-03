import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
describe("GO_TO_SCREEN セキュリティテスト", () => {
  test("homeに遷移できる", () => {
    const s = gameReducer(INITIAL_STATE, { type: "GO_TO_SCREEN", screen: "home" });
    expect(s.ui.screen).toBe("home");
  });
  test("titleに遷移できる", () => {
    const s = gameReducer(INITIAL_STATE, { type: "GO_TO_SCREEN", screen: "title" });
    expect(s.ui.screen).toBe("title");
  });
  test("levelUpPendingがリセットされる", () => {
    const base = { ...INITIAL_STATE, ui: { ...INITIAL_STATE.ui, levelUpPending: true } };
    const s = gameReducer(base, { type: "GO_TO_SCREEN", screen: "home" });
    expect(s.ui.levelUpPending).toBe(false);
  });
  test("playerは変わらない", () => {
    const s = gameReducer(INITIAL_STATE, { type: "GO_TO_SCREEN", screen: "quest_list" });
    expect(s.player).toEqual(INITIAL_STATE.player);
  });
  test("メッセージは変わらない", () => {
    const base = { ...INITIAL_STATE, ui: { ...INITIAL_STATE.ui, message: "test" } };
    const s = gameReducer(base, { type: "GO_TO_SCREEN", screen: "home" });
    expect(s.ui.message).toBe("test");
  });
  test("quest_detailに遷移できる", () => {
    const s = gameReducer(INITIAL_STATE, { type: "GO_TO_SCREEN", screen: "quest_detail" });
    expect(s.ui.screen).toBe("quest_detail");
  });
});
