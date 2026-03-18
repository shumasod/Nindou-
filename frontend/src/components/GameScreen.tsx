"use client";

import { useState, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import { getScene } from "@/lib/scenarios";
import NovelView from "./NovelView";
import MessageView from "./MessageView";
import ChoicePanel from "./ChoicePanel";
import ParameterDisplay from "./ParameterDisplay";
import EndingScreen from "./EndingScreen";

export default function GameScreen() {
  const {
    currentSceneId,
    params,
    characterDistances,
    day,
    timeOfDay,
    gameOver,
    saveGame,
  } = useGameStore();

  const [choicesVisible, setChoicesVisible] = useState(false);

  const scene = getScene(currentSceneId);

  const handleTextReady = useCallback(() => {
    setChoicesVisible(true);
  }, []);

  // Reset choices when scene changes
  useState(() => {
    setChoicesVisible(false);
  });

  if (gameOver) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-full max-w-sm h-screen overflow-y-auto">
          <EndingScreen />
        </div>
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d0f14] text-gray-600 text-sm">
        シーンが見つかりません: {currentSceneId}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      {/* Phone frame */}
      <div className="relative w-full max-w-sm h-screen flex flex-col bg-[#0d0f14] shadow-2xl overflow-hidden">
        {/* Status bar */}
        <div className="flex-shrink-0 bg-black/60 backdrop-blur-sm border-b border-gray-900">
          <ParameterDisplay
            params={params}
            distances={characterDistances}
            day={day}
            timeOfDay={timeOfDay}
          />
        </div>

        {/* Scene content */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          key={currentSceneId}
        >
          {scene.type === "message" ? (
            <MessageView scene={scene} onReady={handleTextReady} />
          ) : (
            <NovelView scene={scene} onReady={handleTextReady} />
          )}

          {/* Choices */}
          <ChoicePanel choices={scene.choices} visible={choicesVisible} />
        </div>

        {/* Save button */}
        <button
          onClick={saveGame}
          className="absolute top-2 right-2 text-xs text-gray-700 hover:text-gray-400 transition-colors px-2 py-1 z-10"
        >
          保存
        </button>
      </div>
    </div>
  );
}
