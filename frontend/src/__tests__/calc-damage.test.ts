import { calcDamage, calcDamageWithSpeed } from "../components/KageNinden/utils";

describe("calcDamage", () => {
  it("returns damage >= 1", () => {
    for (let i = 0; i < 20; i++) {
      const { damage } = calcDamage(10, 5);
      expect(damage).toBeGreaterThanOrEqual(1);
    }
  });

  it("returns integer damage", () => {
    for (let i = 0; i < 20; i++) {
      const { damage } = calcDamage(20, 10);
      expect(Number.isInteger(damage)).toBe(true);
    }
  });

  it("returns isCritical as boolean", () => {
    const { isCritical } = calcDamage(20, 10);
    expect(typeof isCritical).toBe("boolean");
  });

  it("returns critChance of 0.1", () => {
    const { critChance } = calcDamage(20, 10);
    expect(critChance).toBe(0.1);
  });

  it("damage is at least 1 even with high defense", () => {
    for (let i = 0; i < 30; i++) {
      const { damage } = calcDamage(1, 1000);
      expect(damage).toBeGreaterThanOrEqual(1);
    }
  });

  it("higher attack generally produces higher damage (statistical)", () => {
    let totalLow = 0;
    let totalHigh = 0;
    const runs = 1000;
    for (let i = 0; i < runs; i++) {
      totalLow += calcDamage(10, 0).damage;
      totalHigh += calcDamage(50, 0).damage;
    }
    expect(totalHigh / runs).toBeGreaterThan(totalLow / runs);
  });

  it("multiplier > 1 increases damage (statistical)", () => {
    let base = 0;
    let boosted = 0;
    const runs = 500;
    for (let i = 0; i < runs; i++) {
      base += calcDamage(20, 0, 1.0).damage;
      boosted += calcDamage(20, 0, 2.0).damage;
    }
    expect(boosted / runs).toBeGreaterThan(base / runs);
  });
});

describe("calcDamageWithSpeed", () => {
  it("returns damage >= 1", () => {
    for (let i = 0; i < 20; i++) {
      const { damage } = calcDamageWithSpeed(10, 5, 10);
      expect(damage).toBeGreaterThanOrEqual(1);
    }
  });

  it("returns integer damage", () => {
    for (let i = 0; i < 20; i++) {
      const { damage } = calcDamageWithSpeed(20, 10, 15);
      expect(Number.isInteger(damage)).toBe(true);
    }
  });

  it("returns isCritical as boolean", () => {
    const { isCritical } = calcDamageWithSpeed(20, 10, 10);
    expect(typeof isCritical).toBe("boolean");
  });

  it("high speed (400+) caps crit chance at 0.4 (statistical)", () => {
    let crits = 0;
    const runs = 5000;
    for (let i = 0; i < runs; i++) {
      if (calcDamageWithSpeed(20, 0, 9999).isCritical) crits++;
    }
    const rate = crits / runs;
    expect(rate).toBeGreaterThan(0.3);
    expect(rate).toBeLessThan(0.5);
  });

  it("damage at least 1 even with high defense", () => {
    for (let i = 0; i < 30; i++) {
      const { damage } = calcDamageWithSpeed(1, 9999, 10);
      expect(damage).toBeGreaterThanOrEqual(1);
    }
  });
});
