/* =========================================================
   Хромированная 3D-ёлка (three.js)
   «Надутая» зеркальная ёлка со звездой и петелькой,
   плавно поворачивается туда-сюда на небольшой угол.
   Монтируется во все элементы [data-tree3d].
   ========================================================= */
import * as THREE from "./vendor/three.module.min.js";

const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* --- формы --- */
function treeShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 2.1);
  s.quadraticCurveTo(0.32, 1.55, 0.78, 1.08);    // верхний ярус, правый кончик
  s.quadraticCurveTo(0.52, 1.1, 0.32, 1.02);
  s.quadraticCurveTo(0.72, 0.48, 1.18, 0.06);    // средний ярус
  s.quadraticCurveTo(0.86, 0.1, 0.56, 0.02);
  s.quadraticCurveTo(1.0, -0.58, 1.55, -0.98);   // нижний ярус
  s.quadraticCurveTo(0.82, -1.12, 0, -1.08);
  s.quadraticCurveTo(-0.82, -1.12, -1.5, -0.95);
  s.quadraticCurveTo(-0.98, -0.56, -0.56, 0.02);
  s.quadraticCurveTo(-0.84, 0.1, -1.14, 0.08);
  s.quadraticCurveTo(-0.7, 0.5, -0.32, 1.02);
  s.quadraticCurveTo(-0.5, 1.1, -0.74, 1.1);
  s.quadraticCurveTo(-0.3, 1.55, 0, 2.1);
  return s;
}
function starShape(R, r, n = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i <= n * 2; i++) {
    const a = Math.PI / 2 + i * Math.PI / n, rad = i % 2 ? r : R;
    const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
    i ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  return s;
}
function sparkleShape(R) {                         // четырёхлучевая искра с вогнутыми гранями
  const s = new THREE.Shape(), k = R * .16;
  s.moveTo(0, R);
  s.quadraticCurveTo(k, k, R, 0);
  s.quadraticCurveTo(k, -k, 0, -R);
  s.quadraticCurveTo(-k, -k, -R, 0);
  s.quadraticCurveTo(-k, k, 0, R);
  return s;
}
/* «Надутая» форма: сетка внутри силуэта, высота растёт от края к центру (как воздушный шарик) */
function inflate(shape, { res = 0.02, R = 0.45, H = 0.32 } = {}) {
  const pts = shape.getPoints(80);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  pts.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
  const inside = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; };
  const near = (x, y) => { let m = Infinity, P = [x, y]; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[j], b = pts[i]; const dx = b.x - a.x, dy = b.y - a.y; const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1))); const ex = a.x + t * dx, ey = a.y + t * dy; const d = (ex - x) ** 2 + (ey - y) ** 2; if (d < m) { m = d; P = [ex, ey]; } } return P; };
  const dist = (x, y) => { let m = Infinity; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[j], b = pts[i]; const dx = b.x - a.x, dy = b.y - a.y; const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1))); const ex = a.x + t * dx - x, ey = a.y + t * dy - y; m = Math.min(m, ex * ex + ey * ey); } return Math.sqrt(m); };
  const nx = Math.ceil((maxX - minX) / res) + 3, ny = Math.ceil((maxY - minY) / res) + 3;
  const ox = minX - res, oy = minY - res;
  const zf = new Float32Array(nx * ny), ins = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = ox + i * res, y = oy + j * res, k = j * nx + i;
    if (inside(x, y)) { ins[k] = 1; const t = Math.min(dist(x, y) / R, 1); zf[k] = H * Math.sqrt(1 - (1 - t) * (1 - t)); }
  }
  // вершины на границе прижимаем к z=0, чтобы перед и зад сходились
  const pos = [], idx = [], map = new Int32Array(nx * ny).fill(-1);
  const vert = (i, j, side) => { const k = j * nx + i; const key = side ? k + nx * ny : k; if (!vert.m) vert.m = new Map(); if (vert.m.has(key)) return vert.m.get(key); const id = pos.length / 3; let px = ox + i * res, py = oy + j * res; if (!ins[k]) [px, py] = near(px, py); pos.push(px, py, (ins[k] ? zf[k] : 0) * (side ? -1 : 1)); vert.m.set(key, id); return id; };
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    if (!(ins[a] || ins[b] || ins[c] || ins[d])) continue;
    if (ins[a] + ins[b] + ins[c] + ins[d] < 2) continue;
    for (const side of [0, 1]) {
      const A = vert(i, j, side), B = vert(i + 1, j, side), C = vert(i, j + 1, side), D = vert(i + 1, j + 1, side);
      side ? idx.push(A, C, B, B, C, D) : idx.push(A, B, C, B, D, C);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.center(); g.computeVertexNormals();
  return g;
}

/* Студийное окружение: светлые софтбоксы и тёмные полосы — даёт глубокие хромовые отражения */
function studioEnv(renderer, bright = false) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 512;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 512);
  if (bright) { g.addColorStop(0, "#ffffff"); g.addColorStop(.3, "#c3c8d2"); g.addColorStop(.48, "#2b3346"); g.addColorStop(.6, "#8a92a6"); g.addColorStop(1, "#eef1f6"); }
  else { g.addColorStop(0, "#f4f5f7"); g.addColorStop(.3, "#9ea3ab"); g.addColorStop(.47, "#16181d"); g.addColorStop(.6, "#3c4048"); g.addColorStop(1, "#c9ccd2"); }
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  const box = (px, w, top, h, a) => { const gg = x.createLinearGradient(px, 0, px + w, 0); gg.addColorStop(0, `rgba(255,255,255,0)`); gg.addColorStop(.5, `rgba(255,255,255,${a})`); gg.addColorStop(1, `rgba(255,255,255,0)`); x.fillStyle = gg; x.fillRect(px, top, w, h); };
  box(120, 120, 60, 210, 1); box(470, 70, 40, 240, .95); box(760, 150, 80, 180, .9);
  x.fillStyle = "rgba(10,12,16,.85)"; x.fillRect(300, 120, 60, 200); x.fillRect(640, 90, 40, 260); x.fillRect(930, 140, 50, 160);
  const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
  const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromEquirectangular(t).texture; t.dispose();
  return { env, pm };
}

function build(el) {
  if (el.__tree3d) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (e) { el.classList.add("tree3d--fallback"); return; }
  el.__tree3d = true;
  const plain = el.dataset.tree3d === "plain";
  const W = () => el.clientWidth, H = () => el.clientHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = el.dataset.tree3d === "plain" ? 1.1 : 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const { env, pm: pmrem } = studioEnv(renderer, el.dataset.tree3d === "plain");
  scene.environment = env;

  const camera = new THREE.PerspectiveCamera(30, W() / H(), 0.1, 100);
  camera.position.set(0, plain ? 0.3 : 0.25, plain ? 8.6 : 9.2);

  /* зеркальный хром */
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xe9ecf2, metalness: 1, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: plain ? 1.5 : 1.15 });

  const group = new THREE.Group();
  const tree = new THREE.Mesh(inflate(treeShape(), { res: 0.018, R: 0.5, H: 0.34 }), chrome);
  group.add(tree);
  const star = new THREE.Mesh(inflate(starShape(0.44, 0.21), { res: 0.012, R: 0.16, H: 0.13 }), chrome);
  star.position.set(0.02, 1.72, 0.12); star.rotation.z = -0.08;
  group.add(star);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 24, 64), chrome);
  ring.position.set(0.02, 2.2, 0); group.add(ring);
  group.rotation.z = plain ? -0.3 : -0.12;                         // лёгкий наклон, как у игрушки на ниточке
  scene.add(group);

  /* хромированные искры вокруг */
  const sparkG = inflate(sparkleShape(0.34), { res: 0.01, R: 0.12, H: 0.09 });
  const sparks = (plain ? [] : [[-1.95, 1.3, .9], [1.95, 0.55, .75], [-1.7, -0.9, .55], [1.55, -1.45, .45]]).map(([x, y, s], i) => {
    const m = new THREE.Mesh(sparkG, chrome); m.position.set(x, y, 0.3); m.scale.setScalar(s); m.userData.p = i * 1.7; scene.add(m); return m;
  });

  /* мягкий свет для бликов */
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(3, 4, 5); scene.add(key);

  const clock = new THREE.Clock();
  let raf = 0;
  const frame = () => {
    const ft = new URLSearchParams(location.search).get("t");
    const t = ft !== null ? parseFloat(ft) : clock.getElapsedTime();
    const sway = reduceMotion ? 0 : Math.sin(t * 0.7);
    group.rotation.y = sway * 0.42;                 // туда-сюда ≈ ±24°
    group.position.y = reduceMotion ? 0 : Math.sin(t * 1.1) * 0.06;
    sparks.forEach(m => { m.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.9 + m.userData.p) * 0.9; m.rotation.z = t * 0.15 + m.userData.p; });
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  frame();

  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); });
  ro.observe(el);
  /* очистка, когда экран сменился */
  const mo = new MutationObserver(() => {
    if (!document.body.contains(el)) { cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect(); renderer.dispose(); pmrem.dispose(); }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

window.mountTree3D = () => document.querySelectorAll("[data-tree3d]").forEach(build);
window.mountTree3D();
