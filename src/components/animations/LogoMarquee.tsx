"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION } from "./motion";

/** Pixels per second the logos travel. */
const SPEED = 45;

/**
 * An endless logo row. `children` is the list twice (the second copy aria-hidden);
 * the track moves by half its width and loops, so the seam never shows. The
 * marquee layout is CSS (globals.css, .marquee) under the same media conditions,
 * so it is in place from the first paint; without motion the plain grid remains.
 */
export function LogoMarquee({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      const track = root?.querySelector<HTMLElement>("[data-marquee-track]");
      if (!root || !track) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const loop = gsap.to(track, { xPercent: -50, ease: "none", repeat: -1, duration: Math.max(track.scrollWidth / 2 / SPEED, 12) });
        const slow = () => gsap.to(loop, { timeScale: 0.2, duration: 0.5, overwrite: true });
        const resume = () => gsap.to(loop, { timeScale: 1, duration: 0.5, overwrite: true });
        root.addEventListener("pointerenter", slow);
        root.addEventListener("pointerleave", resume);
        root.addEventListener("focusin", slow);
        root.addEventListener("focusout", resume);
        return () => {
          root.removeEventListener("pointerenter", slow);
          root.removeEventListener("pointerleave", resume);
          root.removeEventListener("focusin", slow);
          root.removeEventListener("focusout", resume);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="marquee" data-motion-scope="">
      <div data-marquee-track="" className="marquee-track">
        {children}
      </div>
    </div>
  );
}
