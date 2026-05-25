import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { SelectInput, type SelectItem } from "./shared/SelectInput.js";
import { FormField } from "./shared/FormField.js";
import { Divider } from "./shared/Divider.js";
import { store } from "../store/json-store.js";
import {
  categoriesFor,
  type TransactionInput,
  type TransactionType,
} from "../models/transaction.js";
import { today, isValidDate, isValidAmount, formatAmount } from "../utils/format.js";

type Step =
  | "type"
  | "amount"
  | "category"
  | "date"
  | "memo"
  | "confirm"
  | "done";

interface Props {
  /** 編集モード: トランザクション ID を渡す */
  editId?: string;
  onDone: () => void;
  onCancel: () => void;
}

const TYPE_ITEMS: SelectItem<TransactionType>[] = [
  { label: "💸  支出", value: "expense" },
  { label: "💰  収入", value: "income" },
];

export function AddForm({ editId, onDone, onCancel }: Props) {
  const isEdit = editId !== undefined;

  const [step, setStep] = useState<Step>("type");
  const [txType, setTxType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(today());
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // 編集モード: 既存データをロード
  useEffect(() => {
    if (!isEdit || !editId) return;
    store.getById(editId).then((tx) => {
      if (!tx) return;
      setTxType(tx.type);
      setAmount(String(tx.amount));
      setCategory(tx.category);
      setDate(tx.date);
      setMemo(tx.memo);
      setStep("amount"); // type は変更不可
    });
  }, [editId, isEdit]);

  // Esc でキャンセル
  useInput((_, key) => {
    if (key.escape) onCancel();
  });

  const categoryItems: SelectItem<string>[] = categoriesFor(txType).map(
    (c) => ({ label: c, value: c })
  );

  const handleTypeSelect = (item: SelectItem<TransactionType>) => {
    setTxType(item.value);
    setCategory("");
    setStep("amount");
  };

  const handleAmountSubmit = (value: string) => {
    if (!isValidAmount(value)) {
      setError("金額は1以上の整数で入力してください");
      return;
    }
    setError("");
    setStep("category");
  };

  const handleCategorySelect = (item: SelectItem<string>) => {
    setCategory(item.value);
    setStep("date");
  };

  const handleDateSubmit = (value: string) => {
    if (!isValidDate(value)) {
      setError("YYYY-MM-DD 形式で入力してください");
      return;
    }
    setError("");
    setStep("memo");
  };

  const handleMemoSubmit = () => {
    setStep("confirm");
  };

  const handleSave = async () => {
    setSaving(true);
    const input: TransactionInput = {
      type: txType,
      amount: parseInt(amount, 10),
      category,
      date,
      memo,
    };
    try {
      if (isEdit && editId) {
        await store.update(editId, input);
      } else {
        await store.add(input);
      }
      setStep("done");
      setTimeout(onDone, 800);
    } catch {
      setError("保存に失敗しました");
      setSaving(false);
    }
  };

  const CONFIRM_ITEMS: SelectItem<"save" | "back">[] = [
    { label: "✅  保存する", value: "save" },
    { label: "↩️  修正する", value: "back" },
  ];

  const handleConfirmSelect = (item: SelectItem<"save" | "back">) => {
    if (item.value === "save") {
      void handleSave();
    } else {
      setStep("memo");
    }
  };

  const title = isEdit ? "✏️  記録を編集" : "📝  記録を追加";

  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column">
        <Text bold color="cyan">{title}</Text>
        <Divider width={24} />
      </Box>

      {step === "done" ? (
        <Text color="green">✓ {isEdit ? "更新" : "保存"}しました！</Text>
      ) : (
        <>
          {/* 入力ステップ */}
          {step === "type" && !isEdit && (
            <Box flexDirection="column" gap={1}>
              <Text>種別を選択してください：</Text>
              <SelectInput items={TYPE_ITEMS} onSelect={handleTypeSelect} />
            </Box>
          )}

          {step === "amount" && (
            <Box flexDirection="column" gap={1}>
              <FormField
                label="金額 (円)"
                value={amount}
                onChange={setAmount}
                onSubmit={handleAmountSubmit}
                placeholder="例: 1500"
                focus
              />
            </Box>
          )}

          {step === "category" && (
            <Box flexDirection="column" gap={1}>
              <Text>カテゴリを選択してください：</Text>
              <SelectInput
                items={categoryItems}
                onSelect={handleCategorySelect}
              />
            </Box>
          )}

          {step === "date" && (
            <Box flexDirection="column" gap={1}>
              <FormField
                label="日付"
                value={date}
                onChange={setDate}
                onSubmit={handleDateSubmit}
                placeholder="YYYY-MM-DD"
                focus
              />
            </Box>
          )}

          {step === "memo" && (
            <Box flexDirection="column" gap={1}>
              <FormField
                label="メモ"
                value={memo}
                onChange={setMemo}
                onSubmit={handleMemoSubmit}
                placeholder="(空白でスキップ)"
                focus
              />
            </Box>
          )}

          {step === "confirm" && (
            <Box flexDirection="column" gap={1}>
              <Text bold>内容を確認してください：</Text>
              <Divider width={24} />
              <Box flexDirection="column" paddingLeft={1}>
                <Text>種別　: <Text color={txType === "income" ? "green" : "red"}>{txType === "income" ? "収入" : "支出"}</Text></Text>
                <Text>金額　: <Text color="yellow" bold>{formatAmount(parseInt(amount, 10))}</Text></Text>
                <Text>カテゴリ: {category}</Text>
                <Text>日付　: {date}</Text>
                <Text>メモ　: {memo || "(なし)"}</Text>
              </Box>
              <Divider width={24} />
              {saving ? (
                <Text color="cyan">保存中...</Text>
              ) : (
                <SelectInput items={CONFIRM_ITEMS} onSelect={handleConfirmSelect} />
              )}
            </Box>
          )}

          {/* 進捗インジケーター */}
          {step !== "confirm" && step !== "type" && (
            <Box marginTop={1} gap={2}>
              {[
                { key: "amount", label: "金額" },
                { key: "category", label: "カテゴリ" },
                { key: "date", label: "日付" },
                { key: "memo", label: "メモ" },
              ].map(({ key, label }) => {
                const steps: Step[] = ["amount", "category", "date", "memo", "confirm"];
                const currentIdx = steps.indexOf(step);
                const itemIdx = steps.indexOf(key as Step);
                const isDone = itemIdx < currentIdx;
                const isCurrent = key === step;
                const textColor = isDone ? "green" : isCurrent ? "cyan" : undefined;
                return (
                  <Text
                    key={key}
                    {...(textColor ? { color: textColor } : {})}
                    dimColor={!isDone && !isCurrent}
                  >
                    {isDone ? "✓" : isCurrent ? "●" : "○"} {label}
                  </Text>
                );
              })}
            </Box>
          )}

          {error && <Text color="red">⚠ {error}</Text>}
          <Text dimColor>Esc でキャンセル</Text>
        </>
      )}
    </Box>
  );
}
