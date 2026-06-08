/**
 * テキストバーグラフを生成する
 *
 * @param value    現在の値
 * @param maxValue 最大値（バー全幅に対応）
 * @param width    バーの最大文字数（デフォルト 20）
 * @returns        例: "████████░░░░░░░░░░░░"
 */
export function buildBar(
  value: number,
  maxValue: number,
  width = 20
): string {
  if (maxValue <= 0) return "░".repeat(width);
  const filled = Math.min(width, Math.max(0, Math.round((value / maxValue) * width)));
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

export interface BarEntry {
  label: string;
  value: number;
  color?: string;
}

/**
 * 複数エントリのバーグラフ行を生成する
 * 呼び出し側は Ink の <Text color={entry.color}> で描画する
 */
export function buildBars(entries: BarEntry[], width = 20): BarEntry[] {
  const max = Math.max(...entries.map((e) => e.value), 1);
  return entries.map((e) => ({
    ...e,
    label: e.label,
    value: e.value,
    // bar 文字列は entry.label とは別フィールドにしたいが、
    // Ink 側で buildBar() を直接呼ぶほうが柔軟なので値だけ返す
  }));
}
