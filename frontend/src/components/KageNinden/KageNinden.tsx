"use client";
import { useReducer } from "react";
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

export default function KageNinden() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const screen = state.ui.screen;

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
