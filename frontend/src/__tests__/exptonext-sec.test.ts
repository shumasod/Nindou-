import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";
describe("expToNext セキュリティテスト", () => {
  test("lv1のexpToNextは100", () => {
    expect(INITIAL_STATE.player.expToNext).toBe(100);
  });
  test("レベルが上がるとexpToNextが増加する", () => {
    const s = gameReducer(INITIAL_STATE, { type: "LEVEL_UP" });
    expect(s.player.expToNext).toBeGreaterThan(INITIAL_STATE.player.expToNext);
  });
  test("expToNextは常に1以上", () => {
    expect(INITIAL_STATE.player.expToNext).toBeGreaterThanOrEqual(1);
  });
  test("無効な値は100にフォールバック", () => {
    const s: GameState = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, level: 0 } };
    expect(s.player.expToNext).toBeGreaterThanOrEqual(1);
  });
  test("NaN/Infはゲームを壊さない", () => {
    const s: GameState = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, exp: 0, expToNext: 100 } };
    expect(isFinite(s.player.expToNext)).toBe(true);
    expect(isNaN(s.player.expToNext)).toBe(false);
  });
  test("RESETで初期値に戻る", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "RESET" });
    expect(s.player.expToNext).toBe(100);
  });
  test("LEVEL_UP後にexpToNextが更新される", () => {
    const before = INITIAL_STATE.player.expToNext;
    const s = gameReducer(INITIAL_STATE, { type: "LEVEL_UP" });
    expect(s.player.expToNext).not.toBe(before);
  });
});
