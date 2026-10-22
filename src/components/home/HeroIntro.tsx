"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { dur, ease, hero, stagger } from "@/lib/motion";

/**
 * Coordinated hero entrance: eyebrow, headline lines, copy, CTAs, then the
 * photograph's frame.
 * Server content is visible by default. GSAP prepares the entrance during
 * hydration's layout phase, and owns only this hero's descendants.
 */
export function HeroIntro() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>("[data-hero-root]");
    if (!root) return;
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: ease.out } });
      tl.fromTo(q("[data-hero='eyebrow']"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: dur.md }, hero.eyebrow)
        .fromTo(q("[data-hero='line']"), { autoAlpha: 0.12, y: 24 }, { autoAlpha: 1, y: 0, duration: dur.md, stagger: hero.line2 - hero.line1 }, hero.line1)
        .fromTo(q("[data-hero='lead']"), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: dur.md }, hero.lead)
        .fromTo(q("[data-hero='cta']"), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: dur.md }, hero.ctas)
        .fromTo(q("[data-hero='trust']"), { autoAlpha: 0 }, { autoAlpha: 1, duration: dur.md }, hero.ctas + 0.15)
        .fromTo(q("[data-hero-photo]"), { autoAlpha: 0.2, y: 24, rotationX: 6, rotationY: -7, rotationZ: -1, transformPerspective: 1200 }, { autoAlpha: 1, y: 0, rotationX: 0, rotationY: 0, rotationZ: 0, duration: dur.lg, clearProps: "transform" }, hero.visual)
        .fromTo(q("[data-hero='stat']"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: dur.sm, stagger: stagger.base }, hero.ctas + 0.1);
      // Transforms are released once settled; opacity stays at its final inline value.
      tl.eventCallback("onComplete", () => gsap.set(q("[data-hero]"), { clearProps: "transform" }));
      return () => tl.kill();
    });

    return () => mm.revert();
  }, []);

  return null;
}
