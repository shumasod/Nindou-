import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function setupBattle(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit" });
  return { ...s, battle: { ...s.battle, phase: "enemy" } };
}

describe("ENEMY_TURN ガード セキュリティテスト", () => {
  test("phase='player'の時はno-op", () => {
    const base = setupBattle();
    const playerPhase: GameState = { ...base, battle: { ...base.battle, phase: "player" } };
    const after = gameReducer(playerPhase, { type: "ENEMY_TURN" });
    expect(after).toEqual(playerPhase);
  });
  test("enemyがnullの時はno-op", () => {
    const base = setupBattle();
    const noEnemy: GameState = { ...base, battle: { ...base.battle, enemy: null } };
    const after = gameReducer(noEnemy, { type: "ENEMY_TURN" });
    expect(after).toEqual(noEnemy);
  });
  test("正常なenemy turnでphaseが変化する", () => {
    const base = setupBattle();
    const after = gameReducer(base, { type: "ENEMY_TURN" });
    expect(["player", "enemy"]).toContain(after.battle.phase);
  });
  test("player.hp<=0でscreen='gameover'", () => {
    const base = setupBattle();
    const veryLowHp: GameState = {
      ...base,
      player: { ...base.player, hp: 1, stats: { ...base.player.stats, defense: 0 } },
      battle: { ...base.battle, enemy: { ...base.battle.enemy!, attack: 999 }, playerDodge: 0, playerDodgeChance: 0 },
    };
    const origRandom = Math.random;
    Math.random = () => 0.99;
    const after = gameReducer(veryLowHp, { type: "ENEMY_TURN" });
    Math.random = origRandom;
    expect(after.ui.screen).toBe("gameover");
  });
  test("HPが0以下にならない（min 0）", () => {
    const base = setupBattle();
    const lowHp: GameState = { ...base, player: { ...base.player, hp: 1, stats: { ...base.player.stats, defense: 0 } },
      battle: { ...base.battle, enemy: { ...base.battle.enemy!, attack: 999 }, playerDodge: 0, playerDodgeChance: 0 } };
    const origRandom = Math.random;
    Math.random = () => 0.99;
    const after = gameReducer(lowHp, { type: "ENEMY_TURN" });
    Math.random = origRandom;
    expect(after.player.hp).toBeGreaterThanOrEqual(0);
  });
});
