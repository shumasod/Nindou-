"use client";
import { useReducer, useEffect, useState } from "react";
import { gameReducer, INITIAL_STATE } from "./reducer";
import { KEYFRAMES_CSS, C } from "./styles";

const SAVE_KEY = "kage_ninden_save";

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    // Basic schema check: must have player and ui keys
    if (!parsed?.player || !parsed?.ui) return INITIAL_STATE;
    return parsed;
  } catch {
    return INITIAL_STATE;
  }
}
import TitleScreen       from "./screens/TitleScreen";
import ClanSelectScreen  from "./screens/ClanSelectScreen";
import NameInputScreen   from "./screens/NameInputScreen";
import HomeScreen        from "./screens/HomeScreen";
import MapScreen         from "./screens/MapScreen";
import QuestDetailScreen from "./screens/QuestDetailScreen";
import BattleScreen      from "./screens/BattleScreen";
import VictoryScreen     from "./screens/VictoryScreen";
import GameOverScreen    from "./screens/GameOverScreen";

export default function KageNinden() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE, loadSave);
  const [savedFlash, setSavedFlash] = useState(false);
  const screen = state.ui.screen;

  // Auto-save on every state change (skip title screen — nothing to save yet)
  useEffect(() => {
    if (screen === "title") return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      setSavedFlash(true);
      const t = setTimeout(() => setSavedFlash(false), 1200);
      return () => clearTimeout(t);
    } catch {
      // ignore quota errors
    }
  }, [state]);

  return (
    <>
      {/* グローバルCSS (keyframes + reset) */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        ${KEYFRAMES_CSS}
      `}</style>

      {/* 自動保存インジケーター */}
      {savedFlash && (
        <div
          style={{
            position: "fixed",
            bottom: "12px",
            right: "14px",
            background: `${C.success}dd`,
            color: "#fff",
            fontSize: "11px",
            padding: "3px 10px",
            borderRadius: "4px",
            fontFamily: "monospace",
            zIndex: 9999,
            animation: "fadeIn 0.3s ease",
            pointerEvents: "none",
          }}
        >
          💾 保存済
        </div>
      )}

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
