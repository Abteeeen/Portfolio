"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * The 3D lives in the repo rather than in a hosted scene file, so it is
 * version-controlled with everything else and can't be lost independently.
 */

const ACCENT = new THREE.Color("#7c5cff");
const ACCENT_2 = new THREE.Color("#4de1ff");

/**
 * Deterministic PRNG (mulberry32). Seeded rather than Math.random so the field
 * is identical on every render and between server and client.
 */
function makeRng(seed: number) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Drifting starfield that gives the hero depth behind the wireframe. */
function ParticleField({ count = 1800 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    const rand = makeRng(0x9e3779b9);

    for (let i = 0; i < count; i += 1) {
      // Distribute on a spherical shell so density stays even near the camera.
      const radius = 6 + rand() * 12;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      color.copy(ACCENT).lerp(ACCENT_2, rand());
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.02;
    ref.current.rotation.x += delta * 0.005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Central wireframe form — the focal object. */
function Core() {
  const mesh = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.08;
      mesh.current.rotation.y += delta * 0.12;
      const breathe = 1 + Math.sin(t * 0.6) * 0.04;
      mesh.current.scale.setScalar(breathe);
    }

    if (inner.current) {
      inner.current.rotation.y -= delta * 0.25;
      inner.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[2.4, 1]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.35} />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshBasicMaterial color={ACCENT_2} wireframe transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/** Eases the whole scene toward the pointer for a parallax feel. */
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!group.current) return;
    // Damped follow so the motion feels weighted rather than twitchy.
    const damp = 1 - Math.pow(0.001, delta);
    group.current.rotation.y += (pointer.x * 0.35 - group.current.rotation.y) * damp;
    group.current.rotation.x += (-pointer.y * 0.25 - group.current.rotation.x) * damp;
  });

  return <group ref={group}>{children}</group>;
}

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: "none" }}
    >
      <ParallaxRig>
        <Core />
        <ParticleField />
      </ParallaxRig>
    </Canvas>
  );
}
