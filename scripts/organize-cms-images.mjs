// Copies every image used by published CMS content from managed storage into
// public/assets/<category>/ and points the content at the public /assets/… URL.
//
//   npm run cms:organize-images             apply
//   npm run cms:organize-images -- --dry-run  report only, change nothing
//
// Categories: products (product images), articles (news covers and galleries),
// banners (hero banners), logos (partner, client and brand logos) and website
// (every other page image). An image used in several places goes to the first
// of those that applies, in that order.
//
// Safe to rerun:
//   - Files are copied byte for byte and checked by SHA-256. When the same bytes
//     are already anywhere in public/assets, that file is reused instead of being
//     copied again; a different file with the same name gets a hash suffix
//     instead of being overwritten.
//   - Only /media/… references are moved, so content already on /assets/… is
//     left alone and a second run changes nothing.
//   - Drafts that use a moved image are pointed at the public copy too, so a
//     later publish keeps it. Images used only by drafts stay in managed storage.
//   - Nothing is deleted. Upload originals stay in the upload folder and in the
//     media library; each reference keeps its assetId, so the library still
//     refuses to delete an original that content uses.
//   - The rows it changes are saved to storage/backups first, and timestamps are
//     left as they were: the content itself does not change.
//
// Next.js serves only the public files present when the site is built, so run
// this before `npm run build` (and rebuild after running it on a live server).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { writeAssetManifest } from "./asset-manifest.mjs";
import { loadEnv } from "./env.mjs";

loadEnv();
const dryRun = process.argv.includes("--dry-run");
const url = process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL in .env.local (see .env.example).");
const uploadDir = path.resolve(process.env.UPLOAD_DIR?.trim() || "storage/uploads");
const publicRoot = path.resolve("public/assets");

const PRIORITY = ["products", "banners", "articles", "logos", "website"];
const COLLECTION_CATEGORY = { products: "products", news: "articles", banners: "banners" };
const isImage = (v) => typeof v === "object" && v !== null && typeof v.src === "string" && typeof v.width === "number";
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

/** Calls fn(image, key) for every image object, where key is the field holding it. */
function eachImage(value, fn, key = "") {
  if (isImage(value)) return fn(value, key);
  if (Array.isArray(value)) return value.forEach((v) => eachImage(v, fn, key));
  if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) eachImage(v, fn, k);
}

/** A copy of value with every image whose src is in `moves` pointed at its new URL. */
function rewrite(value, moves) {
  if (isImage(value)) return moves.has(value.src) ? { ...value, src: moves.get(value.src) } : value;
  if (Array.isArray(value)) return value.map((v) => rewrite(v, moves));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewrite(v, moves)]));
  return value;
}

function uploadFile(src) {
  const rel = decodeURIComponent(src.slice("/media/".length));
  const full = path.resolve(uploadDir, rel);
  return full.startsWith(uploadDir + path.sep) ? full : null;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

/** Every file already in public/assets, by content. */
const existing = new Map();
for (const file of walk(publicRoot).sort()) if (!existing.has(sha256(file))) existing.set(sha256(file), file);

/**
 * Where a file goes: the existing public copy of the same bytes, or category/name
 * without the random prefix uploads get, never overwriting other bytes.
 */
function placeFile(source, category, hash) {
  if (existing.has(hash)) return { target: existing.get(hash), copy: false };
  const base = path.basename(source).replace(/^[0-9a-f]{8}-[0-9a-f]{3}-/i, "").toLowerCase();
  const ext = path.extname(base);
  for (const name of [base, `${base.slice(0, -ext.length)}-${hash.slice(0, 8)}${ext}`]) {
    const target = path.join(publicRoot, category, name);
    if (!fs.existsSync(target)) return { target, copy: true };
    if (sha256(target) === hash) return { target, copy: false };
  }
  throw new Error(`No free name for ${source} in ${category}/.`);
}

const conn = await mysql.createConnection({ uri: url, ...(process.env.DATABASE_SSL === "true" ? { ssl: { rejectUnauthorized: true } } : {}) });
try {
  await conn.beginTransaction();
  const [docs] = await conn.query("SELECT `key`, draft, published FROM documents FOR UPDATE");
  const [entries] = await conn.query("SELECT id, collection, slug, draft, published, is_published, deleted_at FROM entries FOR UPDATE");

  // 1. Every image published content uses, with the category it belongs in.
  const wanted = new Map(); // src -> category
  const want = (src, category) => {
    const current = wanted.get(src);
    if (!current || PRIORITY.indexOf(category) < PRIORITY.indexOf(current)) wanted.set(src, category);
  };
  for (const d of docs) if (d.published) eachImage(JSON.parse(d.published), (img, key) => want(img.src, key === "logo" ? "logos" : "website"));
  for (const e of entries) {
    if (!e.published || !e.is_published || e.deleted_at) continue;
    eachImage(JSON.parse(e.published), (img) => want(img.src, COLLECTION_CATEGORY[e.collection] ?? "website"));
  }

  // 2. Copy the managed-storage ones into public/assets.
  const moves = new Map(); // /media/… -> /assets/…
  const missing = [];
  let copied = 0;
  for (const [src, category] of [...wanted].sort()) {
    if (!src.startsWith("/media/")) continue;
    const source = uploadFile(src);
    if (!source || !fs.existsSync(source)) {
      missing.push(src);
      continue;
    }
    const hash = sha256(source);
    const { target, copy } = placeFile(source, category, hash);
    if (copy && !dryRun) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
      if (sha256(target) !== hash) throw new Error(`Copy of ${src} does not match the original.`);
    }
    existing.set(hash, target);
    if (copy) copied++;
    const publicUrl = `/assets/${path.relative(publicRoot, target).split(path.sep).join("/")}`;
    moves.set(src, publicUrl);
    console.log(`${copy ? (dryRun ? "would copy" : "copied") : "reused"}  ${src}  ->  ${publicUrl}`);
  }

  // 3. Point drafts and published versions at the public copies.
  const changes = [];
  for (const d of docs) {
    const draft = JSON.stringify(rewrite(JSON.parse(d.draft), moves));
    const published = d.published && JSON.stringify(rewrite(JSON.parse(d.published), moves));
    if (draft !== d.draft || published !== d.published) changes.push({ table: "documents", id: d.key, before: d, draft, published });
  }
  for (const e of entries) {
    const draft = JSON.stringify(rewrite(JSON.parse(e.draft), moves));
    const published = e.published && JSON.stringify(rewrite(JSON.parse(e.published), moves));
    if (draft !== e.draft || published !== e.published) changes.push({ table: "entries", id: e.id, before: e, draft, published });
  }

  if (dryRun) {
    await conn.rollback();
  } else {
    if (changes.length) {
      const backupDir = path.resolve("storage/backups");
      fs.mkdirSync(backupDir, { recursive: true });
      const backup = path.join(backupDir, `organize-cms-images-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
      fs.writeFileSync(backup, JSON.stringify(changes.map((c) => ({ table: c.table, id: c.id, draft: c.before.draft, published: c.before.published }))));
      console.log(`backup of ${changes.length} rows: ${path.relative(process.cwd(), backup)}`);
    }
    for (const c of changes) {
      if (c.table === "documents") await conn.execute("UPDATE documents SET draft = ?, published = ? WHERE `key` = ?", [c.draft, c.published, c.id]);
      else await conn.execute("UPDATE entries SET draft = ?, published = ? WHERE id = ?", [c.draft, c.published, c.id]);
    }
    await conn.commit();
  }

  // 4. Every /assets reference in published content must exist on disk.
  const [docsAfter] = await conn.query("SELECT published FROM documents WHERE published IS NOT NULL");
  const [entriesAfter] = await conn.query("SELECT published FROM entries WHERE published IS NOT NULL AND is_published = 1 AND deleted_at IS NULL");
  const broken = new Set();
  for (const r of [...docsAfter, ...entriesAfter])
    eachImage(JSON.parse(r.published), (img) => {
      const src = dryRun && moves.has(img.src) ? null : img.src;
      if (src?.startsWith("/assets/") && !fs.existsSync(path.join(publicRoot, decodeURIComponent(src.slice("/assets/".length))))) broken.add(src);
    });

  if (copied && !dryRun) console.log(`asset manifest: ${await writeAssetManifest()} images`);
  console.log(
    `${dryRun ? "[dry run] " : ""}${moves.size} published images on /assets (${copied} ${dryRun ? "to copy" : "copied"}), ` +
      `${changes.length} rows ${dryRun ? "to update" : "updated"}, ${missing.length} missing uploads, ${broken.size} broken /assets references.`,
  );
  for (const m of missing) console.warn(`missing upload, left as is: ${m}`);
  for (const b of broken) console.warn(`BROKEN: ${b} is not in public/assets`);
  if (broken.size) process.exitCode = 1;
} catch (e) {
  await conn.rollback().catch(() => {});
  throw e;
} finally {
  await conn.end();
}
