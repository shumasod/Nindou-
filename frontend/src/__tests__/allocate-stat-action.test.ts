import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function stateWithPoints(points: number, stats?: Partial<GameState["player"]["stats"]>): GameState {
  return {
    ...INITIAL_STATE,
    player: {
      ...INITIAL_STATE.player,
      statPoints: points,
      stats: { ...INITIAL_STATE.player.stats, ...stats },
    },
  };
}

describe("ALLOCATE_STAT", () => {
  it("increments attack by 1", () => {
    const s = stateWithPoints(3);
    const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(next.player.stats.attack).toBe(s.player.stats.attack + 1);
  });

  it("increments defense by 1", () => {
    const s = stateWithPoints(3);
    const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "defense" });
    expect(next.player.stats.defense).toBe(s.player.stats.defense + 1);
  });

  it("increments speed by 1", () => {
    const s = stateWithPoints(3);
    const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "speed" });
    expect(next.player.stats.speed).toBe(s.player.stats.speed + 1);
  });

  it("increments stealth by 1", () => {
    const s = stateWithPoints(3);
    const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "stealth" });
    expect(next.player.stats.stealth).toBe(s.player.stats.stealth + 1);
  });

  it("decrements statPoints by 1", () => {
    const s = stateWithPoints(5);
    const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(next.player.statPoints).toBe(4);
  });

  it("does not change other stats when allocating attack", () => {
    const s = stateWithPoints(2);
    const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(next.player.stats.defense).toBe(s.player.stats.defense);
    expect(next.player.stats.speed).toBe(s.player.stats.speed);
    expect(next.player.stats.stealth).toBe(s.player.stats.stealth);
  });

  it("is a no-op when statPoints is 0", () => {
    const s = stateWithPoints(0);
    const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(next).toBe(s);
  });

  it("is a no-op when statPoints is negative", () => {
    const s = { ...INITIAL_STATE, player: { ...INITIAL_STATE.player, statPoints: -1 } };
    const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(next).toBe(s);
  });

  it("can allocate until points reach 0", () => {
    let s = stateWithPoints(2);
    s = gameReducer(s, { type: "ALLOCATE_STAT", stat: "defense" });
    s = gameReducer(s, { type: "ALLOCATE_STAT", stat: "speed" });
    expect(s.player.statPoints).toBe(0);
    expect(s.player.stats.defense).toBe(INITIAL_STATE.player.stats.defense + 1);
    expect(s.player.stats.speed).toBe(INITIAL_STATE.player.stats.speed + 1);
  });

  it("does not change player HP, gold, or level", () => {
    const s = stateWithPoints(3);
    const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
    expect(next.player.hp).toBe(s.player.hp);
    expect(next.player.gold).toBe(s.player.gold);
    expect(next.player.level).toBe(s.player.level);
  });

  it("does not change battle or progress state", () => {
    const s = stateWithPoints(1);
    const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "stealth" });
    expect(next.battle).toEqual(s.battle);
    expect(next.progress).toEqual(s.progress);
  });
});
