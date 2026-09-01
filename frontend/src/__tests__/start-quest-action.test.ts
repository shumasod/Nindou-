import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import { QUESTS } from "../components/KageNinden/data";

const q001 = QUESTS.find((q) => q.id === "q001")!;
const q005 = QUESTS.find((q) => q.id === "q005")!;

describe("START_QUEST", () => {
  it("sets activeQuest to the requested quest", () => {
    const next = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    expect(next.progress.activeQuest).not.toBeNull();
    expect(next.progress.activeQuest?.id).toBe("q001");
  });

  it("activeQuest contains the quest title", () => {
    const next = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    expect(next.progress.activeQuest?.title).toBe(q001.title);
  });

  it("activeQuest contains the quest reward", () => {
    const next = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    expect(next.progress.activeQuest?.reward).toEqual(q001.reward);
  });

  it("navigates to quest_detail screen", () => {
    const next = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    expect(next.ui.screen).toBe("quest_detail");
  });

  it("works for other quests (q005)", () => {
    const next = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q005" });
    expect(next.progress.activeQuest?.id).toBe("q005");
    expect(next.progress.activeQuest?.title).toBe(q005.title);
  });

  it("is a no-op for an invalid questId (returns same reference)", () => {
    const next = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "invalid_quest_id" });
    expect(next).toBe(INITIAL_STATE);
  });

  it("does not change completedQuests", () => {
    const next = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    expect(next.progress.completedQuests).toEqual(INITIAL_STATE.progress.completedQuests);
  });

  it("does not change player state", () => {
    const next = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    expect(next.player).toEqual(INITIAL_STATE.player);
  });

  it("does not change battle state", () => {
    const next = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    expect(next.battle).toEqual(INITIAL_STATE.battle);
  });

  it("can overwrite the current activeQuest by starting a new one", () => {
    let s = gameReducer(INITIAL_STATE, { type: "START_QUEST", questId: "q001" });
    s = gameReducer(s, { type: "START_QUEST", questId: "q005" });
    expect(s.progress.activeQuest?.id).toBe("q005");
  });
});
