import type { MetadataRoute } from "next";
import { getNews } from "@/lib/cms/public";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = await getNews();
  // Without a configured deployment URL, fall back to a local origin rather
  // than the live company domain.
  const base = siteUrl ?? "http://localhost:3000";
  const pages = ["", "/about", "/services", "/assembly", "/partners", "/news", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${base}${p || "/"}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...news.map((a) => ({ url: `${base}/news/${a.slug}`, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
