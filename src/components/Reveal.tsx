import type { ReactNode } from "react";

/**
 * Scroll-triggered reveal. Marks the element for the shared GSAP motion
 * system (see components/motion/PageMotion). Content is always present and
 * visible in the server HTML; reduced-motion users never see it hidden.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  variant = "fade",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "fade" | "image" | "heading";
  as?: "div" | "li" | "section" | "article" | "figure";
}) {
  return (
    <Tag className={className} data-anim={variant} data-anim-delay={delay || undefined}>
      {children}
    </Tag>
  );
}
