import Image from "next/image";
import partnershipSigning from "@/assets/news/zte-nubia-partnership-signing.jpg";
import dealersTour from "@/assets/news/dealers-tour-frankfurt-group.jpg";
import regionalMap from "@/assets/company/pakistan-regional-network-map.png";
import { aboutIntro, coreValues, coreValuesIntro, futurePlans, mission, presenceText } from "@/content/company";
import { EnquiryPaths, PageHero, StatsGrid, Timeline } from "@/components/sections";
import { ButtonLink, Reveal, SectionHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Established in Karachi in 2001, Siccotel grew from retail into one of Pakistan’s largest smartphone distributors and manufacturers. Our history, mission and values.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Siccotel"
        title="Building Pakistan’s access to technology since 2001."
        intro="A Karachi company with deep roots in retail, grown into a nationwide distributor and local manufacturer of mobile devices."
      />

      <section aria-labelledby="intro-title" className="py-20 lg:py-28">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <h2 id="intro-title" className="sr-only">
              Company introduction
            </h2>
            <div className="prose-site space-y-5 text-lg leading-relaxed text-ink-soft">
              {aboutIntro.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <div className="mt-6 rounded-[4px] border border-line bg-stone p-5 text-[0.9375rem] leading-relaxed text-ink-soft">
              <p>
                <span className="font-semibold text-ink">Looking ahead (stated plan): </span>
                {futurePlans}
              </p>
            </div>
          </div>
          <div className="grid gap-4 self-start lg:col-span-5 lg:col-start-8">
            <Reveal>
              <figure>
                <div className="relative aspect-[3/2] overflow-hidden rounded-[4px] border border-line">
                  <Image
                    src={partnershipSigning}
                    alt="Siccotel and ZTE nubia teams at the partnership signing"
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1024px) 470px, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-sm text-muted">Signing the ZTE nubia partnership, 2025.</figcaption>
              </figure>
            </Reveal>
            <Reveal delay={100}>
              <figure>
                <div className="relative aspect-[3/2] overflow-hidden rounded-[4px] border border-line">
                  <Image
                    src={dealersTour}
                    alt="Siccotel and Inovi Telecom dealers on a rooftop overlooking Frankfurt"
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1024px) 470px, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-sm text-muted">The dealers’ Europe tour in Frankfurt.</figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
        <div className="container-site mt-20">
          <StatsGrid />
        </div>
      </section>

      <section aria-labelledby="mission-title" className="on-dark bg-night text-white">
        <div className="container-site grid gap-10 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-4">Our mission</p>
            <h2 id="mission-title" className="text-[2rem] leading-[1.08] font-semibold sm:text-[2.5rem]">
              Technology, summed up in one word.
            </h2>
          </div>
          <blockquote className="lg:col-span-7 lg:col-start-6">
            <p className="font-display text-2xl leading-snug font-medium tracking-[-0.015em] sm:text-[2rem]">“{mission}”</p>
          </blockquote>
        </div>
      </section>

      <section aria-labelledby="values-title" className="py-20 lg:py-28">
        <div className="container-site">
          <SectionHeader eyebrow="Core values" title={<span id="values-title">What we stand for.</span>} intro={coreValuesIntro} />
          <ul className="mt-12 grid grid-cols-2 border-t border-l border-line sm:grid-cols-3">
            {coreValues.map((v, i) => (
              <Reveal as="li" key={v} delay={(i % 3) * 60} className="flex min-w-0 flex-col items-start gap-3 border-r border-b border-line bg-white p-5 sm:flex-row sm:items-baseline sm:p-7">
                <span className="font-display text-sm text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 [overflow-wrap:anywhere] font-display text-lg font-semibold sm:text-xl">{v}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="presence-title" className="border-y border-line bg-stone py-20 lg:py-28">
        <div className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow="Our presence" title={<span id="presence-title">Affordable technology for every household.</span>} />
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">{presenceText}</p>
          </div>
          <Reveal className="lg:col-span-6 lg:col-start-7">
            <Image
              src={regionalMap}
              alt="Map of Pakistan showing Siccotel’s north, central and south sales regions"
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </section>

      <section id="journey" aria-labelledby="journey-title" className="py-20 lg:py-28">
        <div className="container-site">
          <SectionHeader
            eyebrow="Our journey"
            title={<span id="journey-title">Documented milestones.</span>}
            intro="Milestones as published in Siccotel’s journey timeline."
          />
          <div className="mt-14">
            <Timeline />
          </div>
          <div className="mt-4">
            <ButtonLink href="/partners" variant="secondary">
              See our partners
            </ButtonLink>
          </div>
        </div>
      </section>

      <EnquiryPaths title="Partner with Siccotel." />
    </>
  );
}
