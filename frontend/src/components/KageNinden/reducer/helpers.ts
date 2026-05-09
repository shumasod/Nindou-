import type { GameState, Player, StatusEffect } from "../types";
import { CLANS, ITEMS, QUESTS, ENEMIES, SKILLS, SKILL_UNLOCK } from "../data";
import {
  calcDamageWithSpeed,
  calcExpToNext,
  decrementStatus,
  getRandom,
  hasStatus,
} from "../utils";

// ===== 定数 =====
export const MAX_LEVEL = 99;

// ===== ログ追記 =====
export function addLog(state: GameState, msg: string): GameState {
  const log = [msg, ...state.battle.log].slice(0, 10);
  return { ...state, battle: { ...state.battle, log } };
}

// ===== ダメージ適用 =====
export function applyPlayerDamage(state: GameState, damage: number): GameState {
  const defending = hasStatus(state.battle.playerStatus, "defending");
  const finalDamage = defending ? Math.floor(damage * 0.5) : damage;
  const newHp = Math.max(0, state.player.hp - finalDamage);
  return { ...state, player: { ...state.player, hp: newHp } };
}

export function applyEnemyDamage(state: GameState, damage: number): GameState {
  if (!state.battle.enemy) return state;
  const newHp = Math.max(0, state.battle.enemy.hp - damage);
  return { ...state, battle: { ...state.battle, enemy: { ...state.battle.enemy, hp: newHp } } };
}

// ===== レベルアップ =====
export function checkLevelUp(state: GameState): GameState {
  let p: Player = { ...state.player };
  let leveledUp = false;

  while (p.exp >= p.expToNext && p.level < MAX_LEVEL) {
    p.exp -= p.expToNext;
    p.level += 1;
    p.expToNext = Math.max(1, calcExpToNext(p.level));
    p.statPoints += 3;
    p.maxHp = Math.floor(p.maxHp * 1.1 + 10);
    p.hp = p.maxHp;
    p.maxChakra = Math.floor(p.maxChakra * 1.05 + 5);
    p.chakra = p.maxChakra;
    leveledUp = true;

    for (const [skillId, cond] of Object.entries(SKILL_UNLOCK)) {
      if (cond.clan === p.clan && cond.level <= p.level && !p.skills.includes(skillId)) {
        p.skills = [...p.skills, skillId];
      }
    }
  }

  return {
    ...state,
    player: p,
    ui: { ...state.ui, levelUpPending: leveledUp || state.ui.levelUpPending },
  };
}

// ===== 敵撃破処理 =====
export function enemyDefeat(state: GameState): GameState {
  const enemy = state.battle.enemy!;
  const quest = state.progress.activeQuest;
  const newProgress = { ...state.progress };
  const newBattle = { ...state.battle };

  const newPlayer = {
    ...state.player,
    exp: state.player.exp + enemy.exp,
    gold: state.player.gold + enemy.gold,
  };

  const killCount = newBattle.killCount + 1;
  newBattle.killCount = killCount;

  let questComplete = false;
  let reward = { exp: 0, gold: 0, items: [] as string[] };

  if (quest && enemy.id === quest.target) {
    const progress = (newProgress.questProgress[quest.id] ?? 0) + 1;
    newProgress.questProgress = { ...newProgress.questProgress, [quest.id]: progress };

    if (progress >= quest.count) {
      questComplete = true;
      newProgress.completedQuests = [...newProgress.completedQuests, quest.id];
      newProgress.activeQuest = null;
      newPlayer.exp += quest.reward.exp;
      newPlayer.gold += quest.reward.gold;

      const itemNames = quest.reward.items.map((ri) => ITEMS[ri.id]?.name ?? ri.id);
      for (const ri of quest.reward.items) {
        const count = ri.count ?? 1;
        const idx = newPlayer.items.findIndex((it) => it.id === ri.id);
        if (idx >= 0) {
          newPlayer.items = newPlayer.items.map((it, i) =>
            i === idx ? { ...it, count: it.count + count } : it
          );
        } else {
          newPlayer.items = [...newPlayer.items, { id: ri.id, count }];
        }
      }
      reward = { exp: quest.reward.exp, gold: quest.reward.gold, items: itemNames };
    }
  }

  for (const drop of enemy.drops) {
    if (Math.random() < drop.rate) {
      const idx = newPlayer.items.findIndex((it) => it.id === drop.id);
      if (idx >= 0) {
        newPlayer.items = newPlayer.items.map((it, i) =>
          i === idx ? { ...it, count: it.count + 1 } : it
        );
      } else {
        newPlayer.items = [...newPlayer.items, { id: drop.id, count: 1 }];
      }
    }
  }

  let nextState: GameState = {
    ...state,
    player: newPlayer,
    progress: newProgress,
    battle: {
      ...newBattle,
      active: !questComplete,
      enemy: questComplete ? null : enemy,
      phase: "player",
    },
    ui: {
      ...state.ui,
      lastReward: questComplete ? reward : state.ui.lastReward,
      screen: questComplete ? "victory" : state.ui.screen,
    },
  };

  nextState = checkLevelUp(nextState);

  if (!questComplete && quest) {
    const enemyTemplate = ENEMIES[quest.target];
    if (enemyTemplate) {
      const newEnemy = { ...enemyTemplate, id: quest.target, maxHp: enemyTemplate.hp, hp: enemyTemplate.hp, phase2: false };
      nextState = {
        ...nextState,
        battle: { ...nextState.battle, enemy: newEnemy, turn: 1, playerStatus: [], enemyStatus: [] },
      };
      nextState = addLog(nextState, `新たな${newEnemy.name}が現れた！`);
    }
  }

  return nextState;
}

// ===== 敵ターン共通処理 (ステータス・チャクラ更新) =====
export function finalizeEnemyTurn(state: GameState): GameState {
  const newPlayerStatus = decrementStatus(state.battle.playerStatus);
  const newEnemyStatus = decrementStatus(state.battle.enemyStatus);
  const newChakra = Math.min(state.player.maxChakra, state.player.chakra + getRandom(3, 7));

  return {
    ...state,
    player: { ...state.player, chakra: newChakra },
    battle: {
      ...state.battle,
      playerStatus: newPlayerStatus,
      enemyStatus: newEnemyStatus,
      turn: state.battle.turn + 1,
      phase: "player",
      playerDodgeChance: newPlayerStatus.some((e) => e.id === "shadow_clone")
        ? state.battle.playerDodgeChance
        : 0,
    },
  };
}
