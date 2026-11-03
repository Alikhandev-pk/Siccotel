import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { company, contact, externalLinks, social } from "@/content/company";
import { mainNav, utilityNav } from "@/content/navigation";
import { SocialIcon } from "./SocialIcon";
import { SiccotelLogo } from "./SiccotelLogo";

const related = [
  { label: "Sicco Store", href: externalLinks.siccoStore },
  { label: "Siccotel Telecom", href: externalLinks.siccotelTelecom },
  { label: "PTA device check", href: externalLinks.ptaDirbs },
];

export function SiteFooter() {
  return (
    <footer className="on-dark border-t border-night-line bg-night text-white">
      <div className="container-site grid grid-cols-2 gap-x-4 gap-y-6 py-8 sm:gap-9 sm:py-12 lg:grid-cols-12 lg:gap-8 lg:py-14">
        <div className="col-span-2 lg:col-span-4">
          <SiccotelLogo tone="light" className="h-8 w-auto" />
          <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-night-muted sm:mt-5">{company.shortDescription}</p>
          <ul className="mt-3 flex gap-2 sm:mt-6">
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
                <Link href={item.href} className="inline-flex min-h-11 items-center text-[0.9375rem] text-white/90 hover:text-white hover:underline underline-offset-4 sm:min-h-9">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">Related</h2>
          <ul className="mt-4 space-y-1">
            <li>
              <Link href={utilityNav[0].href} className="inline-flex min-h-11 items-center text-[0.9375rem] text-white/90 hover:text-white hover:underline underline-offset-4 sm:min-h-9">
                {utilityNav[0].label}
              </Link>
            </li>
            {related.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1 text-[0.9375rem] text-white/90 hover:text-white hover:underline underline-offset-4 sm:min-h-9"
                >
                  {item.label}
                  <ArrowUpRight aria-hidden className="size-3.5 text-night-muted" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 lg:col-span-4">
          <h2 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">Contact</h2>
          <ul className="mt-3 space-y-2 text-[0.9375rem] sm:mt-4 sm:space-y-4">
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
            <li className="flex items-center gap-3 sm:items-start">
              <Phone aria-hidden className="size-4 shrink-0 text-accent-on-dark sm:mt-0.5" />
              <a href={contact.phone.href} className="inline-flex min-h-11 items-center text-white/90 hover:text-white hover:underline underline-offset-4 sm:min-h-0">
                {contact.phone.display}
              </a>
            </li>
            <li className="flex items-center gap-3 sm:items-start">
              <Mail aria-hidden className="size-4 shrink-0 text-accent-on-dark sm:mt-0.5" />
              <a href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center text-white/90 hover:text-white hover:underline underline-offset-4 sm:min-h-0">
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-night-line">
        <div className="container-site flex flex-col gap-1 py-4 text-sm text-night-muted sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:py-6">
          <p>© {company.legalName} All rights reserved.</p>
          <p>Distribution · Manufacturing · Retail — Karachi, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
