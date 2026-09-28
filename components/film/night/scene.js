/**
 * "Night desk": Abhiram at his desk at night. The day's AI updates fly from the laptop to a
 * pinboard; most fall off, the keepers turn yellow and get tied with yellow thread to real
 * client problems; results get pinned over the problems. Scroll progress p (0..1) drives
 * everything through update(p, t); the words come in from content/film.ts.
 */
import * as THREE from 'three';
import { C, shadowSize, tone, glow, canvasTex, rr, wrap, FONT, Path, seg, smooth, lerp, mixInks, YELLOW_INKS, shadowed } from './engine.js';
export { Stage, disposeScene, setFonts } from './engine.js';
export { loadPerson } from './figure.js';
import { inks, plant, deskLamp, laptop, officeChair, mug, bookStack, box, rod } from './props.js';
import { seatedPerson } from './figure.js';
import { drawUpdateCard, drawProblemCard, drawResultCard, drawLabelCard, keysTexture } from './cards.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const PAPER_INKS = ['#f4efe3', '#3b3934', '#131313'];

function palmShape(h, lean, fronds, seed) {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const shapes = [];
  const trunk = new THREE.Shape();
  const top = new THREE.Vector2(lean, h);
  const n = 16;
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = lean * u * u, y = h * u, w = lerp(0.1, 0.045, u);
    L.push(new THREE.Vector2(x - w, y)); R.push(new THREE.Vector2(x + w, y));
  }
  trunk.moveTo(L[0].x, L[0].y);
  for (const p of L) trunk.lineTo(p.x, p.y);
  for (let i = R.length - 1; i >= 0; i--) trunk.lineTo(R[i].x, R[i].y);
  shapes.push(trunk);
  for (let f = 0; f < fronds; f++) {
    const a = (f / fronds) * Math.PI * 2 + r() * 0.4;
    const len = 1.0 + r() * 0.6;
    const dx = Math.cos(a) * len, dy = Math.sin(a) * len * 0.55 + 0.18;
    const ctrl = new THREE.Vector2(top.x + dx * 0.55, top.y + Math.abs(dy) * 0.6 + 0.25);
    const end = new THREE.Vector2(top.x + dx, top.y + dy - 0.45 * Math.abs(Math.cos(a)));
    const curve = new THREE.QuadraticBezierCurve(top.clone(), ctrl, end);
    const up = [], dn = [];
    const m = 22;
    for (let i = 0; i <= m; i++) {
      const u = i / m;
      const p = curve.getPoint(u), t = curve.getTangent(u);
      const nrm = new THREE.Vector2(-t.y, t.x);
      const w = 0.2 * Math.sin(Math.PI * Math.min(1, u * 1.1)) * (1 - u * 0.4);
      const saw = i % 2 === 0 ? 1 : 0.35;
      up.push(p.clone().addScaledVector(nrm, w * saw).addScaledVector(t, w * 0.4 * saw));
      dn.push(p.clone().addScaledVector(nrm, -w * saw).addScaledVector(t, w * 0.4 * saw));
    }
    const sh = new THREE.Shape();
    sh.moveTo(top.x, top.y);
    for (const p of up) sh.lineTo(p.x, p.y);
    for (let i = dn.length - 1; i >= 0; i--) sh.lineTo(dn[i].x, dn[i].y);
    shapes.push(sh);
  }
  return new THREE.ShapeGeometry(shapes, 6);
}

/** `person` is the body from loadPerson('/hero/person.glb'). */
export function buildNight({ updates: UPDATES, problems: PROBLEMS, systems: SYSTEMS }, person) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.paper);

  /* ---------- room ---------- */
  const wallM = tone({ lit: '#e2dbca', mid: '#2a292f', shade: '#0f0f11' });
  const floorTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#000';
    for (let i = 0; i < 8; i++) {
      g.fillRect(0, i * 128, w, 3);
      const off = (i * 389) % 1024;
      g.fillRect(off, i * 128, 3, 128);
      g.fillRect((off + 512) % 1024, i * 128, 3, 128);
    }
  });
  floorTex.tex.wrapS = floorTex.tex.wrapT = THREE.RepeatWrapping;
  floorTex.tex.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), tone({ map: floorTex.tex, lit: '#d6cfbf', mid: '#212126', shade: '#0b0b0d' }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0.5);
  floor.receiveShadow = true;
  scene.add(floor);

  const room = new THREE.Group();
  room.add(box(6.2, 3.0, 0.1, wallM, -1.0, 1.5, -1.1));
  room.add(box(6.2, 0.09, 0.02, inks.cream(), -1.0, 0.045, -1.04));
  // right wall with window opening z[-0.7, 0.7], y[0.95, 2.3]
  const wx = 1.96;
  room.add(box(0.12, 0.95, 2.95, wallM, wx, 0.475, 0.4));
  room.add(box(0.12, 0.6, 2.95, wallM, wx, 2.6, 0.4));
  room.add(box(0.12, 1.35, 0.35, wallM, wx, 1.625, -0.875));
  room.add(box(0.12, 1.35, 1.17, wallM, wx, 1.625, 1.285));
  const frameM = inks.black();
  room.add(box(0.14, 0.05, 1.46, frameM, 1.93, 0.97, 0));
  room.add(box(0.14, 0.05, 1.46, frameM, 1.93, 2.28, 0));
  room.add(box(0.14, 1.36, 0.05, frameM, 1.93, 1.625, -0.705));
  room.add(box(0.14, 1.36, 0.05, frameM, 1.93, 1.625, 0.705));
  room.add(box(0.06, 1.3, 0.045, frameM, 1.93, 1.625, 0));
  room.add(box(0.06, 0.045, 1.4, frameM, 1.93, 1.63, 0));
  room.add(box(0.26, 0.035, 1.56, inks.cream(), 1.84, 0.93, 0));
  shadowed(room);
  scene.add(room);

  /* ---------- outside ---------- */
  const out = new THREE.Group();
  const sky = canvasTex(512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#0e0e12'); gr.addColorStop(0.55, '#1f1f26'); gr.addColorStop(1, '#383841');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(235,229,214,${0.2 + Math.random() * 0.5})`; g.fillRect(Math.random() * w, Math.random() * h * 0.55, 1.5, 1.5); }
  });
  const skyM = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), glow('#ffffff', { map: sky.tex }));
  skyM.rotation.y = -Math.PI / 2;
  skyM.position.set(8.5, 2.0, -3);
  out.add(skyM);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.3, 48), glow('#ebe5d6'));
  moon.rotation.y = -Math.PI / 2;
  moon.position.set(8.4, 2.95, -6.1);
  out.add(moon);
  const hill = new THREE.Shape();
  hill.moveTo(-9, -1);
  for (let i = 0; i <= 40; i++) { const z = -9 + i * 0.5; hill.lineTo(z, 0.55 + Math.sin(i * 0.7) * 0.12 + Math.sin(i * 0.23) * 0.2); }
  hill.lineTo(11, -1);
  const hillM = new THREE.Mesh(new THREE.ShapeGeometry(hill), glow('#0a0a0c'));
  hillM.rotation.y = -Math.PI / 2;
  hillM.position.set(8.2, 0, 0);
  out.add(hillM);
  const litM = glow(C.yellow), litM2 = glow('#ebe5d6');
  for (let i = 0; i < 16; i++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.05), i % 3 ? litM2 : litM);
    w.rotation.y = -Math.PI / 2;
    w.position.set(8.1, 0.3 + (i % 4) * 0.12 + Math.sin(i) * 0.05, -7 + i * 0.55 + Math.cos(i * 3) * 0.2);
    out.add(w);
  }
  const palmM = glow('#060607', { side: THREE.DoubleSide });
  const palms = [
    { x: 5.0, z: -2.7, h: 3.0, lean: -0.55, f: 9, s: 11 },
    { x: 5.8, z: -4.5, h: 3.7, lean: 0.6, f: 10, s: 29 },
    { x: 4.4, z: -1.4, h: 2.4, lean: 0.4, f: 8, s: 5 },
  ];
  for (const pd of palms) {
    const m = new THREE.Mesh(palmShape(pd.h, pd.lean, pd.f, pd.s), palmM);
    m.rotation.y = -Math.PI / 2;
    m.position.set(pd.x, -0.2, pd.z);
    out.add(m);
  }
  out.traverse((o) => o.layers.set(1));
  scene.add(out);

  /* ---------- desk ---------- */
  const deskM = tone({ lit: '#ece6d7', mid: '#2c2b30', shade: '#0f0f11' });
  const desk = new THREE.Group();
  desk.add(box(1.72, 0.045, 0.72, deskM, 0.05, 0.75, -0.66, 0.006));
  for (const [x, z] of [[-0.78, -0.35], [-0.78, -0.97], [0.88, -0.35], [0.88, -0.97]]) desk.add(box(0.04, 0.73, 0.04, inks.black(), x, 0.365, z));
  desk.add(box(0.42, 0.56, 0.6, deskM, 0.62, 0.44, -0.68, 0.006));
  desk.add(box(0.36, 0.012, 0.02, inks.black(), 0.62, 0.58, -0.375));
  desk.add(box(0.36, 0.012, 0.02, inks.black(), 0.62, 0.36, -0.375));
  shadowed(desk);
  scene.add(desk);
  const TOP = 0.7725;

  const screen = canvasTex(1024, 640);
  const lap = laptop(screen.tex, keysTexture());
  lap.group.position.set(0, TOP, -0.6);
  scene.add(lap.group);

  const phoneTex = canvasTex(256, 544);
  const phone = new THREE.Group();
  phone.add(box(0.074, 0.009, 0.155, inks.black(), 0, 0.0045, 0, 0.004));
  const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.141), glow('#ffffff', { map: phoneTex.tex }));
  phoneScreen.rotation.x = -Math.PI / 2;
  phoneScreen.position.y = 0.0095;
  phoneScreen.layers.set(1);
  phone.add(phoneScreen);
  phone.position.set(0.36, TOP, -0.46);
  phone.rotation.y = 0.32;
  shadowed(phone);
  phoneScreen.castShadow = false;
  scene.add(phone);

  const nbTex = canvasTex(512, 720, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#000'; g.lineWidth = 2;
    for (let y = 90; y < h - 30; y += 44) { g.beginPath(); g.moveTo(30, y); g.lineTo(w - 30, y); g.stroke(); }
    g.lineWidth = 5; g.lineCap = 'round';
    const scribble = (y, len) => { g.beginPath(); g.moveTo(40, y); for (let x = 40; x < 40 + len; x += 14) g.lineTo(x, y - 14 - Math.sin(x * 0.4) * 8); g.stroke(); };
    scribble(128, 300); scribble(172, 380); scribble(216, 220); scribble(304, 340); scribble(348, 260);
  });
  const nb = new THREE.Group();
  const nbM = tone({ map: nbTex.tex, lit: '#f1ebdd', mid: '#34322e', shade: '#121212' });
  nb.add(box(0.36, 0.008, 0.25, inks.black(), 0, 0.004, 0, 0.003));
  const pgL = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.24), nbM);
  pgL.rotation.set(-Math.PI / 2, 0, 0); pgL.position.set(-0.088, 0.0095, 0);
  const pgR = pgL.clone(); pgR.position.x = 0.088;
  nb.add(pgL, pgR);
  nb.add(rod(V(0.03, 0.016, 0.07), V(0.16, 0.016, -0.04), 0.0045, inks.yellow(), 10));
  nb.position.set(-0.44, TOP, -0.52);
  nb.rotation.y = 0.12;
  shadowed(nb);
  scene.add(nb);

  const lampParts = deskLamp(V(-0.66, TOP, -0.9), V(-0.7, 1.27, -0.92), V(-0.38, 1.3, -0.64), V(-0.08, TOP, -0.5));
  scene.add(lampParts.group);

  const m1 = mug(inks.cream());
  m1.position.set(0.56, TOP, -0.8);
  scene.add(m1);
  const books = bookStack([
    { w: 0.25, h: 0.04, d: 0.18, mat: inks.black(), ry: 0.05 },
    { w: 0.23, h: 0.032, d: 0.17, mat: inks.yellow(), ry: -0.06, x: 0.01 },
    { w: 0.22, h: 0.036, d: 0.16, mat: inks.cream(), ry: 0.12, x: -0.01 },
  ]);
  books.position.set(0.78, TOP, -0.86);
  scene.add(books);

  const chair = officeChair();
  scene.add(chair);
  const fig = seatedPerson(person);
  scene.add(fig);
  const head = fig.userData.head;

  const pl = plant({ seed: 11, leaves: 13, height: 1.05 });
  pl.position.set(-1.25, 0, -0.62);
  scene.add(pl);

  /* ---------- the board ---------- */
  const board = new THREE.Group();
  const corkM = tone({ lit: '#d6c7a4', mid: '#34302a', shade: '#121110' });
  board.add(box(1.52, 0.86, 0.025, corkM, 0.05, 1.62, -1.035));
  const bf = inks.black();
  board.add(box(1.58, 0.03, 0.04, bf, 0.05, 2.065, -1.03), box(1.58, 0.03, 0.04, bf, 0.05, 1.175, -1.03));
  board.add(box(0.03, 0.92, 0.04, bf, -0.725, 1.62, -1.03), box(0.03, 0.92, 0.04, bf, 0.825, 1.62, -1.03));
  const fx = inks.black();
  board.add(box(0.03, 0.03, 0.2, fx, -0.33, 2.2, -0.95), box(0.03, 0.03, 0.2, fx, 0.43, 2.2, -0.95));
  board.add(box(1.24, 0.03, 0.065, fx, 0.05, 2.18, -0.84, 0.01));
  shadowed(board);
  scene.add(board);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.012), glow('#fff4c2'));
  strip.rotation.x = Math.PI / 2;
  strip.position.set(0.05, 2.164, -0.84);
  strip.layers.set(1);
  scene.add(strip);
  const Z = -1.018;

  const pinGeo = new THREE.SphereGeometry(0.0085, 14, 10);
  function pinned(mesh, x, y, z, rz, pinMat) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.z = rz;
    g.add(mesh);
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(0, mesh.geometry.parameters.height / 2 - 0.016, 0.007);
    g.add(pin);
    shadowed(g);
    return { g, pin };
  }
  const cardGeoS = new THREE.PlaneGeometry(0.19, 0.12);
  const cardGeoL = new THREE.PlaneGeometry(0.22, 0.15);

  for (const [txt, x] of [['TODAY IN AI', -0.36], ['CLIENT PROBLEMS', 0.465]]) {
    const t = canvasTex(512, 96, (g, w, h) => drawLabelCard(g, w, h, txt));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.056), tone({ map: t.tex, lit: '#f4efe3', mid: '#3b3934', shade: '#131313' }));
    const lbl = pinned(m, x, 1.99, Z, x < 0 ? 0.02 : -0.015, inks.black());
    scene.add(lbl.g);
  }

  const slots = [
    [-0.58, 1.84], [-0.36, 1.85], [-0.14, 1.83],
    [-0.58, 1.62], [-0.36, 1.63], [-0.14, 1.61],
    [-0.58, 1.4], [-0.36, 1.41], [-0.14, 1.39],
  ];
  const tilt = [0.04, -0.03, 0.05, -0.05, 0.02, -0.02, 0.03, -0.06, 0.01];
  const cards = UPDATES.map((u, i) => {
    const t = canvasTex(384, 240, (g, w, h) => drawUpdateCard(g, w, h, u));
    const mat = tone({ map: t.tex, lit: PAPER_INKS[0], mid: PAPER_INKS[1], shade: PAPER_INKS[2] });
    const pinMat = inks.black();
    const c = pinned(new THREE.Mesh(cardGeoS, mat), slots[i][0], slots[i][1], Z, tilt[i], pinMat);
    c.g.visible = false;
    scene.add(c.g);
    return { ...c, u, mat, pinMat, slot: V(slots[i][0], slots[i][1], Z), rz: tilt[i] };
  });

  const pslots = [[0.33, 1.77], [0.6, 1.78], [0.33, 1.49], [0.6, 1.48]];
  const ptilt = [-0.03, 0.04, 0.02, -0.04];
  const problems = PROBLEMS.map((pr, i) => {
    const t = canvasTex(400, 272, (g, w, h) => drawProblemCard(g, w, h, pr));
    const mat = tone({ map: t.tex, lit: PAPER_INKS[0], mid: PAPER_INKS[1], shade: PAPER_INKS[2] });
    const c = pinned(new THREE.Mesh(cardGeoL, mat), pslots[i][0], pslots[i][1], Z, ptilt[i], inks.black());
    scene.add(c.g);
    return { ...c, slot: V(pslots[i][0], pslots[i][1], Z) };
  });
  const results = PROBLEMS.map((pr, i) => {
    const t = canvasTex(384, 240, (g, w, h) => drawResultCard(g, w, h, pr));
    const mat = tone({ map: t.tex, lit: C.yellow, mid: '#8a7a16', shade: '#1c1904' });
    const c = pinned(new THREE.Mesh(cardGeoS, mat), 0, 0, 0, 0, inks.black());
    c.g.visible = false;
    scene.add(c.g);
    return { ...c, target: V(pslots[i][0] + 0.018, pslots[i][1] - 0.028, Z + 0.004), rz: -ptilt[i] * 1.5 + (i % 2 ? 0.05 : -0.04) };
  });

  const threadM = glow(C.yellow);
  const threads = [];
  cards.forEach((c) => {
    if (!c.u.keep) return;
    const a = c.slot.clone().add(V(Math.sin(-c.rz) * 0.044, 0.044, 0.012));
    const pr = problems[c.u.to];
    const b = pr.slot.clone().add(V(0, 0.059, 0.012));
    const mid = a.clone().lerp(b, 0.5).add(V(0, -0.06, 0.02));
    const curve = new THREE.CatmullRomCurve3([a, a.clone().lerp(mid, 0.5).add(V(0, -0.012, 0.006)), mid, mid.clone().lerp(b, 0.5).add(V(0, -0.012, 0.006)), b]);
    const geo = new THREE.TubeGeometry(curve, 80, 0.0024, 6, false);
    const m = new THREE.Mesh(geo, threadM);
    m.layers.set(1);
    geo.setDrawRange(0, 0);
    scene.add(m);
    threads.push({ m, total: geo.index.count });
  });

  /* ---------- lights ---------- */
  scene.add(new THREE.AmbientLight('#aab4d0', 0.1));
  const moonL = new THREE.DirectionalLight('#c8d0e8', 2.6);
  moonL.position.set(6.5, 3.9, 0.35);
  moonL.target.position.set(0.3, 0.6, 0.0);
  moonL.castShadow = true;
  Object.assign(moonL.shadow.camera, { left: -3.4, right: 3.4, top: 3.2, bottom: -3.2, near: 1, far: 16 });
  moonL.shadow.mapSize.setScalar(shadowSize(2048));
  moonL.shadow.bias = -0.0005;
  moonL.shadow.normalBias = 0.02;
  scene.add(moonL, moonL.target);

  const lampL = new THREE.SpotLight('#fff1d0', 1.8, 0, 0.66, 0.5, 2);
  lampL.position.copy(lampParts.lightPos);
  lampL.target.position.set(-0.06, TOP, -0.5);
  lampL.castShadow = true;
  lampL.shadow.mapSize.setScalar(shadowSize(1024));
  lampL.shadow.camera.near = 0.04;
  lampL.shadow.camera.far = 4;
  lampL.shadow.bias = -0.0006;
  lampL.shadow.normalBias = 0.015;
  scene.add(lampL, lampL.target);

  const boardLs = [-0.33, 0.43].map((x) => {
    const L = new THREE.SpotLight('#fff6e6', 3.0, 0, 1.05, 0.6, 2);
    L.position.set(x, 2.14, -0.8);
    L.target.position.set(x, 1.42, -1.04);
    L.castShadow = true;
    L.shadow.mapSize.setScalar(shadowSize(1024));
    L.shadow.camera.near = 0.05;
    L.shadow.camera.far = 4;
    L.shadow.bias = -0.0006;
    L.shadow.normalBias = 0.01;
    scene.add(L, L.target);
    return L;
  });
  const boardL = boardLs[0];

  const screenL = new THREE.PointLight('#dfe6ff', 0.35, 1.4, 2);
  screenL.position.set(0, 0.93, -0.5);
  scene.add(screenL);

  /* ---------- camera path ---------- */
  const path = new Path([
    { p: 0.0, pos: [-1.7, 1.64, 2.75], look: [0.12, 1.18, -0.6], fov: 40 },
    { p: 0.05, pos: [-1.56, 1.6, 2.55], look: [0.12, 1.16, -0.6], fov: 40 },
    { p: 0.14, pos: [0.43, 1.4, 0.42], look: [-0.05, 0.83, -0.68], fov: 34 },
    { p: 0.27, pos: [0.41, 1.39, 0.39], look: [-0.05, 0.83, -0.68], fov: 33 },
    { p: 0.34, pos: [-0.24, 1.69, 0.42], look: [-0.36, 1.65, -1.0], fov: 36 },
    { p: 0.47, pos: [-0.27, 1.68, 0.38], look: [-0.37, 1.65, -1.0], fov: 35 },
    { p: 0.54, pos: [0.22, 1.58, 0.78], look: [0.08, 1.58, -1.0], fov: 44 },
    { p: 0.67, pos: [0.2, 1.56, 0.74], look: [0.08, 1.58, -1.0], fov: 43 },
    { p: 0.74, pos: [0.5, 1.6, 0.28], look: [0.46, 1.6, -1.0], fov: 35 },
    { p: 0.87, pos: [0.52, 1.58, 0.24], look: [0.46, 1.6, -1.0], fov: 34 },
    { p: 0.95, pos: [1.3, 1.95, 2.45], look: [-0.1, 1.2, -0.72], fov: 42 },
    { p: 1.0, pos: [1.34, 1.97, 2.55], look: [-0.1, 1.2, -0.72], fov: 42 },
  ]);

  /* ---------- screens ---------- */
  let screenKey = '';
  function drawScreen(p, t) {
    const rows = p < 0.13 ? 3 : Math.min(UPDATES.length, 3 + Math.floor((p - 0.13) / 0.017));
    const marks = p > 0.215;
    const results = p > 0.7;
    const blink = Math.floor(t * 2) % 2;
    const key = `${rows}|${marks}|${results}|${blink}`;
    if (key === screenKey) return;
    screenKey = key;
    screen.redraw((g, w, h) => {
      g.fillStyle = '#111114'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1b1b20'; g.fillRect(0, 0, w, 58);
      for (let i = 0; i < 3; i++) { g.fillStyle = '#3a3a42'; g.beginPath(); g.arc(30 + i * 24, 29, 7, 0, 7); g.fill(); }
      g.font = `500 22px ${FONT.mono}`; g.fillStyle = '#8f8a80';
      if (!results) {
        g.fillText('feed · today', 120, 37);
        g.fillStyle = C.yellow; g.fillText(`${rows} new`, w - 150, 37);
        const list = UPDATES.slice(0, rows);
        list.forEach((u, i) => {
          const y = 96 + i * 60;
          const isNew = i === rows - 1 && p > 0.13 && p < 0.3;
          if (isNew) { g.fillStyle = '#1d1d23'; g.fillRect(0, y - 38, w, 58); }
          g.font = `500 20px ${FONT.mono}`; g.fillStyle = '#6f6b64'; g.fillText(u.time, 28, y);
          g.fillStyle = marks && u.keep ? C.yellow : '#a8a398'; g.fillText(u.src, 118, y);
          g.font = `600 27px ${FONT.sans}`; g.fillStyle = marks && !u.keep ? '#58554f' : '#ebe5d6';
          g.fillText(u.t, 300, y + 1);
          if (marks && !u.keep) { g.fillStyle = '#58554f'; g.fillRect(300, y - 8, g.measureText(u.t).width, 2.5); }
          if (marks && u.keep) {
            g.fillStyle = C.yellow; rr(g, w - 136, y - 26, 108, 36, 6); g.fill();
            g.fillStyle = '#111'; g.font = `700 18px ${FONT.mono}`; g.fillText('KEEP', w - 108, y - 2);
          }
        });
        if (blink && rows < UPDATES.length) { g.fillStyle = C.yellow; g.fillRect(28, 96 + rows * 60 - 20, 12, 24); }
      } else {
        g.fillText('running now', 120, 37);
        g.fillStyle = C.yellow; g.fillText(`${SYSTEMS.length} systems`, w - 190, 37);
        SYSTEMS.forEach((s, i) => {
          const y = 104 + i * 86;
          g.fillStyle = C.yellow; g.beginPath(); g.arc(40, y - 8, 9, 0, 7); g.fill();
          g.font = `600 30px ${FONT.sans}`; g.fillStyle = '#ebe5d6'; g.fillText(s.n, 68, y);
          g.font = `500 20px ${FONT.mono}`; g.fillStyle = '#8f8a80'; g.fillText(s.m, 68, y + 32);
          g.fillStyle = '#6f6b64'; g.fillText(s.t, w - 120, y);
        });
      }
    });
  }
  let phoneKey = '';
  function drawPhone(on) {
    const key = on ? 'on' : 'off';
    if (key === phoneKey) return;
    phoneKey = key;
    phoneTex.redraw((g, w, h) => {
      g.fillStyle = on ? '#16161a' : '#0b0b0c'; g.fillRect(0, 0, w, h);
      if (!on) { g.fillStyle = 'rgba(255,255,255,0.05)'; g.beginPath(); g.moveTo(0, h * 0.2); g.lineTo(w, 0); g.lineTo(w, h * 0.12); g.lineTo(0, h * 0.34); g.fill(); return; }
      g.fillStyle = '#ebe5d6'; g.font = `600 64px ${FONT.sans}`; g.textAlign = 'center'; g.fillText('23:41', w / 2, 120);
      g.textAlign = 'left';
      g.fillStyle = '#ebe5d6'; rr(g, 14, 170, w - 28, 150, 18); g.fill();
      g.fillStyle = '#25D366'; rr(g, 28, 186, 34, 34, 8); g.fill();
      g.fillStyle = '#111'; g.font = `700 20px ${FONT.sans}`; g.fillText('WhatsApp', 72, 210);
      g.font = `500 19px ${FONT.sans}`;
      wrap(g, 'New lead from your ad: Swift diesel, booked 10:30 tomorrow', 28, 250, w - 56, 24, 3);
    });
  }

  const tmp = V(0, 0, 0);
  const handTurn = new THREE.Euler();
  const handQ = new THREE.Quaternion();
  function update(p, t) {
    // cards fly from the laptop to the board
    const from = V(0, 0.93, -0.66);
    cards.forEach((c, i) => {
      const f = seg(p, 0.27 + i * 0.0065, 0.33 + i * 0.0065);
      c.g.visible = f > 0.001;
      if (!c.g.visible) return;
      let pos = tmp.copy(from).lerp(c.slot, f);
      pos.y += Math.sin(Math.PI * f) * 0.22;
      pos.z += Math.sin(Math.PI * f) * 0.28;
      c.g.position.copy(pos);
      c.g.scale.setScalar(lerp(0.3, 1, f));
      // keep a card readable while it crosses the dark room
      c.mat.userData.u.uT2.value = lerp(0.015, 0.3, smooth((f - 0.75) / 0.25));
      c.mat.userData.u.uT1.value = lerp(0.005, 0.05, smooth((f - 0.75) / 0.25));
      c.g.rotation.set(0, 0, c.rz + (1 - f) * (i % 2 ? 1.6 : -1.4));
      // rejects fall down the wall
      if (!c.u.keep) {
        const j = UPDATES.filter((u) => !u.keep).indexOf(c.u);
        const d = seg(p, 0.37 + j * 0.013, 0.415 + j * 0.013);
        if (d > 0) {
          const land = V(c.slot.x * 0.9 + (j % 2 ? 0.04 : -0.05), TOP + 0.004, -0.93 + (j % 3) * 0.03);
          c.g.position.set(lerp(c.slot.x, land.x, d), lerp(c.slot.y, land.y, d * d), lerp(c.slot.z, land.z, d));
          c.g.rotation.set(lerp(0, -Math.PI / 2, smooth(d * 1.1)), 0, c.rz + d * (j % 2 ? 1.1 : -0.9));
          c.pin.visible = d < 0.05;
        } else c.pin.visible = true;
      }
      if (c.u.keep) {
        const k = c.u.to;
        const y = seg(p, 0.415 + k * 0.01, 0.45 + k * 0.01);
        mixInks(c.mat, PAPER_INKS, YELLOW_INKS, y);
        mixInks(c.pinMat, ['#4d4d54', '#1c1c20', '#08080a'], YELLOW_INKS, y);
      }
    });
    threads.forEach((th, k) => {
      const f = seg(p, 0.53 + k * 0.028, 0.6 + k * 0.028);
      th.m.geometry.setDrawRange(0, Math.floor((f * th.total) / 6) * 6);
    });
    results.forEach((r, j) => {
      const f = seg(p, 0.72 + j * 0.022, 0.768 + j * 0.022);
      r.g.visible = f > 0.001;
      if (!r.g.visible) return;
      r.g.position.set(r.target.x + (1 - f) * 0.18, r.target.y + (1 - f) * 0.1, r.target.z + (1 - f) * 0.5);
      r.g.rotation.set(0, (1 - f) * 0.5, r.rz + (1 - f) * 0.6);
    });
    // head: down at the laptop, up at the board, back down
    const up = seg(p, 0.29, 0.35) * (1 - seg(p, 0.7, 0.78));
    const yaw = lerp(0.22, 0, seg(p, 0.48, 0.55)) * up + lerp(0, -0.24, seg(p, 0.66, 0.72)) * up;
    head.rotation.x = lerp(-0.42, 0.3, up) + Math.sin(t * 0.9) * 0.012;
    head.rotation.y = yaw + 0.02 + Math.sin(t * 0.37) * 0.02;
    head.rotation.z = 0.05 * (1 - up);
    fig.userData.upper.scale.y = 1 + Math.sin(t * 1.6) * 0.004;
    // small typing and trackpad movements from the wrists while he looks at the laptop
    const typing = 1 - up;
    fig.userData.hands.forEach((h, i) => {
      const tap = typing * Math.max(0, Math.sin(t * (i ? 3.1 : 7.3) + i));
      handTurn.set(tap * (i ? 0.012 : 0.03), i ? Math.sin(t * 1.3) * 0.035 * typing : 0, 0);
      h.quaternion.copy(h.userData.rest).multiply(handQ.setFromEuler(handTurn));
    });
    drawScreen(p, t);
    drawPhone(p > 0.88);
  }

  return { scene, path, update, lights: { lampL, boardL, moonL } };
}
