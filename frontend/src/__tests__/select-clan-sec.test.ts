import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
describe("SELECT_CLAN セキュリティテスト", () => {
  test("clanがセットされる", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(s.player.clan).toBe("force");
  });
  test("clanボーナスが適用される（force: maxHp+30）", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(s.player.maxHp).toBe(INITIAL_STATE.player.maxHp + 30);
  });
  test("screenがname_inputに遷移する", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(s.ui.screen).toBe("name_input");
  });
  test("スターターのスキルが付与される", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(s.player.skills).toContain("spin_slash");
  });
  test("illusionクランでmaxChakra+20", () => {
    const s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "illusion" });
    expect(s.player.maxChakra).toBe(INITIAL_STATE.player.maxChakra + 20);
  });
  test("二重選択でもボーナスが二重にならない（clan guard）", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    const maxHp1 = s.player.maxHp;
    s = gameReducer(s, { type: "SELECT_CLAN", clan: "force" });
    expect(s.player.maxHp).toBe(maxHp1);
  });
});
