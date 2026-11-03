"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Mail, Menu, Phone, X } from "lucide-react";
import { mainNav, utilityNav } from "@/content/navigation";
import { contact } from "@/content/company";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ArrowSwap } from "./ui";
import { SiccotelLogo } from "./SiccotelLogo";

/**
 * Always opaque, on every route and over every section. The utility row scrolls
 * away through the negative sticky offset, so no script decides the header's
 * appearance and page content can never show through it.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    // preventScroll: the toggle lives in the sticky header, and html's scroll-padding-top
    // would otherwise make the browser scroll the page up to "reveal" it.
    if (returnFocus) toggleRef.current?.focus({ preventScroll: true });
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
    // Lock both: iOS Safari ignores body overflow for touch scrolling unless html is locked too.
    const root = document.documentElement;
    const { overflow } = document.body.style;
    const rootOverflow = root.style.overflow;
    const openedAt = { y: window.scrollY, path: window.location.pathname };
    document.body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    panel?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });

    let tween: gsap.core.Timeline | null = null;
    if (panel && !prefersReducedMotion()) {
      tween = gsap
        .timeline()
        .fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" })
        .fromTo(
          panel.querySelectorAll("[data-menu-item]"),
          // Opacity, not autoAlpha: visibility:hidden would drop focus from the first link.
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: "power2.out" },
          0.04,
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
          last.focus({ preventScroll: true });
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus({ preventScroll: true });
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
      root.style.overflow = rootOverflow;
      // Focus moving onto the sticky toggle can scroll the locked page; put it back unless the route changed.
      if (window.location.pathname === openedAt.path && Math.abs(window.scrollY - openedAt.y) > 1) {
        window.scrollTo({ top: openedAt.y, left: 0, behavior: "instant" });
      }
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header sticky z-50 border-b border-line bg-white text-ink shadow-[0_8px_24px_-20px_rgba(22,24,27,0.4)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="site-utility hidden border-b border-line bg-stone lg:block">
        <div className="container-site flex h-full items-center justify-between gap-6 text-[0.8125rem]">
          <ul className="flex items-center gap-5 text-muted">
            <li>
              <a href={contact.phone.href} className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-ink">
                <Phone aria-hidden className="size-3.5" /> {contact.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-ink">
                <Mail aria-hidden className="size-3.5" /> {contact.email}
              </a>
            </li>
          </ul>
          <nav aria-label="Customer services">
            <ul className="flex items-center gap-5 font-semibold text-ink">
              {utilityNav.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors duration-200 hover:text-accent">
                      {item.label}
                      <ArrowUpRight aria-hidden className="size-3.5" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link href={item.href} className="inline-flex items-center transition-colors duration-200 hover:text-accent">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" className="flex min-h-11 shrink-0 items-center" aria-label="Siccotel — home">
          <SiccotelLogo title="" className="block h-7 w-auto sm:h-8" />
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
                    className={`group relative inline-flex min-h-11 items-center px-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 xl:px-3 xl:text-[0.9375rem] ${
                      active ? "text-ink" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-2 bottom-2 h-[2px] origin-left bg-accent transition-transform duration-200 xl:inset-x-3 ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                      }`}
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
            className="group hidden min-h-11 items-center gap-2.5 rounded-[3px] bg-accent px-5 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-200 hover:bg-accent-hover sm:inline-flex"
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
        className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto overscroll-contain border-t border-line bg-white text-ink lg:hidden"
      >
        <nav aria-label="Mobile" className="container-site py-4">
          <ul className="border-t border-line">
            {mainNav.map((item) => (
              <li key={item.href} data-menu-item="" className="border-b border-line">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-14 items-center justify-between gap-4 font-display text-xl font-semibold tracking-[-0.02em] ${
                    isActive(item.href) ? "text-accent" : "text-ink"
                  }`}
                >
                  {item.label}
                  <ArrowRight aria-hidden className="size-5 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-5 grid grid-cols-2 gap-3" data-menu-item="" aria-label="Customer services">
            {utilityNav.map((item) => {
              const inner = (
                <>
                  <span className="flex items-center gap-1 font-semibold text-ink">
                    {item.label}
                    {item.external && <ArrowUpRight aria-hidden className="size-4" />}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-muted">{item.detail}</span>
                </>
              );
              const cls = "block h-full min-h-20 rounded-[4px] border border-line bg-stone p-3.5";
              return (
                <li key={item.href}>
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={cls}>
                      {inner}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <Link href={item.href} onClick={() => setOpen(false)} className={cls}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-5 grid gap-3" data-menu-item="">
            <Link
              href="/contact#enquiry"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] bg-accent px-5 font-semibold text-white"
            >
              Partner With Us <ArrowRight aria-hidden className="size-4" />
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
