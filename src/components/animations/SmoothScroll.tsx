"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";

/**
 * Lenis smooth scrolling for wheel and trackpad, driven by GSAP's ticker so
 * ScrollTrigger reads the same position Lenis paints. Touch keeps native
 * scrolling (Lenis' default), and reduced-motion visitors get no smoothing.
 */
export function SmoothScroll() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ autoRaf: false, lerp: 0.12 });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        setLenis(null);
        lenis.destroy();
      };
    });
    return () => mm.revert();
  });

  return null;
}
