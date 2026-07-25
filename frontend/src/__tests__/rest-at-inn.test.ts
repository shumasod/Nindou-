import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function makeState(hpFrac: number, chakraFrac: number, gold: number): GameState {
  const maxHp = 100;
  const maxChakra = 50;
  return {
    ...INITIAL_STATE,
    player: {
      ...INITIAL_STATE.player,
      hp: Math.floor(maxHp * hpFrac),
      maxHp,
      chakra: Math.floor(maxChakra * chakraFrac),
      maxChakra,
      gold,
    },
  };
}

function innCost(state: GameState): number {
  const { player } = state;
  return Math.max(
    10,
    Math.floor((player.maxHp - player.hp) * 0.5 + (player.maxChakra - player.chakra) * 0.3)
  );
}

describe("REST_AT_INN", () => {
  describe("successful rest (sufficient gold)", () => {
    it("restores HP to max", () => {
      const s = makeState(0.5, 1, 999);
      const next = gameReducer(s, { type: "REST_AT_INN" });
      expect(next.player.hp).toBe(next.player.maxHp);
    });

    it("restores chakra to max", () => {
      const s = makeState(1, 0.4, 999);
      const next = gameReducer(s, { type: "REST_AT_INN" });
      expect(next.player.chakra).toBe(next.player.maxChakra);
    });

    it("deducts the correct gold cost", () => {
      const s = makeState(0.5, 0.5, 999);
      const cost = innCost(s);
      const next = gameReducer(s, { type: "REST_AT_INN" });
      expect(next.player.gold).toBe(999 - cost);
    });

    it("cost is at least 10 when fully healed", () => {
      const s = makeState(1, 1, 999);
      const cost = innCost(s);
      expect(cost).toBe(10);
      const next = gameReducer(s, { type: "REST_AT_INN" });
      expect(next.player.gold).toBe(999 - 10);
    });

    it("cost scales with missing HP and chakra", () => {
      const s = makeState(0, 0, 999);
      const cost = innCost(s);
      expect(cost).toBeGreaterThan(10);
      const next = gameReducer(s, { type: "REST_AT_INN" });
      expect(next.player.gold).toBe(999 - cost);
    });
  });

  describe("blocked rest (insufficient gold)", () => {
    it("returns same state reference when gold < cost", () => {
      const s = makeState(0, 0, 0);
      const next = gameReducer(s, { type: "REST_AT_INN" });
      expect(next).toBe(s);
    });

    it("does not modify HP when gold is insufficient", () => {
      const s = makeState(0.3, 0.3, 5);
      const next = gameReducer(s, { type: "REST_AT_INN" });
      expect(next.player.hp).toBe(s.player.hp);
    });

    it("does not modify gold when gold is insufficient", () => {
      const s = makeState(0.3, 0.3, 5);
      const next = gameReducer(s, { type: "REST_AT_INN" });
      expect(next.player.gold).toBe(5);
    });

    it("rest is blocked when gold equals cost minus 1", () => {
      const s = makeState(0.5, 0.5, 999);
      const cost = innCost(s);
      const poor = { ...s, player: { ...s.player, gold: cost - 1 } };
      const next = gameReducer(poor, { type: "REST_AT_INN" });
      expect(next).toBe(poor);
    });

    it("rest succeeds when gold exactly equals cost", () => {
      const s = makeState(0.5, 0.5, 999);
      const cost = innCost(s);
      const exact = { ...s, player: { ...s.player, gold: cost } };
      const next = gameReducer(exact, { type: "REST_AT_INN" });
      expect(next.player.hp).toBe(next.player.maxHp);
      expect(next.player.gold).toBe(0);
    });
  });

  describe("cost formula edge cases", () => {
    it("minimum cost is always 10 even when fully healed", () => {
      const s = makeState(1, 1, 999);
      const cost = innCost(s);
      expect(cost).toBe(10);
    });

    it("cost at 50% HP and 50% chakra is correct", () => {
      const s = makeState(0.5, 0.5, 999);
      const cost = innCost(s);
      const expectedCost = Math.floor(50 * 0.5 + 25 * 0.3);
      expect(cost).toBe(Math.max(10, expectedCost));
    });

    it("does not modify other player fields on rest", () => {
      const s = makeState(0.5, 0.5, 999);
      const next = gameReducer(s, { type: "REST_AT_INN" });
      expect(next.player.level).toBe(s.player.level);
      expect(next.player.stats).toEqual(s.player.stats);
      expect(next.player.skills).toEqual(s.player.skills);
    });
  });
});
