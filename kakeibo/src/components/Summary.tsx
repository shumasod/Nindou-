import React, { useCallback, useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { Divider } from "./shared/Divider.js";
import { store } from "../store/json-store.js";
import type { MonthlySummary } from "../store/interface.js";
import { formatAmount } from "../utils/format.js";
import { buildBar } from "../utils/chart.js";

const BAR_WIDTH = 20;

interface Props {
  onBack: () => void;
}

function currentYearMonth(): { year: number; month: number } {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function Summary({ onBack }: Props) {
  const { year: initYear, month: initMonth } = currentYearMonth();
  const [year, setYear] = useState(initYear);
  const [month, setMonth] = useState(initMonth);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (y: number, m: number) => {
    setLoading(true);
    const s = await store.getMonthlySummary(y, m);
    setSummary(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(year, month);
  }, [load, year, month]);

  useInput((_, key) => {
    if (key.leftArrow) {
      // 前月へ
      if (month === 1) {
        setYear((y) => y - 1);
        setMonth(12);
      } else {
        setMonth((m) => m - 1);
      }
    } else if (key.rightArrow) {
      // 翌月へ (未来は今月まで)
      const { year: cy, month: cm } = currentYearMonth();
      if (year < cy || (year === cy && month < cm)) {
        if (month === 12) {
          setYear((y) => y + 1);
          setMonth(1);
        } else {
          setMonth((m) => m + 1);
        }
      }
    } else if (key.escape) {
      onBack();
    }
  });

  const monthLabel = `${year}年${month}月`;

  if (loading) {
    return (
      <Box>
        <Text dimColor>読み込み中...</Text>
      </Box>
    );
  }

  if (!summary) return null;

  const { totalIncome, totalExpense, balance, byCategory } = summary;
  const maxCategoryAmount = Math.max(...Array.from(byCategory.values()), 1);

  // カテゴリをトランザクション合計降順でソート
  const sortedCategories = Array.from(byCategory.entries()).sort(
    ([, a], [, b]) => b - a
  );

  const balanceColor = balance >= 0 ? "green" : "red";
  const balanceSign = balance >= 0 ? "+" : "";

  return (
    <Box flexDirection="column" gap={1}>
      {/* ヘッダー */}
      <Box flexDirection="column">
        <Text bold color="cyan">📊  月次集計</Text>
        <Divider width={44} />
        <Box gap={2}>
          <Text dimColor>← 前月</Text>
          <Text bold color="cyan">{monthLabel}</Text>
          <Text dimColor>翌月 →</Text>
          <Text dimColor>Esc 戻る</Text>
        </Box>
        <Divider width={44} />
      </Box>

      {/* 収支サマリー */}
      <Box flexDirection="column" gap={0}>
        <Box gap={2}>
          <Text dimColor>{"収入:  "}</Text>
          <Text color="green" bold>{formatAmount(totalIncome).padStart(12)}</Text>
        </Box>
        <Box gap={2}>
          <Text dimColor>{"支出:  "}</Text>
          <Text color="red" bold>{formatAmount(totalExpense).padStart(12)}</Text>
        </Box>
        <Divider width={28} />
        <Box gap={2}>
          <Text dimColor>{"収支:  "}</Text>
          <Text color={balanceColor} bold>
            {`${balanceSign}${formatAmount(balance)}`.padStart(12)}
          </Text>
        </Box>
      </Box>

      {/* 収支バランスバー */}
      {(totalIncome > 0 || totalExpense > 0) && (
        <Box flexDirection="column" gap={0}>
          <Divider width={44} label="収支バランス" />
          <Box gap={1}>
            <Text color="green">収入</Text>
            <Text color="green">{buildBar(totalIncome, Math.max(totalIncome, totalExpense), BAR_WIDTH)}</Text>
            <Text color="green" dimColor>{formatAmount(totalIncome)}</Text>
          </Box>
          <Box gap={1}>
            <Text color="red">支出</Text>
            <Text color="red">{buildBar(totalExpense, Math.max(totalIncome, totalExpense), BAR_WIDTH)}</Text>
            <Text color="red" dimColor>{formatAmount(totalExpense)}</Text>
          </Box>
        </Box>
      )}

      {/* カテゴリ別バーグラフ */}
      {sortedCategories.length > 0 && (
        <Box flexDirection="column" gap={0}>
          <Divider width={44} label="カテゴリ別支出" />
          {sortedCategories.map(([cat, amt]) => (
            <Box key={cat} gap={1}>
              <Text dimColor>{cat.padEnd(6)}</Text>
              <Text color="yellow">
                {buildBar(amt, maxCategoryAmount, BAR_WIDTH)}
              </Text>
              <Text dimColor>{formatAmount(amt)}</Text>
            </Box>
          ))}
        </Box>
      )}

      {/* データなし */}
      {totalIncome === 0 && totalExpense === 0 && (
        <Text dimColor>{monthLabel} の記録はありません。</Text>
      )}
    </Box>
  );
}
