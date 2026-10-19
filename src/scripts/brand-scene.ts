import * as THREE from 'three';

/** Animate the supplied ZeroWall artwork with its pale app tile isolated for the hero. */
export async function startBrandScene(container: HTMLElement) {
  const canvas = container.querySelector<HTMLCanvasElement>('canvas')!;
  let renderer: THREE.WebGLRenderer;
  try {
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!context) return;
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch { return; }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let texture: THREE.Texture;
  try { texture = await new THREE.TextureLoader().loadAsync('/assets/v2/hero-zerowall.png'); }
  catch { renderer.dispose(); return; }
  if (!container.isConnected || motion.matches) {
    texture.dispose(); renderer.dispose(); return;
  }
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.setClearColor(0x090d14, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100); camera.position.z = 7.5;
  const group = new THREE.Group(); scene.add(group);

  const geometry = new THREE.PlaneGeometry(3.55, 3.55);
  // Original ring, white Z and fracture colours; no substitute logo geometry.
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .015, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const logo = new THREE.Group(); logo.rotation.y = -.1; group.add(logo);
  const face = new THREE.Mesh(geometry, material); face.renderOrder = 3; logo.add(face);
  const edgeMaterials: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 3; i++) {
    const edgeMaterial = new THREE.MeshBasicMaterial({ map: texture, color: 0x6f5de4, transparent: true, opacity: .15, depthWrite: false, toneMapped: false });
    edgeMaterials.push(edgeMaterial);
    const edge = new THREE.Mesh(geometry, edgeMaterial);
    edge.position.set(.012 * (i + 1), -.008 * (i + 1), -.018 * (i + 1)); edge.renderOrder = 2; logo.add(edge);
  }

  const glowData = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const index = (y * 64 + x) * 4;
    const distance = Math.hypot((x - 31.5) / 31.5, (y - 31.5) / 31.5);
    glowData[index] = glowData[index + 1] = glowData[index + 2] = 255;
    glowData[index + 3] = Math.round(Math.max(0, 1 - distance) ** 3 * 255);
  }
  const glowTexture = new THREE.DataTexture(glowData, 64, 64); glowTexture.needsUpdate = true;
  glowTexture.magFilter = THREE.LinearFilter;
  const glowMaterials = [0x00c5f5, 0x8754ff].map(color => new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, opacity: .2, depthWrite: false, toneMapped: false }));
  glowMaterials.forEach((mat, i) => { const glow = new THREE.Sprite(mat); glow.position.set(i ? .7 : -.7, i ? -.2 : .3, -.25); glow.scale.set(5.5, 5.5, 1); group.add(glow); });

  const orbitGeometry = new THREE.TorusGeometry(2.05, .003, 5, 180);
  const orbitMaterials = [0x35bfe7, 0x936bfa].map(color => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .21 }));
  const orbit = new THREE.Mesh(orbitGeometry, orbitMaterials[0]); orbit.rotation.set(1.08, .18, -.34); orbit.position.z = -.18; group.add(orbit);
  const second = new THREE.Mesh(orbitGeometry, orbitMaterials[1]); second.rotation.set(.48, -.65, .42); second.scale.setScalar(.91); second.position.z = -.3; group.add(second);
  const shardGeometry = new THREE.TetrahedronGeometry(.1);
  const shardMaterials = [0x9874ff, 0x6553dc].map(color => new THREE.MeshStandardMaterial({ color, roughness: .28, metalness: .4 }));
  const shards = Array.from({ length: 6 }, (_, i) => {
    const mesh = new THREE.Mesh(shardGeometry, shardMaterials[i % 2]);
    mesh.position.set(1.85 + Math.sin(i * 3) * .18, .94 - i * .36, .03);
    mesh.rotation.set(i * 1.3, i * .7, i); mesh.scale.setScalar(.38 + (i % 3) * .24); group.add(mesh);
    return { mesh, y: mesh.position.y };
  });
  scene.add(new THREE.AmbientLight(0xffffff, 2));
  const light = new THREE.DirectionalLight(0xdad4ff, 4); light.position.set(-3, 4, 5); scene.add(light);
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(60 * 3);
  for (let i = 0; i < 60; i++) { const a = i * 2.39996, r = 1.8 + (Math.sin(i * 73) + 1) * .7; positions[i * 3] = Math.cos(a) * r; positions[i * 3 + 1] = Math.sin(a) * r * .6; positions[i * 3 + 2] = -.4 - Math.abs(Math.sin(i * 12)); }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({ color: 0x88aff5, size: .011, transparent: true, opacity: .55 });
  const particles = new THREE.Points(particleGeometry, particleMaterial); group.add(particles);
  let visible = true, pointerX = 0, pointerY = 0, disposed = false;
  let lastFrame = -Infinity;
  const render = (time: number) => {
    if (time - lastFrame < 1000 / 30) return;
    lastFrame = time;
    const t = time * .001;
    logo.position.y = Math.sin(t * .65) * .035;
    logo.rotation.y = -.1 + Math.sin(t * .3) * .07; logo.rotation.z = Math.sin(t * .25) * .018;
    shards.forEach(({ mesh, y }, i) => { mesh.position.y = y + Math.sin(t * .6 + i) * .04; mesh.rotation.y = i * .7 + t * .12; });
    particles.rotation.z = Math.sin(t * .1) * .04;
    group.rotation.y += (pointerX * .09 - group.rotation.y) * .025;
    group.rotation.x += (pointerY * .06 - group.rotation.x) * .025;
    renderer.render(scene, camera);
  };
  const sync = () => { renderer.setAnimationLoop(visible && !document.hidden && !disposed ? render : null); };
  const resize = () => { const { width, height } = container.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }); intersection.observe(container);
  const pointer = (event: PointerEvent) => { const r = container.getBoundingClientRect(); pointerX = (event.clientX - r.left) / r.width - .5; pointerY = (event.clientY - r.top) / r.height - .5; };
  const resetPointer = () => { pointerX = pointerY = 0; };
  container.addEventListener('pointermove', pointer); container.addEventListener('pointerleave', resetPointer); document.addEventListener('visibilitychange', sync);
  const onMotion = () => { if (motion.matches) dispose(); };
  const dispose = () => {
    if (disposed) return; disposed = true;
    renderer.setAnimationLoop(null); observer.disconnect(); intersection.disconnect();
    container.removeEventListener('pointermove', pointer); container.removeEventListener('pointerleave', resetPointer); document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', onMotion); removeEventListener('pagehide', dispose); canvas.removeEventListener('webglcontextlost', dispose);
    geometry.dispose(); material.dispose(); texture.dispose(); edgeMaterials.forEach(mat => mat.dispose());
    glowTexture.dispose(); glowMaterials.forEach(mat => mat.dispose()); orbitGeometry.dispose(); orbitMaterials.forEach(mat => mat.dispose());
    shardGeometry.dispose(); shardMaterials.forEach(mat => mat.dispose()); particleGeometry.dispose(); particleMaterial.dispose();
    renderer.dispose(); container.classList.remove('is-live');
  };
  motion.addEventListener('change', onMotion); addEventListener('pagehide', dispose, { once: true }); canvas.addEventListener('webglcontextlost', dispose, { once: true });
  render(0); container.classList.add('is-live'); sync();
}
