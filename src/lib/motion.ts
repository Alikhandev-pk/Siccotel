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

/** Where scroll reveals start: element top reaches 88% of the viewport. */
export const revealStart = "top 90%";

/** Hero choreography (seconds). Mirrors the CSS --d delays on the hero text. */
export const hero = {
  eyebrow: 0,
  line1: 0.08,
  line2: 0.2,
  lead: 0.38,
  ctas: 0.48,
  /** The photograph arrives as the headline settles. */
  visual: 0.55,
} as const;
