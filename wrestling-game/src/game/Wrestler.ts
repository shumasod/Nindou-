import * as THREE from "three";
import { RING_BOUNDS } from "./Ring.js";

export type WrestlerState =
  | "idle"
  | "walking"
  | "sprinting"
  | "striking"
  | "running_strike" // スプリント中のストライク
  | "grappling"      // grapple 中 (攻撃側)
  | "grappled"       // grapple 中 (被攻撃側)
  | "slamming"
  | "being_slammed"
  | "whipped"        // アイリッシュウィップ中 (ロープへ走る)
  | "rebounding"     // ロープから跳ね返り中
  | "knockdown"
  | "getting_up"
  | "signature"
  | "pinning"
  | "being_pinned"
  | "stunned"
  | "taunting"       // 挑発モーション
  | "submitting"     // サブミッション中 (攻撃側)
  | "in_submission"  // サブミッション中 (被攻撃側)
  | "corner_splash"  // コーナースプラッシュ
  | "victory";       // 勝利ポーズ (試合終了後ループ)

export interface WrestlerConfig {
  name: string;
  title?: string;
  primaryColor: number;
  secondaryColor: number;
  skinColor: number;
  startX: number;
  // Stat multipliers from CharacterDef (all default to 1.0)
  speedMult?:   number;
  damageMult?:  number;
  defenceMult?: number;
  maxHp?:       number;
  staminaMult?: number;
  // Per-character finisher (passed from CharacterDef.finisher)
  finisherName?:  string;
  finisherColor?: number;
  // Per-character special at 50% momentum
  specialName?:  string;
  specialColor?: number;
}

const MOVE_SPEED   = 4.5;
const SPRINT_MULT  = 1.8;
const GRAPPLE_DIST = 1.6;
const STRIKE_DIST  = 1.8;
const MAT_Y        = 0.15;

export class Wrestler {
  root: THREE.Group;
  name: string;
  readonly title: string;
  readonly primaryColor: number;

  // Derived stat multipliers
  readonly speedMult:    number;
  private readonly _damageMult:  number;
  readonly defenceMult:  number;
  readonly staminaMult:  number;
  readonly finisherName:  string;
  readonly finisherColor: number;
  readonly specialName:   string;
  readonly specialColor:  number;

  /** ガス欠: ×0.75 / 瀕死コンバック: ×1.25 / 両方: ×0.9375 */
  get damageMult(): number {
    return this._damageMult *
      (this.isGassed  ? 0.75 : 1.0) *
      (this.isDanger  ? 1.25 : 1.0);
  }

  /** スタミナが 20 未満 = ガス欠状態 */
  get isGassed(): boolean {
    return this.stamina < 20;
  }

  /** HP が 20 未満かつ生存 = ファイアアップ状態 */
  get isDanger(): boolean {
    return this.hp > 0 && this.hp < 20;
  }

  // Stats
  hp:      number;
  maxHp:   number;
  stamina = 100;
  momentum = 0;    // 0-100, シグネチャー解禁

  state: WrestlerState = "idle";
  facingAngle = 0;  // ラジアン、Y軸回転

  // Grapple link
  grappleTarget: Wrestler | null = null;

  // Timers (秒)
  stateTimer      = 0;
  actionCooldown  = 0;
  knockdownTimer  = 0;
  pinCount        = 0;   // 現在のピンカウント (0-3)
  reversalWindow  = 0;   // > 0 の間リバーサル受付中
  ropeBreakUsed   = false; // 1ノックダウンにつき1回まで
  cornered        = false;  // コーナーポスト激突中
  knockdownCount  = 0;     // 試合中の累計ノックダウン数 (3 で TKO)
  counterWindow   = 0;     // > 0 の間カウンター受付中 (ストライク被弾後 0.3 s)
  private _knockdownOutside = false; // 次の startKnockdown で場外へ押し出す

  private config: WrestlerConfig;

  // Body part refs for animation
  private torso!: THREE.Mesh;
  private head!: THREE.Mesh;
  private upperArmL!: THREE.Group;
  private upperArmR!: THREE.Group;
  private lowerArmL!: THREE.Mesh;
  private lowerArmR!: THREE.Mesh;
  private upperLegL!: THREE.Group;
  private upperLegR!: THREE.Group;
  private lowerLegL!: THREE.Mesh;
  private lowerLegR!: THREE.Mesh;

  // Momentum decay tracking
  private _idleTimer = 0;

  /** アイドルが 2.5s 超え かつ momentum > 0 の場合 true */
  get momentumDecaying(): boolean {
    return this._idleTimer > 2.5 && this.momentum > 0;
  }

  // Flash / danger pulse
  private flashTimer       = 0;
  private dangerPulseTimer = 0;
  private bodyMeshes: THREE.Mesh[] = [];

  // Irish whip velocity (X axis only)
  private whipVelX = 0;

  constructor(config: WrestlerConfig) {
    this.config = config;
    this.name  = config.name;
    this.title = config.title ?? "";
    this.primaryColor = config.primaryColor;
    this.speedMult    = config.speedMult   ?? 1.0;
    this._damageMult  = config.damageMult  ?? 1.0;
    this.defenceMult  = config.defenceMult ?? 1.0;
    this.staminaMult = config.staminaMult ?? 1.0;
    this.maxHp        = config.maxHp        ?? 100;
    this.hp           = this.maxHp;
    this.finisherName  = config.finisherName  ?? "SIGNATURE MOVE!!";
    this.finisherColor = config.finisherColor ?? 0xffd700;
    this.specialName   = config.specialName   ?? "SPECIAL MOVE!";
    this.specialColor  = config.specialColor  ?? 0x88aaff;
    this.root  = new THREE.Group();
    this.root.position.set(config.startX, MAT_Y, 0);
    this.buildBody();
    this.facingAngle = config.startX > 0 ? Math.PI : 0;
    this.root.rotation.y = this.facingAngle;
  }

  private mat(color: number, roughness = 0.6): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.1 });
  }

  private buildBody(): void {
    const { primaryColor, secondaryColor, skinColor } = this.config;
    const skinMat   = this.mat(skinColor, 0.8);
    const trunksMat = this.mat(primaryColor, 0.7);
    const bootsMat  = this.mat(secondaryColor, 0.5);
    const kneeMat   = this.mat(0xdddddd, 0.9);

    // ─── Torso ───────────────────────────────────────────────────
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.35);
    this.torso = new THREE.Mesh(torsoGeo, this.mat(primaryColor));
    this.torso.position.y = 1.15;
    this.torso.castShadow = true;
    this.root.add(this.torso);
    this.bodyMeshes.push(this.torso);

    // ─── Head ────────────────────────────────────────────────────
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.38), skinMat);
    this.head.position.y = 1.82;
    this.head.castShadow = true;
    this.root.add(this.head);
    this.bodyMeshes.push(this.head);

    // Hair
    const hairMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.43, 0.12, 0.39),
      this.mat(0x2a1a0a)
    );
    hairMesh.position.y = 1.99;
    this.root.add(hairMesh);

    // ─── Arms ────────────────────────────────────────────────────
    this.upperArmL = this.buildArm(-0.52, skinMat, kneeMat);
    this.upperArmR = this.buildArm( 0.52, skinMat, kneeMat);
    this.lowerArmL = this.upperArmL.children[1] as THREE.Mesh;
    this.lowerArmR = this.upperArmR.children[1] as THREE.Mesh;

    // ─── Legs ────────────────────────────────────────────────────
    this.upperLegL = this.buildLeg(-0.2, trunksMat, skinMat, bootsMat, kneeMat);
    this.upperLegR = this.buildLeg( 0.2, trunksMat, skinMat, bootsMat, kneeMat);
    this.lowerLegL = this.upperLegL.children[1] as THREE.Mesh;
    this.lowerLegR = this.upperLegR.children[1] as THREE.Mesh;
  }

  private buildArm(
    xOff: number,
    skinMat: THREE.Material,
    kneeMat: THREE.Material
  ): THREE.Group {
    const shoulder = new THREE.Group();
    shoulder.position.set(xOff, 1.35, 0);
    this.root.add(shoulder);

    // Upper arm
    const ua = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.38, 0.22), skinMat);
    ua.position.y = -0.19;
    ua.castShadow = true;
    shoulder.add(ua);
    this.bodyMeshes.push(ua);

    // Elbow joint group
    const elbow = new THREE.Group();
    elbow.position.y = -0.4;
    shoulder.add(elbow);

    // Lower arm
    const la = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.36, 0.2), skinMat);
    la.position.y = -0.18;
    la.castShadow = true;
    elbow.add(la);
    this.bodyMeshes.push(la);

    // Fist
    const fist = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), skinMat);
    fist.position.y = -0.38;
    elbow.add(fist);
    this.bodyMeshes.push(fist);

    // shoulder.children[0]=upper arm, shoulder.children[1]=elbow group
    return shoulder;
  }

  private buildLeg(
    xOff: number,
    trunksMat: THREE.Material,
    skinMat: THREE.Material,
    bootsMat: THREE.Material,
    kneeMat: THREE.Material
  ): THREE.Group {
    const hip = new THREE.Group();
    hip.position.set(xOff, 0.78, 0);
    this.root.add(hip);

    // Trunk shorts (upper leg)
    const ul = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.42, 0.26), trunksMat);
    ul.position.y = -0.21;
    ul.castShadow = true;
    hip.add(ul);
    this.bodyMeshes.push(ul);

    // Knee group
    const knee = new THREE.Group();
    knee.position.y = -0.44;
    hip.add(knee);

    // Lower leg
    const ll = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.4, 0.23), skinMat);
    ll.position.y = -0.2;
    ll.castShadow = true;
    knee.add(ll);
    this.bodyMeshes.push(ll);

    // Boot
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 0.28), bootsMat);
    boot.position.set(0, -0.45, 0.02);
    knee.add(boot);
    this.bodyMeshes.push(boot);

    return hip;
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.root);
  }

  get position(): THREE.Vector3 {
    return this.root.position;
  }

  isActionReady(): boolean {
    return this.actionCooldown <= 0 &&
      this.state !== "knockdown" &&
      this.state !== "getting_up" &&
      this.state !== "being_slammed" &&
      this.state !== "being_pinned" &&
      this.state !== "whipped" &&
      this.state !== "rebounding" &&
      this.state !== "submitting" &&
      this.state !== "in_submission";
  }

  /**
   * ストライク被弾直後にカウンターウィンドウを開く。
   * ダウン中は受け付けない。
   */
  openCounterWindow(): void {
    if (!this.isDown()) this.counterWindow = 0.3;
  }

  /** カウンター可能 — 立ち状態かつウィンドウ内 */
  canCounter(): boolean {
    return this.counterWindow > 0 &&
      !this.isDown() &&
      this.state !== "striking" &&
      this.state !== "slamming" &&
      this.state !== "grappling";
  }

  /** ロープ際にいるか (X or Z 軸でリング端から 1.5 units 以内) */
  isNearRope(): boolean {
    return Math.abs(this.position.x) > RING_BOUNDS - 1.5 ||
           Math.abs(this.position.z) > RING_BOUNDS - 1.5;
  }

  /** コーナーポスト付近にいるか (X 軸・Z 軸ともにロープ内から 1.4 units 以内) */
  isInCorner(): boolean {
    return Math.abs(this.position.x) > RING_BOUNDS - 1.4 &&
           Math.abs(this.position.z) > RING_BOUNDS - 1.4;
  }

  /** リングの外にいるか */
  get isOutside(): boolean {
    return Math.abs(this.position.x) > RING_BOUNDS + 0.1 ||
           Math.abs(this.position.z) > RING_BOUNDS + 0.1;
  }

  /** 場外方向へ吹き飛ばす — 最も近いロープ方向へ */
  pushOutsideRing(): void {
    if (Math.abs(this.position.x) >= Math.abs(this.position.z)) {
      this.root.position.x = Math.sign(this.position.x || 1) * (RING_BOUNDS + 0.9);
    } else {
      this.root.position.z = Math.sign(this.position.z || 1) * (RING_BOUNDS + 0.9);
    }
  }

  /** 次の knockdown で場外に押し出す (大技後にリング外に落とす) */
  scheduleOutsidePush(): void {
    this._knockdownOutside = true;
  }

  /** ロープブレイク可能 — 未使用かつロープ際、かつピンまたはサブミッション中 */
  canRopeBreak(): boolean {
    return !this.ropeBreakUsed &&
      this.isNearRope() &&
      (this.state === "being_pinned" || this.state === "in_submission");
  }

  isDown(): boolean {
    return this.state === "knockdown" ||
           this.state === "being_pinned" ||
           this.state === "in_submission";
  }

  takeDamage(amount: number): void {
    const tauntMult = this.state === "taunting" ? 2.0 : 1.0;
    this.hp = Math.max(0, this.hp - amount * this.defenceMult * tauntMult);
    this.flashTimer = 0.15;
    this.momentum = Math.min(100, this.momentum + amount * 0.3);
  }

  move(dx: number, dz: number, sprint: boolean, dt: number): void {
    // 場外にいる場合は這って戻ることができる (isActionReady チェックをスキップ)
    const crawling = this.isOutside;
    if (!crawling && !this.isActionReady()) return;
    const canSprint = sprint && !this.isGassed && !crawling;
    const gassedFactor = this.isGassed ? 0.6 : 1.0;
    const crawlFactor = crawling ? 0.45 : 1.0;
    const speed = (canSprint ? MOVE_SPEED * SPRINT_MULT : MOVE_SPEED)
      * this.speedMult * gassedFactor * crawlFactor * dt;
    const nx = this.root.position.x + dx * speed;
    const nz = this.root.position.z + dz * speed;
    const limit = crawling ? RING_BOUNDS + 3.5 : RING_BOUNDS;
    this.root.position.x = Math.max(-limit, Math.min(limit, nx));
    this.root.position.z = Math.max(-limit, Math.min(limit, nz));

    if (!crawling) {
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        this.facingAngle = Math.atan2(dx, dz);
        this.state = canSprint ? "sprinting" : "walking";
      } else {
        if (this.state === "walking" || this.state === "sprinting") {
          this.state = "idle";
        }
      }
      this.stamina = Math.max(0, this.stamina - (sprint ? 8 : 2) * dt);
    }
  }

  faceTarget(target: Wrestler): void {
    const dx = target.position.x - this.position.x;
    const dz = target.position.z - this.position.z;
    this.facingAngle = Math.atan2(dx, dz);
  }

  distanceTo(other: Wrestler): number {
    return this.position.distanceTo(other.position);
  }

  canStrike(target: Wrestler): boolean {
    return this.isActionReady() && this.distanceTo(target) < STRIKE_DIST;
  }

  canGrapple(target: Wrestler): boolean {
    return this.isActionReady() && this.distanceTo(target) < GRAPPLE_DIST &&
      target.state !== "grappled";
  }

  /** 現在スプリント中かどうか */
  get isSprinting(): boolean {
    return this.state === "sprinting";
  }

  startStrike(): void {
    this.state = "striking";
    this.stateTimer = 0.35;
    this.actionCooldown = 0.5;
    this.stamina = Math.max(0, this.stamina - 5);
  }

  /** スプリント中ストライク — 通常より長いモーション、ダメージは呼び出し側で 1.5x */
  startRunningStrike(): void {
    this.state = "running_strike";
    this.stateTimer = 0.45;
    this.actionCooldown = 0.6;
    this.stamina = Math.max(0, this.stamina - 10);
  }

  /** コーナースプラッシュ — コーナーに追い詰めた相手への特大打撃 */
  startCornerSplash(): void {
    this.state = "corner_splash";
    this.stateTimer = 0.55;
    this.actionCooldown = 0.7;
    this.stamina = Math.max(0, this.stamina - 12);
  }

  /**
   * タント — 1.2 s アニメーション
   * 被ダメージ 2 倍リスクあり、成功すれば momentum +20
   */
  startTaunt(): void {
    this.state = "taunting";
    this.stateTimer = 1.2;
    this.actionCooldown = 1.4;
  }

  /** タント中かどうか (外部から参照用) */
  isTaunting(): boolean {
    return this.state === "taunting";
  }

  /** 勝利ポーズ — 試合終了後、リザルト画面の背後でループする */
  startVictoryPose(): void {
    this.state = "victory";
    this.stateTimer = 0;       // タイマーなし = ループし続ける
    this.actionCooldown = 999; // 操作不能に
    this.grappleTarget = null;
    this.root.rotation.x = 0;
    this.root.rotation.z = 0;
  }

  startGrapple(target: Wrestler): void {
    this.state = "grappling";
    this.grappleTarget = target;
    this.stateTimer = 0;
    target.state = "grappled";
    target.grappleTarget = this;
    // リバーサルウィンドウ: 被グラップル側に 0.5 秒の反撃チャンス
    target.reversalWindow = 0.5;
    this.stamina = Math.max(0, this.stamina - 8);
  }

  canWhip(target: Wrestler): boolean {
    return this.state === "grappling" && this.grappleTarget === target;
  }

  /** アイリッシュウィップ — グラップル相手をロープへ投げる */
  startWhip(target: Wrestler): void {
    const pos = target.position;
    // Throw toward nearest X-axis rope
    const toRight = RING_BOUNDS - pos.x;
    const toLeft  = pos.x + RING_BOUNDS;
    target.whipVelX = toRight < toLeft ? 9 : -9;
    target.state    = "whipped";
    target.stateTimer = 2.5; // safety timeout
    target.actionCooldown = 2.5;
    target.grappleTarget = null;
    // Face toward destination rope
    target.facingAngle = target.whipVelX > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;

    this.state = "idle";
    this.grappleTarget = null;
    this.actionCooldown = 0.4;
    this.stamina = Math.max(0, this.stamina - 10);
  }

  isRebounding(): boolean {
    return this.state === "rebounding";
  }

  /** グラップルを逆転する — reversalWindow 内かつグラップルされている状態のみ */
  canReversal(): boolean {
    return this.state === "grappled" && this.reversalWindow > 0;
  }

  /** リバーサル実行 — グラップル関係を逆転する */
  doReversal(): void {
    const attacker = this.grappleTarget;
    if (!attacker) return;
    // 攻撃側をグラップルされた状態に
    attacker.state         = "grappled";
    attacker.grappleTarget = this;
    attacker.reversalWindow = 0;
    // 自分が攻撃側に
    this.state         = "grappling";
    this.grappleTarget = attacker;
    this.reversalWindow = 0;
    this.stamina = Math.max(0, this.stamina - 6);
  }

  startSlam(target: Wrestler): void {
    this.state = "slamming";
    this.stateTimer = 0.6;
    this.actionCooldown = 0.8;
    target.state = "being_slammed";
    target.stateTimer = 1.2;
    target.actionCooldown = 1.2;
    target.grappleTarget = null;
    this.grappleTarget = null;
    this.stamina = Math.max(0, this.stamina - 15);
  }

  startSignature(target: Wrestler): void {
    this.state = "signature";
    this.stateTimer = 1.0;
    this.actionCooldown = 1.2;
    this.momentum = 0;
    target.state = "being_slammed";
    target.stateTimer = 2.0;
    target.actionCooldown = 2.5;
    this.stamina = Math.max(0, this.stamina - 20);
    // フィニッシャー技でロープ際なら場外へ吹き飛ばす
    if (target.isNearRope() || this.isNearRope()) {
      target.scheduleOutsidePush();
    }
  }

  startKnockdown(outsidePush = false): void {
    this.state = "knockdown";
    this.knockdownTimer = 3.5 - this.hp * 0.015; // HP が低いほど長く倒れる
    this.knockdownTimer = Math.max(1.5, this.knockdownTimer);
    this.grappleTarget = null;
    this.ropeBreakUsed = false;
    this.cornered      = false;
    this.knockdownCount++;
    if (outsidePush || this._knockdownOutside) {
      this._knockdownOutside = false;
      this.pushOutsideRing();
    }
  }

  /** サブミッション開始 — 攻撃側・被攻撃側双方をロック */
  startSubmission(target: Wrestler): void {
    this.state = "submitting";
    this.actionCooldown = 0.3;
    target.state = "in_submission";
    target.actionCooldown = 0;
    target.grappleTarget = null;
    this.stamina = Math.max(0, this.stamina - 12);
  }

  /** サブミッション可能か — ダウン中の相手が射程内かつ自分がアイドル */
  canSubmit(target: Wrestler): boolean {
    return this.isActionReady() &&
      this.state !== "grappling" &&
      target.state === "knockdown" &&
      this.distanceTo(target) < 1.5;
  }

  /** サブミッション強制解除 */
  breakSubmission(): void {
    if (this.state === "submitting") this.state = "idle";
    if (this.state === "in_submission") this.startKnockdown();
  }

  startPin(): void {
    this.state = "pinning";
    this.stateTimer = 2.5;
    this.pinCount = 0;
  }

  update(dt: number): void {
    // Cooldowns
    this.actionCooldown = Math.max(0, this.actionCooldown - dt);
    this.flashTimer     = Math.max(0, this.flashTimer - dt);
    this.reversalWindow = Math.max(0, this.reversalWindow - dt);
    this.counterWindow  = Math.max(0, this.counterWindow  - dt);
    if (this.isDanger) this.dangerPulseTimer += dt;

    // Stamina — グラップル中は消耗、それ以外は回復
    if (this.state === "idle") {
      this.stamina = Math.min(100, this.stamina + 12 * this.staminaMult * dt);
    } else if (this.state === "grappling") {
      // 攻撃側: 消耗が大きい (8/s)
      this.stamina = Math.max(0, this.stamina - 8 * dt);
    } else if (this.state === "grappled") {
      // 被攻撃側: やや消耗 (5/s)
      this.stamina = Math.max(0, this.stamina - 5 * dt);
    } else {
      this.stamina = Math.min(100, this.stamina + 4 * this.staminaMult * dt);
    }

    // Momentum decay — 2.5s アイドル後、6/s で減少
    if (this.state === "idle") {
      this._idleTimer += dt;
    } else {
      this._idleTimer = 0;
    }
    if (this._idleTimer > 2.5 && this.momentum > 0) {
      this.momentum = Math.max(0, this.momentum - 6 * dt);
    }

    // Irish whip movement
    if (this.state === "whipped" || this.state === "rebounding") {
      const newX = this.root.position.x + this.whipVelX * dt;
      if (this.state === "whipped" && Math.abs(newX) >= RING_BOUNDS - 0.15) {
        this.root.position.x = Math.sign(newX) * (RING_BOUNDS - 0.15);
        if (this.isInCorner()) {
          // コーナーポストに激突 → スタン (リバウンドなし)
          this.whipVelX = 0;
          this.state    = "stunned";
          this.stateTimer = 1.6;
          this.actionCooldown = 1.6;
          this.cornered = true;
        } else {
          // ロープで跳ね返り
          this.whipVelX = -this.whipVelX * 0.95;
          this.state    = "rebounding";
          this.stateTimer = 2.0;
          this.actionCooldown = 2.0;
          this.facingAngle = this.whipVelX > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
        }
      } else {
        this.root.position.x = Math.max(-RING_BOUNDS, Math.min(RING_BOUNDS, newX));
      }
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) { this.state = "idle"; this.cornered = false; }
    }

    // State timers
    if (this.stateTimer > 0 && this.state !== "whipped" && this.state !== "rebounding") {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        switch (this.state) {
          case "striking":
          case "running_strike":
          case "corner_splash":
          case "slamming":
          case "signature":
            this.state = "idle";
            break;
          case "taunting":
            this.state = "idle";
            this.momentum = Math.min(100, this.momentum + 20); // タント成功でモメンタム +20
            break;
          case "pinning":
            this.state = "idle";
            break;
          case "stunned":
            this.state = "idle";
            break;
        }
      }
    }

    // Knockdown
    if (this.state === "knockdown") {
      this.knockdownTimer -= dt;
      if (this.knockdownTimer <= 0) {
        this.state = "getting_up";
        this.stateTimer = 0.8;
      }
    }
    if (this.state === "being_slammed") {
      if (this.stateTimer <= 0) {
        this.startKnockdown();
      }
    }
    if (this.state === "getting_up" && this.stateTimer <= 0) {
      this.state = "idle";
    }

    // Smooth facing
    const targetAngle = this.facingAngle;
    const current = this.root.rotation.y;
    const diff = ((targetAngle - current + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    this.root.rotation.y += diff * Math.min(1, 12 * dt);

    // Animate
    this.animate(dt);
    this.applyFlash();
  }

  private walkCycle = 0;
  private strikeCycle = 0;

  private animate(dt: number): void {
    const state = this.state;

    if (state === "idle") {
      this.idleBreathing(dt);
      return;
    }

    if (state === "walking" || state === "sprinting") {
      const speed = state === "sprinting" ? 10 : 6;
      this.walkCycle += dt * speed;
      const s = Math.sin(this.walkCycle);
      const c = Math.cos(this.walkCycle);
      this.upperLegL.rotation.x = s * 0.5;
      this.upperLegR.rotation.x = -s * 0.5;
      this.upperArmL.rotation.x = -s * 0.4;
      this.upperArmR.rotation.x = s * 0.4;
      return;
    }

    if (state === "striking") {
      this.strikeCycle += dt * 15;
      const t = Math.min(1, this.strikeCycle / (Math.PI * 0.5));
      this.upperArmR.rotation.x = -Math.sin(t * Math.PI) * 1.2;
      if (this.strikeCycle > Math.PI) this.strikeCycle = 0;
      return;
    }

    if (state === "running_strike") {
      // 両腕を前方に突き出すモーション
      this.strikeCycle += dt * 18;
      const t = Math.min(1, this.strikeCycle / (Math.PI * 0.5));
      this.upperArmL.rotation.x = -Math.sin(t * Math.PI) * 1.4;
      this.upperArmR.rotation.x = -Math.sin(t * Math.PI) * 1.4;
      this.torso.rotation.x     = Math.sin(t * Math.PI) * 0.25;
      if (this.strikeCycle > Math.PI) this.strikeCycle = 0;
      return;
    }

    if (state === "corner_splash") {
      // 全身を前方に叩き付けるモーション
      this.strikeCycle += dt * 20;
      const t = Math.min(1, this.strikeCycle / (Math.PI * 0.5));
      const s = Math.sin(t * Math.PI);
      this.upperArmL.rotation.x = -s * 1.6;
      this.upperArmR.rotation.x = -s * 1.6;
      this.upperArmL.rotation.z =  s * 0.5;
      this.upperArmR.rotation.z = -s * 0.5;
      this.torso.rotation.x     =  s * 0.35;
      this.root.position.y = THREE.MathUtils.lerp(this.root.position.y, MAT_Y + s * 0.2, 0.15);
      if (this.strikeCycle > Math.PI) this.strikeCycle = 0;
      return;
    }

    if (state === "taunting") {
      // 両腕を広げてガッツポーズ
      this.breathTimer += dt * 4;
      this.upperArmL.rotation.x = Math.sin(this.breathTimer) * 0.4 - 0.6;
      this.upperArmR.rotation.x = Math.sin(this.breathTimer) * 0.4 - 0.6;
      this.upperArmL.rotation.z =  0.8;
      this.upperArmR.rotation.z = -0.8;
      this.head.rotation.x = 0.3; // 上を向く
      return;
    }

    if (state === "victory") {
      // 両腕を高く突き上げてジャンプを繰り返す勝利ポーズ
      this.breathTimer += dt * 6;
      const jump = Math.max(0, Math.sin(this.breathTimer)) * 0.35;
      this.root.position.y = MAT_Y + jump;
      this.upperArmL.rotation.x = -2.6;
      this.upperArmR.rotation.x = -2.6;
      this.upperArmL.rotation.z =  0.25 + Math.sin(this.breathTimer * 2) * 0.15;
      this.upperArmR.rotation.z = -0.25 - Math.sin(this.breathTimer * 2) * 0.15;
      this.head.rotation.x = 0.35;
      this.torso.rotation.x = -0.08;
      return;
    }

    if (state === "submitting") {
      // 前傾みで締め上げ
      this.breathTimer += dt * 5;
      this.torso.rotation.x = 0.35;
      this.upperArmL.rotation.x = 0.9 + Math.sin(this.breathTimer) * 0.15;
      this.upperArmR.rotation.x = 0.9 + Math.sin(this.breathTimer) * 0.15;
      this.upperArmL.rotation.z =  0.3;
      this.upperArmR.rotation.z = -0.3;
      this.root.rotation.x = THREE.MathUtils.lerp(this.root.rotation.x, 0, 0.1);
      this.root.position.y = THREE.MathUtils.lerp(this.root.position.y, MAT_Y, 0.1);
      return;
    }

    if (state === "in_submission") {
      // 半身で苦悶
      this.breathTimer += dt * 8;
      this.root.rotation.x = THREE.MathUtils.lerp(this.root.rotation.x, -Math.PI / 3, 0.08);
      this.root.position.y = THREE.MathUtils.lerp(this.root.position.y, MAT_Y + 0.05, 0.1);
      this.upperArmL.rotation.x = -0.6 + Math.sin(this.breathTimer) * 0.3;
      this.upperArmR.rotation.x = -0.6 + Math.sin(this.breathTimer + 1) * 0.3;
      this.upperArmL.rotation.z =  0.5;
      this.upperArmR.rotation.z = -0.5;
      return;
    }

    if (state === "whipped" || state === "rebounding") {
      // Fast run animation toward/from ropes
      this.walkCycle += dt * 12;
      const s = Math.sin(this.walkCycle);
      this.upperLegL.rotation.x = s * 0.6;
      this.upperLegR.rotation.x = -s * 0.6;
      this.upperArmL.rotation.x = -s * 0.5;
      this.upperArmR.rotation.x = s * 0.5;
      // Lean forward when rebounding (charging)
      this.torso.rotation.x = state === "rebounding" ? 0.2 : -0.1;
      this.root.rotation.x  = THREE.MathUtils.lerp(this.root.rotation.x, 0, 0.15);
      this.root.position.y  = THREE.MathUtils.lerp(this.root.position.y, MAT_Y, 0.1);
      return;
    }

    if (state === "knockdown" || state === "being_slammed") {
      const progress = this.state === "being_slammed"
        ? Math.min(1, 1 - this.stateTimer / 1.2)
        : 1;
      this.root.rotation.x = THREE.MathUtils.lerp(
        this.root.rotation.x,
        -Math.PI / 2 * progress,
        0.15
      );
      this.root.position.y = THREE.MathUtils.lerp(
        this.root.position.y,
        MAT_Y + 0.05,
        0.1
      );
      return;
    }

    if (state === "getting_up") {
      this.root.rotation.x = THREE.MathUtils.lerp(this.root.rotation.x, 0, 0.1);
      this.root.position.y = THREE.MathUtils.lerp(this.root.position.y, MAT_Y, 0.1);
      return;
    }

    // Default: stand upright
    this.root.rotation.x = THREE.MathUtils.lerp(this.root.rotation.x, 0, 0.15);
    this.root.position.y = THREE.MathUtils.lerp(this.root.position.y, MAT_Y, 0.1);
  }

  private breathTimer = 0;
  private idleBreathing(dt: number): void {
    // Gassed: pant faster, hunch forward, arms on knees
    const breathSpeed = this.isGassed ? 5.0 : 1.5;
    const breathAmp   = this.isGassed ? 0.04 : 0.015;
    this.breathTimer += dt * breathSpeed;
    const b = Math.sin(this.breathTimer) * breathAmp;
    this.torso.scale.y = 1 + b;

    const torsoTarget = this.isGassed ? 0.28 : 0;
    const headTarget  = this.isGassed ? 0.25 : 0;
    const armXTarget  = this.isGassed ? 0.7  : 0.2;

    this.upperLegL.rotation.x = THREE.MathUtils.lerp(this.upperLegL.rotation.x, 0, 0.1);
    this.upperLegR.rotation.x = THREE.MathUtils.lerp(this.upperLegR.rotation.x, 0, 0.1);
    this.upperArmL.rotation.x = THREE.MathUtils.lerp(this.upperArmL.rotation.x, armXTarget, 0.1);
    this.upperArmR.rotation.x = THREE.MathUtils.lerp(this.upperArmR.rotation.x, armXTarget, 0.1);
    this.upperArmL.rotation.z = THREE.MathUtils.lerp(this.upperArmL.rotation.z, 0, 0.1);
    this.upperArmR.rotation.z = THREE.MathUtils.lerp(this.upperArmR.rotation.z, 0, 0.1);
    this.head.rotation.x      = THREE.MathUtils.lerp(this.head.rotation.x,  headTarget,  0.1);
    this.torso.rotation.x     = THREE.MathUtils.lerp(this.torso.rotation.x, torsoTarget, 0.1);
    this.root.rotation.x = THREE.MathUtils.lerp(this.root.rotation.x, 0, 0.1);
    this.root.position.y = THREE.MathUtils.lerp(this.root.position.y, MAT_Y, 0.1);
  }

  private applyFlash(): void {
    let emissive  = 0x000000;
    let intensity = 0;
    if (this.flashTimer > 0) {
      // ヒットフラッシュ (赤) — 最優先
      emissive  = 0xff2222;
      intensity = 0.5;
    } else if (this.isDanger) {
      // 瀕死パルス: 0.6 s 周期でオレンジに点滅
      const pulse = Math.sin(this.dangerPulseTimer * Math.PI / 0.6);
      if (pulse > 0) {
        emissive  = 0xff6600;
        intensity = pulse * 0.45;
      }
    }
    this.bodyMeshes.forEach((m) => {
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(emissive);
      mat.emissiveIntensity = intensity;
    });
  }
}
