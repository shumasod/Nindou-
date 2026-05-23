import React, { useState } from "react";
import { Box, Text } from "ink";

// Screen names — expanded as features are added
export type Screen = "menu" | "add" | "list" | "summary";
export type Command = "menu" | "add";

interface Props {
  initialCommand: Command;
}

export function App({ initialCommand }: Props) {
  const [screen, setScreen] = useState<Screen>(
    initialCommand === "add" ? "add" : "menu"
  );

  // Placeholder — screens wired up in later PRs
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        💰 kakeibo — ターミナル家計簿
      </Text>
      <Text dimColor>screen: {screen} (coming soon)</Text>
    </Box>
  );
}
