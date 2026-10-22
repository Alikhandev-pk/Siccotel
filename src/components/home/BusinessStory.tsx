"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import mwcTecno from "@/assets/news/mwc-barcelona-2025-tecno-booth.jpg";
import assemblyFloor from "@/assets/company/siccotel-telecom-assembly-floor.jpg";
import { businessActivities } from "@/content/business";
import { retail } from "@/content/retail";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/components/motion/SmoothScroll";
import { dur, ease } from "@/lib/motion";
import { ButtonLink } from "../ui";

const visuals: Record<string, { image: StaticImageData; alt: string; caption: string }> = {
  distribution: {
    image: mwcTecno,
    alt: "Siccotel representatives at the Tecno stand, MWC Barcelona 2025",
    caption: "With Tecno at MWC Barcelona 2025.",
  },
  manufacturing: {
    image: assemblyFloor,
    alt: "Workstations on the Siccotel Telecom mobile phone assembly floor in Karachi",
    caption: "Siccotel Telecom’s assembly floor, Korangi Creek Industrial Park, Karachi.",
  },
  retail: {
    image: retail.images.banner.src,
    alt: retail.images.banner.alt,
    caption: "Premium products, genuine stock: Siccotel’s official partner banner.",
  },
};

/** Pinned only where there is room for the whole stage; otherwise the stacked layout is used. */
const PIN_QUERY = "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";
/** Scroll distance per chapter change, as a fraction of the viewport height. */
const STEP = 0.55;

export function BusinessStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const total = businessActivities.length;

  // Pin + scroll-driven chapter index.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const mm = gsap.matchMedia();
    mm.add(PIN_QUERY, () => {
      const trigger = ScrollTrigger.create({
        trigger: section.querySelector("[data-story-stage]"),
        start: "top top+=88",
        end: () => `+=${window.innerHeight * STEP * (total - 1)}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const index = Math.min(total - 1, Math.round(self.progress * (total - 1)));
          setActive((current) => (current === index ? current : index));
          gsap.set(section.querySelector("[data-story-progress]"), { scaleY: self.progress });
        },
      });
      triggerRef.current = trigger;
      return () => {
        triggerRef.current = null;
        trigger.kill();
      };
    });
    return () => mm.revert();
  }, [total]);

  // Image and highlight transitions. GSAP owns every image layer's opacity and scale.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const layers = gsap.utils.toArray<HTMLElement>("[data-story-image]", section);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tweens: gsap.core.Tween[] = [];
    layers.forEach((layer, i) => {
      const isActive = i === active;
      const img = layer.querySelector("img");
      tweens.push(gsap.to(layer, { autoAlpha: isActive ? 1 : 0, duration: reduce ? 0 : dur.md, ease: ease.inOut, overwrite: true }));
      if (img) {
        tweens.push(gsap.to(img, { scale: isActive ? 1 : 1.08, duration: reduce ? 0 : dur.lg, ease: ease.out, overwrite: true }));
      }
    });
    return () => tweens.forEach((tween) => tween.kill());
  }, [active]);

  /** Chapter buttons scroll to their step when pinned, or switch directly when not. */
  const select = (index: number) => {
    const trigger = triggerRef.current;
    if (!trigger) {
      setActive(index);
      return;
    }
    const y = trigger.start + (trigger.end - trigger.start) * (index / (total - 1)) + 1;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section
      id="our-business"
      aria-labelledby="business-title"
      ref={sectionRef}
      className="relative border-y border-line bg-stone py-16 lg:py-20"
    >
      <div className="container-site">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-4">Our business</p>
            <h2 id="business-title" className="t-h2 max-w-3xl" data-anim="heading">
              From global brands to everyday connections.
            </h2>
          </div>
          <p className="max-w-md leading-relaxed text-muted lg:col-span-5" data-anim="fade">
            Three connected businesses: distribution for global brands, local assembly through Siccotel Telecom, and
            retail &amp; e-commerce.
          </p>
        </div>

        {/* Desktop stage: pinned when motion is allowed and the viewport is tall enough. */}
        <div data-story-stage="" className="mt-10 hidden gap-10 lg:grid lg:grid-cols-12 lg:items-stretch lg:motion-reduce:hidden">
          <div className="relative lg:col-span-5">
            <span aria-hidden className="absolute top-0 bottom-0 left-0 w-[2px] bg-line" />
            <span aria-hidden data-story-progress="" className="absolute top-0 bottom-0 left-0 w-[2px] origin-top scale-y-0 bg-accent" />
            <ol className="flex flex-col">
              {businessActivities.map((activity, i) => {
                const isActive = active === i;
                return (
                  <li key={activity.id}>
                    <button
                      type="button"
                      onClick={() => select(i)}
                      aria-current={isActive ? "step" : undefined}
                      aria-controls={`story-panel-${activity.id}`}
                      className={`group w-full py-5 pr-2 pl-7 text-left transition-colors duration-300 ${isActive ? "" : "hover:bg-white/50"}`}
                    >
                      <span className="flex items-center gap-3 text-xs font-semibold tracking-[0.12em] uppercase">
                        <span className={`font-display tabular-nums transition-colors duration-300 ${isActive ? "text-accent" : "text-muted"}`}>0{i + 1}</span>
                        <span className={`transition-colors duration-300 ${isActive ? "text-ink" : "text-muted"}`}>{activity.kicker}</span>
                      </span>
                      <span className={`mt-2 block font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] transition-colors duration-300 ${isActive ? "text-ink" : "text-ink/45 group-hover:text-ink/70"}`}>
                        {activity.title}
                      </span>
                      <span className={`mt-2 block text-[0.9375rem] leading-relaxed transition-colors duration-300 ${isActive ? "text-ink-soft" : "text-muted"}`}>
                        {activity.summary}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="relative min-h-[30rem] overflow-hidden rounded-[10px] bg-night lg:col-span-7">
            {businessActivities.map((activity, i) => {
              const visual = visuals[activity.id];
              const isActive = active === i;
              return (
                <div
                  key={activity.id}
                  id={`story-panel-${activity.id}`}
                  data-story-image=""
                  aria-hidden={!isActive}
                  inert={!isActive}
                  className={`absolute inset-0 ${activity.id === "retail" ? "bg-gradient-to-b from-[#d70d1b] to-night" : ""} ${i === 0 ? "" : "invisible opacity-0"}`}
                >
                  <Image
                    src={visual.image}
                    alt={visual.alt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1280px) 700px, 58vw"
                    className={activity.id === "retail" ? "object-contain object-top" : "object-cover"}
                    priority={i === 0}
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                    <p className="text-xs text-white/70">{visual.caption}</p>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {activity.points.map((point) => (
                        <li key={point} className="flex gap-2 text-sm leading-snug text-white/90">
                          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-on-dark" strokeWidth={2.5} />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5">
                      <ButtonLink href={activity.detailHref} variant="light">
                        Explore {activity.title}
                      </ButtonLink>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stacked layout: mobile, tablet and reduced motion. */}
        <div className="mt-10 grid gap-6 md:grid-cols-3 lg:hidden lg:motion-reduce:grid">
          {businessActivities.map((activity, i) => {
            const visual = visuals[activity.id];
            return (
              <article
                key={activity.id}
                aria-labelledby={`story-${activity.id}`}
                className="flex flex-col overflow-hidden rounded-[8px] border border-line bg-white"
              >
                <div className={`relative aspect-[16/10] ${activity.id === "retail" ? "bg-gradient-to-b from-[#d70d1b] to-night" : "bg-night"}`}>
                  <Image src={visual.image} alt={visual.alt} fill placeholder="blur" sizes="(min-width: 768px) 33vw, 100vw" className={activity.id === "retail" ? "object-contain" : "object-cover"} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="flex items-baseline gap-2 text-xs font-semibold text-muted">
                    <span className="font-display font-bold text-accent tabular-nums">0{i + 1}</span>
                    {activity.kicker}
                  </p>
                  <h3 id={`story-${activity.id}`} className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
                    {activity.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{activity.summary}</p>
                  <ul className="mt-4 space-y-2 border-t border-line pt-3">
                    {activity.points.map((point) => (
                      <li key={point} className="flex gap-2 text-sm leading-relaxed text-muted">
                        <Check aria-hidden className="mt-1 size-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-5">
                    <ButtonLink href={activity.detailHref} variant="secondary" className="w-full">
                      Explore {activity.title}
                    </ButtonLink>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
