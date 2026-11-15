"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION } from "./motion";

/**
 * The sticky header slides away while the visitor scrolls down and returns on
 * any scroll up, keyboard focus, or near the top. `data-scrolled` (a deeper
 * shadow, globals.css) is set whenever the page is scrolled, motion or not.
 * The transform is cleared once the header is back, because a transformed
 * header would become the containing block of the fixed mobile menu.
 */
export function useHeaderAutoHide(ref: RefObject<HTMLElement | null>, lockedRef: RefObject<boolean>) {
  useGSAP(
    () => {
      const header = ref.current;
      if (!header) return;
      const onScroll = () => header.toggleAttribute("data-scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        let hidden = false;
        const setShown = (shown: boolean) => {
          if (hidden === !shown) return;
          hidden = !shown;
          gsap.to(header, {
            yPercent: shown ? 0 : -100,
            duration: shown ? 0.4 : 0.3,
            ease: shown ? "power3.out" : "power2.in",
            overwrite: true,
            onComplete: () => {
              if (shown) gsap.set(header, { clearProps: "transform" });
            },
          });
        };
        const trigger = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            if (lockedRef.current || self.scroll() < header.offsetHeight * 2) setShown(true);
            else setShown(self.direction !== 1);
          },
        });
        const reveal = () => setShown(true);
        header.addEventListener("focusin", reveal);
        return () => {
          trigger.kill();
          header.removeEventListener("focusin", reveal);
        };
      });

      return () => {
        mm.revert();
        window.removeEventListener("scroll", onScroll);
        header.removeAttribute("data-scrolled");
      };
    },
    { scope: ref },
  );
}
