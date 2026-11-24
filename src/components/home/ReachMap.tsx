"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { Building2, ChevronRight, Factory, MapPin } from "lucide-react";
import { enquiryHref } from "@/content/navigation";
import type { RegionId } from "@/content/reach-artwork";
import type { ReachArtwork } from "@/lib/cms/artwork";
import type { HomeDoc, SettingsDoc } from "@/lib/cms/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { TextLink } from "../ui";
import { MOTION, onceInView } from "../animations/motion";

const HQ_CITY = "karachi";
/** A tap within this many CSS pixels of a city dot selects the nearest city. */
const PIN_HIT_PX = 18;

/**
 * The client's regional map, unchanged, with a transparent SVG laid exactly over
 * it in the map's layout space (artwork.layoutWidth × layoutHeight). The SVG holds
 * the region outlines traced from the artwork and a hit area on each city dot, so
 * both scale with the image. Outlines and markers are only drawn when the server
 * has confirmed they belong to this exact map file (see lib/cms/artwork.ts).
 */
export function ReachMap({ reach, artwork, settings }: { reach: HomeDoc["reach"]; artwork: ReachArtwork; settings: SettingsDoc }) {
  const { regions, markers, layoutWidth: W, layoutHeight: H } = artwork;
  const cities = reach.cities;
  const offices = [
    { icon: Building2, ...settings.headOffice },
    { icon: Factory, ...settings.factory },
  ];

  const [regionId, setRegionId] = useState<RegionId | null>(() => regions?.find((r) => r.id === "north")?.id ?? regions?.[0]?.id ?? null);
  const [cityId, setCityId] = useState<string | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  const region = regions?.find((r) => r.id === regionId) ?? null;
  const listed = region ? cities.filter((c) => region.cityIds.includes(c.id)) : cities;
  const city = cities.find((c) => c.id === cityId) ?? null;
  /** The soft pulsing ring sits on the selected city, or on the head office. */
  const pulseCity = markers ? (city ?? cities.find((c) => c.id === HQ_CITY) ?? null) : null;

  // On first view: the selected region's outline draws itself, then a ring pings out
  // from each city dot in turn. Decorative only; the map is complete without it.
  useGSAP(
    () => {
      const root = mapRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const q = gsap.utils.selector(root);
        const outline = q("[data-region][data-selected]");
        const pings = q("[data-ping]");
        gsap.set(outline, { drawSVG: "0%" });
        onceInView(root, () => {
          gsap
            .timeline()
            .to(outline, { drawSVG: "100%", duration: 1.1, ease: "power2.inOut", clearProps: "strokeDasharray,strokeDashoffset" }, 0)
            .fromTo(pings, { scale: 0.4, opacity: 0.8, transformOrigin: "50% 50%" }, { scale: 2.6, opacity: 0, duration: 0.9, ease: "power2.out", stagger: 0.08 }, 0.35);
        }, "top 75%");
      });
      return () => mm.revert();
    },
    { scope: mapRef },
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        gsap.fromTo("[data-pulse]", { scale: 1, opacity: 0.6, transformOrigin: "50% 50%" }, { scale: 2.6, opacity: 0, duration: 1.6, ease: "power2.out", repeat: -1, repeatDelay: 0.6 });
      });
      return () => mm.revert();
    },
    { scope: mapRef, dependencies: [pulseCity?.id], revertOnUpdate: true },
  );

  function selectRegion(id: RegionId) {
    if (id === regionId) return;
    setRegionId(id);
    setCityId(null);
  }

  function selectCity(id: string) {
    const home = regions?.find((r) => r.cityIds.includes(id));
    if (home) setRegionId(home.id);
    setCityId(id);
  }

  /** Arrow keys, Home and End move between the region tabs (WAI-ARIA tabs pattern). */
  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!regions) return;
    const last = regions.length - 1;
    const next = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = next < 0 ? last : next > last ? 0 : next;
    selectRegion(regions[target].id);
    tabs.current[target]?.focus();
  }

  /** A click near a city dot selects that city; anywhere else in a region selects the region. */
  function onMapClick(event: MouseEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left;
    const py = event.clientY - box.top;
    if (markers) {
      let nearest: { id: string; d: number } | null = null;
      for (const c of cities) {
        const d = Math.hypot((c.x / 100) * box.width - px, (c.y / 100) * box.height - py);
        if (d <= PIN_HIT_PX && (!nearest || d < nearest.d)) nearest = { id: c.id, d };
      }
      if (nearest) return selectCity(nearest.id);
    }
    const hit = (event.target as Element).closest("[data-region]")?.getAttribute("data-region");
    if (hit) selectRegion(hit as RegionId);
  }

  // The selected outline is drawn last, so its border sits above its neighbours.
  const drawOrder = regions ? [...regions.filter((r) => r.id !== regionId), ...regions.filter((r) => r.id === regionId)] : [];

  return (
    <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-8">
      <div className="min-w-0 rounded-[8px] border border-line bg-white p-3 sm:p-5 lg:col-span-7">
        {regions && (
          <div role="tablist" aria-label="Regions" className="flex flex-wrap gap-2">
            {regions.map((r, i) => {
              const active = r.id === regionId;
              return (
                <button
                  key={r.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`reach-tab-${r.id}`}
                  aria-selected={active}
                  aria-controls="reach-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectRegion(r.id)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                  className={`inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-[6px] border px-4 text-sm font-semibold transition-colors duration-200 sm:min-w-28 sm:text-[0.9375rem] ${
                    active ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink/60"
                  }`}
                >
                  {r.name}
                </button>
              );
            })}
          </div>
        )}

        {/* The image and overlay share this box, so they scale together at every width. */}
        <div ref={mapRef} className={`relative ${regions ? "mt-3 sm:mt-4" : ""}`}>
          <Image
            src={reach.map.src}
            width={reach.map.width}
            height={reach.map.height}
            alt={reach.map.alt}
            sizes="(min-width: 1280px) 680px, (min-width: 1024px) 54vw, 100vw"
            quality={90}
            className="block h-auto w-full"
          />
          {(regions || markers) && (
            <svg
              aria-hidden="true"
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              onClick={onMapClick}
              className="reach-overlay absolute inset-0 size-full"
            >
              {drawOrder.map((r) => (
                <path
                  key={r.id}
                  d={r.path}
                  data-region={r.id}
                  data-selected={r.id === regionId ? "" : undefined}
                  vectorEffect="non-scaling-stroke"
                  className="reach-region"
                  style={{ "--region": r.color } as CSSProperties}
                />
              ))}
              {markers &&
                cities.map((c) => {
                  const cx = (c.x / 100) * W;
                  const cy = (c.y / 100) * H;
                  return (
                    <g key={c.id} data-city={c.id}>
                      <circle data-ping="" cx={cx} cy={cy} r="8" fill="none" stroke="#c8000b" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0" pointerEvents="none" />
                      <circle cx={cx} cy={cy} r="7" className="reach-pin" />
                      {c.id === cityId && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="9"
                          className="reach-marker"
                          fill="#c8000b"
                          fillOpacity="0.12"
                          stroke="#a80009"
                          strokeWidth="1.5"
                          pointerEvents="none"
                        />
                      )}
                    </g>
                  );
                })}
              {pulseCity && (
                <circle
                  key={pulseCity.id}
                  data-pulse=""
                  cx={(pulseCity.x / 100) * W}
                  cy={(pulseCity.y / 100) * H}
                  r="9"
                  fill="none"
                  stroke="#c8000b"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  opacity="0"
                  pointerEvents="none"
                />
              )}
            </svg>
          )}
        </div>
      </div>

      <div className="min-w-0 rounded-[8px] border border-line bg-white p-5 sm:p-6 lg:col-span-5">
        <div {...(region ? { role: "tabpanel", id: "reach-panel", "aria-labelledby": `reach-tab-${region.id}` } : {})}>
          {region && (
            <h3 className="flex items-center gap-3 border-b border-line pb-4 text-2xl font-semibold sm:text-[1.75rem]">
              <span aria-hidden className="size-3 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: region.color }} />
              {region.name} Region
            </h3>
          )}
          <h4 id="reach-list-label" className={`text-xs font-semibold tracking-[0.12em] text-muted uppercase ${region ? "mt-4" : ""}`}>
            Cities on the Regional Map
          </h4>
          {listed.length > 0 ? (
            <ul aria-labelledby="reach-list-label" className="mt-3 grid gap-2">
              {listed.map((c) => {
                const active = c.id === cityId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      aria-controls="reach-detail"
                      onClick={() => selectCity(c.id)}
                      className={`flex min-h-12 w-full items-center gap-3 rounded-[6px] border px-3.5 text-left text-[0.9375rem] font-semibold transition-colors duration-200 ${
                        active ? "border-ink bg-stone text-ink" : "border-line-strong bg-white text-ink hover:border-ink/60"
                      }`}
                    >
                      <MapPin aria-hidden className="size-5 shrink-0 text-accent" strokeWidth={2} />
                      <span className="flex-1">{c.name}</span>
                      <ChevronRight aria-hidden className="size-4 shrink-0 text-muted" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">No cities are marked in this region.</p>
          )}
          <p id="reach-detail" aria-live="polite" className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft lg:text-sm">
            {city ? (
              <>
                <span className="font-semibold text-ink">{city.name}</span>
                {city.id === HQ_CITY
                  ? " is home to the head office and assembly plant, at the addresses below."
                  : " is marked on the regional map. No separate office address is published; contact the sales team for local enquiries."}
              </>
            ) : (
              "Select a city to view its details."
            )}
          </p>
        </div>

        <div className="mt-3">
          <TextLink href={enquiryHref("dealer")} className="min-h-11 text-sm">Dealer &amp; retail enquiries</TextLink>
        </div>

        <div className="mt-4 border-t border-line pt-5">
          <ul className="divide-y divide-line lg:mt-1">
            {offices.map(({ icon: Icon, label, lines }) => (
              <li key={label} className="flex gap-3 py-2.5 lg:py-3">
                <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                <div>
                  <p className="text-[0.9375rem] font-semibold lg:text-sm">{label}</p>
                  <address className="mt-0.5 text-[0.9375rem] leading-relaxed not-italic text-ink-soft lg:text-sm">{lines.join(", ")}</address>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
