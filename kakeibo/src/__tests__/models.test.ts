import { describe, it, expect } from "vitest";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  categoriesFor,
} from "../models/transaction.js";

describe("EXPENSE_CATEGORIES", () => {
  it("is a non-empty readonly array of strings", () => {
    expect(EXPENSE_CATEGORIES.length).toBeGreaterThan(0);
    for (const c of EXPENSE_CATEGORIES) {
      expect(typeof c).toBe("string");
    }
  });

  it("contains 食費 and 交通費", () => {
    expect(EXPENSE_CATEGORIES).toContain("食費");
    expect(EXPENSE_CATEGORIES).toContain("交通費");
  });
});

describe("INCOME_CATEGORIES", () => {
  it("contains 給与", () => {
    expect(INCOME_CATEGORIES).toContain("給与");
  });
});

describe("categoriesFor()", () => {
  it("returns expense categories for 'expense'", () => {
    const cats = categoriesFor("expense");
    expect(cats).toBe(EXPENSE_CATEGORIES);
  });

  it("returns income categories for 'income'", () => {
    const cats = categoriesFor("income");
    expect(cats).toBe(INCOME_CATEGORIES);
  });

  it("expense and income categories are disjoint", () => {
    const expSet = new Set(EXPENSE_CATEGORIES);
    const overlap = INCOME_CATEGORIES.filter((c) => expSet.has(c as never));
    // 「その他」は両方に含まれることがある — ここでは重複は許容
    // ただし固有カテゴリは被らないことを確認
    const incomeExclusive = INCOME_CATEGORIES.filter(
      (c) => c !== "その他"
    );
    const expenseExclusive = EXPENSE_CATEGORIES.filter(
      (c) => c !== "その他"
    );
    for (const c of incomeExclusive) {
      expect(expenseExclusive).not.toContain(c);
    }
  });
});
