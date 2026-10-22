"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, hasFinePointer, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

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

const hashTarget = (hash: string) => {
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
      const target = hashTarget(url.hash);
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
      document.removeEventListener("visibilitychange", syncTicker);
      document.removeEventListener("load", imageReady, true);
      document.fonts?.removeEventListener("loadingdone", layoutReady);
      window.removeEventListener("resize", layoutReady);
      window.clearTimeout(refreshTimer);
      observer.disconnect();
      stop();
    };
  }, []);

  useEffect(() => {
    // Next.js owns route scrolling and history restoration. Synchronize Lenis
    // to that native position instead of forcing every navigation back to zero.
    const frame = requestAnimationFrame(() => {
      lenis?.resize();
      lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
