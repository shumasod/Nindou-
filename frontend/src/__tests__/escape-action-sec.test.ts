import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";
function setupBattle(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
  return s;
}
describe("PLAYER_ESCAPE セキュリティテスト", () => {
  test("phase='enemy'の時はno-op", () => {
    const base = setupBattle();
    const ep: GameState = { ...base, battle: { ...base.battle, phase: "enemy" } };
    expect(gameReducer(ep, { type: "PLAYER_ESCAPE" })).toEqual(ep);
  });
  test("enemyがnullの時はno-op", () => {
    const base = setupBattle();
    const ne: GameState = { ...base, battle: { ...base.battle, enemy: null } };
    expect(gameReducer(ne, { type: "PLAYER_ESCAPE" })).toEqual(ne);
  });
  test("逃走成功時screen='home'", () => {
    const base = setupBattle();
    const o = Math.random; Math.random = () => 0;
    const after = gameReducer(base, { type: "PLAYER_ESCAPE" });
    Math.random = o;
    expect(after.ui.screen).toBe("home");
    expect(after.battle.active).toBe(false);
  });
  test("逃走失敗時phase='enemy'", () => {
    const base = setupBattle();
    const o = Math.random; Math.random = () => 0.9999;
    const after = gameReducer(base, { type: "PLAYER_ESCAPE" });
    Math.random = o;
    expect(after.battle.phase).toBe("enemy");
  });
  test("speed=0でもクラッシュしない", () => {
    const base = setupBattle();
    const zs: GameState = { ...base, player: { ...base.player, stats: { ...base.player.stats, speed: 0 } } };
    expect(() => gameReducer(zs, { type: "PLAYER_ESCAPE" })).not.toThrow();
  });
  test("player.statsは変化しない", () => {
    const base = setupBattle();
    const after = gameReducer(base, { type: "PLAYER_ESCAPE" });
    expect(after.player.stats).toEqual(base.player.stats);
  });
});
