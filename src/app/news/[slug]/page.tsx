import Link from "next/link";
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getArticle, getNews, getRedirectedSlug } from "@/lib/cms/public";
import { ArticleView } from "@/components/ArticleView";
import { pageMetadata } from "@/lib/site";

export async function generateStaticParams() {
  return (await getNews()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
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
    <div>
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
  const news = await getNews();
  const article = news.find((a) => a.slug === slug);
  if (!article) {
    // A published article whose slug changed: send the old URL to the new one.
    const current = await getRedirectedSlug("news", slug);
    if (current) permanentRedirect(`/news/${current}`);
    notFound();
  }
  const index = news.findIndex((a) => a.slug === article.slug);
  const more = [...news.slice(index + 1), ...news.slice(0, index)].slice(0, 3);
  return <ArticleView article={article} more={more} />;
}
