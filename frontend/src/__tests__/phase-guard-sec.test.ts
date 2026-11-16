import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function enemyPhaseState(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
  return { ...s, battle: { ...s.battle, phase: "enemy" as const } };
}

describe("バトルフェーズガード セキュリティテスト", () => {
  test("enemy フェーズ中は PLAYER_ATTACK が no-op", () => {
    const s = enemyPhaseState();
    const enemyHpBefore = s.battle.enemy!.hp;
    const after = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(after.battle.enemy!.hp).toBe(enemyHpBefore);
    expect(after.battle.phase).toBe("enemy");
  });

  test("enemy フェーズ中は PLAYER_DEFEND が no-op", () => {
    const s = enemyPhaseState();
    const chakraBefore = s.player.chakra;
    const after = gameReducer(s, { type: "PLAYER_DEFEND" });
    expect(after.player.chakra).toBe(chakraBefore);
  });

  test("enemy フェーズ中は PLAYER_ESCAPE が no-op", () => {
    const s = enemyPhaseState();
    const after = gameReducer(s, { type: "PLAYER_ESCAPE" });
    expect(after.battle.phase).toBe("enemy");
    expect(after.battle.active).toBe(true);
  });

  test("enemy フェーズ中は PLAYER_ITEM が no-op", () => {
    const s = enemyPhaseState();
    const hpBefore = s.player.hp;
    const after = gameReducer(s, { type: "PLAYER_ITEM", itemId: "heal_scroll" });
    expect(after.player.hp).toBe(hpBefore);
    expect(after.battle.phase).toBe("enemy");
  });

  test("player フェーズ中は ENEMY_TURN が no-op", () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト" });
    s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
    const hpBefore = s.player.hp;
    const after = gameReducer(s, { type: "ENEMY_TURN" });
    expect(after.player.hp).toBe(hpBefore);
  });
});
