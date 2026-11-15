import { gameReducer, INITIAL_STATE } from "@/components/KageNinden/reducer";

describe("スキル所有権 セキュリティテスト", () => {
  const baseState = () => {
    let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    s = gameReducer(s, { type: "SET_NAME", name: "テスト忍者" });
    return gameReducer(s, { type: "START_BATTLE", enemyId: "bandit" });
  };

  test("未習得スキルは使用できない", () => {
    const s = baseState();
    const skilllessState = {
      ...s,
      player: { ...s.player, skills: [] },
    };
    const after = gameReducer(skilllessState, {
      type: "PLAYER_SKILL",
      skillId: "spin_slash",
    });
    expect(after.battle.phase).toBe("player");
  });

  test("習得済みスキルは使用できる", () => {
    const s = baseState();
    const highHpState = {
      ...s,
      battle: {
        ...s.battle,
        enemy: { ...s.battle.enemy!, hp: 9999, maxHp: 9999 },
      },
    };
    const after = gameReducer(highHpState, {
      type: "PLAYER_SKILL",
      skillId: "spin_slash",
    });
    expect(after.battle.phase).toBe("enemy");
  });

  test("存在しないスキルIDは使用できない", () => {
    const s = baseState();
    const after = gameReducer(s, {
      type: "PLAYER_SKILL",
      skillId: "nonexistent_skill_9999",
    });
    expect(after.battle.phase).toBe("player");
  });

  test("チャクラ不足時はスキルを使用できない", () => {
    const s = baseState();
    const noChakraState = {
      ...s,
      player: { ...s.player, chakra: 0 },
    };
    const after = gameReducer(noChakraState, {
      type: "PLAYER_SKILL",
      skillId: "spin_slash",
    });
    expect(after.battle.phase).toBe("player");
  });
});
