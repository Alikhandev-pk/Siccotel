import Image from "next/image";
import { BadgeCheck, PackageCheck, ShieldCheck } from "lucide-react";
import { enquiryHref } from "@/content/navigation";
import { telecomLogo } from "@/lib/cms/defaults";
import { resolveReachArtwork } from "@/lib/cms/artwork";
import { fillProps, imageProps } from "@/lib/cms/image";
import {
  getBanners,
  getDoc,
  getNews,
  getProducts,
  getSettings,
} from "@/lib/cms/public";
import {
  EnquiryPaths,
  NewsCard,
  PartnerStrip,
  StatsGrid,
} from "@/components/sections";
import { ButtonLink, SectionHeader, TextLink } from "@/components/ui";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { BusinessCards } from "@/components/home/BusinessCards";
import { RetailEcommerceSection } from "@/components/home/RetailEcommerceSection";
import { ReachMap } from "@/components/home/ReachMap";
import { JourneyRail } from "@/components/home/JourneyRail";
import { Reveal } from "@/components/animations/Reveal";
import { ChainProgress } from "@/components/animations/ChainProgress";
import { NewsReveal } from "@/components/animations/NewsReveal";
import { pageMetadata } from "@/lib/site";

export const metadata = {
  ...pageMetadata({
    description:
      "Siccotel connects Pakistan with technology — distributing smartphones for global brands since 2001, assembling devices locally through Siccotel Telecom, and serving 4,500+ retailers nationwide.",
    path: "/",
  }),
  title: { absolute: "Siccotel — Connecting Pakistan Through Technology" },
};

const assuranceIcons = [BadgeCheck, ShieldCheck, PackageCheck];

export default async function HomePage() {
  const [home, about, services, partners, settings, banners, products, news] =
    await Promise.all([
      getDoc("home"),
      getDoc("about"),
      getDoc("services"),
      getDoc("partners"),
      getSettings(),
      getBanners(),
      getProducts(),
      getNews(),
    ]);
  const { glance, reach, manufacturing } = home;
  const reachArtwork = await resolveReachArtwork(reach);
  const featured = products
    .filter((p) => p.showOnAssembly && p.images[0])
    .slice(0, 3);
  const [photoA, photoB] = glance.photos;

  return (
    <>
      <OrganizationJsonLd settings={settings} />
      <HeroCarousel banners={banners} intro={home.hero} />
      <PartnerStrip partners={partners.brands} title={home.partnerStripTitle} />

      {/* Company introduction and the page's one statistics row */}
      <section aria-labelledby="glance-title" className="section-space">
        <div className="container-site">
          <div className="grid gap-5 sm:gap-9 lg:grid-cols-12 lg:items-center lg:gap-10">
            <Reveal className="lg:col-span-6">
              <p className="eyebrow mb-3 sm:mb-4">{glance.eyebrow}</p>
              <h2 id="glance-title" className="t-h2">
                {glance.title}
              </h2>
              <p className="t-lead mt-3 text-ink-soft sm:mt-5">{glance.lead}</p>
              {glance.body && (
                <p className="mt-4 hidden leading-relaxed text-muted sm:block">
                  {glance.body}
                </p>
              )}
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem] font-semibold text-ink sm:mt-5 sm:gap-x-6">
                {glance.assurances.filter(Boolean).map((label, i) => {
                  const Icon = assuranceIcons[i % assuranceIcons.length];
                  return (
                    <li key={label} className="inline-flex items-center gap-2">
                      <Icon
                        aria-hidden
                        className="size-5 text-accent"
                        strokeWidth={1.75}
                      />
                      {label}
                    </li>
                  );
                })}
              </ul>
            </Reveal>
            <div className="grid grid-cols-[1.3fr_1fr] items-start gap-3 sm:gap-4 lg:col-span-6">
              {photoA?.image?.src && (
                <figure>
                  <div
                    data-anim="image"
                    className="relative overflow-hidden rounded-[8px] ring-1 ring-black/5"
                  >
                    <Image
                      {...imageProps(photoA.image)}
                      alt={photoA.image.alt}
                      sizes="(min-width: 1280px) 340px, (min-width: 1024px) 28vw, 56vw"
                      quality={90}
                      className="h-auto w-full"
                    />
                  </div>
                  {photoA.caption && (
                    <figcaption className="mt-2.5 text-xs leading-relaxed text-muted">
                      {photoA.caption}
                    </figcaption>
                  )}
                </figure>
              )}
              {photoB?.image?.src && (
                <figure className="sm:pt-8">
                  <div
                    data-anim="image"
                    data-anim-delay="150"
                    className="relative overflow-hidden rounded-[8px] ring-1 ring-black/5"
                  >
                    <Image
                      {...imageProps(photoB.image)}
                      alt={photoB.image.alt}
                      sizes="(min-width: 1280px) 260px, (min-width: 1024px) 22vw, 42vw"
                      quality={90}
                      className="h-auto w-full"
                    />
                  </div>
                  {photoB.caption && (
                    <figcaption className="mt-2.5 text-xs leading-relaxed text-muted">
                      {photoB.caption}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          </div>
          <div className="mt-6 border-t border-line pt-5 sm:mt-8 sm:pt-6 lg:mt-9">
            <StatsGrid stats={glance.stats} />
          </div>
        </div>
      </section>

      <BusinessCards copy={home.business} activities={services.activities} />
      <RetailEcommerceSection
        copy={home.retail}
        clients={home.clients}
        afterSales={services.afterSales}
        links={settings.links}
      />

      {/* Nationwide network */}
      <section
        aria-labelledby="reach-title"
        className="section-space"
      >
        <div className="container-site">
          <Reveal>
            <SectionHeader
              eyebrow={reach.eyebrow}
              title={<span id="reach-title">{reach.title}</span>}
              intro={reach.intro}
            />
          </Reveal>
          <div className="mt-5 sm:mt-8 lg:mt-10">
            <ReachMap reach={reach} artwork={reachArtwork} settings={settings} />
          </div>
        </div>
      </section>

      {/* Manufacturing */}
      <section
        aria-labelledby="manufacturing-title"
        className="on-dark bg-night text-white"
      >
        <div className="section-space container-site">
          <div className="grid gap-6 sm:gap-10 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-6">
              <Image
                src={telecomLogo}
                alt="Siccotel Telecom"
                className="h-10 w-auto sm:h-12"
                sizes="80px"
              />
              <Reveal className="mt-4 sm:mt-7">
                <SectionHeader
                  eyebrow={manufacturing.eyebrow}
                  title={
                    <span id="manufacturing-title">{manufacturing.title}</span>
                  }
                  intro={manufacturing.intro}
                />
              </Reveal>
              <div className="mt-5 sm:mt-7" data-anim="fade">
                <p className="t-figure text-[clamp(2.25rem,1.6rem+3vw,4.25rem)]" data-anim="count">
                  {manufacturing.figure}
                </p>
                <p className="mt-1.5 flex items-start gap-3 text-night-muted sm:mt-2">
                  {/* Level with the first line when the caption wraps on phones. */}
                  <span
                    aria-hidden
                    className="mt-[0.75em] h-[2px] w-8 shrink-0 bg-accent-on-dark sm:w-10"
                  />
                  {manufacturing.figureLabel}
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:mt-7 sm:flex-row">
                <ButtonLink href="/assembly" variant="light">
                  About our manufacturing
                </ButtonLink>
                {/* On phones this route is in the enquiry list that closes the page. */}
                <div className="hidden sm:block">
                  <ButtonLink
                    href={enquiryHref("manufacturing")}
                    variant="ghost-dark"
                  >
                    Manufacturing enquiry
                  </ButtonLink>
                </div>
              </div>
            </div>
            {manufacturing.photo.image?.src && (
              <figure className="lg:col-span-6">
                <div
                  data-anim="image"
                  data-img-parallax="4"
                  className="relative aspect-[3/2] overflow-hidden rounded-[8px] border border-white/10 bg-night-2"
                >
                  <Image
                    {...fillProps(manufacturing.photo.image)}
                    alt={manufacturing.photo.image.alt}
                    quality={90}
                    sizes="(min-width: 1280px) 590px, (min-width: 1024px) 48vw, 100vw"
                    className="object-cover"
                  />
                </div>
                {manufacturing.photo.caption && (
                  <figcaption className="mt-2 text-sm leading-relaxed text-night-muted sm:mt-2.5">
                    {manufacturing.photo.caption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>

          <div className="mt-6 grid gap-6 border-t border-night-line pt-5 sm:mt-10 sm:gap-9 sm:pt-8 lg:mt-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <h3 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">
                End-to-End Service Delivery Chain
              </h3>
              <ChainProgress className="mt-3 grid grid-cols-2 gap-x-4 sm:mt-4 sm:gap-x-6">
                {manufacturing.chain.map((step, i) => (
                  <li
                    key={step}
                    data-step=""
                    className="relative flex flex-col gap-0.5 border-t border-night-line py-2.5 sm:flex-row sm:items-baseline sm:gap-4 sm:py-3.5"
                  >
                    <span
                      aria-hidden
                      data-step-bar=""
                      className="absolute -top-px right-0 left-0 h-[2px] bg-accent-on-dark"
                    />
                    <span data-step-text="" className="font-display text-sm text-accent-on-dark tabular-nums">
                      0{i + 1}
                    </span>
                    <span data-step-text="" className="font-display text-base leading-snug font-semibold tracking-[-0.02em] sm:text-lg">
                      {step}
                    </span>
                  </li>
                ))}
              </ChainProgress>
            </div>
            {featured.length > 0 && (
              <div className="lg:col-span-5">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-night-muted uppercase">
                  {manufacturing.productsTitle}
                </h3>
                <ul
                  className="mt-3 grid grid-cols-3 gap-2.5 sm:mt-4 sm:gap-3"
                  data-anim="stagger"
                >
                  {featured.map((product) => (
                    <li key={product.id}>
                      <div className="overflow-hidden rounded-[6px] bg-white">
                        <Image
                          {...imageProps(product.images[0])}
                          alt={product.images[0].alt}
                          sizes="(min-width: 1024px) 150px, 30vw"
                          className="h-auto w-full"
                        />
                      </div>
                      <p className="mt-1.5 text-sm leading-snug text-night-muted sm:mt-2">
                        {product.name}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Company journey */}
      <section aria-labelledby="journey-title" className="section-space">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-2 sm:gap-5 lg:flex-row lg:items-end">
            <Reveal>
              <SectionHeader
                eyebrow={home.journey.eyebrow}
                title={<span id="journey-title">{home.journey.title}</span>}
                intro={home.journey.intro}
              />
            </Reveal>
            <TextLink href="/about#journey" className="min-h-11 shrink-0">
              Full timeline
            </TextLink>
          </div>
          <div className="mt-3 sm:mt-9 lg:mt-11">
            <JourneyRail
              items={about.journey.milestones.filter((m) => m.highlight)}
            />
          </div>
        </div>
      </section>

      {/* News & media */}
      {news.length > 0 && (
        <section
          aria-labelledby="news-title"
          className="section-space"
        >
          <div className="container-site">
            <div className="flex flex-row items-end justify-between gap-4">
              <Reveal>
                <SectionHeader
                  eyebrow={home.newsTitle.eyebrow}
                  title={<span id="news-title">{home.newsTitle.title}</span>}
                />
              </Reveal>
              <TextLink href="/news" className="min-h-11 shrink-0">
                All news
              </TextLink>
            </div>
            <NewsReveal className="mt-4 grid gap-x-6 gap-y-3 sm:mt-9 md:grid-cols-3 md:gap-y-9">
              {news.slice(0, 3).map((article) => (
                <li key={article.id}>
                  <NewsCard article={article} size="compact" />
                </li>
              ))}
            </NewsReveal>
          </div>
        </section>
      )}

      <EnquiryPaths
        title={home.enquiry.title}
        intro={home.enquiry.intro}
        email={settings.email}
      />
    </>
  );
}
