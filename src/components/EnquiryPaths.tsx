import Link from "next/link";
import {
  ArrowRight,
  Handshake,
  Headset,
  Mail,
  Store,
} from "lucide-react";
import type { ComponentType } from "react";
import { enquiryHref, enquiryTypes, type EnquiryType } from "@/content/navigation";
import { Reveal } from "@/components/animations/Reveal";

const enquiryIcons: Record<
  EnquiryType,
  ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  dealer: Store,
  brand: Handshake,
  general: Headset,
};

/**
 * "Business enquiries" band shown at the foot of the Home, About and Services
 * pages: contact emails on the left, one card per enquiry type on the right,
 * each opening the Contact form with that type selected.
 */
export function EnquiryPaths({
  title,
  intro,
  emails,
}: {
  title: string;
  intro: string;
  /** From contactEmails(settings). */
  emails: string[];
}) {
  return (
    <section
      aria-labelledby="enquiry-paths-title"
      className="relative overflow-hidden bg-stone py-10 sm:py-12 lg:py-14"
    >
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14 items-start">
          {/* Left column: eyebrow, heading, intro, contact emails */}
          <Reveal className="flex flex-col justify-between lg:col-span-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-brand uppercase sm:text-[0.8125rem]">
                <span className="h-[2px] w-5 rounded-full bg-brand" aria-hidden="true" />
                <span>Business enquiries</span>
              </div>
              <h2
                id="enquiry-paths-title"
                className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]"
              >
                {title}
              </h2>
              <p className="mt-3 max-w-md text-base leading-relaxed text-muted sm:mt-4 sm:text-[1.0625rem]">
                {intro}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8">
              {emails.map((addr) => (
                <a
                  key={addr}
                  href={`mailto:${addr}`}
                  className="group inline-flex items-center gap-2.5 text-base font-bold text-brand transition-colors hover:text-accent-hover hover:underline underline-offset-4 sm:text-lg"
                >
                  <Mail aria-hidden="true" className="size-5 shrink-0 text-brand" strokeWidth={2} />
                  <span>{addr}</span>
                </a>
              ))}
            </div>
          </Reveal>

          {/* Right column: one card per enquiry type */}
          <Reveal
            as="div"
            mode="children"
            y={24}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:col-span-7"
          >
            {enquiryTypes.map((t) => {
              const Icon = enquiryIcons[t.value];
              return (
                <Link
                  key={t.value}
                  href={enquiryHref(t.value)}
                  className="group flex flex-col justify-between rounded-xl border border-line bg-white p-5 transition-all duration-200 hover:border-line-strong hover:shadow-[0_4px_20px_-4px_rgba(22,24,27,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-5.5 lg:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    {Icon ? (
                      <Icon
                        aria-hidden="true"
                        className="size-7 text-brand transition-transform duration-200 group-hover:scale-105"
                        strokeWidth={1.75}
                      />
                    ) : (
                      <span className="size-7" />
                    )}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4.5 text-brand transition-transform duration-200 group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="mt-4 sm:mt-5">
                    <h3 className="font-display text-base font-bold tracking-tight text-ink transition-colors group-hover:text-brand sm:text-lg">
                      {t.label}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-[0.875rem]">
                      {t.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
