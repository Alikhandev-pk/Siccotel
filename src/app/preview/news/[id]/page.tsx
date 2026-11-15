import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/ArticleView";
import { adminEntry } from "@/components/admin/data";
import { isAdminRequest } from "@/lib/cms/auth";
import { getNews } from "@/lib/cms/public";
import type { Article, Published } from "@/lib/cms/types";

export const metadata = { title: "Draft preview", robots: { index: false, follow: false, nocache: true } };

/** Admin-only preview of an article's saved draft, with the public page layout. */
export default function PreviewPage({ params }: PageProps<"/preview/news/[id]">) {
  return (
    <Suspense fallback={<p className="container-site py-16 text-muted">Loading preview…</p>}>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({ params }: Pick<PageProps<"/preview/news/[id]">, "params">) {
  if (!(await isAdminRequest())) notFound();
  const { id } = await params;
  const entry = await adminEntry("news", id);
  const article = { ...(entry.value as unknown as Article), id: entry.id, slug: entry.slug } as Published<Article>;
  const more = (await getNews()).filter((a) => a.id !== entry.id).slice(0, 3);
  return (
    <>
      <div role="status" className="sticky top-[var(--header-h)] z-40 bg-[#fff4d6] px-4 py-2 text-center text-sm font-semibold text-[#5c4300]">
        Draft preview — only signed-in admins can see this page. {entry.isPublished ? "The live article is unchanged until you publish." : "This article is not published."}
      </div>
      <ArticleView article={article} more={more} />
    </>
  );
}
