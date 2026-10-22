"use client";

import { useEffect, useRef } from "react";
import type { Milestone } from "@/content/milestones";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { dur, ease } from "@/lib/motion";

/**
 * A rail that draws with scroll (horizontal on desktop, vertical below lg).
 * Each milestone reveals once, when the line reaches it, and stays revealed.
 * GSAP owns the line and the [data-m] wrappers; hover styling lives on inner elements.
 */
export function JourneyRail({ items }: { items: Milestone[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)" }, (context) => {
      const { motion, desktop } = context.conditions as { motion: boolean; desktop: boolean };
      if (!motion) return;
      const line = q("[data-rail-fill]")[0];
      const nodes = q("[data-m]");
      const count = nodes.length;

      const reveals = nodes.map((node: HTMLElement) =>
        gsap
          .timeline({ paused: true, defaults: { ease: ease.out } })
          .from(node.querySelector("[data-m-marker]"), { scale: 0, duration: dur.sm, ease: "back.out(2.2)" })
          .from(node.querySelector("[data-m-body]"), { autoAlpha: 0, y: desktop ? 22 : 16, duration: dur.md }, "-=0.35"),
      );
      reveals.forEach((tl) => tl.progress(0).pause());

      const axis = desktop ? "scaleX" : "scaleY";
      gsap.set(line, { [axis]: 0, transformOrigin: desktop ? "0% 50%" : "50% 0%" });
      const trigger = ScrollTrigger.create({
        trigger: root,
        start: desktop ? "top 78%" : "top 75%",
        end: desktop ? "top 30%" : "bottom 65%",
        scrub: 0.4,
        onUpdate: (self) => {
          gsap.set(line, { [axis]: self.progress });
          // Reveal each node once the line reaches it (a small lead keeps text ahead of the line).
          reveals.forEach((tl, i) => {
            if (!tl.isActive() && tl.progress() === 0 && self.progress + 0.08 >= i / Math.max(count - 1, 1)) tl.play();
          });
        },
      });
      // Content already passed on load (reload, history) is shown in full.
      if (trigger.progress > 0) {
        gsap.set(line, { [axis]: trigger.progress });
        reveals.forEach((tl, i) => trigger.progress + 0.08 >= i / Math.max(count - 1, 1) && tl.progress(1));
      }
      return () => {
        trigger.kill();
        reveals.forEach((tl) => tl.revert());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {/* Track: vertical on small screens, horizontal through the markers on desktop. */}
      <span aria-hidden className="absolute top-1 bottom-1 left-[4px] w-[2px] bg-line lg:top-[4px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-[2px] lg:w-auto" />
      <span aria-hidden data-rail-fill="" className="absolute top-1 bottom-1 left-[4px] w-[2px] bg-accent lg:top-[4px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-[2px] lg:w-auto" />
      <ol className="relative grid gap-9 lg:grid-cols-7 lg:gap-6">
        {items.map((milestone) => (
          <li key={milestone.period + milestone.title} data-m="" className="relative min-w-0 pl-8 lg:pt-9 lg:pl-0">
            <span
              aria-hidden
              data-m-marker=""
              className="absolute top-0 left-0 block size-[10px] rounded-full bg-accent ring-4 ring-white"
            />
            <div data-m-body="" className="group">
              <p className="font-display text-[1.6rem] leading-none font-semibold tracking-[-0.025em] text-ink tabular-nums transition-colors duration-300 group-hover:text-accent lg:text-[1.35rem] xl:text-[1.5rem]">
                {milestone.period}
              </p>
              <h3 className="mt-3 text-[0.9375rem] leading-snug font-semibold text-ink">{milestone.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{milestone.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
