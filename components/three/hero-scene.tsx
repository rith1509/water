"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  MeshReflectorMaterial,
  MeshTransmissionMaterial,
  RoundedBox,
} from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

export type Block = { code: string; label: string; href: string; glow: string; shape: "ico" | "drop" | "house" | "pipe" | "oct" };

/* ---------------- the frozen thing inside each block ---------------- */

function Core({ shape, glow, hot }: { shape: Block["shape"]; glow: string; hot: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * (hot ? 1.6 : 0.35);
    ref.current.rotation.x += dt * (hot ? 0.6 : 0.12);
    const s = THREE.MathUtils.damp(ref.current.scale.x, hot ? 1.15 : 1, 6, dt);
    ref.current.scale.setScalar(s);
  });
  const mat = <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={hot ? 2.6 : 1.3} toneMapped={false} />;
  switch (shape) {
    case "ico":
      return <mesh ref={ref}><icosahedronGeometry args={[0.34, 0]} />{mat}</mesh>;
    case "drop":
      return <mesh ref={ref} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.28, 0.62, 24, 1]} />{mat}</mesh>;
    case "house":
      return <mesh ref={ref}><boxGeometry args={[0.42, 0.42, 0.42]} />{mat}</mesh>;
    case "pipe":
      return <mesh ref={ref}><torusGeometry args={[0.28, 0.085, 16, 48]} />{mat}</mesh>;
    case "oct":
      return <mesh ref={ref}><octahedronGeometry args={[0.36, 0]} />{mat}</mesh>;
  }
}

/* ---------------- one block of ice ---------------- */

function IceBlock({
  block,
  position,
  index,
  hot,
  onHover,
  onOpen,
}: {
  block: Block;
  position: [number, number, number];
  index: number;
  hot: boolean;
  onHover: (i: number | null) => void;
  onOpen: (href: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const seed = useMemo(() => index * 1.37, [index]);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, hot ? Math.sin(t * 0.8) * 0.25 + 0.4 : Math.sin(t * 0.3 + seed) * 0.35, 4, dt);
    const s = THREE.MathUtils.damp(g.scale.x, hot ? 1.1 : 1, 6, dt);
    g.scale.setScalar(s);
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6} floatingRange={[-0.08, 0.12]}>
      <group
        ref={group}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(index);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOpen(block.href);
        }}
      >
        <RoundedBox args={[1.08, 1.36, 1.08]} radius={0.12} smoothness={5}>
          <MeshTransmissionMaterial
            transmissionSampler
            samples={8}
            thickness={1.1}
            roughness={0.12}
            ior={1.31}
            chromaticAberration={0.08}
            anisotropy={0.25}
            distortion={0.35}
            distortionScale={0.4}
            temporalDistortion={0.08}
            color="#eaf9ff"
            attenuationColor="#bfeaf8"
            attenuationDistance={3.5}
            backside
            backsideThickness={0.4}
          />
        </RoundedBox>
        <Core shape={block.shape} glow={block.glow} hot={hot} />
        <pointLight color={block.glow} intensity={hot ? 6 : 2} distance={3} />
      </group>
    </Float>
  );
}

/* ---------------- rain ---------------- */

function Rain({ count = 1400 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const drops = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 22,
        y: Math.random() * 12 - 2,
        z: (Math.random() - 0.5) * 12 - 1,
        v: 7 + Math.random() * 6,
      })),
    [count]
  );
  const m = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    if (!mesh.current) return;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y -= d.v * Math.min(dt, 0.05);
      d.x -= 0.6 * Math.min(dt, 0.05);
      if (d.y < -2.2) {
        d.y = 9 + Math.random() * 3;
        d.x = (Math.random() - 0.5) * 22;
      }
      m.position.set(d.x, d.y, d.z);
      m.rotation.z = 0.06;
      m.updateMatrix();
      mesh.current.setMatrixAt(i, m.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.006, 0.32, 0.006]} />
      <meshBasicMaterial color="#a9e4f5" transparent opacity={0.32} depthWrite={false} />
    </instancedMesh>
  );
}

/* ---------------- what the ice refracts ---------------- */

function Backdrop() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = "#04070b";
    g.fillRect(0, 0, 1024, 512);
    const glow = (x: number, y: number, r: number, col: string) => {
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, col);
      grd.addColorStop(1, "rgba(4,7,11,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 1024, 512);
    };
    glow(700, 170, 420, "rgba(60,150,190,0.55)");
    glow(260, 260, 300, "rgba(30,80,120,0.5)");
    glow(520, 420, 260, "rgba(140,220,242,0.25)");
    // faint vertical light shafts
    for (let i = 0; i < 14; i++) {
      const x = 40 + i * 72 + (i % 3) * 9;
      const lg = g.createLinearGradient(0, 0, 0, 512);
      lg.addColorStop(0, "rgba(190,235,250,0.0)");
      lg.addColorStop(0.5, `rgba(190,235,250,${0.05 + (i % 4) * 0.025})`);
      lg.addColorStop(1, "rgba(190,235,250,0.0)");
      g.fillStyle = lg;
      g.fillRect(x, 0, 2 + (i % 3), 512);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, 1.2, -6]}>
      <planeGeometry args={[26, 13]} />
      <meshBasicMaterial map={tex} toneMapped={false} fog={false} />
    </mesh>
  );
}

/* ---------------- camera follows the pointer ---------------- */

function Rig() {
  const { camera, pointer } = useThree();
  useFrame((_, dt) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.8, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.6 + pointer.y * 0.35, 2.5, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ---------------- layout ---------------- */

function Blocks({
  blocks,
  hovered,
  onHover,
  onOpen,
}: {
  blocks: Block[];
  hovered: number | null;
  onHover: (i: number | null) => void;
  onOpen: (href: string) => void;
}) {
  const { viewport, size } = useThree();
  const portrait = size.width / size.height < 0.9;
  const positions: [number, number, number][] = portrait
    ? [
        [-1.9, 0.85, 0],
        [0, 0.95, -0.5],
        [1.9, 0.85, 0],
        [-0.95, -0.75, 0.2],
        [0.95, -0.75, 0.2],
      ]
    : blocks.map((_, i) => {
        const span = Math.min(viewport.width * 0.66, 8);
        const x = -span / 2 + (span / (blocks.length - 1)) * i + Math.min(viewport.width * 0.03, 0.3);
        const y = [0.05, -0.2, 0.12, -0.15, 0.04][i];
        const z = [0, -0.8, 0.3, -0.6, 0][i];
        return [x, y, z];
      });

  return (
    <group position={portrait ? [0, 0.48, 0] : [0, -0.5, 0]} scale={portrait ? 0.5 : 1}>
      {blocks.map((b, i) => (
        <IceBlock key={b.code} block={b} index={i} position={positions[i]} hot={hovered === i} onHover={onHover} onOpen={onOpen} />
      ))}
    </group>
  );
}

export default function HeroScene({
  blocks,
  hovered,
  onHover,
  onOpen,
}: {
  blocks: Block[];
  hovered: number | null;
  onHover: (i: number | null) => void;
  onOpen: (href: string) => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.6, 9], fov: 35 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onPointerMissed={() => onHover(null)}
    >
      <color attach="background" args={["#04070b"]} />
      <fog attach="fog" args={["#04070b", 9, 18]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 6, 4]} intensity={1.2} color="#cdefff" />

      <Suspense fallback={null}>
        <Backdrop />
        <Blocks blocks={blocks} hovered={hovered} onHover={onHover} onOpen={onOpen} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
          <planeGeometry args={[40, 40]} />
          <MeshReflectorMaterial
            resolution={512}
            mirror={0.55}
            blur={[320, 90]}
            mixBlur={1.4}
            mixStrength={2.2}
            depthScale={1}
            minDepthThreshold={0.6}
            color="#060c12"
            metalness={0.6}
            roughness={0.85}
          />
        </mesh>

        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.2} color="#bfeaff" position={[0, 5, -6]} scale={[12, 3, 1]} />
          <Lightformer intensity={1.2} color="#5cc7e0" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
          <Lightformer intensity={1.0} color="#e8f8ff" position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
          <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[0, 3, 6]} scale={3} />
        </Environment>
      </Suspense>

      <Rain />
      <Rig />
    </Canvas>
  );
}
