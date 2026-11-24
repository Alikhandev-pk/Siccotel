import { externalLinks } from "./company";

/**
 * Header navigation, desktop and mobile, in the client-approved order and
 * wording. Each entry is a page URL without a hash, so it opens at the top.
 */
export const headerNav = [
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Assembly", href: "/assembly" },
  { label: "Partners", href: "/partners" },
  { label: "News & Media", href: "/news" },
  { label: "Contact Us", href: "/contact" },
] as const;

/** Footer site links: the same pages, order and wording as the header. */
export const mainNav = headerNav;

/** Customer destinations, kept apart from the corporate navigation. */
export const utilityNav = [
  { label: "SiccoCare", detail: "Warranty and after-sales support", href: "/services#after-sales", external: false },
  { label: "Sicco Store", detail: "Shop genuine devices online", href: externalLinks.siccoStore, external: true },
] as const;

export const enquiryTypes = [
  {
    value: "dealer",
    label: "Dealer / Retail Partnership",
    audience: "Dealers, wholesalers and retailers",
    description: "Stock genuine, officially warranted devices through Siccotel’s nationwide distribution network.",
  },
  {
    value: "brand",
    label: "Brand Partnership",
    audience: "International brands",
    description: "Explore distribution, retail and launch support for your devices in Pakistan.",
  },
  {
    value: "general",
    label: "General Enquiry / Support",
    audience: "Customers and everyone else",
    description: "Questions about products, warranty or anything else — we’ll route you to the right team.",
  },
] as const;

export type EnquiryType = (typeof enquiryTypes)[number]["value"];

export const enquiryHref = (type: EnquiryType) => `/contact?type=${type}#enquiry`;

/**
 * Retired enquiry types that old links, bookmarks or a cached form may still send.
 * "Manufacturing Enquiry" was removed on 24 November 2026; its audience (device
 * brands looking at local assembly) is now served by Brand Partnership.
 */
const legacyEnquiryTypes = new Map<string, EnquiryType>([["manufacturing", "brand"]]);

/** A current enquiry type for a URL or submitted value, or "" when it matches none. */
export function resolveEnquiryType(value: string | null | undefined): EnquiryType | "" {
  const v = (value ?? "").trim().toLowerCase();
  if (enquiryTypes.some((t) => t.value === v)) return v as EnquiryType;
  return legacyEnquiryTypes.get(v) ?? "";
}
