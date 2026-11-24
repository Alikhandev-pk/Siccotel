import Image from "next/image";
import { fillProps, imageProps } from "@/lib/cms/image";
import { getDoc, getSettings } from "@/lib/cms/public";
import { PageHero, StatsGrid, Timeline } from "@/components/sections";
import { EnquiryPaths } from "@/components/EnquiryPaths";
import { contactEmails } from "@/lib/contact-links";
import { ButtonLink, Reveal, SectionHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Established in Karachi in 2001, Siccotel grew from retail into one of Pakistan’s largest smartphone distributors and manufacturers. Our history, mission and values.",
  path: "/about",
});

export default async function AboutPage() {
  const [doc, settings] = await Promise.all([getDoc("about"), getSettings()]);
  return (
    <>
      <PageHero eyebrow={doc.hero.eyebrow} title={doc.hero.title} intro={doc.hero.intro} />

      <section aria-labelledby="intro-title" className="section-space">
        <div className="container-site grid gap-7 sm:gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <h2 id="intro-title" className="sr-only">
              Company Introduction
            </h2>
            <div className="prose-site space-y-4 text-base leading-relaxed text-ink-soft sm:space-y-5 sm:text-lg">
              {doc.intro.filter(Boolean).map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
            {doc.lookingAhead && (
              <div className="mt-6 rounded-[4px] border border-line bg-stone p-5 text-[0.9375rem] leading-relaxed text-ink-soft">
                <p>
                  <span className="font-semibold text-ink">Looking ahead (stated plan): </span>
                  {doc.lookingAhead}
                </p>
              </div>
            )}
          </div>
          <div className="grid gap-4 self-start lg:col-span-5 lg:col-start-8">
            {doc.photos.filter((p) => p.image?.src).map((photo, i) => (
              <Reveal key={photo.image.src} delay={i * 100}>
                <figure>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-[4px] border border-line">
                    <Image {...fillProps(photo.image)} alt={photo.image.alt} sizes="(min-width: 1024px) 470px, 100vw" className="object-cover" />
                  </div>
                  {photo.caption && <figcaption className="mt-2 text-sm text-muted">{photo.caption}</figcaption>}
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="container-site mt-8 sm:mt-20">
          <StatsGrid stats={doc.stats} />
        </div>
      </section>

      <section aria-labelledby="mission-title" className="on-dark bg-night text-white">
        <div className="section-space container-site grid gap-5 sm:gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-4">{doc.mission.eyebrow}</p>
            <h2 id="mission-title" className="text-[1.75rem] leading-[1.12] font-semibold sm:text-[2.5rem] sm:leading-[1.08]">
              {doc.mission.title}
            </h2>
          </div>
          <blockquote className="lg:col-span-7 lg:col-start-6">
            <p className="font-display text-xl leading-snug font-medium tracking-[-0.015em] sm:text-[2rem]">“{doc.mission.text}”</p>
          </blockquote>
        </div>
      </section>

      <section aria-labelledby="values-title" className="section-space">
        <div className="container-site">
          <SectionHeader eyebrow={doc.values.eyebrow} title={<span id="values-title">{doc.values.title}</span>} intro={doc.values.intro} />
          <ul className="mt-6 grid grid-cols-2 border-t border-l border-line sm:mt-12 sm:grid-cols-3">
            {doc.values.items.filter(Boolean).map((v, i) => (
              <Reveal as="li" key={v} delay={(i % 3) * 60} className="flex min-w-0 flex-col items-start gap-1 border-r border-b border-line bg-white p-4 sm:flex-row sm:items-baseline sm:gap-3 sm:p-7">
                <span className="font-display text-sm text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 [overflow-wrap:anywhere] font-display text-lg font-semibold sm:text-xl">{v}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="presence-title" className="section-space">
        <div className="container-site grid items-center gap-6 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <SectionHeader eyebrow={doc.presence.eyebrow} title={<span id="presence-title">{doc.presence.title}</span>} />
            <p className="mt-4 text-base leading-relaxed text-ink-soft sm:mt-6 sm:text-lg">{doc.presence.text}</p>
          </div>
          {doc.presence.map?.src && (
            <Reveal className="lg:col-span-6 lg:col-start-7">
              <Image {...imageProps(doc.presence.map)} alt={doc.presence.map.alt} placeholder="empty" sizes="(min-width: 1024px) 560px, 100vw" className="h-auto w-full" />
            </Reveal>
          )}
        </div>
      </section>

      <section id="journey" aria-labelledby="journey-title" className="section-space">
        <div className="container-site">
          <SectionHeader eyebrow={doc.journey.eyebrow} title={<span id="journey-title">{doc.journey.title}</span>} intro={doc.journey.intro} />
          <div className="mt-6 sm:mt-14">
            <Timeline items={doc.journey.milestones} />
          </div>
          <div className="mt-4">
            <ButtonLink href="/partners" variant="secondary">
              See our partners
            </ButtonLink>
          </div>
        </div>
      </section>

      <EnquiryPaths
        title="Partner with Siccotel"
        intro="Tell us what you need and we'll connect you with the right team."
        emails={contactEmails(settings)}
      />
    </>
  );
}
