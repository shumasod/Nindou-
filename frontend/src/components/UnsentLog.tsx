"use client";

import type { UnsentMessage } from "@/lib/types";
import { CHARACTERS } from "@/lib/types";

interface Props {
  messages: UnsentMessage[];
}

export default function UnsentLog({ messages }: Props) {
  if (messages.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-800 pt-6">
      <h3 className="text-xs tracking-widest text-gray-600 mb-4 text-center">
        — 送らなかったメッセージ —
      </h3>
      <div className="space-y-3">
        {messages.map((msg, i) => {
          const char = CHARACTERS[msg.to];
          return (
            <div
              key={i}
              className="px-4 py-3 border border-gray-800 bg-gray-900/30"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs"
                  style={{ color: char?.accentColor ?? "#6b7280" }}
                >
                  宛先: {msg.toName || char?.name}
                </span>
                <span className="text-xs text-gray-700">Day {msg.day}</span>
              </div>
              <p className="text-sm text-gray-500 italic">"{msg.text}"</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
