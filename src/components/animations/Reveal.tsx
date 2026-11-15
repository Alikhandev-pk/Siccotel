"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { holdHidden, MOTION, onceInView, visible } from "./motion";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** "self" fades the wrapper; "children" fades its direct children in turn. */
  mode?: "self" | "children";
  /** Vertical travel in px. */
  y?: number;
  stagger?: number;
  start?: string;
  /** Desktop 3D tilt on `[data-tilt]` descendants (cards). */
  tilt?: boolean;
};

/**
 * Fade-up on scroll, once. CSS hides the targets before hydration only when
 * scripting and motion are available, with a failsafe that shows them anyway
 * (globals.css). `data-motion-scope` keeps the older page reveals out of this subtree.
 */
export function Reveal({ children, as: Tag = "div", className, mode = "self", y = 40, stagger = 0.1, start = "top 80%", tilt = false }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const all = mode === "children" ? Array.from(root.children) : [root];
        holdHidden(all);
        const shown = mode === "children" ? visible(all) : all;
        // Items hidden by a breakpoint are not animated, but must not stay hidden.
        gsap.set(all.filter((el) => !shown.includes(el)), { autoAlpha: 1 });
        onceInView(root, () => {
          gsap.fromTo(shown, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger, clearProps: "transform" });
        }, start);
      });
      if (tilt) mm.add(`${MOTION} and (min-width: 1024px) and (hover: hover) and (pointer: fine)`, () => setupTilt(root));
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} data-reveal={mode} data-motion-scope="">
      {children}
    </Tag>
  );
}

/** A gentle 3D tilt that follows the pointer and settles back on leave. */
function setupTilt(root: HTMLElement) {
  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-tilt]"));
  const cleanups = cards.map((card) => {
    gsap.set(card, { transformPerspective: 900 });
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const box = card.getBoundingClientRect();
      ry(((e.clientX - box.left) / box.width - 0.5) * 6);
      rx(-((e.clientY - box.top) / box.height - 0.5) * 6);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    };
  });
  return () => cleanups.forEach((fn) => fn());
}
