import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function stateWithScreen(screen: GameState["ui"]["screen"]): GameState {
  return {
    ...INITIAL_STATE,
    ui: { ...INITIAL_STATE.ui, screen },
  };
}

describe("GO_TO_SCREEN", () => {
  it("navigates to home", () => {
    const s = stateWithScreen("battle");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "home" });
    expect(next.ui.screen).toBe("home");
  });

  it("navigates to map", () => {
    const s = stateWithScreen("home");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "map" });
    expect(next.ui.screen).toBe("map");
  });

  it("navigates to battle", () => {
    const s = stateWithScreen("home");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "battle" });
    expect(next.ui.screen).toBe("battle");
  });

  it("navigates to victory", () => {
    const s = stateWithScreen("battle");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "victory" });
    expect(next.ui.screen).toBe("victory");
  });

  it("navigates to gameover", () => {
    const s = stateWithScreen("battle");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "gameover" });
    expect(next.ui.screen).toBe("gameover");
  });

  it("navigates to title", () => {
    const s = stateWithScreen("home");
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "title" });
    expect(next.ui.screen).toBe("title");
  });

  it("clears levelUpPending on navigation", () => {
    const s = { ...stateWithScreen("battle"), ui: { ...INITIAL_STATE.ui, screen: "battle" as const, levelUpPending: true } };
    const next = gameReducer(s, { type: "GO_TO_SCREEN", screen: "home" });
    expect(next.ui.levelUpPending).toBe(false);
  });

  it("preserves player state on navigation", () => {
    const s = stateWithScreen("home");
    const modifiedS = { ...s, player: { ...s.player, gold: 9999 } };
    const next = gameReducer(modifiedS, { type: "GO_TO_SCREEN", screen: "map" });
    expect(next.player.gold).toBe(9999);
  });

  it("preserves battle state on navigation", () => {
    const s = stateWithScreen("home");
    const modifiedS = { ...s, battle: { ...s.battle, killCount: 5 } };
    const next = gameReducer(modifiedS, { type: "GO_TO_SCREEN", screen: "map" });
    expect(next.battle.killCount).toBe(5);
  });

  it("preserves progress state on navigation", () => {
    const s = stateWithScreen("home");
    const modifiedS = {
      ...s,
      progress: { ...s.progress, completedQuests: ["q001", "q002"] },
    };
    const next = gameReducer(modifiedS, { type: "GO_TO_SCREEN", screen: "victory" });
    expect(next.progress.completedQuests).toEqual(["q001", "q002"]);
  });
});

describe("SET_NAME", () => {
  it("sets player name", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "Hanzo" });
    expect(next.player.name).toBe("Hanzo");
  });

  it("trims the name", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "  Rin  " });
    expect(next.player.name).toBe("Rin");
  });

  it("preserves other player fields when setting name", () => {
    const s = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, gold: 500 } };
    const next = gameReducer(s, { type: "SET_NAME", name: "Test" });
    expect(next.player.gold).toBe(500);
  });
});

describe("SELECT_CLAN", () => {
  it("sets clan on the player", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(next.player.clan).toBe("force");
  });

  it("applies clan HP bonus", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(next.player.maxHp).toBeGreaterThan(INITIAL_STATE.player.maxHp);
  });

  it("applies clan chakra bonus for illusion", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "illusion" });
    expect(next.player.maxChakra).toBeGreaterThan(INITIAL_STATE.player.maxChakra);
  });

  it("unlocks starter skill", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "speed" });
    expect(next.player.skills).toContain("flash_step");
  });

  it("navigates away from title after clan select", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SELECT_CLAN", clan: "force" });
    expect(next.ui.screen).not.toBe("title");
  });
});
