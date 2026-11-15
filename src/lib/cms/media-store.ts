import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata as SharpMetadata } from "sharp";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, MEDIA_URL_PREFIX, uploadDir } from "./config";
import { exec, select } from "./db";
import type { CmsImage } from "./types";

const FORMAT_TO_MIME: Record<string, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heif: "image/avif", avif: "image/avif", gif: "image/gif" };

/** Resolves a stored relative path inside the upload folder, refusing anything that escapes it. */
export function resolveUpload(relative: string) {
  const full = path.resolve(uploadDir, relative);
  if (!full.startsWith(uploadDir + path.sep)) throw new Error("Invalid media path.");
  return full;
}

/**
 * Validates an image by its actual contents (not the browser's claimed type),
 * saves it under the upload folder and records it in the media library.
 */
export async function storeImage(
  bytes: Buffer,
  fileName: string,
  options: { alt?: string; seedKey?: string; userId?: string } = {},
): Promise<CmsImage & { assetId: string }> {
  if (bytes.byteLength === 0) throw new Error("The file is empty.");
  if (bytes.byteLength > MAX_UPLOAD_BYTES) throw new Error(`Images must be ${MAX_UPLOAD_BYTES / 1024 / 1024} MB or smaller.`);
  let meta: SharpMetadata;
  try {
    meta = await sharp(bytes, { animated: true }).metadata();
  } catch {
    throw new Error("That file is not a readable image.");
  }
  const mime = meta.format ? FORMAT_TO_MIME[meta.format] : undefined;
  if (!mime || !ALLOWED_IMAGE_TYPES[mime]) throw new Error("Use a JPEG, PNG, WebP, AVIF or GIF image.");
  const width = meta.width ?? 0;
  const height = meta.pageHeight ?? meta.height ?? 0;
  if (!width || !height || width > 12000 || height > 12000) throw new Error("The image dimensions are not supported.");

  const ext = ALLOWED_IMAGE_TYPES[mime];
  const base = fileName.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "image";
  const relative = options.seedKey ? `imported/${base}.${ext}` : `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID().slice(0, 12)}-${base}.${ext}`;
  const full = resolveUpload(relative);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, bytes);
  const url = `${MEDIA_URL_PREFIX}/${relative}`;

  const existing = await select<{ id: string }>("SELECT id FROM media_assets WHERE path = ?", [relative]);
  const id = existing[0]?.id ?? crypto.randomUUID();
  if (existing[0]) {
    await exec("UPDATE media_assets SET url = ?, mime = ?, size = ?, width = ?, height = ? WHERE id = ?", [url, mime, bytes.byteLength, width, height, id]);
  } else {
    await exec(
      "INSERT INTO media_assets (id, path, url, mime, size, width, height, alt, file_name, seed_key, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, relative, url, mime, bytes.byteLength, width, height, options.alt ?? "", fileName.slice(0, 255), options.seedKey ?? null, options.userId ?? null],
    );
  }
  return { src: url, width, height, alt: options.alt ?? "", assetId: id };
}
