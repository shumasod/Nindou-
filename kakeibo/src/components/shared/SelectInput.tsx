import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

export interface SelectItem<T extends string = string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  items: SelectItem<T>[];
  onSelect: (item: SelectItem<T>) => void;
  /** ハイライト色 (デフォルト: cyan) */
  highlightColor?: string;
}

export function SelectInput<T extends string>({
  items,
  onSelect,
  highlightColor = "cyan",
}: Props<T>) {
  const [cursor, setCursor] = useState(0);

  useInput((_, key) => {
    if (key.upArrow) {
      setCursor((c) => (c - 1 + items.length) % items.length);
    } else if (key.downArrow) {
      setCursor((c) => (c + 1) % items.length);
    } else if (key.return) {
      const selected = items[cursor];
      if (selected) onSelect(selected);
    }
  });

  return (
    <Box flexDirection="column">
      {items.map((item, i) => {
        const isSelected = i === cursor;
        return (
          <Box key={item.value}>
            <Text {...(isSelected ? { color: highlightColor } : {})} bold={isSelected}>
              {isSelected ? "❯ " : "  "}
              {item.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
