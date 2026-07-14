import * as THREE from "three";

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;       // 残り寿命 (秒)
  maxLife: number;
}

const PARTICLE_GEO = new THREE.BoxGeometry(0.08, 0.08, 0.08);

interface DamageNumber {
  el: HTMLElement;
  worldPos: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class EffectsSystem {
  private particles: Particle[] = [];
  private dmgNumbers: DamageNumber[] = [];
  private scene: THREE.Scene;

  // スクリーンシェイク
  private shakeStrength = 0;
  private shakeDecay    = 8;   // 1秒で e^-8 ≒ 0 になる減衰

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /** ストライクヒット時の火花 */
  spawnHitSparks(pos: THREE.Vector3, color: number): void {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 2,
      });
      const mesh = new THREE.Mesh(PARTICLE_GEO, mat);
      mesh.position.copy(pos).add(new THREE.Vector3(0, 1.4, 0));
      this.scene.add(mesh);

      const angle  = Math.random() * Math.PI * 2;
      const upward = 2 + Math.random() * 3;
      const speed  = 1.5 + Math.random() * 2.5;
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(
          Math.cos(angle) * speed,
          upward,
          Math.sin(angle) * speed
        ),
        life: 0.4 + Math.random() * 0.2,
        maxLife: 0.6,
      });
    }
  }

  /** スラム / ノックダウン時の床の砂煙 */
  spawnDust(pos: THREE.Vector3): void {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const grey = Math.floor(0x88 + Math.random() * 0x44);
      const color = (grey << 16) | (grey << 8) | grey;
      const scale = 0.12 + Math.random() * 0.18;
      const geo   = new THREE.BoxGeometry(scale, scale * 0.4, scale);
      const mat   = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.7,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos).add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          0.3,
          (Math.random() - 0.5) * 0.6
        )
      );
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.2;
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(Math.cos(angle) * speed, 0.5 + Math.random(), Math.sin(angle) * speed),
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
      });
    }
  }

  /** シグネチャー専用: 金色の大きな火花 */
  spawnSignatureBurst(pos: THREE.Vector3): void {
    const count = 24;
    for (let i = 0; i < count; i++) {
      const colors = [0xffd700, 0xff8800, 0xffffff];
      const color  = colors[Math.floor(Math.random() * colors.length)] ?? 0xffd700;
      const scale  = 0.1 + Math.random() * 0.15;
      const geo    = new THREE.BoxGeometry(scale, scale, scale);
      const mat    = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 3,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos).add(new THREE.Vector3(0, 1.2, 0));
      this.scene.add(mesh);

      const phi   = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const speed = 3 + Math.random() * 4;
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(
          Math.sin(theta) * Math.cos(phi) * speed,
          Math.cos(theta) * speed * 0.8 + 2,
          Math.sin(theta) * Math.sin(phi) * speed
        ),
        life: 0.7 + Math.random() * 0.5,
        maxLife: 1.2,
      });
    }
  }

  /**
   * フィニッシャー専用: 3波のカラーバースト
   *  Wave 1 — 白フラッシュリング (速・小・短命)
   *  Wave 2 — キャラカラー球形爆発 (中速・大量)
   *  Wave 3 — 大きく長く残る破片 (遅・大)
   */
  spawnFinisherBurst(pos: THREE.Vector3, color: number): void {
    const center = pos.clone().add(new THREE.Vector3(0, 1.3, 0));

    // Wave 1: white ring flash
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 4,
        transparent: true,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), mat);
      mesh.position.copy(center).add(
        new THREE.Vector3(Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6)
      );
      this.scene.add(mesh);
      const speed = 6 + Math.random() * 3;
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(Math.cos(angle) * speed, 1.5 + Math.random(), Math.sin(angle) * speed),
        life: 0.25,
        maxLife: 0.25,
      });
    }

    // Wave 2: character-color spherical burst
    for (let i = 0; i < 36; i++) {
      const phi   = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const speed = 4 + Math.random() * 6;
      const scale = 0.09 + Math.random() * 0.12;
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 3,
        transparent: true,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(scale, scale, scale), mat);
      mesh.position.copy(center);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(
          Math.sin(theta) * Math.cos(phi) * speed,
          Math.cos(theta) * speed * 0.8 + 3,
          Math.sin(theta) * Math.sin(phi) * speed
        ),
        life: 0.8 + Math.random() * 0.6,
        maxLife: 1.4,
      });
    }

    // Wave 3: large, slow, lingering shards
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const scale = 0.18 + Math.random() * 0.18;
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 2,
        transparent: true,
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(scale, scale * 0.5, scale), mat);
      mesh.position.copy(center);
      this.scene.add(mesh);
      const speed = 2 + Math.random() * 2;
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(Math.cos(angle) * speed, 4 + Math.random() * 2, Math.sin(angle) * speed),
        life: 1.2 + Math.random() * 0.5,
        maxLife: 1.7,
      });
    }
  }

  /**
   * ダメージ数値ポップアップ — DOM オーバーレイに浮遊テキストを出す
   * 大ダメージ (>= 20) は大きく赤系で表示
   */
  spawnDamageNumber(pos: THREE.Vector3, dmg: number): void {
    const rounded = Math.round(dmg);
    if (rounded <= 0) return;

    const el = document.createElement("div");
    el.textContent = `${rounded}`;
    const big = rounded >= 20;
    el.style.cssText = [
      "position:fixed",
      "pointer-events:none",
      "z-index:15",
      "font-weight:900",
      "font-family:Arial,sans-serif",
      `font-size:${big ? 34 : 22}px`,
      `color:${big ? "#ff5533" : "#ffdd44"}`,
      `text-shadow:0 0 ${big ? 14 : 8}px ${big ? "rgba(255,60,20,0.9)" : "rgba(255,200,0,0.8)"}, 0 2px 3px #000`,
      "transform:translate(-50%,-50%)",
      "letter-spacing:1px",
    ].join(";");
    document.body.appendChild(el);

    this.dmgNumbers.push({
      el,
      worldPos: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5, 2.1, 0)),
      life: 0.9,
      maxLife: 0.9,
    });
  }

  /** カメラシェイクをトリガー */
  shake(strength: number): void {
    this.shakeStrength = Math.max(this.shakeStrength, strength);
  }

  /** フレームごとに呼ぶ — dt: 秒 */
  update(dt: number, camera: THREE.Camera): void {
    this.updateParticles(dt);
    this.updateDamageNumbers(dt, camera);
    this.updateShake(dt, camera);
  }

  private updateDamageNumbers(dt: number, camera: THREE.Camera): void {
    for (let i = this.dmgNumbers.length - 1; i >= 0; i--) {
      const n = this.dmgNumbers[i]!;
      n.life -= dt;
      if (n.life <= 0) {
        n.el.remove();
        this.dmgNumbers.splice(i, 1);
        continue;
      }

      // ゆっくり上昇
      n.worldPos.y += 1.1 * dt;

      // 3D → 2D 投影
      const projected = n.worldPos.clone().project(camera);
      if (projected.z > 1) { n.el.style.display = "none"; continue; }
      const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
      n.el.style.display = "block";
      n.el.style.left = `${x}px`;
      n.el.style.top  = `${y}px`;

      // 終盤フェードアウト
      const t = n.life / n.maxLife;
      n.el.style.opacity = `${Math.min(1, t * 3)}`;
    }
  }

  private updateParticles(dt: number): void {
    const gravity = 9.8;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.life -= dt;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // 重力
      p.vel.y -= gravity * dt;

      // 位置更新
      p.mesh.position.addScaledVector(p.vel, dt);

      // 床より下には行かない
      if (p.mesh.position.y < 0.15) {
        p.mesh.position.y = 0.15;
        p.vel.y = Math.abs(p.vel.y) * 0.3;
        p.vel.x *= 0.7;
        p.vel.z *= 0.7;
      }

      // フェードアウト
      const t = p.life / p.maxLife;
      const mat = p.mesh.material as THREE.MeshStandardMaterial;
      if (mat.transparent) {
        mat.opacity = Math.min(1, t * 2);
      }
      p.mesh.scale.setScalar(t * 0.8 + 0.2);
    }
  }

  private shakeOffset = new THREE.Vector3();

  private updateShake(dt: number, camera: THREE.Camera): void {
    if (this.shakeStrength < 0.001) return;

    // 前フレームのオフセットを戻す
    camera.position.sub(this.shakeOffset);

    this.shakeStrength *= Math.exp(-this.shakeDecay * dt);

    this.shakeOffset.set(
      (Math.random() - 0.5) * 2 * this.shakeStrength,
      (Math.random() - 0.5) * 2 * this.shakeStrength * 0.5,
      0
    );

    camera.position.add(this.shakeOffset);
  }
}
