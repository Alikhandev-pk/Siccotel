"use client";

import { useRef } from "react";
import Image from "next/image";
import type { Milestone, MilestoneBrand } from "@/lib/cms/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION } from "../animations/motion";

/** Scroll per step, in px. A row under a year is half a step, so its sequence reads quickly. */
const STEP = {
  desktop: { ratio: 0.28, min: 210, max: 300 },
  mobile: { ratio: 0.3, min: 190, max: 260 },
};
/** A row's share of a full step (a move from one year to the next). */
const ROW_STEP = 0.5;
/** Easing of the rail between years: it eases out of one and settles on the next. */
const RAIL_EASE = "power2.inOut";

/**
 * Company milestones on one rail.
 *
 * One horizontal red line with each year's dot on it and the year directly below. Under the
 * year, every milestone lists its brands as rows: a red dot, the logo centred in a fixed slot
 * (so labels line up whatever the logo's shape), then the label, all vertically centred. A year with
 * one brand has one row labelled with the milestone's title; the first rows of all years sit
 * at the same height, and long labels wrap inside their row. Logos are never above the line.
 *
 * With motion (any width), everything below is scrubbed by scroll, so it plays smoothly at the
 * reader's pace and reverses exactly when scrolling back:
 *   - As the section arrives, the line draws in from the left and the years rise in.
 *   - The section then pins. The rail glides from year to year (easing into each), the red fill
 *     and its glowing head following it. Arriving at a year, its dot pops and its label turns
 *     from muted to ink.
 *   - The rail holds on each year for one short step per row: the row's dot pops, its logo fades
 *     in and its label slides in after it. The first year's first row is there from the start.
 * Only opacity, transform and colour change, so nothing shifts while it plays.
 * Reduced motion: the same columns in a row to scroll sideways, everything shown.
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
        const rail = q("[data-rail]")[0] as HTMLElement;
        const line = q("[data-rail-fill]")[0] as HTMLElement;
        const head = q("[data-rail-head]")[0] as HTMLElement;
        const cards = q("[data-m]") as HTMLElement[];
        if (!cards.length) return;
        root.setAttribute("data-journey-horizontal", "");
        gsap.set(section, { overflowX: "clip" });

        // Final colours come from the stylesheet; years ahead of the rail start from the theme's muted tones.
        const theme = getComputedStyle(document.documentElement);
        const yearDots = cards.map((c) => c.querySelector<HTMLElement>("[data-year-dot]")!);
        const years = cards.map((c) => c.querySelector<HTMLElement>("[data-year]")!);
        const accent = getComputedStyle(yearDots[0]).backgroundColor;
        const ink = getComputedStyle(years[0]).color;
        const mutedDot = theme.getPropertyValue("--color-line-strong").trim() || "#c9c4ba";
        const mutedYear = theme.getPropertyValue("--color-muted").trim() || "#8a8f98";

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

        gsap.set(line, { scaleX: fillTo(first), transformOrigin: "0% 50%" });
        gsap.set(head, { x: () => first.offsetLeft });
        gsap.set(yearDots.slice(1), { backgroundColor: mutedDot, scale: 0.7 });
        gsap.set(years.slice(1), { color: mutedYear });

        const tl = gsap.timeline({ defaults: { ease: "none" } });
        let time = 0;
        cards.forEach((card, i) => {
          if (i > 0) {
            tl.to(track, { x: () => -distance() * share(card), duration: 1, ease: RAIL_EASE }, time)
              .to(line, { scaleX: fillTo(card), duration: 1, ease: RAIL_EASE }, time)
              .to(head, { x: () => card.offsetLeft, duration: 1, ease: RAIL_EASE }, time)
              // Arrival: the dot pops to full size in red as the head reaches it; the year darkens.
              .to(yearDots[i], { backgroundColor: accent, scale: 1, duration: 0.3, ease: "back.out(3)" }, time + 0.72)
              .to(years[i], { color: ink, duration: 0.3, ease: "power1.out" }, time + 0.7);
            time += 1;
          }
          // The first year's first row is shown from the start, so the rail never opens empty.
          const rows = Array.from(card.querySelectorAll<HTMLElement>("[data-row]")).slice(i === 0 ? 1 : 0);
          rows.forEach((row, k) => {
            const at = time + k * ROW_STEP;
            const dot = row.querySelector("[data-row-dot]");
            const logo = row.querySelector("[data-row-logo]");
            const label = row.querySelector("[data-row-label]");
            tl.fromTo(dot, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.22, ease: "back.out(3)" }, at)
              .fromTo(logo, { autoAlpha: 0, x: -6, scale: 0.94 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.3, ease: "power2.out" }, at + 0.06)
              .fromTo(label, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out" }, at + 0.12);
          });
          time += rows.length * ROW_STEP;
        });
        // Holds the rail until the last year's rows have finished.
        tl.set({}, {}, Math.max(time, 1));

        const size = desktop ? STEP.desktop : STEP.mobile;
        const stepPx = () => gsap.utils.clamp(size.min, size.max, window.innerHeight * size.ratio);
        // Phones: a section shorter than the screen pins centred rather than under the header.
        const start = () => (!desktop && section.offsetHeight < window.innerHeight ? "center center" : "top top");
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start,
              end: () => `+=${Math.round(tl.duration() * stepPx())}`,
              pin: true,
              // A little lag smooths wheel steps without the rail feeling detached from the scroll.
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          })
          .add(tl);

        // Arrival, before the pin: the line draws in from the left and the years rise into place.
        const firstRow = first.querySelector<HTMLElement>("[data-row]");
        const intro = [...years, ...(firstRow ? [firstRow] : [])];
        gsap
          // Measured before the pin above (refreshPriority), since it starts earlier on the page.
          .timeline({ scrollTrigger: { trigger: section, start: "top 85%", end: desktop ? "top 20%" : "top 30%", scrub: 0.8, refreshPriority: 1 } })
          .fromTo(rail, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 1, ease: "power2.out" }, 0)
          .fromTo(yearDots, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.08 }, 0.15)
          .fromTo(intro, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 0.2);

        return () => root.removeAttribute("data-journey-horizontal");
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} data-journey-root="" className="relative">
      <div data-journey-track="" className="relative">
        {/* The red line through the year dots, filled with scroll while the rail is pinned. */}
        <span aria-hidden data-rail="" className="absolute top-1 right-0 left-0 hidden h-[2px] bg-line" />
        <span aria-hidden data-rail-fill="" className="absolute top-1 right-0 left-0 hidden h-[2px] bg-accent" />
        {/* The fill's leading point: a soft glow that rides the line onto each year's dot. */}
        <span aria-hidden data-rail-head="" className="absolute top-0 left-0 z-[2] hidden size-[10px] rounded-full bg-accent shadow-[0_0_0_4px_rgb(200_0_11/0.16),0_0_16px_3px_rgb(200_0_11/0.35)]" />
        {/*
          Without motion the years are a row to scroll sideways (the next one peeks in at the
          edge). Each column carries its own piece of the line (before:), so the line spans the
          whole scrolling row.
        */}
        <ol
          aria-label="Company milestones"
          className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:gap-8 sm:px-6 lg:mx-0 lg:gap-12 lg:px-0 lg:pb-4 lg:[scrollbar-width:thin] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((milestone) => {
            const brands = milestone.brands ?? [];
            const single = brands.length <= 1;
            // A year with no brands still gets one row, so its title lines up with the others.
            const rows = brands.length ? brands : [{ name: milestone.title, logo: null }];
            return (
              <li
                key={milestone.period + milestone.title}
                data-m=""
                className="relative w-[min(17rem,74vw)] shrink-0 snap-start pt-7 before:absolute before:top-1 before:-right-5 before:left-0 before:h-[2px] before:bg-accent last:before:right-0 sm:w-[18rem] sm:before:-right-8 lg:w-[19rem] lg:before:-right-12"
              >
                <span aria-hidden data-year-dot="" className="absolute top-0 left-0 z-[1] block size-[10px] rounded-full bg-accent ring-4 ring-white" />
                <p data-year="" className="font-display text-lg leading-6 font-semibold tracking-[-0.025em] whitespace-nowrap text-ink tabular-nums lg:text-[1.35rem] lg:leading-7 xl:text-[1.5rem] xl:leading-8">
                  {milestone.period}
                </p>
                {!single && <h3 className="sr-only">{milestone.title}</h3>}
                <p className="sr-only">{milestone.description}</p>
                <ul className="mt-5 space-y-4 lg:mt-6 lg:space-y-5">
                  {rows.map((brand, k) => {
                    const label = (("title" in brand && brand.title?.trim()) || (single ? milestone.title : brand.name)).trim();
                    const Label = single ? "h3" : "span";
                    return (
                      <li key={brand.name + k} data-row="" className="flex items-center gap-3">
                        <span aria-hidden data-row-dot="" className="size-2 shrink-0 rounded-full bg-accent" />
                        <span data-row-logo="" className="flex h-6 w-[5.25rem] shrink-0 items-center justify-center lg:h-7 lg:w-[6.5rem]">{brand.logo?.src && <BrandMark brand={brand as MilestoneBrand} />}</span>
                        <Label data-row-label="" className="min-w-0 flex-1 text-sm leading-5 font-medium text-ink lg:text-[0.9375rem]">{label}</Label>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/** A brand's logo in the row's fixed slot: its whole shape, scaled to fit and centred. */
function BrandMark({ brand }: { brand: MilestoneBrand }) {
  if (!brand.logo?.src) return null;
  return (
    <Image
      src={brand.logo.src}
      width={brand.logo.width}
      height={brand.logo.height}
      alt={brand.name}
      sizes="104px"
      className="h-full w-full object-contain"
    />
  );
}
