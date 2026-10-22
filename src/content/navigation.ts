export const mainNav = [
  { label: "About", href: "/about" },
  { label: "Our Business", href: "/business" },
  { label: "Manufacturing", href: "/manufacturing" },
  { label: "Partners", href: "/partners" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
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
    value: "manufacturing",
    label: "Manufacturing Enquiry",
    audience: "Manufacturing partners",
    description: "Discuss local assembly at the Siccotel Telecom plant in Korangi Creek Industrial Park, Karachi.",
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
