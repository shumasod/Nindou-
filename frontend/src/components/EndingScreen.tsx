"use client";

import { useGameStore } from "@/store/gameStore";
import { ENDINGS } from "@/lib/endings";
import UnsentLog from "./UnsentLog";
import { useState } from "react";

export default function EndingScreen() {
  const { endingId, unsentMessages, resetGame, params } = useGameStore();
  const [showUnsent, setShowUnsent] = useState(false);

  const ending = endingId ? ENDINGS[endingId] : ENDINGS["ending_stagnant"];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-6 py-12 animate-fade-in overflow-y-auto"
      style={{ backgroundColor: ending.bgColor }}
    >
      <div className="w-full max-w-sm">
        {/* Ending badge */}
        <p
          className="text-xs tracking-widest text-center mb-8 opacity-50"
          style={{ color: ending.textColor }}
        >
          ENDING
        </p>

        {/* Title */}
        <h2
          className="text-xl font-thin text-center mb-2 tracking-wider"
          style={{ color: ending.textColor }}
        >
          {ending.title}
        </h2>
        <p
          className="text-sm text-center mb-10 opacity-60"
          style={{ color: ending.textColor }}
        >
          {ending.subtitle}
        </p>

        <div className="h-px w-12 mx-auto mb-10 opacity-20" style={{ backgroundColor: ending.textColor }} />

        {/* Ending text */}
        <p
          className="text-sm leading-loose whitespace-pre-line mb-10"
          style={{ color: ending.textColor, opacity: 0.85 }}
        >
          {ending.text}
        </p>

        {/* Epilogue */}
        <div
          className="border-l-2 pl-4 mb-10 opacity-40"
          style={{ borderColor: ending.textColor }}
        >
          <p
            className="text-xs leading-relaxed italic whitespace-pre-line"
            style={{ color: ending.textColor }}
          >
            {ending.epilogue}
          </p>
        </div>

        {/* Stats */}
        <div
          className="mb-10 grid grid-cols-2 gap-3 text-xs"
          style={{ color: ending.textColor, opacity: 0.5 }}
        >
          <div className="text-center">
            <div className="text-lg font-thin">{params.empathy}</div>
            <div className="tracking-widest">共感力</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-thin">{params.ambition}</div>
            <div className="tracking-widest">野心</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-thin">{params.loneliness}</div>
            <div className="tracking-widest">孤独</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-thin">{params.honesty}</div>
            <div className="tracking-widest">誠実さ</div>
          </div>
        </div>

        {/* Unsent messages toggle */}
        {unsentMessages.length > 0 && (
          <button
            onClick={() => setShowUnsent(!showUnsent)}
            className="w-full py-2 text-xs tracking-widest border opacity-30 hover:opacity-60 transition-opacity mb-6"
            style={{
              borderColor: ending.textColor,
              color: ending.textColor,
            }}
          >
            {showUnsent
              ? "▲ 閉じる"
              : `▼ 送らなかったメッセージ (${unsentMessages.length}件)`}
          </button>
        )}

        {showUnsent && <UnsentLog messages={unsentMessages} />}

        {/* Restart */}
        <div className="mt-10 text-center">
          <button
            onClick={resetGame}
            className="py-3 px-8 text-xs tracking-widest border hover:opacity-70 transition-opacity"
            style={{
              borderColor: ending.textColor + "44",
              color: ending.textColor,
              opacity: 0.4,
            }}
          >
            もう一度
          </button>
        </div>
      </div>
    </div>
  );
}
