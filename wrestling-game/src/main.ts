import * as THREE from "three";
import { createRenderer, createCamera, createScene, setupLighting } from "./engine/renderer.js";
import { buildRing } from "./game/Ring.js";
import { InputManager } from "./engine/input.js";
import { Wrestler } from "./game/Wrestler.js";
import { CpuAI, type Difficulty } from "./game/CpuAI.js";
import { EffectsSystem } from "./engine/effects.js";
import { audio } from "./engine/audio.js";

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const container = document.getElementById("canvas-container")!;
const renderer  = createRenderer(container);
const camera    = createCamera();
const scene     = createScene();

setupLighting(scene);
buildRing(scene);

// ─── Wrestlers ────────────────────────────────────────────────────────────────
const player1 = new Wrestler({
  name: "P1",
  primaryColor:   0x0044cc,
  secondaryColor: 0xffffff,
  skinColor:      0xf5c5a3,
  startX: -2.5,
});

const player2 = new Wrestler({
  name: "P2",
  primaryColor:   0xcc0000,
  secondaryColor: 0xffcc00,
  skinColor:      0xf0b090,
  startX: 2.5,
});

player1.addToScene(scene);
player2.addToScene(scene);

// ─── FX ───────────────────────────────────────────────────────────────────────
const effects = new EffectsSystem(scene);

// ─── Input (always create both; P2 used only in 2P mode) ─────────────────────
const input1 = new InputManager(1);
const input2 = new InputManager(2);

// ─── Game mode ────────────────────────────────────────────────────────────────
type GameMode   = "1p" | "2p";
type GamePhase  = "title" | "countdown" | "match" | "result";

let mode: GameMode  = "1p";
let phase: GamePhase = "title";
let cpuAI: CpuAI | null = null;

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
  if (hudP1Hp)  { hudP1Hp.style.width  = pct(player1.hp);      hudP1Hp.style.background  = hpColor(player1.hp); }
  if (hudP1Sta)  hudP1Sta.style.width  = pct(player1.stamina);
  if (hudP1Mom) {
    hudP1Mom.style.width = pct(player1.momentum);
    hudP1Mom.style.animation = player1.momentum >= 100 ? "momPulse 0.5s infinite alternate" : "";
  }
  if (hudP2Hp)  { hudP2Hp.style.width  = pct(player2.hp);      hudP2Hp.style.background  = hpColor(player2.hp); }
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

  showDanger(player1.hp < 20, "p1-danger", "left:20px");
  showDanger(player2.hp < 20, "p2-danger", "right:20px");
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
  const msgs = ["3", "2", "1", "FIGHT!"];
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

function showResult(winner: string, reason = ""): void {
  phase = "result";
  const el  = document.getElementById("result-screen");
  const txt = document.getElementById("result-text");
  const sub = document.getElementById("result-sub");
  if (el)  el.style.display = "flex";
  if (txt) {
    txt.textContent = winner === "DRAW" ? "TIME UP! DRAW" : `${winner} WINS!`;
    txt.style.color = winner === "P1" ? "#4488ff" : winner === "P2" || winner === "CPU" ? "#ff4444" : "#ffffff";
  }
  if (sub) {
    const m = Math.floor(matchElapsed / 60);
    const s = Math.floor(matchElapsed % 60);
    sub.textContent = `${reason}MATCH TIME  ${m}:${s.toString().padStart(2, "0")}`;
  }
}

// ─── Clock ────────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

// ─── Render loop ─────────────────────────────────────────────────────────────
function animate(): void {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (phase === "match") {
    matchElapsed += dt;
    handleInput(player1, input1, player2, dt, true);
    if (mode === "2p") {
      handleInput(player2, input2, player1, dt, false);
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
  trackCombo: boolean
): void {
  const s = inp.state;

  let dx = 0, dz = 0;
  if (s.left)  dx -= 1;
  if (s.right) dx += 1;
  if (s.up)    dz -= 1;
  if (s.down)  dz += 1;
  if (dx !== 0 && dz !== 0) { dx *= 1 / Math.SQRT2; dz *= 1 / Math.SQRT2; }

  self.move(dx, dz, s.sprint, dt);
  self.faceTarget(opponent);

  if (!self.isActionReady()) return;

  // Strike
  if (s.strikePressed && self.canStrike(opponent)) {
    self.startStrike();
    const dmg = 8 + Math.random() * 4;
    opponent.takeDamage(dmg);
    if (opponent.hp < 25) opponent.startKnockdown();
    effects.spawnHitSparks(opponent.position, 0xff6600);
    effects.shake(0.08);
    audio.punch();
    if (trackCombo) addCombo();
    flashMoveName("STRIKE!");
  }

  // Grapple / Slam follow-up (G)
  if (s.grapplePressed) {
    if (self.state === "grappling" && self.grappleTarget) {
      const t = self.grappleTarget;
      self.startSlam(t);
      t.takeDamage(18);
      effects.spawnDust(t.position);
      effects.shake(0.18);
      audio.slam();
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
    t.takeDamage(18);
    effects.spawnDust(t.position);
    effects.shake(0.18);
    audio.slam();
    if (trackCombo) addCombo();
    flashMoveName("SLAM!");
  }

  // Signature
  if (s.signaturePressed && self.momentum >= 100 && self.canGrapple(opponent)) {
    self.startSignature(opponent);
    opponent.takeDamage(35);
    effects.spawnSignatureBurst(opponent.position);
    effects.shake(0.35);
    audio.slam();
    audio.crowd();
    if (trackCombo) addCombo();
    flashMoveName("SIGNATURE MOVE!!");
  }

  // Pin
  if (s.pinPressed && opponent.isDown() && self.distanceTo(opponent) < 1.5) {
    self.startPin();
    opponent.state = "being_pinned";
    audio.pinRoll();
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
function startMatch(selectedMode: GameMode, diff?: Difficulty): void {
  mode = selectedMode;
  document.getElementById("title-screen")!.style.display = "none";

  // HUD 名前を更新
  if (hudP1Name) hudP1Name.textContent = "P1";
  if (hudP2Name) hudP2Name.textContent = selectedMode === "2p" ? "P2" : "CPU";

  if (selectedMode === "1p" && diff) {
    cpuAI = new CpuAI(player2, player1, effects, diff);
  }

  // 2P モードはコントロールヒントを両方表示
  const p2hint = document.getElementById("p2-controls");
  if (p2hint) p2hint.style.display = selectedMode === "2p" ? "inline" : "none";

  phase = "countdown";
  clock.start();
  showMatchStart(() => {
    phase = "match";
    audio.crowd();
  });
}

// タイトルボタンのイベント
document.querySelectorAll<HTMLButtonElement>("[data-diff]").forEach((btn) => {
  btn.addEventListener("click", () => {
    startMatch("1p", btn.dataset["diff"] as Difficulty);
  });
});

document.getElementById("btn-2p")?.addEventListener("click", () => {
  startMatch("2p");
});

// Retry
document.getElementById("retry-btn")?.addEventListener("click", () => {
  location.reload();
});
