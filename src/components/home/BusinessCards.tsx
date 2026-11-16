import Image from "next/image";
import { Check } from "lucide-react";
import { fillProps } from "@/lib/cms/image";
import type { HomeDoc, ServiceActivity } from "@/lib/cms/types";
import { ButtonLink, TextLink } from "../ui";
import { Reveal } from "../animations/Reveal";

/** `points` picks from each activity's list; network figures appear once, in the statistics row. */
const pointPicks: Record<string, number[]> = { distribution: [0, 1, 3], manufacturing: [0, 1, 2], retail: [1, 2, 3] };
const detailHref: Record<string, string> = { distribution: "/services#distribution", manufacturing: "/assembly", retail: "/services#retail" };

/** Phones get a thumbnail beside the title and the summary below, so three cards stay a short scroll. */
export function BusinessCards({ copy, activities }: { copy: HomeDoc["business"]; activities: ServiceActivity[] }) {
  return (
    <section id="our-business" aria-labelledby="business-title" className="section-space">
      <div className="container-site">
        <Reveal className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-3 sm:mb-4">{copy.eyebrow}</p>
            <h2 id="business-title" className="t-h2">
              {copy.title}
            </h2>
          </div>
          <p className="hidden max-w-md leading-relaxed text-muted sm:block lg:col-span-5">
            {copy.intro}
          </p>
        </Reveal>

        <Reveal as="ul" mode="children" tilt stagger={0.12} className="mt-6 grid gap-3 sm:mt-9 md:grid-cols-3 md:gap-5 lg:mt-11 lg:gap-6">
          {activities.map((activity, i) => {
            const card = copy.cardImages[i];
            const points = (pointPicks[activity.id] ?? [0, 1, 2]).map((n) => activity.points[n]).filter(Boolean);
            return (
              <li key={activity.id}>
                <article data-tilt="" className="group grid h-full grid-cols-[7.5rem_minmax(0,1fr)] max-[359px]:grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-3.5 overflow-hidden rounded-[8px] border border-line bg-white p-3.5 transition-[border-color,box-shadow] duration-200 hover:border-ink/25 hover:shadow-[0_18px_40px_-28px_rgba(22,24,27,0.45)] sm:grid-cols-[10rem_minmax(0,1fr)] md:flex md:flex-col md:items-stretch md:gap-x-0 md:p-0">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-stone-2 md:rounded-none">
                    {card?.image?.src && (
                      <Image
                        {...fillProps(card.image)} alt={card.image.alt}
                        sizes="(min-width: 1280px) 384px, (min-width: 768px) 32vw, 160px"
                        className="object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.02]"
                        style={{ objectPosition: card.position || undefined }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 md:px-5 md:pt-5 lg:px-6 lg:pt-6">
                    <p className="hidden text-xs leading-snug font-semibold tracking-[0.12em] text-accent uppercase md:block">{activity.kicker}</p>
                    <h3 className="t-h3 text-ink md:mt-2">{activity.title}</h3>
                  </div>
                  <div className="col-span-2 mt-3 flex flex-1 flex-col md:mt-0 md:px-5 md:pb-5 lg:px-6 lg:pb-6">
                    <p className="text-base leading-relaxed text-ink-soft md:mt-2.5 md:text-[0.9375rem]">{activity.summary}</p>
                    <ul className="mt-4 hidden space-y-2 border-t border-line pt-4 md:block">
                      {points.map((point) => (
                        <li key={point} className="flex gap-2 text-sm leading-relaxed text-muted">
                          <Check aria-hidden className="mt-1 size-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                          {point}
                        </li>
                      ))}
                    </ul>
                    {/* Phones get a light text link; the full-width button returns in the three-column layout. */}
                    <div className="mt-auto pt-1 md:hidden">
                      <TextLink href={detailHref[activity.id] ?? "/services"} className="min-h-11">
                        Explore {activity.title}
                      </TextLink>
                    </div>
                    <div className="mt-auto hidden pt-5 md:block">
                      <ButtonLink href={detailHref[activity.id] ?? "/services"} variant="secondary" className="w-full">
                        Explore {activity.title}
                      </ButtonLink>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
