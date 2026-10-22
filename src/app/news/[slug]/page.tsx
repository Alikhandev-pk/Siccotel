import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getArticle, news } from "@/content/news";
import { NewsCard } from "@/components/sections";
import { ButtonLink } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return news.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return pageMetadata({ title: article.title, description: article.summary, path: `/news/${article.slug}` });
}

export default function ArticlePage({ params }: PageProps<"/news/[slug]">) {
  return (
    <Suspense fallback={<ArticleLoading />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}

function ArticleLoading() {
  return (
    <div className="bg-stone">
      <div className="container-site py-16 lg:py-20">
        <Link href="/news" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft hover:text-accent">
          <ArrowLeft aria-hidden className="size-4" /> All news
        </Link>
        <p role="status" className="mt-6 text-lg text-muted">Loading article…</p>
      </div>
    </div>
  );
}

// URL params resolve inside this page's boundary during partial prefetching.
async function ArticleContent({ params }: Pick<PageProps<"/news/[slug]">, "params">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const index = news.findIndex((a) => a.slug === article.slug);
  const more = [...news.slice(index + 1), ...news.slice(0, index)].slice(0, 3);
  const [hero, ...gallery] = article.images;

  return (
    <>
      <article>
        <header className="bg-stone">
          <div className="container-site pt-10 pb-12 sm:pt-14 lg:pb-16">
            <Link
              href="/news"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft hover:text-accent"
            >
              <ArrowLeft aria-hidden className="size-4" /> All news
            </Link>
            <div className="mt-8 max-w-4xl">
              {article.context && (
                <p className="eyebrow mb-4">{article.context}</p>
              )}
              <h1 className="text-[2.25rem] leading-[1.06] font-semibold sm:text-5xl lg:text-[3.5rem]">{article.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{article.summary}</p>
            </div>
          </div>
        </header>

        {hero && (
          <div className="bg-[linear-gradient(to_bottom,var(--color-stone)_50%,transparent_50%)]">
            <div className="container-site">
              <figure className="mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-[4px] border border-line bg-white">
                  <Image
                    src={hero.src}
                    alt={hero.alt}
                    priority
                    placeholder="blur"
                    sizes="(min-width: 1024px) 896px, 100vw"
                    className="h-auto max-h-[42rem] w-full object-contain"
                  />
                </div>
              </figure>
            </div>
          </div>
        )}

        <div className="container-site py-14 lg:py-20">
          <div className="mx-auto max-w-2xl space-y-6 text-lg leading-[1.75] text-ink-soft">
            {article.body.map((block, i) => {
              if (typeof block === "string") return <p key={i}>{block}</p>;
              if ("list" in block)
                return (
                  <ul key={i} className="space-y-2 pl-5 marker:text-accent [list-style:square]">
                    {block.list.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                );
              return (
                <blockquote key={i} className="border-l-2 border-accent pl-6 font-display text-2xl leading-snug font-medium text-ink">
                  “{block.quote}”
                </blockquote>
              );
            })}
          </div>

          {gallery.length > 0 && (
            <ul className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2" aria-label="Photo gallery">
              {gallery.map((img) => (
                <li key={img.src.src} className="overflow-hidden rounded-[4px] border border-line">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    placeholder="blur"
                    sizes="(min-width: 1024px) 440px, (min-width: 640px) 50vw, 100vw"
                    className="h-auto w-full"
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="mx-auto mt-14 flex max-w-2xl flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">Source: Siccotel News &amp; Media.</p>
            <ButtonLink href="/contact#enquiry" variant="secondary">
              Media &amp; business enquiries
            </ButtonLink>
          </div>
        </div>
      </article>

      <section aria-labelledby="more-title" className="border-t border-line bg-stone py-16 lg:py-24">
        <div className="container-site">
          <h2 id="more-title" className="text-3xl font-semibold">
            More news
          </h2>
          <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {more.map((a, i) => (
              <li key={a.slug} className={i === 2 ? "sm:max-lg:hidden" : ""}>
                <NewsCard article={a} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
