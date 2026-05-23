/**
 * 金額を日本円形式でフォーマット
 * 例: 1500 → "¥1,500"
 */
export function formatAmount(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/**
 * 'YYYY-MM-DD' → 'YYYY年M月D日'
 */
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

/**
 * Date オブジェクト → 'YYYY-MM-DD'
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 今日の日付を 'YYYY-MM-DD' で返す
 */
export function today(): string {
  return toDateString(new Date());
}

/**
 * 'YYYY-MM-DD' のバリデーション
 */
export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

/**
 * 文字列が正の整数かチェック
 */
export function isValidAmount(value: string): boolean {
  const n = parseInt(value, 10);
  return /^\d+$/.test(value) && n > 0 && n <= 100_000_000;
}
