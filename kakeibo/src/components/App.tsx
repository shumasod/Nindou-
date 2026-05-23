import React, { useState } from "react";
import { Box } from "ink";
import { MainMenu } from "./MainMenu.js";

// 全画面の列挙 — 各 Step で追加していく
export type Screen = "menu" | "add" | "list" | "summary";
export type Command = "menu" | "add";

interface Props {
  initialCommand: Command;
}

export function App({ initialCommand }: Props) {
  const [screen, setScreen] = useState<Screen>(
    initialCommand === "add" ? "add" : "menu"
  );

  // 編集対象トランザクション ID (一覧→編集フォームで使用)
  const [editId, setEditId] = useState<string | undefined>(undefined);

  const goTo = (next: Screen, id?: string) => {
    setEditId(id);
    setScreen(next);
  };

  return (
    <Box flexDirection="column" paddingLeft={1} paddingTop={1}>
      {screen === "menu" && (
        <MainMenu onNavigate={(s) => goTo(s)} />
      )}

      {/* Step 5 以降で AddForm / TransactionList / Summary を接続 */}
      {screen === "add" && (
        <MainMenu onNavigate={(s) => goTo(s)} />
      )}
      {screen === "list" && (
        <MainMenu onNavigate={(s) => goTo(s)} />
      )}
      {screen === "summary" && (
        <MainMenu onNavigate={(s) => goTo(s)} />
      )}
    </Box>
  );
}
