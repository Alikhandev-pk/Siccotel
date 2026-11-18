/**
 * Ties the Nationwide Reach overlays to the exact map file they were made for.
 *
 * The map image is identified by the SHA-256 of its bytes, not by its URL or
 * size, so a replacement map (even one with the same name and dimensions) never
 * receives outlines or markers measured on the old one:
 *   - region outlines come from src/content/reach-artwork.ts, keyed by fingerprint;
 *   - city markers carry the fingerprint they were measured on (reach.markersArtwork).
 * Anything that does not match the current file is left off the map.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { asset } from "@/content/asset-manifest";
import { findArtwork, REGIONAL_MAP_FINGERPRINT, type MapRegion, type RegionId } from "@/content/reach-artwork";
import { CMS_TAG, MEDIA_URL_PREFIX } from "./config";
import { resolveUpload } from "./media-store";
import type { HomeDoc, MapCity } from "./types";

const outlinedMap = asset("website/pakistan-regional-map-outlined.png");

/** Files that may hold a site-relative image URL: uploads, public/assets, or a bundled image built by Next. */
function candidateFiles(src: string): string[] {
  const clean = src.split(/[?#]/)[0];
  if (/^\/assets\/[\w./-]+$/.test(clean) && !clean.includes("..")) {
    return [path.join(/* turbopackIgnore: true */ process.cwd(), "public", decodeURIComponent(clean))];
  }
  if (clean.startsWith(`${MEDIA_URL_PREFIX}/`)) {
    try {
      return [resolveUpload(decodeURIComponent(clean.slice(MEDIA_URL_PREFIX.length + 1)))];
    } catch {
      return [];
    }
  }
  const bundled = clean.match(/^\/_next\/static\/media\/([\w.-]+)$/)?.[1];
  if (bundled) {
    const root = path.join(/* turbopackIgnore: true */ process.cwd(), ".next");
    return [path.join(root, "static", "media", bundled), path.join(root, "dev", "static", "media", bundled)];
  }
  return [];
}

/** "sha256:<hex>" of the image file behind `src`, or null when it cannot be read. */
export async function imageFingerprint(src: string): Promise<string | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CMS_TAG);
  // The regional map in public/assets is fixed at build time, so its fingerprint is known
  // without reading it from disk (serverless hosts such as Vercel do not ship public files
  // with the server code).
  if (src.split(/[?#]/)[0] === outlinedMap.src) return REGIONAL_MAP_FINGERPRINT;
  for (const file of candidateFiles(src)) {
    try {
      return `sha256:${crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex")}`;
    } catch {
      // try the next location
    }
  }
  return null;
}

function parsePath(d: string): [number, number][] {
  return d
    .replace(/[MZ]/g, "")
    .split("L")
    .map((pair) => pair.trim().split(/[\s,]+/).map(Number) as [number, number]);
}

function contains(poly: [number, number][], x: number, y: number) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * The region a city dot is drawn in. Dots can sit on a border (Quetta does), so
 * the region covering most of a small disc around the dot wins; the disc grows
 * until it reaches a region.
 */
function regionOf(city: MapCity, regions: { id: RegionId; poly: [number, number][] }[], width: number, height: number): RegionId | null {
  const cx = (city.x / 100) * width;
  const cy = (city.y / 100) * height;
  for (const r of [3, 6, 12]) {
    const votes = new Map<RegionId, number>();
    for (let dy = -r; dy <= r; dy += 0.5)
      for (let dx = -r; dx <= r; dx += 0.5) {
        if (dx * dx + dy * dy > r * r) continue;
        const hit = regions.find((region) => contains(region.poly, cx + dx, cy + dy));
        if (hit) votes.set(hit.id, (votes.get(hit.id) ?? 0) + 1);
      }
    if (votes.size) return [...votes].sort((a, b) => b[1] - a[1])[0][0];
  }
  return null;
}

export type ReachRegion = MapRegion & { cityIds: string[] };

export type ReachArtwork = {
  /** Layout space of the overlay (the map's proportions). */
  layoutWidth: number;
  layoutHeight: number;
  /** City markers were measured on this exact file. */
  markers: boolean;
  /** Region outlines traced from this exact file, with the cities drawn inside each. */
  regions: ReachRegion[] | null;
};

export async function resolveReachArtwork(reach: HomeDoc["reach"]): Promise<ReachArtwork> {
  const fingerprint = await imageFingerprint(reach.map.src);
  const markers = Boolean(fingerprint) && fingerprint === reach.markersArtwork;
  const artwork = findArtwork(fingerprint);
  const layoutWidth = artwork?.layoutWidth ?? (reach.layoutWidth || 478);
  const layoutHeight = artwork?.layoutHeight ?? (reach.layoutHeight || 412);
  // Grouping cities by region needs both to belong to this file.
  if (!artwork || !markers) return { layoutWidth, layoutHeight, markers, regions: null };
  const shapes = artwork.regions.map((r) => ({ id: r.id, poly: parsePath(r.path) }));
  const regions = artwork.regions.map((r) => ({ ...r, cityIds: [] as string[] }));
  for (const city of reach.cities) {
    const id = regionOf(city, shapes, layoutWidth, layoutHeight);
    regions.find((r) => r.id === id)?.cityIds.push(city.id);
  }
  return { layoutWidth, layoutHeight, markers, regions };
}

/**
 * Keeps reach.markersArtwork honest when the homepage is saved: it moves to the
 * current map only when the markers themselves were edited (so they were placed
 * on this map). Replacing the map alone leaves it pointing at the old file, and
 * the markers stay off the new map until they are re-measured.
 */
export async function stampMarkersArtwork(next: Record<string, unknown>, previous: HomeDoc["reach"]): Promise<void> {
  const reach = next.reach as Partial<HomeDoc["reach"]> | undefined;
  if (!reach || typeof reach !== "object") return;
  const markerData = (r: Partial<HomeDoc["reach"]>) => JSON.stringify([r.cities ?? [], r.layoutWidth, r.layoutHeight]);
  const edited = markerData(reach) !== markerData(previous);
  reach.markersArtwork = edited && reach.map?.src ? ((await imageFingerprint(reach.map.src)) ?? "") : previous.markersArtwork;
}
