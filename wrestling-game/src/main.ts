import * as THREE from "three";
import { createRenderer, createCamera, createScene, setupLighting } from "./engine/renderer.js";
import { buildRing } from "./game/Ring.js";
import { InputManager } from "./engine/input.js";
import { Wrestler } from "./game/Wrestler.js";

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

// ─── Input ────────────────────────────────────────────────────────────────────
const input = new InputManager();

// ─── Camera follow ────────────────────────────────────────────────────────────
const CAM_HEIGHT  = 8;
const CAM_DIST    = 14;
const CAM_LERP    = 5; // 追従の滑らかさ

const camTarget = new THREE.Vector3();

function updateCamera(dt: number): void {
  // 2人の中点を見る
  const mid = new THREE.Vector3()
    .addVectors(player.position, cpu.position)
    .multiplyScalar(0.5);

  // カメラは常に +Z 側に引いた固定俯瞰位置
  const desired = new THREE.Vector3(mid.x * 0.5, CAM_HEIGHT, mid.z * 0.3 + CAM_DIST);
  camera.position.lerp(desired, Math.min(1, CAM_LERP * dt));

  // 注視点を2人の中点へ
  camTarget.lerp(new THREE.Vector3(mid.x, 0.8, mid.z), Math.min(1, CAM_LERP * dt));
  camera.lookAt(camTarget);
}

// ─── HUD helpers ─────────────────────────────────────────────────────────────
function pct(v: number): string {
  return `${Math.round(Math.max(0, v))}`;
}

function updateHUD(): void {
  const playerHpBar  = document.getElementById("player-hp");
  const playerStaBar = document.getElementById("player-sta");
  const playerMomBar = document.getElementById("player-mom");
  const cpuHpBar     = document.getElementById("cpu-hp");
  const cpuStaBar    = document.getElementById("cpu-sta");

  if (playerHpBar)  playerHpBar.style.width  = pct(player.hp)       + "%";
  if (playerStaBar) playerStaBar.style.width = pct(player.stamina)   + "%";
  if (playerMomBar) playerMomBar.style.width = pct(player.momentum)  + "%";
  if (cpuHpBar)     cpuHpBar.style.width     = pct(cpu.hp)           + "%";
  if (cpuStaBar)    cpuStaBar.style.width    = pct(cpu.stamina)      + "%";
}

// ─── Game state ───────────────────────────────────────────────────────────────
type GamePhase = "title" | "match" | "result";
let phase: GamePhase = "title";

function showResult(winner: string): void {
  phase = "result";
  const el = document.getElementById("result-screen");
  const txt = document.getElementById("result-text");
  if (el)  el.style.display = "flex";
  if (txt) txt.textContent = `${winner} WINS!`;
}

// ─── Clock ────────────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

// ─── Render loop ─────────────────────────────────────────────────────────────
function animate(): void {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  if (phase === "match") {
    handlePlayerInput(dt);
    player.update(dt);
    cpu.update(dt);
    updateCamera(dt);
    updateHUD();
    checkMatchEnd();
  }

  input.flush();
  renderer.render(scene, camera);
}
animate();

// ─── Player input ─────────────────────────────────────────────────────────────
function handlePlayerInput(dt: number): void {
  const s = input.state;

  // Movement
  let dx = 0;
  let dz = 0;
  if (s.left)  dx -= 1;
  if (s.right) dx += 1;
  if (s.up)    dz -= 1;
  if (s.down)  dz += 1;

  // Normalize diagonal
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
    if (cpu.hp < 30) cpu.startKnockdown();
    flashMoveName("STRIKE!");
  }

  // Grapple (G) — start or follow up with slam/signature
  if (s.grapplePressed) {
    if (player.state === "grappling" && player.grappleTarget) {
      // Already grappling: slam follow-up
      const target = player.grappleTarget;
      player.startSlam(target);
      target.takeDamage(18);
      flashMoveName("SLAM!");
    } else if (player.canGrapple(cpu)) {
      player.startGrapple(cpu);
      flashMoveName("GRAPPLE!");
    }
  }

  // Slam from grapple (H)
  if (s.slamPressed && player.state === "grappling" && player.grappleTarget) {
    const target = player.grappleTarget;
    player.startSlam(target);
    target.takeDamage(18);
    flashMoveName("SLAM!");
  }

  // Signature (Space) — requires momentum ≥ 100
  if (s.signaturePressed && player.momentum >= 100 && player.canGrapple(cpu)) {
    player.startSignature(cpu);
    cpu.takeDamage(35);
    flashMoveName("SIGNATURE MOVE!!");
  }

  // Pin (P) — only when opponent is down
  if (s.pinPressed && cpu.isDown() && player.distanceTo(cpu) < 1.5) {
    player.startPin();
    cpu.state = "being_pinned";
    flashMoveName("PIN!");
  }
}

// ─── Match-end check ──────────────────────────────────────────────────────────
function checkMatchEnd(): void {
  if (player.hp <= 0) {
    showResult("CPU");
    return;
  }
  if (cpu.hp <= 0) {
    showResult("PLAYER");
    return;
  }
  // Pin count-out
  if (player.state === "pinning" && cpu.state === "being_pinned") {
    player.pinCount += 1 / 60; // approximate frames
    if (player.pinCount >= 3) {
      showResult("PLAYER");
    }
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
  flashTimeout = setTimeout(() => {
    el.style.opacity = "0";
  }, 900);
}

// ─── Title screen → start ─────────────────────────────────────────────────────
document.getElementById("start-btn")!.addEventListener("click", () => {
  const titleEl = document.getElementById("title-screen")!;
  titleEl.style.display = "none";
  phase = "match";
  clock.start();
});

// ─── Retry button ─────────────────────────────────────────────────────────────
document.getElementById("retry-btn")?.addEventListener("click", () => {
  location.reload();
});
