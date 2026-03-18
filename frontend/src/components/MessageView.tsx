"use client";

import { useEffect, useState } from "react";
import type { Scene, CharacterInfo } from "@/lib/types";
import { CHARACTERS } from "@/lib/types";

interface Props {
  scene: Scene;
  onReady: () => void;
}

interface MessageBubble {
  text: string;
  sender: "self" | "other";
}

function parseMessages(scene: Scene): MessageBubble[] {
  const lines = scene.text.split("\n").filter((l) => l.trim());
  const bubbles: MessageBubble[] = [];

  for (const line of lines) {
    if (line.startsWith("\u300C") || line.startsWith("\u201C")) {
      bubbles.push({ text: line, sender: "other" });
    } else if (line.startsWith("——") || line.startsWith("—")) {
      bubbles.push({ text: line, sender: "self" });
    } else {
      // Narrative lines shown as system messages
      if (bubbles.length > 0 && bubbles[bubbles.length - 1].sender === "self") {
        bubbles[bubbles.length - 1].text += "\n" + line;
      } else {
        bubbles.push({ text: line, sender: "self" });
      }
    }
  }

  return bubbles;
}

export default function MessageView({ scene, onReady }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const character = scene.characterId ? CHARACTERS[scene.characterId] : null;
  const bubbles = parseMessages(scene);

  useEffect(() => {
    setVisibleCount(0);
    let i = 0;
    const interval = setInterval(() => {
      if (i < bubbles.length) {
        i++;
        setVisibleCount(i);
      } else {
        clearInterval(interval);
        onReady();
      }
    }, 600);
    return () => clearInterval(interval);
  }, [scene.id, bubbles.length, onReady]);

  return (
    <div className="flex flex-col h-full bg-[#111318]">
      {/* Chat header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: character ? character.accentColor + "33" : "#1f2937" }}
      >
        {character && character.id !== "narrator" ? (
          <>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: character.accentColor + "22",
                border: `1.5px solid ${character.accentColor}55`,
                color: character.accentColor,
              }}
            >
              {character.avatar}
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: character.accentColor }}
              >
                {character.name}
              </p>
              <p className="text-xs text-gray-600">{character.description}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 tracking-widest">メッセージ</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {bubbles.slice(0, visibleCount).map((bubble, i) => (
          <MessageBubbleComponent
            key={i}
            bubble={bubble}
            character={character}
          />
        ))}
        {visibleCount < bubbles.length && (
          <div className="flex items-center gap-1 pl-2">
            <div className="flex gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  backgroundColor: character?.accentColor ?? "#6b7280",
                  animationDelay: "0ms",
                }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  backgroundColor: character?.accentColor ?? "#6b7280",
                  animationDelay: "150ms",
                }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  backgroundColor: character?.accentColor ?? "#6b7280",
                  animationDelay: "300ms",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubbleComponent({
  bubble,
  character,
}: {
  bubble: MessageBubble;
  character: CharacterInfo | null;
}) {
  const isOther = bubble.sender === "other";

  if (!isOther) {
    // Narrative / self
    return (
      <p className="text-xs text-gray-600 text-center px-4 leading-relaxed whitespace-pre-line animate-fade-in">
        {bubble.text}
      </p>
    );
  }

  return (
    <div className="flex items-end gap-2 animate-slide-up">
      {character && character.id !== "narrator" && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            backgroundColor: character.accentColor + "22",
            color: character.accentColor,
          }}
        >
          {character.avatar}
        </div>
      )}
      <div
        className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-bl-none text-sm leading-relaxed whitespace-pre-line"
        style={{
          backgroundColor: character?.accentColor
            ? character.accentColor + "22"
            : "#1f2937",
          color: "#e5e7eb",
          border: `1px solid ${character?.accentColor ? character.accentColor + "33" : "#374151"}`,
        }}
      >
        {bubble.text}
      </div>
    </div>
  );
}
