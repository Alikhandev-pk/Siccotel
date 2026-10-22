import Image from "next/image";
import assemblyFloor from "@/assets/company/siccotel-hero-assembly-floor.jpg";

/** Genuine company photography, with reserved space before the image loads. */
export function HeroVisual() {
  return (
    <figure data-hero-visual="" className="hero-photo-stack mx-auto w-full max-w-[34rem]">
      <div data-hero-photo="" className="hero-photo-frame relative rounded-[8px] border border-white/20 bg-night-2 p-2">
      <div className="relative aspect-[3/2] overflow-hidden rounded-[4px] bg-night-2">
        <Image
          src={assemblyFloor}
          alt="Workers assembling mobile phones at Siccotel Telecom’s Karachi facility"
          fill
          preload
          placeholder="blur"
          sizes="(min-width: 1280px) 520px, (min-width: 1024px) 42vw, (min-width: 640px) 520px, 90vw"
          className="object-cover"
        />
      </div>
      <figcaption className="px-2 pb-1 pt-3 text-[0.6875rem] leading-relaxed tracking-[0.04em] text-night-muted">
        Mobile phone assembly · Siccotel Telecom, Karachi
      </figcaption>
      </div>
    </figure>
  );
}
