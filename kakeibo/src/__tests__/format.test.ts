import { describe, it, expect } from "vitest";
import {
  formatAmount,
  formatDate,
  toDateString,
  isValidDate,
  isValidAmount,
  today,
} from "../utils/format.js";

describe("formatAmount()", () => {
  it("formats zero", () => {
    expect(formatAmount(0)).toBe("¥0");
  });

  it("formats thousands", () => {
    expect(formatAmount(1500)).toBe("¥1,500");
  });

  it("formats millions", () => {
    expect(formatAmount(1_000_000)).toBe("¥1,000,000");
  });

  it("formats negative (収支マイナス)", () => {
    // toLocaleString に委ねるため符号付きを確認
    expect(formatAmount(-500)).toContain("500");
  });
});

describe("formatDate()", () => {
  it("converts YYYY-MM-DD to Japanese", () => {
    expect(formatDate("2025-06-15")).toBe("2025年6月15日");
  });

  it("strips leading zeros from month and day", () => {
    expect(formatDate("2025-01-05")).toBe("2025年1月5日");
  });

  it("returns original string for invalid format", () => {
    expect(formatDate("invalid")).toBe("invalid");
  });
});

describe("toDateString()", () => {
  it("converts Date to YYYY-MM-DD", () => {
    expect(toDateString(new Date("2025-06-15T00:00:00.000Z"))).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  });

  it("pads month and day with zeros", () => {
    // Use a fixed UTC date so timezone differences don't matter
    const d = new Date("2025-01-05T12:00:00Z");
    const result = toDateString(d);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(result.split("-")[1]).toHaveLength(2);
    expect(result.split("-")[2]).toHaveLength(2);
  });
});

describe("today()", () => {
  it("returns a string matching YYYY-MM-DD", () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("matches current year", () => {
    const year = new Date().getFullYear();
    expect(today().startsWith(String(year))).toBe(true);
  });
});

describe("isValidDate()", () => {
  it("accepts valid date", () => {
    expect(isValidDate("2025-06-15")).toBe(true);
  });

  it("accepts leap day on leap year", () => {
    expect(isValidDate("2024-02-29")).toBe(true);
  });

  it("rejects leap day on non-leap year", () => {
    expect(isValidDate("2025-02-29")).toBe(false);
  });

  it("rejects wrong format", () => {
    expect(isValidDate("2025/06/15")).toBe(false);
    expect(isValidDate("20250615")).toBe(false);
    expect(isValidDate("")).toBe(false);
  });

  it("rejects impossible date", () => {
    expect(isValidDate("2025-13-01")).toBe(false);
  });
});

describe("isValidAmount()", () => {
  it("accepts positive integers", () => {
    expect(isValidAmount("1")).toBe(true);
    expect(isValidAmount("1500")).toBe(true);
    expect(isValidAmount("100000000")).toBe(true);
  });

  it("rejects zero", () => {
    expect(isValidAmount("0")).toBe(false);
  });

  it("rejects negative numbers", () => {
    expect(isValidAmount("-100")).toBe(false);
  });

  it("rejects decimals", () => {
    expect(isValidAmount("1.5")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidAmount("")).toBe(false);
  });

  it("rejects non-numeric strings", () => {
    expect(isValidAmount("abc")).toBe(false);
    expect(isValidAmount("12abc")).toBe(false);
  });

  it("rejects amount over 100 million", () => {
    expect(isValidAmount("100000001")).toBe(false);
  });
});
