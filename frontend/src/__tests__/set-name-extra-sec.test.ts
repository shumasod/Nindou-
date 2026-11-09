import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";

function clanState() {
  return gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
}

describe("プレイヤー名サニタイズ 追加セキュリティテスト", () => {
  test("名前は最大12文字に切り詰められる", () => {
    const s = gameReducer(clanState(), { type: "SET_NAME", name: "あいうえおかきくけこさし追加" });
    expect(s.player.name.length).toBeLessThanOrEqual(12);
  });

  test("空白だけの名前は拒否される", () => {
    const s = gameReducer(clanState(), { type: "SET_NAME", name: "   " });
    expect(s.player.name).toBe("");
    expect(s.ui.screen).not.toBe("home");
  });

  test("空文字列の名前は拒否される", () => {
    const s = gameReducer(clanState(), { type: "SET_NAME", name: "" });
    expect(s.player.name).toBe("");
  });

  test("NUL バイト (\x00) は除去される", () => {
    const s = gameReducer(clanState(), { type: "SET_NAME", name: "影\x00丸" });
    expect(s.player.name).not.toContain("\x00");
  });

  test("制御文字 (\n \t) は除去される", () => {
    const s = gameReducer(clanState(), { type: "SET_NAME", name: "影\n丸\t" });
    expect(s.player.name).not.toContain("\n");
    expect(s.player.name).not.toContain("\t");
  });
});
