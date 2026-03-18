"use client";

import { useState } from "react";
import type { GameParams, CharacterDistance } from "@/lib/types";
import { CHARACTERS } from "@/lib/types";

interface Props {
  params: GameParams;
  distances: CharacterDistance;
  day: number;
  timeOfDay: string;
}

const PARAM_COLORS: Record<keyof GameParams, string> = {
  empathy: "bg-blue-400",
  ambition: "bg-amber-400",
  loneliness: "bg-purple-400",
  honesty: "bg-green-400",
};

const PARAM_LABELS: Record<keyof GameParams, string> = {
  empathy: "共感力",
  ambition: "野心",
  loneliness: "孤独",
  honesty: "誠実さ",
};

const TIME_LABELS: Record<string, string> = {
  morning: "朝",
  noon: "昼",
  evening: "夕",
  night: "夜",
};

export default function ParameterDisplay({
  params,
  distances,
  day,
  timeOfDay,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Status bar */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <span>
          Day {day} — {TIME_LABELS[timeOfDay] ?? timeOfDay}
        </span>
        <div className="flex items-center gap-2">
          {(Object.keys(params) as Array<keyof GameParams>).map((key) => (
            <div key={key} className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${PARAM_COLORS[key]} opacity-60`}
              />
            </div>
          ))}
          <span className="ml-1">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded view */}
      {open && (
        <div className="px-4 pb-3 animate-fade-in border-t border-gray-800">
          {/* Params */}
          <div className="mt-3 space-y-2">
            {(Object.entries(params) as Array<[keyof GameParams, number]>).map(
              ([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-14 text-right">
                    {PARAM_LABELS[key]}
                  </span>
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${PARAM_COLORS[key]} rounded-full transition-all duration-500`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-6 text-right">
                    {value}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Character distances */}
          <div className="mt-4 space-y-1.5">
            <p className="text-xs text-gray-700 mb-2">— 心の距離 —</p>
            {(["aoi", "mio", "kenji"] as const).map((id) => {
              const char = CHARACTERS[id];
              const dist = distances[id];
              const closeness = 100 - dist;
              return (
                <div key={id} className="flex items-center gap-3">
                  <span
                    className="text-xs w-14 text-right"
                    style={{ color: char.accentColor }}
                  >
                    {char.name.split(" ")[1]}
                  </span>
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${closeness}%`,
                        backgroundColor: char.accentColor,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 w-6 text-right">
                    {dist <= 30
                      ? "近"
                      : dist <= 60
                      ? "普通"
                      : "遠"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
