"use client";
import { useReducer, useEffect } from "react";
import { gameReducer, INITIAL_STATE } from "./reducer";
import { KEYFRAMES_CSS } from "./styles";
import TitleScreen       from "./screens/TitleScreen";
import ClanSelectScreen  from "./screens/ClanSelectScreen";
import NameInputScreen   from "./screens/NameInputScreen";
import HomeScreen        from "./screens/HomeScreen";
import MapScreen         from "./screens/MapScreen";
import QuestDetailScreen from "./screens/QuestDetailScreen";
import BattleScreen      from "./screens/BattleScreen";
import VictoryScreen     from "./screens/VictoryScreen";
import GameOverScreen    from "./screens/GameOverScreen";
import type { GameState } from "./types";

const SAVE_KEY = "kage_ninden_save";

function loadSave(): GameState {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SAVE_KEY) : null;
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    // 不完全なセーブデータはINITIAL_STATEで補完
    return { ...INITIAL_STATE, ...parsed, battle: INITIAL_STATE.battle, ui: INITIAL_STATE.ui };
  } catch {
    return INITIAL_STATE;
  }
}

export default function KageNinden() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadSave);
  const screen = state.ui.screen;

  // 画面遷移のたびにセーブ（バトル中・タイトルは除く）
  useEffect(() => {
    if (screen === "battle" || screen === "title" || screen === "clan_select" || screen === "name_input") return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      // localStorage が使えない環境では無視
    }
  }, [screen, state]);

  return (
    <>
      {/* グローバルCSS (keyframes + reset) */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        ${KEYFRAMES_CSS}
      `}</style>

      {screen === "title"        && <TitleScreen dispatch={dispatch} />}
      {screen === "clan_select"  && <ClanSelectScreen dispatch={dispatch} />}
      {screen === "name_input"   && state.player.clan && (
        <NameInputScreen clan={state.player.clan} dispatch={dispatch} />
      )}
      {screen === "home"         && <HomeScreen state={state} dispatch={dispatch} />}
      {screen === "map"          && <MapScreen state={state} dispatch={dispatch} />}
      {screen === "quest_detail" && <QuestDetailScreen state={state} dispatch={dispatch} />}
      {screen === "battle"       && <BattleScreen state={state} dispatch={dispatch} />}
      {screen === "victory"      && <VictoryScreen state={state} dispatch={dispatch} />}
      {screen === "gameover"     && <GameOverScreen state={state} dispatch={dispatch} />}
    </>
  );
}
