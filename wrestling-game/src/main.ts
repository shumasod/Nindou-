import * as THREE from "three";
import { createRenderer, createCamera, createScene, setupLighting } from "./engine/renderer.js";
import { buildRing } from "./game/Ring.js";
import { InputManager } from "./engine/input.js";
import { Wrestler } from "./game/Wrestler.js";
import { CpuAI, type Difficulty } from "./game/CpuAI.js";
import { EffectsSystem } from "./engine/effects.js";
import { audio } from "./engine/audio.js";
import { ROSTER, type CharacterDef } from "./game/characters.js";
import { MatchTracker } from "./game/MatchStats.js";

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const container = document.getElementById("canvas-container")!;
const renderer  = createRenderer(container);
const camera    = createCamera();
const scene     = createScene();

setupLighting(scene);
buildRing(scene);

// ─── Wrestlers (created lazily after character select) ────────────────────────
let player1!: Wrestler;
let player2!: Wrestler;

function createWrestlers(def1: CharacterDef, def2: CharacterDef): void {
  // Remove old wrestlers if restarting
  if (player1) scene.remove(player1.root);
  if (player2) scene.remove(player2.root);

  player1 = new Wrestler({
    ...def1, startX: -2.5,
    finisherName: def1.finisher.name, finisherColor: def1.finisher.color,
    specialName:  def1.special.name,  specialColor:  def1.special.color,
  });
  player2 = new Wrestler({
    ...def2, startX: 2.5,
    finisherName: def2.finisher.name, finisherColor: def2.finisher.color,
    specialName:  def2.special.name,  specialColor:  def2.special.color,
  });
  player1.addToScene(scene);
  player2.addToScene(scene);
}

// ─── FX ───────────────────────────────────────────────────────────────────────
const effects = new EffectsSystem(scene);

// ─── Input (always create both; P2 used only in 2P mode) ─────────────────────
const input1 = new InputManager(1);
const input2 = new InputManager(2);

// ─── Game mode ────────────────────────────────────────────────────────────────
type GameMode   = "1p" | "2p";
type GamePhase  = "title" | "countdown" | "match" | "result" | "between_rounds";

let mode: GameMode  = "1p";
let phase: GamePhase = "title";
let cpuAI: CpuAI | null = null;
let tracker = new MatchTracker();

// ─── Tournament state ─────────────────────────────────────────────────────────
const WINS_NEEDED = 2;
const MAX_ROUNDS  = WINS_NEEDED * 2 - 1;

// P1 = blue, P2/CPU = red, draw = white
const WINNER_COLOR: Record<string, string> = {
  P1: "#4488ff", P2: "#ff4444", CPU: "#ff4444", DRAW: "#ffffff",
};

interface TournamentState {
  active: boolean;
  roundWins: { p1: number; p2: number };
  roundNum: number;
  def1: CharacterDef;
  def2: CharacterDef;
  diff?: Difficulty;
}

let tournament: TournamentState = {
  active: false,
  roundWins: { p1: 0, p2: 0 },
  roundNum: 1,
  def1: ROSTER[0]!,
  def2: ROSTER[0]!,
};

function p2Label(): string { return mode === "2p" ? "P2" : "CPU"; }

// ─── Submission state ─────────────────────────────────────────────────────────
interface SubState {
  active: boolean;
  holderSide: "p1" | "p2";
  subProgress:    number; // 0-1; hits 1 = tap-out
  escapeProgress: number; // 0-1; hits 1 = escape
}
let sub: SubState = { active: false, holderSide: "p1", subProgress: 0, escapeProgress: 0 };

const SUB_RATE    = 0.185; // fills in ~5.4 s without escape
const ESCAPE_JUMP = 0.12;  // added per distinct mash press

// ─── Pin kickout ──────────────────────────────────────────────────────────────
// 各サイドのキックアウト試行済みカウント (1カウント・2カウントで一度ずつ試行可能)
const kickoutAttempted: { p1: Set<number>; p2: Set<number> } = {
  p1: new Set(), p2: new Set(),
};

function resetKickout(): void {
  kickoutAttempted.p1.clear();
  kickoutAttempted.p2.clear();
}

/**
 * ピンカウント中のキックアウト判定。
 * カウント 1: HP% × 0.9 の確率で成功
 * カウント 2: HP% × 0.45 の確率で成功
 * カウント 3: 自動失敗 (checkMatchEnd が勝利を決定)
 */
function tryKickout(victim: Wrestler, pinner: Wrestler, victimSide: "p1" | "p2"): boolean {
  const count = Math.floor(pinner.pinCount); // 0, 1, 2
  if (count >= 2) return false; // カウント 3 はキックアウト不可
  if (kickoutAttempted[victimSide].has(count)) return false; // 同カウントで再試行不可
  kickoutAttempted[victimSide].add(count);

  const hpRatio = victim.hp / victim.maxHp;
  const chance  = count === 0 ? hpRatio * 0.9 : hpRatio * 0.45;
  if (Math.random() >= chance) return false;

  // キックアウト成功
  pinner.state = "idle";
  pinner.actionCooldown = 1.2;
  pinner.grappleTarget  = null;
  victim.state = "getting_up";
  victim.stateTimer = 0.9;
  victim.grappleTarget = null;
  resetKickout();
  return true;
}

// ─── Camera ───────────────────────────────────────────────────────────────────
const CAM_LERP  = 5;
const camTarget = new THREE.Vector3();
const camBase   = new THREE.Vector3();

function updateCamera(dt: number): void {
  const mid = new THREE.Vector3()
    .addVectors(player1.position, player2.position)
    .multiplyScalar(0.5);

  const desired = new THREE.Vector3(mid.x * 0.5, 8, mid.z * 0.3 + 14);
  camBase.lerp(desired, Math.min(1, CAM_LERP * dt));
  camera.position.copy(camBase);

  camTarget.lerp(new THREE.Vector3(mid.x, 0.8, mid.z), Math.min(1, CAM_LERP * dt));
  camera.lookAt(camTarget);
}

// ─── HUD refs ─────────────────────────────────────────────────────────────────
const hudP1Hp   = document.getElementById("player-hp")    as HTMLElement | null;
const hudP1Sta  = document.getElementById("player-sta")   as HTMLElement | null;
const hudP1Mom  = document.getElementById("player-mom")   as HTMLElement | null;
const hudP2Hp   = document.getElementById("cpu-hp")       as HTMLElement | null;
const hudP2Sta  = document.getElementById("cpu-sta")      as HTMLElement | null;
const hudTimer  = document.getElementById("match-timer")  as HTMLElement | null;
const hudPinDisp = document.getElementById("pin-display") as HTMLElement | null;
const hudCombo  = document.getElementById("combo-display") as HTMLElement | null;
const hudP1Name  = document.getElementById("hud-p1-name")  as HTMLElement | null;
const hudP2Name  = document.getElementById("hud-p2-name")  as HTMLElement | null;
const hudSubDisp = document.getElementById("sub-display")  as HTMLElement | null;
const hudSubBar  = document.getElementById("sub-bar")      as HTMLElement | null;
const hudEscBar  = document.getElementById("escape-bar")   as HTMLElement | null;
const hudCrowdBar = document.getElementById("crowd-bar")   as HTMLElement | null;

function pct(v: number): string {
  return `${Math.round(Math.max(0, Math.min(100, v)))}%`;
}

function hpColor(hp: number): string {
  if (hp > 50) return "linear-gradient(90deg,#27ae60,#2ecc71)";
  if (hp > 25) return "linear-gradient(90deg,#e67e22,#f39c12)";
  return "linear-gradient(90deg,#c0392b,#e74c3c)";
}

const MATCH_TIME_LIMIT = 180;

function updateHUD(elapsed: number): void {
  const p1HpPct = (player1.hp / player1.maxHp) * 100;
  const p2HpPct = (player2.hp / player2.maxHp) * 100;
  if (hudP1Hp)  { hudP1Hp.style.width  = pct(p1HpPct); hudP1Hp.style.background  = hpColor(p1HpPct); }
  if (hudP1Sta) {
    hudP1Sta.style.width = pct(player1.stamina);
    hudP1Sta.style.background = player1.isGassed
      ? "linear-gradient(90deg,#c0392b,#e67e22)"
      : "linear-gradient(90deg,#2980b9,#27ae60)";
    hudP1Sta.style.animation = player1.isGassed ? "dangerBlink 0.35s infinite alternate" : "";
  }
  if (hudP1Mom) {
    hudP1Mom.style.width = pct(player1.momentum);
    hudP1Mom.style.background = player1.momentumDecaying
      ? "linear-gradient(90deg,#c0392b,#e74c3c)"
      : "linear-gradient(90deg,#f39c12,#f1c40f)";
    hudP1Mom.style.animation = player1.momentum >= 100 ? "momPulse 0.5s infinite alternate" : "";
  }
  if (hudP2Hp)  { hudP2Hp.style.width  = pct(p2HpPct); hudP2Hp.style.background  = hpColor(p2HpPct); }
  if (hudP2Sta) {
    hudP2Sta.style.width = pct(player2.stamina);
    hudP2Sta.style.background = player2.isGassed
      ? "linear-gradient(90deg,#c0392b,#e67e22)"
      : "linear-gradient(90deg,#2980b9,#27ae60)";
    hudP2Sta.style.animation = player2.isGassed ? "dangerBlink 0.35s infinite alternate" : "";
  }

  if (hudTimer) {
    const rem = Math.max(0, MATCH_TIME_LIMIT - elapsed);
    const m = Math.floor(rem / 60);
    const s = Math.floor(rem % 60);
    hudTimer.textContent = `${m}:${s.toString().padStart(2, "0")}`;
    hudTimer.style.color = rem < 30 ? "#ff4444" : "#ffffff";
  }

  if (hudPinDisp) {
    const p1pin = player1.state === "pinning" && player2.state === "being_pinned";
    const p2pin = player2.state === "pinning" && player1.state === "being_pinned";
    if (p1pin || p2pin) {
      const pinner = p1pin ? player1 : player2;
      hudPinDisp.textContent   = Math.min(3, Math.floor(pinner.pinCount) + 1).toString();
      hudPinDisp.style.display = "block";
    } else {
      hudPinDisp.style.display = "none";
    }
  }

  showDanger(p1HpPct < 20, "p1-danger", "left:20px");
  showDanger(p2HpPct < 20, "p2-danger", "right:20px");
  showGrappleDrain(player1.state === "grappling", "p1-gdrain", "left:20px;top:115px");
  showGrappleDrain(player2.state === "grappling", "p2-gdrain", "right:20px;top:115px");
}

function showGrappleDrain(active: boolean, id: string, cssPos: string): void {
  let el = document.getElementById(id);
  if (!active) { if (el) el.style.display = "none"; return; }
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.textContent = "▼ STA";
    el.style.cssText = `position:absolute;${cssPos};color:#e67e22;font-size:10px;font-weight:bold;letter-spacing:2px;animation:dangerBlink 0.5s infinite alternate`;
    document.getElementById("hud")?.appendChild(el);
  }
  el.style.display = "block";
}

function showDanger(active: boolean, id: string, side: string): void {
  let el = document.getElementById(id);
  if (!active) { if (el) el.style.display = "none"; return; }
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.textContent = "DANGER!!";
    el.style.cssText = `position:absolute;${side};top:95px;color:#ff2222;font-size:12px;font-weight:bold;letter-spacing:2px;animation:dangerBlink 0.4s infinite alternate`;
    document.getElementById("hud")?.appendChild(el);
  }
  el.style.display = "block";
}

// ─── ガス欠 / ファイアアップフラッシュ追跡 ──────────────────────────────────
let p1WasGassed  = false;
let p2WasGassed  = false;
let p1WasDanger  = false;
let p2WasDanger  = false;

function checkGassedFlash(): void {
  if (player1.isGassed && !p1WasGassed) flashMoveName("P1 GASSED!!");
  if (player2.isGassed && !p2WasGassed) {
    const who = mode === "2p" ? "P2" : "CPU";
    flashMoveName(`${who} GASSED!!`);
  }
  p1WasGassed = player1.isGassed;
  p2WasGassed = player2.isGassed;
}

let p1WasMomDecay  = false;
let p2WasMomDecay  = false;
let p1WasCorner    = false;
let p2WasCorner    = false;

function checkCornerFlash(): void {
  const p1c = player1.isInCorner();
  const p2c = player2.isInCorner();
  if (p1c && !p1WasCorner) flashMoveName("P1 IN THE CORNER!");
  if (p2c && !p2WasCorner) flashMoveName(`${p2Label()} IN THE CORNER!`);
  p1WasCorner = p1c;
  p2WasCorner = p2c;
}

function checkMomentumDecayFlash(): void {
  if (player1.momentumDecaying && !p1WasMomDecay && player1.momentum > 10) {
    flashMoveName("USE IT OR LOSE IT!");
  }
  if (player2.momentumDecaying && !p2WasMomDecay && player2.momentum > 10) {
    if (mode === "2p") flashMoveName("USE IT OR LOSE IT!");
  }
  p1WasMomDecay = player1.momentumDecaying;
  p2WasMomDecay = player2.momentumDecaying;
}

// ─── グラップル疲弊ブレイク ────────────────────────────────────────────────────
function checkGrappleFatigue(): void {
  const tryBreak = (attacker: Wrestler, victim: Wrestler, attackerLabel: string): void => {
    if (attacker.state !== "grappling" || !attacker.isGassed) return;
    attacker.state = "idle";
    attacker.actionCooldown = 1.0;
    attacker.grappleTarget = null;
    if (victim.state === "grappled") {
      victim.state = "idle";
      victim.grappleTarget = null;
      victim.momentum = Math.min(100, victim.momentum + 20);
    }
    flashMoveName(`${attackerLabel} GRAPPLE BREAK!`);
    effects.shake(0.06);
    audio.punch();
    addCrowdPop(8);
  };
  tryBreak(player1, player2, "P1");
  tryBreak(player2, player1, p2Label());
}

function checkDangerFlash(): void {
  if (player1.isDanger && !p1WasDanger) {
    flashMoveName("P1 FIRED UP!!");
    effects.shake(0.08);
  }
  if (player2.isDanger && !p2WasDanger) {
    const who = mode === "2p" ? "P2" : "CPU";
    flashMoveName(`${who} FIRED UP!!`);
    effects.shake(0.08);
  }
  p1WasDanger = player1.isDanger;
  p2WasDanger = player2.isDanger;
}

// ─── クラウドメーター ─────────────────────────────────────────────────────────
const CROWD_HOT_THRESHOLD = 75;
const CROWD_DECAY         = 4;    // /s
const CROWD_MOM_BONUS     = 1.5;  // /s 両者へのモメンタム加算 (HOT 時)

let crowdMeter   = 0;
let wasHotCrowd  = false;

function addCrowdPop(amount: number): void {
  crowdMeter = Math.min(100, crowdMeter + amount);
}

function updateCrowd(dt: number): void {
  crowdMeter = Math.max(0, crowdMeter - CROWD_DECAY * dt);
  const hot = crowdMeter >= CROWD_HOT_THRESHOLD;
  if (hot) {
    player1.momentum = Math.min(100, player1.momentum + CROWD_MOM_BONUS * dt);
    player2.momentum = Math.min(100, player2.momentum + CROWD_MOM_BONUS * dt);
  }
  if (hudCrowdBar) {
    hudCrowdBar.style.width = `${crowdMeter}%`;
    hudCrowdBar.classList.toggle("hot", hot);
  }
}

function checkCrowdFlash(): void {
  const hot = crowdMeter >= CROWD_HOT_THRESHOLD;
  if (hot && !wasHotCrowd) flashMoveName("HOT CROWD!!");
  wasHotCrowd = hot;
}

// ─── 場外カウントアウト ───────────────────────────────────────────────────────
const RINGOUT_MAX   = 10;   // 10カウントで場外負け
const RINGOUT_SPEED = 0.95; // 1カウントに要する秒数

interface RingOutSide { count: number; secTimer: number; wasOutside: boolean }
let ringout: { p1: RingOutSide; p2: RingOutSide } = {
  p1: { count: 0, secTimer: 0, wasOutside: false },
  p2: { count: 0, secTimer: 0, wasOutside: false },
};

const hudRingoutDisp  = document.getElementById("ringout-display") as HTMLElement | null;
const hudRingoutWho   = document.getElementById("ringout-who")     as HTMLElement | null;
const hudRingoutCount = document.getElementById("ringout-count")   as HTMLElement | null;

function resetRingOut(): void {
  ringout = {
    p1: { count: 0, secTimer: 0, wasOutside: false },
    p2: { count: 0, secTimer: 0, wasOutside: false },
  };
  if (hudRingoutDisp) hudRingoutDisp.style.display = "none";
}

function updateRingOut(dt: number): void {
  let anyOutside = false;

  const sides: Array<{ side: "p1" | "p2"; wrestler: Wrestler }> = [
    { side: "p1", wrestler: player1 },
    { side: "p2", wrestler: player2 },
  ];

  for (const { side, wrestler } of sides) {
    const rs = ringout[side];
    if (!wrestler.isOutside) {
      if (rs.wasOutside && rs.count > 0) {
        rs.count = 0;
        rs.secTimer = 0;
        flashMoveName(`${side === "p1" ? "P1" : p2Label()} BACK IN!`);
      }
      rs.wasOutside = false;
      continue;
    }

    anyOutside = true;
    rs.wasOutside = true;
    rs.secTimer += dt;
    if (rs.secTimer >= RINGOUT_SPEED) {
      rs.secTimer -= RINGOUT_SPEED;
      rs.count++;
      audio.pinRoll();
      if (hudRingoutDisp) hudRingoutDisp.style.display = "block";
      if (hudRingoutWho)  hudRingoutWho.textContent   = side === "p1" ? "P1 — COUNT OUT" : `${p2Label()} — COUNT OUT`;
      if (hudRingoutCount) {
        hudRingoutCount.textContent = rs.count.toString();
        hudRingoutCount.style.animation = "none";
        void hudRingoutCount.offsetWidth;
        hudRingoutCount.style.animation = "ringoutPulse 0.85s infinite alternate";
      }
    }
  }

  if (!anyOutside && hudRingoutDisp) hudRingoutDisp.style.display = "none";
}

// ─── コンボカウンター ─────────────────────────────────────────────────────────
let comboCount = 0;
let comboTimer = 0;
const COMBO_WINDOW = 2.5;

function addCombo(): void {
  comboCount++;
  comboTimer = COMBO_WINDOW;
  tracker.recordCombo("p1", comboCount);
  if (hudCombo && comboCount >= 2) {
    hudCombo.style.display  = "block";
    hudCombo.textContent    = `${comboCount} HIT COMBO!`;
    hudCombo.style.fontSize = `${Math.min(36, 18 + comboCount * 2)}px`;
    hudCombo.style.animation = "none";
    void (hudCombo as HTMLElement).offsetWidth;
    hudCombo.style.animation = "comboZoom 0.15s ease-out";
  }
}

function updateCombo(dt: number): void {
  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) {
      comboCount = 0;
      if (hudCombo) hudCombo.style.display = "none";
    }
  }
}

// ─── サブミッション更新 ───────────────────────────────────────────────────────
function updateSubmission(dt: number): void {
  if (!sub.active) {
    if (hudSubDisp) hudSubDisp.style.display = "none";
    return;
  }
  const holder = sub.holderSide === "p1" ? player1 : player2;
  const victim = sub.holderSide === "p1" ? player2 : player1;

  // Abort if either wrestler left the state externally
  if (holder.state !== "submitting" || victim.state !== "in_submission") {
    sub.active = false;
    if (hudSubDisp) hudSubDisp.style.display = "none";
    return;
  }

  sub.subProgress    = Math.min(1, sub.subProgress    + SUB_RATE * dt);
  sub.escapeProgress = Math.min(1, sub.escapeProgress);

  // CPU auto-escape when CPU is the victim
  if (mode === "1p" && sub.holderSide === "p1" && cpuAI) {
    sub.escapeProgress = Math.min(1, sub.escapeProgress + cpuAI.escapeRate * dt);
  }

  // HUD
  if (hudSubDisp) hudSubDisp.style.display = "flex";
  if (hudSubBar)  hudSubBar.style.width  = `${sub.subProgress    * 100}%`;
  if (hudEscBar)  hudEscBar.style.width  = `${sub.escapeProgress * 100}%`;

  // Escape wins
  if (sub.escapeProgress >= 1) {
    sub.active = false;
    if (hudSubDisp) hudSubDisp.style.display = "none";
    holder.state = "idle";
    holder.actionCooldown = 1.0;
    victim.breakSubmission();
    flashMoveName("ESCAPED!!");
    effects.shake(0.1);
    audio.punch();
    return;
  }

  // Tap-out wins
  if (sub.subProgress >= 1) {
    sub.active = false;
    if (hudSubDisp) hudSubDisp.style.display = "none";
    holder.state = "idle";
    victim.hp = 0;
    showResult(sub.holderSide === "p1" ? "P1" : p2Label(), "SUBMISSION  ");
  }
}

// ─── カウントダウン ───────────────────────────────────────────────────────────
function showMatchStart(cb: () => void): void {
  const el = document.getElementById("match-start-msg")!;
  const roundLabel = tournament.active ? [`ROUND ${tournament.roundNum}`] : [];
  const msgs = [...roundLabel, "3", "2", "1", "FIGHT!"];
  let i = 0;
  function next(): void {
    const msg = msgs[i];
    if (msg === undefined) { el.style.display = "none"; cb(); return; }
    el.textContent = msg;
    el.style.display = "block";
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "countAnim 0.85s forwards";
    i++;
    setTimeout(next, 850);
  }
  next();
}

// ─── ゲーム状態 ───────────────────────────────────────────────────────────────
let matchElapsed = 0;

function pipStr(wins: number): string {
  return "★".repeat(wins) + "☆".repeat(Math.max(0, WINS_NEEDED - wins));
}

function updateWinPips(): void {
  const p1el = document.getElementById("p1-pips");
  const p2el = document.getElementById("p2-pips");
  if (!tournament.active) {
    if (p1el) p1el.style.display = "none";
    if (p2el) p2el.style.display = "none";
    return;
  }
  if (p1el) { p1el.style.display = "block"; p1el.textContent = pipStr(tournament.roundWins.p1); }
  if (p2el) { p2el.style.display = "block"; p2el.textContent = pipStr(tournament.roundWins.p2); }
}

function showRoundResult(winnerSide: "p1" | "p2" | "draw"): void {
  phase = "between_rounds";

  const winnerName = winnerSide === "p1" ? "P1" : winnerSide === "p2" ? p2Label() : "DRAW";

  const el       = document.getElementById("round-result-screen")!;
  const numEl    = document.getElementById("round-result-num")!;
  const winnerEl = document.getElementById("round-result-winner")!;
  const p1PipsEl = document.getElementById("round-p1-pips")!;
  const p2PipsEl = document.getElementById("round-p2-pips")!;
  const p1NameEl = document.getElementById("round-p1-name")!;
  const p2NameEl = document.getElementById("round-p2-name")!;
  const nextMsg  = document.getElementById("round-next-msg")!;

  numEl.textContent    = `ROUND ${tournament.roundNum} COMPLETE`;
  winnerEl.textContent = winnerSide === "draw" ? "ROUND DRAW" : `${winnerName} WINS THE ROUND!`;
  winnerEl.style.color = WINNER_COLOR[winnerName] ?? "#ffffff";
  p1NameEl.textContent = player1.name;
  p2NameEl.textContent = player2.name;
  p1PipsEl.textContent = pipStr(tournament.roundWins.p1);
  p2PipsEl.textContent = pipStr(tournament.roundWins.p2);
  el.style.display     = "flex";

  // Countdown until next round — interval owns all text updates
  let secs = 5;
  const nextRound = tournament.roundNum + 1;
  const iv = setInterval(() => {
    secs--;
    if (secs > 0) {
      nextMsg.textContent = `ROUND ${nextRound} STARTS IN ${secs}...`;
    } else {
      clearInterval(iv);
      el.style.display = "none";
      startNextRound();
    }
  }, 1000);
}

function startNextRound(): void {
  tournament.roundNum++;
  tracker = new MatchTracker();
  matchElapsed = 0;
  comboCount = 0;
  comboTimer = 0;
  sub = { active: false, holderSide: "p1", subProgress: 0, escapeProgress: 0 };
  p1WasDanger   = false;
  p2WasDanger   = false;
  p1WasMomDecay = false;
  p2WasMomDecay = false;
  p1WasCorner   = false;
  p2WasCorner   = false;
  crowdMeter    = 0;
  wasHotCrowd   = false;
  resetRingOut();
  resetKickout();
  if (hudCombo) hudCombo.style.display = "none";

  createWrestlers(tournament.def1, tournament.def2);
  if (mode === "1p") {
    cpuAI = new CpuAI(player2, player1, effects, tournament.diff ?? "normal");
  }

  phase = "countdown";
  clock.start();
  showMatchStart(() => { phase = "match"; audio.crowd(); });
}

function showResult(winner: string, reason = ""): void {
  if (!tournament.active) { showFinalResult(winner, reason); return; }

  if (winner !== "DRAW") {
    const side = winner === "P1" ? "p1" : "p2";
    tournament.roundWins[side]++;
    updateWinPips();
    const clinched = tournament.roundWins.p1 >= WINS_NEEDED || tournament.roundWins.p2 >= WINS_NEEDED;
    clinched ? showFinalResult(winner, reason) : showRoundResult(side);
  } else {
    tournament.roundNum < MAX_ROUNDS ? showRoundResult("draw") : showFinalResult("DRAW", reason);
  }
}

function showFinalResult(winner: string, reason = ""): void {
  phase = "result";
  const el  = document.getElementById("result-screen");
  const txt = document.getElementById("result-text");
  const sub = document.getElementById("result-sub");
  const statsEl = document.getElementById("result-stats");
  if (el)  el.style.display = "flex";
  if (txt) {
    const label = tournament.active
      ? (winner === "DRAW" ? "TOURNAMENT DRAW" : `${winner} WINS THE CHAMPIONSHIP!`)
      : (winner === "DRAW" ? "TIME UP! DRAW"    : `${winner} WINS!`);
    txt.textContent = label;
    txt.style.color = WINNER_COLOR[winner] ?? "#ffffff";
  }
  if (sub) {
    const m = Math.floor(matchElapsed / 60);
    const s = Math.floor(matchElapsed % 60);
    const roundInfo = tournament.active
      ? `ROUND ${tournament.roundNum}  `
      : "";
    sub.textContent = `${roundInfo}${reason}MATCH TIME  ${m}:${s.toString().padStart(2, "0")}`;
  }
  if (statsEl) {
    const p1n = player1.name;
    const p2n = player2.name;
    const s1  = tracker.stats.p1;
    const s2  = tracker.stats.p2;
    const champRow = tournament.active
      ? statRow(tournament.roundWins.p1, tournament.roundWins.p2, "ROUNDS WON")
      : "";
    statsEl.innerHTML = `
      <table class="stats-table">
        <thead><tr><th>${p1n}</th><th></th><th>${p2n}</th></tr></thead>
        <tbody>
          ${champRow}
          ${statRow(s1.strikesLanded,    s2.strikesLanded,    "STRIKES")}
          ${statRow(s1.slamsLanded,      s2.slamsLanded,      "SLAMS")}
          ${statRow(s1.signaturesMade,   s2.signaturesMade,   "SIGNATURES")}
          ${statRow(s1.reversals,        s2.reversals,        "REVERSALS")}
          ${statRow(Math.round(s1.totalDamage), Math.round(s2.totalDamage), "DAMAGE")}
          ${statRow(s1.knockdownsCaused, s2.knockdownsCaused, "KNOCKDOWNS")}
          ${statRow(s1.pinAttempts,      s2.pinAttempts,      "PINS")}
          ${statRow(s1.maxCombo,         s2.maxCombo,         "MAX COMBO")}
        </tbody>
      </table>`;
  }
}

function statRow(v1: number, v2: number, label: string): string {
  const hi1 = v1 > v2 ? " class=\"stat-hi\"" : "";
  const hi2 = v2 > v1 ? " class=\"stat-hi\"" : "";
  return `<tr><td${hi1}>${v1}</td><td class="stat-label">${label}</td><td${hi2}>${v2}</td></tr>`;
}

// ─── Clock ────────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

// ─── Render loop ─────────────────────────────────────────────────────────────
function animate(): void {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (phase === "match") {
    matchElapsed += dt;
    handleInput(player1, input1, player2, dt, "p1");
    if (mode === "2p") {
      handleInput(player2, input2, player1, dt, "p2");
    } else {
      cpuAI?.update(dt);
      // CPU ロープブレイク (Hard ≈ 0.33s 待機, Normal ≈ 0.61s, Easy は不使用)
      if (cpuAI && player2.canRopeBreak() && Math.random() < cpuAI.ropeBreakChance * dt * 3) {
        doRopeBreak("p2");
      }
      // CPU 場外カウントアウト: リングに戻る
      if (player2.isOutside) {
        const cx = -player2.position.x;
        const cz = -player2.position.z;
        const len = Math.sqrt(cx * cx + cz * cz) || 1;
        player2.move(cx / len, cz / len, false, dt);
      }
      // CPU キックアウト試行 (難易度に応じた確率で自動試行)
      if (cpuAI && player2.state === "being_pinned" && Math.random() < cpuAI.ropeBreakChance * dt * 2) {
        if (tryKickout(player2, player1, "p2")) {
          flashMoveName("CPU KICKOUT!!");
          effects.spawnHitSparks(player2.position, 0x00ff88);
          effects.shake(0.12);
          audio.punch();
          addCrowdPop(14);
        }
      }
    }
    player1.update(dt);
    player2.update(dt);
    updateCamera(dt);
    effects.update(dt, camera);
    updateCombo(dt);
    updateSubmission(dt);
    updateRingOut(dt);
    checkGrappleFatigue();
    checkGassedFlash();
    checkDangerFlash();
    checkMomentumDecayFlash();
    checkCornerFlash();
    updateCrowd(dt);
    checkCrowdFlash();
    updateHUD(matchElapsed);
    checkMatchEnd();
  } else if (phase === "countdown") {
    updateCamera(dt);
  }

  input1.flush(); // グローバルキーストアの flush は1回でよい
  renderer.render(scene, camera);
}
animate();

// ─── 汎用入力処理 ─────────────────────────────────────────────────────────────
function handleInput(
  self: Wrestler,
  inp: InputManager,
  opponent: Wrestler,
  dt: number,
  side: "p1" | "p2"
): void {
  const s = inp.state;
  const trackCombo = side === "p1";

  let dx = 0, dz = 0;
  if (s.left)  dx -= 1;
  if (s.right) dx += 1;
  if (s.up)    dz -= 1;
  if (s.down)  dz += 1;
  if (dx !== 0 && dz !== 0) { dx *= 1 / Math.SQRT2; dz *= 1 / Math.SQRT2; }

  self.move(dx, dz, s.sprint, dt);
  self.faceTarget(opponent);

  // ロープブレイク — ロープ際でピン or サブミッションから脱出
  if (self.canRopeBreak()) {
    const anyPress = s.strikePressed || s.grapplePressed || s.slamPressed ||
                     s.signaturePressed || s.pinPressed || s.tauntPressed;
    if (anyPress) { doRopeBreak(side); return; }
  }

  // ピンのキックアウト — カウント中にボタン連打で脱出試行
  if (self.state === "being_pinned") {
    const anyPress = s.strikePressed || s.grapplePressed || s.slamPressed ||
                     s.signaturePressed || s.pinPressed || s.tauntPressed;
    if (anyPress) {
      const pinner = side === "p1" ? player2 : player1;
      if (tryKickout(self, pinner, side)) {
        flashMoveName("KICKOUT!!");
        effects.spawnHitSparks(self.position, 0x00ff88);
        effects.shake(0.12);
        audio.punch();
        addCrowdPop(16);
      }
    }
    return;
  }

  // サブミッション中の脱出 (被攻撃側がボタンを連打)
  if (self.state === "in_submission" && sub.active) {
    const anyPress = s.strikePressed || s.grapplePressed || s.slamPressed ||
                     s.signaturePressed || s.pinPressed || s.tauntPressed;
    if (anyPress) sub.escapeProgress = Math.min(1, sub.escapeProgress + ESCAPE_JUMP);
    return;
  }

  // ストライクカウンター — 被弾直後の G でスタン反撃
  if (s.grapplePressed && self.canCounter()) {
    self.counterWindow = 0;
    opponent.state = "stunned";
    opponent.stateTimer = 0.7;
    opponent.actionCooldown = 0.7;
    const dmg = (5 + Math.random() * 4) * self.damageMult;
    opponent.takeDamage(dmg);
    self.momentum = Math.min(100, self.momentum + 12);
    effects.spawnHitSparks(opponent.position, 0x00ffff);
    effects.spawnHitSparks(opponent.position, 0xffffff);
    effects.shake(0.1);
    audio.punch();
    addCrowdPop(10);
    tracker.recordStrike(side, dmg, false);
    if (side === "p1") addCombo();
    flashMoveName("COUNTER!!");
    return;
  }

  // リバーサル — グラップルされた直後に G を押す
  if (s.grapplePressed && self.canReversal()) {
    self.doReversal();
    tracker.recordReversal(side);
    effects.spawnHitSparks(self.position, 0x00ffff);
    effects.shake(0.1);
    audio.punch();
    flashMoveName("REVERSAL!!");
    return;
  }

  if (!self.isActionReady()) return;

  // Taunt (T / B) — ハイリスク・ハイリターン
  if (s.tauntPressed && self.state === "idle") {
    self.startTaunt();
    audio.crowd();
    flashMoveName("TAUNT!");
  }

  // Strike (F / U)
  if (s.strikePressed && self.canStrike(opponent)) {
    const isRunning = self.isSprinting;
    const isCornerSplash = isRunning && opponent.isInCorner() && self.distanceTo(opponent) < 2.5;
    const isClothesline = !isRunning && opponent.isRebounding();

    if (isCornerSplash) {
      // コーナースプラッシュ — コーナーに追い詰めた相手への特大打撃
      self.startCornerSplash();
      const dmg = (22 + Math.random() * 8) * self.damageMult;
      opponent.takeDamage(dmg);
      opponent.startKnockdown();   // コーナー技は必ずダウン
      onKnockdown(opponent, opponent.name, self.name);
      effects.spawnHitSparks(opponent.position, 0xff2200);
      effects.spawnHitSparks(opponent.position, 0xffaa00);
      effects.spawnHitSparks(opponent.position, 0xffffff);
      effects.shake(0.3);
      audio.slam();
      audio.crowd();
      addCrowdPop(22);
      tracker.recordStrike(side, dmg, true);
      if (trackCombo) addCombo();
      flashMoveName("CORNER SPLASH!!");
    } else if (isClothesline) {
      // クロスライン — リバウンド中の相手を迎撃する高威力打撃
      self.startStrike();
      const dmg = (16 + Math.random() * 6) * self.damageMult;
      opponent.takeDamage(dmg);
      const knockdown = opponent.hp < 55;
      const outsideKD = knockdown && opponent.isNearRope();
      if (knockdown) { opponent.startKnockdown(outsideKD); onKnockdown(opponent, opponent.name, self.name); }
      else { opponent.state = "stunned"; opponent.openCounterWindow(); }
      effects.spawnHitSparks(opponent.position, 0xff2200);
      effects.spawnHitSparks(opponent.position, 0xffaa00);
      effects.shake(0.22);
      audio.slam();
      addCrowdPop(knockdown ? (outsideKD ? 20 : 15) : 8);
      tracker.recordStrike(side, dmg, knockdown);
      if (trackCombo) addCombo();
      if (!knockdown) flashMoveName("CLOTHESLINE!!");
      else if (outsideKD) flashMoveName("KNOCKED OUT OF THE RING!!");
    } else if (isRunning) {
      // ランニングストライク — 1.5 倍ダメージ
      self.startRunningStrike();
      const dmg = (14 + Math.random() * 6) * self.damageMult;
      opponent.takeDamage(dmg);
      const knockdown = opponent.hp < 35;
      const outsideKD = knockdown && opponent.isNearRope();
      if (knockdown) { opponent.startKnockdown(outsideKD); onKnockdown(opponent, opponent.name, self.name); }
      else opponent.openCounterWindow();
      effects.spawnHitSparks(opponent.position, 0xff2200);
      effects.spawnHitSparks(opponent.position, 0xffaa00);
      effects.shake(0.18);
      audio.slam();
      addCrowdPop(knockdown ? (outsideKD ? 18 : 12) : 5);
      tracker.recordStrike(side, dmg, knockdown);
      if (trackCombo) addCombo();
      if (!knockdown) flashMoveName("RUNNING STRIKE!!");
      else if (outsideKD) flashMoveName("KNOCKED OUT OF THE RING!!");
    } else {
      self.startStrike();
      const dmg = (8 + Math.random() * 4) * self.damageMult;
      opponent.takeDamage(dmg);
      const knockdown = opponent.hp < 25;
      if (knockdown) { opponent.startKnockdown(); onKnockdown(opponent, opponent.name, self.name); }
      else opponent.openCounterWindow();
      effects.spawnHitSparks(opponent.position, 0xff6600);
      effects.shake(0.08);
      audio.punch();
      addCrowdPop(knockdown ? 10 : 3);
      tracker.recordStrike(side, dmg, knockdown);
      if (trackCombo) addCombo();
      if (!knockdown) flashMoveName("STRIKE!");
    }
  }

  // Submission (G near knocked-down opponent — takes priority over grapple)
  if (s.grapplePressed && !sub.active && self.canSubmit(opponent)) {
    self.startSubmission(opponent);
    sub = { active: true, holderSide: side, subProgress: 0, escapeProgress: 0 };
    addCrowdPop(12);
    flashMoveName("SUBMISSION HOLD!");
    audio.crowd();
  }

  // Grapple / Slam follow-up (G)
  if (s.grapplePressed) {
    if (self.state === "grappling" && self.grappleTarget) {
      const t = self.grappleTarget;
      self.startSlam(t);
      const dmg = 18 * self.damageMult;
      t.takeDamage(dmg);
      effects.spawnDust(t.position);
      effects.shake(0.18);
      audio.slam();
      addCrowdPop(8);
      tracker.recordSlam(side, dmg);
      if (trackCombo) addCombo();
      flashMoveName("SLAM!");
    } else if (self.canGrapple(opponent)) {
      self.startGrapple(opponent);
      flashMoveName("GRAPPLE!");
    }
  }

  // Irish Whip (H / N) while grappling — throw opponent into ropes
  if (s.slamPressed && self.canWhip(opponent)) {
    self.startWhip(opponent);
    effects.spawnDust(opponent.position);
    audio.slam();
    flashMoveName("IRISH WHIP!");
  }

  // Finisher (Signature with character-specific name + burst)
  if (s.signaturePressed && self.momentum >= 100 && self.canGrapple(opponent)) {
    self.startSignature(opponent);
    const dmg = 35 * self.damageMult;
    opponent.takeDamage(dmg);
    effects.spawnFinisherBurst(opponent.position, self.finisherColor);
    effects.shake(0.5);
    audio.slam();
    audio.crowd();
    addCrowdPop(30);
    tracker.recordSignature(side, dmg);
    if (trackCombo) addCombo();
    flashFinisher(self.name, self.finisherName, self.finisherColor);
  }

  // Pin
  if (s.pinPressed && opponent.isDown() && self.distanceTo(opponent) < 1.5) {
    self.startPin();
    opponent.state = "being_pinned";
    audio.pinRoll();
    tracker.recordPin(side);
    flashMoveName("PIN!");
  }
}

// ─── TKO フラッシュ ──────────────────────────────────────────────────────────
const KD_LABELS = ["1ST KNOCKDOWN!", "2ND KNOCKDOWN!", "TKO!!"];

/** ノックダウン後に呼ぶ — 回数に応じたメッセージ + TKO 判定 */
function onKnockdown(victim: typeof player1, victimLabel: string, winnerLabel: string): void {
  const n = victim.knockdownCount; // startKnockdown() で既にインクリメント済み
  const label = KD_LABELS[Math.min(n, KD_LABELS.length) - 1];
  if (label) flashMoveName(`${victimLabel} ${label}`);
  addCrowdPop(n >= 3 ? 30 : 12);
  if (n >= 3) {
    effects.shake(0.4);
    audio.crowd();
    showResult(winnerLabel, "TKO  ");
  }
}

// ─── Match end ────────────────────────────────────────────────────────────────
function checkMatchEnd(): void {
  if (phase !== "match") return;

  const p2Label = mode === "2p" ? "P2" : "CPU";

  if (player1.hp <= 0) { showResult(p2Label); return; }
  if (player2.hp <= 0) { showResult("P1");    return; }

  if (player1.state === "pinning" && player2.state === "being_pinned") {
    player1.pinCount += 1 / 60;
    if (player1.pinCount >= 3) { showResult("P1", "PINFALL  "); return; }
  }
  if (player2.state === "pinning" && player1.state === "being_pinned") {
    player2.pinCount += 1 / 60;
    if (player2.pinCount >= 3) { showResult(p2Label, "PINFALL  "); return; }
  }

  // 場外カウントアウト (10カウント到達)
  if (ringout.p1.count >= RINGOUT_MAX) {
    if (hudRingoutDisp) hudRingoutDisp.style.display = "none";
    effects.shake(0.35); audio.crowd();
    showResult(p2Label, "COUNT OUT  ");
    return;
  }
  if (ringout.p2.count >= RINGOUT_MAX) {
    if (hudRingoutDisp) hudRingoutDisp.style.display = "none";
    effects.shake(0.35); audio.crowd();
    showResult("P1", "COUNT OUT  ");
    return;
  }

  if (matchElapsed >= MATCH_TIME_LIMIT) {
    if (player1.hp > player2.hp)      showResult("P1",    "TIME UP  ");
    else if (player2.hp > player1.hp) showResult(p2Label, "TIME UP  ");
    else                               showResult("DRAW",  "TIME UP  ");
  }
}

// ─── ロープブレイク ───────────────────────────────────────────────────────────
function doRopeBreak(victimSide: "p1" | "p2"): void {
  const victim = victimSide === "p1" ? player1 : player2;
  const holder = victimSide === "p1" ? player2 : player1;

  if (victim.state === "being_pinned") {
    holder.state = "idle";
    holder.actionCooldown = 1.2;
    victim.state = "knockdown";
    victim.knockdownTimer = 1.5;
  } else if (victim.state === "in_submission" && sub.active) {
    sub.active = false;
    if (hudSubDisp) hudSubDisp.style.display = "none";
    holder.state = "idle";
    holder.actionCooldown = 1.5;
    victim.breakSubmission(); // → startKnockdown() resets ropeBreakUsed
  }

  victim.ropeBreakUsed = true; // 消費済みにする (startKnockdown のリセットを上書き)
  effects.shake(0.15);
  audio.punch();
  flashMoveName("ROPE BREAK!");
}

// ─── Move name flash ─────────────────────────────────────────────────────────
let flashTimeout: ReturnType<typeof setTimeout> | null = null;

function flashMoveName(text: string): void {
  const el = document.getElementById("move-name");
  if (!el) return;
  el.textContent   = text;
  el.style.opacity = "1";
  if (flashTimeout) clearTimeout(flashTimeout);
  flashTimeout = setTimeout(() => { el.style.opacity = "0"; }, 900);
}

function flashFinisher(wrestlerName: string, moveName: string, color: number): void {
  const banner  = document.getElementById("finisher-banner");
  const nameEl  = document.getElementById("finisher-wrestler-label");
  const moveEl  = document.getElementById("finisher-move-label");
  if (!banner || !nameEl || !moveEl) return;

  const r = (color >> 16) & 0xff;
  const g = (color >> 8)  & 0xff;
  const b =  color        & 0xff;
  const css = `rgb(${r},${g},${b})`;

  nameEl.textContent = wrestlerName;
  moveEl.textContent = moveName;
  moveEl.style.color = css;

  banner.style.display   = "block";
  banner.style.animation = "none";
  void banner.offsetWidth;
  banner.style.animation = "finisherAppear 1.9s forwards";
  setTimeout(() => { banner.style.display = "none"; }, 1900);
}

// ─── 起動 ─────────────────────────────────────────────────────────────────────
function startMatch(
  selectedMode: GameMode,
  def1: CharacterDef,
  def2: CharacterDef,
  diff?: Difficulty,
  bo3 = false
): void {
  mode = selectedMode;

  // Initialise tournament state
  tournament = {
    active: bo3,
    roundWins: { p1: 0, p2: 0 },
    roundNum: 1,
    def1,
    def2,
    diff,
  };
  updateWinPips();

  matchElapsed = 0;
  createWrestlers(def1, def2);

  if (hudP1Name) hudP1Name.textContent = def1.name;
  if (hudP2Name) hudP2Name.textContent = def2.name;

  if (selectedMode === "1p" && diff) {
    cpuAI = new CpuAI(player2, player1, effects, diff);
  }

  const p2hint = document.getElementById("p2-controls");
  if (p2hint) p2hint.style.display = selectedMode === "2p" ? "inline" : "none";

  tracker = new MatchTracker();
  sub = { active: false, holderSide: "p1", subProgress: 0, escapeProgress: 0 };
  p1WasGassed = false;
  p2WasGassed = false;
  p1WasDanger  = false;
  p2WasDanger  = false;
  p1WasMomDecay = false;
  p2WasMomDecay = false;
  p1WasCorner  = false;
  p2WasCorner  = false;
  crowdMeter   = 0;
  wasHotCrowd  = false;
  resetRingOut();
  resetKickout();
  phase = "countdown";
  clock.start();
  showMatchStart(() => { phase = "match"; audio.crowd(); });
}

// ─── キャラクター選択フロー ───────────────────────────────────────────────────
interface SelectState {
  mode: GameMode;
  diff?: Difficulty;
  bo3: boolean;
  step: 1 | 2;        // P1 選択中 or P2 選択中
  p1Def?: CharacterDef;
  selectedIdx: number | null;
}

const sel: SelectState = { mode: "1p", bo3: false, step: 1, selectedIdx: null };

function openCharSelect(m: GameMode, d?: Difficulty, bo3 = false): void {
  sel.mode  = m;
  sel.diff  = d;
  sel.bo3   = bo3;
  sel.step  = 1;
  sel.p1Def = undefined;
  sel.selectedIdx = null;

  const screen = document.getElementById("char-select-screen")!;
  const title  = document.getElementById("char-select-title")!;
  const sub    = document.getElementById("char-select-sub")!;
  const confirm = document.getElementById("char-confirm-btn") as HTMLButtonElement;

  screen.style.display = "flex";
  title.textContent = bo3 ? "CHAMPIONSHIP — SELECT FIGHTER" : "SELECT YOUR FIGHTER";
  sub.textContent   = "P1 — choose your character";
  confirm.disabled  = true;

  buildCharGrid(confirm);
}

function buildCharGrid(confirmBtn: HTMLButtonElement): void {
  const grid = document.getElementById("char-grid")!;
  grid.innerHTML = "";

  ROSTER.forEach((ch, i) => {
    const card = document.createElement("div");
    card.className = "char-card";
    card.dataset["idx"] = String(i);

    // カラースウォッチ
    const r = (ch.primaryColor >> 16) & 0xff;
    const g = (ch.primaryColor >> 8)  & 0xff;
    const b =  ch.primaryColor        & 0xff;
    const r2 = (ch.secondaryColor >> 16) & 0xff;
    const g2 = (ch.secondaryColor >> 8)  & 0xff;
    const b2 =  ch.secondaryColor        & 0xff;

    card.innerHTML = `
      <div class="char-swatch" style="background:linear-gradient(135deg,rgb(${r},${g},${b}),rgb(${r2},${g2},${b2}))"></div>
      <div class="char-name">${ch.name}</div>
      <div class="char-title-text">${ch.title}</div>
      <div class="stat-bars">
        ${statBar("SPD", ch.speedMult,   1.6)}
        ${statBar("PWR", ch.damageMult,  1.6)}
        ${statBar("DEF", 1 / ch.defenceMult, 1.6)}
        ${statBar("STA", ch.staminaMult, 1.6)}
        ${statBar("HP",  ch.maxHp / 130, 1.0)}
      </div>`;

    card.addEventListener("click", () => {
      grid.querySelectorAll(".char-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      sel.selectedIdx = i;
      confirmBtn.disabled = false;
    });

    grid.appendChild(card);
  });
}

function statBar(label: string, value: number, max: number): string {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return `<div class="stat-row">
    <span style="width:24px">${label}</span>
    <div class="stat-fill"><div class="stat-fill-inner" style="width:${pct}%;background:#4af"></div></div>
  </div>`;
}

// Confirm ボタン
document.getElementById("char-confirm-btn")?.addEventListener("click", () => {
  if (sel.selectedIdx === null) return;
  const chosen = ROSTER[sel.selectedIdx]!;

  if (sel.step === 1) {
    sel.p1Def = chosen;

    if (sel.mode === "1p") {
      // CPU は自動でランダム選択
      const cpuDef = ROSTER[Math.floor(Math.random() * ROSTER.length)]!;
      document.getElementById("char-select-screen")!.style.display = "none";
      startMatch("1p", chosen, cpuDef, sel.diff, sel.bo3);
    } else {
      // 2P: P2 選択へ
      sel.step = 2;
      sel.selectedIdx = null;
      const sub     = document.getElementById("char-select-sub")!;
      const confirm = document.getElementById("char-confirm-btn") as HTMLButtonElement;
      sub.textContent  = "P2 — choose your character";
      confirm.disabled = true;
      buildCharGrid(confirm);
    }
  } else {
    // 2P step 2
    document.getElementById("char-select-screen")!.style.display = "none";
    startMatch("2p", sel.p1Def!, chosen, undefined, sel.bo3);
  }
});

// Back ボタン
document.getElementById("char-back-btn")?.addEventListener("click", () => {
  document.getElementById("char-select-screen")!.style.display = "none";
  document.getElementById("title-screen")!.style.display = "flex";
});

// タイトルボタン → キャラ選択へ
document.querySelectorAll<HTMLButtonElement>("[data-diff]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("title-screen")!.style.display = "none";
    const isBo3 = btn.dataset["bo3"] === "1";
    openCharSelect("1p", btn.dataset["diff"] as Difficulty, isBo3);
  });
});

document.getElementById("btn-2p")?.addEventListener("click", () => {
  document.getElementById("title-screen")!.style.display = "none";
  openCharSelect("2p");
});

document.getElementById("btn-bo3-2p")?.addEventListener("click", () => {
  document.getElementById("title-screen")!.style.display = "none";
  openCharSelect("2p", undefined, true);
});

// Retry
document.getElementById("retry-btn")?.addEventListener("click", () => {
  location.reload();
});
