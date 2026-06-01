import * as THREE from "three";
import { createRenderer, createCamera, createScene, setupLighting } from "./engine/renderer.js";
import { buildRing } from "./game/Ring.js";
import { InputManager } from "./engine/input.js";
import { Wrestler } from "./game/Wrestler.js";
import { CpuAI } from "./game/CpuAI.js";
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

// ─── AI + FX ──────────────────────────────────────────────────────────────────
const cpuAI  = new CpuAI(cpu, player);
const effects = new EffectsSystem(scene);

// ─── Input ────────────────────────────────────────────────────────────────────
const input = new InputManager();

// ─── Camera follow ────────────────────────────────────────────────────────────
const CAM_HEIGHT = 8;
const CAM_DIST   = 14;
const CAM_LERP   = 5;

const camTarget = new THREE.Vector3();
const camBase   = new THREE.Vector3(); // シェイク前の基準位置

function updateCamera(dt: number): void {
  const mid = new THREE.Vector3()
    .addVectors(player.position, cpu.position)
    .multiplyScalar(0.5);

  const desired = new THREE.Vector3(mid.x * 0.5, CAM_HEIGHT, mid.z * 0.3 + CAM_DIST);
  camBase.lerp(desired, Math.min(1, CAM_LERP * dt));
  camera.position.copy(camBase);

  camTarget.lerp(new THREE.Vector3(mid.x, 0.8, mid.z), Math.min(1, CAM_LERP * dt));
  camera.lookAt(camTarget);
}

// ─── HUD elements ─────────────────────────────────────────────────────────────
const hudPlayerHp  = document.getElementById("player-hp")  as HTMLElement | null;
const hudPlayerSta = document.getElementById("player-sta") as HTMLElement | null;
const hudPlayerMom = document.getElementById("player-mom") as HTMLElement | null;
const hudCpuHp     = document.getElementById("cpu-hp")     as HTMLElement | null;
const hudCpuSta    = document.getElementById("cpu-sta")    as HTMLElement | null;
const hudTimer     = document.getElementById("match-timer") as HTMLElement | null;
const hudPinDisp   = document.getElementById("pin-display") as HTMLElement | null;

function pct(v: number): string {
  return `${Math.round(Math.max(0, Math.min(100, v)))}%`;
}

/** HP に応じて色を変える: 緑 → 黄 → 赤 */
function hpColor(hp: number): string {
  if (hp > 50) return "linear-gradient(90deg,#27ae60,#2ecc71)";
  if (hp > 25) return "linear-gradient(90deg,#e67e22,#f39c12)";
  return "linear-gradient(90deg,#c0392b,#e74c3c)";
}

function updateHUD(elapsed: number): void {
  if (hudPlayerHp) {
    hudPlayerHp.style.width      = pct(player.hp);
    hudPlayerHp.style.background = hpColor(player.hp);
  }
  if (hudPlayerSta) hudPlayerSta.style.width = pct(player.stamina);
  if (hudPlayerMom) {
    hudPlayerMom.style.width = pct(player.momentum);
    // モメンタム満タンで点滅
    if (player.momentum >= 100) {
      hudPlayerMom.style.boxShadow = `0 0 8px #ffd700`;
      hudPlayerMom.style.animation = "momPulse 0.5s infinite alternate";
    } else {
      hudPlayerMom.style.boxShadow = "";
      hudPlayerMom.style.animation = "";
    }
  }
  if (hudCpuHp) {
    hudCpuHp.style.width      = pct(cpu.hp);
    hudCpuHp.style.background = hpColor(cpu.hp);
  }
  if (hudCpuSta) hudCpuSta.style.width = pct(cpu.stamina);

  // タイマー
  if (hudTimer) {
    const m = Math.floor(elapsed / 60);
    const s = Math.floor(elapsed % 60);
    hudTimer.textContent = `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ピンカウンター
  if (hudPinDisp) {
    const playerPinning = player.state === "pinning" && cpu.state    === "being_pinned";
    const cpuPinning    = cpu.state    === "pinning" && player.state === "being_pinned";
    if (playerPinning || cpuPinning) {
      const pinner = playerPinning ? player : cpu;
      const count  = Math.min(3, Math.floor(pinner.pinCount) + 1);
      hudPinDisp.textContent    = count.toString();
      hudPinDisp.style.display  = "block";
    } else {
      hudPinDisp.style.display = "none";
    }
  }

  // DANGER 表示
  showDanger(player.hp < 20, "player-danger");
  showDanger(cpu.hp    < 20, "cpu-danger");
}

function showDanger(active: boolean, id: string): void {
  let el = document.getElementById(id);
  if (!active) { if (el) el.style.display = "none"; return; }
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.textContent = "DANGER!!";
    el.style.cssText = [
      "position:absolute",
      id === "player-danger" ? "left:20px" : "right:20px",
      "top:90px",
      "color:#ff2222",
      "font-size:13px",
      "font-weight:bold",
      "letter-spacing:2px",
      "animation:dangerBlink 0.4s infinite alternate",
    ].join(";");
    document.getElementById("hud")?.appendChild(el);
  }
  el.style.display = "block";
}

// ─── Game state ───────────────────────────────────────────────────────────────
type GamePhase = "title" | "match" | "result";
let phase: GamePhase = "title";
let matchElapsed = 0;

function showResult(winner: string): void {
  phase = "result";
  const el  = document.getElementById("result-screen");
  const txt = document.getElementById("result-text");
  const sub = document.getElementById("result-sub");
  if (el)  el.style.display = "flex";
  if (txt) {
    txt.textContent = `${winner} WINS!`;
    txt.style.color = winner === "PLAYER" ? "#ffd700" : "#ff4444";
  }
  if (sub) {
    const m = Math.floor(matchElapsed / 60);
    const s = Math.floor(matchElapsed % 60);
    sub.textContent = `MATCH TIME  ${m}:${s.toString().padStart(2, "0")}`;
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
    cpuAI.update(dt);
    player.update(dt);
    cpu.update(dt);
    updateCamera(dt);
    effects.update(dt, camera);
    updateHUD(matchElapsed);
    checkMatchEnd();
  }

  input.flush();
  renderer.render(scene, camera);
}
animate();

// ─── Player input ─────────────────────────────────────────────────────────────
function handlePlayerInput(dt: number): void {
  const s = input.state;

  let dx = 0;
  let dz = 0;
  if (s.left)  dx -= 1;
  if (s.right) dx += 1;
  if (s.up)    dz -= 1;
  if (s.down)  dz += 1;

  if (dx !== 0 && dz !== 0) {
    const inv = 1 / Math.SQRT2;
    dx *= inv;
    dz *= inv;
  }

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
    flashMoveName("STRIKE!");
  }

  // Grapple (G)
  if (s.grapplePressed) {
    if (player.state === "grappling" && player.grappleTarget) {
      const target = player.grappleTarget;
      player.startSlam(target);
      target.takeDamage(18);
      effects.spawnDust(target.position);
      effects.shake(0.18);
      audio.slam();
      flashMoveName("SLAM!");
    } else if (player.canGrapple(cpu)) {
      player.startGrapple(cpu);
      flashMoveName("GRAPPLE!");
    }
  }

  // Slam (H)
  if (s.slamPressed && player.state === "grappling" && player.grappleTarget) {
    const target = player.grappleTarget;
    player.startSlam(target);
    target.takeDamage(18);
    effects.spawnDust(target.position);
    effects.shake(0.18);
    audio.slam();
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

// ─── Match-end check ──────────────────────────────────────────────────────────
function checkMatchEnd(): void {
  if (phase !== "match") return;

  if (player.hp <= 0) { showResult("CPU");    return; }
  if (cpu.hp    <= 0) { showResult("PLAYER"); return; }

  if (player.state === "pinning" && cpu.state === "being_pinned") {
    player.pinCount += 1 / 60;
    if (player.pinCount >= 3) { showResult("PLAYER"); return; }
  }
  if (cpu.state === "pinning" && player.state === "being_pinned") {
    cpu.pinCount += 1 / 60;
    if (cpu.pinCount >= 3) { showResult("CPU"); return; }
  }
}

// ─── Move name flash ─────────────────────────────────────────────────────────
let flashTimeout: ReturnType<typeof setTimeout> | null = null;

function flashMoveName(text: string): void {
  const el = document.getElementById("move-name");
  if (!el) return;
  el.textContent = text;
  el.style.opacity = "1";
  if (flashTimeout) clearTimeout(flashTimeout);
  flashTimeout = setTimeout(() => { el.style.opacity = "0"; }, 900);
}

// ─── Title screen → start ─────────────────────────────────────────────────────
document.getElementById("start-btn")!.addEventListener("click", () => {
  document.getElementById("title-screen")!.style.display = "none";
  phase = "match";
  clock.start();
  // AudioContext はユーザー操作後に初期化
  audio.crowd();
});

// ─── Retry ────────────────────────────────────────────────────────────────────
document.getElementById("retry-btn")?.addEventListener("click", () => {
  location.reload();
});
