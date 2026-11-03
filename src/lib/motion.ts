/**
 * Motion tokens shared by every GSAP animation on the site. CSS transitions
 * use the matching custom properties in globals.css (--ease-out-expo etc.).
 */
export const ease = {
  /** Entrances and reveals: fast start, long soft settle. */
  out: "expo.out",
  /** Elements leaving or swapping in place. */
  inOut: "power3.inOut",
  /** Small UI feedback. */
  soft: "power2.out",
  /** Scroll-scrubbed motion: position follows scroll exactly. */
  scrub: "none",
} as const;

export const dur = {
  xs: 0.35,
  sm: 0.55,
  md: 0.8,
  lg: 0.9,
  xl: 1.1,
} as const;

export const stagger = { tight: 0.05, base: 0.08, loose: 0.12 } as const;

/** Where scroll reveals start: element top reaches 90% of the viewport. */
export const revealStart = "top 90%";

/** Hero entrance: start times in seconds on one overlapping timeline (components/home/HeroCarousel). */
export const hero = {
  banner: 0,
  caption: 0.4,
  intro: 0.5,
} as const;

/** How long each hero banner stays fully on screen while autoplay is running. */
export const heroSlideSeconds = 5;

/** The crossfade between hero banners. */
export const heroCrossfadeSeconds = 0.5;
