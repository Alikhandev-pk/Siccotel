"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileText, Image as ImageIcon, LayoutDashboard, LogOut, Menu, Newspaper, Package, Settings, SlidersHorizontal, X } from "lucide-react";
import { signOut } from "@/app/admin/actions";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const content: Item[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/banners", label: "Banners", icon: SlidersHorizontal },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/media", label: "Media library", icon: ImageIcon },
];

/** Sidebar on desktop, a collapsible menu on phones and tablets. */
export function AdminNav({ brand, pages, email }: { brand: React.ReactNode; pages: { href: string; label: string }[]; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));
  const groups: { label: string; items: Item[] }[] = [
    { label: "Content", items: content },
    { label: "Pages", items: pages.map((p) => ({ ...p, icon: FileText })) },
    { label: "Settings", items: [{ href: "/admin/content/settings", label: "Site settings", icon: Settings }] },
  ];
  const current = groups.flatMap((g) => g.items).find((i) => isActive(i.href));

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6 lg:pt-7 lg:pb-3">
        {brand}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="admin-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 max-w-[60%] items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold lg:hidden"
        >
          {open ? <X className="size-4 shrink-0" /> : <Menu className="size-4 shrink-0" />}
          <span className="truncate">{current?.label ?? "Menu"}</span>
        </button>
      </div>
      <nav id="admin-nav" aria-label="Admin" className={`${open ? "block" : "hidden"} px-3 pb-4 text-sm lg:block`}>
        {groups.map((g) => (
          <div key={g.label} className="mt-4 first:mt-1 lg:mt-6 lg:first:mt-2">
            <p className="px-3 pb-1.5 text-[0.68rem] font-semibold tracking-[0.12em] text-muted uppercase">{g.label}</p>
            <ul className="space-y-0.5">
              {g.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`relative flex items-center gap-2.5 rounded-md px-3 py-2 font-medium transition-colors ${active ? "bg-[#2a1214] text-white before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-[#ff3b3b]" : "text-ink-soft hover:bg-stone hover:text-ink"}`}
                    >
                      <Icon className={`size-4 ${active ? "text-[#ff5c5c]" : "text-muted"}`} /> {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="mt-5 border-t border-line pt-4">
          <p className="truncate px-3 text-xs text-muted" title={email}>{email}</p>
          <form action={signOut} className="mt-1">
            <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left font-medium text-ink-soft hover:bg-stone hover:text-ink">
              <LogOut className="size-4 text-muted" /> Sign out
            </button>
          </form>
        </div>
      </nav>
    </>
  );
}
