"use client";

import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * Single registration point for GSAP plugins. Import gsap, its plugins and
 * useGSAP from here so every component shares one ticker and one set of
 * ScrollTrigger instances.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP);
  // Mobile URL-bar show/hide resizes the viewport constantly; don't refresh for it.
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  // Sections animate optional parts (a selected outline, breakpoint-hidden items); an empty set is expected.
  gsap.config({ nullTargetWarn: false });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, DrawSVGPlugin, ScrollTrigger, SplitText, useGSAP };
