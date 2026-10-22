import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { news } from "@/content/news";
import { NewsCard, PageHero } from "@/components/sections";
import { Reveal } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "News & Media",
  description:
    "News from Siccotel: partnerships with ZTE nubia and HMD, MWC Barcelona 2025, meetings with the PTA, and Pakistan’s mobile manufacturing industry.",
  path: "/news",
});

export default function NewsPage() {
  const [lead, ...rest] = news;
  return (
    <>
      <PageHero
        eyebrow="News & media"
        title="Unlocking IT and telecom opportunities."
        intro="Partnerships, industry events and milestones from Siccotel — most recent first."
      />
      <section aria-label="Articles" className="py-16 lg:py-24">
        <div className="container-site">
          <article className="group relative grid items-center gap-8 border-b border-line pb-14 lg:grid-cols-12 lg:gap-12 lg:pb-20">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] border border-line lg:col-span-7">
              {lead.images[0] && (
                <Image
                  src={lead.images[0].src}
                  alt=""
                  fill
                  priority
                  placeholder="blur"
                  sizes="(min-width: 1024px) 680px, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              )}
            </div>
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">Latest</p>
              <h2 className="mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
                <Link href={`/news/${lead.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
                  {lead.title}
                </Link>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted">{lead.summary}</p>
              <span aria-hidden className="mt-6 inline-flex items-center gap-1.5 font-semibold">
                Read article <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </article>
          <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
            {rest.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={(i % 3) * 70}>
                <NewsCard article={a} />
              </Reveal>
            ))}
          </ul>
          <p className="mt-16 max-w-2xl text-sm text-muted">
            Articles are republished from Siccotel’s News &amp; Media page, which does not list publication dates. Event
            dates are shown only where an article states them.
          </p>
        </div>
      </section>
    </>
  );
}
