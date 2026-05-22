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
import { getScene, FIRST_SCENE_ID, SCENES } from "@/lib/scenarios";
import { calculateEnding } from "@/lib/endings";

const VALID_TIME_OF_DAY = new Set(["morning", "noon", "evening", "night"]);
const VALID_CHAR_IDS = new Set(["aoi", "mio", "kenji"]);

function isValidParam(v: unknown): boolean {
  return typeof v === "number" && isFinite(v) && v >= 0 && v <= 100;
}

function isValidUnsentMessage(m: unknown): boolean {
  if (!m || typeof m !== "object") return false;
  const o = m as Record<string, unknown>;
  return (
    typeof o.to === "string" &&
    typeof o.toName === "string" &&
    typeof o.text === "string" &&
    o.text.length <= 2000 &&
    typeof o.sceneId === "string" &&
    typeof o.day === "number"
  );
}

function isValidLoadedState(data: unknown): data is Partial<GameState> {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  // currentSceneId: must exist in SCENES or be the ending sentinel
  if (typeof d.currentSceneId !== "string") return false;
  const validScene =
    Object.prototype.hasOwnProperty.call(SCENES, d.currentSceneId) ||
    d.currentSceneId === "__ending__";
  if (!validScene) return false;

  // day: 1-20 (story has 20 days max)
  if (d.day !== undefined && (typeof d.day !== "number" || !isFinite(d.day) || d.day < 1 || d.day > 20)) return false;

  // timeOfDay: must be one of the valid values
  if (d.timeOfDay !== undefined && !VALID_TIME_OF_DAY.has(d.timeOfDay as string)) return false;

  // params: all four fields required and in 0-100 range
  if (d.params !== undefined) {
    const p = d.params as Record<string, unknown>;
    if (!isValidParam(p.empathy) || !isValidParam(p.ambition) ||
        !isValidParam(p.loneliness) || !isValidParam(p.honesty)) return false;
  }

  // characterDistances: all three chars required if present
  if (d.characterDistances !== undefined) {
    const cd = d.characterDistances as Record<string, unknown>;
    for (const key of ["aoi", "mio", "kenji"] as const) {
      if (!isValidParam(cd[key])) return false;
    }
  }

  // unsentMessages: array of valid message objects
  if (d.unsentMessages !== undefined) {
    if (!Array.isArray(d.unsentMessages)) return false;
    if (d.unsentMessages.length > 100) return false;
    if (!d.unsentMessages.every(isValidUnsentMessage)) return false;
  }

  // visitedScenes: array of strings
  if (d.visitedScenes !== undefined) {
    if (!Array.isArray(d.visitedScenes)) return false;
    if (!d.visitedScenes.every((s) => typeof s === "string")) return false;
  }

  return true;
}

const INITIAL_PARAMS: GameParams = {
  empathy: 50,
  ambition: 50,
  loneliness: 30,
  honesty: 50,
};

const INITIAL_DISTANCES: CharacterDistance = {
  aoi: 70,    // 都市に染まった女性。まだ遠い
  mio: 45,    // 幼馴染。最初から近い
  kenji: 80,  // 先輩同僚。ドライで距離がある
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
          if (characterId !== "narrator" && characterId in newDistances) {
            const key = characterId as keyof typeof newDistances;
            newDistances[key] = clamp(newDistances[key] + distance);
          }
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
          const data: unknown = await res.json();
          if (!isValidLoadedState(data)) return false;
          set({ ...data, gameStarted: true });
          return true;
        } catch {
          return false;
        }
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
