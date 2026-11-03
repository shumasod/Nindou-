import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";

describe("装備・初期状態 セキュリティテスト", () => {
  test("RESET_GAME で装備が初期値に戻る", () => {
    const after = gameReducer(INITIAL_STATE, { type: "RESET_GAME" });
    expect(after.player.equip.weapon).toBe(INITIAL_STATE.player.equip.weapon);
    expect(after.player.equip.armor).toBe(INITIAL_STATE.player.equip.armor);
  });

  test("RESET_GAME でアイテムが初期値に戻る", () => {
    const after = gameReducer(INITIAL_STATE, { type: "RESET_GAME" });
    expect(after.player.items).toEqual(INITIAL_STATE.player.items);
  });

  test("RESET_GAME でゴールドが初期値に戻る", () => {
    const s = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, gold: 9999 } };
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.player.gold).toBe(INITIAL_STATE.player.gold);
  });

  test("RESET_GAME で名前がクリアされる", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.player.name).toBe("");
  });
});
