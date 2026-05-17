export interface GameParams {
  empathy: number;    // 共感力 0-100
  ambition: number;   // 野心   0-100
  loneliness: number; // 孤独   0-100
  honesty: number;    // 誠実さ 0-100
}

export type TimeOfDay = "morning" | "noon" | "evening" | "night";
export type SceneType = "novel" | "message" | "monologue";

// 設計書に定義された3キャラクター + narrator
export type CharacterId = "aoi" | "mio" | "kenji" | "narrator";

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  color: string;        // tailwind bg color class
  textColor: string;    // tailwind text color class
  accentColor: string;  // hex for dynamic styles
  avatar: string;       // initial character
  description: string;
}

export interface ParamEffect {
  empathy?: number;
  ambition?: number;
  loneliness?: number;
  honesty?: number;
}

export interface Choice {
  id: string;
  text: string;
  subtext?: string;
  effect: ParamEffect;
  characterEffect?: {
    characterId: CharacterId;
    distance: number;   // negative = closer, positive = farther
  };
  next: string;
  unsentMessage?: string;  // message written but not sent
  unsentTo?: CharacterId;  // recipient when no characterEffect
  timed?: boolean;
  timerSeconds?: number;
  onTimerExpire?: string;  // scene id on timeout
  condition?: {            // show only if condition met
    param: keyof GameParams;
    min?: number;
    max?: number;
  };
}

export interface Scene {
  id: string;
  type: SceneType;
  characterId?: CharacterId;
  text: string;
  subtext?: string;
  timeOfDay: TimeOfDay;
  day: number;
  choices: Choice[];
  autoNext?: string;
  autoNextDelay?: number;
}

export interface CharacterDistance {
  aoi: number;    // 0=intimate, 100=stranger
  mio: number;
  kenji: number;
}

export interface UnsentMessage {
  to: CharacterId;
  toName: string;
  text: string;
  sceneId: string;
  day: number;
}

export interface GameState {
  params: GameParams;
  currentSceneId: string;
  characterDistances: CharacterDistance;
  unsentMessages: UnsentMessage[];
  visitedScenes: string[];
  day: number;
  timeOfDay: TimeOfDay;
  gameStarted: boolean;
  gameOver: boolean;
  endingId?: string;
}

export interface Ending {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  epilogue: string;
  bgColor: string;
  textColor: string;
}

export const CHARACTERS: Record<CharacterId, CharacterInfo> = {
  aoi: {
    id: "aoi",
    name: "蒼井 葵",
    color: "bg-cyan-900",
    textColor: "text-cyan-200",
    accentColor: "#0e7490",
    avatar: "葵",
    description: "27歳。広告会社勤務。都市に染まった女性。深く関わるとプレイヤーの価値観を揺さぶる。",
  },
  mio: {
    id: "mio",
    name: "三浦 美緒",
    color: "bg-rose-900",
    textColor: "text-rose-200",
    accentColor: "#e11d48",
    avatar: "美",
    description: "24歳。地元で働く幼馴染。安定志向。プレイヤーの「原点」を象徴する。",
  },
  kenji: {
    id: "kenji",
    name: "田中 健二",
    color: "bg-slate-700",
    textColor: "text-slate-200",
    accentColor: "#475569",
    avatar: "健",
    description: "30歳。先輩同僚。ドライで現実的。プレイヤーの成長を促す。",
  },
  narrator: {
    id: "narrator",
    name: "",
    color: "bg-transparent",
    textColor: "text-gray-300",
    accentColor: "#9ca3af",
    avatar: "",
    description: "",
  },
};
