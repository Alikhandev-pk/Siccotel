"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION, onceInView } from "./motion";

/** News cards: each image unmasks from the bottom, then its text fades up. Renders the list itself. */
export function NewsReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const q = gsap.utils.selector(root);
        const media = q("[data-news-media]");
        const text = q("[data-news-text]");
        gsap.set(root.children, { autoAlpha: 1, animation: "none" });
        gsap.set(media, { clipPath: "inset(100% 0% 0% 0% round 8px)" });
        gsap.set(text, { autoAlpha: 0, y: 24 });
        onceInView(root, () => {
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .to(media, { clipPath: "inset(0% 0% 0% 0% round 8px)", duration: 1, stagger: 0.12, clearProps: "clipPath" })
            .to(text, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, clearProps: "transform" }, 0.35);
        });
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
