import { calcEscapeRate } from "@/components/KageNinden/utils";

describe("逃走成功率の境界 セキュリティテスト", () => {
  test("逃走成功率は 0 以上 1 以下", () => {
    const cases = [
      [1, 1], [5, 100], [100, 5], [10, 10], [0, 10], [50, 50],
    ];
    for (const [ps, es] of cases) {
      const rate = calcEscapeRate(ps, es);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    }
  });

  test("playerSpeed が高いほど逃走成功率が高い", () => {
    const low = calcEscapeRate(5, 20);
    const high = calcEscapeRate(50, 20);
    expect(high).toBeGreaterThan(low);
  });

  test("enemySpeed が高いほど逃走成功率が低い", () => {
    const easy = calcEscapeRate(20, 5);
    const hard = calcEscapeRate(20, 50);
    expect(easy).toBeGreaterThan(hard);
  });

  test("calcEscapeRate(0, 0) は例外をスローしない", () => {
    expect(() => calcEscapeRate(0, 0)).not.toThrow();
  });
});
