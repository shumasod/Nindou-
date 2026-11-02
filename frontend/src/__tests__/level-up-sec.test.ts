import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import { calcExpToNext } from "@/components/KageNinden/utils";
import type { GameState } from "@/components/KageNinden/reducer";

describe("レベルアップ セキュリティテスト", () => {
  test("RESET_GAME でレベル・EXP が初期値に戻る", () => {
    const s: GameState = {
      ...INITIAL_STATE,
      player: { ...INITIAL_STATE.player, level: 10, exp: 5000, expToNext: 1000 },
    };
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.player.level).toBe(1);
    expect(after.player.exp).toBe(0);
    expect(after.player.expToNext).toBe(calcExpToNext(1));
  });

  test("calcExpToNext(level) は level > 0 で正の整数", () => {
    for (let lv = 1; lv <= 20; lv++) {
      const exp = calcExpToNext(lv);
      expect(exp).toBeGreaterThan(0);
      expect(Number.isInteger(exp)).toBe(true);
    }
  });

  test("EXP 要求量はレベルに比例して増加する", () => {
    const exp1 = calcExpToNext(1);
    const exp5 = calcExpToNext(5);
    const exp10 = calcExpToNext(10);
    expect(exp5).toBeGreaterThan(exp1);
    expect(exp10).toBeGreaterThan(exp5);
  });

  test("RESET_GAME で statPoints が 0 に戻る", () => {
    const s: GameState = {
      ...INITIAL_STATE,
      player: { ...INITIAL_STATE.player, statPoints: 10 },
    };
    const after = gameReducer(s, { type: "RESET_GAME" });
    expect(after.player.statPoints).toBe(0);
  });
});
