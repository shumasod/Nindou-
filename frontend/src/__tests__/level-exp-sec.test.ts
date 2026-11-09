import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import { calcExpToNext } from "@/components/KageNinden/utils";

describe("レベル・EXP セキュリティテスト", () => {
  test("calcExpToNext は正の値を返す", () => {
    expect(calcExpToNext(1)).toBeGreaterThan(0);
    expect(calcExpToNext(10)).toBeGreaterThan(0);
    expect(calcExpToNext(50)).toBeGreaterThan(0);
  });

  test("calcExpToNext はレベルが上がるほど増加する", () => {
    expect(calcExpToNext(2)).toBeGreaterThan(calcExpToNext(1));
    expect(calcExpToNext(10)).toBeGreaterThan(calcExpToNext(5));
  });

  test("RESET_GAME でレベルが 1 に戻る", () => {
    const s = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, level: 5 } };
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.player.level).toBe(1);
  });

  test("RESET_GAME で EXP が 0 に戻る", () => {
    const s = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, exp: 999, level: 5 } };
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.player.exp).toBe(0);
  });
});
