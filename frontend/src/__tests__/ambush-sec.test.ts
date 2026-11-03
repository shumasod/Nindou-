import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
describe("奇襲 セキュリティテスト", () => {
  test("奇襲成功時に敵がstun状態になる", () => {
    const orig = Math.random;
    Math.random = () => 0; // always ambush
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "speed" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
    s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    Math.random = orig;
    expect(s.battle.enemyStatus.some((e) => e.id === "stun")).toBe(true);
  });
  test("奇襲成功時に奇襲ログが出る", () => {
    const orig = Math.random;
    Math.random = () => 0;
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "speed" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
    s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    Math.random = orig;
    expect(s.battle.log[0]).toContain("奇襲");
  });
  test("奇襲失敗時はstunなし", () => {
    const orig = Math.random;
    Math.random = () => 0.99; // never ambush
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
    s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    Math.random = orig;
    expect(s.battle.enemyStatus.some((e) => e.id === "stun")).toBe(false);
  });
  test("敵出現ログが記録される", () => {
    const orig = Math.random;
    Math.random = () => 0.99;
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
    s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    Math.random = orig;
    expect(s.battle.log[0]).toContain("現れた");
  });
  test("バトルがactiveになる", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
    s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    expect(s.battle.active).toBe(true);
  });
});
