import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { HeadingWords } from "./HeadingWords";

type ButtonVariant = "primary" | "secondary" | "ghost-dark" | "light";

const buttonBase =
  "group inline-flex min-h-12 items-center justify-center gap-3 rounded-[3px] px-6 text-[0.9375rem] text-center leading-tight font-semibold sm:whitespace-nowrap tracking-[-0.005em] transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-out active:translate-y-px";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover shadow-[0_6px_18px_-10px_rgba(200,0,11,0.65)]",
  secondary: "border border-ink/15 bg-white text-ink hover:border-ink/50",
  "ghost-dark": "border border-white/25 text-white hover:border-white/70 hover:bg-white/5",
  light: "bg-white text-ink hover:bg-stone",
};

/** Arrow that slides out while a twin slides in on hover/focus. */
export function ArrowSwap({ external = false }: { external?: boolean }) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  return (
    <span aria-hidden className="btn-arrow">
      <Icon className="size-4" strokeWidth={2.25} />
      <Icon className="size-4" strokeWidth={2.25} />
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
  className = "",
  icon = true,
  magnetic = false,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  external?: boolean;
  className?: string;
  icon?: boolean;
  /** Subtle magnetic pull on desktop pointers. Use only on a few key CTAs. */
  magnetic?: boolean;
}) {
  const content = (
    <>
      <span>{children}</span>
      {icon && <ArrowSwap external={external} />}
    </>
  );
  const cls = `${buttonBase} ${buttonVariants[variant]} ${className}`;
  const magnet = magnetic ? { "data-magnetic": "" } : {};
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...magnet}>
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...magnet}>
      {content}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  external,
  className = "",
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
}) {
  const cls = `group inline-flex items-center gap-2 font-semibold text-accent on-dark:text-white ${className}`;
  const inner = (
    <>
      <span className="link-line pb-0.5">{children}</span>
      <ArrowSwap external={external} />
    </>
  );
  return external ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
      {inner}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  as: Heading = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <Heading className="t-h2" data-anim="heading">
        <HeadingWords>{title}</HeadingWords>
      </Heading>
      {intro && <div data-anim="fade" className="t-lead mt-5 max-w-2xl text-muted on-dark:text-night-muted">{intro}</div>}
    </div>
  );
}

export { Reveal } from "./Reveal";
