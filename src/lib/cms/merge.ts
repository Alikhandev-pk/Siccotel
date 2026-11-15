/**
 * Lays stored content over the code defaults: objects merge key by key (so a
 * field added in code later still has a value), while arrays and scalars from
 * the database replace the default outright (so removed items stay removed).
 */
export function mergeContent<T>(base: T, stored: unknown): T {
  if (stored === undefined || stored === null) return base;
  if (Array.isArray(base) || Array.isArray(stored)) return (Array.isArray(stored) ? stored : base) as T;
  if (isObject(base) && isObject(stored)) {
    const out: Record<string, unknown> = { ...base };
    for (const [k, v] of Object.entries(stored)) out[k] = k in base ? mergeContent((base as Record<string, unknown>)[k], v) : v;
    return out as T;
  }
  return (typeof stored === typeof base ? stored : base) as T;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Links an admin types are limited to web, site-relative, email and phone links. */
export function safeHref(value: unknown): string {
  if (typeof value !== "string") return "";
  const v = value.trim();
  if (!v) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(v)) return v;
  return "";
}

const HREF_KEYS = new Set(["href", "url", "storeUrl", "ctaHref", "actionHref", "topBarPhoneHref", "siccoStore", "siccotelTelecom", "ptaDirbs", "carlcareWarranty", "appleCoverage"]);

/** Walks submitted content: trims strings, drops unsafe link schemes, caps sizes. */
export function sanitizeContent(value: unknown, key = "", depth = 0): unknown {
  if (depth > 12) return null;
  if (typeof value === "string") {
    const trimmed = value.length > 20000 ? value.slice(0, 20000) : value;
    return HREF_KEYS.has(key) ? safeHref(trimmed) : trimmed;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 200).map((v) => sanitizeContent(v, "", depth + 1));
  if (isObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (k !== "__proto__" && k !== "constructor") out[k] = sanitizeContent(v, k, depth + 1);
    return out;
  }
  return null;
}
