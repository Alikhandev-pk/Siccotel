"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, Phone, X } from "lucide-react";
import { mainNav } from "@/content/navigation";
import { contact } from "@/content/company";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { getLenis } from "./motion/SmoothScroll";
import { ArrowSwap } from "./ui";
import { SiccotelLogo } from "./SiccotelLogo";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The home page opens on a dark hero; the header sits over it until scrolled.
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    getLenis()?.stop();
    panel?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });

    let tween: gsap.core.Timeline | null = null;
    if (panel && !prefersReducedMotion()) {
      tween = gsap
        .timeline()
        .fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "expo.out" })
        .fromTo(
          panel.querySelectorAll("[data-menu-item]"),
          // Opacity, not autoAlpha: visibility:hidden would drop focus from the first link.
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.045, ease: "power3.out" },
          0.08,
        );
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panel) {
        // Keep keyboard focus within the toggle + open panel.
        const focusables = [toggleRef.current, ...panel.querySelectorAll<HTMLElement>("a,button")].filter(
          Boolean,
        ) as HTMLElement[];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onResize = () => window.innerWidth >= 1024 && close(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      tween?.kill();
      if (panel) gsap.set([panel, ...panel.querySelectorAll("[data-menu-item]")], { clearProps: "all" });
      document.body.style.overflow = overflow;
      getLenis()?.start();
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow,color] duration-200 ${
        overHero
          ? "border-b border-white/10 bg-transparent text-white"
          : open
            ? // Never add backdrop-filter here: it would make the header the containing block of the fixed menu panel.
              "border-b border-line bg-white text-ink"
            : "border-b border-line bg-white text-ink shadow-[0_8px_24px_-20px_rgba(22,24,27,0.4)]"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" className="relative shrink-0" aria-label="Siccotel — home">
          <SiccotelLogo
            title=""
            className={`block h-7 w-auto transition-opacity duration-200 sm:h-8 ${overHero ? "opacity-0" : "opacity-100"}`}
          />
          <SiccotelLogo
            title=""
            tone="light"
            className={`absolute inset-0 h-7 w-auto transition-opacity duration-200 sm:h-8 ${overHero ? "opacity-100" : "opacity-0"}`}
          />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative inline-flex min-h-11 items-center px-2 text-sm font-medium whitespace-nowrap transition-colors xl:px-3 xl:text-[0.9375rem] ${
                      active ? "" : overHero ? "text-white/75 hover:text-white" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-2 bottom-2 h-[2px] xl:inset-x-3 origin-left transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                      } ${overHero ? "bg-accent-on-dark" : "bg-accent"}`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact#enquiry"
            data-magnetic=""
            className="group hidden min-h-11 items-center gap-2.5 rounded-[3px] bg-accent px-5 text-sm font-semibold whitespace-nowrap text-white shadow-[0_6px_16px_-10px_rgba(200,0,11,0.7)] transition-colors duration-300 hover:bg-accent-hover sm:inline-flex"
          >
            Partner With Us
            <ArrowSwap />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-sm lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => (open ? close() : setOpen(true))}
          >
            {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        data-lenis-prevent=""
        className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto overscroll-contain border-t border-line bg-white text-ink lg:hidden"
      >
        <nav aria-label="Mobile" className="container-site py-6">
          <ul className="border-t border-line">
            {mainNav.map((item, i) => (
              <li key={item.href} data-menu-item="" className="border-b border-line">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-16 items-center justify-between gap-4 font-display text-2xl font-semibold tracking-[-0.02em] ${
                    isActive(item.href) ? "text-accent" : "text-ink"
                  }`}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-sans text-xs font-semibold text-muted tabular-nums">0{i + 1}</span>
                    {item.label}
                  </span>
                  <ArrowRight aria-hidden className="size-5 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3" data-menu-item="">
            <Link
              href="/contact#enquiry"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] bg-accent px-5 font-semibold text-white"
            >
              Partner With Siccotel <ArrowRight aria-hidden className="size-4" />
            </Link>
            <a
              href={contact.phone.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] border border-ink/15 px-5 font-semibold text-ink"
            >
              <Phone aria-hidden className="size-4" /> {contact.phone.display}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
