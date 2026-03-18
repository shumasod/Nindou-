import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GameState,
  GameParams,
  CharacterDistance,
  UnsentMessage,
  TimeOfDay,
  CharacterId,
} from "@/lib/types";
import { getScene, FIRST_SCENE_ID } from "@/lib/scenarios";
import { calculateEnding } from "@/lib/endings";

const INITIAL_PARAMS: GameParams = {
  empathy: 50,
  ambition: 50,
  loneliness: 30,
  honesty: 50,
};

const INITIAL_DISTANCES: CharacterDistance = {
  aoi: 70,   // stranger-ish
  mio: 45,   // close (childhood friend)
  kenji: 80, // stranger
};

const INITIAL_STATE: GameState = {
  params: { ...INITIAL_PARAMS },
  currentSceneId: FIRST_SCENE_ID,
  characterDistances: { ...INITIAL_DISTANCES },
  unsentMessages: [],
  visitedScenes: [],
  day: 1,
  timeOfDay: "night",
  gameStarted: false,
  gameOver: false,
  endingId: undefined,
};

interface GameStore extends GameState {
  // Actions
  startGame: () => void;
  makeChoice: (
    nextSceneId: string,
    paramEffect: Partial<GameParams>,
    characterEffect?: { characterId: CharacterId; distance: number },
    unsentMessage?: { to: CharacterId; toName: string; text: string }
  ) => void;
  resetGame: () => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;

  // Computed helpers
  getParamLabel: (key: keyof GameParams) => string;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function applyParamEffect(
  params: GameParams,
  effect: Partial<GameParams>
): GameParams {
  return {
    empathy: clamp(params.empathy + (effect.empathy ?? 0)),
    ambition: clamp(params.ambition + (effect.ambition ?? 0)),
    loneliness: clamp(params.loneliness + (effect.loneliness ?? 0)),
    honesty: clamp(params.honesty + (effect.honesty ?? 0)),
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      startGame: () => {
        set({ ...INITIAL_STATE, gameStarted: true });
      },

      makeChoice: (nextSceneId, paramEffect, characterEffect, unsentMessage) => {
        const state = get();
        const newParams = applyParamEffect(state.params, paramEffect);
        const newDistances = { ...state.characterDistances };

        if (characterEffect) {
          const { characterId, distance } = characterEffect;
          newDistances[characterId] = clamp(
            newDistances[characterId] + distance
          );
        }

        const newUnsentMessages = [...state.unsentMessages];
        if (unsentMessage) {
          newUnsentMessages.push({
            to: unsentMessage.to,
            toName: unsentMessage.toName,
            text: unsentMessage.text,
            sceneId: state.currentSceneId,
            day: state.day,
          });
        }

        const newVisited = state.visitedScenes.includes(state.currentSceneId)
          ? state.visitedScenes
          : [...state.visitedScenes, state.currentSceneId];

        // Handle ending
        if (nextSceneId === "__ending__") {
          const endingId = calculateEnding({
            ...state,
            params: newParams,
            characterDistances: newDistances,
            visitedScenes: newVisited,
          });
          set({
            params: newParams,
            characterDistances: newDistances,
            unsentMessages: newUnsentMessages,
            visitedScenes: newVisited,
            gameOver: true,
            endingId,
          });
          return;
        }

        const nextScene = getScene(nextSceneId);
        set({
          params: newParams,
          characterDistances: newDistances,
          unsentMessages: newUnsentMessages,
          visitedScenes: newVisited,
          currentSceneId: nextSceneId,
          day: nextScene?.day ?? state.day,
          timeOfDay: nextScene?.timeOfDay ?? state.timeOfDay,
        });
      },

      resetGame: () => {
        set({ ...INITIAL_STATE });
      },

      saveGame: async () => {
        const state = get();
        try {
          await fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              params: state.params,
              currentSceneId: state.currentSceneId,
              characterDistances: state.characterDistances,
              unsentMessages: state.unsentMessages,
              visitedScenes: state.visitedScenes,
              day: state.day,
              timeOfDay: state.timeOfDay,
              gameOver: state.gameOver,
              endingId: state.endingId,
            }),
          });
        } catch {
          // Silently fail — game is also persisted in localStorage
        }
      },

      loadGame: async () => {
        try {
          const res = await fetch("/api/load");
          if (!res.ok) return false;
          const data = await res.json();
          if (data?.currentSceneId) {
            set({ ...data, gameStarted: true });
            return true;
          }
        } catch {
          return false;
        }
        return false;
      },

      getParamLabel: (key) => {
        const labels: Record<keyof GameParams, string> = {
          empathy: "共感力",
          ambition: "野心",
          loneliness: "孤独",
          honesty: "誠実さ",
        };
        return labels[key];
      },
    }),
    {
      name: "nindou-game-save",
      partialize: (state) => ({
        params: state.params,
        currentSceneId: state.currentSceneId,
        characterDistances: state.characterDistances,
        unsentMessages: state.unsentMessages,
        visitedScenes: state.visitedScenes,
        day: state.day,
        timeOfDay: state.timeOfDay,
        gameStarted: state.gameStarted,
        gameOver: state.gameOver,
        endingId: state.endingId,
      }),
    }
  )
);
