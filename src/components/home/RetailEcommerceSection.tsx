import Image from "next/image";
import { ArrowUpRight, Check, LifeBuoy, ShoppingBag, Store, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { enquiryHref, utilityNav } from "@/content/navigation";
import { retail } from "@/content/retail";
import type { HomeDoc, Logo, ServicesDoc, SettingsDoc } from "@/lib/cms/types";
import { ButtonLink, SectionHeader, TextLink } from "../ui";
import { ClientsReveal } from "./ClientsReveal";
import { GridReveal } from "../animations/GridReveal";
import { Reveal } from "../animations/Reveal";

const siccoCare = utilityNav[0];

const supportLinksFor = (links: SettingsDoc["links"]) => [
  { label: "Android warranty check (Carlcare)", href: links.carlcareWarranty },
  { label: "Apple coverage check", href: links.appleCoverage },
  { label: "PTA device check (DIRBS)", href: links.ptaDirbs },
];

function PathCard({ id, icon: Icon, title, text, children, action }: { id: string; icon: LucideIcon; title: string; text: ReactNode; children: ReactNode; action: ReactNode }) {
  return (
    <article aria-labelledby={id} className="flex h-full flex-col rounded-[8px] border border-line bg-white p-4 md:p-5 lg:p-6">
      <div className="flex items-center gap-2.5 md:block">
        <Icon aria-hidden className="size-5 shrink-0 text-accent md:size-6" strokeWidth={1.75} />
        <h3 id={id} className="t-h3 text-ink md:mt-4">{title}</h3>
      </div>
      <p className="mt-2 text-base leading-relaxed text-ink-soft md:text-[0.9375rem]">{text}</p>
      {children}
      <div className="mt-auto pt-3 md:pt-6">{action}</div>
    </article>
  );
}

function Points({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`mt-3 space-y-1.5 md:mt-4 md:space-y-2 ${className}`}>
      {items.map((point) => (
        <li key={point} className="flex gap-2 text-[0.9375rem] leading-relaxed text-muted md:text-sm">
          <Check aria-hidden className="mt-1 size-3.5 shrink-0 text-accent" strokeWidth={2.5} />
          {point}
        </li>
      ))}
    </ul>
  );
}

/** Where each kind of visitor goes next: customers to the store or support, businesses to an enquiry. */
/** A light text link on phones and the outlined full-width button from md up; the store keeps its red button. */
function SecondaryAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <>
      <TextLink href={href} className="min-h-11 md:hidden">{children}</TextLink>
      <div className="hidden md:block"><ButtonLink href={href} variant="secondary" className="w-full">{children}</ButtonLink></div>
    </>
  );
}

export function RetailEcommerceSection({ copy, clients, afterSales, links }: { copy: HomeDoc["retail"]; clients: Logo[]; afterSales: ServicesDoc["afterSales"]; links: SettingsDoc["links"] }) {
  const { physical, online } = retail;
  const supportLinks = supportLinksFor(links);

  return (
    <section id="retail-ecommerce" aria-labelledby="retail-ecommerce-title" className="section-space">
      <div className="container-site">
        <Reveal>
          <SectionHeader
            eyebrow={copy.eyebrow}
            title={<span id="retail-ecommerce-title">{copy.title}</span>}
            intro={
              <>
                <span className="sm:hidden">{copy.introShort}</span>
                <span className="hidden sm:inline">{copy.intro}</span>
              </>
            }
          />
        </Reveal>

        <ul className="mt-6 grid gap-3 sm:mt-9 md:grid-cols-3 md:gap-5 lg:mt-11 lg:gap-6" data-anim="stagger">
          <li>
            <PathCard
              id="path-store"
              icon={ShoppingBag}
              title={online.title}
              text={online.tagline}
              action={<ButtonLink href={links.siccoStore} external className="w-full">Visit Sicco Store</ButtonLink>}
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
              action={<SecondaryAction href={siccoCare.href}>Go to SiccoCare</SecondaryAction>}
            >
              <ul className="mt-2 md:mt-4 md:space-y-1">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-11 items-center gap-1 text-[0.9375rem] font-medium text-ink transition-colors duration-200 hover:text-accent md:min-h-9 md:text-sm">
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
              action={<SecondaryAction href={enquiryHref("dealer")}>Become a dealer</SecondaryAction>}
            >
              <Points items={physical.points} className="hidden md:block" />
            </PathCard>
          </li>
        </ul>

        <div className="mt-7 border-t border-line pt-6 lg:mt-10 lg:pt-7">
          <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">{copy.clientsTitle}</h3>
          <ClientsReveal total={clients.length}>
          {/* Flex rather than grid so an incomplete last row stays centred at 3, 4 and 5 columns. */}
          <GridReveal className="mt-4 flex flex-wrap justify-center gap-2 lg:mt-5 lg:gap-3">
            {clients.map((client) => {
              const tile = "flex h-12 items-center justify-center rounded-[6px] border border-line bg-white px-2.5 sm:h-16 lg:h-[4.5rem] lg:px-3";
              const logo = (
                <Image
                  src={client.logo.src}
                  width={client.logo.width}
                  height={client.logo.height}
                  alt={client.name}
                  sizes="140px"
                  unoptimized={client.serveAsIs}
                  className="max-h-8 w-auto max-w-full object-contain sm:max-h-10"
                />
              );
              return (
                <li key={client.name} className="basis-[calc((100%-1rem)/3)] sm:basis-[calc((100%-1.5rem)/4)] lg:basis-[calc((100%-3rem)/5)]">
                  {client.url ? (
                    <a
                      href={client.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={client.name}
                      className={`${tile} transition-[border-color,box-shadow] duration-200 hover:border-ink/25 hover:shadow-[0_10px_24px_-18px_rgba(22,24,27,0.5)]`}
                    >
                      {logo}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <div className={tile}>{logo}</div>
                  )}
                </li>
              );
            })}
          </GridReveal>
          </ClientsReveal>
        </div>
      </div>
    </section>
  );
}
