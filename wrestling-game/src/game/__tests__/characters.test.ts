import { describe, it, expect } from "vitest";
import { ROSTER } from "../characters.js";

/**
 * ロスターは main.ts / Wrestler / キャラ選択 UI から
 * 「全フィールドが存在する」前提で spread されるため、
 * 欠損や重複が入ると実行時に静かに壊れる。ここで契約を固定する。
 */
describe("ROSTER", () => {
  it("is non-empty", () => {
    expect(ROSTER.length).toBeGreaterThan(0);
  });

  it("has unique ids and names", () => {
    const ids   = ROSTER.map((c) => c.id);
    const names = ROSTER.map((c) => c.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every character a finisher and a special", () => {
    for (const c of ROSTER) {
      expect(c.finisher.name.length).toBeGreaterThan(0);
      expect(c.special.name.length).toBeGreaterThan(0);
      // 演出で色が被ると技の区別がつかない
      expect(c.finisher.color).not.toBe(c.special.color);
    }
  });

  it("keeps every colour inside the 24-bit range", () => {
    for (const c of ROSTER) {
      const colors = [
        c.primaryColor, c.secondaryColor, c.skinColor,
        c.finisher.color, c.special.color,
      ];
      for (const col of colors) {
        expect(Number.isInteger(col)).toBe(true);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThanOrEqual(0xffffff);
      }
    }
  });

  it("keeps stat multipliers within a sane balance window", () => {
    for (const c of ROSTER) {
      expect(c.speedMult).toBeGreaterThan(0);
      expect(c.speedMult).toBeLessThanOrEqual(2);
      expect(c.damageMult).toBeGreaterThan(0);
      expect(c.damageMult).toBeLessThanOrEqual(2);
      // defenceMult は被ダメ倍率 — 0 だと無敵になる
      expect(c.defenceMult).toBeGreaterThan(0);
      expect(c.defenceMult).toBeLessThanOrEqual(2);
      expect(c.staminaMult).toBeGreaterThan(0);
      expect(c.maxHp).toBeGreaterThan(0);
    }
  });

  it("balances speed against durability (no strictly dominant pick)", () => {
    // 全ステータスで他を上回るキャラが居ると選択画面が意味を失う
    for (const a of ROSTER) {
      const dominatesSomeone = ROSTER.some(
        (b) =>
          b.id !== a.id &&
          a.speedMult   >= b.speedMult &&
          a.damageMult  >= b.damageMult &&
          a.maxHp       >= b.maxHp &&
          a.staminaMult >= b.staminaMult &&
          a.defenceMult <= b.defenceMult
      );
      expect(dominatesSomeone).toBe(false);
    }
  });
});
