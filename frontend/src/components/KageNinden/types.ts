// ===== 型定義 =====

export type ClanId = "force" | "illusion" | "speed";
export type ScreenId =
  | "title"
  | "clan_select"
  | "name_input"
  | "home"
  | "map"
  | "quest_detail"
  | "battle"
  | "skills"
  | "items"
  | "train"
  | "shop"
  | "victory"
  | "gameover";

export type AiPattern = "aggressive" | "balanced" | "debuffer" | "tank" | "speed" | "boss";
export type SkillType = "damage" | "buff" | "debuff" | "dodge" | "escape" | "stun" | "heal";
export type ItemType = "heal" | "chakra" | "cure" | "escape";

export interface StatusEffect {
  id: string;
  name: string;
  turns: number;
  value?: number;
}

export interface PlayerStats {
  attack: number;
  defense: number;
  speed: number;
  stealth: number;
}

export interface Equipment {
  weapon: string;
  armor: string;
}

export interface ItemStack {
  id: string;
  count: number;
}

export interface Player {
  name: string;
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  chakra: number;
  maxChakra: number;
  stats: PlayerStats;
  statPoints: number;
  skills: string[];
  equip: Equipment;
  items: ItemStack[];
  gold: number;
  clan: ClanId | null;
}

export interface Enemy {
  id: string;
  name: string;
  icon: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  gold: number;
  ai: AiPattern;
  skills: string[];
  drops: { id: string; rate: number }[];
  phase2Threshold?: number;
  phase2?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  rank: "D" | "C" | "B" | "A" | "S";
  area: string;
  desc: string;
  type: "kill";
  target: string;
  count: number;
  reward: { exp: number; gold: number; items: { id: string; count?: number }[] };
  minLevel: number;
  progress?: number;
}

export interface Skill {
  name: string;
  cost: number;
  type: SkillType;
  desc: string;
  multiplier?: number;
  clan: ClanId;
  effect?: Record<string, unknown>;
}

export interface Item {
  name: string;
  type: ItemType;
  value?: number;
  icon: string;
  desc: string;
}

export interface ClanData {
  name: string;
  icon: string;
  desc: string;
  bonus: Partial<{ maxHp: number; maxChakra: number; attack: number; defense: number; speed: number; stealth: number }>;
  starterSkill: string;
  color: string;
}

export interface BattleState {
  active: boolean;
  enemy: Enemy | null;
  turn: number;
  log: string[];
  playerStatus: StatusEffect[];
  enemyStatus: StatusEffect[];
  playerDodge: number;
  playerDodgeChance: number;
  phase: "player" | "enemy" | "animating";
  questId: string | null;
  killCount: number;
}

export interface GameState {
  player: Player;
  progress: {
    currentArea: string;
    completedQuests: string[];
    activeQuest: Quest | null;
    unlockedAreas: string[];
    questProgress: Record<string, number>;
  };
  battle: BattleState;
  ui: {
    screen: ScreenId;
    message: string;
    levelUpPending: boolean;
    lastReward: { exp: number; gold: number; items: string[] } | null;
  };
}
