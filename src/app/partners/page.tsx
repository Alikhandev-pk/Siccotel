import { enquiryHref } from "@/content/navigation";
import { getDoc } from "@/lib/cms/public";
import { PageHero, PartnerLogo } from "@/components/sections";
import { ButtonLink, Reveal, SectionHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Partners",
  description:
    "The global brands Siccotel works with — Infinix, ZTE nubia, itel, Tecno, Samsung, realme, Nokia and HMD — and the nature of each relationship.",
  path: "/partners",
});

export default async function PartnersPage() {
  const [doc, assembly] = await Promise.all([getDoc("partners"), getDoc("assembly")]);
  return (
    <>
      <PageHero eyebrow={doc.hero.eyebrow} title={doc.hero.title} intro={doc.hero.intro} />

      <section aria-labelledby="brands-title" className="section-space">
        <div className="container-site">
          <SectionHeader eyebrow={doc.brandsSection.eyebrow} title={<span id="brands-title">{doc.brandsSection.title}</span>} />
          <ul className="mt-6 grid grid-cols-2 border-t border-l border-line sm:mt-12 lg:grid-cols-4">
            {doc.brands.map((p, i) => (
              <Reveal as="li" key={p.name} delay={(i % 4) * 60} className="flex flex-col border-r border-b border-line bg-white">
                <div className="flex h-20 items-center justify-center border-b border-line px-3 sm:h-36 sm:px-6">
                  <PartnerLogo partner={p} height={32} />
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-6">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className={`mt-1 text-sm font-semibold ${p.relationship === "Distribution" ? "text-muted" : "text-accent"}`}>{p.relationship}</p>
                  <ul className="mt-2 space-y-1 text-[0.875rem] text-ink-soft sm:mt-4 sm:space-y-1.5 sm:text-[0.9375rem]">
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
          {doc.brandsSection.note && <p className="mt-4 text-sm text-muted sm:mt-6">{doc.brandsSection.note}</p>}
        </div>
      </section>

      <section aria-labelledby="other-title" className="section-space border-y border-line bg-stone">
        <div className="container-site grid gap-8 sm:gap-12 lg:grid-cols-3 lg:gap-8">
          <div>
            <h2 id="other-title" className="text-2xl font-semibold">{doc.apple.name}</h2>
            <p className="mt-1 text-sm font-semibold text-accent">{doc.apple.relationship}</p>
            <p className="mt-4 leading-relaxed text-ink-soft">{doc.apple.note}</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Accessories</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {doc.accessories.map((p) => (
                <li key={p.name} className="py-4">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-[0.9375rem] text-muted">{p.detail}</p>
                </li>
              ))}
            </ul>
            {doc.accessoriesNote && <p className="mt-4 text-sm text-muted">{doc.accessoriesNote}</p>}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Earlier milestones</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {doc.earlier.map((p) => (
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
        <div className="section-space container-site">
          <SectionHeader eyebrow={doc.manufacturingSection.eyebrow} title={<span id="mfg-title">{doc.manufacturingSection.title}</span>} intro={doc.manufacturingSection.intro} />
          <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-night-line bg-night-line sm:mt-12 lg:grid-cols-4">
            {assembly.partners.logos.map((p) => (
              <li key={p.name} className="flex flex-col bg-night">
                <div className="flex h-20 items-center justify-center px-3 sm:h-32 sm:px-6">
                  <PartnerLogo partner={p} height={28} />
                </div>
                <p className="border-t border-night-line px-4 py-3 text-center text-sm text-night-muted">{p.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="become-title" className="section-space">
        <div className="container-site flex flex-col items-start justify-between gap-5 sm:gap-8 lg:flex-row lg:items-end">
          <SectionHeader eyebrow={doc.cta.eyebrow} title={<span id="become-title">{doc.cta.title}</span>} intro={doc.cta.intro} />
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
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
