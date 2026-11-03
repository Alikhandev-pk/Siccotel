"use client";

import { useEffect, useRef } from "react";
import type { Milestone } from "@/content/milestones";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { dur, ease } from "@/lib/motion";

/**
 * A rail that draws with scroll (horizontal on desktop, vertical below lg).
 * Milestones are never hidden in advance: each one settles from a slightly faded
 * state as the line reaches it, once, so a skipped or failed trigger leaves it readable.
 * GSAP owns the line and the [data-m-body] and [data-m-marker] elements.
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
      const nodes = q("[data-m]") as HTMLElement[];
      const lastIndex = Math.max(nodes.length - 1, 1);
      const settled = new Set<number>();

      const settle = (index: number) => {
        settled.add(index);
        const node = nodes[index];
        context.add(() => {
          gsap.fromTo(node.querySelector("[data-m-marker]"), { scale: 0.4 }, { scale: 1, duration: dur.xs, ease: ease.soft, clearProps: "transform" });
          gsap.fromTo(node.querySelector("[data-m-body]"), { opacity: 0.25, y: 12 }, { opacity: 1, y: 0, duration: dur.sm, ease: ease.soft, clearProps: "opacity,transform" });
        });
      };
      const sync = (progress: number) => {
        // A small lead keeps text ahead of the line.
        nodes.forEach((_, i) => { if (!settled.has(i) && progress + 0.08 >= i / lastIndex) settle(i); });
      };

      const axis = desktop ? "scaleX" : "scaleY";
      gsap.set(line, { [axis]: 0, transformOrigin: desktop ? "0% 50%" : "50% 0%" });
      const trigger = ScrollTrigger.create({
        trigger: root,
        start: desktop ? "top 78%" : "top 75%",
        end: desktop ? "top 30%" : "bottom 65%",
        scrub: 0.4,
        onUpdate: (self) => {
          gsap.set(line, { [axis]: self.progress });
          sync(self.progress);
        },
      });
      // Content already passed on load (reload, history) is left in place.
      if (trigger.progress > 0) {
        gsap.set(line, { [axis]: trigger.progress });
        nodes.forEach((_, i) => { if (trigger.progress + 0.08 >= i / lastIndex) settled.add(i); });
      }
      return () => trigger.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {/* Track: vertical on small screens, horizontal through the markers on desktop. */}
      <span aria-hidden className="absolute top-1 bottom-1 left-[4px] w-[2px] bg-line lg:top-[4px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-[2px] lg:w-auto" />
      <span aria-hidden data-rail-fill="" className="absolute top-1 bottom-1 left-[4px] w-[2px] bg-accent lg:top-[4px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-[2px] lg:w-auto" />
      <ol className="relative grid gap-4 lg:grid-cols-7 lg:gap-6">
        {items.map((milestone) => (
          <li key={milestone.period + milestone.title} data-m="" className="relative min-w-0 pl-6 lg:pt-9 lg:pl-0">
            <span
              aria-hidden
              data-m-marker=""
              className="absolute top-1 left-0 block size-[10px] rounded-full bg-accent ring-4 ring-white lg:top-0"
            />
            <div data-m-body="" className="group">
              <p className="font-display text-lg leading-none font-semibold tracking-[-0.025em] text-ink tabular-nums transition-colors duration-200 group-hover:text-accent lg:text-[1.35rem] xl:text-[1.5rem]">
                {milestone.period}
              </p>
              <h3 className="mt-1.5 text-[0.9375rem] leading-snug font-semibold text-ink lg:mt-3">{milestone.title}</h3>
              <p className="mt-0.5 text-sm leading-relaxed text-muted lg:mt-1.5">{milestone.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
