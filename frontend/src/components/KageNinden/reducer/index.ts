import type { GameState, Player, ClanId } from "../types";

// Re-export types so existing "from './reducer'" imports keep working
export type { GameState } from "../types";
import { handleSelectClan, handleSetName, handleAllocateStat } from "./playerActions";
import {
  handleStartQuest,
  handleStartBattle,
  handlePlayerAttack,
  handlePlayerSkill,
  handlePlayerItem,
  handlePlayerDefend,
  handlePlayerEscape,
  handleEnemyTurn,
} from "./questBattleActions";

// ===== 初期プレイヤー =====
export const INITIAL_PLAYER: Player = {
  name: "",
  level: 1,
  exp: 0,
  expToNext: 100,
  hp: 100,
  maxHp: 100,
  chakra: 50,
  maxChakra: 50,
  stats: { attack: 15, defense: 10, speed: 12, stealth: 8 },
  statPoints: 0,
  skills: [],
  equip: { weapon: "kunai_basic", armor: "cloth_basic" },
  items: [
    { id: "heal_scroll", count: 3 },
    { id: "chakra_pill", count: 2 },
  ],
  gold: 150,
  clan: null,
};

export const INITIAL_STATE: GameState = {
  player: { ...INITIAL_PLAYER },
  progress: {
    currentArea: "forest",
    completedQuests: [],
    activeQuest: null,
    unlockedAreas: ["forest"],
    questProgress: {},
  },
  battle: {
    active: false,
    enemy: null,
    turn: 1,
    log: [],
    playerStatus: [],
    enemyStatus: [],
    playerDodge: 0,
    playerDodgeChance: 0,
    phase: "player",
    questId: null,
    killCount: 0,
  },
  ui: {
    screen: "title",
    message: "",
    levelUpPending: false,
    lastReward: null,
  },
};

// ===== アクション型 =====
export type GameAction =
  | { type: "GO_TO_SCREEN"; screen: GameState["ui"]["screen"] }
  | { type: "SELECT_CLAN"; clan: ClanId }
  | { type: "SET_NAME"; name: string }
  | { type: "START_QUEST"; questId: string }
  | { type: "START_BATTLE"; enemyId: string; questId?: string }
  | { type: "PLAYER_ATTACK" }
  | { type: "PLAYER_SKILL"; skillId: string }
  | { type: "PLAYER_ITEM"; itemId: string }
  | { type: "PLAYER_DEFEND" }
  | { type: "PLAYER_ESCAPE" }
  | { type: "ENEMY_TURN" }
  | { type: "ALLOCATE_STAT"; stat: keyof Player["stats"] }
  | { type: "REST_AT_INN" }
  | { type: "RESET_GAME" };

// ===== メインReducer =====
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "RESET_GAME":
      return { ...INITIAL_STATE };

    case "GO_TO_SCREEN":
      return { ...state, ui: { ...state.ui, screen: action.screen, levelUpPending: false } };

    case "SELECT_CLAN":
      return handleSelectClan(state, action.clan);

    case "SET_NAME":
      return handleSetName(state, action.name);

    case "START_QUEST":
      return handleStartQuest(state, action.questId);

    case "START_BATTLE":
      return handleStartBattle(state, action.enemyId, action.questId);

    case "PLAYER_ATTACK":
      return handlePlayerAttack(state);

    case "PLAYER_SKILL":
      return handlePlayerSkill(state, action.skillId);

    case "PLAYER_ITEM":
      return handlePlayerItem(state, action.itemId);

    case "PLAYER_DEFEND":
      return handlePlayerDefend(state);

    case "PLAYER_ESCAPE":
      return handlePlayerEscape(state);

    case "ENEMY_TURN":
      return handleEnemyTurn(state);

    case "ALLOCATE_STAT":
      return handleAllocateStat(state, action.stat);

    case "REST_AT_INN": {
      const cost = Math.max(10, Math.floor((state.player.maxHp - state.player.hp) * 0.5 + (state.player.maxChakra - state.player.chakra) * 0.3));
      if (state.player.gold < cost) return state;
      return {
        ...state,
        player: {
          ...state.player,
          hp: state.player.maxHp,
          chakra: state.player.maxChakra,
          gold: state.player.gold - cost,
        },
      };
    }

    default:
      return state;
  }
}
