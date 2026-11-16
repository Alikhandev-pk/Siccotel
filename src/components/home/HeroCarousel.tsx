"use client";

import Image, { getImageProps } from "next/image";
import { useCallback, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import type { Banner, HomeDoc, Published } from "@/lib/cms/types";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { ease, hero, heroCrossfadeSeconds, heroSlideSeconds } from "@/lib/motion";
import { ButtonLink } from "../ui";

/** Delay of the CSS failsafe (globals.css, hero-failsafe), in milliseconds. */
const FAILSAFE_DELAY_MS = 1200;
/** Horizontal travel that counts as a swipe; a mostly vertical drag remains a page scroll. */
const SWIPE_PX = 48;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
const getServerReducedMotion = () => false;

/** True once the CSS failsafe has revealed the hero, so the entrance must not replay. */
function failsafeStarted(el: Element | undefined) {
  const animation = el?.getAnimations?.().find((a) => (a as CSSAnimation).animationName === "hero-failsafe");
  return Number(animation?.currentTime ?? 0) >= FAILSAFE_DELAY_MS;
}

/** Resolves once a banner can paint, so a crossfade never reveals an empty frame. */
async function bannerReady(root: HTMLElement | null, index: number) {
  for (let frame = 0; frame < 120; frame++) {
    const image = root?.querySelector<HTMLImageElement>(`[data-banner="${index}"] img`);
    if (image) {
      await image.decode().catch(() => {});
      return;
    }
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

type HeroBanner = Published<Banner>;

/** Desktop art, with optional phone art via <picture>; phones fall back to the desktop image. */
function BannerImage({ banner, first }: { banner: HeroBanner; first: boolean }) {
  const loading = first ? { preload: true } : { loading: "eager" as const };
  if (!banner.mobile?.src) {
    return <Image src={banner.desktop.src} alt={banner.desktop.alt} fill sizes="100vw" quality={100} {...loading} className="object-contain" />;
  }
  const common = { alt: banner.desktop.alt, sizes: "100vw", quality: 100 };
  const { props: { srcSet: desktopSet } } = getImageProps({ ...common, src: banner.desktop.src, width: banner.desktop.width, height: banner.desktop.height });
  const { props: { srcSet: mobileSet, ...rest } } = getImageProps({ ...common, src: banner.mobile.src, width: banner.mobile.width, height: banner.mobile.height, ...(first ? { preload: true } : { loading: "eager" as const }) });
  return (
    <picture>
      <source media="(min-width: 640px)" srcSet={desktopSet} />
      <source media="(max-width: 639px)" srcSet={mobileSet} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is in rest */}
      <img {...rest} className="absolute inset-0 size-full object-contain" />
    </picture>
  );
}

/**
 * Edge-to-edge campaign banners that rotate on their own. The artwork carries
 * its own headlines, so nothing is laid over it, and it is contained, never
 * cropped. Only the first image loads with the page; each later one is fetched
 * while the banner before it is on screen.
 *
 * Ownership: GSAP owns slide opacity and the entrance on [data-hero] wrappers;
 * CSS owns the pause control, which appears only on keyboard focus.
 */
export function HeroCarousel({ banners, intro }: { banners: HeroBanner[]; intro: HomeDoc["hero"] }) {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));
  const [userPaused, setUserPaused] = useState(false);
  const [focusHeld, setFocusHeld] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const total = banners.length;
  const autoplay = !reducedMotion && !userPaused && total > 1;
  const paused = userPaused || focusHeld;

  const activeRef = useRef(0);
  const busy = useRef(false);
  const disposed = useRef(false);
  const transition = useRef<gsap.core.Timeline | null>(null);
  const timer = useRef<gsap.core.Tween | null>(null);
  const holds = useRef({ focus: false, hidden: false });
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const mountSlide = useCallback((index: number) => {
    setMounted((current) => (current.has(index) ? current : new Set([...current, index])));
  }, []);
  const syncTimer = useCallback(() => {
    timer.current?.paused(holds.current.focus || holds.current.hidden);
  }, []);

  /**
   * One transition at a time. The incoming banner fades in above the outgoing
   * one, which stays opaque until the fade ends, so the page never shows through.
   * The wait for the image also takes this out of the timer's GSAP context, which
   * would otherwise revert the transition as soon as the slide changes.
   */
  const goTo = useCallback(
    (target: number) => {
      if (busy.current || target === activeRef.current) return;
      busy.current = true;
      mountSlide(target);
      void bannerReady(rootRef.current, target).then(() => {
        if (disposed.current) return;
        const from = activeRef.current;
        activeRef.current = target;
        setActive(target);

        const q = gsap.utils.selector(rootRef);
        const bannerOut = q(`[data-banner="${from}"]`);
        const bannerIn = q(`[data-banner="${target}"]`);
        const captionOut = q(`[data-banner-caption="${from}"]`);
        const captionIn = q(`[data-banner-caption="${target}"]`);

        if (window.matchMedia(REDUCED_MOTION).matches) {
          gsap.set([...bannerOut, ...captionOut], { autoAlpha: 0 });
          gsap.set([...bannerIn, ...captionIn], { autoAlpha: 1 });
          busy.current = false;
          return;
        }
        const fade = heroCrossfadeSeconds;
        transition.current = gsap
          .timeline({
            defaults: { ease: ease.soft },
            onComplete: () => {
              transition.current = null;
              busy.current = false;
            },
          })
          .set(bannerIn, { zIndex: 2 }, 0)
          .fromTo(bannerIn, { autoAlpha: 0 }, { autoAlpha: 1, duration: fade, ease: "none" }, 0)
          // The captions swap in turn, so their text never overlaps.
          .to(captionOut, { autoAlpha: 0, duration: fade * 0.4 }, 0)
          .fromTo(captionIn, { autoAlpha: 0 }, { autoAlpha: 1, duration: fade * 0.6 }, fade * 0.4)
          .set(bannerOut, { autoAlpha: 0 }, fade)
          .set(bannerIn, { clearProps: "zIndex" }, fade);
      });
    },
    [mountSlide],
  );

  // Banner (Ken Burns), then the caption, then the intro: eyebrow rule, headline
  // words rising out of their masks, copy and actions. Whole intro under 1.5s.
  useGSAP(
    () => {
      const q = gsap.utils.selector(rootRef);
      const owned = q("[data-hero]");
      const banner = q("[data-hero='banner']");
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const alreadyShown = failsafeStarted(owned[0]);
        // Take over from the CSS failsafe on everything this timeline owns.
        gsap.set(owned, { animation: "none" });

        // Slight parallax as the banner scrolls away (it starts at rest at the top).
        gsap.to(banner, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: q(".hero-banner")[0], start: 0, end: "bottom top", scrub: true },
        });

        if (alreadyShown) {
          gsap.set(owned, { opacity: 1 });
          return;
        }
        const title = q(".hero-title")[0];
        const split = title ? SplitText.create(title, { type: "words", mask: "words", wordsClass: "hero-word" }) : null;
        gsap
          .timeline({ defaults: { ease: ease.soft, duration: 0.6 } })
          .fromTo(banner, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, hero.banner)
          .fromTo(q("[data-hero='caption']"), { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, hero.caption)
          .set(q("[data-hero='intro']"), { opacity: 1 }, hero.intro - 0.2)
          .fromTo(q("[data-hero-eyebrow]"), { "--eyebrow-line": 0, opacity: 0 }, { "--eyebrow-line": 1, opacity: 1, duration: 0.6, ease: "power3.out" }, hero.intro - 0.2)
          .fromTo(split?.words ?? [], { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "power4.out", stagger: 0.08 }, hero.intro - 0.1)
          .fromTo(q("[data-hero-fade]"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.08 }, hero.intro + 0.2)
          .add(() => split?.revert())
          .set([...owned.filter((el) => el !== banner[0]), ...q("[data-hero-fade]")], { clearProps: "transform" });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  // Autoplay: one timer, replaced whenever the slide or the play state changes.
  useGSAP(
    () => {
      if (!autoplay || total < 2) return;
      const next = (active + 1) % total;
      // A slide change starts the fade, so its 5 seconds begin when the fade ends.
      const delay = heroSlideSeconds + (transition.current ? heroCrossfadeSeconds : 0);
      timer.current = gsap.delayedCall(delay, () => goTo(next));
      syncTimer();
      const fetchNext = gsap.delayedCall(1.5, () => mountSlide(next));
      return () => {
        fetchNext.kill();
        timer.current?.kill();
        timer.current = null;
      };
    },
    { scope: rootRef, dependencies: [active, autoplay], revertOnUpdate: true },
  );

  // Hold while the tab is hidden or the carousel has keyboard focus.
  useGSAP(
    () => {
      disposed.current = false;
      const root = rootRef.current;
      if (!root) return;
      const onFocusIn = (event: FocusEvent) => {
        if (!(event.target as Element).matches(":focus-visible")) return;
        holds.current.focus = true;
        setFocusHeld(true);
        syncTimer();
      };
      const onFocusOut = (event: FocusEvent) => {
        if (root.contains(event.relatedTarget as Node | null)) return;
        holds.current.focus = false;
        setFocusHeld(false);
        syncTimer();
      };
      const onVisibility = () => {
        holds.current.hidden = document.visibilityState !== "visible";
        syncTimer();
      };
      onVisibility();
      root.addEventListener("focusin", onFocusIn);
      root.addEventListener("focusout", onFocusOut);
      document.addEventListener("visibilitychange", onVisibility);
      return () => {
        disposed.current = true;
        root.removeEventListener("focusin", onFocusIn);
        root.removeEventListener("focusout", onFocusOut);
        document.removeEventListener("visibilitychange", onVisibility);
        transition.current?.kill();
        transition.current = null;
        busy.current = false;
      };
    },
    { scope: rootRef },
  );

  /** Keeps its label truthful: focus alone holds the rotation, so the first press resumes it. */
  const togglePause = () => {
    if (!paused) {
      setUserPaused(true);
      return;
    }
    holds.current.focus = false;
    setFocusHeld(false);
    setUserPaused(false);
    syncTimer();
  };

  const onSwipeStart = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") swipe.current = { x: event.clientX, y: event.clientY };
  };
  const onSwipeEnd = (event: ReactPointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (total > 1 && Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) goTo((active + (dx < 0 ? 1 : -1) + total) % total);
  };

  const activeBanner = banners[active] ?? banners[0];

  return (
    <section ref={rootRef} aria-roledescription="carousel" aria-label="Featured device campaigns" data-motion-scope="" className="home-hero">
      {total > 0 && (
      <div
        className="hero-banner"
        onPointerDown={onSwipeStart}
        onPointerUp={onSwipeEnd}
        onPointerCancel={() => { swipe.current = null; }}
      >
        <div data-hero="banner" className="absolute inset-0">
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              data-banner={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}: ${banner.brand} ${banner.title}`}
              aria-hidden={i !== active}
              className={`absolute inset-0 ${i === 0 ? "" : "invisible opacity-0"}`}
              style={{ backgroundColor: banner.background }}
            >
              {mounted.has(i) && <BannerImage banner={banner} first={i === 0} />}
            </div>
          ))}
        </div>
        {!reducedMotion && total > 1 && (
          <button type="button" onClick={togglePause} className="hero-pause">
            {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
            {paused ? "Resume banner rotation" : "Pause banner rotation"}
          </button>
        )}
      </div>
      )}

      <div className="container-site lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-8">
        {/*
          Names what the artwork is showing; on phones its own text is too small to rely on.
          There it is one tinted row, attached to the banner so the two read as a unit.
        */}
        {total > 0 && (
        <div data-hero="caption" className="hero-captions -mx-4 bg-stone px-4 py-1.5 sm:-mx-6 sm:px-6 lg:order-last lg:col-span-4 lg:mx-0 lg:border-l lg:border-line lg:bg-transparent lg:py-0 lg:pr-0 lg:pl-10">
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              data-banner-caption={i}
              aria-hidden={i !== active}
              inert={i !== active}
              className={`flex items-center justify-between gap-3 lg:block ${i === 0 ? "" : "invisible opacity-0"}`}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.1em] text-accent uppercase lg:tracking-[0.12em]">{banner.brand}</p>
                <p className="font-display text-base leading-snug font-semibold tracking-[-0.015em] text-ink lg:mt-1.5 lg:text-lg">{banner.title}</p>
              </div>
              {banner.ctaHref && (
              <a
                href={banner.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${banner.ctaLabel || "Open link"}: ${banner.brand} ${banner.title} (opens in a new tab)`}
                className="group inline-flex min-h-11 shrink-0 items-center gap-1 text-[0.9375rem] font-semibold text-accent lg:mt-2 lg:gap-1.5 lg:text-sm"
              >
                <span className="link-line pb-0.5 lg:hidden">{banner.ctaHref.includes("siccostore") ? "Sicco Store" : banner.ctaLabel || "Open"}</span>
                <span className="link-line hidden pb-0.5 lg:inline">{banner.ctaLabel || "Open link"}</span>
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
              )}
            </div>
          ))}
        </div>
        )}

        <div data-hero="intro" className="grid gap-4 py-5 sm:py-6 lg:col-span-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8 lg:py-0">
          <div className="min-w-0">
            <p data-hero-eyebrow="" className="eyebrow mb-2.5 text-xs tracking-[0.06em] sm:mb-3 sm:tracking-[0.16em]">{intro.eyebrow}</p>
            <h1 className="hero-title">
              {[intro.headline1, intro.headline2].filter(Boolean).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p data-hero-fade="" className="mt-2.5 max-w-[34rem] leading-relaxed text-muted sm:mt-3">{intro.description}</p>
          </div>
          {/* The header carries Partner With Us from sm up. Below that the hero does, with Explore as the secondary route. */}
          <div data-hero-fade="" className="grid grid-cols-2 gap-2 sm:hidden">
            <ButtonLink href="/contact#enquiry" icon={false} className="px-2!">
              Partner With Us
            </ButtonLink>
            <ButtonLink href={intro.actionHref} variant="secondary" icon={false} className="px-2!">
              Our Services
            </ButtonLink>
          </div>
          <div data-hero-fade="" className="hidden sm:block lg:justify-self-end">
            <ButtonLink href={intro.actionHref}>{intro.actionLabel}</ButtonLink>
          </div>
        </div>
      </div>

      {activeBanner && (
        <p aria-live={paused || reducedMotion ? "polite" : "off"} aria-atomic="true" className="sr-only">
          {`Slide ${active + 1} of ${total}: ${activeBanner.brand} ${activeBanner.title}`}
        </p>
      )}
    </section>
  );
}
