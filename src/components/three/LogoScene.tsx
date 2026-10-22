"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { gsap, hasFinePointer, prefersReducedMotion } from "@/lib/gsap";
import { hero } from "@/lib/motion";
import { MARK_HEIGHT, MARK_PATH, MARK_WIDTH } from "../home/siccotelMark";
import { FitCamera, SceneHealth, TickerLoop, type SceneProps } from "./SceneLoop";

const SIZE = 3.05;
const SCALE = SIZE / MARK_WIDTH;
/** Roughly a fifth of the mark's width: thick enough to read as a solid object. */
const DEPTH = 100;
const BEVEL = 4.5;
const ENTRANCE_SECONDS = 1.7;
const entranceEase = gsap.parseEase("power3.out");

/** Resting three-quarter pose: the face points at the visitor, the left wall stays visible. */
const REST = { x: 0.12, y: -0.46, z: -0.03 };
/** One controlled turn from a near-profile view, so the thickness is the first thing seen. */
const START = { x: 0.3, y: -1.9, z: -0.1 };
/** Pointer tilt limits (radians), desktop mice only. */
const TILT = { x: 0.12, y: 0.2 };

function useMarkGeometry(lowPower: boolean) {
  const geometry = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK_WIDTH} ${MARK_HEIGHT}"><path d="${MARK_PATH}"/></svg>`;
    const shapes = new SVGLoader().parse(svg).paths.flatMap((path) => path.toShapes());
    const extruded = new THREE.ExtrudeGeometry(shapes, {
      depth: DEPTH,
      curveSegments: lowPower ? 14 : 28,
      bevelEnabled: true,
      bevelThickness: 7,
      bevelSize: BEVEL,
      // Offsetting by -bevelSize keeps the widest outline exactly on the source
      // path, so the silhouette and its 485 × 471 proportions are unchanged.
      bevelOffset: -BEVEL,
      bevelSegments: lowPower ? 2 : 5,
    });
    extruded.scale(SCALE, SCALE, SCALE);
    // SVG y points down.
    extruded.rotateX(Math.PI);
    extruded.center();
    extruded.computeVertexNormals();
    extruded.computeBoundingSphere();
    return extruded;
  }, [lowPower]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function Mark({
  animate,
  lowPower,
  onSettled,
  shouldTickRef,
}: Pick<SceneProps, "animate" | "lowPower"> & {
  onSettled: () => void;
  shouldTickRef: React.MutableRefObject<boolean>;
}) {
  const group = useRef<THREE.Group>(null);
  // Negative progress is a short hold so the turn starts as the headline settles.
  const progress = useRef(animate ? -hero.visual / ENTRANCE_SECONDS : 1);
  const finished = useRef(!animate);
  const geometry = useMarkGeometry(lowPower);
  const target = useRef({ ...REST });
  const current = useRef(animate ? { ...START } : { ...REST });

  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const nx = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2));
      const ny = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2));
      target.current.x = REST.x + ny * TILT.x;
      target.current.y = REST.y + nx * TILT.y;
      target.current.z = REST.z - nx * 0.03;
      shouldTickRef.current = true;
    };
    const reset = () => {
      Object.assign(target.current, REST);
      shouldTickRef.current = true;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", reset);
    };
  }, [shouldTickRef]);

  useFrame((_, delta) => {
    const mark = group.current;
    if (!mark) return;
    const cur = current.current;
    const tgt = target.current;

    if (!finished.current) {
      progress.current = Math.min(1, progress.current + delta / ENTRANCE_SECONDS);
      const t = entranceEase(Math.max(0, progress.current));
      cur.x = THREE.MathUtils.lerp(START.x, tgt.x, t);
      cur.y = THREE.MathUtils.lerp(START.y, tgt.y, t);
      cur.z = THREE.MathUtils.lerp(START.z, tgt.z, t);
      mark.position.y = -(1 - t) * 0.22;
      mark.scale.setScalar(0.86 + t * 0.14);
      mark.rotation.set(cur.x, cur.y, cur.z);
      if (progress.current >= 1) {
        finished.current = true;
        onSettled();
      }
      return;
    }

    // Settled: damped pointer tilt only. Ticking stops once the pose is reached.
    cur.x = THREE.MathUtils.damp(cur.x, tgt.x, 4, delta);
    cur.y = THREE.MathUtils.damp(cur.y, tgt.y, 4, delta);
    cur.z = THREE.MathUtils.damp(cur.z, tgt.z, 4, delta);
    mark.rotation.set(cur.x, cur.y, cur.z);
    const remaining = Math.abs(cur.x - tgt.x) + Math.abs(cur.y - tgt.y) + Math.abs(cur.z - tgt.z);
    shouldTickRef.current = remaining > 0.0004;
  });

  return (
    <group ref={group} rotation={animate ? [START.x, START.y, START.z] : [REST.x, REST.y, REST.z]}>
      <mesh geometry={geometry} castShadow>
        {/* Face (and back): brand red with a soft lacquer. */}
        <meshPhysicalMaterial
          attach="material-0"
          color="#e8101f"
          roughness={0.32}
          metalness={0.05}
          clearcoat={0.55}
          clearcoatRoughness={0.22}
        />
        {/* Walls and bevel: a darker garnet that the key light grades across the depth. */}
        <meshStandardMaterial attach="material-1" color="#7c0710" roughness={0.42} metalness={0.2} />
      </mesh>
    </group>
  );
}

export default function LogoScene({ active, animate, lowPower, onReady, onError }: SceneProps) {
  const [settled, setSettled] = useState(!animate);
  const onSettled = useCallback(() => setSettled(true), []);
  const shouldTick = useRef(animate);

  return (
    <Canvas
      frameloop="never"
      dpr={[1, lowPower ? 1.25 : 1.75]}
      camera={{ fov: 28, position: [0, 0, 10] }}
      gl={{ antialias: !lowPower, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        // Neutral keeps the brand red's hue; ACES pushes bright reds toward salmon.
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1;
      }}
      aria-hidden
    >
      <TickerLoop active={active} animate={animate && !settled} shouldTick={shouldTick} onReady={onReady} />
      <SceneHealth onError={onError} />
      <FitCamera radius={1.66} center={[0, -0.06, 0]} margin={1.1} />

      {/* Studio set-up: warm key from upper left, low fill, cool rim behind for the bevel edge. */}
      <ambientLight intensity={0.28} />
      <directionalLight position={[-5, 4, 6]} intensity={2.6} color="#fff6f0" />
      <directionalLight position={[5, -2, 4]} intensity={0.55} color="#ffd9d2" />
      <directionalLight position={[3, 4, -5]} intensity={2.2} color="#e8eeff" />
      <directionalLight position={[-6, 0, -1]} intensity={0.9} color="#ffffff" />

      <Environment resolution={lowPower ? 64 : 128} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[-2.5, 3, 5]} scale={[7, 1.6, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[3, 0.5, 4]} rotation-z={-0.3} scale={[0.8, 6, 1]} />
        <Lightformer form="rect" intensity={0.7} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[5, 4, 1]} />
      </Environment>

      <Mark animate={animate} lowPower={lowPower} onSettled={onSettled} shouldTickRef={shouldTick} />
      <ContactShadows
        position={[0, -1.68, 0]}
        scale={5}
        far={2.6}
        blur={2.4}
        opacity={0.7}
        resolution={lowPower ? 128 : 256}
        frames={animate ? 120 : 1}
        color="#000000"
      />
    </Canvas>
  );
}
