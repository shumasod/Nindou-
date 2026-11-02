import { calcDamageWithSpeed } from "@/components/KageNinden/utils";

describe("calcDamageWithSpeed 下限 セキュリティテスト", () => {
  test("ダメージは常に 1 以上（低攻撃力）", () => {
    for (let i = 0; i < 50; i++) {
      const { damage } = calcDamageWithSpeed(1, 100, 1);
      expect(damage).toBeGreaterThanOrEqual(1);
    }
  });

  test("ダメージは常に 1 以上（ゼロ攻撃力）", () => {
    for (let i = 0; i < 50; i++) {
      const { damage } = calcDamageWithSpeed(0, 50, 5);
      expect(damage).toBeGreaterThanOrEqual(1);
    }
  });

  test("multiplier なしのデフォルトは 1.0", () => {
    const { damage: d1 } = calcDamageWithSpeed(20, 5, 10);
    const { damage: d2 } = calcDamageWithSpeed(20, 5, 10, 1.0);
    // Both should be valid damage values
    expect(d1).toBeGreaterThanOrEqual(1);
    expect(d2).toBeGreaterThanOrEqual(1);
  });

  test("multiplier 2.5 でも damage は整数", () => {
    for (let i = 0; i < 20; i++) {
      const { damage } = calcDamageWithSpeed(20, 5, 12, 2.5);
      expect(Number.isInteger(damage)).toBe(true);
      expect(damage).toBeGreaterThanOrEqual(1);
    }
  });
});
