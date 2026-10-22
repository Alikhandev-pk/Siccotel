"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { ease } from "@/lib/motion";
import { FitCamera, SceneHealth, TickerLoop, type SceneProps } from "./SceneLoop";

/*
 * Conceptual exploded smartphone assembly, built from lightweight procedural
 * geometry. It is an abstract technology visual — not a model of any real
 * Siccotel product, device or factory equipment.
 */

type Props = SceneProps;

const W = 1.56;
const H = 3.2;
const R = 0.24;
const entranceEase = gsap.parseEase(ease.out);

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function useSlab(w: number, h: number, r: number, depth: number, curveSegments: number, inset?: number) {
  const geometry = useMemo(() => {
    const shape = roundedRect(w, h, r);
    if (inset) {
      const hole = roundedRect(w - inset * 2, h - inset * 2, Math.max(r - inset, 0.04));
      shape.holes.push(new THREE.Path(hole.getPoints(curveSegments * 4)));
    }
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      curveSegments,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 2,
    });
    geo.translate(0, 0, -depth / 2);
    return geo;
  }, [w, h, r, depth, curveSegments, inset]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

/** Fixed three-quarter viewing angle. Set once on the group; nothing writes it per frame. */
const POSE: [number, number, number] = [-0.2, 0.62, 0.1];

/**
 * The assembly holds a fixed pose. The only motion is a one-time entrance in
 * which the layers separate from the assembled phone; it starts the first
 * time the scene is on screen and then stays put — scrolling, pointer
 * movement or scrolling back never move it again.
 */
function Assembly({
  animate,
  lowPower,
  onSettled,
}: Pick<Props, "animate" | "lowPower"> & { onSettled: () => void }) {
  const group = useRef<THREE.Group>(null);
  const spread = useRef(animate ? 0 : 1);
  const finished = useRef(!animate);
  const seg = lowPower ? 6 : 12;

  const back = useSlab(W, H, R, 0.05, seg);
  const frame = useSlab(W, H, R, 0.16, seg, 0.075);
  const plate = useSlab(W - 0.16, H - 0.16, R - 0.07, 0.02, seg);
  const display = useSlab(W - 0.04, H - 0.04, R - 0.02, 0.025, seg);
  const glass = useSlab(W, H, R, 0.03, seg);
  const board = useSlab(1.3, 1.02, 0.1, 0.03, seg);

  // Camera-facing first: back cover, internals, mid-frame, display, front glass.
  const assembled = [0.13, 0.06, 0, -0.06, -0.1];
  const exploded = [1.3, 0.62, -0.08, -0.78, -1.4];

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    // The shared ticker only advances visible scenes, so a hidden tab cannot
    // finish the entrance in the background. No tween or pointer owns this pose.
    spread.current = animate ? Math.min(1, spread.current + delta / 1.05) : 1;
    // Only the layers' z positions animate, and only during the entrance.
    g.children.forEach((layer, i) => {
      layer.position.z = THREE.MathUtils.lerp(assembled[i], exploded[i], entranceEase(spread.current));
    });
    if (spread.current === 1 && !finished.current) {
      finished.current = true;
      onSettled();
    }
  });

  return (
    <group ref={group} rotation={POSE}>
      {/* Back cover with camera module */}
      <group>
        <mesh geometry={back}>
          <meshStandardMaterial color="#697685" metalness={0.25} roughness={0.42} />
        </mesh>
        <RoundedBox args={[0.66, 0.66, 0.07]} radius={0.12} smoothness={lowPower ? 2 : 4} position={[-0.36, 1.1, 0.055]}>
          <meshStandardMaterial color="#26313d" metalness={0.25} roughness={0.24} />
        </RoundedBox>
        {[
          [-0.5, 1.24],
          [-0.22, 1.24],
          [-0.5, 0.96],
        ].map(([x, y], i) => (
          <group key={i} position={[x, y, 0.1]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.03, seg * 2]} />
              <meshStandardMaterial color="#050506" metalness={0.4} roughness={0.05} />
            </mesh>
            <mesh>
              <torusGeometry args={[0.105, 0.014, 8, seg * 2]} />
              <meshStandardMaterial color={i === 0 ? "#d0000c" : "#cfd2d6"} metalness={1} roughness={0.22} />
            </mesh>
          </group>
        ))}
        <mesh position={[-0.22, 0.96, 0.095]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color="#e9e4d8" emissive="#6b6352" emissiveIntensity={0.25} roughness={0.4} />
        </mesh>
      </group>

      {/* Internals: logic board, shields and battery */}
      <group>
        <mesh geometry={board} position={[0, 0.94, 0]}>
          <meshStandardMaterial color="#3d4b57" metalness={0.25} roughness={0.5} />
        </mesh>
        <RoundedBox args={[0.56, 0.36, 0.05]} radius={0.02} smoothness={2} position={[-0.26, 1.04, 0.03]}>
          <meshStandardMaterial color="#c6ced7" metalness={0.65} roughness={0.3} />
        </RoundedBox>
        <RoundedBox args={[0.34, 0.34, 0.05]} radius={0.02} smoothness={2} position={[0.33, 1.1, 0.03]}>
          <meshStandardMaterial color="#b6c0cc" metalness={0.6} roughness={0.34} />
        </RoundedBox>
        <RoundedBox args={[0.9, 0.16, 0.04]} radius={0.015} smoothness={2} position={[0.05, 0.66, 0.025]}>
          <meshStandardMaterial color="#0d0e10" metalness={0.3} roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[1.14, 1.6, 0.08]} radius={0.04} smoothness={2} position={[0, -0.6, 0]}>
          <meshStandardMaterial color="#687483" metalness={0.2} roughness={0.48} />
        </RoundedBox>
        <mesh position={[0, 0.17, 0.042]}>
          <boxGeometry args={[1.14, 0.035, 0.005]} />
          <meshStandardMaterial color="#d0000c" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>

      {/* Aluminium mid-frame */}
      <group>
        <mesh geometry={frame}>
          <meshStandardMaterial color="#dce2ea" metalness={0.65} roughness={0.26} />
        </mesh>
        <mesh geometry={plate}>
          <meshStandardMaterial color="#9ba7b5" metalness={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[W / 2 + 0.01, 0.75, 0]}>
          <boxGeometry args={[0.03, 0.42, 0.07]} />
          <meshStandardMaterial color="#dce2ea" metalness={0.65} roughness={0.26} />
        </mesh>
      </group>

      {/* Display panel */}
      <group>
        <mesh geometry={display}>
          <meshStandardMaterial color="#7b776e" metalness={0.3} roughness={0.42} />
        </mesh>
      </group>

      {/* Front cover glass */}
      <group>
        <mesh geometry={glass}>
          <meshStandardMaterial color="#273442" metalness={0.15} roughness={0.22} transparent opacity={0.94} />
        </mesh>
      </group>
    </group>
  );
}

export default function AssemblyScene({ active, animate, lowPower, onReady, onError }: Props) {
  // Frames are drawn only until the entrance has finished; after that the
  // canvas holds its last frame (it still redraws on resize).
  const [settled, setSettled] = useState(!animate);
  const onSettled = useCallback(() => setSettled(true), []);

  return (
    <Canvas
      frameloop="never"
      dpr={[1, lowPower ? 1.25 : 1.5]}
      camera={{ position: [0, 0, 9.4], fov: 30 }}
      gl={{ antialias: !lowPower, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden
    >
      <TickerLoop active={active} animate={animate && !settled} onReady={onReady} />
      <SceneHealth onError={onError} />
      {/* Bounding sphere of the fully separated stack; the pose never changes, so it never clips. */}
      <FitCamera radius={2.55} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#e4eeff", "#626974", 1.35]} />
      <directionalLight position={[-4, 5, 6]} intensity={3} />
      <directionalLight position={[2, 1, 6]} intensity={2.1} color="#e4edff" />
      <directionalLight position={[5, -1, -4]} intensity={1.8} color="#ffb5a6" />
      {/* Capture after the portal commits, then hold the small studio cube map. */}
      <Environment resolution={lowPower ? 64 : 128} frames={2}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[5, 1, 3]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" color="#ff2a2a" intensity={1.2} position={[3, -3, -4]} scale={2} />
      </Environment>
      <Assembly animate={animate} lowPower={lowPower} onSettled={onSettled} />
    </Canvas>
  );
}
