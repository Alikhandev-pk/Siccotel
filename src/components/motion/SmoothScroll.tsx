"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { gsap, hasFinePointer, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/**
 * A link click that leads to a different pathname. The destination is shown
 * from the top (or at its hash target) once it commits. Back/Forward never sets
 * this (see the position store below), and query-only or same-page hash links
 * keep the current position.
 */
let pendingNavigation: { path: string; hash: string } | null = null;

/**
 * Back/Forward restoration for client-side history entries. Next.js renders the
 * destination after popstate, so the browser's own restoration happens too
 * early. Positions are kept per history entry and applied once the page commits.
 * Entries are keyed by the Navigation API where available (its key survives
 * Next.js rewriting history.state), otherwise by a key stored in history.state.
 */
const STATE_KEY = "__scrollKey";
const STORE_KEY = "siccotel:scroll";
const positions = new Map<string, number>();
let pendingRestore: number | null = null;
let restoring = false;
/** The pathname whose content is currently committed on screen. */
let committedPath = "";

type NavigationEntry = { key: string };
const navigationApi = () =>
  (window as Window & { navigation?: { currentEntry?: NavigationEntry | null } }).navigation;

function entryKey(): string {
  const nav = navigationApi()?.currentEntry?.key;
  if (nav) return nav;
  const stored = (window.history.state as Record<string, unknown> | null)?.[STATE_KEY];
  if (typeof stored === "string") return stored;
  const key = Math.random().toString(36).slice(2);
  window.history.replaceState({ ...window.history.state, [STATE_KEY]: key }, "");
  return key;
}

function rememberPosition() {
  if (restoring) return;
  positions.set(entryKey(), Math.round(window.scrollY));
}

/** Sticky-header offset, from the same scroll-padding-top that native anchors use. */
const headerOffset = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

/**
 * Move without animation and keep Lenis and ScrollTrigger in step. Setting the
 * position through ScrollTrigger's scroll function updates its cached value;
 * otherwise its next refresh() restores the stale pre-jump position.
 */
function jumpTo(top: number) {
  window.scrollTo({ top, left: 0, behavior: "instant" });
  ScrollTrigger.getScrollFunc(window)(top);
  lenis?.scrollTo(top, { immediate: true, force: true });
}

/** The same anchor behavior with Lenis, touch input or reduced motion. */
export function scrollToTarget(target: Element | number, immediate = false) {
  if (lenis) {
    // Lenis 1.3 reads the container's scroll-padding and target scroll-margin.
    lenis.scrollTo(target as HTMLElement | number, { immediate, force: true });
    return;
  }
  const behavior: ScrollBehavior = immediate || prefersReducedMotion() ? "auto" : "smooth";
  if (typeof target === "number") window.scrollTo({ top: target, behavior });
  else target.scrollIntoView({ behavior, block: "start" });
}

/** Document position that leaves `el` just below the sticky header. */
const targetTop = (el: Element) => Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerOffset());

const getHashTarget = (hash: string) => {
  if (!hash || hash === "#") return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
};

/** One Lenis instance and one GSAP-driven loop, with native touch scrolling. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    let instance: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    let ticking = false;
    let disposed = false;

    const syncTicker = () => {
      if (!tick) return;
      if (document.visibilityState === "visible" && !ticking) {
        instance?.resize();
        instance?.scrollTo(window.scrollY, { immediate: true, force: true });
        gsap.ticker.add(tick);
        ticking = true;
      } else if (document.visibilityState !== "visible" && ticking) {
        gsap.ticker.remove(tick);
        ticking = false;
      }
    };

    const start = () => {
      if (lenis || prefersReducedMotion() || !hasFinePointer()) return;
      instance = new Lenis({
        autoRaf: false,
        lerp: 0.11,
        smoothWheel: true,
        syncTouch: false,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        prevent: (node) => node.closest?.("[data-lenis-prevent], select, textarea") != null,
      });
      lenis = instance;
      instance.on("scroll", ScrollTrigger.update);
      const ownedInstance = instance;
      // GSAP uses seconds; Lenis' raf API uses milliseconds.
      tick = (time) => ownedInstance.raf(time * 1000);
      gsap.ticker.lagSmoothing(0);
      syncTicker();
    };

    const stop = () => {
      if (tick && ticking) gsap.ticker.remove(tick);
      ticking = false;
      tick = null;
      instance?.off("scroll", ScrollTrigger.update);
      instance?.destroy();
      if (lenis === instance) lenis = null;
      instance = null;
      gsap.ticker.lagSmoothing(500, 33);
    };

    start();
    document.addEventListener("visibilitychange", syncTicker);
    const preferences = [window.matchMedia("(prefers-reduced-motion: reduce)"), window.matchMedia("(hover: hover) and (pointer: fine)")];
    const onPrefChange = () => { stop(); start(); ScrollTrigger.refresh(); };
    preferences.forEach((query) => query.addEventListener("change", onPrefChange));

    const onClick = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search) return;
      const target = getHashTarget(url.hash);
      if (!target) return;
      event.preventDefault();
      if (url.hash !== window.location.hash) history.pushState(history.state, "", url.hash);
      lenis.scrollTo(target, {
        onComplete: () => {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        },
      });
    };
    document.addEventListener("click", onClick, true);

    // Runs in the capture phase, before Next.js' Link handler, on every device.
    const onNavigationClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      pendingNavigation = { path: url.pathname, hash: url.hash };
    };
    const onPopState = () => {
      pendingNavigation = null;
      const saved = positions.get(entryKey());
      if (saved === undefined) return;
      if (window.location.pathname === committedPath) {
        // Same page (e.g. a hash entry): nothing re-renders, so restore now.
        jumpTo(saved);
        return;
      }
      pendingRestore = saved;
      restoring = true;
    };
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "[]") as [string, number][];
      stored.forEach(([key, y]) => positions.has(key) || positions.set(key, y));
    } catch {}
    // The browser's automatic restoration fires after Next.js has already
    // rendered the destination and overrides the position applied above.
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    // With manual restoration, a reload or a return from another site is restored here.
    const entryType = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type;
    const initial = positions.get(entryKey());
    if ((entryType === "reload" || entryType === "back_forward") && initial !== undefined && !window.location.hash) {
      requestAnimationFrame(() => jumpTo(initial));
    }
    const persist = () => {
      try {
        sessionStorage.setItem(STORE_KEY, JSON.stringify([...positions].slice(-50)));
      } catch {}
    };
    document.addEventListener("click", onNavigationClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("scroll", rememberPosition, { passive: true });
    window.addEventListener("pagehide", persist);

    // Height changes alone do not cover a font swap or a loaded image. Those
    // events force a refresh, while the observer ignores an unchanged height.
    let lastHeight = 0;
    let refreshTimer = 0;
    let forced = false;
    const queueRefresh = (force = false) => {
      if (disposed) return;
      forced ||= force;
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        if (disposed) return;
        const height = document.body.scrollHeight;
        const changed = Math.abs(height - lastHeight) >= 2;
        lastHeight = height;
        if (!forced && !changed) return;
        forced = false;
        lenis?.resize();
        ScrollTrigger.refresh();
      }, 160);
    };
    const observer = new ResizeObserver(() => queueRefresh());
    observer.observe(document.body);
    const layoutReady = () => queueRefresh(true);
    const imageReady = (event: Event) => { if (event.target instanceof HTMLImageElement) layoutReady(); };
    document.fonts?.ready.then(layoutReady).catch(() => {});
    document.fonts?.addEventListener("loadingdone", layoutReady);
    document.addEventListener("load", imageReady, true);
    window.addEventListener("resize", layoutReady);

    return () => {
      disposed = true;
      preferences.forEach((query) => query.removeEventListener("change", onPrefChange));
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("click", onNavigationClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("scroll", rememberPosition);
      window.removeEventListener("pagehide", persist);
      window.history.scrollRestoration = previousRestoration;
      document.removeEventListener("visibilitychange", syncTicker);
      document.removeEventListener("load", imageReady, true);
      document.fonts?.removeEventListener("loadingdone", layoutReady);
      window.removeEventListener("resize", layoutReady);
      window.clearTimeout(refreshTimer);
      observer.disconnect();
      stop();
    };
  }, []);

  // Before paint: a link navigation to another page starts at the top, or at
  // its hash target below the sticky header. Back/Forward is left to the
  // browser and Next.js, which restore the previous position.
  useLayoutEffect(() => {
    committedPath = window.location.pathname;
    const navigation = pendingNavigation;
    pendingNavigation = null;
    const restore = pendingRestore;
    pendingRestore = null;
    let hashTarget: HTMLElement | null = null;
    if (restore !== null) {
      jumpTo(restore);
    } else if (navigation && navigation.path === window.location.pathname) {
      hashTarget = navigation.hash ? getHashTarget(navigation.hash) : null;
      jumpTo(hashTarget ? targetTop(hashTarget) : 0);
    }

    // Visitors who start scrolling keep control; hash re-alignment stops.
    let userScrolled = false;
    const markUser = () => { userScrolled = true; };
    const userEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    userEvents.forEach((type) => window.addEventListener(type, markUser, { passive: true, once: true }));
    const realign = () => {
      if (userScrolled) return;
      if (restore !== null) {
        // The page may have been shorter than the saved position at first paint.
        if (Math.abs(window.scrollY - restore) > 1) jumpTo(restore);
        return;
      }
      if (!navigation?.hash) return;
      hashTarget ??= getHashTarget(navigation.hash);
      if (hashTarget) jumpTo(targetTop(hashTarget));
    };

    // Pin spacers and late images can move a hash target, so align again after them.
    const frame = requestAnimationFrame(() => {
      lenis?.resize();
      lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
      ScrollTrigger.refresh();
      realign();
      if (hashTarget) {
        if (!hashTarget.hasAttribute("tabindex")) hashTarget.setAttribute("tabindex", "-1");
        hashTarget.focus({ preventScroll: true });
      }
    });
    const settle = window.setTimeout(() => {
      realign();
      restoring = false;
      rememberPosition();
    }, 600);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      restoring = false;
      userEvents.forEach((type) => window.removeEventListener(type, markUser));
    };
  }, [pathname]);

  return null;
}
