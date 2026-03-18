"use client";

import { useGameStore } from "@/store/gameStore";
import { useState } from "react";

export default function TitleScreen() {
  const { startGame, loadGame } = useGameStore();
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    setLoading(true);
    const loaded = await loadGame();
    if (!loaded) {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0f14] text-white px-6">
      {/* Title */}
      <div className="text-center mb-16 animate-fade-in">
        <p className="text-xs tracking-[0.4em] text-gray-500 uppercase mb-4">
          Romance RPG
        </p>
        <h1 className="text-5xl font-thin tracking-widest mb-3 text-white">
          忍道
        </h1>
        <p className="text-sm text-gray-500 tracking-widest">Nindou</p>
        <div className="mt-6 h-px w-16 bg-gray-700 mx-auto" />
        <p className="mt-6 text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
          東京に来たことで、
          <br />
          人は変わるのか。
        </p>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-4 w-full max-w-[200px] animate-slide-up">
        <button
          onClick={startGame}
          className="py-3 text-sm tracking-widest text-gray-200 border border-gray-700 hover:border-gray-400 hover:text-white transition-all duration-300 bg-transparent"
        >
          はじめから
        </button>
        <button
          onClick={handleLoad}
          disabled={loading}
          className="py-3 text-sm tracking-widest text-gray-500 border border-gray-800 hover:border-gray-600 hover:text-gray-300 transition-all duration-300 disabled:opacity-30"
        >
          {loading ? "読み込み中..." : "つづきから"}
        </button>
      </div>

      {/* Characters hint */}
      <div className="mt-20 flex gap-8 text-xs text-gray-700 animate-fade-in">
        <span>蒼井 葵</span>
        <span>三浦 美緒</span>
        <span>田中 健二</span>
      </div>

      <p className="absolute bottom-6 text-xs text-gray-800">
        © 2024 Nindou — A story of Tokyo and loneliness
      </p>
    </div>
  );
}
