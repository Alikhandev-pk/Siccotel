import { Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { getDoc, getSettings } from "@/lib/cms/public";
import { enquiryHref, enquiryTypes } from "@/content/navigation";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PageHero } from "@/components/sections";
import { SocialIcon, WhatsAppIcon } from "@/components/SocialIcon";
import { contactEmails, whatsappContact } from "@/lib/contact-links";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact & Partner With Us",
  description:
    "Contact Siccotel in Karachi for dealer and retail partnerships, brand partnerships and customer support.",
  path: "/contact",
});

const linkCls = "font-medium text-ink underline-offset-4 hover:text-accent hover:underline";
/** Stand-alone links reach a 44px target on phones and keep their text size elsewhere. */
const tapCls = "inline-flex min-h-11 items-center sm:inline sm:min-h-0";

export default async function ContactPage() {
  const [doc, settings] = await Promise.all([getDoc("contact"), getSettings()]);
  const contact = settings;
  const social = settings.social;
  const externalLinks = settings.links;
  const emails = contactEmails(contact);
  const whatsapp = whatsappContact(contact);
  return (
    <>
      <PageHero eyebrow={doc.hero.eyebrow} title={doc.hero.title} intro={doc.hero.intro} />

      <section className="section-space">
        <div className="container-site grid gap-8 sm:gap-14 lg:grid-cols-12 lg:gap-12">
          <div id="enquiry" className="lg:col-span-7">
            <h2 className="text-[1.75rem] font-semibold sm:text-4xl">{doc.formTitle}</h2>
            <ul className="mt-4 grid gap-x-4 gap-y-2 text-[0.9375rem] sm:mt-6 sm:grid-cols-3 sm:gap-y-3">
              {enquiryTypes.map((t) => (
                <li key={t.value}>
                  <Link href={enquiryHref(t.value)} className="block h-full min-h-14 rounded-[3px] border border-line bg-stone px-4 py-2.5 transition-colors hover:border-accent hover:bg-white sm:py-3">
                    <span className="font-semibold">{t.label}</span>
                    <span className="mt-1 block text-sm text-muted">{t.audience}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 sm:mt-10">
              <EnquiryForm email={settings.email} />
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
                {emails.length > 0 && (
                  <li className="flex gap-4">
                    <Mail aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <ul className="mt-1 text-[0.9375rem] sm:space-y-1">
                        {emails.map((e) => (
                          <li key={e} className="[overflow-wrap:anywhere]">
                            <a href={`mailto:${e}`} className={`${tapCls} ${linkCls}`}>
                              {e}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                )}
                {whatsapp && (
                  <li className="flex gap-4">
                    <WhatsAppIcon className="mt-0.5 size-5 shrink-0 text-[#13854a]" />
                    <div>
                      <h3 className="font-semibold">WhatsApp</h3>
                      <p className="mt-1 text-[0.9375rem]">
                        <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className={`${tapCls} ${linkCls}`}>
                          {whatsapp.display}
                          <span className="sr-only"> (opens WhatsApp in a new tab)</span>
                        </a>
                      </p>
                    </div>
                  </li>
                )}
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

              {social.length > 0 && (
                <ul aria-label="Siccotel on social media" className="mt-5 flex gap-2 border-t border-line pt-4 sm:mt-8 sm:pt-6">
                  {social.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.label}
                        className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-white text-ink transition-colors hover:border-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <SocialIcon name={s.icon} />
                        <span className="sr-only">Siccotel on {s.label} (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
