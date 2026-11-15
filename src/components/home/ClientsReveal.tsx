"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * On phones the client grid opens with its first rows and a button for the rest
 * (all logos stay in the page). From the sm breakpoint every logo is shown.
 */
export function ClientsReveal({ total, children }: { total: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={rootRef} className={open ? "" : "clients-collapsed"}>
      {children}
      {total > CLIENTS_VISIBLE_ON_PHONES && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => {
            setOpen((o) => !o);
            // Closing from the bottom of the list keeps the visitor at the grid.
            if (open) requestAnimationFrame(() => rootRef.current?.scrollIntoView({ block: "start", behavior: "instant" }));
          }}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[6px] border border-line bg-white text-[0.9375rem] font-semibold text-ink sm:hidden"
        >
          {open ? "Show fewer clients" : `Show all ${total} clients`}
          <ChevronDown aria-hidden className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}

/** Four rows of three on a phone. Kept in step with `.clients-collapsed` in globals.css. */
export const CLIENTS_VISIBLE_ON_PHONES = 12;
