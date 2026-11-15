"use client";

import { useRef } from "react";
import type { Milestone } from "@/content/milestones";
import { gsap, useGSAP } from "@/lib/gsap";
import { DESKTOP_MOTION, onceInView } from "../animations/motion";

/**
 * Company milestones on one rail.
 *
 * Desktop with motion: the section pins and vertical scrolling drives the rail
 * sideways (scrub), the line filling as it goes; the horizontal layout is only
 * applied while that runs (data-journey-horizontal, globals.css).
 * Desktop without motion: the original seven-column grid.
 * Below lg: the swipeable row, whose cards rise in turn when it scrolls into view.
 */
export function JourneyRail({ items }: { items: Milestone[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(DESKTOP_MOTION, () => {
        const section = root.closest("section") ?? root;
        const track = q("[data-journey-track]")[0] as HTMLElement;
        const line = q("[data-rail-fill]")[0];
        root.setAttribute("data-journey-horizontal", "");
        gsap.set(section, { overflowX: "clip" });
        const distance = () => Math.max(track.scrollWidth - root.clientWidth, 0);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track, { x: () => -distance(), duration: 1 }, 0).fromTo(line, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 1 }, 0);

        return () => {
          root.removeAttribute("data-journey-horizontal");
        };
      });

      mm.add("(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = q("[data-m]");
        gsap.set(cards, { autoAlpha: 0, y: 28 });
        onceInView(root, () => {
          gsap.to(cards, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1, clearProps: "transform" });
        }, "top 85%");
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative">
      <div data-journey-track="" className="relative">
        {/* Desktop track: one line through the markers, filled with scroll. */}
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
              <span aria-hidden className="absolute top-0 left-0 block size-[10px] rounded-full bg-accent ring-4 ring-white" />
              <div className="group">
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
    </div>
  );
}
