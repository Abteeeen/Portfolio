"use client";

import { useEffect, useRef, type RefObject } from "react";
import { nodes as NODES } from "@/content/film";

type Props = {
  mode: "hero" | "system";
  className?: string;
  /** 0..1 scroll progress, read every frame in system mode. */
  progressRef?: RefObject<number>;
  onHover?: (slug: string | null, name: string | null) => void;
};

/**
 * The Canvas: frosted glass cards named after real workflow nodes, joined by
 * tubes with light pulsing along them, in fog. Three.js is loaded on the client
 * after first paint. Hero mode glides forward on its own; system mode is
 * driven by scroll and reports the hovered card.
 */
export function CanvasScene({ mode, className, progressRef, onHover }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef(onHover);
  useEffect(() => {
    hoverRef.current = onHover;
  }, [onHover]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      await document.fonts.ready.catch(() => undefined);
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        return;
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const host = canvas.parentElement ?? canvas;
      let W = 1;
      let H = 1;
      let narrow = false;
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0b0b0b, 0.075);
      const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      const Y = new THREE.Color(0xffe94d);

      // procedural studio reflection
      const envScene = new THREE.Scene();
      envScene.add(new THREE.Mesh(new THREE.SphereGeometry(20, 24, 16), new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.BackSide })));
      const panel = (w: number, h: number, color: number, i: number, pos: [number, number, number]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(i), side: THREE.DoubleSide }));
        m.position.set(...pos);
        m.lookAt(0, 0, 0);
        envScene.add(m);
      };
      panel(14, 1.2, 0xffe94d, 6, [0, 9, -2]);
      panel(6, 8, 0xffffff, 2.2, [-9, 3, 4]);
      panel(5, 6, 0x8fa4c9, 0.8, [9, 2, 3]);
      panel(10, 3, 0xffffff, 0.5, [0, -8, 0]);
      const pm = new THREE.PMREMGenerator(renderer);
      const env = pm.fromScene(envScene, 0.04).texture;
      pm.dispose();
      scene.environment = env;

      const glowTex = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const g = c.getContext("2d")!;
        const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        r.addColorStop(0, "rgba(255,240,140,1)");
        r.addColorStop(0.25, "rgba(255,233,77,.55)");
        r.addColorStop(1, "rgba(255,233,77,0)");
        g.fillStyle = r;
        g.fillRect(0, 0, 128, 128);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      })();

      const monoFamily = getComputedStyle(document.body).getPropertyValue("--font-jetbrains").trim() || "monospace";
      const labelTex = (name: string, sub: string) => {
        const c = document.createElement("canvas");
        c.width = 512;
        c.height = 200;
        const g = c.getContext("2d")!;
        g.clearRect(0, 0, 512, 200);
        g.fillStyle = "#ffe94d";
        g.beginPath();
        g.roundRect(28, 62, 76, 76, 14);
        g.fill();
        g.fillStyle = "#111";
        g.font = `700 34px ${monoFamily}`;
        g.fillText(name.slice(0, 1).toUpperCase(), 52, 112);
        g.fillStyle = "rgba(242,240,234,.95)";
        g.font = `500 30px ${monoFamily}`;
        g.fillText(name, 128, 92);
        g.fillStyle = "rgba(154,150,142,1)";
        g.font = `400 24px ${monoFamily}`;
        g.fillText(sub, 128, 130);
        g.fillStyle = "rgba(255,233,77,.9)";
        g.beginPath();
        g.arc(468, 100, 7, 0, Math.PI * 2);
        g.fill();
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        return t;
      };

      const roundedRect = (w: number, h: number, r: number) => {
        const s = new THREE.Shape();
        s.moveTo(-w / 2 + r, -h / 2);
        s.lineTo(w / 2 - r, -h / 2);
        s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0, false);
        s.lineTo(w / 2, h / 2 - r);
        s.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2, false);
        s.lineTo(-w / 2 + r, h / 2);
        s.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI, false);
        s.lineTo(-w / 2, -h / 2 + r);
        s.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5, false);
        return s;
      };

      const grid = new THREE.GridHelper(80, 80, 0x22221d, 0x151513);
      grid.position.y = -2.6;
      (grid.material as import("three").Material).transparent = true;
      (grid.material as import("three").Material).opacity = 0.5;
      scene.add(grid);

      narrow = host.getBoundingClientRect().width < 760;
      const count = narrow ? 10 : NODES.length;
      const cardGeo = new THREE.ExtrudeGeometry(roundedRect(1.7, 0.66, 0.12), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 10 });
      cardGeo.center();
      const cardMat = new THREE.MeshPhysicalMaterial({ color: 0x141412, metalness: 0, roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.2, transmission: narrow ? 0 : 0.3, thickness: 0.3, envMapIntensity: 1.0 });

      type Card = { group: import("three").Group; mesh: import("three").Mesh; back: import("three").Mesh; base: import("three").Vector3; ph: number; node: (typeof NODES)[number] };
      const cards: Card[] = [];
      const pickable: import("three").Mesh[] = [];
      let seed = 7;
      const rnd = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      for (let i = 0; i < count; i++) {
        const node = NODES[i % NODES.length];
        const group = new THREE.Group();
        const mesh = new THREE.Mesh(cardGeo, cardMat);
        mesh.userData.index = i;
        group.add(mesh);
        const lab = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.625), new THREE.MeshBasicMaterial({ map: labelTex(node.name, node.sub), transparent: true, toneMapped: false }));
        lab.position.z = 0.04;
        group.add(lab);
        const back = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.86), new THREE.MeshBasicMaterial({ map: glowTex, color: 0xffe94d, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
        back.position.z = -0.06;
        group.add(back);
        const zig = i % 2 ? 1 : -1;
        group.position.set(zig * (1.1 + rnd() * 1.3), -0.7 + rnd() * 1.9, -i * 1.9);
        group.rotation.y = zig * -0.35 + (rnd() - 0.5) * 0.2;
        group.rotation.x = (rnd() - 0.5) * 0.15;
        group.scale.setScalar(0.82);
        scene.add(group);
        cards.push({ group, mesh, back, base: group.position.clone(), ph: rnd() * 6, node });
        pickable.push(mesh);
      }

      const tubeMat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, color: { value: Y } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: "uniform float time; uniform vec3 color; varying vec2 vUv; void main(){ float p = fract(vUv.x * 2.0 - time * 0.45); float pulse = smoothstep(0.82, 1.0, p); gl_FragColor = vec4(color, 0.22 + pulse * 0.9); }",
      });
      const link = (a: Card, b: Card) => {
        const pa = a.group.position.clone().add(new THREE.Vector3(0.85, 0, 0).applyEuler(a.group.rotation));
        const pb = b.group.position.clone().add(new THREE.Vector3(-0.85, 0, 0).applyEuler(b.group.rotation));
        const curve = new THREE.CubicBezierCurve3(pa, pa.clone().add(new THREE.Vector3(1.2, 0, -0.4)), pb.clone().add(new THREE.Vector3(-1.2, 0, 0.4)), pb);
        scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.012, 6, false), tubeMat));
      };
      for (let j = 0; j < count - 1; j++) link(cards[j], cards[j + 1]);
      for (let k = 0; k < count - 3; k += 3) link(cards[k], cards[k + 3]);

      const lamp = new THREE.PointLight(0xfff0c0, 26, 14, 1.8);
      scene.add(lamp);
      scene.add(new THREE.HemisphereLight(0x2a2a2a, 0x000000, 0.45));

      const dust = (() => {
        const n = narrow ? 300 : 700;
        const g = new THREE.BufferGeometry();
        const p = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
          p[i * 3] = (rnd() - 0.5) * 14;
          p[i * 3 + 1] = -2 + rnd() * 8;
          p[i * 3 + 2] = (rnd() - 0.5) * 14;
        }
        g.setAttribute("position", new THREE.BufferAttribute(p, 3));
        return new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex, color: 0xffe94d, size: 0.05, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
      })();
      scene.add(dust);

      // pointer: parallax + hover
      const mouse = { x: 0, y: 0, tx: 0, ty: 0, inside: false };
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let hovered: Card | null = null;
      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        mouse.inside = true;
        ndc.set(mouse.tx, -mouse.ty);
      };
      const onLeave = () => {
        mouse.tx = 0;
        mouse.ty = 0;
        mouse.inside = false;
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);

      const resize = () => {
        const r = host.getBoundingClientRect();
        W = Math.max(1, r.width);
        H = Math.max(1, r.height);
        narrow = W < 760;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1 : 1.5));
        renderer.setSize(W, H, false);
        cam.aspect = W / H;
        cam.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();

      let visible = true;
      const io = new IntersectionObserver(
        (en) => {
          visible = en[0].isIntersecting;
        },
        { threshold: 0.02 },
      );
      io.observe(canvas);

      const t0 = performance.now() / 1000;
      let raf = 0;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const e = now / 1000 - t0;
        mouse.x += (mouse.tx - mouse.x) * 0.06;
        mouse.y += (mouse.ty - mouse.y) * 0.06;
        tubeMat.uniforms.time.value = reduce ? 0 : e;
        if (!reduce) for (const cd of cards) cd.group.position.y = cd.base.y + Math.sin(e * 0.6 + cd.ph) * 0.08;

        let z: number;
        if (mode === "hero") z = reduce ? 2.5 : 4.5 - ((e * 0.55) % 24);
        else z = 4.5 - Math.max(0, Math.min(1, progressRef?.current ?? 0)) * 26;

        const cx = (narrow ? 0 : -1.4) + mouse.x * 0.8;
        const cy = (narrow ? 1.9 : 0.5) + mouse.y * -0.4;
        cam.position.set(cx, cy, z);
        cam.lookAt(narrow ? 0 : 0.6, narrow ? -0.2 : 0.1, z - 6);
        lamp.position.set(cx, cy + 1.2, z - 1.5);
        dust.position.z = z - 8;

        if (mode === "system" && mouse.inside) {
          ray.setFromCamera(ndc, cam);
          const hit = ray.intersectObjects(pickable, false)[0];
          const next = hit ? cards[(hit.object as import("three").Mesh).userData.index as number] : null;
          if (next !== hovered) {
            if (hovered) {
              (hovered.back.material as import("three").MeshBasicMaterial).opacity = 0.16;
              hovered.group.scale.setScalar(0.82);
            }
            hovered = next;
            if (hovered) {
              (hovered.back.material as import("three").MeshBasicMaterial).opacity = 0.6;
              hovered.group.scale.setScalar(0.9);
            }
            hoverRef.current?.(hovered?.node.slug ?? null, hovered ? `${hovered.node.name} · ${hovered.node.sub}` : null);
          }
        }
        renderer.render(scene, cam);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        scene.traverse((o) => {
          const m = o as import("three").Mesh;
          if (m.geometry) m.geometry.dispose();
          const mat = m.material as import("three").Material | import("three").Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        });
        env.dispose();
        glowTex.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [mode, progressRef]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
