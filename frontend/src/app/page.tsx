"use client";

import { useGameStore } from "@/store/gameStore";
import TitleScreen from "@/components/TitleScreen";
import GameScreen from "@/components/GameScreen";

export default function Home() {
  const { gameStarted } = useGameStore();

  if (!gameStarted) {
    return <TitleScreen />;
  }

  return <GameScreen />;
}
