/** Reusable props for the hero scenes: plant, desk lamp, laptop, office chair, mug, books. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { tone, glow, shadowed } from './engine.js';

export const inks = {
  black: () => tone({ lit: '#4d4d54', mid: '#1c1c20', shade: '#08080a' }),
  cream: () => tone({ lit: '#ebe5d6', mid: '#2d2c31', shade: '#0f0f11' }),
  paper: () => tone({ lit: '#f4efe3', mid: '#3b3934', shade: '#131313' }),
  grey: () => tone({ lit: '#bfbab0', mid: '#29282d', shade: '#0c0c0e' }),
  yellow: () => tone({ lit: '#ffe94d', mid: '#8a7a16', shade: '#1c1904' }),
  leaf: () => tone({ lit: '#5b6650', mid: '#1e231c', shade: '#0a0b0a', side: THREE.DoubleSide }),
};

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = new THREE.Vector3(0, 1, 0);

export function rod(a, b, r, mat, radial = 12) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, radial), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
  return m;
}

export function box(w, h, d, mat, x = 0, y = 0, z = 0, r = 0) {
  const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  return m;
}

/** A folded leaf: flat-shaded so the midrib prints as a line. */
export function leafGeo(L = 0.32, W = 0.1, fold = 0.35, droop = 0.9, n = 12) {
  const pos = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, z = u * L;
    const w = W * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.04)), 0.72) * (1 - 0.2 * u);
    const y = -droop * z * z;
    pos.push(-w, y + w * fold, z, 0, y, z, w, y + w * fold, z);
  }
  for (let i = 0; i < n; i++) {
    const a = i * 3, b = (i + 1) * 3;
    idx.push(a, b, a + 1, a + 1, b, b + 1, a + 1, b + 1, a + 2, a + 2, b + 1, b + 2);
  }
  let g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g = g.toNonIndexed();
  g.computeVertexNormals();
  return g;
}

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function plant({ seed = 7, leaves = 11, height = 0.9, potR = 0.15, potH = 0.3 } = {}) {
  const g = new THREE.Group();
  const r = rng(seed);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(potR, potR * 0.78, potH, 32), inks.cream());
  pot.position.y = potH / 2;
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(potR * 1.04, potR * 1.04, 0.03, 32), inks.cream());
  rim.position.y = potH - 0.015;
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(potR * 0.95, potR * 0.95, 0.01, 24), inks.black());
  soil.position.y = potH - 0.02;
  g.add(pot, rim, soil);
  const leafMat = inks.leaf();
  const stemMat = inks.leaf();
  for (let i = 0; i < leaves; i++) {
    const a = (i / leaves) * Math.PI * 2 + r() * 0.5;
    const h = potH + height * (0.35 + 0.65 * r());
    const out = 0.05 + 0.22 * r();
    const tip = V(Math.cos(a) * out, h, Math.sin(a) * out);
    g.add(rod(V(Math.cos(a) * 0.02, potH - 0.02, Math.sin(a) * 0.02), tip, 0.0045, stemMat, 6));
    const leaf = new THREE.Mesh(leafGeo(0.26 + 0.14 * r(), 0.075 + 0.04 * r(), 0.3, 1.1 + r()), leafMat);
    leaf.position.copy(tip);
    leaf.rotation.set(-0.5 - 0.5 * r(), -a + Math.PI / 2, 0, 'YXZ');
    g.add(leaf);
  }
  return shadowed(g);
}

/** Articulated desk lamp. Returns the group plus the head position and a bulb mesh. */
export function deskLamp(base, elbow, head, aim) {
  const g = new THREE.Group();
  const black = inks.black();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.026, 32), black);
  b.position.copy(base).add(V(0, 0.013, 0));
  g.add(b);
  const b0 = base.clone().add(V(0, 0.026, 0));
  g.add(rod(b0, elbow, 0.009, black), rod(elbow, head, 0.009, black));
  const j = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 12), black);
  j.position.copy(elbow);
  g.add(j);
  const dir = aim.clone().sub(head).normalize();
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.078, 0.13, 32, 1, true), inks.black());
  shade.material.side = THREE.DoubleSide;
  shade.position.copy(head).addScaledVector(dir, 0.04);
  shade.quaternion.setFromUnitVectors(UP, dir.clone().negate());
  g.add(shade);
  const capTop = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), black);
  capTop.position.copy(head).addScaledVector(dir, -0.024);
  capTop.quaternion.copy(shade.quaternion);
  g.add(capTop);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 12), glow('#fff4c2'));
  bulb.position.copy(head).addScaledVector(dir, 0.07);
  bulb.layers.set(1);
  g.add(bulb);
  shadowed(g);
  bulb.castShadow = false;
  return { group: g, bulb, lightPos: head.clone().addScaledVector(dir, 0.08), dir };
}

/** Laptop with an unlit screen. Lid hinge at the back edge; the screen faces +z. */
export function laptop(screenTex, keysTex) {
  const g = new THREE.Group();
  const alu = inks.grey();
  const base = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.016, 0.235, 2, 0.006), alu);
  base.position.y = 0.008;
  g.add(base);
  const keys = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.12), tone({ map: keysTex, lit: '#44434a', mid: '#1c1c20', shade: '#060607' }));
  keys.rotation.x = -Math.PI / 2;
  keys.position.set(0, 0.0165, -0.03);
  g.add(keys);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.065), tone({ lit: '#a9a49a', mid: '#252429', shade: '#0b0b0d' }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.0166, 0.068);
  g.add(pad);
  const lid = new THREE.Group();
  lid.position.set(0, 0.016, -0.1175);
  const shell = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.228, 0.008, 2, 0.004), alu);
  shell.position.set(0, 0.114, 0);
  lid.add(shell);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.332, 0.22), tone({ lit: '#141416', mid: '#0e0e10', shade: '#0a0a0b' }));
  bezel.position.set(0, 0.114, 0.0042);
  lid.add(bezel);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.318, 0.199), glow('#ffffff', { map: screenTex }));
  screen.position.set(0, 0.117, 0.0046);
  screen.layers.set(1);
  lid.add(screen);
  lid.rotation.x = -0.27;
  g.add(lid);
  shadowed(g);
  screen.castShadow = false;
  return { group: g, lid, screen };
}

export function officeChair() {
  const g = new THREE.Group();
  const ink = inks.black();
  g.add(box(0.5, 0.075, 0.48, ink, 0, 0.44, 0.03, 0.03));
  const back = box(0.46, 0.4, 0.055, ink, 0, 0.8, 0.26, 0.024);
  back.rotation.x = 0.1;
  g.add(back);
  g.add(box(0.06, 0.26, 0.03, ink, 0, 0.56, 0.285, 0.01));
  g.add(rod(V(0, 0.08, 0.03), V(0, 0.41, 0.03), 0.024, ink, 16));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const end = V(Math.cos(a) * 0.3, 0.05, 0.03 + Math.sin(a) * 0.3);
    g.add(rod(V(0, 0.08, 0.03), end, 0.016, ink, 8));
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), ink);
    w.position.copy(end).setY(0.026);
    g.add(w);
  }
  return shadowed(g);
}

export function mug(mat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.04, 0.1, 28, 1, true), mat);
  body.material.side = THREE.DoubleSide;
  body.position.y = 0.05;
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.04, 24), mat);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.004;
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.041, 24), inks.black());
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.082;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.007, 10, 24, Math.PI * 1.25), mat);
  handle.position.set(0.045, 0.052, 0);
  handle.rotation.z = -Math.PI * 0.62;
  g.add(body, bottom, coffee, handle);
  return shadowed(g);
}

export function bookStack(specs) {
  const g = new THREE.Group();
  let y = 0;
  for (const s of specs) {
    const b = box(s.w, s.h, s.d, s.mat, s.x || 0, y + s.h / 2, s.z || 0, 0.004);
    b.rotation.y = s.ry || 0;
    g.add(b);
    y += s.h;
  }
  return shadowed(g);
}
