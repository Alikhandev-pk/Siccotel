import { Factory, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { contact, externalLinks, social } from "@/content/company";
import { enquiryHref, enquiryTypes } from "@/content/navigation";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PageHero } from "@/components/sections";
import { SocialIcon } from "@/components/SocialIcon";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact & Partner With Us",
  description:
    "Contact Siccotel in Karachi for dealer and retail partnerships, brand partnerships, manufacturing enquiries and customer support.",
  path: "/contact",
});

const linkCls = "font-medium text-ink underline-offset-4 hover:text-accent hover:underline";

async function AvailableEnquiryForm() {
  // Read delivery availability at request time, so a build cannot retain a stale
  // configuration state. Only this boolean is passed to the browser.
  await connection();
  const deliveryConfigured = Boolean(
    (process.env.RESEND_API_KEY && process.env.ENQUIRY_TO_EMAIL && process.env.ENQUIRY_FROM_EMAIL) ||
      process.env.ENQUIRY_WEBHOOK_URL,
  );

  return <EnquiryForm deliveryConfigured={deliveryConfigured} />;
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Partner with Siccotel."
        intro="Dealers, brands, manufacturing partners and customers — tell us what you need and we’ll route your enquiry to the right team."
      />

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div id="enquiry" className="scroll-mt-28 lg:col-span-7">
            <h2 className="text-3xl font-semibold sm:text-4xl">Send an enquiry</h2>
            <ul className="mt-6 grid gap-x-6 gap-y-3 text-[0.9375rem] sm:grid-cols-2">
              {enquiryTypes.map((t) => (
                <li key={t.value}>
                  <Link href={enquiryHref(t.value)} className="block min-h-14 rounded-[3px] border border-line bg-stone px-4 py-3 transition-colors hover:border-accent hover:bg-white">
                    <span className="font-semibold">{t.label}</span>
                    <span className="mt-1 block text-sm text-muted">{t.audience}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Suspense fallback={<p className="text-ink-soft">Loading enquiry form…</p>}>
                <AvailableEnquiryForm />
              </Suspense>
            </div>
          </div>

          <aside aria-labelledby="details-title" className="lg:col-span-5">
            <div className="rounded-[4px] border border-line bg-stone p-6 sm:p-8 lg:sticky lg:top-28">
              <h2 id="details-title" className="text-2xl font-semibold">
                Contact details
              </h2>
              <ul className="mt-6 space-y-6">
                <li className="flex gap-4">
                  <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <div>
                    <h3 className="font-semibold">{contact.headOffice.label}</h3>
                    <address className="mt-1 text-[0.9375rem] leading-relaxed not-italic text-ink-soft">
                      {contact.headOffice.lines.map((l) => (
                        <span key={l} className="block">
                          {l}
                        </span>
                      ))}
                    </address>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Phone aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <a href={contact.phone.href} className={`mt-1 inline-block text-[0.9375rem] ${linkCls}`}>
                      {contact.phone.display}
                    </a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <MessageCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <div>
                    <h3 className="font-semibold">WhatsApp</h3>
                    <a
                      href={contact.whatsapp.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-1 inline-block text-[0.9375rem] ${linkCls}`}
                    >
                      {contact.whatsapp.display}
                      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
                    </a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Mail aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <div>
                    <h3 className="font-semibold">Sales email</h3>
                    <a href={`mailto:${contact.email}`} className={`mt-1 inline-block text-[0.9375rem] ${linkCls}`}>
                      {contact.email}
                    </a>
                  </div>
                </li>
                <li className="flex gap-4 border-t border-line pt-6">
                  <Factory aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <div>
                    <h3 className="font-semibold">{contact.factory.label}</h3>
                    <address className="mt-1 text-[0.9375rem] leading-relaxed not-italic text-ink-soft">
                      {contact.factory.lines.map((l) => (
                        <span key={l} className="block">
                          {l}
                        </span>
                      ))}
                    </address>
                    <ul className="mt-3 space-y-1 text-[0.9375rem]">
                      {contact.factory.emails.map((e) => (
                        <li key={e.value} className="break-all">
                          <span className="text-muted">{e.label}: </span>
                          <a href={`mailto:${e.value}`} className={linkCls}>
                            {e.value}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>

              <div className="mt-8 border-t border-line pt-6">
                <h3 className="font-semibold">Customer support</h3>
                <ul className="mt-3 space-y-2 text-[0.9375rem]">
                  <li>
                    <a href={externalLinks.carlcareWarranty} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      Android warranty check (Carlcare)
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                  <li>
                    <a href={externalLinks.appleCoverage} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      Apple coverage check
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                  <li>
                    <a href={externalLinks.ptaDirbs} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      PTA device check (DIRBS)
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="mt-8 flex gap-2 border-t border-line pt-6">
                {social.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-white text-ink transition-colors hover:border-ink"
                  >
                    <SocialIcon name={s.icon} />
                    <span className="sr-only">Siccotel on {s.label} (opens in a new tab)</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
