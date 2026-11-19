"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Milestone, MilestoneBrand } from "@/lib/cms/types";

export function JourneyRail({ items }: { items: Milestone[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [colWidth, setColWidth] = useState<number | null>(null);
  const [gapWidth, setGapWidth] = useState(24);

  // Calculate the exact complete column widths based on container width
  const updateMetrics = useCallback(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const availableWidth = root.clientWidth;
    if (!availableWidth) return;

    // Determine number of complete columns to show:
    // < 640px (Mobile): 1 complete column
    // 640px - 1023px (Tablet): 2 complete columns
    // >= 1024px (Desktop): 3 complete columns
    let cols = 1;
    let gap = 20;

    if (availableWidth >= 1024) {
      cols = 3;
      gap = 36;
    } else if (availableWidth >= 640) {
      cols = 2;
      gap = 28;
    } else {
      cols = 1;
      gap = 20;
    }

    // Exact card width so `cols` complete columns fit edge-to-edge
    const calculatedWidth = Math.floor((availableWidth - (cols - 1) * gap) / cols);
    setColWidth(calculatedWidth);
    setGapWidth(gap);

    // Update scroll indicators
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanScrollPrev(scrollLeft > 4);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Start at the first milestone on initial load
    track.scrollTo({ left: 0 });
    updateMetrics();

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      setCanScrollPrev(scrollLeft > 4);
      setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 4);
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateMetrics);

    const ro = new ResizeObserver(() => {
      updateMetrics();
    });
    if (rootRef.current) ro.observe(rootRef.current);

    return () => {
      track.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateMetrics);
      ro.disconnect();
    };
  }, [updateMetrics]);

  const scrollByCard = (direction: "next" | "prev") => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-m]"));
    if (!cards.length) return;

    const currentScroll = track.scrollLeft;
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (direction === "next") {
      if (currentScroll >= maxScroll - 6) return;
      // Find the next card whose offsetLeft is ahead of current scroll
      const nextCard = cards.find((c) => c.offsetLeft > currentScroll + 10);
      if (nextCard) {
        // Clamp to maxScroll so the final position cleanly shows 2025
        const target = Math.min(nextCard.offsetLeft, maxScroll);
        track.scrollTo({ left: target, behavior: "smooth" });
      } else {
        track.scrollTo({ left: maxScroll, behavior: "smooth" });
      }
    } else {
      if (currentScroll <= 6) return;
      const prevCard = [...cards].reverse().find((c) => c.offsetLeft < currentScroll - 10);
      if (prevCard) {
        const target = Math.max(prevCard.offsetLeft, 0);
        track.scrollTo({ left: target, behavior: "smooth" });
      } else {
        track.scrollTo({ left: 0, behavior: "smooth" });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOListElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByCard("next");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByCard("prev");
    }
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      {/* Controls: Previous and Next arrow buttons */}
      <div className="mb-4 flex items-center justify-end gap-2 sm:mb-6">
        <button
          type="button"
          onClick={() => scrollByCard("prev")}
          disabled={!canScrollPrev}
          aria-label="Previous milestones"
          className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink/40 hover:bg-stone disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-accent sm:size-10"
        >
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard("next")}
          disabled={!canScrollNext}
          aria-label="Next milestones"
          className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink/40 hover:bg-stone disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-accent sm:size-10"
        >
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
      </div>

      {/* Horizontal timeline track */}
      <ol
        ref={trackRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Company milestones (use arrow keys or buttons to navigate)"
        style={{ gap: `${gapWidth}px` }}
        className="relative flex snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
      >
        {items.map((milestone, idx) => {
          const brands = milestone.brands ?? [];
          const single = brands.length <= 1;
          const rows = brands.length ? brands : [{ name: milestone.title, logo: null }];
          const isLast = idx === items.length - 1;

          return (
            <li
              key={milestone.period + milestone.title}
              data-m=""
              style={{
                width: colWidth ? `${colWidth}px` : undefined,
              }}
              className={`relative shrink-0 snap-start pt-7 ${
                !colWidth ? "w-full sm:w-[calc((100%-28px)/2)] lg:w-[calc((100%-72px)/3)]" : ""
              }`}
            >
              {/* Continuous horizontal red line connecting milestone dots */}
              <span
                aria-hidden="true"
                style={{
                  width: isLast ? "100%" : `calc(100% + ${gapWidth}px)`,
                }}
                className="absolute top-1 left-0 z-0 h-[2px] bg-accent"
              />

              {/* Year dot sitting directly on the red line */}
              <span
                aria-hidden="true"
                data-year-dot=""
                className="absolute top-0 left-0 z-10 block size-[10px] rounded-full bg-accent ring-4 ring-white"
              />

              {/* Milestone period / year */}
              <p
                data-year=""
                className="font-display text-lg font-bold tracking-tight text-ink tabular-nums sm:text-xl lg:text-[1.35rem]"
              >
                {milestone.period}
              </p>
              {!single && <h3 className="sr-only">{milestone.title}</h3>}
              <p className="sr-only">{milestone.description}</p>

              {/* Brand and milestone rows */}
              <ul className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4">
                {rows.map((brand, k) => {
                  const label = (("title" in brand && brand.title?.trim()) || (single ? milestone.title : brand.name)).trim();
                  const Label = single ? "h3" : "span";
                  return (
                    <li key={brand.name + k} data-row="" className="flex items-start gap-3">
                      <span aria-hidden="true" data-row-dot="" className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                      <span
                        data-row-logo=""
                        className="flex h-6 w-20 shrink-0 items-center justify-center lg:h-7 lg:w-24"
                      >
                        {brand.logo?.src && <BrandMark brand={brand as MilestoneBrand} />}
                      </span>
                      <Label
                        data-row-label=""
                        className="min-w-0 flex-1 text-sm leading-snug font-medium text-ink break-words"
                      >
                        {label}
                      </Label>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
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
