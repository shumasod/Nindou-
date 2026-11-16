import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

describe("statPoints 下限 セキュリティテスト", () => {
  test("statPoints=0 では ALLOCATE_STAT は no-op", () => {
    const s: GameState = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, statPoints: 0 } };
    const before = s.player.stats.attack;
    const after = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(after.player.stats.attack).toBe(before);
    expect(after.player.statPoints).toBe(0);
  });

  test("statPoints=1 では ALLOCATE_STAT で 0 になる（負にならない）", () => {
    const s: GameState = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, statPoints: 1 } };
    const after = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(after.player.statPoints).toBe(0);
  });

  test("ALLOCATE_STAT で statPoints は 1 ずつ減る", () => {
    const s: GameState = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, statPoints: 3 } };
    const after = gameReducer(s, { type: "ALLOCATE_STAT", stat: "defense" });
    expect(after.player.statPoints).toBe(2);
  });

  test("statPoints が負になることはない（連続振り分け）", () => {
    let s: GameState = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, statPoints: 2 } };
    s = gameReducer(s, { type: "ALLOCATE_STAT", stat: "speed" });
    s = gameReducer(s, { type: "ALLOCATE_STAT", stat: "speed" });
    s = gameReducer(s, { type: "ALLOCATE_STAT", stat: "speed" }); // should no-op
    expect(s.player.statPoints).toBe(0);
  });
});
