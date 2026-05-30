import * as THREE from "three";

export function createRenderer(container: HTMLElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return renderer;
}

export function createCamera(): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  cam.position.set(0, 8, 14);
  cam.lookAt(0, 0, 0);

  window.addEventListener("resize", () => {
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
  });

  return cam;
}

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a14);
  scene.fog = new THREE.FogExp2(0x0a0a14, 0.03);
  return scene;
}

export function setupLighting(scene: THREE.Scene): void {
  // Ambient
  const ambient = new THREE.AmbientLight(0x404060, 0.6);
  scene.add(ambient);

  // Main spotlight (arena ceiling)
  const mainLight = new THREE.SpotLight(0xffffff, 3, 40, Math.PI / 4, 0.5, 1);
  mainLight.position.set(0, 18, 0);
  mainLight.target.position.set(0, 0, 0);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.setScalar(2048);
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 40;
  scene.add(mainLight);
  scene.add(mainLight.target);

  // Side fill lights
  const fill1 = new THREE.PointLight(0x4466ff, 1.5, 30);
  fill1.position.set(-12, 8, 0);
  scene.add(fill1);

  const fill2 = new THREE.PointLight(0xff4422, 1.5, 30);
  fill2.position.set(12, 8, 0);
  scene.add(fill2);

  // Rim light
  const rim = new THREE.DirectionalLight(0xffeedd, 0.8);
  rim.position.set(0, 10, -15);
  scene.add(rim);
}
