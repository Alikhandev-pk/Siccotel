"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { dur, ease } from "@/lib/motion";
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

        // Keep touch layouts stable. Subtle media drift and card perspective are
        // confined to wide screens with a mouse, and never affect text transforms.
        media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
          const cleanups: (() => void)[] = [];

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

          select("[data-tilt]").forEach((el: HTMLElement) => {
            // A dedicated inner wrapper may opt in when its outer wrapper reveals.
            const target = el.querySelector<HTMLElement>("[data-tilt-inner]") ?? el;
            if (target.hasAttribute("data-anim")) return;
            gsap.set(target, { transformPerspective: 1100 });
            const rotateX = gsap.quickTo(target, "rotationX", { duration: dur.xs, ease: ease.soft });
            const rotateY = gsap.quickTo(target, "rotationY", { duration: dur.xs, ease: ease.soft });
            const leave = () => { rotateX(0); rotateY(0); };
            const move = (event: PointerEvent) => {
              if (event.pointerType !== "mouse") return;
              const rect = el.getBoundingClientRect();
              rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 3);
              rotateX(-((event.clientY - rect.top) / rect.height - 0.5) * 2);
            };
            el.addEventListener("pointermove", move);
            el.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              el.removeEventListener("pointermove", move);
              el.removeEventListener("pointerleave", leave);
              rotateX.tween.kill();
              rotateY.tween.kill();
            });
          });
          return () => cleanups.forEach((cleanup) => cleanup());
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
