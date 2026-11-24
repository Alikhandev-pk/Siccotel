"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowUpRight, Mail, Menu, Phone, X } from "lucide-react";
import { headerNav, utilityNav as baseUtilityNav } from "@/content/navigation";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { useHeaderAutoHide } from "./animations/useHeaderAutoHide";
import { useMagnetic } from "./animations/useMagnetic";
import { ArrowSwap } from "./ui";
import { SiccotelLogo } from "./SiccotelLogo";

/**
 * Always opaque, on every route and over every section. The utility row scrolls
 * away through the negative sticky offset, so no script decides the header's
 * appearance and page content can never show through it.
 */
export type HeaderContact = { email: string; phoneDisplay: string; phoneHref: string; storeUrl: string };

const emptySubscribe = () => () => {};

export function SiteHeader({ contact }: { contact: HeaderContact }) {
  const utilityNav = baseUtilityNav.map((item) => (item.external ? { ...item, href: contact.storeUrl || item.href } : item));
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const portalCloseRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const partnerRef = useRef<HTMLAnchorElement>(null);
  const menuOpenRef = useRef(false);

  useHeaderAutoHide(headerRef, menuOpenRef);
  useMagnetic(partnerRef);

  const releaseScrollLock = useCallback(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    getLenis()?.start();
  }, []);

  const revealHeader = useCallback(() => {
    if (headerRef.current) {
      gsap.killTweensOf(headerRef.current);
      gsap.set(headerRef.current, { clearProps: "transform" });
    }
    window.dispatchEvent(new Event("siccotel:show-header"));
  }, []);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    menuOpenRef.current = false;
    releaseScrollLock();
    revealHeader();
    if (returnFocus) {
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, [releaseScrollLock, revealHeader]);

  // Close the menu on route changes during render
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (open) {
      setOpen(false);
    }
  }

  useEffect(() => {
    revealHeader();
  }, [pathname, revealHeader]);

  // Close the menu on browser navigation (back/forward or hash changes)
  useEffect(() => {
    const handlePopOrHash = () => {
      close(false);
    };
    window.addEventListener("popstate", handlePopOrHash);
    window.addEventListener("hashchange", handlePopOrHash);
    return () => {
      window.removeEventListener("popstate", handlePopOrHash);
      window.removeEventListener("hashchange", handlePopOrHash);
    };
  }, [close]);

  // Lets page-level fixed elements (the homepage WhatsApp button) step aside while the menu is open.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-menu-open", open);
    return () => document.documentElement.removeAttribute("data-menu-open");
  }, [open]);

  useEffect(() => {
    menuOpenRef.current = open;
    if (!open) {
      releaseScrollLock();
      revealHeader();
      return;
    }

    const panel = panelRef.current;
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    portalCloseRef.current?.focus({ preventScroll: true });

    let tween: gsap.core.Timeline | null = null;
    if (panel && !prefersReducedMotion()) {
      tween = gsap
        .timeline()
        .fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" })
        .fromTo(
          panel.querySelectorAll("[data-menu-item]"),
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.03, ease: "power2.out" },
          0.04,
        );
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
      if (e.key === "Tab" && panel) {
        const focusables = panel.querySelectorAll<HTMLElement>("a, button, input, [tabindex]:not([tabindex='-1'])");
        if (focusables.length === 0) return;
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

    const onResize = () => {
      if (window.innerWidth >= 1024) close(false);
    };

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    return () => {
      tween?.kill();
      if (panel) gsap.set([panel, ...panel.querySelectorAll("[data-menu-item]")], { clearProps: "opacity,transform" });
      releaseScrollLock();
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close, releaseScrollLock, revealHeader]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      close(false);
      return;
    }

    const [targetPath, targetHash] = href.split("#");
    const isSamePage = targetPath === "" || targetPath === pathname;

    if (isSamePage) {
      if (targetHash) {
        e.preventDefault();
        window.history.pushState(null, "", href);
        close(false);

        requestAnimationFrame(() => {
          const el = document.getElementById(targetHash);
          if (el) {
            const headerEl = headerRef.current;
            const headerH = headerEl ? headerEl.offsetHeight : 64;
            const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || (headerH + 24);
            const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - scrollPadding);
            getLenis()?.scrollTo(top, { immediate: false });
            window.scrollTo({ top, behavior: "smooth" });
            el.setAttribute("tabindex", "-1");
            el.focus({ preventScroll: true });
          }
          revealHeader();
        });
      } else {
        e.preventDefault();
        if (window.location.hash) {
          window.history.pushState(null, "", href);
        }
        close(false);

        requestAnimationFrame(() => {
          getLenis()?.scrollTo(0, { immediate: true, force: true });
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          ScrollTrigger.getScrollFunc(window)(0);
          revealHeader();
        });
      }
    } else {
      close(false);
      revealHeader();
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header ref={headerRef} className="site-header sticky z-50 border-b border-line bg-white text-ink shadow-[0_8px_24px_-20px_rgba(22,24,27,0.4)]">
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
                {contact.phoneDisplay && (
                  <a href={contact.phoneHref} className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-ink">
                    <Phone aria-hidden className="size-3.5" /> {contact.phoneDisplay}
                  </a>
                )}
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

        {/* Spacing tightens from lg to xl so seven labels and the button fit at 1024px. */}
        <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-6 lg:gap-4 xl:gap-6">
          <Link href="/" onClick={(e) => handleLinkClick(e, "/")} className="flex min-h-11 shrink-0 items-center" aria-label="Siccotel — home">
            <SiccotelLogo title="" className="block h-7 w-auto sm:h-8" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center xl:gap-1">
              {headerNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative inline-flex min-h-11 items-center px-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 xl:px-3 xl:text-[0.9375rem] ${
                        active ? "text-ink" : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className={`absolute inset-x-1.5 bottom-2 h-[2px] origin-left bg-accent transition-transform duration-200 xl:inset-x-3 ${
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
              ref={partnerRef}
              href="/contact#enquiry"
              className="group hidden min-h-11 items-center gap-2.5 rounded-[3px] bg-accent px-5 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-200 hover:bg-accent-hover sm:inline-flex"
            >
              Partner With Us
              <ArrowSwap />
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-sm text-ink hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => (open ? close(true) : setOpen(true))}
            >
              {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Render mobile menu as a body-level portal so it is never trapped by the animated header's CSS transform */}
      {mounted && open && createPortal(
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          data-lenis-prevent=""
          className="fixed inset-0 z-[100] flex flex-col bg-white text-ink lg:hidden"
        >
          {/* Dedicated top bar matching site header height, with logo and accessible Close (X) button */}
          <div className="container-site flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line bg-white">
            <Link
              href="/"
              onClick={(e) => handleLinkClick(e, "/")}
              className="flex min-h-11 shrink-0 items-center"
              aria-label="Siccotel — home"
            >
              <SiccotelLogo title="" className="block h-7 w-auto sm:h-8" />
            </Link>
            <button
              ref={portalCloseRef}
              type="button"
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-sm text-ink hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close menu"
              onClick={() => close(true)}
            >
              <X aria-hidden className="size-6" />
            </button>
          </div>

          {/* Scrollable navigation list */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <nav aria-label="Mobile" className="container-site pb-8 pt-2">
              <ul>
                {headerNav.map((item) => (
                  <li key={item.href} data-menu-item="" className="border-b border-line">
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      onClick={(e) => handleLinkClick(e, item.href)}
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
                      <span className="mt-1 block text-[0.8125rem] leading-snug text-muted">{item.detail}</span>
                    </>
                  );
                  const cls = "block h-full min-h-20 rounded-[4px] border border-line bg-stone p-3.5";
                  return (
                    <li key={item.href}>
                      {item.external ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => close(false)} className={cls}>
                          {inner}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <Link href={item.href} onClick={(e) => handleLinkClick(e, item.href)} className={cls}>
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
                  onClick={(e) => handleLinkClick(e, "/contact#enquiry")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] bg-accent px-5 font-semibold text-white"
                >
                  Partner With Us <ArrowRight aria-hidden className="size-4" />
                </Link>
                <a
                  href={`mailto:${contact.email}`}
                  onClick={() => close(false)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] border border-ink/15 px-5 font-semibold text-ink"
                >
                  <Mail aria-hidden className="size-4" /> {contact.email}
                </a>
              </div>
            </nav>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
