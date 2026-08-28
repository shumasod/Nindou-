import { describe, it, expect } from "vitest";
import { MatchTracker } from "../MatchStats.js";

describe("MatchTracker", () => {
  it("starts with empty stats for both sides", () => {
    const t = new MatchTracker();
    for (const side of ["p1", "p2"] as const) {
      const s = t.get(side);
      expect(s.strikesLanded).toBe(0);
      expect(s.slamsLanded).toBe(0);
      expect(s.signaturesMade).toBe(0);
      expect(s.reversals).toBe(0);
      expect(s.totalDamage).toBe(0);
      expect(s.knockdownsCaused).toBe(0);
      expect(s.pinAttempts).toBe(0);
      expect(s.maxCombo).toBe(0);
      expect(s.cornerSplashes).toBe(0);
      expect(s.ringoutsScored).toBe(0);
    }
  });

  it("records strikes with damage and optional knockdown", () => {
    const t = new MatchTracker();
    t.recordStrike("p1", 10, false);
    t.recordStrike("p1", 15, true);
    const s = t.get("p1");
    expect(s.strikesLanded).toBe(2);
    expect(s.totalDamage).toBe(25);
    expect(s.knockdownsCaused).toBe(1);
    // p2 は影響なし
    expect(t.get("p2").strikesLanded).toBe(0);
  });

  it("records slams and signatures into totalDamage", () => {
    const t = new MatchTracker();
    t.recordSlam("p2", 18);
    t.recordSignature("p2", 35);
    const s = t.get("p2");
    expect(s.slamsLanded).toBe(1);
    expect(s.signaturesMade).toBe(1);
    expect(s.totalDamage).toBe(53);
  });

  it("keeps only the highest combo", () => {
    const t = new MatchTracker();
    t.recordCombo("p1", 3);
    t.recordCombo("p1", 7);
    t.recordCombo("p1", 5);
    expect(t.get("p1").maxCombo).toBe(7);
  });

  it("records corner splashes as damage + knockdown", () => {
    const t = new MatchTracker();
    t.recordCornerSplash("p1", 26);
    const s = t.get("p1");
    expect(s.cornerSplashes).toBe(1);
    expect(s.totalDamage).toBe(26);
    expect(s.knockdownsCaused).toBe(1);
    expect(s.strikesLanded).toBe(0); // ストライクとは別カウント
  });

  it("records ring-outs for the scorer", () => {
    const t = new MatchTracker();
    t.recordRingout("p2");
    expect(t.get("p2").ringoutsScored).toBe(1);
    expect(t.get("p1").ringoutsScored).toBe(0);
  });

  it("records reversals and pin attempts", () => {
    const t = new MatchTracker();
    t.recordReversal("p1");
    t.recordReversal("p1");
    t.recordPin("p1");
    expect(t.get("p1").reversals).toBe(2);
    expect(t.get("p1").pinAttempts).toBe(1);
  });
});
