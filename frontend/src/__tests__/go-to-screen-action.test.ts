import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function stateWithScreen(screen: GameState["ui"]["screen"], levelUpPending = false): GameState {
  return {
    ...INITIAL_STATE,
    ui: { ...INITIAL_STATE.ui, screen, levelUpPending },
  };
}

describe("GO_TO_SCREEN", () => {
  it("sets ui.screen to the requested screen", () => {
    const s = stateWithScreen("title");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "home" });
    expect(next.ui.screen).toBe("home");
  });

  it("can navigate to map screen", () => {
    const s = stateWithScreen("home");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "map" });
    expect(next.ui.screen).toBe("map");
  });

  it("can navigate to battle screen", () => {
    const s = stateWithScreen("home");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "battle" });
    expect(next.ui.screen).toBe("battle");
  });

  it("can navigate to victory screen", () => {
    const s = stateWithScreen("battle");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "victory" });
    expect(next.ui.screen).toBe("victory");
  });

  it("can navigate to title screen", () => {
    const s = stateWithScreen("home");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "title" });
    expect(next.ui.screen).toBe("title");
  });

  it("clears levelUpPending on navigation", () => {
    const s = stateWithScreen("battle", true);
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "home" });
    expect(next.ui.levelUpPending).toBe(false);
  });

  it("clears levelUpPending even when navigating to same screen", () => {
    const s = stateWithScreen("home", true);
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "home" });
    expect(next.ui.levelUpPending).toBe(false);
  });

  it("does not change player state", () => {
    const s = stateWithScreen("home");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "map" });
    expect(next.player).toEqual(s.player);
  });

  it("does not change battle state", () => {
    const s = stateWithScreen("home");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "map" });
    expect(next.battle).toEqual(s.battle);
  });

  it("does not change progress state", () => {
    const s = stateWithScreen("home");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "map" });
    expect(next.progress).toEqual(s.progress);
  });
});
