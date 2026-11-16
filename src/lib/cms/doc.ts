import { defaultDocs } from "./defaults";
import { mergeContent } from "./merge";
import type { DocKey, DocMap } from "./types";

/**
 * A stored document over its code defaults (mergeContent), for public pages and the admin alike.
 *
 * Lists from the database replace the defaults outright, so a field added to list items
 * after the content was saved would never appear. Milestone brands are such a field: a
 * stored milestone without a `brands` key takes the brands of the built-in milestone for
 * the same period. Brands an admin has saved, even an empty list, are kept.
 */
export function mergeDoc<K extends DocKey>(key: K, stored: unknown): DocMap[K] {
  const doc = mergeContent(defaultDocs[key], stored);
  if (key !== "about") return doc;
  const about = doc as DocMap["about"];
  const builtIn = new Map(defaultDocs.about.journey.milestones.map((m) => [m.period.trim(), m.brands]));
  const milestones = about.journey.milestones.map((m) => (m.brands === undefined && builtIn.has(m.period.trim()) ? { ...m, brands: builtIn.get(m.period.trim()) } : m));
  return { ...about, journey: { ...about.journey, milestones } } as DocMap[K];
}
