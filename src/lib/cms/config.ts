import path from "node:path";

/**
 * MySQL connection, e.g. mysql://user:password@127.0.0.1:3306/siccotel.
 * Server-only: never prefix it with NEXT_PUBLIC_. Point it at Hostinger MySQL
 * later without code changes; set DATABASE_SSL=true when the host requires TLS.
 */
export const databaseUrl = process.env.DATABASE_URL?.trim() || "";
export const databaseSsl = process.env.DATABASE_SSL === "true";

/** True once the deployment has a database to read from. */
export const cmsConfigured = Boolean(databaseUrl);

/** Uploaded images live here (gitignored) and are served by /media/[...path]. */
export const uploadDir = path.resolve(process.env.UPLOAD_DIR?.trim() || "storage/uploads");
export const MEDIA_URL_PREFIX = "/media";

/** Upload limits, checked on the server before anything is stored (shared with the admin's browser code). */
export { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "./limits";

/** Marks a completed website import; after it, the database is authoritative. */
export const SEED_MARKER_KEY = "_meta";

/** Every public read carries this tag, so a publish refreshes all affected pages. */
export const CMS_TAG = "cms";

export const SESSION_COOKIE = "siccotel_admin";
export const SESSION_DAYS = 7;
