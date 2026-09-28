/**
 * Shared engine for the hero films: posterised "print" materials, a post pass that
 * draws hand-wobbled ink outlines from depth and normals, a scroll camera path, and
 * canvas text textures. Used by the Night desk hero (components/film/NightDesk.tsx).
 */
import * as THREE from 'three';

export const C = {
  paper: '#0b0b0b',
  ink: '#0c0c0e',
  mid: '#2a292e',
  cream: '#ebe5d6',
  yellow: '#ffe94d',
  yellowMid: '#8a7a16',
  yellowShade: '#1c1904',
};

/** True on phones and low-core machines: scenes use smaller shadow maps. */
export const LOW = typeof window !== 'undefined' && (window.matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency || 8) <= 4);
export const shadowSize = (n) => (LOW ? Math.max(512, n / 2) : n);

export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
/** Eased 0..1 progress of p through the window [a, b]. */
export const seg = (p, a, b) => smooth((p - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * A posterised Lambert material: lighting is measured, then snapped to three inks
 * (shade, mid, lit) like a three-colour screen print. Maps multiply in before the snap,
 * so black text on a white map prints in the shade ink.
 */
export function tone(o = {}) {
  const m = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: o.map || null,
    side: o.side ?? THREE.FrontSide,
    transparent: !!o.transparent,
    opacity: o.opacity ?? 1,
    alphaTest: o.alphaTest ?? 0,
  });
  const u = {
    uLit: { value: new THREE.Color(o.lit ?? C.cream) },
    uMid: { value: new THREE.Color(o.mid ?? C.mid) },
    uShade: { value: new THREE.Color(o.shade ?? C.ink) },
    uT1: { value: o.t1 ?? 0.05 },
    uT2: { value: o.t2 ?? 0.3 },
    uText: { value: new THREE.Color(o.text ?? o.shade ?? C.ink) },
  };
  m.userData.u = u;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.fragmentShader =
      'uniform vec3 uLit;\nuniform vec3 uMid;\nuniform vec3 uShade;\nuniform vec3 uText;\nuniform float uT1;\nuniform float uT2;\n' +
      sh.fragmentShader
        .replace('#include <map_fragment>', '#include <map_fragment>\n vec3 texMask = diffuseColor.rgb; diffuseColor.rgb = vec3(1.0);')
        .replace(
        '#include <opaque_fragment>',
        `float lum = dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722));
         float w = fwidth(lum) * 0.75 + 0.002;
         vec3 inkc = mix(uShade, uMid, smoothstep(uT1 - w, uT1 + w, lum));
         inkc = mix(inkc, uLit, smoothstep(uT2 - w, uT2 + w, lum));
         inkc = mix(uText, inkc, dot(texMask, vec3(0.3333)));
         gl_FragColor = vec4(inkc, diffuseColor.a);`
      );
  };
  return m;
}

export function mixInks(m, a, b, t) {
  const u = m.userData.u;
  u.uLit.value.set(a[0]).lerp(new THREE.Color(b[0]), t);
  u.uMid.value.set(a[1]).lerp(new THREE.Color(b[1]), t);
  u.uShade.value.set(a[2]).lerp(new THREE.Color(b[2]), t);
  u.uText.value.copy(u.uShade.value);
}

export const YELLOW_INKS = [C.yellow, C.yellowMid, C.yellowShade];

/** Unlit colour, for screens, glows and signal threads. Lives on layer 1 (no outlines). */
export function glow(color, o = {}) {
  return new THREE.MeshBasicMaterial({ color, toneMapped: false, ...o });
}

export function shadowed(obj, cast = true, receive = true) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } });
  return obj;
}


/* ---------- canvas textures ---------- */

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const api = {
    canvas: c, g, tex,
    redraw(fn = draw) { g.clearRect(0, 0, w, h); fn(g, w, h); tex.needsUpdate = true; },
  };
  if (draw) api.redraw(draw);
  return api;
}

export function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

export function wrap(g, text, x, y, maxW, lh, maxLines = 3) {
  const words = text.split(' ');
  let line = '', n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y + n * lh); n++; line = words[i];
      if (n >= maxLines) return n;
    } else line = test;
  }
  if (line) { g.fillText(line, x, y + n * lh); n++; }
  return n;
}

export const FONT = {
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
  sans: 'Archivo, "Helvetica Neue", Arial, sans-serif',
  serif: 'Gloock, Georgia, serif',
};
export function setFonts(f) { Object.assign(FONT, f); }

/* ---------- camera path ---------- */

function cr(p0, p1, p2, p3, t, out) {
  const t2 = t * t, t3 = t2 * t;
  out.set(0, 0, 0)
    .addScaledVector(p0, -0.5 * t3 + t2 - 0.5 * t)
    .addScaledVector(p1, 1.5 * t3 - 2.5 * t2 + 1)
    .addScaledVector(p2, -1.5 * t3 + 2 * t2 + 0.5 * t)
    .addScaledVector(p3, 0.5 * t3 - 0.5 * t2);
  return out;
}

/** Keys: [{ p, pos:[x,y,z], look:[x,y,z], fov }]. Eased per segment, so the camera settles on every key. */
export class Path {
  constructor(keys) {
    this.k = keys.map((k) => ({ p: k.p, pos: new THREE.Vector3(...k.pos), look: new THREE.Vector3(...k.look), fov: k.fov ?? 40 }));
  }
  at(p, pos, look) {
    const k = this.k, n = k.length;
    if (p <= k[0].p) { pos.copy(k[0].pos); look.copy(k[0].look); return k[0].fov; }
    if (p >= k[n - 1].p) { pos.copy(k[n - 1].pos); look.copy(k[n - 1].look); return k[n - 1].fov; }
    let i = 0;
    while (i < n - 2 && p > k[i + 1].p) i++;
    const a = k[i], b = k[i + 1];
    const t = smooth((p - a.p) / Math.max(1e-6, b.p - a.p));
    const p0 = k[Math.max(0, i - 1)], p3 = k[Math.min(n - 1, i + 2)];
    cr(p0.pos, a.pos, b.pos, p3.pos, t, pos);
    cr(p0.look, a.look, b.look, p3.look, t, look);
    return a.fov + (b.fov - a.fov) * t;
  }
}

/* ---------- renderer with ink post pass ---------- */

const POST_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const POST_FS = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tColor;
uniform sampler2D tNormal;
uniform sampler2D tDepth;
uniform vec2 uRes;
uniform float uNear, uFar, uTime, uLine, uGrain, uPx;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y); }
float invZ(vec2 uv){ float d = texture2D(tDepth, uv).x; float z = d * 2.0 - 1.0;
  float lin = (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear)); return 1.0 / lin; }
vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).xyz * 2.0 - 1.0; }
vec3 toSRGB(vec3 c){ c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
void main(){
  vec2 px = uPx / uRes;
  vec2 q = vUv * uRes / (11.0 * uPx);
  vec2 wob = (vec2(vnoise(q), vnoise(q + 19.7)) - 0.5) * px * 1.5;
  vec2 uv = vUv + wob;
  float i0 = invZ(uv);
  float il = invZ(uv - vec2(px.x, 0.0)), ir = invZ(uv + vec2(px.x, 0.0));
  float iu = invZ(uv + vec2(0.0, px.y)), id = invZ(uv - vec2(0.0, px.y));
  float lap = (abs(il + ir - 2.0 * i0) + abs(iu + id - 2.0 * i0)) / max(i0, 1e-4);
  vec3 n0 = nrm(uv);
  float ne = 0.0;
  ne = max(ne, 1.0 - dot(n0, nrm(uv - vec2(px.x, 0.0))));
  ne = max(ne, 1.0 - dot(n0, nrm(uv + vec2(px.x, 0.0))));
  ne = max(ne, 1.0 - dot(n0, nrm(uv + vec2(0.0, px.y))));
  ne = max(ne, 1.0 - dot(n0, nrm(uv - vec2(0.0, px.y))));
  float edge = max(smoothstep(0.012, 0.03, lap), smoothstep(0.12, 0.3, ne));
  vec3 col = texture2D(tColor, vUv).rgb;
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  vec3 lineCol = mix(vec3(0.016), col * 0.12, smoothstep(0.01, 0.05, l));
  col = mix(col, lineCol, edge * uLine);
  vec3 s = toSRGB(col);
  float g = hash(gl_FragCoord.xy + fract(uTime * 7.0) * vec2(113.0, 71.0)) - 0.5;
  s += g * uGrain * (0.35 + 0.65 * smoothstep(0.02, 0.6, l));
  vec2 c = vUv - 0.5;
  s *= 1.0 - dot(c, c) * 0.22;
  gl_FragColor = vec4(s, 1.0);
}`;

export class Stage {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ dprMax?: number }} [o]
   */
  constructor(canvas, o = {}) {
    this.canvas = canvas;
    this.dprMax = o.dprMax ?? 1.6;
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false }));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    r.shadowMap.autoUpdate = false;
    r.autoClear = true;
    this.clearColor = new THREE.Color(C.paper);
    this.normalMat = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
    this.rtN = new THREE.WebGLRenderTarget(4, 4, { depthTexture: new THREE.DepthTexture(4, 4) });
    this.rtC = new THREE.WebGLRenderTarget(4, 4, { samples: 4, type: THREE.HalfFloatType });
    this.post = new THREE.ShaderMaterial({
      vertexShader: POST_VS,
      fragmentShader: POST_FS,
      uniforms: {
        tColor: { value: this.rtC.texture },
        tNormal: { value: this.rtN.texture },
        tDepth: { value: this.rtN.depthTexture },
        uRes: { value: new THREE.Vector2(4, 4) },
        uNear: { value: 0.05 }, uFar: { value: 60 },
        uTime: { value: 0 }, uLine: { value: 1 }, uGrain: { value: 0.045 }, uPx: { value: 1 },
      },
      depthTest: false, depthWrite: false,
    });
    this.postScene = new THREE.Scene();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.post);
    quad.frustumCulled = false;
    this.postScene.add(quad);
    this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.w = this.h = 0;
  }
  resize(w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprMax);
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = w; this.h = h; this.dpr = dpr;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    this.rtN.setSize(W, H);
    this.rtC.setSize(W, H);
    this.post.uniforms.uRes.value.set(W, H);
    this.post.uniforms.uPx.value = Math.max(1, dpr * 0.85);
  }
  render(scene, camera, time) {
    const r = this.renderer;
    camera.layers.set(0);
    const bg = scene.background; scene.background = null;
    scene.overrideMaterial = this.normalMat;
    r.shadowMap.needsUpdate = false;
    r.setRenderTarget(this.rtN);
    r.setClearColor(0x7f7fff, 1);
    r.clear();
    r.render(scene, camera);
    scene.overrideMaterial = null; scene.background = bg;
    camera.layers.set(0);
    camera.layers.enable(1);
    r.shadowMap.needsUpdate = true;
    r.setRenderTarget(this.rtC);
    r.setClearColor(this.clearColor, 1);
    r.clear();
    r.render(scene, camera);
    r.setRenderTarget(null);
    const u = this.post.uniforms;
    u.uNear.value = camera.near; u.uFar.value = camera.far; u.uTime.value = time;
    r.render(this.postScene, this.postCam);
  }
  dispose() {
    this.rtN.dispose(); this.rtC.dispose(); this.post.dispose(); this.normalMat.dispose(); this.renderer.dispose();
  }
}

export function disposeScene(scene) {
  scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of ms) { if (m.map) m.map.dispose(); if (m.alphaMap) m.alphaMap.dispose(); m.dispose(); }
  });
}
