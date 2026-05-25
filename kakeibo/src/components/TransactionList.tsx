import React, { useCallback, useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { Divider } from "./shared/Divider.js";
import { store } from "../store/json-store.js";
import type { Transaction } from "../models/transaction.js";
import { formatAmount, formatDate } from "../utils/format.js";

const PAGE_SIZE = 10;

interface Props {
  onEdit: (id: string) => void;
  onBack: () => void;
}

type Mode = "list" | "confirm-delete";

export function TransactionList({ onEdit, onBack }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cursor, setCursor] = useState(0);
  const [page, setPage] = useState(0);
  const [mode, setMode] = useState<Mode>("list");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const all = await store.getAll();
    setTransactions(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const pageItems = transactions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const selected = pageItems[cursor];

  useInput((input, key) => {
    if (mode === "confirm-delete") {
      if (input === "y" || input === "Y") void handleDeleteConfirm();
      else if (input === "n" || input === "N" || key.escape) setMode("list");
      return;
    }

    if (key.upArrow) {
      if (cursor > 0) {
        setCursor((c) => c - 1);
      } else if (page > 0) {
        setPage((p) => p - 1);
        setCursor(PAGE_SIZE - 1);
      }
    } else if (key.downArrow) {
      if (cursor < pageItems.length - 1) {
        setCursor((c) => c + 1);
      } else if (page < totalPages - 1) {
        setPage((p) => p + 1);
        setCursor(0);
      }
    } else if (key.return) {
      if (selected) onEdit(selected.id);
    } else if (input === "d" || input === "D") {
      if (selected) setMode("confirm-delete");
    } else if (key.escape) {
      onBack();
    }
  });

  const handleDeleteConfirm = async () => {
    if (!selected) return;
    await store.remove(selected.id);
    setMessage(`削除しました: ${formatAmount(selected.amount)} ${selected.category}`);
    setMode("list");
    // カーソルを調整
    const newAll = await store.getAll();
    setTransactions(newAll);
    const newPageItems = newAll.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    if (cursor >= newPageItems.length && cursor > 0) {
      setCursor(cursor - 1);
    }
    setTimeout(() => setMessage(""), 2000);
  };

  if (loading) {
    return <Text dimColor>読み込み中...</Text>;
  }

  if (transactions.length === 0) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text bold color="cyan">📋  一覧</Text>
        <Divider width={40} />
        <Text dimColor>記録がありません。</Text>
        <Text dimColor>Esc でメニューへ戻る</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      {/* ヘッダー */}
      <Box flexDirection="column">
        <Text bold color="cyan">📋  一覧</Text>
        <Divider width={52} />
        <Box paddingLeft={3}>
          <Text dimColor>
            {"日付       種別   金額          カテゴリ    メモ"}
          </Text>
        </Box>
        <Divider width={52} />
      </Box>

      {/* リスト */}
      <Box flexDirection="column">
        {pageItems.map((tx, i) => {
          const isSel = i === cursor && mode === "list";
          const isIncome = tx.type === "income";
          const amtColor = isIncome ? "green" : "red";
          const prefix = isSel ? "❯ " : "  ";

          return (
            <Box key={tx.id}>
              <Text bold={isSel} {...(isSel ? { color: "cyan" as const } : {})}>
                {prefix}
              </Text>
              <Text dimColor={!isSel}>{tx.date}  </Text>
              <Text color={amtColor} dimColor={!isSel}>
                {isIncome ? "収入" : "支出"}
              </Text>
              <Text bold={isSel} color={amtColor} dimColor={!isSel}>
                {formatAmount(tx.amount).padStart(10)}
              </Text>
              <Text dimColor={!isSel}>
                {tx.category.padEnd(8)}
              </Text>
              <Text dimColor>
                {tx.memo.length > 12 ? tx.memo.slice(0, 11) + "…" : tx.memo}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Divider width={52} />

      {/* 削除確認 */}
      {mode === "confirm-delete" && selected && (
        <Box flexDirection="column" gap={1}>
          <Text color="red" bold>
            🗑  {formatDate(selected.date)} {selected.category}{" "}
            {formatAmount(selected.amount)} を削除しますか？
          </Text>
          <Text>
            <Text color="green" bold>y</Text>
            <Text dimColor> 削除 / </Text>
            <Text color="yellow" bold>n</Text>
            <Text dimColor> キャンセル</Text>
          </Text>
        </Box>
      )}

      {/* メッセージ */}
      {message && <Text color="green">{message}</Text>}

      {/* フッター */}
      {mode === "list" && (
        <Box gap={3}>
          <Text dimColor>↑↓ 移動</Text>
          <Text dimColor>Enter 編集</Text>
          <Text dimColor>d 削除</Text>
          <Text dimColor>Esc 戻る</Text>
          {totalPages > 1 && (
            <Text dimColor>
              {page + 1}/{totalPages} ページ
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
