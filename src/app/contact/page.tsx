import { Factory, Mail, MapPin } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getDoc, getSettings } from "@/lib/cms/public";
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
/** Stand-alone links reach a 44px target on phones and keep their text size elsewhere. */
const tapCls = "inline-flex min-h-11 items-center sm:inline sm:min-h-0";
const tapBlockCls = "inline-flex min-h-11 items-center sm:mt-1 sm:inline-block sm:min-h-0";

async function AvailableEnquiryForm({ email }: { email: string }) {
  // Read delivery availability at request time, so a build cannot retain a stale
  // configuration state. Only this boolean is passed to the browser.
  await connection();
  const deliveryConfigured = Boolean(
    (process.env.RESEND_API_KEY && process.env.ENQUIRY_TO_EMAIL && process.env.ENQUIRY_FROM_EMAIL) ||
      process.env.ENQUIRY_WEBHOOK_URL,
  );

  return <EnquiryForm deliveryConfigured={deliveryConfigured} email={email} />;
}

export default async function ContactPage() {
  const [doc, settings] = await Promise.all([getDoc("contact"), getSettings()]);
  const contact = settings;
  const social = settings.social;
  const externalLinks = settings.links;
  return (
    <>
      <PageHero eyebrow={doc.hero.eyebrow} title={doc.hero.title} intro={doc.hero.intro} />

      <section className="section-space">
        <div className="container-site grid gap-8 sm:gap-14 lg:grid-cols-12 lg:gap-12">
          <div id="enquiry" className="lg:col-span-7">
            <h2 className="text-[1.75rem] font-semibold sm:text-4xl">{doc.formTitle}</h2>
            <ul className="mt-4 grid gap-x-6 gap-y-2 text-[0.9375rem] sm:mt-6 sm:grid-cols-2 sm:gap-y-3">
              {enquiryTypes.map((t) => (
                <li key={t.value}>
                  <Link href={enquiryHref(t.value)} className="block min-h-14 rounded-[3px] border border-line bg-stone px-4 py-2.5 transition-colors hover:border-accent hover:bg-white sm:py-3">
                    <span className="font-semibold">{t.label}</span>
                    <span className="mt-1 block text-sm text-muted">{t.audience}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 sm:mt-10">
              <Suspense fallback={<p className="text-ink-soft">Loading enquiry form…</p>}>
                <AvailableEnquiryForm email={settings.email} />
              </Suspense>
            </div>
          </div>

          <aside aria-labelledby="details-title" className="lg:col-span-5">
            <div className="rounded-[4px] border border-line bg-stone p-4 sm:p-8 lg:sticky lg:top-28">
              <h2 id="details-title" className="text-2xl font-semibold">
                {doc.detailsTitle}
              </h2>
              <ul className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
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
                  <Mail aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <div>
                    <h3 className="font-semibold">Sales Email</h3>
                    <a href={`mailto:${contact.email}`} className={`${tapBlockCls} text-[0.9375rem] ${linkCls}`}>
                      {contact.email}
                    </a>
                  </div>
                </li>
                <li className="flex gap-4 border-t border-line pt-4 sm:pt-6">
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
                        <li key={e.value} className="[overflow-wrap:anywhere]">
                          {/* On its own line, so an address stays whole on narrow screens. */}
                          <span className="block text-sm text-muted">{e.label}</span>
                          <a href={`mailto:${e.value}`} className={`${tapCls} ${linkCls}`}>
                            {e.value}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>

              <div className="mt-5 border-t border-line pt-4 sm:mt-8 sm:pt-6">
                <h3 className="font-semibold">{doc.supportTitle}</h3>
                <ul className="mt-1 text-[0.9375rem] sm:mt-3 sm:space-y-2">
                  <li>
                    <a href={externalLinks.carlcareWarranty} target="_blank" rel="noopener noreferrer" className={`${tapCls} ${linkCls}`}>
                      Android warranty check (Carlcare)
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                  <li>
                    <a href={externalLinks.appleCoverage} target="_blank" rel="noopener noreferrer" className={`${tapCls} ${linkCls}`}>
                      Apple coverage check
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                  <li>
                    <a href={externalLinks.ptaDirbs} target="_blank" rel="noopener noreferrer" className={`${tapCls} ${linkCls}`}>
                      PTA device check (DIRBS)
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="mt-5 flex gap-2 border-t border-line pt-4 sm:mt-8 sm:pt-6">
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
