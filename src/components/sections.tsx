import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { contact, networkStats } from "@/content/company";
import { brandPartners, type Partner } from "@/content/partners";
import { milestones, type Milestone } from "@/content/milestones";
import { enquiryHref, enquiryTypes } from "@/content/navigation";
import type { NewsArticle } from "@/content/news";
import { ArrowSwap, Reveal } from "./ui";
import { HeadingWords } from "./HeadingWords";

/* ------------------------------------------------------------------ */
/* Page hero for inner pages                                           */
/* ------------------------------------------------------------------ */
export function PageHero({
  eyebrow,
  title,
  intro,
  tone = "light",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: "light" | "dark";
  children?: ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <section className={`${dark ? "on-dark bg-night text-white" : "bg-stone"} relative overflow-hidden`}>
      {dark && <div aria-hidden className="grid-texture absolute inset-0" />}
      <div
        aria-hidden
        className={`absolute -top-1/2 -right-1/4 size-[60rem] rounded-full ${
          dark ? "bg-[radial-gradient(closest-side,rgba(255,42,42,0.12),transparent)]" : "bg-[radial-gradient(closest-side,rgba(200,0,11,0.05),transparent)]"
        }`}
      />
      <div className="container-site relative pt-16 pb-16 sm:pt-20 lg:pt-28 lg:pb-24">
        <p className="eyebrow hero-in mb-6">{eyebrow}</p>
        <h1 data-anim="heading" data-anim-on-load="" className="t-h1 max-w-4xl">
          <span className="hero-line">
            <span data-page-heading=""><HeadingWords>{title}</HeadingWords></span>
          </span>
        </h1>
        {intro && (
          <div
            className={`t-lead hero-in mt-7 max-w-2xl ${dark ? "text-night-muted" : "text-muted"}`}
            style={{ "--d": "220ms" } as CSSProperties}
          >
            {intro}
          </div>
        )}
        {children && (
          <div className="hero-in" style={{ "--d": "320ms" } as CSSProperties}>
            {children}
          </div>
        )}
      </div>
      <div aria-hidden className={`h-px ${dark ? "bg-night-line" : "bg-line"}`} />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stats — real values rendered in HTML; motion only reveals them       */
/* ------------------------------------------------------------------ */
export function StatsGrid({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4 lg:gap-x-10">
      {networkStats.map((s) => (
        <div key={s.label} className="flex min-w-0 flex-col">
          <dt className={`order-2 mt-3 max-w-[14rem] text-[0.9375rem] leading-snug ${dark ? "text-night-muted" : "text-muted"}`}>
            {s.label}
          </dt>
          <dd className="order-1">
            <span aria-hidden className={`mb-4 block h-[2px] w-8 ${dark ? "bg-accent-on-dark" : "bg-accent"}`} />
            <span className="t-figure block text-[clamp(2.2rem,0.9rem+3.6vw,4.5rem)]">{s.value}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Partner logos                                                       */
/* ------------------------------------------------------------------ */
export function PartnerLogo({ partner, height = 36, className = "" }: { partner: Partner; height?: number; className?: string }) {
  if (!partner.logo) return null;
  const h = Math.round(height * (partner.logoScale ?? 1));
  // Constrain both dimensions so wide wordmarks and compact marks read at a similar optical size.
  const maxW = Math.round(h * 4.2);
  return (
    <Image
      src={partner.logo}
      alt={partner.name}
      sizes="200px"
      className={`w-auto object-contain ${className}`}
      style={{ height: h, maxWidth: `min(100%, ${maxW}px)` }}
    />
  );
}

export function PartnerLogoGrid({ partners = brandPartners }: { partners?: Partner[] }) {
  return (
    <ul className="grid grid-cols-2 border-t border-l border-line sm:grid-cols-4" data-anim="stagger">
      {partners.map((p) => {
        const special = p.relationship !== "Distribution";
        return (
          <li key={p.name} className="group relative flex flex-col border-r border-b border-line bg-white transition-colors duration-500 hover:bg-stone">
            {special && <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-accent" />}
            <div className="flex h-24 items-center justify-center px-4 sm:h-28">
              <PartnerLogo
                partner={p}
                height={30}
                className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
              />
            </div>
            <p className="px-5 pb-5 text-[0.8125rem] leading-snug">
              <span className={special ? "font-semibold text-accent" : "font-semibold text-ink"}>{p.relationship}</span>
              {p.details[0] && <span className="block text-muted">{p.details[0]}</span>}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */
export function Timeline({ items = milestones, compact = false }: { items?: Milestone[]; compact?: boolean }) {
  return (
    <ol className={`relative grid gap-0 ${compact ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2"}`}>
      {items.map((m, i) => (
        <Reveal
          as="li"
          key={m.period + m.title}
          delay={(i % 2) * 80}
          className="relative border-l border-line pb-12 pl-8 md:pr-10"
        >
          <span aria-hidden className="absolute top-2 -left-[5px] size-[9px] rounded-full bg-accent ring-4 ring-white on-dark:ring-night" />
          <p className="t-figure text-[1.75rem] text-ink on-dark:text-white">{m.period}</p>
          <h3 className="mt-3 text-xl font-semibold">{m.title}</h3>
          <p className="mt-2 leading-relaxed text-muted on-dark:text-night-muted">{m.description}</p>
        </Reveal>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* News card                                                           */
/* ------------------------------------------------------------------ */
export function NewsCard({
  article,
  priority = false,
  size = "default",
}: {
  article: NewsArticle;
  priority?: boolean;
  size?: "default" | "large";
}) {
  const image = article.images[0];
  const large = size === "large";
  return (
    <article className="group relative flex h-full flex-col">
      <div
        data-tilt=""
        className={`relative overflow-hidden rounded-[6px] border border-line bg-stone transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-36px_rgba(22,24,27,0.6)] group-has-[a:focus-visible]:outline-2 group-has-[a:focus-visible]:outline-offset-4 group-has-[a:focus-visible]:outline-accent aspect-[16/10]`}
      >
        {image ? (
          // Hover zoom lives on this wrapper; the image itself is moved by scroll parallax.
          <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-has-[a:focus-visible]:scale-[1.04]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={large ? "(min-width: 1024px) 720px, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
              className="object-cover"
              style={{ objectPosition: image.objectPosition }}
              priority={priority}
            />
          </div>
        ) : (
          <div className="on-dark flex h-full items-end bg-night p-6">
            <div aria-hidden className="grid-texture absolute inset-0" />
            <span className="relative font-display text-2xl leading-tight font-semibold text-white">
              {article.context ?? "Siccotel news"}
            </span>
          </div>
        )}
      </div>
      {article.context && (
        <p className="mt-5 text-xs font-semibold tracking-[0.12em] text-accent uppercase">{article.context}</p>
      )}
      <h3
        className={`${article.context ? "mt-2" : "mt-5"} font-display leading-snug font-semibold tracking-[-0.02em] ${
          large ? "text-2xl sm:text-[2rem] sm:leading-[1.15]" : "text-xl"
        }`}
      >
        <Link href={`/news/${article.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          <span className="link-line pb-0.5">{article.title}</span>
        </Link>
      </h3>
      <p className={`mt-3 leading-relaxed text-muted ${large ? "max-w-2xl text-lg" : ""}`}>{article.summary}</p>
      <span aria-hidden className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-ink group-hover:text-accent">
        Read article <ArrowSwap />
      </span>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Enquiry routing CTA                                                 */
/* ------------------------------------------------------------------ */
export function EnquiryPaths({ title = "How can we work together?", intro }: { title?: string; intro?: string }) {
  return (
    <section className="on-dark relative overflow-hidden bg-night text-white" aria-labelledby="enquiry-paths-title">
      <div aria-hidden className="grid-texture absolute inset-0" />
      <svg aria-hidden viewBox="0 0 800 800" className="absolute top-1/2 -right-64 w-[56rem] -translate-y-1/2 opacity-70" fill="none">
        <circle cx="400" cy="400" r="390" stroke="white" strokeOpacity="0.06" />
        <circle cx="400" cy="400" r="290" stroke="white" strokeOpacity="0.05" strokeDasharray="2 7" />
        <circle cx="400" cy="400" r="190" stroke="#ff2a2a" strokeOpacity="0.18" />
        <circle cx="400" cy="400" r="400" fill="url(#cta-glow)" />
        <defs>
          <radialGradient id="cta-glow">
            <stop offset="0%" stopColor="#ff2a2a" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ff2a2a" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      <div className="section-space container-site relative">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-5">Business enquiries</p>
            <h2 id="enquiry-paths-title" className="t-h1" data-anim="heading">
              {title}
            </h2>
            <p className="t-lead mt-6 max-w-md text-night-muted">
              {intro ?? "Choose the option that fits you best and your enquiry will reach the right team."}
            </p>
            <ul className="mt-10 space-y-3 text-[0.9375rem]">
              <li>
                <a href={contact.phone.href} className="group inline-flex items-center gap-3 text-white/90 hover:text-white">
                  <Phone aria-hidden className="size-4 text-accent-on-dark" />
                  <span className="link-line">{contact.phone.display}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="group inline-flex items-center gap-3 text-white/90 hover:text-white">
                  <Mail aria-hidden className="size-4 text-accent-on-dark" />
                  <span className="link-line">{contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={contact.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 text-white/90 hover:text-white"
                >
                  <MessageCircle aria-hidden className="size-4 text-accent-on-dark" />
                  <span className="link-line">WhatsApp {contact.whatsapp.display}</span>
                  <span className="sr-only"> (opens WhatsApp in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
          <ul className="border-t border-night-line lg:col-span-7" data-anim="stagger">
            {enquiryTypes.map((t, i) => (
              <li key={t.value} className="border-b border-night-line">
                <Link
                  href={enquiryHref(t.value)}
                  className="group grid grid-cols-[auto_1fr_auto] items-start gap-x-5 gap-y-1 py-7 transition-colors duration-500 hover:bg-white/[0.03] sm:gap-x-8 sm:px-4"
                >
                  <span className="pt-1.5 font-display text-sm font-semibold text-accent-on-dark tabular-nums">0{i + 1}</span>
                  <span>
                    <span className="block text-xs font-semibold tracking-[0.12em] text-night-muted uppercase">{t.audience}</span>
                    <span className="mt-1.5 block font-display text-[1.375rem] leading-tight font-semibold tracking-[-0.02em] sm:text-[1.625rem]">
                      {t.label}
                    </span>
                    <span className="mt-2 block max-w-lg text-[0.9375rem] leading-relaxed text-night-muted">{t.description}</span>
                  </span>
                  <span className="mt-1 inline-flex size-11 items-center justify-center rounded-full border border-white/20 transition-colors duration-500 group-hover:border-accent-on-dark group-hover:bg-accent">
                    <ArrowRight aria-hidden className="size-4 transition-transform duration-500 group-hover:-rotate-45" />
                    <span className="sr-only">Start enquiry</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
