import { Wrestler } from "./Wrestler.js";

type AIPhase = "chase" | "attack" | "recover" | "pin";

const CHASE_DIST   = 2.2;  // この距離まで近づいたら攻撃フェーズへ
const STRIKE_DIST  = 1.8;
const GRAPPLE_DIST = 1.6;

export class CpuAI {
  private phase: AIPhase = "chase";
  private decisionTimer = 0;  // 次の行動決定までの残り秒数
  private stuckTimer    = 0;  // 同じ場所に滞在している時間
  private lastX         = 0;
  private lastZ         = 0;

  constructor(
    private readonly cpu: Wrestler,
    private readonly player: Wrestler
  ) {}

  update(dt: number): void {
    if (!this.cpu.isActionReady()) return;

    this.updatePhase();
    this.decisionTimer = Math.max(0, this.decisionTimer - dt);

    switch (this.phase) {
      case "chase":    this.doChase(dt);   break;
      case "attack":   this.doAttack(dt);  break;
      case "recover":  this.doRecover(dt); break;
      case "pin":      this.doPin(dt);     break;
    }

    this.detectStuck(dt);
  }

  private updatePhase(): void {
    const dist = this.cpu.distanceTo(this.player);

    // ピン狙い: プレイヤーがダウン中
    if (this.player.isDown() && dist < 2.0) {
      this.phase = "pin";
      return;
    }

    // 回復: スタミナ低下
    if (this.cpu.stamina < 20) {
      this.phase = "recover";
      return;
    }

    // 攻撃: 射程内
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
    const sprint = this.cpu.stamina > 40 && len > 3.5;
    this.cpu.move(dx / len, dz / len, sprint, dt);
    this.cpu.faceTarget(this.player);
  }

  private doAttack(dt: number): void {
    if (this.decisionTimer > 0) return;

    const dist = this.cpu.distanceTo(this.player);
    const roll  = Math.random();

    // シグネチャー: モメンタム満タン + グラップル圏内
    if (this.cpu.momentum >= 100 && dist < GRAPPLE_DIST) {
      this.cpu.startSignature(this.player);
      this.player.takeDamage(35);
      this.decisionTimer = 1.4;
      return;
    }

    // グラップル中ならスラムへ
    if (this.cpu.state === "grappling" && this.cpu.grappleTarget) {
      this.cpu.startSlam(this.player);
      this.player.takeDamage(18);
      this.decisionTimer = 1.0;
      return;
    }

    if (dist < GRAPPLE_DIST && roll < 0.45) {
      // グラップル
      if (this.cpu.canGrapple(this.player)) {
        this.cpu.startGrapple(this.player);
        this.decisionTimer = 0.3;
      }
    } else if (dist < STRIKE_DIST && roll < 0.85) {
      // ストライク
      if (this.cpu.canStrike(this.player)) {
        this.cpu.startStrike();
        const dmg = 7 + Math.random() * 5;
        this.player.takeDamage(dmg);
        if (this.player.hp < 25) this.player.startKnockdown();
        this.decisionTimer = 0.55;
      }
    } else {
      // 少し踏み込む
      this.doChase(dt);
      this.decisionTimer = 0.2;
    }
  }

  private doRecover(dt: number): void {
    // 離れてスタミナ回復
    const dx = this.cpu.position.x - this.player.position.x;
    const dz = this.cpu.position.z - this.player.position.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    if (this.cpu.distanceTo(this.player) < 3.5) {
      this.cpu.move(dx / len, dz / len, false, dt);
    }
    // スタミナが戻ったら攻撃再開
    if (this.cpu.stamina > 55) this.phase = "chase";
  }

  private doPin(dt: number): void {
    if (this.decisionTimer > 0) return;
    if (this.cpu.distanceTo(this.player) < 1.5 && this.player.isDown()) {
      this.cpu.startPin();
      this.player.state = "being_pinned";
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
        // ランダムに少し移動してアンスタック
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
