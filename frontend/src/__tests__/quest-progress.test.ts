import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function makeNamedPlayer(): GameState {
  let s = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
  return gameReducer(s, { type: "SET_NAME", name: "テスト" });
}

// q001: kill forest_bandit x3, reward exp:100 gold:80
// q002: kill ninja_trainee x2 (minLevel 3)

describe("START_QUEST", () => {
  it("sets activeQuest in progress", () => {
    const s = makeNamedPlayer();
    const next = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    expect(next.progress.activeQuest?.id).toBe("q001");
  });

  it("navigates to quest detail screen", () => {
    const s = makeNamedPlayer();
    const next = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    expect(next.ui.screen).toBe("quest_detail");
  });

  it("does not mark quest as completed when starting", () => {
    const s = makeNamedPlayer();
    const next = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    expect(next.progress.completedQuests).not.toContain("q001");
  });

  it("can switch active quest by calling START_QUEST again", () => {
    let s = makeNamedPlayer();
    s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    s = gameReducer(s, { type: "START_QUEST", questId: "q001" });
    expect(s.progress.activeQuest?.id).toBe("q001");
  });
});

describe("quest progress tracking via battle kills", () => {
  function makeQuestBattle(questId: string, enemyId: string): GameState {
    let s = makeNamedPlayer();
    s = gameReducer(s, { type: "START_QUEST", questId });
    return gameReducer(s, { type: "START_BATTLE", enemyId, questId });
  }

  it("questProgress starts at 0 before any kill", () => {
    const s = makeQuestBattle("q001", "forest_bandit");
    expect(s.progress.questProgress["q001"] ?? 0).toBe(0);
  });

  it("questProgress increments after killing quest enemy", () => {
    let s = makeQuestBattle("q001", "forest_bandit");
    s = { ...s, battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 1, maxHp: 9999 } } };
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    const progress = next.progress.questProgress["q001"] ?? 0;
    expect(progress).toBeGreaterThanOrEqual(1);
  });

  it("quest is not completed before reaching the kill count", () => {
    let s = makeQuestBattle("q001", "forest_bandit");
    s = { ...s, battle: { ...s.battle, enemy: { ...s.battle.enemy!, hp: 1, maxHp: 9999 } } };
    const next = gameReducer(s, { type: "PLAYER_ATTACK" });
    expect(next.progress.completedQuests).not.toContain("q001");
  });
});

describe("quest completion", () => {
  function driveQuestToCompletion(questId: string, enemyId: string, killCount: number): GameState {
    let s = makeNamedPlayer();
    s = gameReducer(s, { type: "START_QUEST", questId });
    s = gameReducer(s, { type: "START_BATTLE", enemyId, questId });

    for (let i = 0; i < killCount; i++) {
      s = { ...s, battle: { ...s.battle, phase: "player" as const, enemy: { ...s.battle.enemy!, hp: 1, maxHp: 9999 } } };
      s = gameReducer(s, { type: "PLAYER_ATTACK" });
    }
    return s;
  }

  it("quest added to completedQuests after all kills", () => {
    const s = driveQuestToCompletion("q001", "forest_bandit", 3);
    expect(s.progress.completedQuests).toContain("q001");
  });

  it("navigates to victory screen on completion", () => {
    const s = driveQuestToCompletion("q001", "forest_bandit", 3);
    expect(s.ui.screen).toBe("victory");
  });

  it("activeQuest is cleared on completion", () => {
    const s = driveQuestToCompletion("q001", "forest_bandit", 3);
    expect(s.progress.activeQuest).toBeNull();
  });

  it("reward EXP is added to player on completion", () => {
    const base = makeNamedPlayer();
    const s = driveQuestToCompletion("q001", "forest_bandit", 3);
    expect(s.player.exp).toBeGreaterThan(base.player.exp);
  });

  it("reward gold is added to player on completion", () => {
    const base = makeNamedPlayer();
    const s = driveQuestToCompletion("q001", "forest_bandit", 3);
    expect(s.player.gold).toBeGreaterThan(base.player.gold);
  });

  it("lastReward is set on victory screen", () => {
    const s = driveQuestToCompletion("q001", "forest_bandit", 3);
    expect(s.ui.lastReward).not.toBeNull();
    expect(s.ui.lastReward!.exp).toBe(100);
    expect(s.ui.lastReward!.gold).toBe(80);
  });
});
