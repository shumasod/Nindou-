import { gameReducer, INITIAL_STATE } from "../components/KageNinden/reducer";
import type { GameState } from "../components/KageNinden/types";

function makeStateWithStatPoints(points: number): GameState {
  return {
    ...INITIAL_STATE,
    player: {
      ...INITIAL_STATE.player,
      statPoints: points,
      stats: { attack: 10, defense: 8, speed: 7, stealth: 6 },
    },
  };
}

describe("ALLOCATE_STAT", () => {
  describe("stat point allocation", () => {
    it("increases attack by 1", () => {
      const s = makeStateWithStatPoints(3);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
      expect(next.player.stats.attack).toBe(11);
    });

    it("increases defense by 1", () => {
      const s = makeStateWithStatPoints(3);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "defense" });
      expect(next.player.stats.defense).toBe(9);
    });

    it("increases speed by 1", () => {
      const s = makeStateWithStatPoints(3);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "speed" });
      expect(next.player.stats.speed).toBe(8);
    });

    it("increases stealth by 1", () => {
      const s = makeStateWithStatPoints(3);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "stealth" });
      expect(next.player.stats.stealth).toBe(7);
    });
  });

  describe("statPoints management", () => {
    it("decrements statPoints by 1 on allocation", () => {
      const s = makeStateWithStatPoints(5);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
      expect(next.player.statPoints).toBe(4);
    });

    it("decrements statPoints from 1 to 0", () => {
      const s = makeStateWithStatPoints(1);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "speed" });
      expect(next.player.statPoints).toBe(0);
    });

    it("does not change other stats when allocating to attack", () => {
      const s = makeStateWithStatPoints(3);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
      expect(next.player.stats.defense).toBe(8);
      expect(next.player.stats.speed).toBe(7);
      expect(next.player.stats.stealth).toBe(6);
    });

    it("does not change other stats when allocating to defense", () => {
      const s = makeStateWithStatPoints(3);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "defense" });
      expect(next.player.stats.attack).toBe(10);
      expect(next.player.stats.speed).toBe(7);
      expect(next.player.stats.stealth).toBe(6);
    });
  });

  describe("no-op when statPoints is 0", () => {
    it("returns same state when statPoints is 0", () => {
      const s = makeStateWithStatPoints(0);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
      expect(next).toBe(s);
    });

    it("does not modify attack when statPoints is 0", () => {
      const s = makeStateWithStatPoints(0);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
      expect(next.player.stats.attack).toBe(10);
    });

    it("does not modify statPoints when already 0", () => {
      const s = makeStateWithStatPoints(0);
      const next = gameReducer(s, { type: "ALLOCATE_STAT", stat: "stealth" });
      expect(next.player.statPoints).toBe(0);
    });
  });

  describe("multiple consecutive allocations", () => {
    it("correctly applies two allocations in sequence", () => {
      const s = makeStateWithStatPoints(2);
      const s1 = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
      const s2 = gameReducer(s1, { type: "ALLOCATE_STAT", stat: "attack" });
      expect(s2.player.stats.attack).toBe(12);
      expect(s2.player.statPoints).toBe(0);
    });

    it("third allocation is no-op when statPoints exhausted", () => {
      const s = makeStateWithStatPoints(2);
      const s1 = gameReducer(s, { type: "ALLOCATE_STAT", stat: "defense" });
      const s2 = gameReducer(s1, { type: "ALLOCATE_STAT", stat: "defense" });
      const s3 = gameReducer(s2, { type: "ALLOCATE_STAT", stat: "defense" });
      expect(s3.player.stats.defense).toBe(10);
      expect(s3.player.statPoints).toBe(0);
      expect(s3).toBe(s2);
    });

    it("allocations to different stats are independent", () => {
      const s = makeStateWithStatPoints(4);
      const s1 = gameReducer(s, { type: "ALLOCATE_STAT", stat: "attack" });
      const s2 = gameReducer(s1, { type: "ALLOCATE_STAT", stat: "defense" });
      const s3 = gameReducer(s2, { type: "ALLOCATE_STAT", stat: "speed" });
      const s4 = gameReducer(s3, { type: "ALLOCATE_STAT", stat: "stealth" });
      expect(s4.player.stats.attack).toBe(11);
      expect(s4.player.stats.defense).toBe(9);
      expect(s4.player.stats.speed).toBe(8);
      expect(s4.player.stats.stealth).toBe(7);
      expect(s4.player.statPoints).toBe(0);
    });
  });
});
