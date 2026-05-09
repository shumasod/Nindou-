export interface GameParams {
  empathy: number;    // 共感力 0-100
  ambition: number;   // 野心   0-100
  loneliness: number; // 孤独   0-100
  honesty: number;    // 誠実さ 0-100
}

export type TimeOfDay = "morning" | "noon" | "evening" | "night";
export type SceneType = "novel" | "message" | "monologue";
export type CharacterId = "aoi" | "mio" | "kenji" | "narrator" | "rin" | "daichi" | "saki";

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  color: string;        // tailwind bg color class
  textColor: string;    // tailwind text color class
  accentColor: string;  // hex for dynamic styles
  avatar: string;       // emoji or initial
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
  subtext?: string;           // small descriptive text
  effect: ParamEffect;
  characterEffect?: {
    characterId: CharacterId;
    distance: number;         // negative = closer
  };
  next: string;
  unsentMessage?: string;     // message logged but not sent
  unsentTo?: CharacterId;     // recipient when no characterEffect is present
  timed?: boolean;            // if true, shows countdown
  timerSeconds?: number;
  onTimerExpire?: string;     // scene id if timer expires
  condition?: {               // only show if condition met
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
  subtext?: string;           // additional narrative text
  timeOfDay: TimeOfDay;
  day: number;
  choices: Choice[];
  autoNext?: string;          // auto-advance to this scene (no choices)
  autoNextDelay?: number;     // ms to wait before auto-advance
}

export interface CharacterDistance {
  aoi: number;    // 0=intimate, 100=stranger
  mio: number;
  kenji: number;
  [key: string]: number;
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
  lastChoice?: string;
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
    description: "27歳。広告会社勤務。都会的でクール。",
  },
  mio: {
    id: "mio",
    name: "三浦 美緒",
    color: "bg-rose-900",
    textColor: "text-rose-200",
    accentColor: "#e11d48",
    avatar: "美",
    description: "24歳。地元で働く幼馴染。",
  },
  kenji: {
    id: "kenji",
    name: "田中 健二",
    color: "bg-slate-700",
    textColor: "text-slate-200",
    accentColor: "#475569",
    avatar: "健",
    description: "30歳。先輩同僚。現実的でドライ。",
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
  rin: {
    id: "rin",
    name: "橘 凛",
    color: "bg-violet-900",
    textColor: "text-violet-200",
    accentColor: "#7c3aed",
    avatar: "凛",
    description: "31歳。デザイン部所属の先輩。鋭く、繊細。",
  },
  daichi: {
    id: "daichi",
    name: "松本 大地",
    color: "bg-teal-900",
    textColor: "text-teal-200",
    accentColor: "#0d9488",
    avatar: "大",
    description: "26歳。近所のバーの常連。東北出身、上京3年目。",
  },
  saki: {
    id: "saki",
    name: "安藤 沙希",
    color: "bg-orange-900",
    textColor: "text-orange-200",
    accentColor: "#ea580c",
    avatar: "沙",
    description: "24歳。同期入社。明るく積極的だが、繊細な一面も。",
  },
};
