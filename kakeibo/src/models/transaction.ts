export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;    // 整数（円）
  category: string;
  date: string;      // 'YYYY-MM-DD'
  memo: string;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  memo: string;
}

export const EXPENSE_CATEGORIES = [
  "食費",
  "交通費",
  "光熱費",
  "娯楽",
  "医療",
  "日用品",
  "その他",
] as const;

export const INCOME_CATEGORIES = [
  "給与",
  "副業",
  "その他",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export function categoriesFor(type: TransactionType): readonly string[] {
  return type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}
