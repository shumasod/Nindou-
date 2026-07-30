import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function injuredState(hpMissing: number, chakraMissing: number, gold: number): GameState {
  const player = {
    ...INITIAL_STATE.player,
    hp: INITIAL_STATE.player.maxHp - hpMissing,
    chakra: INITIAL_STATE.player.maxChakra - chakraMissing,
    gold,
  };
  return { ...INITIAL_STATE, player };
}

describe("REST_AT_INN: healing", () => {
  it("restores HP to max", () => {
    const s = injuredState(40, 0, 200);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.hp).toBe(next.player.maxHp);
  });

  it("restores chakra to max", () => {
    const s = injuredState(0, 20, 200);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.chakra).toBe(next.player.maxChakra);
  });

  it("restores both HP and chakra when both are missing", () => {
    const s = injuredState(40, 20, 200);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.hp).toBe(next.player.maxHp);
    expect(next.player.chakra).toBe(next.player.maxChakra);
  });
});

describe("REST_AT_INN: cost calculation", () => {
  it("deducts gold for the stay", () => {
    const s = injuredState(40, 0, 200);
    const cost = Math.max(10, Math.floor(40 * 0.5 + 0 * 0.3));
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.gold).toBe(200 - cost);
  });

  it("minimum cost is 10 gold even when fully healthy", () => {
    const s = injuredState(0, 0, 200);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.gold).toBe(200 - 10);
  });

  it("cost factors in both hp and chakra missing", () => {
    const s = injuredState(20, 10, 200);
    const expectedCost = Math.max(10, Math.floor(20 * 0.5 + 10 * 0.3));
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.gold).toBe(200 - expectedCost);
  });

  it("higher hp deficit means higher cost", () => {
    const sCheap = injuredState(10, 0, 200);
    const sExpensive = injuredState(80, 0, 200);
    const nextCheap = gameReducer(sCheap, { type: "REST_AT_INN" });
    const nextExpensive = gameReducer(sExpensive, { type: "REST_AT_INN" });
    const cheapCost = 200 - nextCheap.player.gold;
    const expCost = 200 - nextExpensive.player.gold;
    expect(expCost).toBeGreaterThan(cheapCost);
  });
});

describe("REST_AT_INN: insufficient gold guard", () => {
  it("no-ops when player cannot afford rest", () => {
    const s = injuredState(80, 20, 0);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.hp).toBe(s.player.hp);
    expect(next.player.chakra).toBe(s.player.chakra);
    expect(next.player.gold).toBe(0);
  });

  it("no-ops when gold exactly one below cost", () => {
    const missingHp = 40;
    const cost = Math.max(10, Math.floor(missingHp * 0.5));
    const s = injuredState(missingHp, 0, cost - 1);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.hp).toBe(s.player.hp);
  });

  it("succeeds when gold exactly meets cost", () => {
    const missingHp = 40;
    const cost = Math.max(10, Math.floor(missingHp * 0.5));
    const s = injuredState(missingHp, 0, cost);
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.player.hp).toBe(next.player.maxHp);
    expect(next.player.gold).toBe(0);
  });
});

describe("REST_AT_INN: state preservation", () => {
  it("does not affect battle state", () => {
    const s = injuredState(40, 0, 200);
    const modS = { ...s, battle: { ...s.battle, killCount: 7 } };
    const next = gameReducer(modS, { type: "REST_AT_INN" });
    expect(next.battle.killCount).toBe(7);
  });

  it("does not affect progress state", () => {
    const s = injuredState(40, 0, 200);
    const modS = {
      ...s,
      progress: { ...s.progress, completedQuests: ["q001"] },
    };
    const next = gameReducer(modS, { type: "REST_AT_INN" });
    expect(next.progress.completedQuests).toEqual(["q001"]);
  });

  it("does not change ui screen", () => {
    const s = { ...injuredState(40, 0, 200), ui: { ...INITIAL_STATE.ui, screen: "home" as const } };
    const next = gameReducer(s, { type: "REST_AT_INN" });
    expect(next.ui.screen).toBe("home");
  });
});
