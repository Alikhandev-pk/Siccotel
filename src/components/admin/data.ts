import { notFound } from "next/navigation";
import { mergeDoc } from "@/lib/cms/doc";
import { requireAdmin } from "@/lib/cms/auth";
import { parseJson, select } from "@/lib/cms/db";
import type { CmsImage, CollectionName, DocKey } from "@/lib/cms/types";
import type { MediaAsset } from "./MediaPicker";
import type { EntryRow } from "./Editors";

/** Every admin read goes through requireAdmin, so a signed-out or disabled session gets nothing. */
export async function adminMedia(): Promise<MediaAsset[]> {
  await requireAdmin();
  return select<MediaAsset>("SELECT id, url, width, height, alt, file_name, size, created_at FROM media_assets ORDER BY created_at DESC LIMIT 1000");
}

export async function adminDoc(key: DocKey) {
  await requireAdmin();
  const rows = await select<{ draft: string; published: string | null; published_at: string | null }>("SELECT draft, published, published_at FROM documents WHERE `key` = ?", [key]);
  const row = rows[0];
  return {
    value: mergeDoc(key, parseJson(row?.draft)) as unknown as Record<string, unknown>,
    hasDraftChanges: Boolean(row && row.draft !== row.published),
    publishedAt: row?.published_at ?? null,
    exists: Boolean(row),
  };
}

const firstImage = (v: Record<string, unknown> | null): string => {
  if (!v) return "";
  const pick = (x: unknown) => (x && typeof x === "object" && "src" in x ? (x as CmsImage).src : "");
  return pick(v.desktop) || pick(v.cover) || pick((v.images as unknown[] | undefined)?.[0]) || "";
};

export async function adminEntries(collection: CollectionName, titleKey: string): Promise<EntryRow[]> {
  await requireAdmin();
  const rows = await select<{ id: string; slug: string | null; draft: string; published: string | null; is_published: number }>(
    "SELECT id, slug, draft, published, is_published FROM entries WHERE collection = ? AND deleted_at IS NULL ORDER BY position ASC",
    [collection],
  );
  return rows.map((e) => {
    const draft = parseJson<Record<string, unknown>>(e.draft);
    return {
      id: e.id,
      slug: e.slug ?? "",
      title: String(draft?.[titleKey] ?? ""),
      thumb: firstImage(draft),
      isPublished: Boolean(e.is_published),
      hasDraftChanges: Boolean(e.is_published) && e.draft !== e.published,
    };
  });
}

export async function adminEntry(collection: CollectionName, id: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const rows = await select<{ id: string; slug: string | null; draft: string; published: string | null; is_published: number }>(
    "SELECT id, slug, draft, published, is_published FROM entries WHERE id = ? AND collection = ? AND deleted_at IS NULL",
    [id, collection],
  );
  const row = rows[0];
  if (!row) notFound();
  return {
    id: row.id,
    slug: row.slug ?? "",
    value: parseJson<Record<string, unknown>>(row.draft) ?? {},
    isPublished: Boolean(row.is_published),
    hasDraftChanges: Boolean(row.is_published) && row.draft !== row.published,
  };
}

export type NewsRow = {
  id: string;
  slug: string;
  liveSlug: string;
  title: string;
  summary: string;
  tags: string[];
  thumb: string;
  coverPosition: string;
  status: "published" | "changed" | "draft" | "unpublished";
  updatedAt: string;
};

/** Article rows for the News module, with status and keywords for filtering. */
export async function adminNewsRows(): Promise<NewsRow[]> {
  await requireAdmin();
  const rows = await select<{ id: string; slug: string | null; published_slug: string | null; draft: string; published: string | null; is_published: number; updated_at: string }>(
    "SELECT id, slug, published_slug, draft, published, is_published, updated_at FROM entries WHERE collection = ? AND deleted_at IS NULL ORDER BY position ASC, updated_at DESC",
    ["news"],
  );
  return rows.map((e) => {
    const draft = parseJson<Record<string, unknown>>(e.draft) ?? {};
    const live = Boolean(e.is_published);
    return {
      id: e.id,
      slug: e.slug ?? "",
      liveSlug: e.published_slug ?? e.slug ?? "",
      title: String(draft.title ?? ""),
      summary: String(draft.summary ?? ""),
      tags: Array.isArray(draft.tags) ? (draft.tags as string[]) : [],
      thumb: firstImage(draft),
      coverPosition: String(draft.coverPosition || "50% 50%"),
      status: live ? (e.draft !== e.published ? "changed" : "published") : e.published ? "unpublished" : "draft",
      updatedAt: e.updated_at,
    };
  });
}
