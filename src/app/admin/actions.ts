"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireAdmin, startSession } from "@/lib/cms/auth";
import { CMS_TAG, cmsConfigured } from "@/lib/cms/config";
import { stampMarkersArtwork } from "@/lib/cms/artwork";
import { exec, nowSql, parseJson, select, toJson } from "@/lib/cms/db";
import { defaultDocs } from "@/lib/cms/defaults";
import { resolveUpload } from "@/lib/cms/media-store";
import { mergeContent, sanitizeContent } from "@/lib/cms/merge";
import { DOC_KEYS, type CollectionName, type DocKey } from "@/lib/cms/types";

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };

const COLLECTIONS: CollectionName[] = ["banners", "products", "news"];

/**
 * Makes a publish visible on the next request: expires the cached CMS data and
 * the prerendered pages built from it. Without the path revalidation, pages kept
 * serving their cached copy until their own timer ran out.
 */
function refreshPublicSite() {
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
}
const SINGULAR: Record<string, string> = { banners: "banner", products: "product", news: "article" };

async function run(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await fn();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const isDuplicate = (e: unknown) => (e as { code?: string })?.code === "ER_DUP_ENTRY";

/* Auth ------------------------------------------------------------------------------------- */

const failures = new Map<string, { count: number; until: number }>();

export async function signIn(_: unknown, form: FormData): Promise<{ error?: string }> {
  if (!cmsConfigured) return { error: "The database is not configured yet." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const lock = failures.get(email);
  if (lock && lock.until > Date.now()) return { error: "Too many attempts. Wait a minute and try again." };
  if (!(await startSession(email, password))) {
    const count = (lock?.count ?? 0) + 1;
    failures.set(email, { count, until: count >= 5 ? Date.now() + 60_000 : 0 });
    return { error: "Those details did not match an admin account." };
  }
  failures.delete(email);
  redirect("/admin");
}

export async function signOut() {
  await endSession();
  redirect("/admin/login");
}

/* Documents -------------------------------------------------------------------------------- */

function assertDocKey(key: string): asserts key is DocKey {
  if (!DOC_KEYS.includes(key as DocKey)) throw new Error("Unknown page.");
}

function cleanObject(content: unknown) {
  const data = sanitizeContent(content);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid content.");
  return data as Record<string, unknown>;
}

/** Sanitised content; for the homepage, also ties the map markers to the map file they were measured on. */
async function prepareDoc(key: DocKey, content: unknown) {
  const data = cleanObject(content);
  if (key === "home") {
    const rows = await select<{ draft: string }>("SELECT draft FROM documents WHERE `key` = 'home'");
    await stampMarkersArtwork(data, mergeContent(defaultDocs.home, parseJson(rows[0]?.draft)).reach);
  }
  return data;
}

export async function saveDocDraft(key: string, content: unknown): Promise<ActionResult> {
  return run(async () => {
    assertDocKey(key);
    const { userId } = await requireAdmin();
    await exec("INSERT INTO documents (`key`, draft, updated_at, updated_by) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE draft = VALUES(draft), updated_at = VALUES(updated_at), updated_by = VALUES(updated_by)", [key, toJson(await prepareDoc(key, content)), nowSql(), userId]);
    return { ok: true, message: "Draft saved. The live page is unchanged until you publish." };
  });
}

export async function publishDoc(key: string, content: unknown): Promise<ActionResult> {
  return run(async () => {
    assertDocKey(key);
    const { userId } = await requireAdmin();
    const json = toJson(await prepareDoc(key, content));
    const now = nowSql();
    await exec(
      "INSERT INTO documents (`key`, draft, published, published_at, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE draft = VALUES(draft), published = VALUES(published), published_at = VALUES(published_at), updated_at = VALUES(updated_at), updated_by = VALUES(updated_by)",
      [key, json, json, now, now, userId],
    );
    refreshPublicSite();
    return { ok: true, message: "Published. The public site now shows these changes." };
  });
}

export async function discardDocDraft(key: string): Promise<ActionResult> {
  return run(async () => {
    assertDocKey(key);
    await requireAdmin();
    const rows = await select<{ published: string | null }>("SELECT published FROM documents WHERE `key` = ?", [key]);
    if (!rows[0]?.published) throw new Error("Nothing is published yet, so there is no version to return to.");
    await exec("UPDATE documents SET draft = published, updated_at = ? WHERE `key` = ?", [nowSql(), key]);
    return { ok: true, message: "Draft discarded." };
  });
}

/* Collection entries ------------------------------------------------------------------------- */

function assertCollection(name: string): asserts name is CollectionName {
  if (!COLLECTIONS.includes(name as CollectionName)) throw new Error("Unknown collection.");
}

export async function createEntry(collection: string, initial: unknown, title: string): Promise<ActionResult> {
  return run(async () => {
    assertCollection(collection);
    const { userId } = await requireAdmin();
    const last = await select<{ p: number | null }>("SELECT MAX(position) AS p FROM entries WHERE collection = ? AND deleted_at IS NULL", [collection]);
    const id = crypto.randomUUID();
    const slug = `${slugify(title) || collection.slice(0, -1)}-${id.slice(0, 4)}`;
    await exec("INSERT INTO entries (id, collection, slug, position, draft, updated_by) VALUES (?, ?, ?, ?, ?, ?)", [id, collection, slug, (last[0]?.p ?? 0) + 1, toJson(cleanObject(initial)), userId]);
    return { ok: true, id };
  });
}

/** Server-side checks for article fields; returns the cleaned article. */
function validateArticle(data: Record<string, unknown>) {
  const title = String(data.title ?? "").trim();
  if (!title) throw new Error("Enter a title.");
  if (title.length > 200) throw new Error("Keep the title under 200 characters.");
  const date = String(data.date ?? "").trim();
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Use a date like 2026-11-14, or leave it empty.");
  const position = String(data.coverPosition ?? "").trim() || "50% 50%";
  const m = position.match(/^(\d{1,3}(?:\.\d+)?)% (\d{1,3}(?:\.\d+)?)%$/);
  if (!m || Number(m[1]) > 100 || Number(m[2]) > 100) throw new Error('The crop position must look like "50% 20%".');
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const cleanTags = [...new Set(tags.map((t) => String(t).trim().toLowerCase().replace(/\s+/g, " ")).filter(Boolean))];
  if (cleanTags.length > 20) throw new Error("Use at most 20 keywords.");
  if (cleanTags.some((t) => t.length > 40)) throw new Error("Keep each keyword under 40 characters.");
  return { ...data, title, date, coverPosition: position, tags: cleanTags, summary: String(data.summary ?? "").slice(0, 600) };
}

async function writeEntry(id: string, content: unknown, slug: string | undefined, publish: boolean): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const rows = await select<{ collection: string; published_slug: string | null; slug: string | null }>("SELECT collection, published_slug, slug FROM entries WHERE id = ? AND deleted_at IS NULL", [id]);
  const entry = rows[0];
  if (!entry) throw new Error("That item no longer exists.");
  let data = cleanObject(content) as Record<string, unknown>;
  if (entry.collection === "news") data = validateArticle(data);
  const json = toJson(data);
  const now = nowSql();
  const sets = ["draft = ?", "updated_at = ?", "updated_by = ?"];
  const params: unknown[] = [json, now, userId];
  let nextSlug = entry.slug;
  if (slug !== undefined) {
    const clean = slugify(slug);
    if (!clean) throw new Error("Enter a URL slug.");
    sets.push("slug = ?");
    params.push(clean);
    nextSlug = clean;
  }
  if (publish) {
    // The live URL changes only on publish; the old one keeps working through a redirect.
    sets.push("published = ?", "is_published = 1", "published_at = ?", "published_slug = ?");
    params.push(json, now, nextSlug);
  }
  try {
    await exec(`UPDATE entries SET ${sets.join(", ")} WHERE id = ? AND deleted_at IS NULL`, [...params, id]);
  } catch (e) {
    if (isDuplicate(e)) throw new Error("Another item already uses that URL slug.");
    throw e;
  }
  if (publish && entry.published_slug && nextSlug && entry.published_slug !== nextSlug) {
    await exec("INSERT INTO slug_redirects (collection, old_slug, entry_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE entry_id = VALUES(entry_id)", [entry.collection, entry.published_slug, id]);
  }
  if (publish && nextSlug) await exec("DELETE FROM slug_redirects WHERE collection = ? AND old_slug = ?", [entry.collection, nextSlug]);
  if (publish) refreshPublicSite();
  return { ok: true, message: publish ? "Published. The public site now shows this version." : "Draft saved. The live version is unchanged until you publish." };
}

export async function saveEntryDraft(id: string, content: unknown, slug?: string) {
  return run(() => writeEntry(id, content, slug, false));
}

export async function publishEntry(id: string, content: unknown, slug?: string) {
  return run(() => writeEntry(id, content, slug, true));
}

/** Publishes the saved draft as it stands (used by the article list). */
export async function publishSavedDraft(id: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    const rows = await select<{ draft: string; slug: string | null }>("SELECT draft, slug FROM entries WHERE id = ? AND deleted_at IS NULL", [id]);
    if (!rows[0]) throw new Error("That item no longer exists.");
    return writeEntry(id, JSON.parse(rows[0].draft), rows[0].slug ?? undefined, true);
  });
}

export async function unpublishEntry(id: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await exec("UPDATE entries SET is_published = 0, updated_at = ? WHERE id = ?", [nowSql(), id]);
    refreshPublicSite();
    return { ok: true, message: "Unpublished. It is no longer shown on the public site." };
  });
}

export async function deleteEntry(id: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    // Soft delete keeps the import key, so re-running the import never brings it back.
    // The statement auto-commits before it returns, and success is reported only when
    // it changed exactly this live row (not a missing or already-deleted one).
    const result = await exec("UPDATE entries SET deleted_at = ?, is_published = 0, slug = NULL WHERE id = ? AND deleted_at IS NULL", [nowSql(), id]);
    if (result.affectedRows !== 1) throw new Error("This item was not deleted: it no longer exists or was already deleted. Reload the list to see the current items.");
    refreshPublicSite();
    return { ok: true, message: "Deleted. It is no longer shown on the public site." };
  });
}

export async function reorderEntries(collection: string, ids: string[]): Promise<ActionResult> {
  return run(async () => {
    assertCollection(collection);
    await requireAdmin();
    for (const [i, id] of ids.entries()) await exec("UPDATE entries SET position = ? WHERE id = ? AND collection = ?", [i + 1, id, collection]);
    refreshPublicSite();
    return { ok: true, message: "Order saved and live." };
  });
}

/* Media ---------------------------------------------------------------------------------------- */

export async function updateMediaAlt(id: string, alt: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await exec("UPDATE media_assets SET alt = ? WHERE id = ?", [alt.slice(0, 500), id]);
    return { ok: true, message: "Saved." };
  });
}

/** Content that mentions an asset, in drafts or published versions. */
async function mediaReferences(id: string, url: string) {
  const found: string[] = [];
  const mentions = (json: string | null) => Boolean(json && (json.includes(id) || json.includes(url)));
  for (const d of await select<{ key: string; draft: string; published: string | null }>("SELECT `key`, draft, published FROM documents"))
    if (mentions(d.draft) || mentions(d.published)) found.push(`page “${d.key}”`);
  for (const e of await select<{ collection: string; slug: string | null; draft: string; published: string | null }>("SELECT collection, slug, draft, published FROM entries WHERE deleted_at IS NULL"))
    if (mentions(e.draft) || mentions(e.published)) found.push(`${SINGULAR[e.collection] ?? e.collection} “${e.slug ?? ""}”`);
  return found;
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    const rows = await select<{ id: string; path: string; url: string }>("SELECT id, path, url FROM media_assets WHERE id = ?", [id]);
    const asset = rows[0];
    if (!asset) throw new Error("That file no longer exists.");
    const refs = await mediaReferences(asset.id, asset.url);
    if (refs.length) throw new Error(`Still in use by ${refs.slice(0, 4).join(", ")}${refs.length > 4 ? ` and ${refs.length - 4} more` : ""}. Replace it there first.`);
    await exec("DELETE FROM media_assets WHERE id = ?", [id]);
    await fs.rm(resolveUpload(asset.path), { force: true });
    return { ok: true, message: "Deleted." };
  });
}


/** Dashboard quick action: creates an empty draft and opens it in the editor. */
export async function createAndOpen(form: FormData) {
  const collection = String(form.get("collection") ?? "");
  assertCollection(collection);
  const { collectionSchemas } = await import("@/lib/cms/schemas");
  const { empty, singular } = collectionSchemas[collection];
  const r = await createEntry(collection, empty, String(empty.title ?? empty.name ?? singular));
  if (!r.ok || !r.id) throw new Error(r.ok ? "Could not create the item." : r.error);
  redirect(`/admin/${collection}/${r.id}`);
}
