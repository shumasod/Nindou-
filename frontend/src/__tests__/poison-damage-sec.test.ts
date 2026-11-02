import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";
function setupBattleWithPoison(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
  return { ...s, battle: { ...s.battle, phase: "enemy", playerStatus: [{ id: "poison", name: "毒", turns: 3, value: 5 }] } };
}
describe("毒ダメージ セキュリティテスト", () => {
  test("毒状態でENEMY_TURNにHPが減る", () => {
    const base = setupBattleWithPoison();
    const hpBefore = base.player.hp;
    const after = gameReducer(base, { type: "ENEMY_TURN" });
    expect(after.player.hp).toBeLessThan(hpBefore);
  });
  test("HPが0になるとgameover", () => {
    const base = setupBattleWithPoison();
    const s: GameState = { ...base, player: { ...base.player, hp: 1, stats: { ...base.player.stats, defense: 0 } },
      battle: { ...base.battle, enemy: { ...base.battle.enemy!, attack: 999 }, playerDodge: 0, playerDodgeChance: 0 } };
    const o = Math.random; Math.random = () => 0.99;
    const after = gameReducer(s, { type: "ENEMY_TURN" });
    Math.random = o;
    expect(after.ui.screen).toBe("gameover");
  });
  test("HPがマイナスにならない", () => {
    const base = setupBattleWithPoison();
    const s: GameState = { ...base, player: { ...base.player, hp: 1 } };
    expect(gameReducer(s, { type: "ENEMY_TURN" }).player.hp).toBeGreaterThanOrEqual(0);
  });
  test("毒なしの場合は毒ダメージログが出ない", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
    s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
    const np: GameState = { ...s, battle: { ...s.battle, phase: "enemy", playerStatus: [] } };
    expect(gameReducer(np, { type: "ENEMY_TURN" }).battle.log.some((l) => l.includes("毒のダメージ"))).toBe(false);
  });
  test("毒ダメージログが記録される", () => {
    const base = setupBattleWithPoison();
    expect(gameReducer(base, { type: "ENEMY_TURN" }).battle.log.some((l) => l.includes("毒のダメージ"))).toBe(true);
  });
});
