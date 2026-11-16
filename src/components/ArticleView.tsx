import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { imageProps } from "@/lib/cms/image";
import { parseBody } from "@/lib/cms/body";
import type { Article, Published } from "@/lib/cms/types";
import { NewsCard } from "./sections";
import { ButtonLink } from "./ui";

/** "2026-11-14" → "14 November 2026". Empty when no display date is set. */
export function formatArticleDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/**
 * Gallery photos in rows of two (from sm up). Each photo's share of its row follows its
 * aspect ratio, so a landscape and a portrait photo side by side end at the same height,
 * uncropped; two photos of the same shape split the row evenly. A lone last photo keeps half.
 * The width shares the row less the gap and both cards' 1px borders, which each card adds back.
 */
function galleryShares<T extends { width: number; height: number }>(images: T[]) {
  return images.map((img, i) => {
    const partner = images[i % 2 === 0 ? i + 1 : i - 1];
    if (!partner) return { img, share: 0.5 };
    const ratio = (x: T) => (x.width > 0 && x.height > 0 ? x.width / x.height : 1);
    return { img, share: ratio(img) / (ratio(img) + ratio(partner)) };
  });
}

/** One article's page body, shared by the public route and the admin-only draft preview. */
export function ArticleView({ article, more }: { article: Published<Article>; more: Published<Article>[] }) {
  const hero = article.cover;
  const gallery = (article.gallery ?? []).filter((g) => g?.src);
  const date = formatArticleDate(article.date ?? "");

  return (
    <>
      <article>
        <header>
          <div className="container-site pt-3 pb-10 sm:pt-14 sm:pb-12 lg:pb-16">
            <Link href="/news" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft hover:text-accent">
              <ArrowLeft aria-hidden className="size-4" /> All news
            </Link>
            <div className="mt-2 max-w-4xl sm:mt-8">
              {(article.context || date) && (
                <p className="eyebrow mb-4">
                  {[article.context, date && <time key="d" dateTime={article.date}>{date}</time>].filter(Boolean).map((part, i) => (
                    <span key={i}>{i > 0 && " · "}{part}</span>
                  ))}
                </p>
              )}
              <h1 className="text-[1.875rem] leading-[1.12] font-semibold sm:text-5xl sm:leading-[1.06] lg:text-[3.5rem]">{article.title}</h1>
              {article.summary && <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:mt-6 sm:text-xl">{article.summary}</p>}
            </div>
          </div>
        </header>

        {hero?.src && (
          <div>
            <div className="container-site">
              <figure className="mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-[4px] border border-line bg-white">
                  <Image {...imageProps(hero)} alt={hero.alt} priority sizes="(min-width: 1024px) 896px, 100vw" className="h-auto max-h-[42rem] w-full object-contain" />
                </div>
              </figure>
            </div>
          </div>
        )}

        <div className="section-space container-site">
          <div className="mx-auto max-w-2xl space-y-4 text-base leading-[1.7] text-ink-soft sm:space-y-6 sm:text-lg sm:leading-[1.75]">
            {parseBody(article.body ?? "").map((block, i) => {
              if ("text" in block) return <p key={i}>{block.text}</p>;
              if ("list" in block)
                return (
                  <ul key={i} className="space-y-2 pl-5 marker:text-accent [list-style:square]">
                    {block.list.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                );
              return (
                <blockquote key={i} className="border-l-2 border-accent pl-6 font-display text-xl leading-snug font-medium text-ink sm:text-2xl">
                  “{block.quote}”
                </blockquote>
              );
            })}
          </div>

          {gallery.length > 0 && (
            <ul className="mx-auto mt-7 flex max-w-4xl flex-wrap items-start gap-3 sm:mt-14 sm:gap-4" aria-label="Photo gallery">
              {galleryShares(gallery).map(({ img, share }) => (
                <li
                  key={img.src}
                  style={{ "--share": share } as React.CSSProperties}
                  className="w-full overflow-hidden rounded-[4px] border border-line sm:w-[calc((100%-1rem-4px)*var(--share)+2px-0.25px)]"
                >
                  <Image
                    {...imageProps(img)}
                    alt={img.alt}
                    sizes={`(min-width: 1024px) ${Math.round(880 * share)}px, (min-width: 640px) ${Math.round(100 * share)}vw, 100vw`}
                    className="h-auto w-full"
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 border-t border-line pt-5 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-8">
            <p className="text-sm text-muted">Source: Siccotel News &amp; Media.</p>
            <ButtonLink href="/contact#enquiry" variant="secondary">
              Media &amp; business enquiries
            </ButtonLink>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="section-space">
          <div className="container-site">
            <h2 id="more-title" className="text-[1.75rem] font-semibold sm:text-3xl">
              More News
            </h2>
            <ul className="mt-5 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-8">
              {more.map((a, i) => (
                <li key={a.id} className={i === 2 ? "sm:max-lg:hidden" : ""}>
                  <NewsCard article={a} size="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
