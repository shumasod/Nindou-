import type { Player, Enemy, StatusEffect } from "./types";

// ===== 乱数ユーティリティ =====
export function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== ダメージ計算 =====
export function calcDamage(
  attack: number,
  defense: number,
  multiplier = 1.0
): { damage: number; isCritical: boolean; critChance: number } {
  const critChance = 0.1;
  const isCritical = Math.random() < critChance;
  const base = attack * multiplier - defense * 0.5 + getRandom(-3, 3);
  const damage = Math.max(1, Math.floor(isCritical ? base * 2.0 : base));
  return { damage, isCritical, critChance };
}

export function calcDamageWithSpeed(
  attack: number,
  defense: number,
  speed: number,
  multiplier = 1.0
): { damage: number; isCritical: boolean } {
  const critChance = Math.min(0.4, 0.1 + speed * 0.005);
  const isCritical = Math.random() < critChance;
  const base = attack * multiplier - defense * 0.5 + getRandom(-3, 3);
  const damage = Math.max(1, Math.floor(isCritical ? base * 2.0 : base));
  return { damage, isCritical };
}

// ===== 逃走成功率 =====
export function calcEscapeRate(playerSpeed: number, enemySpeed: number): number {
  const total = playerSpeed + enemySpeed;
  // ゼロ除算防止: 両方0の場合は50%とする
  if (total === 0) return 0.5;
  return playerSpeed / total;
}

// ===== Lvアップ判定 =====
/** 次のLvに必要なEXP。常に1以上を返す（無限ループ防止） */
export function calcExpToNext(level: number): number {
  if (!Number.isFinite(level) || level < 1) return 100;
  return Math.max(1, Math.floor(100 * Math.pow(1.5, level - 1)));
}

// ===== ステータスボーナス計算 =====
export function getEffectiveStats(
  player: Player,
  statusEffects: StatusEffect[]
): Player["stats"] & { defense: number } {
  let { attack, defense, speed, stealth } = player.stats;

  for (const eff of statusEffects) {
    if (eff.id === "defense_up") defense = Math.floor(defense * 1.5);
    if (eff.id === "speed_up")   speed   = Math.floor(speed * 2);
    if (eff.id === "attack_up")  attack  = Math.floor(attack * 1.5);
  }

  return { attack, defense, speed, stealth };
}

// ===== 状態異常チェック =====
export function hasStatus(effects: StatusEffect[], id: string): boolean {
  return effects.some((e) => e.id === id);
}

export function decrementStatus(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((e) => ({ ...e, turns: e.turns - 1 }))
    .filter((e) => e.turns > 0);
}

// ===== HPバーカラー =====
export function hpColor(current: number, max: number): string {
  const ratio = current / max;
  if (ratio > 0.5) return "#4a9e5c";
  if (ratio > 0.25) return "#d4a017";
  return "#c41e1e";
}

// ===== ランクカラー =====
export function rankColor(rank: string): string {
  switch (rank) {
    case "S": return "#d4a017";
    case "A": return "#c41e1e";
    case "B": return "#7a4bb5";
    case "C": return "#4a9e5c";
    default:  return "#888";
  }
}

// ===== 敵AIアクション =====
export function enemyAction(
  enemy: Enemy,
  enemyStatus: StatusEffect[],
  turn: number
): { type: string; label: string } {
  // スタン中は行動不能
  if (hasStatus(enemyStatus, "stun")) {
    return { type: "stun", label: "行動不能！" };
  }

  const hpRatio = enemy.hp / enemy.maxHp;

  switch (enemy.ai) {
    case "aggressive":
      return { type: "attack", label: "攻撃" };

    case "balanced":
      if (hpRatio < 0.2 && Math.random() < 0.4) {
        return { type: "escape", label: "逃走を試みる" };
      }
      if (hpRatio < 0.5 && Math.random() < 0.3) {
        return { type: "defend", label: "防御態勢" };
      }
      return { type: "attack", label: "攻撃" };

    case "debuffer":
      if (turn <= 2) return { type: "debuff", label: "状態異常攻撃" };
      return { type: "attack", label: "攻撃" };

    case "tank":
      if (hpRatio < 0.5 && Math.random() < 0.4) {
        return { type: "defend", label: "防御態勢" };
      }
      return { type: "attack", label: "強攻撃" };

    case "speed":
      return Math.random() < 0.3
        ? { type: "dodge", label: "回避態勢" }
        : { type: "attack", label: "高速攻撃" };

    case "boss":
      if (hpRatio < 0.5 && !enemy.phase2) {
        return { type: "phase2", label: "【フェーズ変化】怒りの解放！" };
      }
      if (enemy.phase2) {
        const r = Math.random();
        if (r < 0.3) return { type: "boss_skill", label: "呪いの波動" };
        if (r < 0.5) return { type: "boss_aoe",   label: "混沌の術" };
        return { type: "attack", label: "魔斬り" };
      }
      return { type: "attack", label: "魔斬り" };

    default:
      return { type: "attack", label: "攻撃" };
  }
}
