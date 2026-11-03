"use client";

import Image from "next/image";
import { useCallback, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { heroBanners, heroIntro, type HeroBanner } from "@/content/hero";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease, hero, heroCrossfadeSeconds, heroSlideSeconds } from "@/lib/motion";
import { ButtonLink, TextLink } from "../ui";

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

function Banner({ banner, first }: { banner: HeroBanner; first: boolean }) {
  return (
    <Image
      src={banner.src}
      alt={banner.alt}
      fill
      sizes="100vw"
      quality={90}
      {...(first ? { preload: true } : { loading: "eager" as const })}
      className="object-contain"
    />
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
export function HeroCarousel() {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));
  const [userPaused, setUserPaused] = useState(false);
  const [focusHeld, setFocusHeld] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const autoplay = !reducedMotion && !userPaused;
  const paused = userPaused || focusHeld;

  const activeRef = useRef(0);
  const busy = useRef(false);
  const disposed = useRef(false);
  const transition = useRef<gsap.core.Timeline | null>(null);
  const timer = useRef<gsap.core.Tween | null>(null);
  const holds = useRef({ focus: false, hidden: false });
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const total = heroBanners.length;
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

  // Banner reveal, then the caption area in reading order.
  useGSAP(
    () => {
      const q = gsap.utils.selector(rootRef);
      const owned = q("[data-hero]");
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const alreadyShown = failsafeStarted(owned[0]);
        // Take over from the CSS failsafe on everything this timeline owns.
        gsap.set(owned, { animation: "none" });
        if (alreadyShown) {
          gsap.set(owned, { opacity: 1 });
          return;
        }
        gsap
          .timeline({ defaults: { ease: ease.soft, duration: 0.6 } })
          .fromTo(q("[data-hero='banner']"), { opacity: 0, scale: 1.015 }, { opacity: 1, scale: 1, duration: 0.9 }, hero.banner)
          .fromTo(q("[data-hero='caption']"), { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, hero.caption)
          .fromTo(q("[data-hero='intro']"), { opacity: 0, y: 22 }, { opacity: 1, y: 0 }, hero.intro)
          .set(owned, { clearProps: "transform" });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  // Autoplay: one timer, replaced whenever the slide or the play state changes.
  useGSAP(
    () => {
      if (!autoplay) return;
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
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) goTo((active + (dx < 0 ? 1 : -1) + total) % total);
  };

  const activeBanner = heroBanners[active];
  const lastLine = heroIntro.headline.length - 1;

  return (
    <section ref={rootRef} aria-roledescription="carousel" aria-label="Featured device campaigns" data-motion-scope="" className="home-hero">
      <div
        className="hero-banner"
        onPointerDown={onSwipeStart}
        onPointerUp={onSwipeEnd}
        onPointerCancel={() => { swipe.current = null; }}
      >
        <div data-hero="banner" className="absolute inset-0">
          {heroBanners.map((banner, i) => (
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
              {mounted.has(i) && <Banner banner={banner} first={i === 0} />}
            </div>
          ))}
        </div>
        {!reducedMotion && (
          <button type="button" onClick={togglePause} className="hero-pause">
            {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
            {paused ? "Resume banner rotation" : "Pause banner rotation"}
          </button>
        )}
      </div>

      <div className="container-site lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-8">
        {/*
          Names what the artwork is showing; on phones its own text is too small to rely on.
          There it is one tinted row, attached to the banner so the two read as a unit.
        */}
        <div data-hero="caption" className="hero-captions -mx-4 bg-stone px-4 py-1.5 sm:-mx-6 sm:px-6 lg:order-last lg:col-span-4 lg:mx-0 lg:border-l lg:border-line lg:bg-transparent lg:py-0 lg:pr-0 lg:pl-10">
          {heroBanners.map((banner, i) => (
            <div
              key={banner.id}
              data-banner-caption={i}
              aria-hidden={i !== active}
              inert={i !== active}
              className={`flex items-center justify-between gap-3 lg:block ${i === 0 ? "" : "invisible opacity-0"}`}
            >
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-accent uppercase lg:text-xs">{banner.brand}</p>
                <p className="font-display text-[0.9375rem] leading-snug font-semibold tracking-[-0.015em] text-ink lg:mt-1.5 lg:text-lg">{banner.title}</p>
              </div>
              <a
                href={banner.link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${banner.link.label}: ${banner.brand} ${banner.title} (opens in a new tab)`}
                className="group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-accent lg:mt-2 lg:gap-1.5"
              >
                <span className="link-line pb-0.5 lg:hidden">Sicco Store</span>
                <span className="link-line hidden pb-0.5 lg:inline">{banner.link.label}</span>
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            </div>
          ))}
        </div>

        <div data-hero="intro" className="grid gap-4 py-5 sm:py-6 lg:col-span-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8 lg:py-0">
          <div className="min-w-0">
            <p className="eyebrow mb-2.5 text-[0.6875rem] tracking-[0.12em] sm:mb-3 sm:text-xs sm:tracking-[0.16em]">{heroIntro.eyebrow}</p>
            <h1 className="hero-title">
              {heroIntro.headline.map((line, i) => (
                <span key={line} className="block">
                  {i === lastLine ? line.slice(0, -1) : line}
                  {i === lastLine && <span className="text-brand">.</span>}
                </span>
              ))}
            </h1>
            <p className="mt-2.5 max-w-[34rem] leading-relaxed text-muted sm:mt-3">{heroIntro.description}</p>
          </div>
          {/* The header carries Partner With Us from sm up. Below that the hero does, with Explore as the secondary route. */}
          <div className="flex items-center gap-4 sm:hidden">
            <ButtonLink href={heroIntro.partner.href} className="flex-1">
              {heroIntro.partner.label}
            </ButtonLink>
            <TextLink href={heroIntro.action.href} className="min-h-11 shrink-0 text-sm">
              Our Business
            </TextLink>
          </div>
          <div className="hidden sm:block lg:justify-self-end">
            <ButtonLink href={heroIntro.action.href}>{heroIntro.action.label}</ButtonLink>
          </div>
        </div>
      </div>

      <p aria-live={paused || reducedMotion ? "polite" : "off"} aria-atomic="true" className="sr-only">
        {`Slide ${active + 1} of ${total}: ${activeBanner.brand} ${activeBanner.title}`}
      </p>
    </section>
  );
}
