import Image, { type StaticImageData } from "next/image";
import { Check, ShieldCheck, Smartphone } from "lucide-react";
import partnershipCeremony from "@/assets/news/zte-nubia-partnership-ceremony.jpg";
import aura2 from "@/assets/products/hmd-aura-2.jpg";
import ecommerceClientsArt from "@/assets/company/ecommerce-clients.png";
import { afterSales, businessActivities, type BusinessActivity } from "@/content/business";
import { ecommerceClients } from "@/content/retail";
import { externalLinks } from "@/content/company";
import { enquiryHref } from "@/content/navigation";
import { EnquiryPaths, PageHero } from "@/components/sections";
import { ButtonLink, Reveal, TextLink } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Our Business",
  description:
    "Siccotel’s three connected businesses: nationwide smartphone distribution for global brands, local device assembly through Siccotel Telecom, and retail and e-commerce.",
  path: "/business",
});

const visuals: Record<string, { image: StaticImageData; alt: string; caption: string; contain?: boolean }> = {
  distribution: {
    image: partnershipCeremony,
    alt: "Siccotel and ZTE nubia teams at the partnership ceremony",
    caption: "Siccotel and ZTE nubia mark their distribution partnership.",
  },
  manufacturing: {
    image: aura2,
    alt: "HMD Aura 2 smartphone in teal",
    caption: "HMD Aura 2, featured by Siccotel Telecom.",
    contain: true,
  },
  retail: {
    image: ecommerceClientsArt,
    alt: "Logos of e-commerce clients: Ufone, Alfamall, Standard Chartered, Daraz, JazzCash, PriceOye, Faysal Bank, Meezan Bank, foodpanda, Bykea, easypaisa and Kistpay",
    caption: "E-commerce clients, as listed by Siccotel.",
    contain: true,
  },
};

function ActivitySection({ activity, index }: { activity: BusinessActivity; index: number }) {
  const visual = visuals[activity.id];
  const reversed = index % 2 === 1;
  return (
    <section
      id={activity.id}
      aria-labelledby={`${activity.id}-title`}
      className={`py-20 lg:py-28 ${index % 2 === 1 ? "bg-stone" : ""} border-b border-line`}
    >
      <div className="container-site grid items-start gap-12 lg:grid-cols-12 lg:gap-8">
        <div className={`lg:col-span-6 ${reversed ? "lg:order-2 lg:col-start-7" : ""}`}>
          <p className="font-display text-sm font-semibold text-muted tabular-nums">0{index + 1}</p>
          <p className="eyebrow mt-4 mb-4">{activity.kicker}</p>
          <h2 id={`${activity.id}-title`} className="text-[2rem] leading-[1.08] font-semibold sm:text-[2.75rem]">
            {activity.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{activity.summary}</p>
          <p className="mt-6 inline-flex rounded-full border border-line bg-white px-4 py-1.5 text-sm">
            <span className="font-semibold">Who it’s for:</span>&nbsp;
            <span className="text-muted">{activity.audience}</span>
          </p>
          <ul className="mt-8 space-y-3">
            {activity.points.map((pt) => (
              <li key={pt} className="flex gap-3 leading-relaxed text-ink-soft">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                {pt}
              </li>
            ))}
          </ul>
          {activity.id === "retail" && (
            <div className="mt-8 border-t border-line/60 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                E-commerce clients, as listed by Siccotel
              </p>
              <div className="flex flex-wrap gap-2">
                {ecommerceClients.map((partner) => (
                  <a
                    key={partner.name}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink hover:border-accent hover:text-accent transition-colors"
                  >
                    <span>{partner.name}</span>
                    <span className="text-[0.6875rem] text-muted">{partner.sector}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {activity.next.enquiry && <ButtonLink href={enquiryHref(activity.next.enquiry)}>{activity.next.label}</ButtonLink>}
            {activity.id === "manufacturing" && (
              <ButtonLink href="/manufacturing" variant="secondary">
                Manufacturing overview
              </ButtonLink>
            )}
            {activity.id === "retail" && (
              <ButtonLink href={externalLinks.siccoStore} variant="secondary" external>
                Visit Sicco Store
              </ButtonLink>
            )}
          </div>
        </div>
        <Reveal className={`lg:col-span-5 ${reversed ? "lg:order-1" : "lg:col-start-8"}`}>
          <figure>
            <div
              className={`relative overflow-hidden rounded-[4px] border border-line ${
                visual.contain ? "bg-white p-6 sm:p-10" : "aspect-[4/3]"
              }`}
            >
              {visual.contain ? (
                <Image src={visual.image} alt={visual.alt} sizes="(min-width: 1024px) 470px, 100vw" className="mx-auto h-auto max-h-[420px] w-auto" />
              ) : (
                <Image
                  src={visual.image}
                  alt={visual.alt}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 470px, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <figcaption className="mt-2 text-sm text-muted">{visual.caption}</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

export default function BusinessPage() {
  return (
    <>
      <PageHero
        eyebrow="Our business"
        title="One partner, from import to the final sale."
        intro="Siccotel combines distribution, local manufacturing and retail. Each part of the business serves a different audience — here is what we do and how to work with us."
      >
        <nav aria-label="On this page" className="mt-10">
          <ul className="flex flex-wrap gap-2">
            {businessActivities.map((a) => (
              <li key={a.id}>
                <a
                  href={`#${a.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-white px-4 text-sm font-semibold transition-colors hover:border-ink"
                >
                  {a.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#after-sales"
                className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-white px-4 text-sm font-semibold transition-colors hover:border-ink"
              >
                After-sales support
              </a>
            </li>
          </ul>
        </nav>
      </PageHero>

      {businessActivities.map((a, i) => (
        <ActivitySection key={a.id} activity={a} index={i} />
      ))}

      <section id="after-sales" aria-labelledby="after-sales-title" className="py-20 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-4">For customers</p>
            <h2 id="after-sales-title" className="text-[2rem] leading-[1.08] font-semibold sm:text-[2.75rem]">
              {afterSales.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{afterSales.text}</p>
            <div className="mt-8">
              <TextLink href={enquiryHref("general")}>Contact customer support</TextLink>
            </div>
          </div>
          <ul className="grid gap-4 self-start sm:grid-cols-2 lg:col-span-5 lg:col-start-8 lg:grid-cols-1">
            {[
              {
                icon: Smartphone,
                title: "Android devices",
                text: "Check your warranty status with Carlcare.",
                href: externalLinks.carlcareWarranty,
              },
              {
                icon: Smartphone,
                title: "iOS devices",
                text: "Check your Apple coverage.",
                href: externalLinks.appleCoverage,
              },
              {
                icon: ShieldCheck,
                title: "PTA device check",
                text: "Verify a device’s PTA status on DIRBS.",
                href: externalLinks.ptaDirbs,
              },
            ].map((item) => (
              <li key={item.title}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full items-start gap-4 rounded-[4px] border border-line p-5 transition-colors hover:border-ink/40 hover:bg-stone"
                >
                  <item.icon aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <span>
                    <span className="block font-semibold">{item.title}</span>
                    <span className="mt-1 block text-[0.9375rem] text-muted">{item.text}</span>
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <EnquiryPaths />
    </>
  );
}
