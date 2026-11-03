import Image, { type StaticImageData } from "next/image";
import { Check } from "lucide-react";
import mwcTecno from "@/assets/news/mwc-barcelona-2025-tecno-booth.jpg";
import factoryExterior from "@/assets/company/siccotel-telecom-factory-exterior.jpg";
import partnerBanner from "@/assets/retail/official-partner-banner.jpg";
import { businessActivities } from "@/content/business";
import { ButtonLink } from "../ui";

/** `points` picks from each activity's list; network figures appear once, in the statistics row. */
const cards: Record<string, { image: StaticImageData; alt: string; position?: string; points: number[] }> = {
  distribution: {
    image: mwcTecno,
    alt: "Siccotel representatives at the Tecno stand, MWC Barcelona 2025",
    points: [0, 1, 3],
  },
  manufacturing: {
    image: factoryExterior,
    alt: "The Siccotel Telecom assembly plant building at Korangi Creek Industrial Park, Karachi",
    position: "50% 30%",
    points: [0, 1, 2],
  },
  retail: {
    image: partnerBanner,
    // The crop shows only the device line-up, keeping the banner's own wording out of a small card.
    alt: "Nokia, Tecno, itel and Samsung phones with a laptop, from a Siccotel official partner banner",
    position: "2% 50%",
    points: [1, 2, 3],
  },
};

/** Phones get a thumbnail beside the title and the summary below, so three cards stay a short scroll. */
export function BusinessCards() {
  return (
    <section id="our-business" aria-labelledby="business-title" className="section-space border-y border-line bg-stone">
      <div className="container-site">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-3 sm:mb-4">Our business</p>
            <h2 id="business-title" className="t-h2" data-anim="heading">
              From global brands to everyday connections.
            </h2>
          </div>
          <p className="hidden max-w-md leading-relaxed text-muted sm:block lg:col-span-5" data-anim="fade">
            Three connected businesses: distribution for global brands, local assembly through Siccotel Telecom, and
            retail &amp; e-commerce.
          </p>
        </div>

        <ul className="mt-6 grid gap-3 sm:mt-9 md:grid-cols-3 md:gap-5 lg:mt-11 lg:gap-6" data-anim="stagger">
          {businessActivities.map((activity) => {
            const card = cards[activity.id];
            return (
              <li key={activity.id}>
                <article className="group grid h-full grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-x-3.5 overflow-hidden rounded-[8px] border border-line bg-white p-3.5 transition-[border-color,box-shadow] duration-200 hover:border-ink/25 hover:shadow-[0_18px_40px_-28px_rgba(22,24,27,0.45)] sm:grid-cols-[10rem_minmax(0,1fr)] md:flex md:flex-col md:items-stretch md:gap-x-0 md:p-0">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-stone-2 md:rounded-none">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      placeholder="blur"
                      sizes="(min-width: 1280px) 384px, (min-width: 768px) 32vw, 160px"
                      className="object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.02]"
                      style={{ objectPosition: card.position }}
                    />
                  </div>
                  <div className="min-w-0 md:px-5 md:pt-5 lg:px-6 lg:pt-6">
                    <p className="text-[0.6875rem] leading-snug font-semibold tracking-[0.08em] text-accent uppercase md:text-xs md:tracking-[0.12em]">{activity.kicker}</p>
                    <h3 className="t-h3 mt-1 text-ink md:mt-2">{activity.title}</h3>
                  </div>
                  <div className="col-span-2 mt-3 flex flex-1 flex-col md:mt-0 md:px-5 md:pb-5 lg:px-6 lg:pb-6">
                    <p className="text-[0.9375rem] leading-relaxed text-ink-soft md:mt-2.5">{activity.summary}</p>
                    <ul className="mt-4 hidden space-y-2 border-t border-line pt-4 md:block">
                      {card.points.map((index) => (
                        <li key={index} className="flex gap-2 text-sm leading-relaxed text-muted">
                          <Check aria-hidden className="mt-1 size-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                          {activity.points[index]}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-3 md:pt-5">
                      <ButtonLink href={activity.detailHref} variant="secondary" className="w-full">
                        Explore {activity.title}
                      </ButtonLink>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
