import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";
import type { GameState } from "@/components/KageNinden/reducer";

function setupBattle(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  s = gameReducer(s, { type: "SET_NAME", name: "影丸" });
  s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
  s = gameReducer(s, { type: "START_BATTLE", enemyId: "forest_bandit", questId: "q001" });
  return { ...s, battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 1000, maxHp: 1000 } } };
}

describe("スキル所持チェック セキュリティテスト", () => {
  test("未習得スキルIDの使用は no-op（state変化なし）", () => {
    const s = setupBattle();
    const before = s.player.chakra;
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "iron_stance" });
    expect(after.player.chakra).toBe(before);
    expect(after.battle.phase).toBe("player");
  });

  test("所持スキルは使用できる", () => {
    const s = setupBattle();
    expect(s.player.skills).toContain("spin_slash");
    const before = s.player.chakra;
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(after.player.chakra).toBe(before - 15);
  });

  test("別流派のスキル（未所持）は使用できない", () => {
    const s = setupBattle();
    const before = s.player.chakra;
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "phantom_clone" });
    expect(after.player.chakra).toBe(before);
  });

  test("player.skillsが空の場合は全スキル使用不可", () => {
    const s = setupBattle();
    const noSkills: GameState = { ...s, player: { ...s.player, skills: [] } };
    const after = gameReducer(noSkills, { type: "PLAYER_SKILL", skillId: "spin_slash" });
    expect(after.player.chakra).toBe(noSkills.player.chakra);
    expect(after.battle.phase).toBe("player");
  });

  test("未習得スキル使用時は敵フェーズに遷移しない", () => {
    const s = setupBattle();
    const after = gameReducer(s, { type: "PLAYER_SKILL", skillId: "thousand_thrust" });
    expect(after.battle.phase).toBe("player");
  });
});
