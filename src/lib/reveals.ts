"use client";

import { gsap, ScrollTrigger } from "./gsap";
import { dur, ease, revealStart, stagger } from "./motion";

/** A scoped entrance vocabulary shared by pages and independently mounted sections. */
export function setupReveals(root: HTMLElement) {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", (context) => {
    root.querySelectorAll<HTMLElement>("[data-anim]").forEach((el) => {
      // Nested client sections own their effects; one element has one animation owner.
      const owner = el.closest("[data-motion-scope]");
      if (owner && owner !== root) return;
      const kind = el.dataset.anim;
      const delay = Math.min(Math.max(Number(el.dataset.animDelay) || 0, 0), 180) / 1000;
      const reveal = () => context.add(() => {
        const common = { duration: dur.md, ease: ease.out, delay, clearProps: "opacity,visibility,transform,clipPath" };
        if (kind === "heading") {
          const words = el.querySelectorAll("[data-motion-word]");
          gsap.fromTo(words.length ? words : el, { opacity: 0.12, y: 18 }, {
            ...common, opacity: 1, y: 0, stagger: words.length ? { each: stagger.tight, amount: 0.22 } : 0,
          });
        } else if (kind === "image") {
          // A mask changes the frame, never the photograph's proportions or settled pose.
          gsap.fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { ...common, clipPath: "inset(0% 0% 0% 0%)" });
        } else if (kind === "stagger") {
          gsap.fromTo(el.children, { opacity: 0.15, y: 16 }, { ...common, duration: dur.sm, opacity: 1, y: 0, stagger: stagger.base });
        } else if (kind === "rule") {
          gsap.fromTo(el, { scaleX: 0, transformOrigin: "0% 50%" }, { ...common, scaleX: 1 });
        } else {
          gsap.fromTo(el, { opacity: 0.15, y: 14 }, { ...common, duration: dur.sm, opacity: 1, y: 0 });
        }
      });
      const top = el.getBoundingClientRect().top;
      // History-restored content stays readable; first-screen page intros may opt in.
      if (top < innerHeight * 0.94) {
        if (el.hasAttribute("data-anim-on-load") && scrollY < 32 && top >= 0) reveal();
        return;
      }
      // Do not pre-hide whole offscreen sections: if JS or a trigger fails, content remains visible.
      ScrollTrigger.create({ trigger: el, start: revealStart, once: true, onEnter: reveal });
    });
  }, root);
  return () => media.revert();
}
