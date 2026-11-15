"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION } from "./motion";

/**
 * The service-delivery chain: as it scrolls through the viewport, each step's
 * accent line fills and the step brightens, one after another (scrubbed).
 * Renders the ordered list itself; steps carry [data-step] and [data-step-bar].
 */
export function ChainProgress({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const steps = gsap.utils.toArray<HTMLElement>("[data-step]", root);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root, start: "top 85%", end: "bottom 45%", scrub: 0.6 },
        });
        steps.forEach((step, i) => {
          const bar = step.querySelector("[data-step-bar]");
          tl.fromTo(step.querySelectorAll("[data-step-text]"), { opacity: 0.35 }, { opacity: 1, duration: 0.6 }, i)
            .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1 }, i);
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <ol ref={ref} className={className} data-motion-scope="">
      {children}
    </ol>
  );
}
