import { accessoryPartners, appleRelationship, brandPartners, earlierPartners, manufacturingPartners } from "@/content/partners";
import { enquiryHref } from "@/content/navigation";
import { PageHero, PartnerLogo } from "@/components/sections";
import { ButtonLink, Reveal, SectionHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Partners",
  description:
    "The global brands Siccotel works with — Infinix, ZTE nubia, itel, Tecno, Samsung, realme, Nokia and HMD — and the nature of each relationship.",
  path: "/partners",
});

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partners"
        title="Partnerships with global device brands."
        intro="Siccotel’s relationships differ from brand to brand. Each one is described here as published by Siccotel — whether distribution, exclusive distribution, authorized reselling or a manufacturing partnership."
      />

      <section aria-labelledby="brands-title" className="py-20 lg:py-28">
        <div className="container-site">
          <SectionHeader eyebrow="Device brands" title={<span id="brands-title">Distribution partnerships.</span>} />
          <ul className="mt-12 grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-4">
            {brandPartners.map((p, i) => (
              <Reveal as="li" key={p.name} delay={(i % 4) * 60} className="flex flex-col border-r border-b border-line bg-white">
                <div className="flex h-36 items-center justify-center border-b border-line px-6">
                  <PartnerLogo partner={p} height={32} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      p.relationship === "Distribution" ? "text-muted" : "text-accent"
                    }`}
                  >
                    {p.relationship}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-[0.9375rem] text-ink-soft">
                    {p.details.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Start years are taken from Siccotel’s published journey timeline. ZTE nubia’s exclusive distribution was
            announced on Siccotel’s News &amp; Media page.
          </p>
        </div>
      </section>

      <section aria-labelledby="other-title" className="border-y border-line bg-stone py-20 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-3 lg:gap-8">
          <div>
            <h2 id="other-title" className="text-2xl font-semibold">
              {appleRelationship.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-accent">{appleRelationship.relationship}</p>
            <p className="mt-4 leading-relaxed text-ink-soft">{appleRelationship.note}</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Accessories</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {accessoryPartners.map((p) => (
                <li key={p.name} className="py-4">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-[0.9375rem] text-muted">{p.detail}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">Siccotel also distributes Infinix, itel and Tecno accessories.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Earlier milestones</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {earlierPartners.map((p) => (
                <li key={p.name} className="py-4">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-[0.9375rem] text-muted">{p.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="mfg-title" className="on-dark bg-night text-white">
        <div className="container-site py-20 lg:py-28">
          <SectionHeader
            eyebrow="Manufacturing"
            title={<span id="mfg-title">Strategic partners of Siccotel Telecom.</span>}
            intro="Listed as strategic partners by Siccotel Telecom, the group’s assembly plant in Karachi."
          />
          <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-night-line bg-night-line lg:grid-cols-4">
            {manufacturingPartners.map((p) => (
              <li key={p.name} className="flex flex-col bg-night">
                <div className="flex h-32 items-center justify-center px-6">
                  <PartnerLogo partner={p} height={28} />
                </div>
                <p className="border-t border-night-line px-4 py-3 text-center text-sm text-night-muted">{p.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="become-title" className="py-20 lg:py-28">
        <div className="container-site flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeader
            eyebrow="For brands"
            title={<span id="become-title">Bring your brand to Pakistan with Siccotel.</span>}
            intro="Talk to us about distribution, retail reach and local assembly."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={enquiryHref("brand")}>Brand partnership enquiry</ButtonLink>
            <ButtonLink href={enquiryHref("manufacturing")} variant="secondary">
              Manufacturing enquiry
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
