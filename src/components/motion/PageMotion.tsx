"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ease } from "@/lib/motion";
import { setupReveals } from "@/lib/reveals";

/**
 * Optional, short reveals on server-rendered content. Headings never receive
 * a clip mask; copy stays in place; visible or restored content is left alone.
 * Each route and media-query owns its animations, listeners and triggers.
 */
export function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    let secondFrame = 0;
    let cancelIdle = () => {};
    let media: gsap.MatchMedia | undefined;
    let cleanupReveals = () => {};
    // The layout’s client island can hydrate before streamed page descendants, and
    // mutating markup React has not hydrated yet causes a hydration mismatch. Wait
    // two frames, then for an idle period: hydration keeps the main thread busy.
    const whenIdle = (fn: () => void) => {
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(fn, { timeout: 1500 });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(fn, 200);
        cancelIdle = () => window.clearTimeout(id);
      }
    };
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => whenIdle(() => {
        const root = document.querySelector("main");
        if (!root) return;
        const select = gsap.utils.selector(root);
        media = gsap.matchMedia();

        cleanupReveals = setupReveals(root as HTMLElement);

        // Keep touch layouts stable. Subtle media drift is confined to wide screens
        // with a mouse, inside each image's own clipped frame.
        media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
          select("[data-img-parallax]").forEach((frame: HTMLElement) => {
            const image = frame.querySelector("img");
            if (!image || image.classList.contains("object-contain")) return;
            const amount = Math.min(Number(frame.dataset.imgParallax) || 4, 4);
            gsap.set(image, { scale: 1.06 });
            gsap.fromTo(image, { yPercent: -amount / 2 }, {
              yPercent: amount / 2,
              ease: ease.scrub,
              scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
            });
          });

        });

        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      cancelIdle();
      cleanupReveals();
      media?.revert();
    };
  }, [pathname]);

  return null;
}
