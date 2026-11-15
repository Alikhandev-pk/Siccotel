"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { holdHidden, MOTION, onceInView, visible } from "./motion";

/** A logo grid that scales in from its centre outwards, once. Renders the list itself. */
export function GridReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const items = Array.from(root.children);
        holdHidden(items);
        const shown = visible(items);
        // Logos collapsed on phones appear unanimated when "Show all" opens them.
        gsap.set(items.filter((el) => !shown.includes(el)), { autoAlpha: 1 });
        onceInView(root, () => {
          gsap.fromTo(shown, { autoAlpha: 0, scale: 0.8 }, {
            autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out",
            stagger: { each: 0.04, grid: "auto", from: "center" },
            clearProps: "transform",
          });
        }, "top 85%");
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <ul ref={ref} className={className} data-reveal="children" data-motion-scope="">
      {children}
    </ul>
  );
}
