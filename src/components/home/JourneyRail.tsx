"use client";

import { useRef } from "react";
import Image from "next/image";
import type { Milestone, MilestoneBrand } from "@/lib/cms/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION } from "../animations/motion";

/** Scroll per step, in px. A brand dot under a year is half a step, so its sequence reads quickly. */
const STEP = {
  desktop: { ratio: 0.28, min: 210, max: 300 },
  mobile: { ratio: 0.3, min: 190, max: 260 },
};
/** A brand dot's share of a full step (a move from one year to the next). */
const BRAND_STEP = 0.5;

/**
 * Company milestones on one rail.
 *
 * With motion (any width): the section pins and vertical scrolling drives the rail sideways
 * (scrub), the line filling to the current year's dot. A year with several brands lists them
 * under the year as dots of their own (2021: itel Distribution → Infinix Accessories → Nokia
 * Distribution). The rail holds on that year for one short step per brand; each step
 * activates the next dot and reveals its logo and title beside it with a 200ms fade and slide
 * (globals.css), and scrolling back deactivates them in turn. Then the rail moves on.
 * The horizontal layout and the inactive dots only apply while that runs (data-journey-horizontal).
 * Reduced motion: the seven-column grid on desktop and the swipeable row below lg, with every
 * brand dot shown active.
 *
 * Each single-brand milestone's logos sit above its dot. The rail runs through the dots, so its
 * offset (top-[40px] / lg:top-[46px]) follows the logo row's height plus the gap below it.
 */
export function JourneyRail({ items }: { items: Milestone[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add({ desktop: "(min-width: 1024px)", motion: MOTION }, (ctx) => {
        const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
        if (!motion) return;
        const section = root.closest("section") ?? root;
        const track = q("[data-journey-track]")[0] as HTMLElement;
        const line = q("[data-rail-fill]")[0] as HTMLElement;
        const cards = q("[data-m]") as HTMLElement[];
        if (!cards.length) return;
        root.setAttribute("data-journey-horizontal", "");
        gsap.set(section, { overflowX: "clip" });

        const distance = () => Math.max(track.scrollWidth - root.clientWidth, 0);
        // The rail sweeps each card across the viewport in proportion to its place on the
        // track, so the first card is current at the left edge and the last at the right.
        const first = cards[0];
        const last = cards[cards.length - 1];
        const share = (card: HTMLElement) => {
          const span = last.offsetLeft - first.offsetLeft;
          return span > 0 ? (card.offsetLeft - first.offsetLeft) / span : 0;
        };
        // The fill ends at the card's dot (10px wide, at the card's left edge).
        const fillTo = (card: HTMLElement) => () => (track.scrollWidth ? (card.offsetLeft + 5) / track.scrollWidth : 0);

        // Brand dots of each multi-brand year, and the timeline time at which each turns on:
        // the middle of its short step, so something happens at an even rhythm.
        const groups: { dots: HTMLElement[]; at: number[]; on: number }[] = [];
        gsap.set(line, { scaleX: 0, transformOrigin: "0% 50%" });
        const tl = gsap.timeline({ defaults: { ease: "none" } });
        let time = 0;
        cards.forEach((card, i) => {
          if (i > 0) {
            tl.to(track, { x: () => -distance() * share(card), duration: 1 }, time).to(line, { scaleX: fillTo(card), duration: 1 }, time);
            time += 1;
          }
          const dots = Array.from(card.querySelectorAll<HTMLElement>("[data-brand-dot]"));
          if (dots.length) {
            groups.push({ dots, at: dots.map((_, k) => time + (k + 0.5) * BRAND_STEP), on: -1 });
            time += dots.length * BRAND_STEP;
          }
        });
        // Holds the rail for the last year's brand steps.
        tl.set({}, {}, Math.max(time, 1));

        const sync = () => {
          const now = tl.time();
          for (const g of groups) {
            const on = g.at.filter((t) => now >= t).length;
            if (on === g.on) continue;
            g.on = on;
            g.dots.forEach((dot, k) => {
              dot.toggleAttribute("data-on", k < on);
              dot.toggleAttribute("data-current", k === on - 1);
            });
          }
        };
        tl.eventCallback("onUpdate", sync);
        sync();

        const size = desktop ? STEP.desktop : STEP.mobile;
        const stepPx = () => gsap.utils.clamp(size.min, size.max, window.innerHeight * size.ratio);
        // Phones: a section shorter than the screen pins centred rather than under the header.
        const start = () => (!desktop && section.offsetHeight < window.innerHeight ? "center center" : "top top");
        const st = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start,
            end: () => `+=${Math.round(tl.duration() * stepPx())}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        st.add(tl);

        return () => {
          root.removeAttribute("data-journey-horizontal");
          for (const dot of groups.flatMap((g) => g.dots)) {
            dot.removeAttribute("data-on");
            dot.removeAttribute("data-current");
          }
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} data-journey-root="" className="relative">
      <div data-journey-track="" className="relative">
        {/* Track line through the markers, filled with scroll (shown on phones only while the rail is pinned). */}
        <span aria-hidden data-rail="" className="absolute top-[40px] right-0 left-0 hidden h-[2px] bg-line lg:top-[46px] lg:block" />
        <span aria-hidden data-rail-fill="" className="absolute top-[40px] right-0 left-0 hidden h-[2px] bg-accent lg:top-[46px] lg:block" />
        {/*
          Below lg (reduced motion) the milestones are a row to swipe through, so the section stays
          short on phones; the next card peeks in at the edge. Each card carries its own piece of
          the line (before:), so the track spans the whole scrolling row.
        */}
        <ol
          aria-label="Company milestones"
          className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-7 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((milestone) => {
            const brands = milestone.brands ?? [];
            const split = brands.length > 1;
            return (
              <li
                key={milestone.period + milestone.title}
                data-m=""
                className="relative w-[72%] max-w-[17rem] min-w-0 shrink-0 snap-start pt-16 before:absolute before:top-[40px] before:-right-5 before:left-0 before:h-[2px] before:bg-line last:before:right-0 sm:w-[40%] lg:w-auto lg:max-w-none lg:pt-[78px] lg:before:hidden"
              >
                {/* Logos 24px high (28px on desktop), then 12px (14px) to the dot. A multi-brand year shows its logos beside its brand dots instead. */}
                {!split && (
                  <div className="journey-logos absolute top-0 right-0 left-0 flex h-6 items-end gap-3 lg:h-7 lg:gap-3.5">
                    {brands.map((brand, k) => (
                      <BrandMark key={brand.name + k} brand={brand} className="h-full w-auto max-w-24 [object-position:left_bottom] lg:max-w-28" />
                    ))}
                  </div>
                )}
                <span aria-hidden className="absolute top-9 left-0 block size-[10px] rounded-full bg-accent ring-4 ring-white lg:top-[42px]" />
                <div className="group">
                  <p className="font-display text-lg leading-none font-semibold tracking-[-0.025em] text-ink tabular-nums transition-colors duration-200 group-hover:text-accent lg:text-[1.35rem] xl:text-[1.5rem]">
                    {milestone.period}
                  </p>
                  {split ? (
                    <>
                      <h3 className="sr-only">{milestone.title}</h3>
                      {/* One dot per brand, in order, each with its logo and title beside it. */}
                      <ul className="journey-brands mt-3 space-y-3">
                        {brands.map((brand, k) => (
                          <li key={brand.name + k} data-brand-dot="" className="relative flex gap-2.5">
                            <span aria-hidden className="journey-brand-dot relative z-[1] mt-[5px] size-[10px] shrink-0 rounded-full" />
                            <div className="journey-brand-label flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                              <BrandMark brand={brand} className="h-[18px] w-[5.25rem] [object-position:left_center]" />
                              <span className="text-sm leading-5 font-semibold text-ink lg:text-[0.875rem]">{brand.title?.trim() || brand.name}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-1.5 text-base leading-snug font-semibold text-ink lg:mt-3 lg:text-[0.9375rem]">{milestone.title}</h3>
                      <p className="mt-0.5 text-[0.9375rem] leading-relaxed text-muted lg:mt-1.5 lg:text-sm">{milestone.description}</p>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/** A brand's logo sized by the caller (a width cap above the dot, a fixed slot beside a brand dot so titles line up); its name when there is no logo. */
function BrandMark({ brand, className = "" }: { brand: MilestoneBrand; className?: string }) {
  if (brand.logo?.src) {
    return (
      <Image
        src={brand.logo.src}
        width={brand.logo.width}
        height={brand.logo.height}
        alt={brand.name}
        sizes="112px"
        className={`min-w-0 shrink-0 object-contain ${className}`}
      />
    );
  }
  return <span className="font-display text-sm leading-none font-semibold tracking-[-0.01em] whitespace-nowrap text-ink lg:text-[0.9375rem]">{brand.name}</span>;
}
