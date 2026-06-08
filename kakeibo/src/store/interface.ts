import type { Transaction, TransactionInput } from "../models/transaction.js";

export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Map<string, number>;
}

/**
 * データアクセス層の境界インターフェース。
 * JSON (lowdb) → SQLite への差し替えはこのインターフェースを実装するだけでよい。
 */
export interface KakeiboStore {
  getAll(): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | undefined>;
  add(data: TransactionInput): Promise<Transaction>;
  update(id: string, data: Partial<TransactionInput>): Promise<Transaction>;
  remove(id: string): Promise<void>;
  getByMonth(year: number, month: number): Promise<Transaction[]>;
  getMonthlySummary(year: number, month: number): Promise<MonthlySummary>;
}
