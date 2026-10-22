"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Check, Globe2, Store } from "lucide-react";
import { ecommerceClientGroups, retail } from "@/content/retail";
import { enquiryHref } from "@/content/navigation";
import { gsap, hasFinePointer } from "@/lib/gsap";
import { dur, ease } from "@/lib/motion";
import { ButtonLink } from "../ui";

/**
 * Animation ownership:
 * - [data-r] / [data-r-layer] / [data-r-logo] wrappers: GSAP entrance (opacity, transforms).
 * - [data-r-depth] inner layers: GSAP pointer parallax on desktop mice only.
 * - Logo links and buttons: CSS hover transitions on their own elements.
 * Without JavaScript, or with reduced motion, everything renders in its final state.
 */
export function RetailEcommerceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const q = gsap.utils.selector(section);
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 1024px)",
      },
      (context) => {
        const { motion, desktop } = context.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        const depth = desktop ? 1 : 0.45;
        // Content already on screen (reload or hash link) is left in place.
        const alreadyVisible = (el: Element) => el.getBoundingClientRect().top < window.innerHeight * 0.9;

        const stage = q("[data-r-stage]")[0];
        if (stage && !alreadyVisible(stage)) {
          const intro = gsap.timeline({
            defaults: { ease: ease.out },
            scrollTrigger: { trigger: section, start: "top 72%", once: true },
          });
          // 1. Heading
          intro.from(q("[data-r='heading']"), { autoAlpha: 0, y: 36, duration: dur.md });
          // 2. Supporting copy
          intro.from(q("[data-r='copy']"), { autoAlpha: 0, y: 22, duration: dur.sm, stagger: 0.1 }, "-=0.5");
          // 3. Image layers, back to front, with real depth
          intro.from(
            q("[data-r-layer='back']"),
            { autoAlpha: 0, y: 60 * depth, rotationX: 10 * depth, scale: 0.94, transformPerspective: 1400, transformOrigin: "50% 100%", duration: dur.lg },
            "-=0.45",
          );
          intro.from(
            q("[data-r-layer='front']"),
            { autoAlpha: 0, y: 110 * depth, z: -220 * depth, rotationX: 16 * depth, transformPerspective: 1100, duration: dur.lg, stagger: 0.14, clearProps: "z" },
            "-=0.75",
          );
          intro.from(q("[data-r-layer='chip']"), { autoAlpha: 0, scale: 0.85, y: 16, duration: dur.sm }, "-=0.45");
          // Channels follow the visual so the eye moves from image to detail.
          intro.from(q("[data-r='channel']"), { autoAlpha: 0, x: desktop ? 28 : 0, y: desktop ? 0 : 22, duration: dur.md, stagger: 0.12 }, "-=0.7");
        }

        const logos = q("[data-r-logos]")[0];
        if (logos && !alreadyVisible(logos)) {
          const outro = gsap.timeline({
            defaults: { ease: ease.out },
            scrollTrigger: { trigger: logos, start: "top 85%", once: true },
          });
          // 4. Logos in a short stagger, then 5. CTA
          outro.from(q("[data-r='logos-head']"), { autoAlpha: 0, y: 20, duration: dur.sm });
          outro.from(q("[data-r-logo]"), { autoAlpha: 0, y: 26, scale: 0.94, duration: dur.sm, stagger: { each: 0.035, grid: "auto" } }, "-=0.3");
          outro.from(q("[data-r='cta']"), { autoAlpha: 0, y: 18, duration: dur.sm }, "-=0.25");
        }

        if (!desktop || !hasFinePointer() || !stage) return;
        // Pointer depth: each inner layer moves by its own factor.
        const layers = q("[data-r-depth]").map((el: HTMLElement) => ({
          factor: Number(el.dataset.rDepth) || 0,
          x: gsap.quickTo(el, "x", { duration: 0.7, ease: ease.soft }),
          y: gsap.quickTo(el, "y", { duration: 0.7, ease: ease.soft }),
        }));
        const move = (e: Event) => {
          const event = e as PointerEvent;
          if (event.pointerType !== "mouse") return;
          const rect = stage.getBoundingClientRect();
          const nx = (event.clientX - rect.left) / rect.width - 0.5;
          const ny = (event.clientY - rect.top) / rect.height - 0.5;
          layers.forEach((layer) => { layer.x(nx * layer.factor); layer.y(ny * layer.factor); });
        };
        const leave = () => layers.forEach((layer) => { layer.x(0); layer.y(0); });
        stage.addEventListener("pointermove", move);
        stage.addEventListener("pointerleave", leave);
        return () => {
          stage.removeEventListener("pointermove", move);
          stage.removeEventListener("pointerleave", leave);
          layers.forEach((layer) => {
            layer.x.tween.kill();
            layer.y.tween.kill();
          });
        };
      },
    );

    return () => mm.revert();
  }, []);

  const { physical, online, images } = retail;

  return (
    <section
      id="retail-ecommerce"
      ref={sectionRef}
      aria-labelledby="retail-ecommerce-title"
      className="section-space relative overflow-hidden bg-white"
    >
      <div className="container-site">
        {/* Heading row */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div data-r="heading" className="lg:col-span-7">
            <p className="eyebrow mb-5">Retail &amp; online commerce</p>
            <h2 id="retail-ecommerce-title" className="t-h2 text-[clamp(2.4rem,1.6rem+3.2vw,4.25rem)]">
              {retail.heading}
            </h2>
          </div>
          <p data-r="copy" className="t-lead text-muted lg:col-span-5">
            {retail.intro}
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          {/* Layered visual */}
          <figure className="lg:sticky lg:top-24 lg:col-span-7 lg:self-start">
            <div data-r-stage="" className="relative rounded-[10px] bg-night p-4 sm:p-6 lg:p-8">
              <div aria-hidden className="grid-texture pointer-events-none absolute inset-0 rounded-[10px]" />
              <div data-r-layer="back" className="relative">
                <div data-r-depth="10" className="overflow-hidden rounded-[6px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                  <Image
                    src={images.banner.src}
                    alt={images.banner.alt}
                    placeholder="blur"
                    sizes="(min-width: 1280px) 680px, (min-width: 1024px) 55vw, 92vw"
                    className="h-auto w-full"
                  />
                </div>
              </div>
              <ul className="relative -mt-4 grid grid-cols-2 gap-3 px-4 sm:-mt-8 sm:gap-5 sm:px-12 lg:px-16">
                {images.products.map((product, i) => (
                  <li key={product.name} data-r-layer="front" className={i === 1 ? "mt-6 sm:mt-10" : ""}>
                    <div data-r-depth={i === 0 ? "26" : "34"} className="rounded-[8px] bg-white p-2.5 shadow-[0_36px_70px_-28px_rgba(0,0,0,0.85)] ring-1 ring-black/5 sm:p-3">
                      <Image
                        src={product.src}
                        alt={product.alt}
                        sizes="(min-width: 1024px) 260px, 44vw"
                        className="aspect-square h-auto w-full rounded-[4px] object-contain"
                      />
                      <p className="mt-2 px-1 text-xs font-semibold text-ink sm:text-sm">{product.name}</p>
                      <p className="px-1 pb-0.5 text-[0.6875rem] text-muted sm:text-xs">{images.productsCaption}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div data-r-layer="chip" className="relative mt-6 flex justify-center">
                <p data-r-depth="18" className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink shadow-lg">
                  <span aria-hidden className="size-2 rounded-full bg-accent" />
                  Authorized distribution · Genuine stock
                </p>
              </div>
            </div>
            <figcaption className="mt-3 text-xs leading-relaxed text-muted">
              {images.banner.caption}. Product photographs from Sicco Store.
            </figcaption>
          </figure>

          {/* Channels */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <article data-r="channel" aria-labelledby="retail-physical-title" className="rounded-[8px] border border-line bg-stone p-6 sm:p-7">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-accent uppercase">
                <Store aria-hidden className="size-4" strokeWidth={2} /> {physical.label}
              </p>
              <h3 id="retail-physical-title" className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                {physical.title}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{physical.summary}</p>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-line py-4">
                {physical.facts.map((fact) => (
                  <div key={fact.label} className="flex flex-col">
                    <dt className="text-xs leading-snug text-muted">{fact.label}</dt>
                    <dd className="t-figure order-first text-[1.75rem]">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-4 space-y-2">
                {physical.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
                    <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                    {point}
                  </li>
                ))}
              </ul>
            </article>

            <article data-r="channel" aria-labelledby="retail-online-title" className="rounded-[8px] border border-accent/30 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(200,0,11,0.45)] sm:p-7">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-accent uppercase">
                <Globe2 aria-hidden className="size-4" strokeWidth={2} /> {online.label}
              </p>
              <h3 id="retail-online-title" className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                {online.title}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{online.tagline}</p>
              <ul className="mt-4 space-y-2">
                {online.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
                    <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                    {point}
                  </li>
                ))}
              </ul>
              <ul aria-label="Sicco Store categories" className="mt-4 flex flex-wrap gap-1.5">
                {online.categories.map((category) => (
                  <li key={category} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                    {category}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <ButtonLink href={online.url} external className="w-full sm:w-auto">
                  Visit Sicco Store
                </ButtonLink>
              </div>
            </article>
          </div>
        </div>

        {/* E-commerce clients */}
        <div data-r-logos="" className="mt-16 border-t border-line pt-12 lg:mt-20">
          <div data-r="logos-head" className="grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-10">
            <h3 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-ink lg:col-span-6">
              E-commerce clients
            </h3>
            <p className="text-sm leading-relaxed text-muted lg:col-span-6">{retail.sourceNote}</p>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-6">
            {ecommerceClientGroups.map((group) => (
              <section key={group.title} aria-label={group.title}>
                <h4 className="border-b border-line pb-3 text-xs font-semibold tracking-[0.12em] text-muted uppercase">{group.title}</h4>
                <ul className="mt-4 grid grid-cols-2 gap-3">
                  {group.clients.map((client) => (
                    <li key={client.name} data-r-logo="">
                      <a
                        href={client.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-full flex-col rounded-[6px] border border-line bg-white p-3.5 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_14px_30px_-20px_rgba(0,0,0,0.5)] focus-visible:-translate-y-0.5"
                      >
                        <span className="relative flex h-14 items-center justify-center">
                          <Image src={client.logo} alt="" sizes="160px" className="max-h-12 w-auto max-w-full object-contain" />
                        </span>
                        <span className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
                          <span className="min-w-0">
                            <span className="block truncate text-[0.8125rem] font-semibold text-ink">{client.name}</span>
                            <span className="block truncate text-[0.6875rem] text-muted">{client.sector}</span>
                          </span>
                          <ArrowUpRight aria-hidden className="size-3.5 shrink-0 text-muted transition-colors group-hover:text-accent" />
                        </span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div data-r="cta" className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={online.url} external magnetic>
              Shop at Sicco Store
            </ButtonLink>
            <ButtonLink href={enquiryHref("dealer")} variant="secondary" magnetic>
              Become a dealer or retail partner
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
