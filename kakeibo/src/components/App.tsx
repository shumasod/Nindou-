import React, { useState } from "react";
import { Box } from "ink";
import { MainMenu } from "./MainMenu.js";
import { AddForm } from "./AddForm.js";
import { TransactionList } from "./TransactionList.js";

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

      {screen === "add" && (
        <AddForm
          {...(editId ? { editId } : {})}
          onDone={() => goTo("menu")}
          onCancel={() => goTo("menu")}
        />
      )}

      {screen === "list" && (
        <TransactionList
          onEdit={(id) => goTo("add", id)}
          onBack={() => goTo("menu")}
        />
      )}
      {screen === "summary" && (
        <MainMenu onNavigate={(s) => goTo(s)} />
      )}
    </Box>
  );
}
