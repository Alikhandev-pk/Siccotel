"use client";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Every effect runs only for visitors who have not asked for reduced motion. */
export const MOTION = "(prefers-reduced-motion: no-preference)";
/** Pinning, horizontal scroll and other layout-level effects: desktop widths only. */
export const DESKTOP_MOTION = `(min-width: 1024px) and ${MOTION}`;
/** Pointer effects (tilt, magnetic): desktop with a precise, hovering pointer. */
export const DESKTOP_POINTER = `${DESKTOP_MOTION} and (hover: hover) and (pointer: fine)`;

/**
 * Takes over elements that CSS hid before hydration (globals.css, [data-reveal]):
 * they stay hidden inline until their reveal plays, and the CSS failsafe stops.
 */
export function holdHidden(targets: gsap.TweenTarget) {
  gsap.set(targets, { autoAlpha: 0, animation: "none" });
}

/** Runs `play` once when `trigger` reaches `start`, or straight away when it is already past it. */
export function onceInView(trigger: Element, play: () => void, start = "top 80%") {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    play();
  };
  const st = ScrollTrigger.create({ trigger, start, once: true, onEnter: run });
  if (window.scrollY >= st.start) run();
  return st;
}

/** Visible elements only: items hidden by a breakpoint (display: none) are skipped. */
export const visible = (els: Element[]) => els.filter((el) => (el as HTMLElement).offsetParent !== null);
