"use client";

import Image from "next/image";
import { useState } from "react";
import { Building2, Factory, MapPin } from "lucide-react";
import regionalMap from "@/assets/company/pakistan-regional-network-map.png";
import { contact } from "@/content/company";
import { hqCityId, networkCities } from "@/content/locations";
import { enquiryHref } from "@/content/navigation";
import { TextLink } from "../ui";

// These coordinates align to markers in the unmodified 1080 × 843 source map.
const MAP_WIDTH = 1080;
const MAP_HEIGHT = 843;

export function ReachMap() {
  const [selected, setSelected] = useState(hqCityId);
  const city = networkCities.find((location) => location.id === selected)!;
  const isHq = city.id === hqCityId;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
      <figure className="min-w-0 lg:col-span-7">
        <div className="relative overflow-hidden rounded-[5px] border border-line bg-white">
          <Image
            src={regionalMap}
            alt="Siccotel's published regional network map, showing named cities in Pakistan's north, central and south regions"
            sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
            className="h-auto w-full"
          />
          <svg aria-hidden="true" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="pointer-events-none absolute inset-0 h-full w-full">
            <circle
              cx={(city.x / 100) * MAP_WIDTH}
              cy={(city.y / 100) * MAP_HEIGHT}
              r="19"
              fill="#c8000b"
              fillOpacity="0.12"
              stroke="#a80009"
              strokeWidth="2.5"
            />
          </svg>
        </div>
        <figcaption className="mt-3 text-xs leading-relaxed text-muted">
          Siccotel&apos;s published regional map. City markers indicate map locations; they do not identify individual offices.
        </figcaption>
      </figure>

      <div className="min-w-0 lg:col-span-5">
        <h3 className="text-xs font-semibold tracking-[0.12em] text-muted uppercase" id="reach-list-label">
          Explore the regional map
        </h3>
        <ul aria-labelledby="reach-list-label" className="mt-4 flex flex-wrap gap-2">
          {networkCities.map((location) => (
            <li key={location.id}>
              <button
                type="button"
                aria-pressed={location.id === selected}
                aria-controls="reach-detail"
                onClick={() => setSelected(location.id)}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[3px] border px-3 text-sm font-semibold transition-colors ${
                  location.id === selected ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink/60"
                }`}
              >
                {location.id === hqCityId && <span aria-hidden className="size-1.5 rounded-full bg-brand" />}
                {location.name}
              </button>
            </li>
          ))}
        </ul>

        <div id="reach-detail" role="region" aria-label="Selected city details" aria-live="polite" aria-atomic="true" className="mt-7 border-t-2 border-ink pt-5">
          <p className="flex items-center gap-2 text-xs font-semibold text-accent">
            <MapPin aria-hidden className="size-4 shrink-0" />
            {isHq ? "Head office & assembly plant" : "City on the regional map"}
          </p>
          <h4 className="mt-2 font-display text-3xl leading-tight font-semibold tracking-[-0.03em]">{city.name}</h4>
          {isHq ? (
            <ul className="mt-5 space-y-5">
              <li className="flex gap-3">
                <Building2 aria-hidden className="mt-0.5 size-5 shrink-0 text-muted" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold">{contact.headOffice.label}</p>
                  <address className="mt-1 text-sm leading-relaxed not-italic text-ink-soft">
                    {contact.headOffice.lines.join(", ")}
                  </address>
                </div>
              </li>
              <li className="flex gap-3">
                <Factory aria-hidden className="mt-0.5 size-5 shrink-0 text-muted" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold">{contact.factory.label}</p>
                  <address className="mt-1 text-sm leading-relaxed not-italic text-ink-soft">
                    {contact.factory.lines.join(", ")}
                  </address>
                </div>
              </li>
            </ul>
          ) : (
            <div className="mt-4 rounded-[4px] border border-line bg-white p-4">
              <p className="text-sm font-semibold">Local address details unavailable</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {city.name} is marked on Siccotel&apos;s regional network map. A separate office or facility address is not published for this city. Contact the sales team for local dealer and distribution enquiries.
              </p>
            </div>
          )}
          <div className="mt-5">
            <TextLink href={enquiryHref("dealer")} className="min-h-11 text-sm">Dealer &amp; retail enquiries</TextLink>
          </div>
        </div>
      </div>
    </div>
  );
}
