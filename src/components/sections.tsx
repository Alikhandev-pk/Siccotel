import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { enquiryHref, enquiryTypes } from "@/content/navigation";
import { fillProps } from "@/lib/cms/image";
import type { Article, CmsImage, Milestone, Published, Stat } from "@/lib/cms/types";
import { ArrowSwap, Reveal, TextLink } from "./ui";
import { HeadingWords } from "./HeadingWords";
import { LogoMarquee } from "./animations/LogoMarquee";
import { Reveal as MotionReveal } from "./animations/Reveal";

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
      <div className="container-site relative pt-9 pb-9 sm:pt-14 sm:pb-12 lg:pt-20 lg:pb-16">
        <p className="eyebrow hero-in mb-3 sm:mb-6">{eyebrow}</p>
        <h1 data-anim="heading" data-anim-on-load="" className="t-h1 max-w-4xl">
          <span className="hero-line">
            <span data-page-heading=""><HeadingWords>{title}</HeadingWords></span>
          </span>
        </h1>
        {intro && (
          <div
            className={`t-lead hero-in mt-4 max-w-2xl sm:mt-7 ${dark ? "text-night-muted" : "text-muted"}`}
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
export function StatsGrid({
  tone = "light",
  stats,
}: {
  tone?: "light" | "dark";
  stats: readonly Stat[];
}) {
  const dark = tone === "dark";
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-10">
      {stats.map((s) => (
        <div key={s.label} className="flex min-w-0 flex-col">
          <dt className={`order-2 mt-1.5 max-w-[14rem] text-[0.9375rem] leading-snug sm:mt-3 ${dark ? "text-night-muted" : "text-muted"}`}>
            {s.label}
          </dt>
          <dd className="order-1">
            <span aria-hidden className={`mb-2.5 block h-[2px] w-8 sm:mb-4 ${dark ? "bg-accent-on-dark" : "bg-accent"}`} />
            {/* Only "n+" counts up: a founding year counting from zero would read as a mistake. */}
            <span className="t-figure block text-[clamp(1.875rem,0.9rem+3vw,3.75rem)]" data-anim={s.value.endsWith("+") ? "count" : undefined}>{s.value}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Partner logos                                                       */
/* ------------------------------------------------------------------ */
export type LogoPartner = { name: string; logo?: CmsImage | null; logoScale?: number };

export function PartnerLogo({ partner, height = 36, className = "", eager = false }: { partner: LogoPartner; height?: number; className?: string; eager?: boolean }) {
  if (!partner.logo?.src) return null;
  const h = Math.round(height * (partner.logoScale ?? 1));
  // Constrain both dimensions so wide wordmarks and compact marks read at a similar optical size.
  const maxW = Math.round(h * 4.2);
  return (
    <Image
      src={partner.logo.src}
      width={partner.logo.width}
      height={partner.logo.height}
      alt={partner.name}
      sizes="200px"
      loading={eager ? "eager" : undefined}
      className={`w-auto object-contain ${className}`}
      style={{ height: h, maxWidth: `min(100%, ${maxW}px)` }}
    />
  );
}

/** A static logo row. */
export function PartnerStrip({ partners, title = "Trusted by global device brands" }: { partners: LogoPartner[]; title?: string }) {
  return (
    <section aria-labelledby="partners-title" className="border-b border-line bg-white">
      <div className="container-site py-3 sm:py-6 lg:py-7">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          <h2 id="partners-title" className="text-xs font-semibold tracking-[0.1em] text-muted uppercase sm:tracking-[0.14em]">
            <span className="sm:hidden">Brand partners</span>
            <span className="hidden sm:inline">{title}</span>
          </h2>
          <TextLink href="/partners" className="min-h-11 shrink-0 text-sm">
            All partners
          </TextLink>
        </div>
        {/* The second copy exists only for the seamless marquee loop (LogoMarquee). */}
        <LogoMarquee>
          {[false, true].map((clone) => (
            <ul
              key={String(clone)}
              aria-hidden={clone || undefined}
              className={`${clone ? "hidden" : "grid"} grid-cols-4 items-center gap-x-3 sm:mt-3 sm:gap-x-4 sm:gap-y-1 lg:grid-cols-8 lg:gap-x-6`}
            >
              {partners.map((p) => (
                <li key={p.name} className="flex h-11 items-center justify-center sm:h-14">
                  {/* Eager: in the moving row, lazy logos would scroll in before they load. */}
                  <PartnerLogo partner={p} height={24} eager />
                </li>
              ))}
            </ul>
          ))}
        </LogoMarquee>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */
export function Timeline({ items, compact = false }: { items: Milestone[]; compact?: boolean }) {
  return (
    <ol className={`relative grid gap-0 ${compact ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2"}`}>
      {items.map((m, i) => (
        <Reveal
          as="li"
          key={m.period + m.title}
          delay={(i % 2) * 80}
          className="relative border-l border-line pb-7 pl-6 sm:pb-12 sm:pl-8 md:pr-10"
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

/** Optional display date on cards: "2026-11-14" → "14 Nov 2026". */
function formatCardDate(date?: string) {
  if (!date || !/^d{4}-d{2}-d{2}$/.test(date)) return "";
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/* ------------------------------------------------------------------ */
/* News card                                                           */
/* ------------------------------------------------------------------ */
export function NewsCard({
  article,
  priority = false,
  size = "default",
}: {
  article: Published<Article>;
  priority?: boolean;
  /** `compact` becomes a thumbnail row on phones; the whole card remains the link. */
  size?: "default" | "large" | "compact";
}) {
  const image = article.cover;
  const large = size === "large";
  const compact = size === "compact";
  return (
    <article className={`group relative h-full ${compact ? "grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-x-3.5 md:flex md:flex-col md:items-stretch" : "flex flex-col"}`}>
      <div
        data-news-media=""
        className={`relative overflow-hidden rounded-[8px] border border-line bg-stone transition-shadow duration-200 group-hover:shadow-[0_18px_40px_-28px_rgba(22,24,27,0.5)] group-has-[a:focus-visible]:outline-2 group-has-[a:focus-visible]:outline-offset-4 group-has-[a:focus-visible]:outline-accent aspect-[16/10]`}
      >
        {image ? (
          // Hover zoom lives on this wrapper; the image itself is moved by scroll parallax.
          <div className="absolute inset-0 transition-transform duration-[250ms] ease-out group-hover:scale-[1.02] group-has-[a:focus-visible]:scale-[1.02]">
            <Image
              {...fillProps(image)} alt={image.alt}
              placeholder="empty"
              sizes={large ? "(min-width: 1024px) 720px, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
              className="object-cover"
              style={{ objectPosition: article.coverPosition || "50% 50%" }}
              priority={priority}
            />
          </div>
        ) : (
          <div className={`on-dark flex h-full items-end bg-night ${compact ? "p-2.5 md:p-6" : "p-6"}`}>
            <div aria-hidden className="grid-texture absolute inset-0" />
            {/* The phone thumbnail is 7.5rem wide, so its label is set small enough to fit. */}
            <span className={`relative font-display leading-tight font-semibold text-white ${compact ? "line-clamp-3 text-[0.8125rem] md:line-clamp-none md:text-2xl" : "text-2xl"}`}>
              {article.context || "Siccotel news"}
            </span>
          </div>
        )}
      </div>
      <div data-news-text="" className="flex min-w-0 flex-1 flex-col">
        {(article.context || article.date) && (
          <p className={`text-xs font-semibold tracking-[0.12em] text-accent uppercase ${compact ? "md:mt-5" : "mt-5"}`}>
            {[article.context, formatCardDate(article.date)].filter(Boolean).join(" · ")}
          </p>
        )}
        <h3
          className={`${article.context || article.date ? (compact ? "mt-1 md:mt-2" : "mt-2") : compact ? "md:mt-5" : "mt-5"} font-display leading-snug font-semibold tracking-[-0.02em] ${
            large ? "text-2xl sm:text-[2rem] sm:leading-[1.15]" : compact ? "text-[1.0625rem] md:text-xl" : "text-xl"
          }`}
        >
          <Link href={`/news/${article.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            <span className="link-line pb-0.5">{article.title}</span>
          </Link>
        </h3>
        <p className={`mt-3 leading-relaxed text-muted ${large ? "max-w-2xl text-lg" : ""} ${compact ? "hidden md:block" : ""}`}>{article.summary}</p>
        <span aria-hidden className={`mt-auto items-center gap-2 pt-5 text-sm font-semibold text-ink group-hover:text-accent ${compact ? "hidden md:inline-flex" : "inline-flex"}`}>
          Read article <ArrowSwap />
        </span>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Enquiry routing CTA                                                 */
/* ------------------------------------------------------------------ */
export function EnquiryPaths({ title = "How can we work together?", intro, email }: { title?: string; intro?: string; email: string }) {
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
        <div className="grid gap-5 sm:gap-14 lg:grid-cols-12 lg:gap-10">
          <MotionReveal className="lg:col-span-5">
            <p className="eyebrow mb-3 sm:mb-5">Business enquiries</p>
            <h2 id="enquiry-paths-title" className="t-h2" data-anim="heading">
              {title}
            </h2>
            <p className="t-lead mt-3 max-w-md text-night-muted sm:mt-6">
              {intro ?? "Choose the option that fits you best and your enquiry will reach the right team."}
            </p>
            {/* Email follows in the footer directly below, so phones skip it here. */}
            <ul className="mt-10 hidden text-[0.9375rem] sm:block">
              <li>
                <a href={`mailto:${email}`} className="group inline-flex items-center gap-3 text-white/90 hover:text-white">
                  <Mail aria-hidden className="size-4 text-accent-on-dark" />
                  <span className="link-line">{email}</span>
                </a>
              </li>
            </ul>
          </MotionReveal>
          <MotionReveal as="ul" mode="children" y={30} className="border-t border-night-line lg:col-span-7">
            {enquiryTypes.map((t, i) => (
              <li key={t.value} className="border-b border-night-line">
                <Link
                  href={enquiryHref(t.value)}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 py-3 transition-colors duration-200 hover:bg-white/[0.03] sm:items-start sm:gap-x-8 sm:px-4 sm:py-7"
                >
                  <span className="font-display text-sm font-semibold text-accent-on-dark tabular-nums sm:pt-1.5">0{i + 1}</span>
                  <span>
                    <span className="hidden text-xs font-semibold tracking-[0.12em] text-night-muted uppercase sm:block">{t.audience}</span>
                    <span className="block font-display text-[1.0625rem] leading-tight font-semibold tracking-[-0.02em] sm:mt-1.5 sm:text-[1.625rem]">
                      {t.label}
                    </span>
                    <span className="mt-2 hidden max-w-lg text-[0.9375rem] leading-relaxed text-night-muted sm:block">{t.description}</span>
                  </span>
                  <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 transition-colors duration-200 group-hover:border-accent-on-dark group-hover:bg-accent sm:mt-1">
                    <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:-rotate-45" />
                    <span className="sr-only">Start enquiry</span>
                  </span>
                </Link>
              </li>
            ))}
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
