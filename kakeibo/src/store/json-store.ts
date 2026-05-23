import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";
import { homedir } from "os";
import { join } from "path";
import { mkdirSync } from "fs";
import type { Transaction, TransactionInput } from "../models/transaction.js";
import type { KakeiboStore, MonthlySummary } from "./interface.js";

interface DbSchema {
  transactions: Transaction[];
}

function dbPath(): string {
  const dir = join(homedir(), ".kakeibo");
  mkdirSync(dir, { recursive: true });
  return join(dir, "data.json");
}

async function openDb(): Promise<Low<DbSchema>> {
  const adapter = new JSONFile<DbSchema>(dbPath());
  const db = new Low<DbSchema>(adapter, { transactions: [] });
  await db.read();
  return db;
}

export class JsonStore implements KakeiboStore {
  private dbPromise: Promise<Low<DbSchema>> = openDb();

  private async db(): Promise<Low<DbSchema>> {
    return this.dbPromise;
  }

  async getAll(): Promise<Transaction[]> {
    const db = await this.db();
    return [...db.data.transactions].sort(
      (a, b) => b.date.localeCompare(a.date)
    );
  }

  async getById(id: string): Promise<Transaction | undefined> {
    const db = await this.db();
    return db.data.transactions.find((t) => t.id === id);
  }

  async add(data: TransactionInput): Promise<Transaction> {
    const db = await this.db();
    const now = new Date().toISOString();
    const tx: Transaction = {
      id: nanoid(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    db.data.transactions.push(tx);
    await db.write();
    return tx;
  }

  async update(
    id: string,
    data: Partial<TransactionInput>
  ): Promise<Transaction> {
    const db = await this.db();
    const idx = db.data.transactions.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Transaction not found: ${id}`);

    const existing = db.data.transactions[idx];
    if (!existing) throw new Error(`Transaction not found: ${id}`);

    const updated: Transaction = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    db.data.transactions[idx] = updated;
    await db.write();
    return updated;
  }

  async remove(id: string): Promise<void> {
    const db = await this.db();
    db.data.transactions = db.data.transactions.filter((t) => t.id !== id);
    await db.write();
  }

  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const all = await this.getAll();
    return all.filter((t) => t.date.startsWith(prefix));
  }

  async getMonthlySummary(
    year: number,
    month: number
  ): Promise<MonthlySummary> {
    const txs = await this.getByMonth(year, month);
    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory = new Map<string, number>();

    for (const tx of txs) {
      if (tx.type === "income") {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + tx.amount);
      }
    }

    return {
      year,
      month,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory,
    };
  }
}

// シングルトン — アプリ全体で同じインスタンスを共有
export const store: KakeiboStore = new JsonStore();
