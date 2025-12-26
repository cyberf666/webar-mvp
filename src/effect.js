// THREE は window.THREE としてグローバルに読み込まれる
const THREE = window.THREE;

/**
 * 軽量3Dエフェクトを作成
 * パーティクル + スプライト（発光核） + 回転リング
 */
export function createEffect() {
  const group = new THREE.Group();

  // ========== 1. 中心の発光核（タップ対象） ==========
  const coreGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.8,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);

  // Sprite（発光効果）
  const spriteMap = createGlowTexture();
  const spriteMaterial = new THREE.SpriteMaterial({
    map: spriteMap,
    color: 0x00ffff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.4, 0.4, 0.4);
  group.add(sprite);

  // ========== 2. パーティクルクラウド ==========
  const particleCount = 50; // 軽量化のため50個
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    // ランダムに配置
    const radius = Math.random() * 0.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // 速度（ゆっくり外側へ）
    velocities.push({
      x: (Math.random() - 0.5) * 0.001,
      y: (Math.random() - 0.5) * 0.001,
      z: (Math.random() - 0.5) * 0.001,
    });
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x00aaff,
    size: 0.02,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);

  // ========== 3. 回転リング ==========
  const ringGeometry = new THREE.TorusGeometry(0.3, 0.01, 8, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // もう1つのリング（逆回転）
  const ring2 = ring.clone();
  ring2.rotation.y = Math.PI / 3;
  group.add(ring2);

  // ========== アニメーション更新関数 ==========
  let time = 0;
  const update = () => {
    time += 0.016; // 約60fps想定

    // 核の発光パルス
    const pulse = Math.sin(time * 3) * 0.1 + 0.9;
    core.scale.set(pulse, pulse, pulse);
    sprite.material.opacity = pulse * 0.9;

    // パーティクルの移動
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;

      // 範囲外に出たら中心に戻す
      const dist = Math.sqrt(
        positions[i * 3] ** 2 +
        positions[i * 3 + 1] ** 2 +
        positions[i * 3 + 2] ** 2
      );
      if (dist > 0.6) {
        positions[i * 3] *= 0.1;
        positions[i * 3 + 1] *= 0.1;
        positions[i * 3 + 2] *= 0.1;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // リングの回転
    ring.rotation.z += 0.01;
    ring2.rotation.z -= 0.015;
  };

  return {
    clickable: group, // タップ判定対象
    update, // アニメーション更新
  };
}

/**
 * 発光テクスチャを作成（Canvas）
 */
function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(0, 255, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
