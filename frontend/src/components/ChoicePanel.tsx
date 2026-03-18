"use client";

import { useEffect, useState, useCallback } from "react";
import type { Choice, CharacterId } from "@/lib/types";
import { CHARACTERS } from "@/lib/types";
import { useGameStore } from "@/store/gameStore";

interface Props {
  choices: Choice[];
  visible: boolean;
}

export default function ChoicePanel({ choices, visible }: Props) {
  const { makeChoice } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timedChoiceIdx, setTimedChoiceIdx] = useState<number | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);

  // Find timed choice
  const timedChoice = choices.find((c) => c.timed);
  const timedIdx = timedChoice ? choices.indexOf(timedChoice) : -1;

  const executeChoice = useCallback(
    (choice: Choice) => {
      if (chosen) return;
      setChosen(choice.id);

      const unsentPayload =
        choice.unsentMessage && choice.characterEffect
          ? {
              to: choice.characterEffect.characterId,
              toName:
                CHARACTERS[choice.characterEffect.characterId]?.name ?? "",
              text: choice.unsentMessage,
            }
          : choice.unsentMessage
          ? undefined
          : undefined;

      // slight delay for visual feedback
      setTimeout(() => {
        makeChoice(
          choice.next,
          choice.effect,
          choice.characterEffect,
          unsentPayload
        );
      }, 300);
    },
    [chosen, makeChoice]
  );

  // Timer for timed choices
  useEffect(() => {
    if (!visible || !timedChoice || !timedChoice.timed) return;
    const seconds = timedChoice.timerSeconds ?? 8;
    setTimeLeft(seconds);
    setTimedChoiceIdx(timedIdx);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Time expired — trigger default action
          if (timedChoice.onTimerExpire) {
            makeChoice(timedChoice.onTimerExpire, { loneliness: 2 });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, timedChoice, timedIdx, makeChoice]);

  if (!visible) return null;

  return (
    <div className="border-t border-gray-800 bg-black/80 backdrop-blur-sm px-4 py-4 space-y-2.5 animate-slide-up">
      {choices.map((choice, idx) => {
        const isTimed = choice.timed && idx === timedChoiceIdx;
        const isChosen = chosen === choice.id;
        const isDisabled = chosen !== null;

        return (
          <button
            key={choice.id}
            onClick={() => !isDisabled && executeChoice(choice)}
            disabled={isDisabled}
            className={`
              w-full text-left px-4 py-3 border transition-all duration-200
              ${
                isChosen
                  ? "border-gray-400 bg-gray-700/40 text-white"
                  : isDisabled
                  ? "border-gray-800 text-gray-700 opacity-40"
                  : "border-gray-700 text-gray-200 hover:border-gray-400 hover:bg-gray-800/40 active:scale-98"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm leading-snug">{choice.text}</span>
              {isTimed && timeLeft !== null && timeLeft > 0 && (
                <span
                  className={`text-xs ml-3 flex-shrink-0 tabular-nums transition-colors ${
                    timeLeft <= 3 ? "text-red-400" : "text-gray-500"
                  }`}
                >
                  {timeLeft}s
                </span>
              )}
            </div>

            {/* Subtext */}
            {choice.subtext && (
              <p className="text-xs text-gray-600 mt-0.5 italic">
                {choice.subtext}
              </p>
            )}

            {/* Timer bar */}
            {isTimed && timeLeft !== null && (
              <div className="mt-2 h-0.5 bg-gray-800 rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all ${
                    timeLeft <= 3 ? "bg-red-500" : "bg-gray-500"
                  }`}
                  style={{
                    width: `${(timeLeft / (timedChoice?.timerSeconds ?? 8)) * 100}%`,
                    transition: "width 1s linear",
                  }}
                />
              </div>
            )}

            {/* Unsent indicator */}
            {choice.unsentMessage && (
              <p className="text-xs text-gray-700 mt-1">
                ✗ 送信されない
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
