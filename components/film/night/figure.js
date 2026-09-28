/**
 * The person at the desk: a sculpted man in a grey tee, jeans and white trainers, with yellow
 * headphones resting round his neck. The body is public/hero/person.glb, sculpted from signed
 * distance fields (face, ears, jointed hands with nails, cropped hair, shirt folds) and
 * compressed with gltfpack. His head and hands are separate nodes so the film can move them.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { tone, shadowed } from './engine.js';

/** Where the neck meets the skull, in figure space; the head node turns about this point. */
const HEAD_PIVOT = [0, 1.152, -0.1];

export function humanInks() {
  return {
    skin: tone({ lit: '#c99571', mid: '#4b3226', shade: '#120c09' }),
    tee: tone({ lit: '#5d5c64', mid: '#1d1d22', shade: '#09090a' }),
    hair: tone({ lit: '#4a3f37', mid: '#18130f', shade: '#070605', t2: 0.34 }),
    jeans: tone({ lit: '#3d4454', mid: '#15181e', shade: '#07080a' }),
    shoe: tone({ lit: '#e9e3d4', mid: '#2a292d', shade: '#0c0c0e' }),
    phones: tone({ lit: '#ffe94d', mid: '#8a7a16', shade: '#1c1904', t1: 0.02, t2: 0.12 }),
  };
}

export async function loadPerson(url) {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
  return gltf.scene;
}

/** Headphones resting round the neck: the band behind, the cups under the jaw. */
function headphones(mat) {
  const g = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.079, 0.0085, 10, 48, Math.PI * 1.16), mat);
  band.rotation.set(Math.PI / 2 - 0.38, 0, Math.PI * 1.92);
  g.add(band);
  for (const s of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.024, 28), mat);
    cup.position.set(s * 0.074, -0.022, -0.052);
    cup.rotation.set(0.95, 0, s * 0.42);
    g.add(cup);
    const pad = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.006, 8, 28), mat);
    pad.position.set(s * 0.066, -0.016, -0.046);
    pad.rotation.set(0.95 - Math.PI / 2, 0, s * 0.42);
    g.add(pad);
  }
  g.position.set(0, 1.078, -0.058);
  return g;
}

/**
 * Dresses the loaded body in the film's inks and rigs it: userData.head turns the head and hair,
 * userData.hands holds the two hands (with their rest pose in userData.base / userData.rest), and
 * userData.upper is the upper body, scaled a touch for breathing.
 */
export function seatedPerson(src, inks = humanInks()) {
  const mats = { shirt: inks.tee, skin: inks.skin, head: inks.skin, handL: inks.skin, handR: inks.skin, hair: inks.hair, pants: inks.jeans, shoes: inks.shoe };
  const parts = {};
  for (const node of [...src.children]) {
    parts[node.name] = node;
    node.traverse((o) => {
      if (o.isMesh) {
        o.material.dispose();
        o.material = mats[node.name] ?? inks.tee;
      }
    });
  }
  const fig = new THREE.Group();
  const upper = new THREE.Group();
  upper.position.y = 0.5;
  const body = new THREE.Group();
  body.position.y = -0.5;
  upper.add(body);
  fig.add(upper, parts.pants, parts.shoes);
  body.add(parts.shirt, parts.skin, headphones(inks.phones));

  const head = new THREE.Group();
  head.position.set(...HEAD_PIVOT);
  for (const n of [parts.head, parts.hair]) {
    n.position.set(0, 0, 0);
    head.add(n);
  }
  body.add(head);

  const hands = [parts.handL, parts.handR];
  for (const h of hands) {
    h.userData.base = h.position.clone();
    h.userData.rest = h.quaternion.clone();
    fig.add(h);
  }
  fig.userData = { head, hands, upper };
  return shadowed(fig);
}
