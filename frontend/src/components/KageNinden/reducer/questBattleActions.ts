import type { GameState, StatusEffect } from "../types";
import { ENEMIES, QUESTS, SKILLS, ITEMS } from "../data";
import { calcDamageWithSpeed, calcEscapeRate, getRandom, hasStatus } from "../utils";
import { addLog, applyEnemyDamage, applyPlayerDamage, enemyDefeat, finalizeEnemyTurn } from "./helpers";
import { enemyAction } from "../utils";

// START_QUEST
export function handleStartQuest(state: GameState, questId: string): GameState {
  const quest = QUESTS.find((q) => q.id === questId);
  if (!quest) return state;
  return {
    ...state,
    progress: { ...state.progress, activeQuest: { ...quest, progress: 0 } },
    ui: { ...state.ui, screen: "quest_detail" },
  };
}

// START_BATTLE
export function handleStartBattle(
  state: GameState,
  enemyId: string,
  questId?: string
): GameState {
  const template = ENEMIES[enemyId];
  if (!template) return state;

  const enemy = { ...template, id: enemyId, maxHp: template.hp, hp: template.hp, phase2: false };
  const ambushRate = state.player.stats.stealth / (state.player.stats.stealth + 20);
  const isAmbush = Math.random() < ambushRate;
  const initialLog = isAmbush
    ? [`【奇襲成功！】${enemy.name}の不意を突いた！`]
    : [`${enemy.name}が現れた！`];

  return {
    ...state,
    battle: {
      active: true,
      enemy,
      turn: 1,
      log: initialLog,
      playerStatus: [],
      enemyStatus: isAmbush ? [{ id: "stun", name: "スタン", turns: 1 }] : [],
      playerDodge: 0,
      playerDodgeChance: 0,
      phase: "player",
      questId: questId ?? null,
      killCount: 0,
    },
    ui: { ...state.ui, screen: "battle" },
  };
}

// PLAYER_ATTACK
export function handlePlayerAttack(state: GameState): GameState {
  if (state.battle.phase !== "player" || !state.battle.enemy) return state;

  const { stats } = state.player;
  const { damage, isCritical } = calcDamageWithSpeed(
    stats.attack,
    state.battle.enemy.defense,
    stats.speed
  );

  let s = applyEnemyDamage(state, damage);
  s = addLog(s, `${state.player.name}の攻撃！ ${damage}ダメージ！${isCritical ? " 【CRITICAL!!】" : ""}`);

  if (s.battle.enemy!.hp <= 0) {
    s = addLog(s, `${s.battle.enemy!.name}を倒した！ EXP+${s.battle.enemy!.exp} G+${s.battle.enemy!.gold}`);
    s = enemyDefeat(s);
    if (s.ui.screen === "battle") {
      s = { ...s, battle: { ...s.battle, phase: "player" } };
    }
    return s;
  }

  return { ...s, battle: { ...s.battle, phase: "enemy" } };
}

// PLAYER_SKILL
export function handlePlayerSkill(state: GameState, skillId: string): GameState {
  if (state.battle.phase !== "player" || !state.battle.enemy) return state;

  const skill = SKILLS[skillId];
  if (!skill || state.player.chakra < skill.cost) return state;

  let s = { ...state, player: { ...state.player, chakra: state.player.chakra - skill.cost } };

  switch (skill.type) {
    case "damage": {
      const { damage, isCritical } = calcDamageWithSpeed(
        s.player.stats.attack,
        s.battle.enemy!.defense,
        s.player.stats.speed,
        skill.multiplier ?? 1
      );
      s = applyEnemyDamage(s, damage);
      s = addLog(s, `${skill.name}！ ${damage}ダメージ！${isCritical ? " 【CRITICAL!!】" : ""}`);

      if (s.battle.enemy!.hp <= 0) {
        s = addLog(s, `${s.battle.enemy!.name}を倒した！ EXP+${s.battle.enemy!.exp} G+${s.battle.enemy!.gold}`);
        s = enemyDefeat(s);
        if (s.ui.screen === "battle") {
          s = { ...s, battle: { ...s.battle, phase: "player" } };
        }
        return s;
      }
      break;
    }
    case "buff": {
      const eff = skill.effect as { stat: string; mult: number; turns: number };
      const statusId = eff.stat === "defense" ? "defense_up" : eff.stat === "speed" ? "speed_up" : "attack_up";
      const newStatus: StatusEffect = { id: statusId, name: skill.name, turns: eff.turns };
      s = { ...s, battle: { ...s.battle, playerStatus: [...s.battle.playerStatus, newStatus] } };
      s = addLog(s, `${skill.name}！ ${eff.turns}ターン間ステータスが上昇！`);
      break;
    }
    case "debuff": {
      const newStatus: StatusEffect = { id: "confusion", name: "幻惑", turns: 3 };
      s = { ...s, battle: { ...s.battle, enemyStatus: [...s.battle.enemyStatus, newStatus] } };
      s = addLog(s, `${skill.name}！ 敵に幻惑をかけた！`);
      break;
    }
    case "dodge": {
      const eff = skill.effect as Record<string, number>;
      if (eff.dodge) {
        s = { ...s, battle: { ...s.battle, playerDodge: eff.dodge } };
        s = addLog(s, `${skill.name}！ 次の攻撃を無効化する！`);
      } else if (eff.dodgeChance) {
        const newStatus: StatusEffect = { id: "shadow_clone", name: "影分身", turns: eff.turns ?? 3, value: eff.dodgeChance };
        s = { ...s, battle: { ...s.battle, playerStatus: [...s.battle.playerStatus, newStatus], playerDodgeChance: eff.dodgeChance } };
        s = addLog(s, `${skill.name}！ ${eff.turns}ターン間50%の確率で回避！`);
      }
      break;
    }
    case "stun": {
      const eff = skill.effect as { stun: number };
      const stunStatus: StatusEffect = { id: "stun", name: "スタン", turns: eff.stun };
      s = { ...s, battle: { ...s.battle, enemyStatus: [...s.battle.enemyStatus, stunStatus] } };
      s = addLog(s, `${skill.name}！ 敵を${eff.stun}ターン行動不能にした！`);
      break;
    }
    case "escape":
      s = addLog(s, `${skill.name}！ 煙幕を張って離脱した！`);
      return { ...s, battle: { ...s.battle, active: false }, ui: { ...s.ui, screen: "home" } };
  }

  return { ...s, battle: { ...s.battle, phase: "enemy" } };
}

// PLAYER_ITEM
export function handlePlayerItem(state: GameState, itemId: string): GameState {
  if (state.battle.phase !== "player") return state;

  const item = ITEMS[itemId];
  if (!item) return state;

  const itemStack = state.player.items.find((i) => i.id === itemId);
  if (!itemStack || itemStack.count <= 0) return state;

  let s = {
    ...state,
    player: {
      ...state.player,
      items: state.player.items
        .map((it) => it.id === itemId ? { ...it, count: it.count - 1 } : it)
        .filter((it) => it.count > 0),
    },
  };

  switch (item.type) {
    case "heal": {
      const newHp = Math.min(s.player.maxHp, s.player.hp + (item.value ?? 40));
      s = { ...s, player: { ...s.player, hp: newHp } };
      s = addLog(s, `${item.name}を使用！ HPが${item.value}回復した。`);
      break;
    }
    case "chakra": {
      const newCk = Math.min(s.player.maxChakra, s.player.chakra + (item.value ?? 25));
      s = { ...s, player: { ...s.player, chakra: newCk } };
      s = addLog(s, `${item.name}を使用！ チャクラが${item.value}回復した。`);
      break;
    }
    case "cure": {
      const newStatus = s.battle.playerStatus.filter(
        (e) => e.id !== "poison" && e.id !== "paralyze"
      );
      s = { ...s, battle: { ...s.battle, playerStatus: newStatus } };
      s = addLog(s, `${item.name}を使用！ 状態異常が解除された。`);
      break;
    }
    case "escape":
      s = addLog(s, `${item.name}を使用！ 煙幕の中に消えた...`);
      return { ...s, battle: { ...s.battle, active: false }, ui: { ...s.ui, screen: "home" } };
  }

  return { ...s, battle: { ...s.battle, phase: "enemy" } };
}

// PLAYER_DEFEND
export function handlePlayerDefend(state: GameState): GameState {
  if (state.battle.phase !== "player") return state;

  const defStatus: StatusEffect = { id: "defending", name: "防御", turns: 1 };
  const newStatus = [...state.battle.playerStatus.filter((e) => e.id !== "defending"), defStatus];
  const newChakra = Math.min(state.player.maxChakra, state.player.chakra + 8);

  let s: GameState = {
    ...state,
    player: { ...state.player, chakra: newChakra },
    battle: { ...state.battle, playerStatus: newStatus, phase: "enemy" },
  };
  s = addLog(s, `${state.player.name}は防御態勢をとった。チャクラが少し回復した。`);
  return s;
}

// PLAYER_ESCAPE
export function handlePlayerEscape(state: GameState): GameState {
  if (state.battle.phase !== "player" || !state.battle.enemy) return state;

  const rate = calcEscapeRate(state.player.stats.speed, state.battle.enemy.speed);
  if (Math.random() < rate) {
    const s = addLog(state, "逃走に成功した...");
    return { ...s, battle: { ...s.battle, active: false }, ui: { ...s.ui, screen: "home" } };
  }
  const s = addLog(state, "逃走に失敗した！");
  return { ...s, battle: { ...s.battle, phase: "enemy" } };
}

// ENEMY_TURN
export function handleEnemyTurn(state: GameState): GameState {
  if (state.battle.phase !== "enemy" || !state.battle.enemy) return state;

  const enemy = state.battle.enemy;
  const action = enemyAction(enemy, state.battle.enemyStatus, state.battle.turn);
  let s = state;

  if (hasStatus(s.battle.playerStatus, "poison")) {
    const poisonDmg = getRandom(3, 8);
    s = applyPlayerDamage(s, poisonDmg);
    s = addLog(s, `毒のダメージ！ ${poisonDmg}ダメージ。`);
    if (s.player.hp <= 0) {
      return { ...s, battle: { ...s.battle, active: false }, ui: { ...s.ui, screen: "gameover" } };
    }
  }

  switch (action.type) {
    case "stun":
      s = addLog(s, `${enemy.name}は行動不能だ！`);
      break;

    case "defend":
      s = addLog(s, `${enemy.name}は防御態勢をとった。`);
      break;

    case "escape":
      s = addLog(s, `${enemy.name}は逃げ出した！`);
      return { ...s, battle: { ...s.battle, active: false }, ui: { ...s.ui, screen: "home" } };

    case "debuff": {
      const poisonStatus: StatusEffect = { id: "poison", name: "毒", turns: 3, value: 5 };
      if (!hasStatus(s.battle.playerStatus, "poison")) {
        s = { ...s, battle: { ...s.battle, playerStatus: [...s.battle.playerStatus, poisonStatus] } };
      }
      s = addLog(s, `${enemy.name}の毒攻撃！ 毒状態になった！`);
      break;
    }

    case "phase2":
      s = {
        ...s,
        battle: {
          ...s.battle,
          enemy: { ...enemy, phase2: true, attack: Math.floor(enemy.attack * 1.5), defense: Math.floor(enemy.defense * 1.2) },
        },
      };
      s = addLog(s, `【${enemy.name}がフェーズ2に突入！】全ステータスが大幅上昇！`);
      break;

    case "boss_skill": {
      const curseStatus: StatusEffect = { id: "poison", name: "呪い", turns: 3, value: 10 };
      s = { ...s, battle: { ...s.battle, playerStatus: [...s.battle.playerStatus.filter(e => e.id !== "poison"), curseStatus] } };
      s = addLog(s, `${enemy.name}の【呪いの波動】！ 呪い状態になった！`);
      break;
    }

    case "boss_aoe": {
      const aoeDmg = Math.max(1, Math.floor(enemy.attack * 0.8 - s.player.stats.defense * 0.3 + getRandom(-5, 5)));
      s = applyPlayerDamage(s, aoeDmg);
      s = addLog(s, `${enemy.name}の【混沌の術】！ ${aoeDmg}ダメージ！`);
      break;
    }

    default: {
      const confused = hasStatus(s.battle.enemyStatus, "confusion");
      if (confused && Math.random() < 0.4) {
        s = addLog(s, `${enemy.name}は幻惑で攻撃を外した！`);
        break;
      }
      if (s.battle.playerDodge > 0) {
        s = { ...s, battle: { ...s.battle, playerDodge: s.battle.playerDodge - 1 } };
        s = addLog(s, `幻影分身が攻撃を無効化した！`);
        break;
      }
      if (s.battle.playerDodgeChance > 0 && Math.random() < s.battle.playerDodgeChance) {
        s = addLog(s, `影分身が攻撃を回避した！`);
        break;
      }
      const dmg = Math.max(1, enemy.attack - Math.floor(s.player.stats.defense * 0.5) + getRandom(-3, 3));
      s = applyPlayerDamage(s, dmg);
      s = addLog(s, `${enemy.name}の${action.label}！ ${dmg}ダメージ！`);
    }
  }

  if (s.player.hp <= 0) {
    return { ...s, battle: { ...s.battle, active: false }, ui: { ...s.ui, screen: "gameover" } };
  }

  return finalizeEnemyTurn(s);
}
