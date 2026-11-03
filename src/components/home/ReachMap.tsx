"use client";

import Image from "next/image";
import { useState } from "react";
import { Building2, Factory } from "lucide-react";
import regionalMap from "@/assets/company/pakistan-regional-network-map.png";
import { contact } from "@/content/company";
import { hqCityId, networkCities } from "@/content/locations";
import { enquiryHref } from "@/content/navigation";
import { TextLink } from "../ui";

// These coordinates align to markers in the unmodified 1080 × 843 source map.
const MAP_WIDTH = 1080;
const MAP_HEIGHT = 843;

const offices = [
  { icon: Building2, ...contact.headOffice },
  { icon: Factory, ...contact.factory },
];

export function ReachMap() {
  const [selected, setSelected] = useState(hqCityId);
  const city = networkCities.find((location) => location.id === selected)!;
  const isHq = city.id === hqCityId;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-10">
      <figure className="min-w-0 lg:col-span-7">
        <div className="relative overflow-hidden rounded-[8px] border border-line bg-white">
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
        <figcaption className="mt-2.5 text-xs leading-relaxed text-muted">
          Siccotel&apos;s published regional map. City markers show map locations, not individual offices.
        </figcaption>
      </figure>

      <div className="min-w-0 space-y-5 lg:col-span-5 lg:space-y-7">
        <div>
          <h3 className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Published addresses, Karachi</h3>
          <ul className="mt-2.5 divide-y divide-line border-y border-line lg:mt-3">
            {offices.map(({ icon: Icon, label, lines }) => (
              <li key={label} className="flex gap-3 py-2.5 lg:py-3.5">
                <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <address className="mt-0.5 text-sm leading-relaxed not-italic text-ink-soft">{lines.join(", ")}</address>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 id="reach-list-label" className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">
            Cities on the regional map
          </h3>
          <ul aria-labelledby="reach-list-label" className="mt-2.5 flex flex-wrap gap-1.5 lg:mt-3 lg:gap-2">
            {networkCities.map((location) => (
              <li key={location.id}>
                <button
                  type="button"
                  aria-pressed={location.id === selected}
                  aria-controls="reach-detail"
                  onClick={() => setSelected(location.id)}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-[3px] border px-2.5 text-[0.8125rem] font-semibold transition-colors duration-200 lg:px-3 lg:text-sm ${
                    location.id === selected ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink/60"
                  }`}
                >
                  {location.name}
                </button>
              </li>
            ))}
          </ul>
          <p id="reach-detail" aria-live="polite" className="mt-3 text-sm leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">{city.name}</span>
            {isHq
              ? " is home to the head office and assembly plant, at the addresses above."
              : " is marked on the regional map. No separate office address is published; contact the sales team for local enquiries."}
          </p>
          <div className="mt-3">
            <TextLink href={enquiryHref("dealer")} className="min-h-11 text-sm">Dealer &amp; retail enquiries</TextLink>
          </div>
        </div>
      </div>
    </div>
  );
}
