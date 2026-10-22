import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import telecomLogoLight from "@/assets/brand/siccotel-telecom-logo-light.png";
import chairman from "@/assets/company/siccotel-telecom-chairmans-message.jpg";
import assemblyFloor from "@/assets/company/siccotel-telecom-assembly-floor.jpg";
import factoryExterior from "@/assets/company/siccotel-telecom-factory-exterior.jpg";
import aura2 from "@/assets/products/hmd-aura-2.jpg";
import b105 from "@/assets/products/zentality-b105.jpg";
import b106 from "@/assets/products/zentality-b106.jpg";
import b220 from "@/assets/products/zentality-b220.jpg";
import b3310 from "@/assets/products/zentality-b3310.jpg";
import { contact, externalLinks, futurePlans } from "@/content/company";
import { manufacturingPartners } from "@/content/partners";
import { enquiryHref } from "@/content/navigation";
import { PageHero, PartnerLogo } from "@/components/sections";
import { ButtonLink, Reveal, SectionHeader } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Manufacturing",
  description:
    "Siccotel Telecom (Pvt) Ltd is Siccotel’s mobile phone assembly plant at Korangi Creek Industrial Park, Karachi, with 120,000 sq. ft. of operational space.",
  path: "/manufacturing",
});

const facts = [
  { label: "Facility", value: "Siccotel Telecom (Pvt) Ltd" },
  { label: "Location", value: "Korangi Creek Industrial Park, Karachi" },
  { label: "Operational space", value: "120,000 sq. ft." },
  { label: "Focus", value: "Mobile phone assembly for different brands" },
];

const chain = [
  { title: "Component sourcing", text: "Sourcing components for assembly." },
  { title: "Assembly", text: "Assembling mobile phones for partner brands in Karachi." },
  { title: "Nationwide distribution", text: "Moving devices through regional hubs to wholesalers and retailers." },
  { title: "Service centres", text: "After-sales support for customers once devices are sold." },
];

const products = [
  { img: aura2, name: "HMD Aura 2" },
  { img: b105, name: "Zentality B105" },
  { img: b106, name: "Zentality B106" },
  { img: b220, name: "Zentality B220" },
  { img: b3310, name: "Zentality B3310" },
];

export default function ManufacturingPage() {
  return (
    <>
      <PageHero
        tone="dark"
        eyebrow="Manufacturing"
        title="Assembling devices in Pakistan, for Pakistan."
        intro="Siccotel moved into local manufacturing by setting up Siccotel Telecom (Pvt) Ltd — an assembly plant in Korangi Creek Industrial Park, Karachi, supporting the Government of Pakistan’s “Made in Pakistan” initiative."
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={enquiryHref("manufacturing")}>Make a manufacturing enquiry</ButtonLink>
          <ButtonLink href={externalLinks.siccotelTelecom} variant="ghost-dark" external>
            Siccotel Telecom website
          </ButtonLink>
        </div>
      </PageHero>

      <section aria-labelledby="overview-title" className="py-20 lg:py-28">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <SectionHeader eyebrow="Facility overview" title={<span id="overview-title">Siccotel Telecom.</span>} />
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>
                Siccotel Telecom is the group’s assembly plant in Korangi Creek Industrial Park, Karachi, with a
                120,000 sq. ft. operational space and room for multiple production and packing lines.
              </p>
              <p>
                It extends an end-to-end service delivery infrastructure — from component sourcing and assembly to
                nationwide distribution and service centres — that underpins Siccotel’s commitment to excellence.
              </p>
              <p>
                The plant contributes to the local economy through employment and localisation under the{" "}
                “Made in Pakistan” initiative.
              </p>
            </div>
          </div>
          <dl className="self-start divide-y divide-line border-y border-line lg:col-span-5 lg:col-start-8">
            {facts.map((f) => (
              <div key={f.label} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-sm font-semibold tracking-wide text-muted">{f.label}</dt>
                <dd className="font-display text-lg font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-label="Inside Siccotel Telecom" className="pb-16 lg:pb-24">
        <div className="container-site grid items-start gap-6 sm:grid-cols-[1.35fr_1fr]">
          <figure>
            <Image src={assemblyFloor} alt="Mobile phone assembly floor shown by Siccotel Telecom" placeholder="blur" sizes="(min-width: 1024px) 680px, 100vw" className="h-auto w-full rounded-[5px]" />
            <figcaption className="mt-3 text-sm text-muted">Assembly operations, from Siccotel Telecom’s official photography.</figcaption>
          </figure>
          <figure>
            <Image src={factoryExterior} alt="Siccotel Telecom factory exterior with Siccotel signage" placeholder="blur" sizes="(min-width: 1024px) 500px, 100vw" className="h-auto w-full rounded-[5px]" />
            <figcaption className="mt-3 text-sm text-muted">The Siccotel Telecom facility in Karachi.</figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="chain-title" className="border-y border-line bg-stone py-20 lg:py-28">
        <div className="container-site">
          <SectionHeader
            eyebrow="How it fits together"
            title={<span id="chain-title">An end-to-end chain.</span>}
            intro="Manufacturing connects directly to Siccotel’s distribution and after-sales network."
          />
          <ol className="mt-12 grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-4">
            {chain.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 70} className="border-r border-b border-line bg-white p-6 sm:p-7">
                <span className="font-display text-sm font-semibold text-accent tabular-nums">0{i + 1}</span>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="message-title" className="py-20 lg:py-28">
        <div className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] border border-line">
                <Image
                  src={chairman}
                  alt="Portrait accompanying the Chairman’s message on the Siccotel Telecom website"
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 470px, 100vw"
                  className="object-cover object-[30%_50%]"
                />
              </div>
            </figure>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow mb-4">Chairman’s message</p>
            <h2 id="message-title" className="sr-only">
              Chairman’s message
            </h2>
            <blockquote className="space-y-5">
              <p className="font-display text-2xl leading-snug font-medium tracking-[-0.015em] sm:text-[1.75rem]">
                “Our new facility symbolises more than masonry and equipment; it represents our commitment to evolving
                the technology landscape, local economic activity and excellence.”
              </p>
              <p className="text-lg leading-relaxed text-ink-soft">
                “We envision Pakistan not merely as a consumer of technology but as a meaningful participant in global
                innovation — and Siccotel Telecom will do its part with pride, while boosting the local economy through
                employment and localisation under the Made in Pakistan initiative.”
              </p>
            </blockquote>
            <p className="mt-6 text-sm text-muted">From the Chairman’s message, Siccotel Telecom.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="products-title" className="border-t border-line bg-stone py-20 lg:py-28">
        <div className="container-site">
          <SectionHeader
            eyebrow="Products"
            title={<span id="products-title">Featured by Siccotel Telecom.</span>}
            intro="Devices listed under “Our Products” on the Siccotel Telecom website."
          />
          <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((p, i) => (
              <Reveal as="li" key={p.name} delay={i * 60}>
                <div className="overflow-hidden rounded-[4px] border border-line bg-white">
                  <Image src={p.img} alt={p.name} sizes="(min-width: 1024px) 230px, (min-width: 640px) 33vw, 50vw" className="h-auto w-full" />
                </div>
                <p className="mt-3 font-semibold">{p.name}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="mfg-partners-title" className="on-dark bg-night text-white">
        <div className="container-site py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Image src={telecomLogoLight} alt="Siccotel Telecom" className="h-14 w-auto" sizes="80px" />
              <SectionHeader
                className="mt-8"
                eyebrow="Strategic partners"
                title={<span id="mfg-partners-title">Partners of Siccotel Telecom.</span>}
              />
            </div>
            <ul className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-[4px] border border-night-line bg-night-line lg:col-span-7">
              {manufacturingPartners.map((p) => (
                <li key={p.name} className="flex h-32 items-center justify-center bg-night px-6">
                  <PartnerLogo partner={p} height={28} />
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-12 max-w-3xl border-t border-night-line pt-8 leading-relaxed text-night-muted">
            <span className="font-semibold text-white">Stated plans: </span>
            {futurePlans}
          </p>
        </div>
      </section>

      <section aria-labelledby="mfg-contact-title" className="py-20 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <SectionHeader
              eyebrow="Work with us"
              title={<span id="mfg-contact-title">Talk to us about local assembly.</span>}
              intro="Brands and manufacturing partners can send an enquiry, or contact Siccotel Telecom directly."
            />
            <div className="mt-8">
              <ButtonLink href={enquiryHref("manufacturing")}>Make a manufacturing enquiry</ButtonLink>
            </div>
          </div>
          <div className="space-y-6 self-start rounded-[4px] border border-line p-6 sm:p-8 lg:col-span-5 lg:col-start-8">
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
                <ul className="mt-1 space-y-1 text-[0.9375rem]">
                  {contact.factory.emails.map((e) => (
                    <li key={e.value}>
                      <span className="text-muted">{e.label}: </span>
                      <a href={`mailto:${e.value}`} className="font-medium text-ink underline-offset-4 hover:text-accent hover:underline">
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
