import Image from "next/image";
import { BadgeCheck, PackageCheck, ShieldCheck } from "lucide-react";
import telecomLogoLight from "@/assets/brand/siccotel-telecom-logo-light.png";
import mwcHmd from "@/assets/news/mwc-barcelona-2025-hmd-booth.jpg";
import hmdMeeting from "@/assets/news/hmd-global-meeting-china.jpg";
import assemblyFloor from "@/assets/company/siccotel-telecom-assembly-floor.jpg";
import aura2 from "@/assets/products/hmd-aura-2.jpg";
import b220 from "@/assets/products/zentality-b220.jpg";
import b3310 from "@/assets/products/zentality-b3310.jpg";
import { company, growthText, networkStats } from "@/content/company";
import { milestones } from "@/content/milestones";
import { news } from "@/content/news";
import { appleRelationship } from "@/content/partners";
import { enquiryHref } from "@/content/navigation";
import { EnquiryPaths, NewsCard, PartnerLogoGrid, StatsGrid } from "@/components/sections";
import { ButtonLink, SectionHeader, TextLink } from "@/components/ui";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { HeroVisual } from "@/components/home/HeroVisual";
import { HeroIntro } from "@/components/home/HeroIntro";
import { BusinessStory } from "@/components/home/BusinessStory";
import { RetailEcommerceSection } from "@/components/home/RetailEcommerceSection";
import { ReachMap } from "@/components/home/ReachMap";
import { JourneyRail } from "@/components/home/JourneyRail";
import { ManufacturingVisual } from "@/components/home/ManufacturingVisual";
import { pageMetadata } from "@/lib/site";

export const metadata = {
  ...pageMetadata({
    description:
      "Siccotel connects Pakistan with technology — distributing smartphones for global brands since 2001, assembling devices locally through Siccotel Telecom, and serving 4,500+ retailers nationwide.",
    path: "/",
  }),
  title: { absolute: "Siccotel — Connecting Pakistan Through Technology" },
};

const assurances = [
  { icon: BadgeCheck, label: "Authorized distribution" },
  { icon: ShieldCheck, label: "Official warranty" },
  { icon: PackageCheck, label: "Genuine stock" },
];

const chain = ["Component sourcing", "Assembly", "Nationwide distribution", "Service centres"];

/** Documentary photographs remain in flow so neither obscures its subjects. */
function GlanceComposition() {
  return (
    <div className="mt-8 grid grid-cols-[1.3fr_1fr] items-start gap-3 sm:gap-4">
      <figure>
        <div
          data-anim="image"
          className="relative overflow-hidden rounded-[6px] ring-1 ring-black/5"
        >
          <Image
            src={mwcHmd}
            alt="Siccotel representatives with device-industry executives at the HMD stand, MWC Barcelona 2025"
            placeholder="blur"
            sizes="(min-width: 1280px) 500px, (min-width: 1024px) 40vw, 80vw"
            className="h-auto w-full"
          />
        </div>
        <figcaption className="mt-3 text-xs leading-relaxed text-muted">MWC Barcelona, 2025</figcaption>
      </figure>
      <figure className="pt-6 sm:pt-8">
        <div
          data-anim="image"
          data-anim-delay="150"
          className="relative overflow-hidden rounded-[6px] ring-1 ring-black/5"
        >
          <Image
            src={hmdMeeting}
            alt="Siccotel and HMD Global representatives at HMD’s offices"
            placeholder="blur"
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 24vw, 48vw"
            className="h-auto w-full"
          />
        </div>
        <figcaption className="mt-3 text-xs leading-relaxed text-muted">Meeting with HMD Global</figcaption>
      </figure>
    </div>
  );
}

export default function HomePage() {
  const stat = (label: string) => networkStats.find((s) => s.label === label)?.value;

  return (
    <>
      <OrganizationJsonLd />
      <HeroIntro />

      {/* Hero */}
      <section
        aria-labelledby="hero-title"
        data-hero-root=""
        className="home-hero on-dark relative -mt-[var(--header-h)] bg-night text-white"
      >
        <div aria-hidden className="grid-texture pointer-events-none absolute inset-0" />
        {/*
          Two separate layout regions. Below lg they stack in source order —
          heading, description, CTAs, then the visual in its own sized box —
          so the visual can never sit on top of the text or buttons.
        */}
        <div className="hero-layout container-site relative">
          <div className="relative z-10 min-w-0">
            <p data-hero="eyebrow" className="eyebrow mb-6 text-[0.625rem] tracking-[0.1em] sm:mb-7 sm:text-xs sm:tracking-[0.16em]">
              Distribution · Manufacturing · Retail
            </p>
            <h1 id="hero-title" className="t-display hero-heading">
              <span className="hero-line">
                <span data-hero="line">Connecting Pakistan.</span>
              </span>
              <span className="hero-line">
                <span data-hero="line">
                  Powering Possibility<span className="text-brand">.</span>
                </span>
              </span>
            </h1>
            <p data-hero="lead" className="t-lead mt-6 max-w-[34rem] text-night-muted">
              Bringing global device brands to Pakistan through nationwide distribution, local assembly and retail.
              Connected by a commitment to quality and customer care.
            </p>
            <div data-hero="cta" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/contact#enquiry" variant="primary" magnetic>
                Partner With Us
              </ButtonLink>
              <ButtonLink href="/business" variant="ghost-dark" magnetic>
                Explore Our Business
              </ButtonLink>
            </div>
            <p data-hero="trust" className="mt-6 text-sm leading-relaxed text-night-muted">Established in Karachi, {company.foundedYear} <span aria-hidden className="px-1 text-accent-on-dark">·</span> Serving 4,500+ retailers nationwide</p>
          </div>
          <div data-hero="visual" className="min-w-0">
            <HeroVisual />
          </div>
        </div>
        <div className="relative border-t border-white/10">
          <dl className="container-site grid grid-cols-2 gap-y-4 py-6 text-sm sm:grid-cols-4">
            {[
              ["Established", `Karachi, ${company.foundedYear}`],
              ["Regional hubs & offices", stat("Regional hubs & offices")],
              ["Wholesalers", stat("Wholesalers in the network")],
              ["Retailers", stat("Retailers nationwide")],
            ].map(([label, value]) => (
              <div key={label} data-hero="stat" className="flex flex-col">
                <dt className="text-night-muted">{label}</dt>
                <dd className="order-first font-display text-base font-semibold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Company at a glance */}
      <section aria-labelledby="glance-title" className="section-space">
        <div className="container-site">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <p className="eyebrow mb-5">Company at a glance</p>
              <h2 id="glance-title" className="t-h2" data-anim="heading">
                One of Pakistan’s largest smartphone distributors.
              </h2>
              <GlanceComposition />
            </div>
            <div className="space-y-5 lg:col-span-5 lg:col-start-8 lg:pt-10">
              <p className="t-lead text-ink-soft">
                Founded in Karachi in {company.foundedYear}, Siccotel is a smartphone distributor, manufacturer and
                retailer with after-sales support in major cities across Pakistan. It is the official partner of leading
                global brands including Infinix, Samsung, itel, Nokia, realme, Tecno and ZTE nubia.
              </p>
              <p className="leading-relaxed text-muted">{growthText}</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-3 pt-2 text-[0.9375rem] font-semibold text-ink">
                {assurances.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-2">
                    <Icon aria-hidden className="size-5 text-accent" strokeWidth={1.75} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-line pt-8 lg:mt-12">
            <StatsGrid />
          </div>
        </div>
      </section>

      {/* Our business */}
      <BusinessStory />

      {/* Retail & E-commerce */}
      <RetailEcommerceSection />

      {/* Brand partners */}
      <section aria-labelledby="partners-title" className="section-space">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <div>
              <SectionHeader
                eyebrow="Brand partners"
                title={<span id="partners-title">Trusted by global device brands.</span>}
              />
              <p className="mt-6 leading-relaxed text-muted">
                Bringing the devices of leading global brands to Pakistan, backed by a nationwide distribution network.
              </p>
              <p className="mt-5 border-l-2 border-accent pl-4 text-[0.9375rem] leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">{appleRelationship.name}:</span> {appleRelationship.relationship}.
              </p>
              <div className="mt-8">
                <TextLink href="/partners">All partners</TextLink>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            <PartnerLogoGrid />
          </div>
        </div>
      </section>

      {/* Nationwide reach */}
      <section aria-labelledby="reach-title" className="section-space border-y border-line bg-stone">
        <div className="container-site">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <SectionHeader
              className="lg:col-span-7"
              eyebrow="Nationwide reach"
              title={<span id="reach-title">A network that reaches every region.</span>}
              intro="Siccotel’s sales and support network spans Pakistan’s north, central and south regions from its base in Karachi."
            />
            <dl className="grid grid-cols-2 gap-6 self-end lg:col-span-5" data-anim="stagger">
              {[
                [stat("Regional hubs & offices"), "Regional hubs & offices"],
                [stat("Retailers nationwide"), "Retailers served"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col border-t border-ink pt-4">
                  <dt className="mt-2 text-sm text-muted">{label}</dt>
                  <dd className="t-figure order-first text-[2.5rem]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-10 lg:mt-12">
            <ReachMap />
          </div>
          <p className="mt-10 max-w-3xl text-sm text-muted">
            After-sales service centres operate in major cities of Pakistan. Regional hub addresses are not published, so
            they are not shown individually.
          </p>
        </div>
      </section>

      {/* Manufacturing */}
      <section
        aria-labelledby="manufacturing-title"
        data-section-reveal=""
        className="on-dark relative overflow-hidden bg-night text-white"
      >
        <div aria-hidden className="grid-texture pointer-events-none absolute inset-0" />
        <div className="section-space container-site relative">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <Image src={telecomLogoLight} alt="Siccotel Telecom" className="h-14 w-auto" sizes="80px" />
              <SectionHeader
                className="mt-10"
                eyebrow="Manufacturing"
                title={<span id="manufacturing-title">Made in Pakistan, at Korangi Creek.</span>}
                intro="Siccotel Telecom (Pvt) Ltd is the group’s mobile phone assembly plant in Korangi Creek Industrial Park, Karachi — built to assemble devices for different brands under the Government’s “Made in Pakistan” initiative."
              />
              <div className="mt-12" data-anim="fade">
                <p className="t-figure text-[clamp(3.5rem,2.2rem+5vw,6rem)]">120,000</p>
                <p className="mt-3 flex items-center gap-3 text-night-muted">
                  <span aria-hidden className="h-[2px] w-10 bg-accent-on-dark" />
                  sq. ft. of operational space at KCIP, Karachi
                </p>
              </div>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/manufacturing" variant="light">
                  About our manufacturing
                </ButtonLink>
                <ButtonLink href={enquiryHref("manufacturing")} variant="ghost-dark">
                  Manufacturing enquiry
                </ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <figure>
                <div data-anim="image" className="relative aspect-[13/9] overflow-hidden rounded-[6px] border border-white/10">
                  <Image src={assemblyFloor} alt="Workers at mobile phone assembly lines, as photographed on the official Siccotel Telecom website" fill placeholder="blur" sizes="(min-width: 1024px) 580px, 100vw" className="object-cover" />
                </div>
                <figcaption className="mt-3 text-sm leading-relaxed text-night-muted">Inside Siccotel Telecom’s mobile phone assembly facility.</figcaption>
              </figure>
              <p className="mt-6 border-l-2 border-accent-on-dark pl-4 text-sm leading-relaxed text-night-muted">Local assembly. Connected to nationwide distribution and after-sales support.</p>
            </div>
          </div>

          <div className="mt-12 grid gap-10 border-t border-night-line pt-10 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <h3 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">End-to-end service delivery chain</h3>
              <ol className="mt-6 border-t border-night-line" data-anim="stagger">
                {chain.map((step, i) => (
                  <li key={step} className="flex items-baseline gap-5 border-b border-night-line py-5">
                    <span className="font-display text-sm text-accent-on-dark tabular-nums">0{i + 1}</span>
                    <span className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="lg:col-span-5">
              <h3 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">Featured by Siccotel Telecom</h3>
              <ul className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { img: aura2, name: "HMD Aura 2" },
                  { img: b220, name: "Zentality B220" },
                  { img: b3310, name: "Zentality B3310" },
                ].map((p, i) => (
                  <li key={p.name}>
                    <div data-anim="image" data-anim-delay={i * 90} className="overflow-hidden rounded-[6px] bg-white">
                      <Image src={p.img} alt={p.name} sizes="(min-width: 1024px) 200px, 30vw" className="h-auto w-full" />
                    </div>
                    <p className="mt-3 text-sm text-night-muted">{p.name}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mx-auto w-full max-w-64 lg:col-span-3 lg:self-center"><ManufacturingVisual /></div>
          </div>
        </div>
      </section>

      {/* Company journey */}
      <section aria-labelledby="journey-title" className="section-space">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeader
              eyebrow="Company journey"
              title={<span id="journey-title">Two decades of steady progress.</span>}
              intro="From a Karachi retail business to a nationwide distributor and manufacturer."
            />
            <TextLink href="/about#journey" className="shrink-0">
              Full timeline
            </TextLink>
          </div>
          <div className="mt-10 lg:mt-12">
            <JourneyRail items={milestones.filter((m) => m.highlight)} />
          </div>
        </div>
      </section>

      {/* News & media */}
      <section aria-labelledby="news-title" className="section-space border-t border-line bg-stone">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeader eyebrow="News & media" title={<span id="news-title">Latest from Siccotel.</span>} />
            <TextLink href="/news" className="shrink-0">
              All news
            </TextLink>
          </div>
          <ul className="mt-10 grid gap-x-7 gap-y-10 md:grid-cols-3" data-anim="stagger">
            {news.slice(0, 3).map((article) => (
              <li key={article.slug}><NewsCard article={article} /></li>
            ))}
          </ul>
        </div>
      </section>

      {/* Partnership CTA */}
      <EnquiryPaths
        title="Partner with Siccotel."
        intro="Brands, dealers and manufacturing partners — tell us what you need and your enquiry will reach the right team."
      />
    </>
  );
}
