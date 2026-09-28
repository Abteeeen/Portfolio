/**
 * The person at the desk, seen from behind: a sculpted torso with shoulder blades and shirt
 * folds, tapered arms with sleeves, a head with ears, hair built from tufts, and headphones
 * resting round the neck.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { tone, shadowed } from './engine.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = new THREE.Vector3(0, 1, 0);

function cap(a, b, r, mat, radial = 18) {
  const len = Math.max(1e-4, a.distanceTo(b));
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, radial), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
  return m;
}
/** Palm-down hand, fingers along -z, thumb on the inner side. */
function makeHand(inks, side) {
  const h = new THREE.Group();
  const palm = new THREE.Mesh(new RoundedBoxGeometry(0.078, 0.026, 0.078, 3, 0.012), inks.skin);
  palm.position.set(0, 0.002, -0.034);
  h.add(palm);
  const xs = [-0.027, -0.009, 0.009, 0.027];
  xs.forEach((x, i) => {
    const k = side > 0 ? i : 3 - i;
    const len = [0.052, 0.058, 0.055, 0.045][k];
    h.add(cap(V(x, 0.004, -0.07), V(x * 1.06, -0.014, -0.07 - len), 0.0086, inks.skin, 10));
  });
  const tx = -side * 0.041;
  h.add(cap(V(tx, -0.002, -0.012), V(tx * 1.12, -0.012, -0.066), 0.0102, inks.skin, 10));
  return h;
}


const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Smooth 1D curve through [x, y] keys (cubic Hermite with averaged slopes). */
function profile(keys) {
  const n = keys.length;
  const m = keys.map((k, i) => {
    if (i === 0) return (keys[1][1] - k[1]) / (keys[1][0] - k[0]);
    if (i === n - 1) return (k[1] - keys[n - 2][1]) / (k[0] - keys[n - 2][0]);
    return (keys[i + 1][1] - keys[i - 1][1]) / (keys[i + 1][0] - keys[i - 1][0]);
  });
  return (v) => {
    if (v <= keys[0][0]) return keys[0][1];
    if (v >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0;
    while (v > keys[i + 1][0]) i++;
    const [x0, y0] = keys[i], [x1, y1] = keys[i + 1], h = x1 - x0, t = (v - x0) / h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * m[i + 1];
  };
}

/** Grid surface from fn(v, u) with u wrapping around; the seam's normals are averaged. */
function wrapSurface(fn, R, S) {
  const pos = [], idx = [];
  const p = new THREE.Vector3();
  for (let i = 0; i <= R; i++) for (let j = 0; j <= S; j++) { fn(i / R, j / S, p); pos.push(p.x, p.y, p.z); }
  for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) {
    const a = i * (S + 1) + j, b = a + S + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const nrm = g.attributes.normal;
  for (let i = 0; i <= R; i++) {
    const a = i * (S + 1), b = a + S;
    const x = (nrm.getX(a) + nrm.getX(b)) / 2, y = (nrm.getY(a) + nrm.getY(b)) / 2, z = (nrm.getZ(a) + nrm.getZ(b)) / 2;
    const l = Math.hypot(x, y, z) || 1;
    nrm.setXYZ(a, x / l, y / l, z / l);
    nrm.setXYZ(b, x / l, y / l, z / l);
  }
  return g;
}

/** A tube along points whose radius follows r(u), u = 0..1 along its length. */
function taperedTube(points, r, mat, tubular = 40, radial = 18) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const g = new THREE.TubeGeometry(curve, tubular, 1, radial, false);
  const pos = g.attributes.position;
  const c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const u = i / tubular;
    curve.getPointAt(u, c);
    const k = r(u);
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(k).add(c);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }

export function humanInks() {
  return {
    skin: tone({ lit: '#c99571', mid: '#4b3226', shade: '#120c09' }),
    tee: tone({ lit: '#5d5c64', mid: '#1d1d22', shade: '#09090a' }),
    rib: tone({ lit: '#4c4b53', mid: '#18181c', shade: '#08080a' }),
    hair: tone({ lit: '#4a3f37', mid: '#18130f', shade: '#070605', t2: 0.34 }),
    jeans: tone({ lit: '#3d4454', mid: '#15181e', shade: '#07080a' }),
    shoe: tone({ lit: '#e9e3d4', mid: '#2a292d', shade: '#0c0c0e' }),
    phones: tone({ lit: '#ffe94d', mid: '#8a7a16', shade: '#1c1904', t1: 0.02, t2: 0.12 }),
  };
}

function torsoGeometry() {
  const W = profile([[0, 0.15], [0.25, 0.148], [0.5, 0.163], [0.72, 0.188], [0.84, 0.198], [0.91, 0.168], [0.96, 0.11], [1, 0.066]]);
  const D = profile([[0, 0.103], [0.25, 0.098], [0.5, 0.108], [0.72, 0.116], [0.84, 0.112], [0.91, 0.097], [0.96, 0.074], [1, 0.056]]);
  const E = profile([[0, 2.3], [0.45, 2.5], [0.8, 3.1], [0.93, 2.6], [1, 2.1]]);
  return wrapSurface((v, u, out) => {
    const th = -Math.PI / 2 + u * Math.PI * 2;
    const c = Math.cos(th), s = Math.sin(th), n = E(v);
    let x = W(v) * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    let z = D(v) * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    const back = Math.max(0, s);
    // spine groove and shoulder blades
    z -= 0.006 * Math.exp(-Math.pow((th - Math.PI / 2) / 0.17, 2)) * sstep(0.1, 0.35, v) * (1 - sstep(0.74, 0.9, v));
    for (const side of [-1, 1]) {
      const a = Math.PI / 2 + side * 0.6;
      z += 0.012 * Math.exp(-Math.pow((th - a) / 0.3, 2)) * Math.exp(-Math.pow((v - 0.7) / 0.1, 2));
    }
    // cloth: soft horizontal folds low on the back, a few diagonal pulls from the arms
    z += 0.0038 * Math.sin(v * 44 + Math.sin(th * 3) * 0.9) * Math.exp(-Math.pow((v - 0.16) / 0.1, 2)) * back;
    const diag = Math.sin((v * 1.6 + Math.abs(c) * 1.4) * 18) * Math.exp(-Math.pow((v - 0.55) / 0.16, 2)) * Math.pow(Math.abs(c), 3) * back;
    x += 0.0025 * diag * Math.sign(c);
    z += 0.002 * diag;
    // hem flares a little over the hips
    const hem = 1 + 0.035 * (1 - sstep(0, 0.07, v));
    out.set(x * hem, v * 0.47, z * hem);
  }, 56, 64);
}

function hairCap(center, radii) {
  const tmax = (phi) => {
    const f = Math.pow((1 + Math.cos(phi)) / 2, 1.25);
    const ear = 0.07 * Math.PI * Math.exp(-Math.pow((Math.abs(Math.atan2(Math.sin(phi), Math.cos(phi))) - Math.PI / 2) / 0.33, 2));
    return 0.4 * Math.PI + 0.37 * Math.PI * f - ear;
  };
  const dirAt = (phi, th, out) => out.set(Math.sin(th) * Math.sin(phi), Math.cos(th), Math.sin(th) * Math.cos(phi));
  const d = new THREE.Vector3();
  const shell = (phi, th, extra) => {
    const tm = tmax(phi);
    const k = 1 + extra * (1 - sstep(0.72, 1.0, th / tm)) + 0.012 * Math.sin(phi * 5 + th * 3) * (1 - th / tm);
    dirAt(phi, th, d);
    return new THREE.Vector3(center.x + d.x * radii.x * k, center.y + d.y * radii.y * k, center.z + d.z * radii.z * k);
  };
  const geo = wrapSurface((v, u, out) => {
    const phi = u * Math.PI * 2;
    out.copy(shell(phi, v * tmax(phi), 0.075));
  }, 26, 64);
  return { geo, tmax, shell };
}

function hairTufts(hc, mat, count = 430, seed = 3) {
  const tuft = new THREE.ConeGeometry(0.0125, 0.03, 5, 1);
  tuft.translate(0, 0.015, 0);
  tuft.scale(1, 1, 0.4);
  const mesh = new THREE.InstancedMesh(tuft, mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  const whorl = hc.shell(0.35, 0.2 * Math.PI, 0.05);
  const up = new THREE.Vector3(), tan = new THREE.Vector3(), nrm = new THREE.Vector3(), dir = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const phi = hash(i * 3.1 + seed) * Math.PI * 2;
    const tmFrac = Math.sqrt(hash(i * 7.7 + seed)) * 0.94 + 0.03;
    const th = tmFrac * hc.tmax(phi);
    const p = hc.shell(phi, th, 0.04);
    const p2 = hc.shell(phi, th + 0.02, 0.04);
    const p3 = hc.shell(phi + 0.02, th, 0.04);
    nrm.subVectors(p2, p).cross(new THREE.Vector3().subVectors(p3, p)).normalize();
    if (nrm.y < -0.2 && th < 0.3) nrm.negate();
    // hair flows away from the crown whorl, and forward over the brow
    tan.subVectors(p, whorl);
    tan.addScaledVector(nrm, -tan.dot(nrm));
    if (tan.lengthSq() < 1e-8) tan.set(0, 0, -1);
    tan.normalize();
    const front = Math.max(0, -Math.cos(phi));
    if (front > 0.2) tan.lerp(new THREE.Vector3(0, -0.2, -1).addScaledVector(nrm, -new THREE.Vector3(0, -0.2, -1).dot(nrm)).normalize(), front * 0.6).normalize();
    const lift = 0.07 + hash(i * 1.3 + seed) * 0.16;
    dir.copy(tan).multiplyScalar(Math.cos(lift)).addScaledVector(nrm, Math.sin(lift)).normalize();
    q.setFromUnitVectors(up.set(0, 1, 0), dir);
    const spin = new THREE.Quaternion().setFromAxisAngle(dir, hash(i * 9.3) * Math.PI);
    q.premultiply(spin);
    const top = 1 - tmFrac;
    const len = 0.5 + top * 0.75 + hash(i * 5.1 + seed) * 0.25;
    sc.set(1.1 + hash(i * 2.2) * 0.5, len, 1);
    m.compose(p, q, sc);
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function makeHumanHead(inks) {
  const head = new THREE.Group();
  const sph = (r, mat, s, p) => { const x = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 30), mat); x.scale.set(s[0] * r, s[1] * r, s[2] * r); x.position.set(p[0], p[1], p[2]); return x; };
  const craniumC = V(0, 0.018, 0.012), craniumR = V(0.073, 0.093, 0.096);
  head.add(sph(1, inks.skin, [craniumR.x, craniumR.y, craniumR.z], [craniumC.x, craniumC.y, craniumC.z]));
  head.add(sph(1, inks.skin, [0.062, 0.074, 0.07], [0, -0.038, -0.03]));
  for (const s of [-1, 1]) {
    const ear = sph(1, inks.skin, [0.0095, 0.029, 0.019], [s * 0.073, -0.014, 0.014]);
    ear.rotation.set(0.12, s * 0.38, s * -0.06);
    head.add(ear);
    const lobe = sph(1, inks.skin, [0.008, 0.011, 0.01], [s * 0.071, -0.04, 0.012]);
    head.add(lobe);
  }
  const cap = hairCap(craniumC, craniumR);
  head.add(new THREE.Mesh(cap.geo, inks.hair));
  head.add(hairTufts(cap, inks.hair));
  return head;
}

/** Seated at a desk, facing -z; origin on the floor under the seat. */
export function seatedHuman(inks, o = {}) {
  const fig = new THREE.Group();
  const lean = o.lean ?? 0.16;
  const upper = new THREE.Group();
  upper.position.set(0, 0.5, 0.02);
  upper.rotation.set(-lean, 0, o.bodyRoll ?? 0.02);
  fig.add(upper);
  upper.add(new THREE.Mesh(torsoGeometry(), inks.tee));
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.0095, 10, 44), inks.rib);
  collar.position.set(0, 0.458, -0.006);
  collar.rotation.x = Math.PI / 2 + 0.32;
  upper.add(collar);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.051, 0.11, 24), inks.skin);
  neck.position.set(0, 0.5, -0.012);
  neck.rotation.x = -0.2;
  upper.add(neck);
  // headphones resting round the neck
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.0085, 10, 48, Math.PI * 1.12), inks.phones);
  band.position.set(0, 0.478, 0.006);
  band.rotation.set(Math.PI / 2 - 0.42, 0, -Math.PI * 0.06 - Math.PI);
  upper.add(band);
  for (const s of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.022, 26), inks.phones);
    cup.position.set(s * 0.076, 0.445, -0.068);
    cup.rotation.set(0.9, 0, s * 0.35);
    upper.add(cup);
  }
  const head = makeHumanHead(inks);
  head.position.set(0, 0.61, -0.032);
  head.rotation.set(-(o.pitch ?? 0.32), o.yaw ?? 0.02, o.roll ?? 0.05);
  upper.add(head);
  upper.updateMatrix();

  const hands = [];
  const sides = [
    { s: -1, e: o.elbowL ?? [-0.245, 0.805, -0.235], w: o.wristL ?? [-0.1, 0.8, -0.5] },
    { s: 1, e: o.elbowR ?? [0.25, 0.8, -0.245], w: o.wristR ?? [0.07, 0.797, -0.472] },
  ];
  for (const { s, e, w } of sides) {
    const S = V(s * 0.168, 0.392, 0.004).applyMatrix4(upper.matrix);
    const Sout = V(s * 0.198, 0.372, 0.004).applyMatrix4(upper.matrix);
    const E = V(...e), Wr = V(...w);
    const M = Sout.clone().lerp(E, 0.36);
    // sleeve with a hem
    fig.add(taperedTube([S, Sout, M], profile([[0, 0.05], [0.35, 0.06], [1, 0.053]]), inks.tee, 18, 20));
    const hem = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.0042, 8, 30), inks.rib);
    hem.position.copy(M);
    hem.quaternion.setFromUnitVectors(V(0, 0, 1), E.clone().sub(M).normalize());
    fig.add(hem);
    // the arm, with a real bend at the elbow
    const A = Sout.clone().lerp(E, 0.2);
    const Eb = E.clone().lerp(Sout, 0.16), Ea = E.clone().lerp(Wr, 0.16);
    fig.add(taperedTube([A, Eb, E, Ea, Wr], profile([[0, 0.043], [0.28, 0.041], [0.44, 0.035], [0.56, 0.038], [0.66, 0.04], [0.9, 0.031], [1, 0.027]]), inks.skin, 44, 18));
    const dir = Wr.clone().sub(E).normalize();
    const flat = dir.clone().setY(0).normalize();
    const hand = makeHand(inks, s);
    hand.position.copy(Wr);
    hand.quaternion.setFromUnitVectors(V(0, 0, -1), flat);
    hand.userData.base = hand.position.clone();
    fig.add(hand);
    hands.push(hand);
  }
  for (const s of [-1, 1]) {
    const h = V(s * 0.085, 0.49, -0.02), k = V(s * 0.1, 0.515, -0.43), a = V(s * 0.1, 0.1, -0.45);
    fig.add(cap(h, k, 0.069, inks.jeans), cap(k, a, 0.052, inks.jeans));
    const shoe = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.07, 0.26, 3, 0.03), inks.shoe);
    shoe.position.set(s * 0.11, 0.045, -0.5);
    fig.add(shoe);
  }
  fig.userData = { head, hands, upper };
  return shadowed(fig);
}
