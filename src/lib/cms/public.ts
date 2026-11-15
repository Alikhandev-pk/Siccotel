/**
 * Published content for public pages. Reads select only the `published`
 * columns, so drafts never leave the server. Each read is cached and tagged;
 * the admin's publish actions expire the tag, so pages refresh without a deploy.
 *
 * Until a database is configured and the website import has run, every getter
 * returns the site's current content (defaults.ts). After the import the
 * database is authoritative: an unpublished or deleted item stays hidden, and a
 * failed read is an error rather than a silent switch back to defaults.ts.
 */
import { cacheLife, cacheTag } from "next/cache";
import { CMS_TAG, cmsConfigured, SEED_MARKER_KEY } from "./config";
import { parseJson, select } from "./db";
import { defaultBanners, defaultDocs, defaultNews, defaultProducts, type SeedEntry } from "./defaults";
import { mergeContent } from "./merge";
import type { CollectionMap, CollectionName, DocKey, DocMap, Published } from "./types";

const defaultCollections = { banners: defaultBanners, products: defaultProducts, news: defaultNews } as const;

function fromDefaults<C extends CollectionName>(name: C): Published<CollectionMap[C]>[] {
  return (defaultCollections[name] as SeedEntry<CollectionMap[C]>[]).map((e) => ({ ...e.data, id: e.seedKey, slug: e.slug }));
}

/** All published documents, with whether the import has run. */
async function loadDocuments(): Promise<{ seeded: boolean; docs: Record<string, unknown> }> {
  "use cache";
  // Minutes, not days: a restart or another instance picks up publishes within a minute
  // even if it missed the tag invalidation. Publishing still refreshes immediately.
  cacheLife("minutes");
  cacheTag(CMS_TAG);
  if (!cmsConfigured) return { seeded: false, docs: {} };
  // A failed read throws instead of falling back to the built-in content: that content
  // still lists items admins have deleted, and a fallback would be cached and served as
  // if it were current. When a read fails, Next keeps serving the last good page.
  const rows = await select<{ key: string; published: string }>("SELECT `key`, published FROM documents WHERE published IS NOT NULL");
  const docs: Record<string, unknown> = Object.fromEntries(rows.map((r) => [r.key, parseJson(r.published)]));
  return { seeded: SEED_MARKER_KEY in docs, docs };
}

export async function getDoc<K extends DocKey>(key: K): Promise<DocMap[K]> {
  const { seeded, docs } = await loadDocuments();
  if (!seeded) return defaultDocs[key];
  return mergeContent(defaultDocs[key], docs[key]);
}

export async function getSettings() {
  return getDoc("settings");
}

async function loadCollection<C extends CollectionName>(name: C): Promise<Published<CollectionMap[C]>[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CMS_TAG);
  const { seeded } = await loadDocuments();
  if (!seeded) return fromDefaults(name);
  // No built-in fallback on a failed read (see loadDocuments): it would bring back deleted items.
  const rows = await select<{ id: string; slug: string | null; published: string }>(
    "SELECT id, COALESCE(published_slug, slug) AS slug, published FROM entries WHERE collection = ? AND is_published = 1 AND published IS NOT NULL AND deleted_at IS NULL ORDER BY position ASC, published_at DESC",
    [name],
  );
  return rows.map((r) => ({ ...(parseJson<CollectionMap[C]>(r.published) as CollectionMap[C]), id: r.id, slug: r.slug ?? r.id }));
}

export const getBanners = () => loadCollection("banners");
export const getProducts = () => loadCollection("products");
export const getNews = () => loadCollection("news");

export async function getArticle(slug: string) {
  return (await getNews()).find((a) => a.slug === slug);
}

/** The current slug for an old article URL, when its slug changed and it is still published. */
export async function getRedirectedSlug(collection: CollectionName, oldSlug: string): Promise<string | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CMS_TAG);
  if (!cmsConfigured || !(await loadDocuments()).seeded) return null;
  try {
    const rows = await select<{ slug: string }>(
      "SELECT COALESCE(e.published_slug, e.slug) AS slug FROM slug_redirects r JOIN entries e ON e.id = r.entry_id WHERE r.collection = ? AND r.old_slug = ? AND e.is_published = 1 AND e.deleted_at IS NULL",
      [collection, oldSlug],
    );
    return rows[0]?.slug && rows[0].slug !== oldSlug ? rows[0].slug : null;
  } catch {
    return null;
  }
}
