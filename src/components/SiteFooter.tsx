import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { company, contact, externalLinks, social } from "@/content/company";
import { mainNav } from "@/content/navigation";
import { SocialIcon } from "./SocialIcon";
import { SiccotelLogo } from "./SiccotelLogo";

const related = [
  { label: "Sicco Store", href: externalLinks.siccoStore },
  { label: "Siccotel Telecom", href: externalLinks.siccotelTelecom },
  { label: "PTA device check (DIRBS)", href: externalLinks.ptaDirbs },
];

export function SiteFooter() {
  return (
    <footer className="on-dark border-t border-night-line bg-night text-white">
      <div className="container-site grid gap-9 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-14">
        <div className="lg:col-span-4">
          <SiccotelLogo tone="light" className="h-8 w-auto" />
          <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-night-muted">{company.shortDescription}</p>
          <ul className="mt-6 flex gap-2">
            {social.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-night-line text-white transition-colors hover:border-white/60"
                >
                  <SocialIcon name={s.icon} />
                  <span className="sr-only">Siccotel on {s.label} (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="lg:col-span-2">
          <h2 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">Company</h2>
          <ul className="mt-4 space-y-1">
            {[{ label: "Home", href: "/" }, ...mainNav].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-9 items-center text-[0.9375rem] text-white/90 hover:text-white hover:underline underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">Related</h2>
          <ul className="mt-4 space-y-1">
            {related.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1 text-[0.9375rem] text-white/90 hover:text-white hover:underline underline-offset-4"
                >
                  {item.label}
                  <ArrowUpRight aria-hidden className="size-3.5 text-night-muted" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h2 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">Contact</h2>
          <ul className="mt-4 space-y-4 text-[0.9375rem]">
            <li className="flex gap-3">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-on-dark" />
              <address className="not-italic leading-relaxed text-white/90">
                {contact.headOffice.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </li>
            <li className="flex gap-3">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-on-dark" />
              <a href={contact.phone.href} className="text-white/90 hover:text-white hover:underline underline-offset-4">
                {contact.phone.display}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-on-dark" />
              <a href={`mailto:${contact.email}`} className="text-white/90 hover:text-white hover:underline underline-offset-4">
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-night-line">
        <div className="container-site flex flex-col gap-2 py-6 text-sm text-night-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {company.legalName} All rights reserved.</p>
          <p>Distribution · Manufacturing · Retail — Karachi, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
