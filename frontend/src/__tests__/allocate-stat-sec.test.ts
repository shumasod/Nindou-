import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";
function stateWithPoints(pts: number): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  return { ...s, player: { ...s.player, statPoints: pts } };
}
describe("ALLOCATE_STAT セキュリティテスト", () => {
  test("statPoints=0のときno-op", () => {
    const base = stateWithPoints(0);
    const s = gameReducer(base, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(s.player.stats.attack).toBe(base.player.stats.attack);
  });
  test("attack+1される", () => {
    const base = stateWithPoints(3);
    const atk = base.player.stats.attack;
    const s = gameReducer(base, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(s.player.stats.attack).toBe(atk + 1);
  });
  test("statPointsが1減る", () => {
    const base = stateWithPoints(3);
    const s = gameReducer(base, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(s.player.statPoints).toBe(2);
  });
  test("speed+1される", () => {
    const base = stateWithPoints(3);
    const spd = base.player.stats.speed;
    const s = gameReducer(base, { type: "ALLOCATE_STAT", stat: "speed" });
    expect(s.player.stats.speed).toBe(spd + 1);
  });
  test("statPointsが負にならない", () => {
    const base = stateWithPoints(1);
    const s = gameReducer(base, { type: "ALLOCATE_STAT", stat: "defense" });
    expect(s.player.statPoints).toBeGreaterThanOrEqual(0);
  });
});
