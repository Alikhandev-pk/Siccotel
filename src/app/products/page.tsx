import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { enquiryHref } from "@/content/navigation";
import { getDoc, getProducts, getSettings } from "@/lib/cms/public";
import { PageHero, PartnerLogo } from "@/components/sections";
import { ButtonLink, Reveal, SectionHeader, TextLink } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "Devices assembled by Siccotel Telecom in Karachi, and the smartphone, accessory and TV brands Siccotel distributes across Pakistan.",
  path: "/products",
});

const baseSections = [
  { id: "assembled", label: "Assembled in Karachi" },
  { id: "brands", label: "Distributed brands" },
  { id: "buy", label: "Accessories & where to buy" },
];

export default async function ProductsPage() {
  const [doc, partners, settings, products] = await Promise.all([getDoc("productsPage"), getDoc("partners"), getSettings(), getProducts()]);
  // Every published product is listed: assembled devices first, everything else in the catalogue.
  const assembled = products.filter((p) => p.assembled === true);
  const catalogue = products.filter((p) => p.assembled !== true);
  const sections = [...baseSections.slice(0, 1), ...(catalogue.length ? [{ id: "catalogue", label: doc.catalogue.eyebrow || "Catalogue" }] : []), ...baseSections.slice(1)];
  return (
    <>
      <PageHero eyebrow={doc.hero.eyebrow} title={doc.hero.title} intro={doc.hero.intro}>
        <nav aria-label="On this page" className="mt-5 sm:mt-10">
          <ul className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-white px-4 text-sm font-semibold transition-colors hover:border-ink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      <section id="assembled" aria-labelledby="assembled-title" className="section-space border-b border-line">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-2 sm:gap-5 lg:flex-row lg:items-end">
            <SectionHeader eyebrow={doc.assembled.eyebrow} title={<span id="assembled-title">{doc.assembled.title}</span>} intro={doc.assembled.intro} />
            <TextLink href="/assembly" className="min-h-11 shrink-0">
              About our assembly plant
            </TextLink>
          </div>
          <ProductGrid products={assembled} empty="Assembled devices will be listed here soon." />
        </div>
      </section>

      {catalogue.length > 0 && (
        <section id="catalogue" aria-labelledby="catalogue-title" className="section-space border-b border-line">
          <div className="container-site">
            <SectionHeader eyebrow={doc.catalogue.eyebrow} title={<span id="catalogue-title">{doc.catalogue.title}</span>} intro={doc.catalogue.intro} />
            <ProductGrid products={catalogue} empty="" />
          </div>
        </section>
      )}

      <section id="brands" aria-labelledby="brands-title" className="section-space bg-stone">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-2 sm:gap-5 lg:flex-row lg:items-end">
            <SectionHeader eyebrow={doc.brands.eyebrow} title={<span id="brands-title">{doc.brands.title}</span>} intro={doc.brands.intro} />
            <TextLink href="/partners" className="min-h-11 shrink-0">
              All partners
            </TextLink>
          </div>
          <ul className="mt-6 grid grid-cols-2 border-t border-l border-line sm:mt-12 lg:grid-cols-4">
            {partners.brands.map((p, i) => (
              <Reveal as="li" key={p.name} delay={(i % 4) * 60} className="flex flex-col border-r border-b border-line bg-white">
                <div className="flex h-20 items-center justify-center border-b border-line px-3 sm:h-32 sm:px-6">
                  <PartnerLogo partner={p} height={30} />
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-6">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <ul className="mt-2 space-y-1 text-[0.875rem] text-ink-soft sm:mt-3 sm:space-y-1.5 sm:text-[0.9375rem]">
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
          {doc.brands.note && <p className="mt-4 text-sm text-muted sm:mt-6">{doc.brands.note}</p>}
        </div>
      </section>

      <section id="buy" aria-labelledby="buy-title" className="section-space border-t border-line">
        <div className="container-site grid gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-semibold">{doc.buy.accessoriesTitle}</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {partners.accessories.map((p) => (
                <li key={p.name} className="py-4">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-[0.9375rem] text-muted">{p.detail}</p>
                </li>
              ))}
            </ul>
            {partners.accessoriesNote && <p className="mt-4 text-sm text-muted">{partners.accessoriesNote}</p>}
          </div>
          <div className="rounded-[4px] border border-line bg-stone p-5 sm:p-8 lg:col-span-6 lg:col-start-7">
            <p className="eyebrow mb-3 sm:mb-4">{doc.buy.eyebrow}</p>
            <h2 id="buy-title" className="text-[1.75rem] leading-[1.12] font-semibold sm:text-[2.25rem]">
              Sicco Store
            </h2>
            <p className="mt-3 leading-relaxed text-ink-soft sm:text-lg">{doc.buy.tagline}</p>
            <ul className="mt-5 space-y-2.5 sm:mt-6">
              {doc.buy.points.map((pt) => (
                <li key={pt} className="flex gap-3 leading-relaxed text-ink-soft">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                  {pt}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <ButtonLink href={settings.links.siccoStore} external>
                Visit Sicco Store
              </ButtonLink>
              <ButtonLink href={enquiryHref("dealer")} variant="secondary">
                Become a dealer
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

type ProductCard = Awaited<ReturnType<typeof getProducts>>[number];

/** Product cards in a fixed square frame, so portrait or landscape uploads keep the grid even. */
function ProductGrid({ products, empty }: { products: ProductCard[]; empty: string }) {
  if (!products.length) return empty ? <p className="mt-6 text-muted">{empty}</p> : null;
  return (
    <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {products.map((p, i) => (
        <Reveal as="li" key={p.id} delay={i * 60}>
          <div className="relative aspect-square overflow-hidden rounded-[4px] border border-line bg-white">
            {p.images[0]?.src ? (
              <Image src={p.images[0].src} alt={p.images[0].alt || p.name} fill sizes="(min-width: 1024px) 230px, (min-width: 640px) 33vw, 50vw" className="object-contain" />
            ) : (
              <div className="size-full bg-stone" />
            )}
          </div>
          <p className="mt-3 font-semibold">{p.name}</p>
          {(p.brand || p.category) && <p className="text-sm text-muted">{[p.brand.trim(), p.category.trim()].filter(Boolean).join(" · ")}</p>}
          {p.storeUrl && (
            <a href={p.storeUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent sm:min-h-0">
              View on Sicco Store <ArrowUpRight aria-hidden className="size-3.5" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </Reveal>
      ))}
    </ul>
  );
}
