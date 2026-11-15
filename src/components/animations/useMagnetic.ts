"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DESKTOP_POINTER } from "./motion";

/** Pulls an element a little towards the pointer while it hovers (desktop pointers only). */
export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.3) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_POINTER, () => {
        const x = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
        const y = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const box = el.getBoundingClientRect();
          x((e.clientX - box.left - box.width / 2) * strength);
          y((e.clientY - box.top - box.height / 2) * strength);
        };
        const leave = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)", overwrite: true });
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
}
