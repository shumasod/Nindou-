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

  player1 = new Wrestler({ ...def1, name: def1.name, startX: -2.5 });
  player2 = new Wrestler({ ...def2, name: def2.name, startX:  2.5 });
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
const hudP1Name = document.getElementById("hud-p1-name") as HTMLElement | null;
const hudP2Name = document.getElementById("hud-p2-name") as HTMLElement | null;

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
  if (hudP1Sta)  hudP1Sta.style.width  = pct(player1.stamina);
  if (hudP1Mom) {
    hudP1Mom.style.width = pct(player1.momentum);
    hudP1Mom.style.animation = player1.momentum >= 100 ? "momPulse 0.5s infinite alternate" : "";
  }
  if (hudP2Hp)  { hudP2Hp.style.width  = pct(p2HpPct); hudP2Hp.style.background  = hpColor(p2HpPct); }
  if (hudP2Sta)  hudP2Sta.style.width  = pct(player2.stamina);

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
  return "★".repeat(wins) + "☆".repeat(Math.max(0, 2 - wins));
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

  const p2Label = mode === "2p" ? "P2" : "CPU";
  const winnerName = winnerSide === "p1" ? "P1" : winnerSide === "p2" ? p2Label : "DRAW";
  const colorMap: Record<string, string> = { P1: "#4488ff", P2: "#ff4444", CPU: "#ff4444", DRAW: "#ffffff" };

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
  winnerEl.style.color = colorMap[winnerName] ?? "#ffffff";
  p1NameEl.textContent = player1.name;
  p2NameEl.textContent = player2.name;
  p1PipsEl.textContent = pipStr(tournament.roundWins.p1);
  p2PipsEl.textContent = pipStr(tournament.roundWins.p2);
  el.style.display     = "flex";

  // Countdown until next round
  let secs = 4;
  nextMsg.textContent = `ROUND ${tournament.roundNum + 1} STARTS IN ${secs}...`;
  const iv = setInterval(() => {
    secs--;
    if (secs > 0) {
      nextMsg.textContent = `ROUND ${tournament.roundNum + 1} STARTS IN ${secs}...`;
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
  // In tournament mode, tally wins first
  if (tournament.active && winner !== "DRAW") {
    const side = winner === "P1" ? "p1" : "p2";
    tournament.roundWins[side]++;
    updateWinPips();

    // Check if someone clinched Best-of-3
    if (tournament.roundWins.p1 >= 2 || tournament.roundWins.p2 >= 2) {
      showFinalResult(winner, reason);
    } else {
      showRoundResult(side);
    }
    return;
  }
  if (tournament.active && winner === "DRAW") {
    // Draw round — no wins awarded, just go next round if rounds remain
    if (tournament.roundNum < 3) {
      showRoundResult("draw");
    } else {
      showFinalResult("DRAW", reason);
    }
    return;
  }
  showFinalResult(winner, reason);
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
    const p2Label = mode === "2p" ? "P2" : "CPU";
    txt.style.color = winner === "P1" ? "#4488ff" : winner === p2Label ? "#ff4444" : "#ffffff";
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
      ? `<tr><td class="${tournament.roundWins.p1 > tournament.roundWins.p2 ? "stat-hi" : ""}">${tournament.roundWins.p1}</td><td class="stat-label">ROUNDS WON</td><td class="${tournament.roundWins.p2 > tournament.roundWins.p1 ? "stat-hi" : ""}">${tournament.roundWins.p2}</td></tr>`
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
    }
    player1.update(dt);
    player2.update(dt);
    updateCamera(dt);
    effects.update(dt, camera);
    updateCombo(dt);
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
    if (isRunning) {
      // ランニングストライク — 1.5 倍ダメージ
      self.startRunningStrike();
      const dmg = (14 + Math.random() * 6) * self.damageMult;
      opponent.takeDamage(dmg);
      const knockdown = opponent.hp < 35;
      if (knockdown) opponent.startKnockdown();
      effects.spawnHitSparks(opponent.position, 0xff2200);
      effects.spawnHitSparks(opponent.position, 0xffaa00);
      effects.shake(0.18);
      audio.slam();
      tracker.recordStrike(side, dmg, knockdown);
      if (trackCombo) addCombo();
      flashMoveName("RUNNING STRIKE!!");
    } else {
      self.startStrike();
      const dmg = (8 + Math.random() * 4) * self.damageMult;
      opponent.takeDamage(dmg);
      const knockdown = opponent.hp < 25;
      if (knockdown) opponent.startKnockdown();
      effects.spawnHitSparks(opponent.position, 0xff6600);
      effects.shake(0.08);
      audio.punch();
      tracker.recordStrike(side, dmg, knockdown);
      if (trackCombo) addCombo();
      flashMoveName("STRIKE!");
    }
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
      tracker.recordSlam(side, dmg);
      if (trackCombo) addCombo();
      flashMoveName("SLAM!");
    } else if (self.canGrapple(opponent)) {
      self.startGrapple(opponent);
      flashMoveName("GRAPPLE!");
    }
  }

  // Slam explicit (H / N)
  if (s.slamPressed && self.state === "grappling" && self.grappleTarget) {
    const t = self.grappleTarget;
    self.startSlam(t);
    const dmg = 18 * self.damageMult;
    t.takeDamage(dmg);
    effects.spawnDust(t.position);
    effects.shake(0.18);
    audio.slam();
    tracker.recordSlam(side, dmg);
    if (trackCombo) addCombo();
    flashMoveName("SLAM!");
  }

  // Signature
  if (s.signaturePressed && self.momentum >= 100 && self.canGrapple(opponent)) {
    self.startSignature(opponent);
    const dmg = 35 * self.damageMult;
    opponent.takeDamage(dmg);
    effects.spawnSignatureBurst(opponent.position);
    effects.shake(0.35);
    audio.slam();
    audio.crowd();
    tracker.recordSignature(side, dmg);
    if (trackCombo) addCombo();
    flashMoveName("SIGNATURE MOVE!!");
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

  if (matchElapsed >= MATCH_TIME_LIMIT) {
    if (player1.hp > player2.hp)      showResult("P1",    "TIME UP  ");
    else if (player2.hp > player1.hp) showResult(p2Label, "TIME UP  ");
    else                               showResult("DRAW",  "TIME UP  ");
  }
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
