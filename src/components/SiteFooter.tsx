import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { company } from "@/content/company";
import { getSettings } from "@/lib/cms/public";
import { mainNav, utilityNav } from "@/content/navigation";
import { contactEmails, whatsappContact } from "@/lib/contact-links";
import { SocialIcon, WhatsAppIcon } from "./SocialIcon";
import { SiccotelLogo } from "./SiccotelLogo";

export async function SiteFooter() {
  const settings = await getSettings();
  const contact = settings;
  const social = settings.social;
  const emails = contactEmails(settings);
  const whatsapp = whatsappContact(settings);
  const related = [
    { label: "Sicco Store", href: settings.links.siccoStore },
    { label: "Siccotel Telecom", href: settings.links.siccotelTelecom },
    { label: "PTA device check", href: settings.links.ptaDirbs },
  ];

  const allCompanyLinks = [{ label: "Home", href: "/" }, ...mainNav];
  const companyCol1 = allCompanyLinks.slice(0, 4);
  const companyCol2 = allCompanyLinks.slice(4);

  return (
    <footer className="site-footer on-dark bg-night text-white">
      <div className="container-site grid grid-cols-1 items-start gap-y-8 py-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-9 sm:py-10 lg:grid-cols-12 lg:gap-8 lg:py-11">
        {/* 1. Siccotel */}
        <div className="col-span-1 lg:col-span-3">
          <SiccotelLogo tone="light" className="h-7 w-auto sm:h-8" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-night-muted sm:mt-4 sm:text-[0.875rem]">
            {company.shortDescription}
          </p>
          <ul aria-label="Siccotel on social media" className="mt-4 flex gap-2">
            {social.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="inline-flex size-11 items-center justify-center rounded-lg border border-night-line text-white/90 transition-colors hover:border-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:size-9"
                >
                  <SocialIcon name={s.icon} className="size-4.5" />
                  <span className="sr-only">Siccotel on {s.label} (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Company */}
        <nav aria-label="Footer" className="col-span-1 lg:col-span-4">
          <h2 className="text-xs font-bold tracking-[0.14em] text-white uppercase">Company</h2>
          <div className="mt-3 grid grid-cols-2 gap-x-4 sm:gap-x-6">
            <ul className="space-y-1.5 sm:space-y-2">
              {companyCol1.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/80 transition-colors hover:text-white hover:underline underline-offset-4"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="space-y-1.5 sm:space-y-2">
              {companyCol2.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/80 transition-colors hover:text-white hover:underline underline-offset-4"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* 3. Related */}
        <div className="col-span-1 lg:col-span-2">
          <h2 className="text-xs font-bold tracking-[0.14em] text-white uppercase">Related</h2>
          <ul className="mt-3 space-y-1.5 sm:space-y-2">
            <li>
              <Link
                href={utilityNav[0].href}
                className="text-sm text-white/80 transition-colors hover:text-white hover:underline underline-offset-4"
              >
                {utilityNav[0].label}
              </Link>
            </li>
            {related.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/80 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  {item.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Contact */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          <h2 className="text-xs font-bold tracking-[0.14em] text-white uppercase">Contact</h2>
          <ul className="mt-3 space-y-2.5 text-sm sm:space-y-3">
            <li className="flex items-start gap-2.5">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2} />
              <address className="not-italic leading-relaxed text-white/80">
                {contact.headOffice.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </li>
            {emails.map((e) => (
              <li key={e} className="flex items-center gap-2.5">
                <Mail aria-hidden="true" className="size-4 shrink-0 text-brand" strokeWidth={2} />
                <a
                  href={`mailto:${e}`}
                  className="text-white/80 transition-colors [overflow-wrap:anywhere] hover:text-white hover:underline underline-offset-4"
                >
                  {e}
                </a>
              </li>
            ))}
            {whatsapp && (
              <li className="flex items-center gap-2.5">
                <WhatsAppIcon className="size-4 shrink-0 text-[#25d366]" />
                <a
                  href={whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  <span className="sr-only">WhatsApp: </span>
                  {whatsapp.display}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Slim copyright row */}
      <div className="border-t border-night-line">
        <div className="container-site flex flex-col gap-2 py-3.5 text-xs text-night-muted sm:flex-row sm:items-center sm:justify-between sm:py-4 sm:text-[0.8125rem]">
          <p>© 2026 {company.legalName} All rights reserved.</p>
          <p>Distribution · Manufacturing · Retail</p>
        </div>
      </div>
    </footer>
  );
}
