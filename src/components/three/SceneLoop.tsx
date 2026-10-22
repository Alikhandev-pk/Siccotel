"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";

export type SceneSignals = {
  /** False while the scene is offscreen or the tab is hidden. */
  active: MutableRefObject<boolean>;
};

export type SceneProps = SceneSignals & {
  animate: boolean;
  lowPower: boolean;
  onReady: () => void;
  onError: () => void;
};

/** Restore the static artwork if a browser or GPU discards the WebGL context. */
export function SceneHealth({ onError }: { onError: () => void }) {
  const canvas = useThree((s) => s.gl.domElement);
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [canvas, onError]);
  return null;
}

/**
 * Drives R3F from the shared GSAP ticker (the same loop that drives Lenis and
 * ScrollTrigger) instead of a second requestAnimationFrame loop. A few warm-up
 * frames are always drawn so static poses and environment maps render; after
 * that, frames are only drawn while the scene is active and animated.
 */
export function TickerLoop({
  active,
  animate,
  onReady,
  shouldTick,
}: {
  active: MutableRefObject<boolean>;
  animate: boolean;
  onReady: () => void;
  shouldTick?: MutableRefObject<boolean>;
}) {
  const advance = useThree((s) => s.advance);
  const size = useThree((s) => s.size);
  const pending = useRef(8);
  const readySent = useRef(false);
  const elapsed = useRef(0);

  // Redraw after a resize even when the scene is static (reduced motion).
  useEffect(() => {
    pending.current = Math.max(pending.current, 4);
  }, [size.width, size.height, animate]);

  useEffect(() => {
    let previous: number | null = null;
    const tick = (time: number) => {
      // A scene loaded near the viewport must not draw while it is offscreen.
      // Use a local visible-time clock so returning to the tab cannot jump an entrance.
      if (!active.current || document.visibilityState !== "visible") {
        previous = null;
        return;
      }
      const delta = previous === null ? 1 / 60 : Math.min(Math.max(time - previous, 0), 0.05);
      previous = time;
      const isAnimated = animate || (shouldTick ? shouldTick.current : false);
      if (!isAnimated && pending.current === 0) return;
      elapsed.current += delta;
      // R3F's manual frameloop consumes seconds, like GSAP's ticker. Passing
      // milliseconds here makes useFrame deltas and clock motion 1000× too fast.
      advance(elapsed.current);
      if (pending.current > 0) {
        pending.current--;
        if (pending.current === 0 && !readySent.current) {
          readySent.current = true;
          onReady();
        }
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance, active, animate, onReady, shouldTick]);
  return null;
}

/**
 * Places a perspective camera so a bounding sphere of `radius` (centred at
 * `center`) fits the canvas in both directions, whatever its aspect ratio.
 * Because it fits a sphere, the subject stays fully visible while it rotates.
 */
export function FitCamera({ radius, center = [0, 0, 0], margin = 1.12 }: { radius: number; center?: [number, number, number]; margin?: number }) {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const [cx, cy, cz] = center;
  useLayoutEffect(() => {
    const { camera: cam, invalidate } = get();
    const camera = cam as THREE.PerspectiveCamera;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (size.width / Math.max(size.height, 1)));
    const fov = Math.min(vFov, hFov);
    const dist = (radius * margin) / Math.sin(fov / 2);
    camera.position.set(cx, cy, cz + dist);
    camera.near = Math.max(0.01, dist - radius * 4);
    camera.far = dist + radius * 4;
    camera.lookAt(cx, cy, cz);
    camera.updateProjectionMatrix();
    invalidate();
  }, [get, size.width, size.height, radius, margin, cx, cy, cz]);
  return null;
}
