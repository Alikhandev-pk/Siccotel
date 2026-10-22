import type { MetadataRoute } from "next";
import { news } from "@/content/news";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Without a configured deployment URL, fall back to a local origin rather
  // than the live company domain.
  const base = siteUrl ?? "http://localhost:3000";
  const pages = ["", "/about", "/business", "/manufacturing", "/partners", "/news", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${base}${p || "/"}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...news.map((a) => ({ url: `${base}/news/${a.slug}`, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
