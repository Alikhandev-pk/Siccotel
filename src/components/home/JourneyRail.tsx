"use client";

import { useEffect, useRef } from "react";
import type { Milestone } from "@/content/milestones";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { dur, ease } from "@/lib/motion";

/**
 * A rail that draws with scroll on desktop. Below lg the milestones are a swipeable row
 * with a static line, so nothing depends on scroll position there.
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
      if (!motion || !desktop) return;
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

      const axis = "scaleX";
      gsap.set(line, { [axis]: 0, transformOrigin: "0% 50%" });
      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top 78%",
        end: "top 30%",
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
      {/* Desktop track: one line through the markers, drawn with scroll. */}
      <span aria-hidden className="absolute top-[4px] right-0 left-0 hidden h-[2px] bg-line lg:block" />
      <span aria-hidden data-rail-fill="" className="absolute top-[4px] right-0 left-0 hidden h-[2px] bg-accent lg:block" />
      {/*
        Below lg the milestones are a row to swipe through, so the section stays short
        on phones; the next card peeks in at the edge. Each card carries its own piece
        of the line (before:), so the track spans the whole scrolling row.
      */}
      <ol
        aria-label="Company milestones"
        className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-7 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((milestone) => (
          <li
            key={milestone.period + milestone.title}
            data-m=""
            className="relative w-[72%] max-w-[17rem] min-w-0 shrink-0 snap-start pt-7 before:absolute before:top-[4px] before:-right-5 before:left-0 before:h-[2px] before:bg-line last:before:right-0 sm:w-[40%] lg:w-auto lg:max-w-none lg:pt-9 lg:before:hidden"
          >
            <span
              aria-hidden
              data-m-marker=""
              className="absolute top-0 left-0 block size-[10px] rounded-full bg-accent ring-4 ring-white"
            />
            <div data-m-body="" className="group">
              <p className="font-display text-lg leading-none font-semibold tracking-[-0.025em] text-ink tabular-nums transition-colors duration-200 group-hover:text-accent lg:text-[1.35rem] xl:text-[1.5rem]">
                {milestone.period}
              </p>
              <h3 className="mt-1.5 text-base leading-snug font-semibold text-ink lg:mt-3 lg:text-[0.9375rem]">{milestone.title}</h3>
              <p className="mt-0.5 text-[0.9375rem] leading-relaxed text-muted lg:mt-1.5 lg:text-sm">{milestone.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
