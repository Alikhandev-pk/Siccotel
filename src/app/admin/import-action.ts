"use server";

import crypto from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/cms/auth";
import { CMS_TAG, SEED_MARKER_KEY } from "@/lib/cms/config";
import { exec, nowSql, select, toJson } from "@/lib/cms/db";
import { defaultBanners, defaultDocs, defaultNews, defaultProducts } from "@/lib/cms/defaults";
import { storeImage } from "@/lib/cms/media-store";
import type { CmsImage } from "@/lib/cms/types";
import type { ActionResult } from "./actions";

/**
 * Copies the website's current content and images into the CMS.
 *
 * Images from public/assets keep their /assets URL in the content, so pages are
 * served the public file; a managed copy is also stored so the media library
 * lists it and it can be picked elsewhere (the reference carries its assetId).
 *
 * Idempotent: images are keyed by file name, pages and entries are inserted
 * only when missing (never overwritten), and entries keep their import key even
 * when deleted, so running it again never undoes an admin's edits, re-publishes
 * something unpublished or brings back something deleted.
 */
export async function runImport(): Promise<ActionResult> {
  try {
    const { userId } = await requireAdmin();
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
    const uploaded = new Map<string, CmsImage>();
    const isImage = (v: unknown): v is CmsImage => typeof v === "object" && v !== null && typeof (v as CmsImage).src === "string" && typeof (v as CmsImage).width === "number";
    // Public files are keyed by file name (bundled images, from older builds, by their name minus the hash).
    const seedKeyFor = (src: string) => {
      const file = src.split("/").pop() ?? src;
      return src.startsWith("/_next/") ? file.replace(/\.[a-z0-9_-]{6,}(\.[a-z0-9]+)$/i, "$1") : file;
    };

    async function migrateImage(image: CmsImage): Promise<CmsImage> {
      if (!image.src.startsWith("/") || image.src.startsWith("/media/")) return image;
      const key = seedKeyFor(image.src);
      const keepUrl = image.src.startsWith("/assets/") ? { src: image.src } : {};
      const cached = uploaded.get(key);
      if (cached) return { ...cached, ...keepUrl, alt: image.alt, blurDataURL: image.blurDataURL };
      const existing = await select<{ id: string; url: string; width: number; height: number }>("SELECT id, url, width, height FROM media_assets WHERE seed_key = ?", [key]);
      let stored: CmsImage;
      if (existing[0]) {
        stored = { src: existing[0].url, width: existing[0].width, height: existing[0].height, alt: image.alt, assetId: existing[0].id };
      } else {
        const res = await fetch(new URL(image.src, origin));
        if (!res.ok) throw new Error(`Could not read ${image.src} (${res.status}).`);
        stored = await storeImage(Buffer.from(await res.arrayBuffer()), key, { alt: image.alt, seedKey: key, userId });
      }
      uploaded.set(key, stored);
      return { ...stored, ...keepUrl, alt: image.alt, blurDataURL: image.blurDataURL };
    }

    async function migrate<T>(value: T): Promise<T> {
      if (isImage(value)) return (await migrateImage(value)) as T;
      if (Array.isArray(value)) {
        const out = [];
        for (const v of value) out.push(await migrate(v));
        return out as T;
      }
      if (typeof value === "object" && value !== null) {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) out[k] = await migrate(v);
        return out as T;
      }
      return value;
    }

    let created = 0;
    const haveDoc = new Set((await select<{ key: string }>("SELECT `key` FROM documents")).map((d) => d.key));
    for (const [key, doc] of Object.entries(defaultDocs)) {
      if (haveDoc.has(key)) continue;
      const json = toJson(await migrate(doc));
      await exec("INSERT IGNORE INTO documents (`key`, draft, published, published_at, updated_by) VALUES (?, ?, ?, ?, ?)", [key, json, json, nowSql(), userId]);
      created++;
    }

    const haveEntry = new Set((await select<{ seed_key: string }>("SELECT seed_key FROM entries WHERE seed_key IS NOT NULL")).map((e) => e.seed_key));
    for (const [collection, list] of [["banners", defaultBanners], ["products", defaultProducts], ["news", defaultNews]] as const) {
      for (const [i, entry] of list.entries()) {
        if (haveEntry.has(entry.seedKey)) continue;
        const json = toJson(await migrate(entry.data));
        await exec(
          "INSERT IGNORE INTO entries (id, collection, slug, published_slug, position, draft, published, is_published, published_at, seed_key, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)",
          [crypto.randomUUID(), collection, entry.slug, entry.slug, i + 1, json, json, new Date(Date.now() - i * 1000).toISOString().slice(0, 23).replace("T", " "), entry.seedKey, userId],
        );
        created++;
      }
    }

    // The marker switches public pages from built-in content to the database.
    const marker = toJson({ importedAt: new Date().toISOString() });
    await exec("INSERT IGNORE INTO documents (`key`, draft, published, published_at) VALUES (?, ?, ?, ?)", [SEED_MARKER_KEY, marker, marker, nowSql()]);
    updateTag(CMS_TAG);
    revalidatePath("/", "layout");
    return { ok: true, message: created ? `Imported ${created} items and ${uploaded.size} images.` : "Everything was already imported; nothing was changed." };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Import failed." };
  }
}
