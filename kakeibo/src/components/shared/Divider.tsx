import React from "react";
import { Box, Text } from "ink";

interface Props {
  width?: number;
  label?: string;
}

export function Divider({ width = 40, label }: Props) {
  if (label) {
    const side = Math.max(1, Math.floor((width - label.length - 2) / 2));
    const line = "─".repeat(side);
    return (
      <Box>
        <Text dimColor>
          {line} {label} {line}
        </Text>
      </Box>
    );
  }
  return (
    <Box>
      <Text dimColor>{"─".repeat(width)}</Text>
    </Box>
  );
}
