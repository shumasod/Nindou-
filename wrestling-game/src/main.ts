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
const player = new Wrestler({
  name: "PLAYER",
  primaryColor:   0x0044cc,
  secondaryColor: 0xffffff,
  skinColor:      0xf5c5a3,
  startX: -2.5,
});

const cpu = new Wrestler({
  name: "CPU",
  primaryColor:   0xcc0000,
  secondaryColor: 0xffcc00,
  skinColor:      0xf0b090,
  startX: 2.5,
});

player.addToScene(scene);
cpu.addToScene(scene);

// ─── FX + Input ───────────────────────────────────────────────────────────────
const effects = new EffectsSystem(scene);
const input   = new InputManager();

// AI は難易度選択後に初期化
let cpuAI: CpuAI | null = null;

// ─── Camera ───────────────────────────────────────────────────────────────────
const CAM_LERP = 5;
const camTarget = new THREE.Vector3();
const camBase   = new THREE.Vector3();

function updateCamera(dt: number): void {
  const mid = new THREE.Vector3()
    .addVectors(player.position, cpu.position)
    .multiplyScalar(0.5);

  const desired = new THREE.Vector3(mid.x * 0.5, 8, mid.z * 0.3 + 14);
  camBase.lerp(desired, Math.min(1, CAM_LERP * dt));
  camera.position.copy(camBase);

  camTarget.lerp(new THREE.Vector3(mid.x, 0.8, mid.z), Math.min(1, CAM_LERP * dt));
  camera.lookAt(camTarget);
}

// ─── HUD refs ─────────────────────────────────────────────────────────────────
const hudPlayerHp  = document.getElementById("player-hp")   as HTMLElement | null;
const hudPlayerSta = document.getElementById("player-sta")  as HTMLElement | null;
const hudPlayerMom = document.getElementById("player-mom")  as HTMLElement | null;
const hudCpuHp     = document.getElementById("cpu-hp")      as HTMLElement | null;
const hudCpuSta    = document.getElementById("cpu-sta")      as HTMLElement | null;
const hudTimer     = document.getElementById("match-timer")  as HTMLElement | null;
const hudPinDisp   = document.getElementById("pin-display")  as HTMLElement | null;
const hudCombo     = document.getElementById("combo-display") as HTMLElement | null;

function pct(v: number): string {
  return `${Math.round(Math.max(0, Math.min(100, v)))}%`;
}

function hpColor(hp: number): string {
  if (hp > 50) return "linear-gradient(90deg,#27ae60,#2ecc71)";
  if (hp > 25) return "linear-gradient(90deg,#e67e22,#f39c12)";
  return "linear-gradient(90deg,#c0392b,#e74c3c)";
}

const MATCH_TIME_LIMIT = 180; // 秒

function updateHUD(elapsed: number): void {
  if (hudPlayerHp) {
    hudPlayerHp.style.width      = pct(player.hp);
    hudPlayerHp.style.background = hpColor(player.hp);
  }
  if (hudPlayerSta) hudPlayerSta.style.width = pct(player.stamina);
  if (hudPlayerMom) {
    hudPlayerMom.style.width = pct(player.momentum);
    if (player.momentum >= 100) {
      hudPlayerMom.style.animation = "momPulse 0.5s infinite alternate";
    } else {
      hudPlayerMom.style.animation = "";
    }
  }
  if (hudCpuHp) {
    hudCpuHp.style.width      = pct(cpu.hp);
    hudCpuHp.style.background = hpColor(cpu.hp);
  }
  if (hudCpuSta) hudCpuSta.style.width = pct(cpu.stamina);

  // タイマー (カウントダウン)
  if (hudTimer) {
    const remaining = Math.max(0, MATCH_TIME_LIMIT - elapsed);
    const m = Math.floor(remaining / 60);
    const s = Math.floor(remaining % 60);
    hudTimer.textContent = `${m}:${s.toString().padStart(2, "0")}`;
    hudTimer.style.color = remaining < 30 ? "#ff4444" : "#ffffff";
  }

  // ピンカウンター
  if (hudPinDisp) {
    const pp = player.state === "pinning" && cpu.state    === "being_pinned";
    const cp = cpu.state    === "pinning" && player.state === "being_pinned";
    if (pp || cp) {
      const pinner = pp ? player : cpu;
      hudPinDisp.textContent   = Math.min(3, Math.floor(pinner.pinCount) + 1).toString();
      hudPinDisp.style.display = "block";
    } else {
      hudPinDisp.style.display = "none";
    }
  }

  showDanger(player.hp < 20, "player-danger", "left:20px");
  showDanger(cpu.hp    < 20, "cpu-danger",    "right:20px");
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
let comboCount  = 0;
let comboTimer  = 0;
const COMBO_WINDOW = 2.5; // 秒

function addCombo(): void {
  comboCount++;
  comboTimer = COMBO_WINDOW;
  if (hudCombo) {
    hudCombo.style.display = comboCount >= 2 ? "block" : "none";
    if (comboCount >= 2) {
      hudCombo.textContent = `${comboCount} HIT COMBO!`;
      hudCombo.style.fontSize = `${Math.min(36, 18 + comboCount * 2)}px`;
    }
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

// ─── 試合開始アニメーション ────────────────────────────────────────────────────
function showMatchStart(cb: () => void): void {
  const el = document.getElementById("match-start-msg")!;
  const messages = ["3", "2", "1", "FIGHT!"];
  let i = 0;

  function next(): void {
    const msg = messages[i];
    if (msg === undefined) { el.style.display = "none"; cb(); return; }
    el.textContent  = msg;
    el.style.display  = "block";
    el.style.animation = "none";
    void el.offsetWidth; // reflow
    el.style.animation = "countAnim 0.85s forwards";
    i++;
    setTimeout(next, 850);
  }
  next();
}

// ─── ゲーム状態 ───────────────────────────────────────────────────────────────
type GamePhase = "title" | "countdown" | "match" | "result";
let phase: GamePhase = "title";
let matchElapsed = 0;

function showResult(winner: string, reason = ""): void {
  phase = "result";
  const el  = document.getElementById("result-screen");
  const txt = document.getElementById("result-text");
  const sub = document.getElementById("result-sub");
  if (el)  el.style.display = "flex";
  if (txt) {
    txt.textContent = winner === "DRAW" ? "TIME UP! DRAW" : `${winner} WINS!`;
    txt.style.color = winner === "PLAYER" ? "#ffd700" : winner === "DRAW" ? "#ffffff" : "#ff4444";
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
    handlePlayerInput(dt);
    cpuAI?.update(dt);
    player.update(dt);
    cpu.update(dt);
    updateCamera(dt);
    effects.update(dt, camera);
    updateCombo(dt);
    updateHUD(matchElapsed);
    checkMatchEnd();
  } else if (phase === "countdown") {
    updateCamera(dt);
  }

  input.flush();
  renderer.render(scene, camera);
}
animate();

// ─── Player input ─────────────────────────────────────────────────────────────
function handlePlayerInput(dt: number): void {
  const s = input.state;

  let dx = 0, dz = 0;
  if (s.left)  dx -= 1;
  if (s.right) dx += 1;
  if (s.up)    dz -= 1;
  if (s.down)  dz += 1;
  if (dx !== 0 && dz !== 0) { dx *= 1 / Math.SQRT2; dz *= 1 / Math.SQRT2; }

  player.move(dx, dz, s.sprint, dt);
  player.faceTarget(cpu);

  if (!player.isActionReady()) return;

  // Strike (F)
  if (s.strikePressed && player.canStrike(cpu)) {
    player.startStrike();
    const dmg = 8 + Math.random() * 4;
    cpu.takeDamage(dmg);
    if (cpu.hp < 25) cpu.startKnockdown();
    effects.spawnHitSparks(cpu.position, 0xff6600);
    effects.shake(0.08);
    audio.punch();
    addCombo();
    flashMoveName("STRIKE!");
  }

  // Grapple (G)
  if (s.grapplePressed) {
    if (player.state === "grappling" && player.grappleTarget) {
      const t = player.grappleTarget;
      player.startSlam(t);
      t.takeDamage(18);
      effects.spawnDust(t.position);
      effects.shake(0.18);
      audio.slam();
      addCombo();
      flashMoveName("SLAM!");
    } else if (player.canGrapple(cpu)) {
      player.startGrapple(cpu);
      flashMoveName("GRAPPLE!");
    }
  }

  // Slam (H)
  if (s.slamPressed && player.state === "grappling" && player.grappleTarget) {
    const t = player.grappleTarget;
    player.startSlam(t);
    t.takeDamage(18);
    effects.spawnDust(t.position);
    effects.shake(0.18);
    audio.slam();
    addCombo();
    flashMoveName("SLAM!");
  }

  // Signature (Space)
  if (s.signaturePressed && player.momentum >= 100 && player.canGrapple(cpu)) {
    player.startSignature(cpu);
    cpu.takeDamage(35);
    effects.spawnSignatureBurst(cpu.position);
    effects.shake(0.35);
    audio.slam();
    audio.crowd();
    addCombo();
    flashMoveName("SIGNATURE MOVE!!");
  }

  // Pin (P)
  if (s.pinPressed && cpu.isDown() && player.distanceTo(cpu) < 1.5) {
    player.startPin();
    cpu.state = "being_pinned";
    audio.pinRoll();
    flashMoveName("PIN!");
  }
}

// ─── Match end ────────────────────────────────────────────────────────────────
function checkMatchEnd(): void {
  if (phase !== "match") return;

  if (player.hp <= 0) { showResult("CPU");    return; }
  if (cpu.hp    <= 0) { showResult("PLAYER"); return; }

  if (player.state === "pinning" && cpu.state === "being_pinned") {
    player.pinCount += 1 / 60;
    if (player.pinCount >= 3) { showResult("PLAYER", "PINFALL  "); return; }
  }
  if (cpu.state === "pinning" && player.state === "being_pinned") {
    cpu.pinCount += 1 / 60;
    if (cpu.pinCount >= 3) { showResult("CPU", "PINFALL  "); return; }
  }

  // タイムアウト
  if (matchElapsed >= MATCH_TIME_LIMIT) {
    if (player.hp > cpu.hp)      showResult("PLAYER", "TIME UP  ");
    else if (cpu.hp > player.hp) showResult("CPU",    "TIME UP  ");
    else                          showResult("DRAW",   "TIME UP  ");
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

// ─── Title → 難易度選択 → 試合開始 ──────────────────────────────────────────
const titleScreen = document.getElementById("title-screen")!;
const diffButtons = titleScreen.querySelectorAll<HTMLButtonElement>("[data-diff]");

diffButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const diff = btn.dataset["diff"] as Difficulty;
    cpuAI = new CpuAI(cpu, player, effects, diff);
    titleScreen.style.display = "none";
    phase = "countdown";
    clock.start();

    showMatchStart(() => {
      phase = "match";
      audio.crowd();
    });
  });
});

// ─── Retry ────────────────────────────────────────────────────────────────────
document.getElementById("retry-btn")?.addEventListener("click", () => {
  location.reload();
});
