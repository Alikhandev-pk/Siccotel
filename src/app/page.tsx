import Image from "next/image";
import { BadgeCheck, PackageCheck, ShieldCheck } from "lucide-react";
import telecomLogoLight from "@/assets/brand/siccotel-telecom-logo-light.png";
import mwcHmd from "@/assets/news/mwc-barcelona-2025-hmd-booth.jpg";
import hmdMeeting from "@/assets/news/hmd-global-meeting-china.jpg";
import assemblyFloor from "@/assets/company/siccotel-hero-assembly-floor.jpg";
import aura2 from "@/assets/products/hmd-aura-2.jpg";
import b220 from "@/assets/products/zentality-b220.jpg";
import b3310 from "@/assets/products/zentality-b3310.jpg";
import { company, growthText } from "@/content/company";
import { milestones } from "@/content/milestones";
import { news } from "@/content/news";
import { enquiryHref } from "@/content/navigation";
import { EnquiryPaths, NewsCard, PartnerStrip, StatsGrid } from "@/components/sections";
import { ButtonLink, SectionHeader, TextLink } from "@/components/ui";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { BusinessCards } from "@/components/home/BusinessCards";
import { RetailEcommerceSection } from "@/components/home/RetailEcommerceSection";
import { ReachMap } from "@/components/home/ReachMap";
import { JourneyRail } from "@/components/home/JourneyRail";
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

const featuredProducts = [
  { img: aura2, name: "HMD Aura 2" },
  { img: b220, name: "Zentality B220" },
  { img: b3310, name: "Zentality B3310" },
];

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <HeroCarousel />
      <PartnerStrip />

      {/* Company introduction and the page's one statistics row */}
      <section aria-labelledby="glance-title" className="section-space">
        <div className="container-site">
          <div className="grid gap-5 sm:gap-9 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-6">
              <p className="eyebrow mb-3 sm:mb-4">Company at a glance</p>
              <h2 id="glance-title" className="t-h2" data-anim="heading">
                One of Pakistan’s largest smartphone distributors.
              </h2>
              <p className="t-lead mt-3 text-ink-soft sm:mt-5">
                Founded in Karachi in {company.foundedYear}, Siccotel is a smartphone distributor, manufacturer and
                retailer with after-sales support in major cities across Pakistan. It is the official partner of leading
                global brands including Infinix, Samsung, itel, Nokia, realme, Tecno and ZTE nubia.
              </p>
              <p className="mt-4 hidden leading-relaxed text-muted sm:block">{growthText}</p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem] font-semibold text-ink sm:mt-5 sm:gap-x-6">
                {assurances.map(({ icon: Icon, label }) => (
                  <li key={label} className="inline-flex items-center gap-2">
                    <Icon aria-hidden className="size-5 text-accent" strokeWidth={1.75} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-[1.3fr_1fr] items-start gap-3 sm:gap-4 lg:col-span-6">
              <figure>
                <div data-anim="image" className="relative overflow-hidden rounded-[8px] ring-1 ring-black/5">
                  <Image
                    src={mwcHmd}
                    alt="Siccotel representatives with device-industry executives at the HMD stand, MWC Barcelona 2025"
                    placeholder="blur"
                    sizes="(min-width: 1280px) 340px, (min-width: 1024px) 28vw, 56vw"
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mt-2.5 text-xs leading-relaxed text-muted">MWC Barcelona, 2025</figcaption>
              </figure>
              <figure className="sm:pt-8">
                <div data-anim="image" data-anim-delay="150" className="relative overflow-hidden rounded-[8px] ring-1 ring-black/5">
                  <Image
                    src={hmdMeeting}
                    alt="Siccotel and HMD Global representatives at HMD’s offices"
                    placeholder="blur"
                    sizes="(min-width: 1280px) 260px, (min-width: 1024px) 22vw, 42vw"
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mt-2.5 text-xs leading-relaxed text-muted">Meeting with HMD Global</figcaption>
              </figure>
            </div>
          </div>
          <div className="mt-6 border-t border-line pt-5 sm:mt-9 sm:pt-7 lg:mt-11">
            <StatsGrid />
          </div>
        </div>
      </section>

      <BusinessCards />
      <RetailEcommerceSection />

      {/* Nationwide network */}
      <section aria-labelledby="reach-title" className="section-space border-y border-line bg-stone">
        <div className="container-site">
          <SectionHeader
            eyebrow="Nationwide reach"
            title={<span id="reach-title">A network that reaches every region.</span>}
            intro="Siccotel’s sales and support network spans Pakistan’s north, central and south regions from its base in Karachi."
          />
          <div className="mt-5 sm:mt-8 lg:mt-10">
            <ReachMap />
          </div>
        </div>
      </section>

      {/* Manufacturing */}
      <section aria-labelledby="manufacturing-title" className="on-dark bg-night text-white">
        <div className="section-space container-site">
          <div className="grid gap-6 sm:gap-10 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-6">
              <Image src={telecomLogoLight} alt="Siccotel Telecom" className="h-10 w-auto sm:h-12" sizes="80px" />
              <SectionHeader
                className="mt-4 sm:mt-7"
                eyebrow="Manufacturing"
                title={<span id="manufacturing-title">Made in Pakistan, at Korangi Creek.</span>}
                intro={
                  <>
                    <span className="sm:hidden">
                      Siccotel Telecom (Pvt) Ltd assembles mobile phones for different brands under the Government’s “Made in Pakistan” initiative.
                    </span>
                    <span className="hidden sm:inline">
                      Siccotel Telecom (Pvt) Ltd is the group’s mobile phone assembly plant in Korangi Creek Industrial Park, Karachi — built to assemble devices for different brands under the Government’s “Made in Pakistan” initiative.
                    </span>
                  </>
                }
              />
              <div className="mt-5 sm:mt-7" data-anim="fade">
                <p className="t-figure text-[clamp(2.25rem,1.6rem+3vw,4.25rem)]">120,000</p>
                <p className="mt-1.5 flex items-center gap-3 text-night-muted sm:mt-2">
                  <span aria-hidden className="h-[2px] w-8 shrink-0 bg-accent-on-dark sm:w-10" />
                  sq. ft. of operational space at KCIP, Karachi
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:mt-7 sm:flex-row">
                <ButtonLink href="/manufacturing" variant="light">
                  About our manufacturing
                </ButtonLink>
                {/* On phones this route is in the enquiry list that closes the page. */}
                <div className="hidden sm:block">
                  <ButtonLink href={enquiryHref("manufacturing")} variant="ghost-dark">
                    Manufacturing enquiry
                  </ButtonLink>
                </div>
              </div>
            </div>
            <figure className="lg:col-span-6">
              <div data-anim="image" data-img-parallax="4" className="relative aspect-[3/2] overflow-hidden rounded-[8px] border border-white/10 bg-night-2">
                <Image
                  src={assemblyFloor}
                  alt="Workers assembling mobile phones at Siccotel Telecom’s Karachi facility"
                  fill
                  quality={90}
                  placeholder="blur"
                  sizes="(min-width: 1280px) 590px, (min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2 text-sm leading-relaxed text-night-muted sm:mt-2.5">
                Inside Siccotel Telecom’s mobile phone assembly facility.
              </figcaption>
            </figure>
          </div>

          <div className="mt-6 grid gap-6 border-t border-night-line pt-5 sm:mt-10 sm:gap-9 sm:pt-8 lg:mt-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <h3 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">End-to-end service delivery chain</h3>
              <ol className="mt-3 grid grid-cols-2 gap-x-4 sm:mt-4 sm:gap-x-6" data-anim="stagger">
                {chain.map((step, i) => (
                  <li key={step} className="flex items-baseline gap-2.5 border-t border-night-line py-2.5 sm:gap-4 sm:py-3.5">
                    <span className="font-display text-sm text-accent-on-dark tabular-nums">0{i + 1}</span>
                    <span className="font-display text-[0.9375rem] leading-snug font-semibold tracking-[-0.02em] sm:text-lg">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="lg:col-span-5">
              <h3 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">Featured by Siccotel Telecom</h3>
              <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:mt-4 sm:gap-3" data-anim="stagger">
                {featuredProducts.map((product) => (
                  <li key={product.name}>
                    <div className="overflow-hidden rounded-[6px] bg-white">
                      <Image src={product.img} alt={product.name} sizes="(min-width: 1024px) 150px, 30vw" className="h-auto w-full" />
                    </div>
                    <p className="mt-1.5 text-[0.8125rem] leading-snug text-night-muted sm:mt-2 sm:text-sm">{product.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Company journey */}
      <section aria-labelledby="journey-title" className="section-space">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-2 sm:gap-5 lg:flex-row lg:items-end">
            <SectionHeader
              eyebrow="Company journey"
              title={<span id="journey-title">Two decades of steady progress.</span>}
              intro="From a Karachi retail business to a nationwide distributor and manufacturer."
            />
            <TextLink href="/about#journey" className="min-h-11 shrink-0">
              Full timeline
            </TextLink>
          </div>
          <div className="mt-3 sm:mt-9 lg:mt-11">
            <JourneyRail items={milestones.filter((m) => m.highlight)} />
          </div>
        </div>
      </section>

      {/* News & media */}
      <section aria-labelledby="news-title" className="section-space border-t border-line bg-stone">
        <div className="container-site">
          <div className="flex flex-row items-end justify-between gap-4">
            <SectionHeader eyebrow="News & media" title={<span id="news-title">Latest from Siccotel.</span>} />
            <TextLink href="/news" className="min-h-11 shrink-0">
              All news
            </TextLink>
          </div>
          <ul className="mt-4 grid gap-x-6 gap-y-3 sm:mt-9 md:grid-cols-3 md:gap-y-9" data-anim="stagger">
            {news.slice(0, 3).map((article) => (
              <li key={article.slug}><NewsCard article={article} size="compact" /></li>
            ))}
          </ul>
        </div>
      </section>

      <EnquiryPaths
        title="Partner with Siccotel."
        intro="Brands, dealers and manufacturing partners — tell us what you need and your enquiry will reach the right team."
      />
    </>
  );
}
