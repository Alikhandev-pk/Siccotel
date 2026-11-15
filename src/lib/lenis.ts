import type Lenis from "lenis";

/**
 * The page's Lenis instance, when smooth scrolling is running (see
 * components/animations/SmoothScroll). Code that moves the page programmatically
 * goes through it, so an in-flight smooth scroll never pulls the page back.
 */
let instance: Lenis | null = null;

export const getLenis = () => instance;
export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};
