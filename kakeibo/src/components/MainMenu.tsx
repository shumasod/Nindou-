import React from "react";
import { Box, Text } from "ink";
import { SelectInput, type SelectItem } from "./shared/SelectInput.js";
import { Divider } from "./shared/Divider.js";
import type { Screen } from "./App.js";

interface Props {
  onNavigate: (screen: Screen) => void;
}

type MenuValue = Screen | "quit";

const MENU_ITEMS: SelectItem<MenuValue>[] = [
  { label: "📝  記録する", value: "add" },
  { label: "📋  一覧を見る", value: "list" },
  { label: "📊  月次集計", value: "summary" },
  { label: "❌  終了", value: "quit" },
];

export function MainMenu({ onNavigate }: Props) {
  const handleSelect = (item: SelectItem<MenuValue>) => {
    if (item.value === "quit") {
      process.exit(0);
    }
    onNavigate(item.value);
  };

  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column">
        <Text bold color="cyan">
          💰 kakeibo — ターミナル家計簿
        </Text>
        <Divider width={28} />
      </Box>

      <SelectInput items={MENU_ITEMS} onSelect={handleSelect} />

      <Box marginTop={1}>
        <Text dimColor>↑↓ で移動、Enter で決定</Text>
      </Box>
    </Box>
  );
}
