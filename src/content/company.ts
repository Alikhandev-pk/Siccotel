/**
 * Company facts. Every value here is taken from siccotel.com or
 * siccoteltelecom.com — see docs/CONTENT_AUDIT.md for sources and open gaps.
 * Figures that conflict between sources are deliberately left out.
 */

export const company = {
  name: "Siccotel",
  legalName: "Siccotel Pvt. Ltd.",
  tagline: "Your most reliable partner!",
  foundedYear: 2001,
  city: "Karachi",
  country: "Pakistan",
  shortDescription:
    "Siccotel is a Karachi-based smartphone distributor, manufacturer and retailer, serving Pakistan through a nationwide network of regional hubs, wholesalers and retailers since 2001.",
} as const;

export const contact = {
  email: "sales@siccotel.com",
  phone: { display: "+92 300 0174226", href: "tel:+923000174226" },
  whatsapp: { display: "+92 300 0174226", href: "https://wa.me/923000174226" },
  headOffice: {
    label: "Head office",
    lines: [
      "Alpha Trade Tower, Plot 6-C/1, Lane 12",
      "DHA Phase 2, Khayaban-e-Ittehad",
      "Karachi, Pakistan",
    ],
    street: "Alpha Trade Tower, Plot 6-C/1, Lane 12, DHA Phase 2, Khayaban-e-Ittehad",
    locality: "Karachi",
  },
  factory: {
    label: "Siccotel Telecom assembly plant",
    lines: [
      "GA-29-A6 & GA-30-A6",
      "Korangi Creek Industrial Park (KCIP)",
      "Karachi, Pakistan",
    ],
    emails: [
      { label: "Business", value: "biz@siccoteltelecom.com" },
      { label: "Information", value: "info@siccoteltelecom.com" },
      { label: "Customer services", value: "cs@siccoteltelecom.com" },
    ],
  },
} as const;

export const social = [
  { label: "Facebook", href: "https://www.facebook.com/siccotelpakistan/", icon: "facebook" },
  { label: "Instagram", href: "https://www.instagram.com/siccotel_pakistan/", icon: "instagram" },
] as const;

export const externalLinks = {
  siccoStore: "https://siccostore.pk/",
  siccotelTelecom: "https://siccoteltelecom.com/",
  ptaDirbs: "https://dirbs.pta.gov.pk/",
  carlcareWarranty: "https://www.carlcare.com/pk/warranty-check/",
  appleCoverage: "https://checkcoverage.apple.com/",
} as const;

/**
 * Network figures. These appear identically on siccotel.com (home) and
 * siccoteltelecom.com (About), so they are treated as verified.
 */
export const networkStats = [
  { value: "2001", label: "Established in Karachi" },
  { value: "6+", label: "Regional hubs & offices" },
  { value: "800+", label: "Wholesalers in the network" },
  { value: "4,500+", label: "Retailers nationwide" },
] as const;

export const mission =
  "To meet the world’s technology needs by specialising so completely in technology that it can be summed up in one word: Siccotel. Because we care about the physical, emotional and logical needs of everyone we serve.";

export const coreValuesIntro =
  "Siccotel believes company values should not be slogans. They should describe the company itself and the people who work in it.";

export const coreValues = [
  "Loyalty",
  "Honesty",
  "Trust",
  "Commitment",
  "Respect",
  "Ingenuity",
  "Accountability",
  "Simplicity",
  "Value-centricity",
] as const;

export const aboutIntro = [
  "Siccotel was established in Karachi in 2001 to give customers high-quality products backed by first-rate customer care. Today it is one of Pakistan’s largest smartphone distributors, manufacturers and retailers, with roots that run deep in the country’s retail market.",
  "The company works as a strategic growth partner to world-renowned brands such as Infinix, itel, Tecno, Nokia, Samsung and realme, and as an Authorized Reseller partner for Apple. Along the way, Siccotel also launched its own mobile phone brand, HIQO.",
  "As digital technology evolved and the market diversified, Siccotel moved into local manufacturing, setting up Siccotel Telecom (Pvt) Ltd to assemble mobile phones for different brands.",
] as const;

export const presenceText =
  "Siccotel recognises that access to technology is essential for a better, more digitally literate Pakistan, and has worked to bring affordable technology to every household in the country. Vertical and backward integration — from importing and assembly to distribution and after-sales — supports the company’s vision of putting Pakistan on the global technology map.";

export const growthText =
  "Siccotel is a customer-centric business that wants to make technology easier to access. It manages execution end to end — from imports through to the final sale — with a firm focus on high-quality products and customer care.";

export const futurePlans =
  "Siccotel Telecom was set up with a plan to diversify into local manufacturing of further products, including accessories and LED TVs, with the long-term objective of exporting globally.";
