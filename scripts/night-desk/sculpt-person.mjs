// Sculpts the Night desk person from signed distance fields, meshes each part with surface
// nets, simplifies with meshoptimizer and writes an uncompressed GLB. To rebuild the model:
//   npm i --no-save meshoptimizer gltfpack
//   node scripts/night-desk/sculpt-person.mjs person.raw.glb
//   npx gltfpack -i person.raw.glb -o scripts/night-desk/person.glb -cc -kn -km
// Coordinates: metres, figure space: floor under the seat, facing -z. The head and hands are
// written in local space under nodes placed at their pivots, so the scene can move them.
import * as THREE from 'three';
import fs from 'fs';
import { MeshoptSimplifier } from 'meshoptimizer';
await MeshoptSimplifier.ready;

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const Q = (x, y, z, order = 'XYZ') => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, order));

/* ------------------------------------------------------------------ SDF kit */
function toLocal(c, q) {
  const m = new THREE.Matrix4().compose(V(...c), q || new THREE.Quaternion(), V(1, 1, 1)).invert().elements;
  return (x, y, z, o) => { o[0] = m[0] * x + m[4] * y + m[8] * z + m[12]; o[1] = m[1] * x + m[5] * y + m[9] * z + m[13]; o[2] = m[2] * x + m[6] * y + m[10] * z + m[14]; };
}
const tmp = [0, 0, 0];
function sphere(c, r) { const [a, b, d] = c; return (x, y, z) => Math.hypot(x - a, y - b, z - d) - r; }
function ellipsoid(c, r, q) {
  const L = toLocal(c, q), [rx, ry, rz] = r;
  return (x, y, z) => { L(x, y, z, tmp); const [lx, ly, lz] = tmp; const k0 = Math.hypot(lx / rx, ly / ry, lz / rz), k1 = Math.hypot(lx / (rx * rx), ly / (ry * ry), lz / (rz * rz)); return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1; };
}
function roundCone(a, b, r1, r2) {
  const [ax, ay, az] = a, bx = b[0] - ax, by = b[1] - ay, bz = b[2] - az;
  const l2 = bx * bx + by * by + bz * bz, rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2, srr = Math.sign(rr);
  return (x, y, z) => {
    const px = x - ax, py = y - ay, pz = z - az;
    const yv = px * bx + py * by + pz * bz, zv = yv - l2;
    const qx = px * l2 - bx * yv, qy = py * l2 - by * yv, qz = pz * l2 - bz * yv;
    const x2 = qx * qx + qy * qy + qz * qz, y2 = yv * yv * l2, z2 = zv * zv * l2;
    const k = srr * rr * rr * x2;
    if (Math.sign(zv) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(yv) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + yv * rr) * il2 - r1;
  };
}
function roundBox(c, h, q, rad) {
  const L = toLocal(c, q);
  return (x, y, z) => { L(x, y, z, tmp); const qx = Math.abs(tmp[0]) - h[0] + rad, qy = Math.abs(tmp[1]) - h[1] + rad, qz = Math.abs(tmp[2]) - h[2] + rad; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - rad; };
}
function torus(c, R, r, q) {
  const L = toLocal(c, q);
  return (x, y, z) => { L(x, y, z, tmp); return Math.hypot(Math.hypot(tmp[0], tmp[2]) - R, tmp[1]) - r; };
}
function halfSpace(p0, n) { const l = Math.hypot(...n), [nx, ny, nz] = n.map((v) => v / l); return (x, y, z) => (x - p0[0]) * nx + (y - p0[1]) * ny + (z - p0[2]) * nz; }
const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => -smin(-a, -b, k);
const blend = (k, ...fs) => (x, y, z) => { let d = fs[0](x, y, z); for (let i = 1; i < fs.length; i++) d = smin(d, fs[i](x, y, z), k); return d; };

// value noise
const perm = new Uint8Array(512); { let s = 1234567; for (let i = 0; i < 256; i++) perm[i] = i; for (let i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [perm[i], perm[j]] = [perm[j], perm[i]]; } for (let i = 0; i < 256; i++) perm[256 + i] = perm[i]; }
const hash3 = (x, y, z) => perm[(perm[(perm[x & 255] + y) & 255] + z) & 255] / 255;
function noise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a, b, t) => a + (b - a) * t;
  return l(l(l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
           l(l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v), w) * 2 - 1;
}
const fbm = (x, y, z) => noise(x, y, z) * 0.6 + noise(x * 2.1, y * 2.1, z * 2.1) * 0.3 + noise(x * 4.3, y * 4.3, z * 4.3) * 0.1;

/* ------------------------------------------------------------ surface nets */
function surfaceNets(sdf, bmin, bmax, h, iters = 3) {
  const nx = Math.ceil((bmax[0] - bmin[0]) / h) + 1, ny = Math.ceil((bmax[1] - bmin[1]) / h) + 1, nz = Math.ceil((bmax[2] - bmin[2]) / h) + 1;
  const f = new Float32Array(nx * ny * nz);
  let i = 0;
  for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) f[i++] = sdf(bmin[0] + x * h, bmin[1] + y * h, bmin[2] + z * h);
  const id = (x, y, z) => x + nx * (y + ny * z);
  const cw = nx - 1, ch = ny - 1;
  const cells = new Int32Array(cw * ch * (nz - 1)).fill(-1);
  const pos = [];
  const C = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const v = new Float32Array(8);
  for (let z = 0; z < nz - 1; z++) for (let y = 0; y < ny - 1; y++) for (let x = 0; x < nx - 1; x++) {
    let inside = 0;
    for (let k = 0; k < 8; k++) { v[k] = f[id(x + C[k][0], y + C[k][1], z + C[k][2])]; if (v[k] < 0) inside++; }
    if (inside === 0 || inside === 8) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of E) {
      if ((v[a] < 0) === (v[b] < 0)) continue;
      const t = v[a] / (v[a] - v[b]);
      sx += C[a][0] + (C[b][0] - C[a][0]) * t; sy += C[a][1] + (C[b][1] - C[a][1]) * t; sz += C[a][2] + (C[b][2] - C[a][2]) * t; n++;
    }
    cells[x + cw * (y + ch * z)] = pos.length / 3;
    pos.push(bmin[0] + (x + sx / n) * h, bmin[1] + (y + sy / n) * h, bmin[2] + (z + sz / n) * h);
  }
  const quads = [];
  const cell = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= cw || y >= ch || z >= nz - 1 ? -1 : cells[x + cw * (y + ch * z)]);
  for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
    const a = f[id(x, y, z)];
    if (x < nx - 1 && y > 0 && z > 0) { const b = f[id(x + 1, y, z)]; if ((a < 0) !== (b < 0)) quads.push([cell(x, y - 1, z - 1), cell(x, y, z - 1), cell(x, y, z), cell(x, y - 1, z)]); }
    if (y < ny - 1 && x > 0 && z > 0) { const b = f[id(x, y + 1, z)]; if ((a < 0) !== (b < 0)) quads.push([cell(x - 1, y, z - 1), cell(x, y, z - 1), cell(x, y, z), cell(x - 1, y, z)]); }
    if (z < nz - 1 && x > 0 && y > 0) { const b = f[id(x, y, z + 1)]; if ((a < 0) !== (b < 0)) quads.push([cell(x - 1, y - 1, z), cell(x, y - 1, z), cell(x, y, z), cell(x - 1, y, z)]); }
  }
  // project onto the surface, normals from the gradient
  const e = h * 0.35, P = new Float32Array(pos), N = new Float32Array(pos.length);
  for (let k = 0; k < P.length; k += 3) {
    let x = P[k], y = P[k + 1], z = P[k + 2], gx = 0, gy = 0, gz = 0;
    for (let it = 0; it < iters; it++) {
      const d = sdf(x, y, z);
      gx = sdf(x + e, y, z) - sdf(x - e, y, z); gy = sdf(x, y + e, z) - sdf(x, y - e, z); gz = sdf(x, y, z + e) - sdf(x, y, z - e);
      const g2 = (gx * gx + gy * gy + gz * gz) / (4 * e * e);
      if (g2 < 1e-8) break;
      const s = d / g2 / (2 * e);
      const step = Math.min(h * 0.6, Math.abs(s * Math.sqrt(gx * gx + gy * gy + gz * gz)));
      const gl = Math.hypot(gx, gy, gz) || 1;
      x -= (gx / gl) * step * Math.sign(d); y -= (gy / gl) * step * Math.sign(d); z -= (gz / gl) * step * Math.sign(d);
    }
    P[k] = x; P[k + 1] = y; P[k + 2] = z;
    gx = sdf(x + e, y, z) - sdf(x - e, y, z); gy = sdf(x, y + e, z) - sdf(x, y - e, z); gz = sdf(x, y, z + e) - sdf(x, y, z - e);
    const gl = Math.hypot(gx, gy, gz) || 1;
    N[k] = gx / gl; N[k + 1] = gy / gl; N[k + 2] = gz / gl;
  }
  const idx = [];
  const pv = (i) => V(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
  for (const q of quads) {
    if (q.some((c) => c < 0)) continue;
    const [a, b, c, d] = q;
    const A = pv(a), B = pv(b), Cc = pv(c), D = pv(d);
    const nrm = new THREE.Vector3().subVectors(Cc, A).cross(new THREE.Vector3().subVectors(D, B));
    const cen = A.clone().add(B).add(Cc).add(D).multiplyScalar(0.25);
    const g = V(sdf(cen.x + e, cen.y, cen.z) - sdf(cen.x - e, cen.y, cen.z), sdf(cen.x, cen.y + e, cen.z) - sdf(cen.x, cen.y - e, cen.z), sdf(cen.x, cen.y, cen.z + e) - sdf(cen.x, cen.y, cen.z - e));
    const flip = nrm.dot(g) < 0;
    const t = A.distanceToSquared(Cc) < B.distanceToSquared(D);
    let tris = t ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
    if (flip) tris = tris.map(([p, q2, r]) => [p, r, q2]);
    for (const tr of tris) idx.push(...tr);
  }
  return { P, N, idx: new Uint32Array(idx) };
}

function simplify(m, ratio, err = 0.004) {
  const target = Math.floor((m.idx.length * ratio) / 3) * 3;
  const [out] = MeshoptSimplifier.simplify(m.idx, m.P, 3, target, err, ['LockBorder']);
  // compact vertices
  const remap = new Int32Array(m.P.length / 3).fill(-1);
  const P = [], N = [], I = new Uint32Array(out.length);
  for (let i = 0; i < out.length; i++) {
    const o = out[i];
    if (remap[o] < 0) { remap[o] = P.length / 3; P.push(m.P[o * 3], m.P[o * 3 + 1], m.P[o * 3 + 2]); N.push(m.N[o * 3], m.N[o * 3 + 1], m.N[o * 3 + 2]); }
    I[i] = remap[o];
  }
  return { P: new Float32Array(P), N: new Float32Array(N), idx: I };
}

/* ------------------------------------------------------------------- pose */
const J = {
  pelvis: [0, 0.56, 0.045], abdomen: [0, 0.71, 0.042], chest: [0, 0.88, 0.006], c7: [0, 1.072, -0.052],
  shL: [-0.178, 1.015, -0.036], shR: [0.178, 1.007, -0.04],
  elL: [-0.232, 0.822, -0.205], elR: [0.242, 0.816, -0.214],
  wrL: [-0.102, 0.816, -0.452], wrR: [0.074, 0.812, -0.437],
  headPivot: [0, 1.152, -0.1],
  hipL: [-0.09, 0.53, 0.02], hipR: [0.09, 0.53, 0.02], knL: [-0.1, 0.525, -0.43], knR: [0.1, 0.525, -0.43], anL: [-0.1, 0.09, -0.45], anR: [0.1, 0.09, -0.45],
};
const lean = Q(-0.2, 0, 0);
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/* --------------------------------------------------------------- the shirt */
function torsoCore() {
  return blend(0.055,
    ellipsoid(J.pelvis, [0.158, 0.1, 0.112]),
    ellipsoid(J.abdomen, [0.142, 0.125, 0.1], lean),
    ellipsoid(J.chest, [0.157, 0.172, 0.108], lean),
    roundCone(J.shL, J.shR, 0.052, 0.052),
    roundCone([0, 1.046, -0.042], J.shL, 0.045, 0.044),
    roundCone([0, 1.046, -0.042], J.shR, 0.045, 0.044),
    sphere(add3(J.shL, [-0.006, -0.016, 0]), 0.05),
    sphere(add3(J.shR, [0.006, -0.016, 0]), 0.05),
  );
}
function shirtSDF() {
  const core = torsoCore();
  const sleeve = (sh, el) => {
    const end = lerp3(sh, el, 0.42);
    const dir = [el[0] - sh[0], el[1] - sh[1], el[2] - sh[2]];
    const tube = roundCone(lerp3(sh, el, 0.04), end, 0.055, 0.052);
    const cap = halfSpace(end, dir);
    const hemC = end, hq = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(...dir).normalize());
    const hem = torus(hemC, 0.0515, 0.0035, hq);
    return (x, y, z) => smin(smax(tube(x, y, z), cap(x, y, z), 0.004), hem(x, y, z), 0.003);
  };
  const sL = sleeve(J.shL, J.elL), sR = sleeve(J.shR, J.elR);
  const collarQ = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(0, 0.1, -0.06).normalize());
  const collar = torus([0, 1.063, -0.05], 0.056, 0.0085, collarQ);
  const neckHole = roundCone([0, 1.03, -0.045], [0, 1.2, -0.12], 0.05, 0.05);
  const floor = halfSpace([0, 0.5, 0], [0, -1, 0]);
  return (x, y, z) => {
    let d = smin(core(x, y, z) - 0.004, smin(sL(x, y, z), sR(x, y, z), 0.01), 0.022);
    d = smax(d, -neckHole(x, y, z), 0.01);
    d = smin(d, collar(x, y, z), 0.004);
    // cloth: bunching low on the back, pulls from the shoulder blades, a soft wrinkle field
    const back = Math.max(0, Math.min(1, (z - 0.02) * 12));
    const low = Math.exp(-Math.pow((y - 0.64) / 0.06, 2));
    d -= 0.0032 * Math.sin(y * 150 + Math.sin(x * 22) * 1.6) * low * back;
    const mid = Math.exp(-Math.pow((y - 0.8) / 0.08, 2)) * back;
    d -= 0.0012 * Math.sin((y + Math.abs(x) * 0.5) * 70 + 3 * noise(x * 12, y * 12, z * 12)) * mid * Math.min(1, Math.abs(x) * 6);
    d -= 0.0012 * fbm(x * 30, y * 30, z * 30);
    return smax(d, floor(x, y, z), 0.01);
  };
}

/* ---------------------------------------------------------- neck and arms */
function armsSDF() {
  const arm = (sh, el, wr, s) => {
    const upper = roundCone(add3(sh, [-s * 0.01, -0.01, 0]), el, 0.047, 0.036);
    const dir = [wr[0] - el[0], wr[1] - el[1], wr[2] - el[2]];
    const fq = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), V(...dir).normalize());
    const upDir = [el[0] - sh[0], el[1] - sh[1], el[2] - sh[2]];
    const uq = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), V(...upDir).normalize());
    const biceps = ellipsoid(lerp3(sh, el, 0.55), [0.036, 0.034, 0.075], uq);
    const fore = roundCone(el, wr, 0.037, 0.0255);
    const belly = ellipsoid(lerp3(el, wr, 0.28), [0.043, 0.037, 0.075], fq);
    const olecranon = sphere(add3(el, [s * 0.004, -0.004, 0.018]), 0.018);
    return blend(0.022, upper, biceps, fore, belly, olecranon);
  };
  const aL = arm(J.shL, J.elL, J.wrL, -1), aR = arm(J.shR, J.elR, J.wrR, 1);
  const neck = roundCone([0, 1.03, -0.042], J.headPivot, 0.054, 0.047);
  return (x, y, z) => Math.min(aL(x, y, z), aR(x, y, z), neck(x, y, z));
}

/* --------------------------------------------------------------- the head */
// head-local: pivot at the skull base, upright, facing -z
function headSDF() {
  const cranium = ellipsoid([0, 0.09, -0.026], [0.073, 0.092, 0.097]);
  const occiput = sphere([0, 0.064, 0.03], 0.064);
  const face = ellipsoid([0, 0.022, -0.078], [0.061, 0.066, 0.058]);
  const jaw = roundCone([-0.045, 0.0, -0.06], [0.045, 0.0, -0.06], 0.026, 0.026);
  const chin = sphere([0, -0.03, -0.103], 0.022);
  const cheekL = ellipsoid([-0.047, 0.045, -0.087], [0.022, 0.017, 0.02]), cheekR = ellipsoid([0.047, 0.045, -0.087], [0.022, 0.017, 0.02]);
  const brow = blend(0.02, roundCone([-0.04, 0.086, -0.106], [-0.012, 0.089, -0.113], 0.0105, 0.011), roundCone([0.04, 0.086, -0.106], [0.012, 0.089, -0.113], 0.0105, 0.011));
  const nose = roundCone([0, 0.074, -0.118], [0, 0.038, -0.139], 0.0072, 0.0108);
  const wingL = sphere([-0.0115, 0.037, -0.128], 0.0078), wingR = sphere([0.0115, 0.037, -0.128], 0.0078);
  const lips = ellipsoid([0, 0.011, -0.115], [0.02, 0.0075, 0.01]);
  const neckStub = roundCone([0, -0.055, 0.012], [0, 0.03, -0.01], 0.044, 0.05);
  let head = blend(0.022, cranium, occiput, face, jaw, chin, neckStub);
  head = blend(0.012, head, cheekL, cheekR, brow);
  head = blend(0.006, head, nose, wingL, wingR, lips);
  const sockL = ellipsoid([-0.031, 0.068, -0.114], [0.017, 0.013, 0.012]), sockR = ellipsoid([0.031, 0.068, -0.114], [0.017, 0.013, 0.012]);
  const eyeL = sphere([-0.031, 0.067, -0.098], 0.012), eyeR = sphere([0.031, 0.067, -0.098], 0.012);
  const lidL = ellipsoid([-0.031, 0.073, -0.101], [0.0135, 0.007, 0.0115], Q(-0.35, 0, 0)), lidR = ellipsoid([0.031, 0.073, -0.101], [0.0135, 0.007, 0.0115], Q(-0.35, 0, 0));
  const mouth = roundCone([-0.018, 0.012, -0.124], [0.018, 0.012, -0.124], 0.0018, 0.0018);
  const ear = (s) => {
    const q = Q(0.1, s * 0.34, s * -0.08);
    const outer = ellipsoid([s * 0.074, 0.058, 0.004], [0.0105, 0.03, 0.02], q);
    const bowl = ellipsoid([s * 0.081, 0.056, 0.002], [0.006, 0.019, 0.012], q);
    const lobe = sphere([s * 0.072, 0.034, 0.006], 0.0085);
    return (x, y, z) => smax(smin(outer(x, y, z), lobe(x, y, z), 0.006), -bowl(x, y, z), 0.003);
  };
  const eL = ear(-1), eR = ear(1);
  return (x, y, z) => {
    let d = head(x, y, z);
    d = smax(d, -sockL(x, y, z), 0.008); d = smax(d, -sockR(x, y, z), 0.008);
    d = Math.min(d, eyeL(x, y, z), eyeR(x, y, z));
    d = smin(d, Math.min(lidL(x, y, z), lidR(x, y, z)), 0.003);
    d = smax(d, -mouth(x, y, z), 0.002);
    d = smin(d, smin(eL(x, y, z), eR(x, y, z), 0.001), 0.008);
    return d;
  };
}

// short hair: a shell over the cranium, cut at a hairline, with clumps and strand grooves
function hairSDF() {
  const C = [0, 0.09, -0.026];
  const shell = blend(0.03, ellipsoid([0, 0.094, -0.024], [0.079, 0.098, 0.103]), sphere([0, 0.066, 0.031], 0.07), ellipsoid([0, 0.142, -0.04], [0.064, 0.042, 0.078]));
  const tmax = (phi) => {
    const back = Math.pow((1 + Math.cos(phi)) / 2, 1.3);
    const side = Math.exp(-Math.pow((Math.abs(phi) - Math.PI / 2 - 0.05) / 0.32, 2));
    return 0.36 * Math.PI + 0.38 * Math.PI * back - 0.05 * Math.PI * side;
  };
  return (x, y, z) => {
    let d = shell(x, y, z);
    const lx = x - C[0], ly = y - C[1], lz = z - C[2], r = Math.hypot(lx, ly, lz) || 1e-6;
    const th = Math.acos(Math.max(-1, Math.min(1, ly / r))), phi = Math.atan2(lx, lz);
    const mask = (th - tmax(phi)) * 0.1;
    d = smax(d, mask, 0.006);
    // thin the hair out toward the hairline so it blends into the scalp
    const nearEdge = Math.max(0, Math.min(1, (tmax(phi) - th) / 0.35));
    d += 0.004 * (1 - nearEdge);
    // clumps and grooves: combed back on top, down on the sides
    const top = Math.max(0, Math.min(1, (ly / r - 0.2) * 2));
    const grooveTop = Math.sin(lx * 150 + 2.2 * noise(x * 40, y * 40, z * 40));
    const grooveSide = Math.sin((ly * 0.8 - lz * 0.6) * 140 + 2.2 * noise(x * 40, y * 40, z * 40));
    d -= 0.0016 * (grooveTop * top + grooveSide * (1 - top));
    d -= 0.0035 * fbm(x * 45, y * 45, z * 45);
    return d;
  };
}

/* -------------------------------------------------------------- the hands */
// hand-local: origin at the wrist, -z towards the fingers, +y the back of the hand.
// side = 1 right hand (thumb at -x), -1 left hand.
function handSDF(side, pose = 'type') {
  const s = side;
  const parts = [];
  parts.push(roundBox([0, 0.0, -0.049], [0.038, 0.0115, 0.043], null, 0.0105));
  parts.push(ellipsoid([0, 0.006, -0.05], [0.04, 0.016, 0.05]));
  parts.push(ellipsoid([-s * 0.024, -0.008, -0.03], [0.022, 0.015, 0.03]));
  parts.push(roundCone([0, 0.002, 0.035], [0, 0.002, -0.012], 0.0265, 0.028));
  const palm = blend(0.012, ...parts);
  const fingers = [];
  const X = [-0.027, -0.0085, 0.0095, 0.026].map((v) => v * s);
  const Zb = [-0.089, -0.092, -0.089, -0.083];
  const L1 = [0.041, 0.046, 0.043, 0.034], L2 = [0.025, 0.029, 0.027, 0.02], L3 = [0.021, 0.023, 0.022, 0.019];
  const R0 = [0.0093, 0.0095, 0.009, 0.0081];
  const splay = [-0.07, -0.02, 0.04, 0.1].map((v) => v * s);
  const flex = pose === 'pad'
    ? [[0.12, 0.22, 0.12], [0.5, 0.95, 0.5], [0.55, 1.0, 0.5], [0.6, 1.0, 0.45]]
    : [[0.36, 0.72, 0.36], [0.4, 0.76, 0.36], [0.42, 0.74, 0.35], [0.45, 0.66, 0.3]];
  const knuckles = [];
  for (let f = 0; f < 4; f++) {
    const p0 = V(X[f], 0.0, Zb[f]);
    const yaw = Q(0, -splay[f], 0);
    let dir = V(0, 0, -1).applyQuaternion(yaw);
    const axis = V(1, 0, 0).applyQuaternion(yaw);
    const pts = [p0.clone()];
    const Ls = [L1[f], L2[f], L3[f]];
    let a = 0;
    for (let k = 0; k < 3; k++) {
      a += flex[f][k];
      const d = V(0, 0, -1).applyQuaternion(yaw).applyAxisAngle(axis, -a);
      pts.push(pts[k].clone().addScaledVector(d, Ls[k]));
      dir = d;
    }
    const r = R0[f];
    const segs = [roundCone(pts[0].toArray(), pts[1].toArray(), r, r * 0.9), roundCone(pts[1].toArray(), pts[2].toArray(), r * 0.88, r * 0.8), roundCone(pts[2].toArray(), pts[3].toArray(), r * 0.79, r * 0.7)];
    const up = V(0, 1, 0).applyAxisAngle(axis, -a);
    const nailC = pts[2].clone().lerp(pts[3], 0.62).addScaledVector(up, r * 0.62);
    const nail = ellipsoid(nailC.toArray(), [r * 0.62, r * 0.18, r * 0.8], new THREE.Quaternion().setFromUnitVectors(V(0, 0, -1), dir));
    fingers.push(blend(0.0032, ...segs));
    fingers.push(nail);
    knuckles.push(sphere([X[f], 0.0085, Zb[f] + 0.002], 0.0098));
  }
  const tb = [[-s * 0.024, -0.006, -0.014], [-s * 0.047, -0.013, -0.043], [-s * 0.057, -0.021, -0.068], [-s * 0.061, -0.028, -0.09]];
  const thumb = blend(0.004, roundCone(tb[0], tb[1], 0.0135, 0.0115), roundCone(tb[1], tb[2], 0.0108, 0.0098), roundCone(tb[2], tb[3], 0.0094, 0.0077));
  const fingersF = blend(0.001, ...fingers);
  const knuck = blend(0.004, ...knuckles);
  return (x, y, z) => {
    let d = smin(palm(x, y, z), knuck(x, y, z), 0.007);
    d = smin(d, thumb(x, y, z), 0.011);
    d = smin(d, fingersF(x, y, z), 0.005);
    return d;
  };
}

/* ------------------------------------------------------------ legs, shoes */
function pantsSDF() {
  return blend(0.04,
    ellipsoid([0, 0.545, 0.045], [0.16, 0.085, 0.112]),
    roundCone(J.hipL, J.knL, 0.078, 0.058), roundCone(J.hipR, J.knR, 0.078, 0.058),
    roundCone(J.knL, J.anL, 0.056, 0.042), roundCone(J.knR, J.anR, 0.056, 0.042),
  );
}
function shoesSDF() {
  return blend(0.02,
    roundBox([-0.1, 0.045, -0.5], [0.05, 0.035, 0.13], null, 0.03), roundBox([0.1, 0.045, -0.5], [0.05, 0.035, 0.13], null, 0.03),
  );
}

/* --------------------------------------------------------------- build */
const t0 = Date.now();
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const ITERS = process.env.ITERS ? +process.env.ITERS : 3;
const parts = [];
function part(name, sdf, bmin, bmax, h, ratio, node) {
  if (ONLY && !ONLY.includes(name)) return;
  const t = Date.now();
  const m = surfaceNets(sdf, bmin, bmax, h, ITERS);
  const s = simplify(m, ratio);
  console.log(name, 'verts', m.P.length / 3, '->', s.P.length / 3, 'tris', s.idx.length / 3, (Date.now() - t) + 'ms');
  parts.push({ name, ...s, node });
}
part('shirt', shirtSDF(), [-0.27, 0.48, -0.2], [0.27, 1.13, 0.2], 0.0042, 0.2);
part('skin', armsSDF(), [-0.3, 0.76, -0.48], [0.3, 1.2, 0.05], 0.0034, 0.25);
part('pants', pantsSDF(), [-0.3, 0.02, -0.56], [0.3, 0.66, 0.2], 0.009, 0.4);
part('shoes', shoesSDF(), [-0.2, 0.0, -0.66], [0.2, 0.1, -0.33], 0.008, 0.5);
part('head', headSDF(), [-0.1, -0.08, -0.16], [0.1, 0.2, 0.11], 0.0021, 0.3, { t: J.headPivot });
part('hair', hairSDF(), [-0.1, -0.01, -0.15], [0.1, 0.205, 0.125], 0.0017, 0.25, { t: J.headPivot });
// the forearm sets the hand's heading; the wrist then bends outward (ulnar deviation) so
// the fingers point up the keyboard rather than across it
const handQ = (el, wr, roll, pitch, yaw) => {
  const dir = V(wr[0] - el[0], 0, wr[2] - el[2]).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, -1), dir);
  return Q(0, yaw, 0).multiply(q).multiply(Q(pitch, 0, roll));
};
part('handL', handSDF(-1, 'type'), [-0.075, -0.085, -0.195], [0.095, 0.04, 0.045], 0.0014, 0.35, { t: J.wrL, q: handQ(J.elL, J.wrL, 0.12, 0.1, 0.34) });
part('handR', handSDF(1, 'pad'), [-0.095, -0.085, -0.195], [0.075, 0.04, 0.045], 0.0014, 0.35, { t: J.wrR, q: handQ(J.elR, J.wrR, -0.12, 0.1, -0.3) });
console.log('total ms', Date.now() - t0);

/* --------------------------------------------------------------- GLB */
const chunks = [];
let byteOffset = 0;
const gltf = { asset: { version: '2.0', generator: 'night-desk sculpt' }, scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], materials: [], accessors: [], bufferViews: [], buffers: [] };
function pushView(arr, target) {
  const buf = Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
  const pad = (4 - (buf.length % 4)) % 4;
  gltf.bufferViews.push({ buffer: 0, byteOffset, byteLength: buf.length, target });
  chunks.push(buf, Buffer.alloc(pad));
  byteOffset += buf.length + pad;
  return gltf.bufferViews.length - 1;
}
for (const p of parts) {
  const nv = p.P.length / 3;
  let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < p.P.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], p.P[i + k]); mx[k] = Math.max(mx[k], p.P[i + k]); }
  const pv = pushView(p.P, 34962), nvw = pushView(p.N, 34962);
  const I = nv < 65536 ? new Uint16Array(p.idx) : p.idx;
  const iv = pushView(I, 34963);
  gltf.accessors.push({ bufferView: pv, componentType: 5126, count: nv, type: 'VEC3', min: mn, max: mx });
  gltf.accessors.push({ bufferView: nvw, componentType: 5126, count: nv, type: 'VEC3' });
  gltf.accessors.push({ bufferView: iv, componentType: nv < 65536 ? 5123 : 5125, count: I.length, type: 'SCALAR' });
  const a = gltf.accessors.length;
  gltf.materials.push({ name: p.name, pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 1 } });
  gltf.meshes.push({ name: p.name, primitives: [{ attributes: { POSITION: a - 3, NORMAL: a - 2 }, indices: a - 1, material: gltf.materials.length - 1 }] });
  const node = { name: p.name, mesh: gltf.meshes.length - 1 };
  if (p.node?.t) node.translation = p.node.t;
  if (p.node?.q) node.rotation = [p.node.q.x, p.node.q.y, p.node.q.z, p.node.q.w];
  gltf.nodes.push(node);
  gltf.scenes[0].nodes.push(gltf.nodes.length - 1);
}
const bin = Buffer.concat(chunks);
gltf.buffers.push({ byteLength: bin.length });
let json = Buffer.from(JSON.stringify(gltf));
json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)]);
const header = Buffer.alloc(12); header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8);
const jh = Buffer.alloc(8); jh.writeUInt32LE(json.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
const OUT = process.argv[2] || 'person.raw.glb';
fs.writeFileSync(OUT, Buffer.concat([header, jh, json, bh, bin]));
console.log('wrote', OUT, (12 + 16 + json.length + bin.length) / 1024 | 0, 'KB');
