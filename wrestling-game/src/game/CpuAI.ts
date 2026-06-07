import { Wrestler } from "./Wrestler.js";
import { EffectsSystem } from "../engine/effects.js";
import { audio } from "../engine/audio.js";

export type Difficulty = "easy" | "normal" | "hard";

type AIPhase = "chase" | "attack" | "recover" | "pin";

const CHASE_DIST   = 2.2;
const STRIKE_DIST  = 1.8;
const GRAPPLE_DIST = 1.6;

interface DifficultyParams {
  decisionBase: number;    // 行動間隔の基本秒数 (大きいほど遅い)
  missChance: number;      // 攻撃をスキップする確率 0〜1
  dmgMult: number;         // ダメージ倍率
  sprintThreshold: number; // スタミナ何%以上でダッシュするか
  recoverAt: number;       // スタミナ何%以下で回復フェーズへ
  recoverUntil: number;    // スタミナ何%以上になったら再開
  pinChase: boolean;       // ダウン中プレイヤーをピンしに行くか
}

const DIFFICULTY: Record<Difficulty, DifficultyParams> = {
  easy: {
    decisionBase: 0.9,
    missChance:   0.35,
    dmgMult:      0.7,
    sprintThreshold: 70,
    recoverAt:    35,
    recoverUntil: 70,
    pinChase:     false,
  },
  normal: {
    decisionBase: 0.5,
    missChance:   0.15,
    dmgMult:      1.0,
    sprintThreshold: 40,
    recoverAt:    20,
    recoverUntil: 55,
    pinChase:     true,
  },
  hard: {
    decisionBase: 0.2,
    missChance:   0.04,
    dmgMult:      1.3,
    sprintThreshold: 25,
    recoverAt:    12,
    recoverUntil: 40,
    pinChase:     true,
  },
};

export class CpuAI {
  private phase: AIPhase = "chase";
  private decisionTimer = 0;
  private stuckTimer    = 0;
  private lastX         = 0;
  private lastZ         = 0;
  private readonly p: DifficultyParams;

  constructor(
    private readonly cpu: Wrestler,
    private readonly player: Wrestler,
    private readonly effects: EffectsSystem,
    difficulty: Difficulty = "normal"
  ) {
    this.p = DIFFICULTY[difficulty];
  }

  /** サブミッション中の CPU 脱出速度 (per second, 0–1 scale) */
  get escapeRate(): number {
    // Hard: ~0.22/s, Normal: ~0.13/s, Easy: ~0.06/s
    return (1 - this.p.missChance) * 0.25;
  }

  update(dt: number): void {
    // 難易度ベースでリバーサルを試みる (Hard: 55%、Normal: 30%、Easy: 10%)
    if (this.cpu.canReversal()) {
      const reversalChance = 1 - this.p.missChance * 2.5;
      if (Math.random() < reversalChance) {
        this.cpu.doReversal();
        this.effects.spawnHitSparks(this.cpu.position, 0x00ffff);
        this.effects.shake(0.1);
        audio.punch();
      }
      return;
    }

    if (!this.cpu.isActionReady()) return;

    this.updatePhase();
    this.decisionTimer = Math.max(0, this.decisionTimer - dt);

    switch (this.phase) {
      case "chase":   this.doChase(dt);   break;
      case "attack":  this.doAttack(dt);  break;
      case "recover": this.doRecover(dt); break;
      case "pin":     this.doPin(dt);     break;
    }

    this.detectStuck(dt);
  }

  private updatePhase(): void {
    const dist = this.cpu.distanceTo(this.player);

    if (this.p.pinChase && this.player.isDown() && dist < 2.5) {
      this.phase = "pin";
      return;
    }
    if (this.cpu.stamina < this.p.recoverAt) {
      this.phase = "recover";
      return;
    }
    if (dist < CHASE_DIST) {
      this.phase = "attack";
      return;
    }
    this.phase = "chase";
  }

  private doChase(dt: number): void {
    const dx = this.player.position.x - this.cpu.position.x;
    const dz = this.player.position.z - this.cpu.position.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    const sprint = this.cpu.stamina > this.p.sprintThreshold && len > 3.5;
    this.cpu.move(dx / len, dz / len, sprint, dt);
    this.cpu.faceTarget(this.player);

    // スプリント中 + 射程内 → ランニングストライク
    if (sprint && len < STRIKE_DIST && this.cpu.isActionReady()) {
      this.cpu.startRunningStrike();
      const dmg = (14 + Math.random() * 6) * this.p.dmgMult * this.cpu.damageMult;
      this.player.takeDamage(dmg);
      if (this.player.hp < 35) this.player.startKnockdown();
      this.effects.spawnHitSparks(this.player.position, 0xff2200);
      this.effects.spawnHitSparks(this.player.position, 0xffaa00);
      this.effects.shake(0.18);
      audio.slam();
      this.decisionTimer = this.p.decisionBase * 1.2;
    }
  }

  private doAttack(dt: number): void {
    if (this.decisionTimer > 0) return;
    // miss チャンス
    if (Math.random() < this.p.missChance) {
      this.decisionTimer = this.p.decisionBase;
      return;
    }

    const dist = this.cpu.distanceTo(this.player);
    const roll  = Math.random();

    const charDmg = this.cpu.damageMult;  // キャラクター固有の攻撃力

    // フィニッシャー (シグネチャー + キャラ固有演出)
    if (this.cpu.momentum >= 100 && dist < GRAPPLE_DIST) {
      this.cpu.startSignature(this.player);
      this.player.takeDamage(35 * this.p.dmgMult * charDmg);
      this.effects.spawnFinisherBurst(this.player.position, this.cpu.finisherColor);
      this.effects.shake(0.5);
      audio.slam();
      audio.crowd();
      this.decisionTimer = 1.4;
      return;
    }

    // グラップル中: Irish Whip (25%) または Slam (75%)
    if (this.cpu.state === "grappling" && this.cpu.grappleTarget) {
      if (Math.random() < 0.25 && this.cpu.canWhip(this.player)) {
        this.cpu.startWhip(this.player);
        this.effects.spawnDust(this.player.position);
        audio.slam();
        this.decisionTimer = 0.4; // 短い待機後にリバウンドを迎撃
      } else {
        this.cpu.startSlam(this.player);
        this.player.takeDamage(18 * this.p.dmgMult * charDmg);
        this.effects.spawnDust(this.player.position);
        this.effects.shake(0.18);
        audio.slam();
        this.decisionTimer = this.p.decisionBase * 1.5;
      }
      return;
    }

    // クロスライン — リバウンド中プレイヤーを迎撃
    if (this.player.isRebounding() && dist < STRIKE_DIST && this.cpu.canStrike(this.player)) {
      this.cpu.startStrike();
      const dmg = (16 + Math.random() * 6) * this.p.dmgMult * charDmg;
      this.player.takeDamage(dmg);
      if (this.player.hp < 55) this.player.startKnockdown();
      this.effects.spawnHitSparks(this.player.position, 0xff2200);
      this.effects.spawnHitSparks(this.player.position, 0xffaa00);
      this.effects.shake(0.22);
      audio.slam();
      this.decisionTimer = this.p.decisionBase;
      return;
    }

    if (dist < GRAPPLE_DIST && roll < 0.45) {
      if (this.cpu.canGrapple(this.player)) {
        this.cpu.startGrapple(this.player);
        this.decisionTimer = this.p.decisionBase * 0.6;
      }
    } else if (dist < STRIKE_DIST && roll < 0.85) {
      if (this.cpu.canStrike(this.player)) {
        this.cpu.startStrike();
        const dmg = (7 + Math.random() * 5) * this.p.dmgMult * charDmg;
        this.player.takeDamage(dmg);
        if (this.player.hp < 25) this.player.startKnockdown();
        this.effects.spawnHitSparks(this.player.position, 0xff6600);
        this.effects.shake(0.08);
        audio.punch();
        this.decisionTimer = this.p.decisionBase;
      }
    } else {
      this.doChase(dt);
      this.decisionTimer = this.p.decisionBase * 0.4;
    }
  }

  private doRecover(dt: number): void {
    const dx = this.cpu.position.x - this.player.position.x;
    const dz = this.cpu.position.z - this.player.position.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    if (this.cpu.distanceTo(this.player) < 3.5) {
      this.cpu.move(dx / len, dz / len, false, dt);
    }
    // Hard 限定: 遠ければたまにタントして煽る
    if (this.p.missChance < 0.1 &&
        this.cpu.distanceTo(this.player) > 4 &&
        this.cpu.state === "idle" &&
        this.decisionTimer <= 0 &&
        Math.random() < 0.008) {
      this.cpu.startTaunt();
      audio.crowd();
      this.decisionTimer = 1.5;
    }
    if (this.cpu.stamina > this.p.recoverUntil) this.phase = "chase";
  }

  private doPin(dt: number): void {
    if (this.decisionTimer > 0) return;
    if (this.cpu.distanceTo(this.player) < 1.5 && this.player.isDown()) {
      this.cpu.startPin();
      this.player.state = "being_pinned";
      audio.pinRoll();
      this.decisionTimer = 2.8;
    } else {
      this.doChase(dt);
    }
  }

  private detectStuck(dt: number): void {
    const dx = Math.abs(this.cpu.position.x - this.lastX);
    const dz = Math.abs(this.cpu.position.z - this.lastZ);
    if (dx < 0.01 && dz < 0.01 && this.phase === "chase") {
      this.stuckTimer += dt;
      if (this.stuckTimer > 0.8) {
        const angle = Math.random() * Math.PI * 2;
        this.cpu.move(Math.cos(angle), Math.sin(angle), false, dt * 8);
        this.stuckTimer = 0;
      }
    } else {
      this.stuckTimer = 0;
    }
    this.lastX = this.cpu.position.x;
    this.lastZ = this.cpu.position.z;
  }
}
