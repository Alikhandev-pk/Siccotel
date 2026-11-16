import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import { enquiryHref } from "@/content/navigation";
import { telecomLogo } from "@/lib/cms/defaults";
import { fillProps, imageProps } from "@/lib/cms/image";
import { getDoc, getProducts, getSettings } from "@/lib/cms/public";
import { PageHero, PartnerLogo } from "@/components/sections";
import { ButtonLink, Reveal, SectionHeader, TextLink } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Assembly",
  description:
    "Siccotel Telecom (Pvt) Ltd is Siccotel’s mobile phone assembly plant at Korangi Creek Industrial Park, Karachi, with 120,000 sq. ft. of operational space.",
  path: "/assembly",
});

export default async function AssemblyPage() {
  const [doc, settings, products] = await Promise.all([getDoc("assembly"), getSettings(), getProducts()]);
  const devices = products.filter((p) => p.showOnAssembly && p.images[0]);
  const [photoA, photoB] = doc.photos;
  const contact = settings;

  return (
    <>
      <PageHero tone="dark" eyebrow={doc.hero.eyebrow} title={doc.hero.title} intro={doc.hero.intro}>
        <div className="mt-5 flex flex-col gap-3 sm:mt-10 sm:flex-row">
          <ButtonLink href={enquiryHref("manufacturing")}>Make a manufacturing enquiry</ButtonLink>
          <ButtonLink href={settings.links.siccotelTelecom} variant="ghost-dark" external>
            Siccotel Telecom website
          </ButtonLink>
        </div>
      </PageHero>

      <section aria-labelledby="overview-title" className="section-space">
        <div className="container-site grid gap-6 sm:gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <SectionHeader eyebrow={doc.overview.eyebrow} title={<span id="overview-title">{doc.overview.title}</span>} />
            <div className="mt-3 space-y-4 text-base leading-relaxed text-ink-soft sm:mt-6 sm:space-y-5 sm:text-lg">
              {doc.overview.paragraphs.filter(Boolean).map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </div>
          </div>
          <dl className="self-start divide-y divide-line border-y border-line lg:col-span-5 lg:col-start-8">
            {doc.overview.facts.map((f) => (
              <div key={f.label} className="grid gap-0.5 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4 sm:py-5">
                <dt className="text-sm font-semibold tracking-wide text-muted">{f.label}</dt>
                <dd className="font-display text-lg font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-label="Inside Siccotel Telecom" className="pb-10 lg:pb-16">
        <div className="container-site grid items-start gap-4 sm:grid-cols-[1.35fr_1fr] sm:gap-6">
          {photoA?.image?.src && (
            <figure>
              <Image {...imageProps(photoA.image)} alt={photoA.image.alt} sizes="(min-width: 1024px) 680px, 100vw" className="h-auto w-full rounded-[5px]" />
              {photoA.caption && <figcaption className="mt-3 text-sm text-muted">{photoA.caption}</figcaption>}
            </figure>
          )}
          {photoB?.image?.src && (
            <figure>
              <Image {...imageProps(photoB.image)} alt={photoB.image.alt} sizes="(min-width: 1024px) 500px, 100vw" className="h-auto w-full rounded-[5px]" />
              {photoB.caption && <figcaption className="mt-3 text-sm text-muted">{photoB.caption}</figcaption>}
            </figure>
          )}
        </div>
      </section>

      <section aria-labelledby="chain-title" className="section-space bg-stone">
        <div className="container-site">
          <SectionHeader eyebrow={doc.chain.eyebrow} title={<span id="chain-title">{doc.chain.title}</span>} intro={doc.chain.intro} />
          <ol className="mt-6 grid border-t border-l border-line sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
            {doc.chain.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 70} className="border-r border-b border-line bg-white p-4 sm:p-7">
                <span className="font-display text-sm font-semibold text-accent tabular-nums">0{i + 1}</span>
                <h3 className="mt-1 text-lg font-semibold sm:mt-6 sm:text-xl">{step.title}</h3>
                <p className="mt-1 leading-relaxed text-muted sm:mt-2">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="message-title" className="section-space">
        <div className="container-site grid items-center gap-5 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          {doc.chairman.photo?.src && (
            <Reveal className="lg:col-span-5">
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] border border-line sm:aspect-[4/5]">
                  <Image {...fillProps(doc.chairman.photo)} alt={doc.chairman.photo.alt} sizes="(min-width: 1024px) 470px, 100vw" className="object-cover object-[30%_50%]" />
                </div>
              </figure>
            </Reveal>
          )}
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow mb-4">Chairman’s message</p>
            <h2 id="message-title" className="sr-only">
              Chairman’s message
            </h2>
            <blockquote className="space-y-5">
              <p className="font-display text-xl leading-snug font-medium tracking-[-0.015em] sm:text-[1.75rem]">“{doc.chairman.quote}”</p>
              {doc.chairman.body && <p className="text-base leading-relaxed text-ink-soft sm:text-lg">“{doc.chairman.body}”</p>}
            </blockquote>
            <p className="mt-6 text-sm text-muted">{doc.chairman.attribution}</p>
          </div>
        </div>
      </section>

      {/* id="products" keeps old /manufacturing#products links landing here after the redirect. */}
      <section id="products" aria-labelledby="products-title" className="section-space bg-stone">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-2 sm:gap-5 lg:flex-row lg:items-end">
            <SectionHeader eyebrow={doc.products.eyebrow} title={<span id="products-title">{doc.products.title}</span>} intro={doc.products.intro} />
            <TextLink href="/products" className="min-h-11 shrink-0">
              All products
            </TextLink>
          </div>
          {devices.length > 0 ? (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {devices.map((p, i) => (
                <Reveal as="li" key={p.id} delay={i * 60}>
                  <div className="overflow-hidden rounded-[4px] border border-line bg-white">
                    <Image {...imageProps(p.images[0])} alt={p.images[0].alt || p.name} sizes="(min-width: 1024px) 230px, (min-width: 640px) 33vw, 50vw" className="h-auto w-full" />
                  </div>
                  <p className="mt-3 font-semibold">{p.name}</p>
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-muted">Products will be listed here soon.</p>
          )}
        </div>
      </section>

      <section aria-labelledby="mfg-partners-title" className="on-dark bg-night text-white">
        <div className="section-space container-site">
          <div className="grid gap-6 sm:gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Image src={telecomLogo} alt="Siccotel Telecom" className="h-10 w-auto sm:h-14" sizes="80px" />
              <SectionHeader className="mt-4 sm:mt-8" eyebrow={doc.partners.eyebrow} title={<span id="mfg-partners-title">{doc.partners.title}</span>} />
            </div>
            <ul className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-[4px] border border-night-line bg-night-line lg:col-span-7">
              {doc.partners.logos.map((p) => (
                <li key={p.name} className="flex h-24 items-center justify-center bg-night px-4 sm:h-32 sm:px-6">
                  <PartnerLogo partner={p} height={28} />
                </li>
              ))}
            </ul>
          </div>
          {doc.partners.plans && (
            <p className="mt-6 max-w-3xl border-t border-night-line pt-5 leading-relaxed text-night-muted sm:mt-12 sm:pt-8">
              <span className="font-semibold text-white">Stated plans: </span>
              {doc.partners.plans}
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="mfg-contact-title" className="section-space">
        <div className="container-site grid gap-6 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <SectionHeader eyebrow={doc.contact.eyebrow} title={<span id="mfg-contact-title">{doc.contact.title}</span>} intro={doc.contact.intro} />
            <div className="mt-5 sm:mt-8">
              <ButtonLink href={enquiryHref("manufacturing")}>Make a manufacturing enquiry</ButtonLink>
            </div>
          </div>
          <div className="space-y-4 self-start rounded-[4px] border border-line p-4 sm:space-y-6 sm:p-8 lg:col-span-5 lg:col-start-8">
            <div className="flex gap-4">
              <MapPin aria-hidden className="mt-1 size-5 shrink-0 text-accent" strokeWidth={1.75} />
              <div>
                <h3 className="font-semibold">Factory location</h3>
                <address className="mt-1 text-[0.9375rem] leading-relaxed not-italic text-muted">
                  {contact.factory.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
              </div>
            </div>
            <div className="flex gap-4">
              <Mail aria-hidden className="mt-1 size-5 shrink-0 text-accent" strokeWidth={1.75} />
              <div>
                <h3 className="font-semibold">Siccotel Telecom email</h3>
                <ul className="mt-1 text-[0.9375rem] sm:space-y-1">
                  {contact.factory.emails.map((e) => (
                    <li key={e.value} className="[overflow-wrap:anywhere]">
                      <span className="block text-sm text-muted sm:inline sm:text-[0.9375rem]">{e.label}<span className="hidden sm:inline">: </span></span>
                      <a href={`mailto:${e.value}`} className="inline-flex min-h-11 items-center font-medium text-ink underline-offset-4 hover:text-accent hover:underline sm:inline sm:min-h-0">
                        {e.value}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
