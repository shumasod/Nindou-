import * as THREE from "three";
import { createRenderer, createCamera, createScene, setupLighting } from "./engine/renderer.js";
import { buildRing } from "./game/Ring.js";

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const container = document.getElementById("canvas-container")!;
const renderer  = createRenderer(container);
const camera    = createCamera();
const scene     = createScene();

setupLighting(scene);
buildRing(scene);

// ─── Render loop ─────────────────────────────────────────────────────────────
function animate(): void {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// ─── Title screen → start ─────────────────────────────────────────────────────
document.getElementById("start-btn")!.addEventListener("click", () => {
  const titleEl = document.getElementById("title-screen")!;
  titleEl.style.display = "none";
});
