import * as THREE from "three";

const RING_HALF = 5.5;    // リングの半幅
const ROPE_RADIUS = 0.04;

export const RING_BOUNDS = RING_HALF - 0.4; // 衝突判定に使う内側の境界

export type RopeSide = "north" | "east" | "south" | "west";

/** ロープの揺れを制御するコントローラ (buildRing が返す) */
export interface RingController {
  /** 指定サイドのロープを揺らす — リバウンド時に呼ぶ */
  wobbleRopes(side: RopeSide): void;
  /** 毎フレーム呼ぶ */
  update(dt: number): void;
}

interface WobbleState {
  meshes: THREE.Mesh[];        // そのサイドの 3 本のロープ
  basePos: THREE.Vector3[];    // 揺れの基準位置
  normal: THREE.Vector3;       // 外向き法線 (揺れの方向)
  timer: number;               // 経過秒 (< 0 = 非アクティブ)
}

const ropeSideMeshes: Record<RopeSide, THREE.Mesh[]> = {
  north: [], east: [], south: [], west: [],
};

export function buildRing(scene: THREE.Scene): RingController {
  // 再構築時に前回のロープ参照が蓄積しないようクリア (冪等性の保証)
  (Object.keys(ropeSideMeshes) as RopeSide[]).forEach((s) => { ropeSideMeshes[s] = []; });

  // ─── マット ───────────────────────────────────────────────────
  const matGeo = new THREE.BoxGeometry(RING_HALF * 2, 0.15, RING_HALF * 2);
  const matMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.9,
    metalness: 0.0,
  });
  const mat = new THREE.Mesh(matGeo, matMat);
  mat.position.y = 0.075;
  mat.receiveShadow = true;
  scene.add(mat);

  // マットのライン
  addMatLines(scene);

  // ─── エプロン ─────────────────────────────────────────────────
  const apronMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.8 });
  const apronH = 0.6;
  const apronW = RING_HALF * 2 + 0.8;

  [
    { x: 0, z: RING_HALF + 0.4, rx: 0 },
    { x: 0, z: -(RING_HALF + 0.4), rx: 0 },
    { x: RING_HALF + 0.4, z: 0, rx: Math.PI / 2 },
    { x: -(RING_HALF + 0.4), z: 0, rx: Math.PI / 2 },
  ].forEach(({ x, z, rx }) => {
    const g = new THREE.BoxGeometry(apronW, apronH, 0.15);
    const m = new THREE.Mesh(g, apronMat);
    m.position.set(x, apronH / 2 - 0.45, z);
    m.rotation.y = rx;
    scene.add(m);
  });

  // ─── コーナーポスト ───────────────────────────────────────────
  const postMat = new THREE.MeshStandardMaterial({
    color: 0xccaa00,
    metalness: 0.8,
    roughness: 0.2,
  });

  const corners: [number, number][] = [
    [ RING_HALF,  RING_HALF],
    [-RING_HALF,  RING_HALF],
    [ RING_HALF, -RING_HALF],
    [-RING_HALF, -RING_HALF],
  ];

  corners.forEach(([x, z]) => {
    const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.8, 8);
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(x, 1.4, z);
    post.castShadow = true;
    scene.add(post);

    // ポストの装飾球
    const ballGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const ball = new THREE.Mesh(ballGeo, postMat);
    ball.position.set(x, 2.9, z);
    scene.add(ball);

    // ターンバックルパッド
    const padMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.9 });
    addTurnbucklePads(scene, x, z, padMat);
  });

  // ─── ロープ ───────────────────────────────────────────────────
  const ropeColors = [0xff2222, 0xffffff, 0x2222ff];
  const ropeHeights = [0.7, 1.2, 1.8];

  ropeColors.forEach((color, i) => {
    const h = ropeHeights[i] ?? 1.2;
    const ropeMat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.1,
      roughness: 0.6,
    });
    addRopeSegments(scene, h, ropeMat);
  });

  // ─── 床（アリーナ床）─────────────────────────────────────────
  const floorGeo = new THREE.PlaneGeometry(60, 60);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x080810,
    roughness: 1.0,
    metalness: 0.0,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.38;
  floor.receiveShadow = true;
  scene.add(floor);

  // ─── スポットライト演出 ────────────────────────────────────────
  addArenaDecor(scene);

  return createRopeWobbleController();
}

const WOBBLE_DURATION = 1.1;  // 揺れの継続時間 (秒)
const WOBBLE_AMP      = 0.22; // 最大振幅 (m)
const WOBBLE_FREQ     = 18;   // 振動数 (rad/s)

function createRopeWobbleController(): RingController {
  const outwardNormal: Record<RopeSide, THREE.Vector3> = {
    north: new THREE.Vector3(0, 0, -1),
    east:  new THREE.Vector3(1, 0, 0),
    south: new THREE.Vector3(0, 0, 1),
    west:  new THREE.Vector3(-1, 0, 0),
  };

  const states: WobbleState[] = (Object.keys(ropeSideMeshes) as RopeSide[]).map((side) => ({
    meshes:  ropeSideMeshes[side],
    basePos: ropeSideMeshes[side].map((m) => m.position.clone()),
    normal:  outwardNormal[side],
    timer:   -1,
  }));

  const sideIndex: Record<RopeSide, number> = { north: 0, east: 1, south: 2, west: 3 };

  return {
    wobbleRopes(side: RopeSide): void {
      const st = states[sideIndex[side]];
      if (st) st.timer = 0;
    },
    update(dt: number): void {
      for (const st of states) {
        if (st.timer < 0) continue;
        st.timer += dt;
        if (st.timer >= WOBBLE_DURATION) {
          st.timer = -1;
          st.meshes.forEach((m, i) => m.position.copy(st.basePos[i]!));
          continue;
        }
        // 減衰する外向き振動
        const decay  = 1 - st.timer / WOBBLE_DURATION;
        const offset = Math.sin(st.timer * WOBBLE_FREQ) * WOBBLE_AMP * decay * decay;
        st.meshes.forEach((m, i) => {
          m.position.copy(st.basePos[i]!).addScaledVector(st.normal, Math.max(0, offset));
        });
      }
    },
  };
}

function addMatLines(scene: THREE.Scene): void {
  const lineMat = new THREE.MeshStandardMaterial({ color: 0x3a3a5e, roughness: 0.8 });

  // 中央ライン
  const hLine = new THREE.Mesh(new THREE.BoxGeometry(RING_HALF * 2, 0.01, 0.05), lineMat);
  hLine.position.y = 0.155;
  scene.add(hLine);

  const vLine = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, RING_HALF * 2), lineMat);
  vLine.position.y = 0.155;
  scene.add(vLine);

  // 外周ライン
  const borderMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  [
    { w: RING_HALF * 2, d: 0.05, x: 0, z:  RING_HALF - 0.025 },
    { w: RING_HALF * 2, d: 0.05, x: 0, z: -RING_HALF + 0.025 },
    { w: 0.05, d: RING_HALF * 2, x:  RING_HALF - 0.025, z: 0 },
    { w: 0.05, d: RING_HALF * 2, x: -RING_HALF + 0.025, z: 0 },
  ].forEach(({ w, d, x, z }) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.01, d), borderMat);
    m.position.set(x, 0.155, z);
    scene.add(m);
  });
}

function addTurnbucklePads(
  scene: THREE.Scene,
  px: number,
  pz: number,
  mat: THREE.Material
): void {
  const padGeo = new THREE.BoxGeometry(0.25, 0.4, 0.1);
  const heights = [0.7, 1.2, 1.8];
  heights.forEach((y) => {
    // 内側向き2方向
    const dirX = px > 0 ? -1 : 1;
    const dirZ = pz > 0 ? -1 : 1;

    const padX = new THREE.Mesh(padGeo, mat);
    padX.position.set(px + dirX * 0.18, y, pz);
    padX.rotation.y = Math.PI / 2;
    scene.add(padX);

    const padZ = new THREE.Mesh(padGeo, mat);
    padZ.position.set(px, y, pz + dirZ * 0.18);
    scene.add(padZ);
  });
}

function addRopeSegments(
  scene: THREE.Scene,
  y: number,
  mat: THREE.Material
): void {
  const R = RING_HALF;
  const segments: Array<{ from: THREE.Vector3; to: THREE.Vector3; side: RopeSide }> = [
    { from: new THREE.Vector3(-R, y, -R), to: new THREE.Vector3( R, y, -R), side: "north" },
    { from: new THREE.Vector3( R, y, -R), to: new THREE.Vector3( R, y,  R), side: "east" },
    { from: new THREE.Vector3( R, y,  R), to: new THREE.Vector3(-R, y,  R), side: "south" },
    { from: new THREE.Vector3(-R, y,  R), to: new THREE.Vector3(-R, y, -R), side: "west" },
  ];

  segments.forEach(({ from, to, side }) => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

    const geo = new THREE.CylinderGeometry(ROPE_RADIUS, ROPE_RADIUS, len, 8);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(mid);

    // 向きを合わせる
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      axis,
      dir.normalize()
    );
    mesh.quaternion.copy(quaternion);
    mesh.castShadow = true;
    scene.add(mesh);
    ropeSideMeshes[side].push(mesh);
  });
}

function addArenaDecor(scene: THREE.Scene): void {
  // 遠景に観客席の雰囲気を出す暗いシリンダー群
  const standMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 1.0,
    side: THREE.BackSide,
  });
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(28, 30, 12, 32, 1, true),
    standMat
  );
  stand.position.y = 5;
  scene.add(stand);

  // 観客席の小さな光点
  const pointsMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.5,
  });
  const positions: number[] = [];
  for (let i = 0; i < 800; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 18 + Math.random() * 8;
    const h = 2 + Math.random() * 8;
    positions.push(
      Math.cos(theta) * r,
      h,
      Math.sin(theta) * r
    );
  }
  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  scene.add(new THREE.Points(pointsGeo, pointsMat));
}
