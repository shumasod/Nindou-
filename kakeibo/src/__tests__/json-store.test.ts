import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { JsonStore } from "../store/json-store.js";
import type { TransactionInput } from "../models/transaction.js";

// テスト用フィクスチャ
const expense: TransactionInput = {
  type: "expense",
  amount: 1500,
  category: "食費",
  date: "2025-06-15",
  memo: "ランチ",
};

const income: TransactionInput = {
  type: "income",
  amount: 250_000,
  category: "給与",
  date: "2025-06-25",
  memo: "6月分",
};

const expense2: TransactionInput = {
  type: "expense",
  amount: 3_000,
  category: "交通費",
  date: "2025-06-20",
  memo: "定期代",
};

const expenseOtherMonth: TransactionInput = {
  type: "expense",
  amount: 800,
  category: "食費",
  date: "2025-05-10",
  memo: "別月",
};

// 各テストで独立した一時ファイルに書き込む
let tmpDir: string;
let store: JsonStore;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "kakeibo-test-"));
  store = new JsonStore(join(tmpDir, "data.json"));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ─── getAll ───────────────────────────────────────────────────────────────
describe("getAll()", () => {
  it("returns empty array when no transactions", async () => {
    const result = await store.getAll();
    expect(result).toEqual([]);
  });

  it("returns all added transactions", async () => {
    await store.add(expense);
    await store.add(income);
    const result = await store.getAll();
    expect(result).toHaveLength(2);
  });

  it("returns transactions sorted by date descending", async () => {
    await store.add(expense);      // 2025-06-15
    await store.add(income);       // 2025-06-25
    await store.add(expense2);     // 2025-06-20
    const result = await store.getAll();
    expect(result[0]!.date).toBe("2025-06-25");
    expect(result[1]!.date).toBe("2025-06-20");
    expect(result[2]!.date).toBe("2025-06-15");
  });
});

// ─── add ──────────────────────────────────────────────────────────────────
describe("add()", () => {
  it("returns the created transaction with an id", async () => {
    const tx = await store.add(expense);
    expect(tx.id).toBeTruthy();
    expect(tx.type).toBe("expense");
    expect(tx.amount).toBe(1500);
    expect(tx.category).toBe("食費");
    expect(tx.date).toBe("2025-06-15");
    expect(tx.memo).toBe("ランチ");
  });

  it("assigns unique IDs to each transaction", async () => {
    const a = await store.add(expense);
    const b = await store.add(income);
    expect(a.id).not.toBe(b.id);
  });

  it("sets createdAt and updatedAt as ISO strings", async () => {
    const tx = await store.add(expense);
    expect(() => new Date(tx.createdAt)).not.toThrow();
    expect(() => new Date(tx.updatedAt)).not.toThrow();
    expect(tx.createdAt).toBe(tx.updatedAt);
  });

  it("persists data to disk (new store instance reads it back)", async () => {
    const tx = await store.add(expense);
    // 同じファイルを指す別インスタンスで読む
    const store2 = new JsonStore(join(tmpDir, "data.json"));
    const all = await store2.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]!.id).toBe(tx.id);
  });
});

// ─── getById ──────────────────────────────────────────────────────────────
describe("getById()", () => {
  it("returns the transaction when found", async () => {
    const tx = await store.add(expense);
    const found = await store.getById(tx.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(tx.id);
  });

  it("returns undefined when not found", async () => {
    const found = await store.getById("nonexistent-id");
    expect(found).toBeUndefined();
  });
});

// ─── update ───────────────────────────────────────────────────────────────
describe("update()", () => {
  it("updates specified fields", async () => {
    const tx = await store.add(expense);
    const updated = await store.update(tx.id, { amount: 2000, memo: "更新" });
    expect(updated.amount).toBe(2000);
    expect(updated.memo).toBe("更新");
    // 変更していないフィールドは保持
    expect(updated.category).toBe("食費");
    expect(updated.date).toBe("2025-06-15");
  });

  it("updates updatedAt but not createdAt", async () => {
    const tx = await store.add(expense);
    // 少し待ってから更新
    await new Promise((r) => setTimeout(r, 5));
    const updated = await store.update(tx.id, { amount: 9999 });
    expect(updated.createdAt).toBe(tx.createdAt);
    expect(updated.updatedAt).not.toBe(tx.createdAt);
  });

  it("persists the update to disk", async () => {
    const tx = await store.add(expense);
    await store.update(tx.id, { amount: 5000 });
    const store2 = new JsonStore(join(tmpDir, "data.json"));
    const found = await store2.getById(tx.id);
    expect(found!.amount).toBe(5000);
  });

  it("throws when id does not exist", async () => {
    await expect(store.update("bad-id", { amount: 1 })).rejects.toThrow(
      "Transaction not found: bad-id"
    );
  });
});

// ─── remove ───────────────────────────────────────────────────────────────
describe("remove()", () => {
  it("removes the transaction", async () => {
    const tx = await store.add(expense);
    await store.remove(tx.id);
    const result = await store.getAll();
    expect(result).toHaveLength(0);
  });

  it("does not affect other transactions", async () => {
    const a = await store.add(expense);
    const b = await store.add(income);
    await store.remove(a.id);
    const result = await store.getAll();
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe(b.id);
  });

  it("is idempotent for non-existent id", async () => {
    await store.add(expense);
    await store.remove("nonexistent");
    const result = await store.getAll();
    expect(result).toHaveLength(1);
  });
});

// ─── getByMonth ───────────────────────────────────────────────────────────
describe("getByMonth()", () => {
  it("returns only transactions in the specified month", async () => {
    await store.add(expense);           // 2025-06
    await store.add(income);            // 2025-06
    await store.add(expenseOtherMonth); // 2025-05
    const result = await store.getByMonth(2025, 6);
    expect(result).toHaveLength(2);
    for (const tx of result) {
      expect(tx.date).toMatch(/^2025-06/);
    }
  });

  it("returns empty array when no transactions in month", async () => {
    await store.add(expense);
    const result = await store.getByMonth(2024, 1);
    expect(result).toEqual([]);
  });

  it("pads single-digit months correctly (e.g., March = 03)", async () => {
    const march: TransactionInput = { ...expense, date: "2025-03-01" };
    await store.add(march);
    expect(await store.getByMonth(2025, 3)).toHaveLength(1);
    expect(await store.getByMonth(2025, 4)).toHaveLength(0);
  });
});

// ─── getMonthlySummary ────────────────────────────────────────────────────
describe("getMonthlySummary()", () => {
  it("returns zeros when no transactions", async () => {
    const s = await store.getMonthlySummary(2025, 6);
    expect(s.totalIncome).toBe(0);
    expect(s.totalExpense).toBe(0);
    expect(s.balance).toBe(0);
    expect(s.byCategory.size).toBe(0);
  });

  it("calculates totals correctly", async () => {
    await store.add(expense);   // -1500
    await store.add(income);    // +250000
    await store.add(expense2);  // -3000
    const s = await store.getMonthlySummary(2025, 6);
    expect(s.totalIncome).toBe(250_000);
    expect(s.totalExpense).toBe(4_500);
    expect(s.balance).toBe(245_500);
  });

  it("aggregates expenses by category", async () => {
    await store.add(expense);  // 食費 1500
    await store.add(expense2); // 交通費 3000
    const extra: TransactionInput = { ...expense, amount: 500 }; // 食費 500
    await store.add(extra);
    const s = await store.getMonthlySummary(2025, 6);
    expect(s.byCategory.get("食費")).toBe(2000);
    expect(s.byCategory.get("交通費")).toBe(3000);
  });

  it("does not include income in byCategory", async () => {
    await store.add(income);
    const s = await store.getMonthlySummary(2025, 6);
    expect(s.byCategory.size).toBe(0);
  });

  it("ignores transactions from other months", async () => {
    await store.add(expense);           // 2025-06 支出
    await store.add(expenseOtherMonth); // 2025-05 支出
    const s = await store.getMonthlySummary(2025, 6);
    expect(s.totalExpense).toBe(1500);
  });

  it("returns correct year/month in result", async () => {
    const s = await store.getMonthlySummary(2025, 6);
    expect(s.year).toBe(2025);
    expect(s.month).toBe(6);
  });
});
