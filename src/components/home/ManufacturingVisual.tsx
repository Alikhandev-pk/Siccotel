"use client";

import { SceneMount } from "../three/SceneMount";

/**
 * Conceptual exploded smartphone assembly for the manufacturing section. It is
 * labelled as an illustration: it is not a Siccotel product, nor a picture of
 * the plant or its equipment. Loads only when scrolled near, plays a
 * one-time entrance, then holds still: no scroll or pointer tracking.
 */
export function ManufacturingVisual() {
  return (
    <figure>
      <SceneMount
        scene="assembly"
        load="near"
        className="relative mx-auto aspect-square w-full max-w-[28rem] overflow-clip"
        fallback={<StaticAssembly />}
      />
      <figcaption className="mt-2 text-center text-[0.6875rem] tracking-[0.14em] text-night-muted uppercase">
        Conceptual illustration of a device assembly
      </figcaption>
    </figure>
  );
}

/** Crisp SVG stand-in: five layers of a device, offset in isometric depth. */
function StaticAssembly() {
  const layers = [
    { fill: "#0b0c0e", stroke: "#3a3d42" },
    { fill: "#2a2722", stroke: "#4a453d" },
    { fill: "none", stroke: "#c9ccd1", wide: true },
    { fill: "#1b1d21", stroke: "#3a3d42", board: true },
    { fill: "#2a2d32", stroke: "#5b6066", camera: true },
  ];
  return (
    <svg viewBox="0 0 600 600" className="h-full w-full">
      {layers.map((l, i) => (
        <g key={i} transform={`translate(${150 + i * 62} ${150 - i * 26}) skewY(-14)`}>
          <rect width="150" height="300" rx="24" fill={l.fill} stroke={l.stroke} strokeWidth={l.wide ? 9 : 1.5} />
          {l.board && (
            <>
              <rect x="18" y="20" width="114" height="92" rx="8" fill="#0f1012" />
              <rect x="28" y="30" width="56" height="34" rx="3" fill="#b9bdc3" />
              <rect x="92" y="30" width="30" height="34" rx="3" fill="#8e939a" />
              <rect x="22" y="130" width="106" height="150" rx="6" fill="#383b40" />
              <rect x="22" y="130" width="106" height="4" fill="#d0000c" />
            </>
          )}
          {l.camera && (
            <>
              <rect x="14" y="14" width="64" height="64" rx="14" fill="#121315" />
              <circle cx="32" cy="32" r="10" fill="#050506" stroke="#d0000c" strokeWidth="2.5" />
              <circle cx="60" cy="32" r="10" fill="#050506" stroke="#cfd2d6" strokeWidth="2.5" />
              <circle cx="32" cy="60" r="10" fill="#050506" stroke="#cfd2d6" strokeWidth="2.5" />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
