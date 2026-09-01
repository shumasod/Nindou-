import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";

describe("SET_NAME", () => {
  it("sets player name", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "Hanzo" });
    expect(next.player.name).toBe("Hanzo");
  });

  it("navigates to home screen", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "Ryu" });
    expect(next.ui.screen).toBe("home");
  });

  it("trims leading/trailing whitespace", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "  Ninja  " });
    expect(next.player.name).toBe("Ninja");
  });

  it("truncates name to 12 characters", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "A".repeat(20) });
    expect(next.player.name).toHaveLength(12);
  });

  it("strips HTML angle-bracket characters", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "<script>" });
    expect(next.player.name).not.toContain("<");
    expect(next.player.name).not.toContain(">");
  });

  it("strips double-quote characters", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: 'Nin"ja' });
    expect(next.player.name).not.toContain('"');
  });

  it("is a no-op for empty string (returns same reference)", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "" });
    expect(next).toBe(INITIAL_STATE);
  });

  it("is a no-op for whitespace-only string", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "   " });
    expect(next).toBe(INITIAL_STATE);
  });

  it("is a no-op for string of only stripped chars", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "<>\"'`" });
    expect(next).toBe(INITIAL_STATE);
  });

  it("does not change player stats or level", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "Ryu" });
    expect(next.player.stats).toEqual(INITIAL_STATE.player.stats);
    expect(next.player.level).toBe(INITIAL_STATE.player.level);
  });

  it("does not change battle or progress", () => {
    const next = gameReducer(INITIAL_STATE, { type: "SET_NAME", name: "Ryu" });
    expect(next.battle).toEqual(INITIAL_STATE.battle);
    expect(next.progress).toEqual(INITIAL_STATE.progress);
  });
});
