"use client";

import { useEffect, useState, useCallback } from "react";
import type { Scene } from "@/lib/types";
import { CHARACTERS } from "@/lib/types";

interface Props {
  scene: Scene;
  onReady: () => void; // called when text is fully shown
}

const BG_CLASSES: Record<string, string> = {
  morning: "from-amber-950/40 to-transparent",
  noon: "from-blue-950/20 to-transparent",
  evening: "from-orange-950/40 to-transparent",
  night: "from-slate-950/60 to-transparent",
};

const TIME_BG: Record<string, string> = {
  morning: "#1a1209",
  noon: "#0d1420",
  evening: "#1a0d05",
  night: "#0d0f14",
};

export default function NovelView({ scene, onReady }: Props) {
  const [displayedText, setDisplayedText] = useState("");
  const [textComplete, setTextComplete] = useState(false);
  const character = scene.characterId
    ? CHARACTERS[scene.characterId]
    : null;

  // Skip to full text on tap
  const skipToEnd = useCallback(() => {
    if (!textComplete) {
      setDisplayedText(scene.text);
      setTextComplete(true);
      onReady();
    }
  }, [scene.text, textComplete, onReady]);

  useEffect(() => {
    setDisplayedText("");
    setTextComplete(false);
    let i = 0;
    const text = scene.text;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTextComplete(true);
        onReady();
      }
    }, 30);
    return () => clearInterval(interval);
  }, [scene.id, scene.text, onReady]);

  const bgColor = TIME_BG[scene.timeOfDay] ?? "#0d0f14";

  return (
    <div
      className="flex flex-col h-full cursor-pointer select-none"
      style={{ backgroundColor: bgColor }}
      onClick={skipToEnd}
    >
      {/* Character area */}
      <div className="flex-1 flex flex-col items-center justify-end pb-4 relative">
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            BG_CLASSES[scene.timeOfDay]
          } pointer-events-none`}
        />

        {/* Character avatar */}
        {character && character.id !== "narrator" && (
          <div className="mb-4 animate-fade-in">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl"
              style={{
                backgroundColor: character.accentColor + "33",
                border: `2px solid ${character.accentColor}44`,
                color: character.accentColor,
              }}
            >
              {character.avatar}
            </div>
            <p
              className="text-center text-xs mt-2 tracking-widest"
              style={{ color: character.accentColor }}
            >
              {character.name}
            </p>
          </div>
        )}
      </div>

      {/* Dialogue box */}
      <div className="bg-black/70 backdrop-blur-sm border-t border-gray-800 px-5 pt-4 pb-3 min-h-[180px]">
        {/* Character name tag */}
        {character && character.id !== "narrator" && (
          <div
            className="text-xs tracking-widest mb-2"
            style={{ color: character.accentColor }}
          >
            {character.name}
          </div>
        )}
        {scene.type === "monologue" && (
          <div className="text-xs text-gray-600 italic mb-1">独白</div>
        )}
        <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-line">
          {displayedText}
          {!textComplete && (
            <span className="animate-blink text-gray-500">█</span>
          )}
        </p>
        {textComplete && (
          <div className="mt-3 text-right">
            <span className="text-xs text-gray-600 animate-bounce inline-block">
              ▼
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
