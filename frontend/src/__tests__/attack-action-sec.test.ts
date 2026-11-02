import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";
function setupBattle(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
  return s;
}
describe("PLAYER_ATTACK セキュリティテスト", () => {
  test("phase='enemy'の時はno-op", () => {
    const base = setupBattle();
    const ep: GameState = { ...base, battle: { ...base.battle, phase: "enemy" } };
    expect(gameReducer(ep, { type: "PLAYER_ATTACK" })).toEqual(ep);
  });
  test("enemyがnullの時はno-op", () => {
    const base = setupBattle();
    const ne: GameState = { ...base, battle: { ...base.battle, enemy: null } };
    expect(gameReducer(ne, { type: "PLAYER_ATTACK" })).toEqual(ne);
  });
  test("攻撃でenemyのHPが減る", () => {
    const base = setupBattle();
    const hpBefore = base.battle.enemy!.hp;
    const after = gameReducer(base, { type: "PLAYER_ATTACK" });
    expect(after.battle.enemy?.hp ?? 0).toBeLessThan(hpBefore);
  });
  test("敵HP<=0で撃破処理（battle.active=false）", () => {
    const base = setupBattle();
    const s: GameState = { ...base, battle: { ...base.battle, enemy: { ...base.battle.enemy!, hp: 1 } } };
    expect(gameReducer(s, { type: "PLAYER_ATTACK" }).battle.active).toBe(false);
  });
  test("攻撃後phaseがenemyになる（敵生存時）", () => {
    const base = setupBattle();
    const s: GameState = { ...base, battle: { ...base.battle, enemy: { ...base.battle.enemy!, hp: 9999 } } };
    expect(gameReducer(s, { type: "PLAYER_ATTACK" }).battle.phase).toBe("enemy");
  });
  test("player.statsは変化しない", () => {
    const base = setupBattle();
    expect(gameReducer(base, { type: "PLAYER_ATTACK" }).player.stats).toEqual(base.player.stats);
  });
});
