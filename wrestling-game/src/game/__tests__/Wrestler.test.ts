import { describe, it, expect, afterEach } from "vitest";
import { Wrestler, type WrestlerConfig } from "../Wrestler.js";

function makeWrestler(overrides: Partial<WrestlerConfig> = {}): Wrestler {
  return new Wrestler({
    name: "TEST",
    primaryColor: 0x112233,
    secondaryColor: 0x445566,
    skinColor: 0x778899,
    startX: -2.5,
    ...overrides,
  });
}

afterEach(() => {
  Wrestler.onDamage = null;
});

describe("Wrestler damage", () => {
  it("applies defenceMult to incoming damage", () => {
    const tough = makeWrestler({ defenceMult: 0.5, maxHp: 100 });
    tough.takeDamage(20);
    expect(tough.hp).toBe(90); // 20 * 0.5
  });

  it("doubles damage taken while taunting", () => {
    const w = makeWrestler({ maxHp: 100 });
    w.state = "taunting";
    w.takeDamage(10);
    expect(w.hp).toBe(80);
  });

  it("never drops hp below zero", () => {
    const w = makeWrestler({ maxHp: 100 });
    w.takeDamage(9999);
    expect(w.hp).toBe(0);
  });

  it("builds momentum from damage taken, capped at 100", () => {
    const w = makeWrestler({ maxHp: 500 });
    w.takeDamage(50);              // +15 momentum (50 * 0.3)
    expect(w.momentum).toBeCloseTo(15);
    w.takeDamage(1000);
    expect(w.momentum).toBe(100);
  });

  it("reports the post-mitigation amount to the onDamage hook", () => {
    const seen: number[] = [];
    Wrestler.onDamage = (_victim, dmg) => { seen.push(dmg); };
    const w = makeWrestler({ defenceMult: 0.5 });
    w.takeDamage(20);
    expect(seen).toEqual([10]);
  });
});

describe("Wrestler condition flags", () => {
  it("is gassed below 20 stamina", () => {
    const w = makeWrestler();
    expect(w.isGassed).toBe(false);
    w.stamina = 19;
    expect(w.isGassed).toBe(true);
  });

  it("is in danger below 20 hp but not when defeated", () => {
    const w = makeWrestler({ maxHp: 100 });
    w.takeDamage(85);              // hp 15
    expect(w.isDanger).toBe(true);
    w.takeDamage(100);             // hp 0
    expect(w.isDanger).toBe(false);
  });

  it("scales damageMult down when gassed and up when in danger", () => {
    const base = makeWrestler({ damageMult: 1, maxHp: 100 });
    expect(base.damageMult).toBeCloseTo(1);

    const gassed = makeWrestler({ damageMult: 1, maxHp: 100 });
    gassed.stamina = 10;
    expect(gassed.damageMult).toBeCloseTo(0.75);

    const fired = makeWrestler({ damageMult: 1, maxHp: 100 });
    fired.takeDamage(85);          // hp 15 -> danger
    expect(fired.damageMult).toBeCloseTo(1.25);
  });
});

describe("Wrestler signature momentum cost", () => {
  it("consumes the whole meter by default (finisher)", () => {
    const a = makeWrestler();
    const b = makeWrestler({ startX: 2.5 });
    a.momentum = 100;
    a.startSignature(b);
    expect(a.momentum).toBe(0);
  });

  it("consumes only the given cost, keeping the remainder (50% special)", () => {
    const a = makeWrestler();
    const b = makeWrestler({ startX: 2.5 });
    a.momentum = 90;
    a.startSignature(b, 50);
    expect(a.momentum).toBe(40);
  });

  it("clamps the cost at zero", () => {
    const a = makeWrestler();
    const b = makeWrestler({ startX: 2.5 });
    a.momentum = 30;
    a.startSignature(b, 50);
    expect(a.momentum).toBe(0);
  });
});
