"use client";

import { useRef } from "react";
import Image from "next/image";
import type { Milestone, MilestoneBrand } from "@/lib/cms/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { DESKTOP_MOTION, onceInView } from "../animations/motion";

/**
 * Company milestones on one rail.
 *
 * Desktop with motion: the section pins and vertical scrolling drives the rail
 * sideways (scrub) in equal scroll steps, the line filling to the current dot. A
 * milestone with several brands (2021: itel → Infinix Accessories → Nokia) holds the
 * rail still and spends one step per brand, showing that brand's logo and title alone
 * before the rail advances to the next year. Scrolling back reverses every step. The
 * horizontal layout and the one-brand-at-a-time stacking are only applied while that
 * runs (data-journey-horizontal, globals.css).
 * Desktop without motion: the original seven-column grid with every brand's logo.
 * Below lg: the swipeable row, whose cards rise in turn when it scrolls into view.
 *
 * Each milestone's brand logos sit above its dot. The rail runs through the dots, so its
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

      mm.add(DESKTOP_MOTION, () => {
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
        const railX = (card: HTMLElement) => () => -distance() * share(card);
        // The fill ends at the card's dot (10px wide, at the card's left edge).
        const fillTo = (card: HTMLElement) => () => (track.scrollWidth ? (card.offsetLeft + 5) / track.scrollWidth : 0);

        // Every step, a move to the next year or the next brand, gets the same scroll:
        // about 40% of the viewport height.
        const brandSteps = cards.map(groupSteps);
        const units = Math.max(cards.length - 1 + brandSteps.reduce((n, s) => n + Math.max(s.length - 1, 0), 0), 1);
        const stepPx = () => gsap.utils.clamp(280, 460, window.innerHeight * 0.4);

        gsap.set(line, { scaleX: 0, transformOrigin: "0% 50%" });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${Math.round(units * stepPx())}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        let at = 0;
        cards.forEach((card, i) => {
          // Advance to this year: one step.
          if (i > 0) {
            tl.to(track, { x: railX(card), duration: 1 }, at).to(line, { scaleX: fillTo(card), duration: 1 }, at);
            at += 1;
          }
          // Then one step per further brand, the rail and year held: the current brand's
          // logo and text fade out before the next brand's fade in.
          const steps = brandSteps[i];
          gsap.set(steps.slice(1).flat(), { autoAlpha: 0 });
          for (let k = 1; k < steps.length; k++) {
            tl.to(steps[k - 1], { autoAlpha: 0, y: -6, duration: 0.12, ease: "power1.in" }, at + 0.38).fromTo(
              steps[k],
              { autoAlpha: 0, y: 6 },
              { autoAlpha: 1, y: 0, duration: 0.12, ease: "power1.out", immediateRender: false },
              at + 0.5,
            );
            at += 1;
          }
        });
        // Keeps the last step full length when it is a brand fade (which ends mid-step).
        tl.set({}, {}, units);

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
    <div ref={rootRef} data-journey-root="" className="relative">
      <div data-journey-track="" className="relative">
        {/* Desktop track: one line through the markers, filled with scroll. */}
        <span aria-hidden className="absolute top-[46px] right-0 left-0 hidden h-[2px] bg-line lg:block" />
        <span aria-hidden data-rail-fill="" className="absolute top-[46px] right-0 left-0 hidden h-[2px] bg-accent lg:block" />
        {/*
          Below lg the milestones are a row to swipe through, so the section stays short
          on phones; the next card peeks in at the edge. Each card carries its own piece
          of the line (before:), so the track spans the whole scrolling row.
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
                {/* Logos 24px high (28px on desktop), then 12px (14px) to the dot. */}
                <div
                  data-split={split ? "" : undefined}
                  className="journey-logos absolute top-0 right-0 left-0 flex h-6 items-end gap-3 lg:h-7 lg:gap-3.5"
                >
                  {brands.map((brand, k) => (
                    <BrandMark key={brand.name + k} brand={brand} step={split ? k : undefined} />
                  ))}
                </div>
                <span aria-hidden className="absolute top-9 left-0 block size-[10px] rounded-full bg-accent ring-4 ring-white lg:top-[42px]" />
                <div className="group">
                  <p className="font-display text-lg leading-none font-semibold tracking-[-0.025em] text-ink tabular-nums transition-colors duration-200 group-hover:text-accent lg:text-[1.35rem] xl:text-[1.5rem]">
                    {milestone.period}
                  </p>
                  {/* The whole milestone; replaced by the brand steps while the rail is stepping. */}
                  <div data-journey-summary={split ? "" : undefined}>
                    <h3 className="mt-1.5 text-base leading-snug font-semibold text-ink lg:mt-3 lg:text-[0.9375rem]">{milestone.title}</h3>
                    <p className="mt-0.5 text-[0.9375rem] leading-relaxed text-muted lg:mt-1.5 lg:text-sm">{milestone.description}</p>
                  </div>
                  {/* One brand at a time, stacked in one cell so the card keeps the tallest step's height. */}
                  {split && (
                    <div data-journey-steps="">
                      {brands.map((brand, k) => {
                        const title = brand.title?.trim() || brand.name;
                        const description = brand.description?.trim();
                        return (
                          <div key={brand.name + k} data-brand-step={k}>
                            <h3 className="mt-3 text-[0.9375rem] leading-snug font-semibold text-ink">{title}</h3>
                            {description && <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>}
                          </div>
                        );
                      })}
                    </div>
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

/** A card's brand steps: each brand's logo and text, in order. Empty or one entry when it has a single brand. */
function groupSteps(card: HTMLElement): HTMLElement[][] {
  const steps: HTMLElement[][] = [];
  card.querySelectorAll<HTMLElement>("[data-brand-step]").forEach((el) => {
    const k = Number(el.dataset.brandStep);
    (steps[k] ??= []).push(el);
  });
  return steps.filter(Boolean);
}

/** A brand's logo at the row's height, kept within a width cap so wide wordmarks match compact marks; its name when there is no logo. */
function BrandMark({ brand, step }: { brand: MilestoneBrand; step?: number }) {
  if (brand.logo?.src) {
    return (
      <Image
        src={brand.logo.src}
        width={brand.logo.width}
        height={brand.logo.height}
        alt={brand.name}
        sizes="112px"
        data-brand-step={step}
        className="h-full w-auto max-w-24 min-w-0 shrink object-contain [object-position:left_bottom] lg:max-w-28"
      />
    );
  }
  return (
    <span data-brand-step={step} className="font-display text-sm leading-none font-semibold tracking-[-0.01em] whitespace-nowrap text-ink lg:text-[0.9375rem]">
      {brand.name}
    </span>
  );
}
