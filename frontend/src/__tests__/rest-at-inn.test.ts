import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function injuredState(hp: number, chakra: number, gold: number): GameState {
  return {
    ...INITIAL_STATE,
    player: {
      ...INITIAL_STATE.player,
      hp,
      maxHp: 100,
      chakra,
      maxChakra: 50,
      gold,
    },
  };
}

describe("REST_AT_INN", () => {
  it("restores HP to maxHp", () => {
    const s = injuredState(30, 20, 500);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.hp).toBe(100);
  });

  it("restores chakra to maxChakra", () => {
    const s = injuredState(30, 20, 500);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.chakra).toBe(50);
  });

  it("deducts gold by the computed cost", () => {
    // hp missing=70 → 70*0.5=35; chakra missing=30 → 30*0.3=9; total=44 → max(10,44)=44
    const s = injuredState(30, 20, 500);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.gold).toBe(500 - 44);
  });

  it("minimum cost is 10G (when already full)", () => {
    const s = injuredState(100, 50, 500);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.gold).toBe(490);
  });

  it("is a no-op when gold < cost (returns same state reference)", () => {
    // Missing HP=70 → cost=44; give only 20G
    const s = injuredState(30, 20, 20);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next).toBe(s);
  });

  it("succeeds when gold equals cost exactly", () => {
    const s = injuredState(30, 20, 44);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.hp).toBe(100);
    expect(next.player.gold).toBe(0);
  });

  it("does not change player stats or level", () => {
    const s = injuredState(50, 25, 500);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.stats).toEqual(s.player.stats);
    expect(next.player.level).toBe(s.player.level);
  });

  it("does not change maxHp or maxChakra", () => {
    const s = injuredState(50, 25, 500);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.maxHp).toBe(100);
    expect(next.player.maxChakra).toBe(50);
  });

  it("does not change battle state", () => {
    const s = injuredState(50, 25, 500);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.battle).toEqual(s.battle);
  });

  it("does not change progress state", () => {
    const s = injuredState(50, 25, 500);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.progress).toEqual(s.progress);
  });
});
