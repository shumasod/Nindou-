import type { GameState, Player, ClanId, StatusEffect } from "./types";
import { CLANS, ENEMIES, QUESTS, SKILLS, SKILL_UNLOCK, ITEMS } from "./data";
import {
  calcDamageWithSpeed,
  calcEscapeRate,
  calcExpToNext,
  enemyAction,
  getRandom,
  decrementStatus,
  hasStatus,
} from "./utils";

// ===== 初期ステート =====
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
  | { type: "RESET_GAME" };

// ===== ヘルパー =====
function addLog(state: GameState, msg: string): GameState {
  const log = [msg, ...state.battle.log].slice(0, 10);
  return { ...state, battle: { ...state.battle, log } };
}

function applyPlayerDamage(state: GameState, damage: number): GameState {
  // 防御バフ確認
  const defending = hasStatus(state.battle.playerStatus, "defending");
  const finalDamage = defending ? Math.floor(damage * 0.5) : damage;
  const newHp = Math.max(0, state.player.hp - finalDamage);
  return { ...state, player: { ...state.player, hp: newHp } };
}

function applyEnemyDamage(state: GameState, damage: number): GameState {
  if (!state.battle.enemy) return state;
  const newHp = Math.max(0, state.battle.enemy.hp - damage);
  return { ...state, battle: { ...state.battle, enemy: { ...state.battle.enemy, hp: newHp } } };
}

function checkLevelUp(state: GameState): GameState {
  let p = { ...state.player };
  let leveledUp = false;
  while (p.exp >= p.expToNext) {
    p.exp -= p.expToNext;
    p.level += 1;
    p.expToNext = calcExpToNext(p.level);
    p.statPoints += 3;
    p.maxHp = Math.floor(p.maxHp * 1.1 + 10);
    p.hp = p.maxHp;
    p.maxChakra = Math.floor(p.maxChakra * 1.05 + 5);
    p.chakra = p.maxChakra;
    leveledUp = true;

    // スキル自動解放
    for (const [skillId, cond] of Object.entries(SKILL_UNLOCK)) {
      if (
        cond.clan === p.clan &&
        cond.level <= p.level &&
        !p.skills.includes(skillId)
      ) {
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

function enemyDefeat(state: GameState): GameState {
  const enemy = state.battle.enemy!;
  const quest = state.progress.activeQuest;
  const newProgress = { ...state.progress };
  const newBattle = { ...state.battle };

  // EXP・ゴールド獲得
  const newPlayer = {
    ...state.player,
    exp: state.player.exp + enemy.exp,
    gold: state.player.gold + enemy.gold,
  };

  let killCount = newBattle.killCount + 1;
  newBattle.killCount = killCount;

  // クエスト進行
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
      // アイテム追加
      const itemNames: string[] = [];
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
        itemNames.push(ITEMS[ri.id]?.name ?? ri.id);
      }
      reward = { exp: quest.reward.exp, gold: quest.reward.gold, items: itemNames };
    }
  }

  // ドロップ処理
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

  // クエスト未完了・まだ同じ敵を倒す必要がある場合は新しい敵を生成
  if (!questComplete && quest) {
    const enemyTemplate = ENEMIES[quest.target];
    if (enemyTemplate) {
      const newEnemy = {
        ...enemyTemplate,
        id: quest.target,
        maxHp: enemyTemplate.hp,
        hp: enemyTemplate.hp,
        phase2: false,
      };
      nextState = {
        ...nextState,
        battle: { ...nextState.battle, enemy: newEnemy, turn: 1, playerStatus: [], enemyStatus: [] },
      };
      nextState = addLog(nextState, `新たな${newEnemy.name}が現れた！`);
    }
  }

  return nextState;
}

// ===== メインReducer =====
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "RESET_GAME":
      return { ...INITIAL_STATE };

    case "GO_TO_SCREEN":
      return { ...state, ui: { ...state.ui, screen: action.screen, levelUpPending: false } };

    case "SELECT_CLAN": {
      const clan = CLANS[action.clan];
      const bonus = clan.bonus;
      const p = { ...state.player };
      p.clan = action.clan;
      if (bonus.maxHp)     { p.maxHp    += bonus.maxHp;    p.hp    = p.maxHp; }
      if (bonus.maxChakra) { p.maxChakra += bonus.maxChakra; p.chakra = p.maxChakra; }
      if (bonus.attack)    p.stats = { ...p.stats, attack:  p.stats.attack  + bonus.attack };
      if (bonus.defense)   p.stats = { ...p.stats, defense: p.stats.defense + bonus.defense };
      if (bonus.speed)     p.stats = { ...p.stats, speed:   p.stats.speed   + bonus.speed };
      if (bonus.stealth)   p.stats = { ...p.stats, stealth: p.stats.stealth + bonus.stealth };
      // スタータースキル付与
      p.skills = [clan.starterSkill];
      return { ...state, player: p, ui: { ...state.ui, screen: "name_input" } };
    }

    case "SET_NAME": {
      // 二重防衛: UIレイヤーのサニタイズをバイパスされた場合も reducer 側で安全化
      const safeName = action.name
        .replace(/[\u202A-\u202E\u2066-\u2069]/g, "") // 方向制御文字
        .replace(/[<>"'`]/g, "")                       // HTML特殊文字
        .replace(/[\x00-\x1F\x7F]/g, "")              // 制御文字
        .trim()
        .slice(0, 12); // 最大長を強制
      // 空文字や無効名は受け付けない
      if (safeName.length === 0) return state;
      return {
        ...state,
        player: { ...state.player, name: safeName },
        ui: { ...state.ui, screen: "home" },
      };
    }

    case "START_QUEST": {
      const quest = QUESTS.find((q) => q.id === action.questId);
      if (!quest) return state;
      return {
        ...state,
        progress: { ...state.progress, activeQuest: { ...quest, progress: 0 } },
        ui: { ...state.ui, screen: "quest_detail" },
      };
    }

    case "START_BATTLE": {
      const template = ENEMIES[action.enemyId];
      if (!template) return state;
      const enemy = {
        ...template,
        id: action.enemyId,
        maxHp: template.hp,
        hp: template.hp,
        phase2: false,
      };
      // 奇襲判定
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
          questId: action.questId ?? null,
          killCount: 0,
        },
        ui: { ...state.ui, screen: "battle" },
      };
    }

    case "PLAYER_ATTACK": {
      if (state.battle.phase !== "player" || !state.battle.enemy) return state;
      const { stats } = state.player;
      // 防御バフ確認
      const defMult = hasStatus(state.battle.playerStatus, "defense_up") ? 1.5 : 1;
      const atkVal = stats.attack;
      const { damage, isCritical } = calcDamageWithSpeed(
        atkVal,
        state.battle.enemy.defense,
        stats.speed
      );

      let s = applyEnemyDamage(state, damage);
      const critText = isCritical ? " 【CRITICAL!!】" : "";
      s = addLog(s, `${state.player.name}の攻撃！ ${damage}ダメージ！${critText}`);

      // 命中ミス判定（幻惑の術）
      const enemyConfused = hasStatus(s.battle.enemyStatus, "confusion");
      void enemyConfused; // 敵への幻惑は敵ターンで処理するため、ここは敵の命中ミス処理なし

      // 敵撃破判定
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

    case "PLAYER_SKILL": {
      if (state.battle.phase !== "player" || !state.battle.enemy) return state;
      const skill = SKILLS[action.skillId];
      if (!skill) return state;
      if (state.player.chakra < skill.cost) return state;

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
          const critText = isCritical ? " 【CRITICAL!!】" : "";
          s = addLog(s, `${skill.name}！ ${damage}ダメージ！${critText}`);

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
        case "escape": {
          s = addLog(s, `${skill.name}！ 煙幕を張って離脱した！`);
          return {
            ...s,
            battle: { ...s.battle, active: false },
            ui: { ...s.ui, screen: "home" },
          };
        }
      }

      return { ...s, battle: { ...s.battle, phase: "enemy" } };
    }

    case "PLAYER_ITEM": {
      if (state.battle.phase !== "player") return state;
      const item = ITEMS[action.itemId];
      if (!item) return state;
      const itemStack = state.player.items.find((i) => i.id === action.itemId);
      if (!itemStack || itemStack.count <= 0) return state;

      let s = {
        ...state,
        player: {
          ...state.player,
          items: state.player.items.map((it) =>
            it.id === action.itemId ? { ...it, count: it.count - 1 } : it
          ).filter((it) => it.count > 0),
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
        case "escape": {
          s = addLog(s, `${item.name}を使用！ 煙幕の中に消えた...`);
          return { ...s, battle: { ...s.battle, active: false }, ui: { ...s.ui, screen: "home" } };
        }
      }

      return { ...s, battle: { ...s.battle, phase: "enemy" } };
    }

    case "PLAYER_DEFEND": {
      if (state.battle.phase !== "player") return state;
      const defStatus: StatusEffect = { id: "defending", name: "防御", turns: 1 };
      const newStatus = [...state.battle.playerStatus.filter((e) => e.id !== "defending"), defStatus];
      // チャクラ少し回復
      const newChakra = Math.min(state.player.maxChakra, state.player.chakra + 8);
      let s: GameState = {
        ...state,
        player: { ...state.player, chakra: newChakra },
        battle: { ...state.battle, playerStatus: newStatus, phase: "enemy" },
      };
      s = addLog(s, `${state.player.name}は防御態勢をとった。チャクラが少し回復した。`);
      return s;
    }

    case "PLAYER_ESCAPE": {
      if (state.battle.phase !== "player" || !state.battle.enemy) return state;
      const rate = calcEscapeRate(state.player.stats.speed, state.battle.enemy.speed);
      if (Math.random() < rate) {
        let s = addLog(state, "逃走に成功した...");
        return { ...s, battle: { ...s.battle, active: false }, ui: { ...s.ui, screen: "home" } };
      }
      let s = addLog(state, "逃走に失敗した！");
      return { ...s, battle: { ...s.battle, phase: "enemy" } };
    }

    case "ENEMY_TURN": {
      if (state.battle.phase !== "enemy" || !state.battle.enemy) return state;
      const enemy = state.battle.enemy;
      const action2 = enemyAction(enemy, state.battle.enemyStatus, state.battle.turn);
      let s = state;

      // 毒ダメージ処理（プレイヤー）
      if (hasStatus(s.battle.playerStatus, "poison")) {
        const poisonDmg = getRandom(3, 8);
        s = applyPlayerDamage(s, poisonDmg);
        s = addLog(s, `毒のダメージ！ ${poisonDmg}ダメージ。`);
        if (s.player.hp <= 0) {
          return { ...s, battle: { ...s.battle, active: false }, ui: { ...s.ui, screen: "gameover" } };
        }
      }

      switch (action2.type) {
        case "stun":
          s = addLog(s, `${enemy.name}は行動不能だ！`);
          break;

        case "defend":
          s = addLog(s, `${enemy.name}は防御態勢をとった。`);
          break;

        case "escape":
          s = addLog(s, `${enemy.name}は逃げ出した！`);
          return {
            ...s,
            battle: { ...s.battle, active: false },
            ui: { ...s.ui, screen: "home" },
          };

        case "debuff": {
          const poisonStatus: StatusEffect = { id: "poison", name: "毒", turns: 3, value: 5 };
          if (!hasStatus(s.battle.playerStatus, "poison")) {
            s = { ...s, battle: { ...s.battle, playerStatus: [...s.battle.playerStatus, poisonStatus] } };
          }
          s = addLog(s, `${enemy.name}の毒攻撃！ 毒状態になった！`);
          break;
        }

        case "phase2": {
          s = {
            ...s,
            battle: {
              ...s.battle,
              enemy: { ...enemy, phase2: true, attack: Math.floor(enemy.attack * 1.5), defense: Math.floor(enemy.defense * 1.2) },
            },
          };
          s = addLog(s, `【${enemy.name}がフェーズ2に突入！】全ステータスが大幅上昇！`);
          break;
        }

        case "boss_skill": {
          // 呪いの波動: 状態異常付与
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
          // 通常攻撃
          // 幻惑チェック（命中率低下）
          const confused = hasStatus(s.battle.enemyStatus, "confusion");
          if (confused && Math.random() < 0.4) {
            s = addLog(s, `${enemy.name}は幻惑で攻撃を外した！`);
            break;
          }

          // プレイヤー回避判定
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
          s = addLog(s, `${enemy.name}の${action2.label}！ ${dmg}ダメージ！`);
        }
      }

      // ゲームオーバー判定
      if (s.player.hp <= 0) {
        return { ...s, battle: { ...s.battle, active: false }, ui: { ...s.ui, screen: "gameover" } };
      }

      // ステータス効果のターン経過
      const newPlayerStatus = decrementStatus(s.battle.playerStatus);
      const newEnemyStatus = decrementStatus(s.battle.enemyStatus);

      // チャクラ自然回復
      const newChakra = Math.min(s.player.maxChakra, s.player.chakra + getRandom(3, 7));

      return {
        ...s,
        player: { ...s.player, chakra: newChakra },
        battle: {
          ...s.battle,
          playerStatus: newPlayerStatus,
          enemyStatus: newEnemyStatus,
          turn: s.battle.turn + 1,
          phase: "player",
          // 影分身チェック
          playerDodgeChance: newPlayerStatus.some((e) => e.id === "shadow_clone")
            ? s.battle.playerDodgeChance
            : 0,
        },
      };
    }

    case "ALLOCATE_STAT": {
      if (state.player.statPoints <= 0) return state;
      return {
        ...state,
        player: {
          ...state.player,
          statPoints: state.player.statPoints - 1,
          stats: {
            ...state.player.stats,
            [action.stat]: state.player.stats[action.stat] + 1,
          },
        },
      };
    }

    default:
      return state;
  }
}
