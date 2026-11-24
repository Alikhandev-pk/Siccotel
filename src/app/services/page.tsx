import Image from "next/image";
import { Check, ShieldCheck, Smartphone } from "lucide-react";
import { homepageClients } from "@/content/retail";
import { enquiryHref, type EnquiryType } from "@/content/navigation";
import { fillProps, imageProps } from "@/lib/cms/image";
import { getDoc, getSettings } from "@/lib/cms/public";
import type { ServiceActivity, SettingsDoc } from "@/lib/cms/types";
import { PageHero } from "@/components/sections";
import { HomeEnquiry } from "@/components/home/HomeEnquiry";
import { ButtonLink, Reveal, TextLink } from "@/components/ui";
import { HeadingWords } from "@/components/HeadingWords";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Siccotel’s services: nationwide smartphone distribution for global brands, local device assembly through Siccotel Telecom, retail and e-commerce, and SiccoCare after-sales support.",
  path: "/services",
});

/** Product shots and logo artwork are shown whole; photographs fill the frame. */
const containIds = new Set(["manufacturing", "retail"]);
const enquiryFor: Record<string, EnquiryType> = { distribution: "brand", manufacturing: "manufacturing", retail: "dealer" };

function ActivitySection({ activity, index, links }: { activity: ServiceActivity; index: number; links: SettingsDoc["links"] }) {
  const visual = { ...activity.photo, contain: containIds.has(activity.id) };
  const reversed = index % 2 === 1;
  return (
    <section
      id={activity.id}
      aria-labelledby={`${activity.id}-title`}
      className="section-space"
    >
      <div className="container-site grid items-start gap-7 sm:gap-12 lg:grid-cols-12 lg:gap-8">
        <div className={`lg:col-span-6 ${reversed ? "lg:order-2 lg:col-start-7" : ""}`}>
          <p className="font-display text-sm font-semibold text-muted tabular-nums">0{index + 1}</p>
          <p className="eyebrow mt-2 mb-3 sm:mt-4 sm:mb-4">{activity.kicker}</p>
          <h2 id={`${activity.id}-title`} className="text-[1.75rem] leading-[1.12] font-semibold sm:text-[2.75rem] sm:leading-[1.08]">
            <HeadingWords>{activity.title}</HeadingWords>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-soft sm:mt-5 sm:text-lg">{activity.summary}</p>
          <p className="mt-4 rounded-[6px] border border-line bg-white px-3 py-2 text-[0.9375rem] sm:mt-6 sm:inline-flex sm:rounded-full sm:px-4 sm:py-1.5 sm:text-sm">
            <span className="font-semibold">Who it’s for:</span>&nbsp;
            <span className="text-muted">{activity.audience}</span>
          </p>
          <ul className="mt-5 space-y-2.5 sm:mt-8 sm:space-y-3">
            {activity.points.map((pt) => (
              <li key={pt} className="flex gap-3 leading-relaxed text-ink-soft">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                {pt}
              </li>
            ))}
          </ul>
          {activity.id === "retail" && (
            <div className="mt-6 border-t border-line/60 pt-5 sm:mt-8 sm:pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                E-commerce &amp; corporate clients, as listed by Siccotel
              </p>
              <div className="flex flex-wrap gap-2">
                {homepageClients.map((partner) => (
                  partner.url ? (
                    <a
                      key={partner.name}
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent sm:min-h-0 sm:py-1 sm:text-xs"
                    >
                      <span>{partner.name}</span>
                      {partner.sector && <span className="hidden text-[0.6875rem] text-muted sm:inline">{partner.sector}</span>}
                    </a>
                  ) : (
                    <span
                      key={partner.name}
                      className="inline-flex min-h-11 items-center rounded-full border border-line bg-white px-3 text-sm font-medium text-ink sm:min-h-0 sm:py-1 sm:text-xs"
                    >
                      {partner.name}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
            {activity.cta && <ButtonLink href={enquiryHref(enquiryFor[activity.id] ?? "general")}>{activity.cta}</ButtonLink>}
            {activity.id === "manufacturing" && (
              <ButtonLink href="/assembly" variant="secondary">
                Assembly overview
              </ButtonLink>
            )}
            {activity.id === "retail" && (
              <ButtonLink href={links.siccoStore} variant="secondary" external>
                Visit Sicco Store
              </ButtonLink>
            )}
          </div>
        </div>
        <Reveal className={`lg:col-span-5 ${reversed ? "lg:order-1" : "lg:col-start-8"}`}>
          <figure>
            {activity.id === "retail" ? (
              <div className="rounded-[4px] border border-line bg-white p-3.5 sm:p-5">
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5">
                  {homepageClients.map((client) => {
                    const tile =
                      "flex h-12 items-center justify-center rounded-[6px] border border-line/80 bg-stone/20 p-2 transition-all duration-200 hover:border-ink/25 hover:bg-white hover:shadow-xs sm:h-13 sm:p-2.5";
                    const logo = (
                      <Image
                        src={client.logo}
                        alt={client.name}
                        sizes="120px"
                        unoptimized={client.serveAsIs}
                        className="max-h-7 w-auto max-w-full object-contain sm:max-h-8"
                      />
                    );
                    return (
                      <li key={client.name}>
                        {client.url ? (
                          <a
                            href={client.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={client.name}
                            className={tile}
                          >
                            {logo}
                            <span className="sr-only">{client.name} (opens in a new tab)</span>
                          </a>
                        ) : (
                          <div title={client.name} className={tile}>
                            {logo}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div
                className={`relative overflow-hidden rounded-[4px] border border-line ${
                  visual.contain ? "bg-white p-4 sm:p-10" : "aspect-[4/3]"
                }`}
              >
                {!visual.image?.src ? null : visual.contain ? (
                  // Sized before it loads (same box as the loaded image), so lazy loading
                  // cannot shift the page, e.g. under a /services#after-sales anchor.
                  <Image
                    {...imageProps(visual.image)}
                    alt={visual.image.alt}
                    placeholder="empty"
                    sizes="(min-width: 1024px) 470px, 100vw"
                    className="mx-auto h-auto [--max-h:260px] sm:[--max-h:420px]"
                    style={{
                      aspectRatio: `${visual.image.width} / ${visual.image.height}`,
                      width: `min(100%, ${visual.image.width}px, calc(var(--max-h) * ${visual.image.width / visual.image.height}))`,
                    }}
                  />
                ) : (
                  <Image {...fillProps(visual.image)} alt={visual.image.alt} sizes="(min-width: 1024px) 470px, 100vw" className="object-cover" />
                )}
              </div>
            )}
            <figcaption className="mt-2 text-sm text-muted">
              {activity.id === "retail" ? "E-commerce & corporate clients, as listed by Siccotel." : visual.caption}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

export default async function ServicesPage() {
  const [doc, settings] = await Promise.all([getDoc("services"), getSettings()]);
  const { afterSales } = doc;
  const externalLinks = settings.links;
  const businessActivities = doc.activities;
  return (
    <>
      <PageHero eyebrow={doc.hero.eyebrow} title={doc.hero.title} intro={doc.hero.intro}>
        <nav aria-label="On this page" className="mt-5 sm:mt-10">
          <ul className="flex flex-wrap gap-2">
            {businessActivities.map((a) => (
              <li key={a.id}>
                <a
                  href={`#${a.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/20"
                >
                  {a.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#after-sales"
                className="inline-flex min-h-11 items-center rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/20"
              >
                After-sales support
              </a>
            </li>
          </ul>
        </nav>
      </PageHero>

      {businessActivities.map((a, i) => (
        <ActivitySection key={a.id} activity={a} index={i} links={settings.links} />
      ))}

      <section id="after-sales" aria-labelledby="after-sales-title" className="section-space">
        <div className="container-site grid gap-6 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-4">{afterSales.eyebrow}</p>
            <h2 id="after-sales-title" className="text-[1.75rem] leading-[1.12] font-semibold sm:text-[2.75rem] sm:leading-[1.08]">
              <HeadingWords>{afterSales.title}</HeadingWords>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-soft sm:mt-5 sm:text-lg">{afterSales.text}</p>
            <div className="mt-4 sm:mt-8">
              <TextLink href={enquiryHref("general")} className="min-h-11">Contact customer support</TextLink>
            </div>
          </div>
          <ul className="grid gap-3 self-start sm:grid-cols-2 sm:gap-4 lg:col-span-5 lg:col-start-8 lg:grid-cols-1">
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
                  className="group flex h-full items-start gap-3 rounded-[4px] border border-line p-4 transition-colors hover:border-ink/40 hover:bg-stone sm:gap-4 sm:p-5"
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

      <HomeEnquiry title="How Can We Work Together?" email={settings.email} />
    </>
  );
}
