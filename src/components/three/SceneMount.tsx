"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import type { SceneProps } from "./SceneLoop";

// The SVG fallback is server-rendered; Three.js is loaded in a separate client chunk.
const scenes = {
  logo: dynamic<SceneProps>(() => import("./LogoScene"), { ssr: false }),
  assembly: dynamic<SceneProps>(() => import("./AssemblyScene"), { ssr: false }),
};

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    // Current Three.js requires WebGL 2. Avoid loading a scene into a WebGL 1-only browser.
    const gl = canvas.getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

function isLowPower() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || window.matchMedia("(max-width: 767px)").matches;
}

/** A sized, decorative scene with a permanent static fallback and no input/scroll tracking. */
export function SceneMount({
  scene,
  fallback,
  load = "idle",
  className = "",
  children,
}: {
  scene: keyof typeof scenes;
  fallback: ReactNode;
  load?: "idle" | "near";
  /** Supplies the box's layout size. The canvas never contributes to document flow. */
  className?: string;
  children?: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const [config, setConfig] = useState<{ animate: boolean; lowPower: boolean } | null>(null);
  const [ready, setReady] = useState(false);

  // Visibility is measured on the visual itself, including on reload halfway down a page.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let onScreen = false;
    const sync = () => {
      active.current = onScreen && document.visibilityState === "visible";
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      active.current = false;
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    const el = root.current;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (!el || nav.connection?.saveData) return;
    const start = () => {
      if (webglAvailable()) setConfig({ animate: !prefersReducedMotion(), lowPower: isLowPower() });
    };

    if (load === "near") {
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        start();
      }, { rootMargin: "300px 0px" });
      io.observe(el);
      return () => io.disconnect();
    }
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 400);
    return () => window.clearTimeout(id);
  }, [load]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setConfig((current) => current && { ...current, animate: !mq.matches });
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => {
    setReady(false);
    setConfig(null);
  }, []);
  const Scene = scenes[scene];

  return (
    <div ref={root} aria-hidden="true" className={`pointer-events-none ${className}`}>
      <div className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${ready ? "opacity-0" : "opacity-100"}`}>
        {fallback}
      </div>
      {config && (
        <SceneBoundary onError={onError}>
          <div className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${ready ? "opacity-100" : "opacity-0"}`}>
            <Scene {...config} active={active} onReady={onReady} onError={onError} />
          </div>
        </SceneBoundary>
      )}
      {children}
    </div>
  );
}
