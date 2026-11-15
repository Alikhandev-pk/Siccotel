import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fillProps } from "@/lib/cms/image";
import { getDoc, getNews } from "@/lib/cms/public";
import { NewsCard, PageHero } from "@/components/sections";
import { Reveal } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "News & Media",
  description:
    "News from Siccotel: partnerships with ZTE nubia and HMD, MWC Barcelona 2025, meetings with the PTA, and Pakistan’s mobile manufacturing industry.",
  path: "/news",
});

export default async function NewsPage() {
  const [doc, news] = await Promise.all([getDoc("newsPage"), getNews()]);
  const [lead, ...rest] = news;
  return (
    <>
      <PageHero eyebrow={doc.hero.eyebrow} title={doc.hero.title} intro={doc.hero.intro} />
      <section aria-label="Articles" className="section-space">
        <div className="container-site">
          {!lead ? (
            <p className="text-muted">News articles will appear here soon.</p>
          ) : (
            <article className="group relative grid items-center gap-4 border-b border-line pb-7 sm:gap-8 sm:pb-14 lg:grid-cols-12 lg:gap-12 lg:pb-20">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] border border-line bg-stone lg:col-span-7">
                {lead.cover?.src && (
                  <Image {...fillProps(lead.cover)} alt="" priority sizes="(min-width: 1024px) 680px, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" style={{ objectPosition: lead.coverPosition || "50% 50%" }} />
                )}
              </div>
              <div className="lg:col-span-5">
                <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">Latest</p>
                <h2 className="mt-2 text-[1.75rem] leading-tight font-semibold sm:mt-3 sm:text-4xl">
                  <Link href={`/news/${lead.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
                    {lead.title}
                  </Link>
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted sm:mt-4 sm:text-lg">{lead.summary}</p>
                <span aria-hidden className="mt-3 inline-flex items-center gap-1.5 font-semibold sm:mt-6">
                  Read article <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </article>
          )}
          {rest.length > 0 && (
            <ul className="mt-6 grid gap-x-8 gap-y-4 sm:mt-14 sm:grid-cols-2 sm:gap-y-14 lg:mt-20 lg:grid-cols-3">
              {rest.map((a, i) => (
                <Reveal as="li" key={a.id} delay={(i % 3) * 70}>
                  <NewsCard article={a} size="compact" />
                </Reveal>
              ))}
            </ul>
          )}
          {doc.footnote && <p className="mt-7 max-w-2xl text-sm text-muted sm:mt-16">{doc.footnote}</p>}
        </div>
      </section>
    </>
  );
}
