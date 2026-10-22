import type { Metadata } from "next";

/**
 * The public URL of THIS deployment (e.g. a staging URL). It is used for
 * canonical URLs, the sitemap and structured data. It is intentionally never
 * defaulted to https://siccotel.com, so a demo can't canonicalise itself to
 * the live company website by accident.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || undefined;

/** Search engines are blocked unless this is explicitly set to "true". */
export const allowIndexing = process.env.SITE_ALLOW_INDEXING === "true";

export const absoluteUrl = (path: string) => (siteUrl ? `${siteUrl}${path}` : undefined);

type PageMetaInput = { title?: string; description: string; path: string };

export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: siteUrl ? { canonical: path } : undefined,
    openGraph: {
      title: title ? `${title} | Siccotel` : "Siccotel",
      description,
      url: siteUrl ? path : undefined,
      siteName: "Siccotel",
      locale: "en_PK",
      type: "website",
    },
  };
}
