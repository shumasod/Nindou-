import React from "react";
import { render } from "ink";
import meow from "meow";
import { App } from "./components/App.js";

const cli = meow(
  `
  使い方
    $ kakeibo           メインメニューを開く
    $ kakeibo add       支出/収入を記録する

  オプション
    --help              このヘルプを表示
    --version           バージョンを表示
`,
  {
    importMeta: import.meta,
    flags: {},
  }
);

type Command = "menu" | "add";

function resolveCommand(input: string[]): Command {
  const cmd = input[0];
  if (cmd === "add") return "add";
  return "menu";
}

const command = resolveCommand(cli.input);

render(<App initialCommand={command} />);
