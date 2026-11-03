import Image from "next/image";
import { ArrowUpRight, Check, LifeBuoy, ShoppingBag, Store, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { afterSales } from "@/content/business";
import { externalLinks } from "@/content/company";
import { enquiryHref, utilityNav } from "@/content/navigation";
import { ecommerceClients, retail } from "@/content/retail";
import { ButtonLink, SectionHeader } from "../ui";

const siccoCare = utilityNav[0];

const supportLinks = [
  { label: "Android warranty check (Carlcare)", href: externalLinks.carlcareWarranty },
  { label: "Apple coverage check", href: externalLinks.appleCoverage },
  { label: "PTA device check (DIRBS)", href: externalLinks.ptaDirbs },
];

function PathCard({ id, icon: Icon, title, text, children, action }: { id: string; icon: LucideIcon; title: string; text: ReactNode; children: ReactNode; action: ReactNode }) {
  return (
    <article aria-labelledby={id} className="flex h-full flex-col rounded-[8px] border border-line bg-white p-4 md:p-5 lg:p-6">
      <div className="flex items-center gap-2.5 md:block">
        <Icon aria-hidden className="size-5 shrink-0 text-accent md:size-6" strokeWidth={1.75} />
        <h3 id={id} className="t-h3 text-ink md:mt-4">{title}</h3>
      </div>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{text}</p>
      {children}
      <div className="mt-auto pt-3 md:pt-6">{action}</div>
    </article>
  );
}

function Points({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`mt-3 space-y-1.5 md:mt-4 md:space-y-2 ${className}`}>
      {items.map((point) => (
        <li key={point} className="flex gap-2 text-sm leading-relaxed text-muted">
          <Check aria-hidden className="mt-1 size-3.5 shrink-0 text-accent" strokeWidth={2.5} />
          {point}
        </li>
      ))}
    </ul>
  );
}

/** Where each kind of visitor goes next: customers to the store or support, businesses to an enquiry. */
export function RetailEcommerceSection() {
  const { physical, online } = retail;

  return (
    <section id="retail-ecommerce" aria-labelledby="retail-ecommerce-title" className="section-space bg-white">
      <div className="container-site">
        <SectionHeader
          eyebrow="Retail & e-commerce"
          title={<span id="retail-ecommerce-title">Shop, get support or become a partner.</span>}
          intro={
            <>
              <span className="sm:hidden">{retail.introShort}</span>
              <span className="hidden sm:inline">{retail.intro}</span>
            </>
          }
        />

        <ul className="mt-6 grid gap-3 sm:mt-9 md:grid-cols-3 md:gap-5 lg:mt-11 lg:gap-6" data-anim="stagger">
          <li>
            <PathCard
              id="path-store"
              icon={ShoppingBag}
              title={online.title}
              text={online.tagline}
              action={<ButtonLink href={online.url} external className="w-full">Visit Sicco Store</ButtonLink>}
            >
              <Points items={online.points} />
            </PathCard>
          </li>
          <li>
            <PathCard
              id="path-care"
              icon={LifeBuoy}
              title={siccoCare.label}
              text={
                <>
                  <span className="md:hidden">{afterSales.short}</span>
                  <span className="hidden md:inline">{afterSales.text}</span>
                </>
              }
              action={<ButtonLink href={siccoCare.href} variant="secondary" className="w-full">Go to SiccoCare</ButtonLink>}
            >
              <ul className="mt-2 md:mt-4 md:space-y-1">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink transition-colors duration-200 hover:text-accent md:min-h-9">
                      {link.label}
                      <ArrowUpRight aria-hidden className="size-3.5 text-muted transition-colors duration-200 group-hover:text-accent" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </PathCard>
          </li>
          <li>
            <PathCard
              id="path-dealer"
              icon={Store}
              title={physical.title}
              text={physical.summary}
              action={<ButtonLink href={enquiryHref("dealer")} variant="secondary" className="w-full">Become a dealer</ButtonLink>}
            >
              <Points items={physical.points} className="hidden md:block" />
            </PathCard>
          </li>
        </ul>

        <div className="mt-7 border-t border-line pt-6 lg:mt-14 lg:pt-8">
          <div className="grid gap-1.5 lg:grid-cols-12 lg:items-baseline lg:gap-10">
            <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink lg:col-span-4">E-commerce clients</h3>
            <p className="text-sm leading-relaxed text-muted lg:col-span-8">{retail.sourceNote}</p>
          </div>
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:mt-5 lg:grid-cols-6 lg:gap-3" data-anim="stagger">
            {ecommerceClients.map((client) => (
              <li key={client.name}>
                <a
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${client.name}: ${client.sector}`}
                  className="flex h-12 items-center justify-center rounded-[6px] border border-line bg-white px-2.5 transition-[border-color,box-shadow] duration-200 hover:border-ink/25 hover:shadow-[0_10px_24px_-18px_rgba(22,24,27,0.5)] sm:h-16 lg:h-[4.5rem] lg:px-3"
                >
                  <Image src={client.logo} alt={client.name} sizes="140px" className="max-h-8 w-auto max-w-full object-contain sm:max-h-10" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
