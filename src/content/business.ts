import type { EnquiryType } from "./navigation";

export type BusinessActivity = {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  audience: string;
  points: string[];
  next: { label: string; enquiry?: EnquiryType; href?: string; external?: boolean };
  detailHref: string;
};

export const businessActivities: BusinessActivity[] = [
  {
    id: "distribution",
    title: "Distribution",
    kicker: "Nationwide reach for global brands",
    summary:
      "Siccotel distributes smartphones, accessories and TVs for global brands across Pakistan, backed by official warranty and genuine stock.",
    audience: "International brands and established dealers",
    points: [
      "Distribution relationships with Infinix, ZTE nubia, itel, Tecno, Samsung, realme, Nokia and HMD",
      "Accessories distribution for Infinix, itel, Tecno and oraimo, plus Energizer",
      "A network of 6+ regional hubs and offices serving 800+ wholesalers and 4,500+ retailers",
      "End-to-end execution, from imports through to the final sale",
    ],
    next: { label: "Discuss a brand partnership", enquiry: "brand" },
    detailHref: "/business#distribution",
  },
  {
    id: "manufacturing",
    title: "Manufacturing",
    kicker: "Assembled in Karachi",
    summary:
      "Through Siccotel Telecom (Pvt) Ltd, the group assembles mobile phones for different brands at its plant in Korangi Creek Industrial Park, Karachi.",
    audience: "Device brands and manufacturing partners",
    points: [
      "A 120,000 sq. ft. operational space at Korangi Creek Industrial Park",
      "Assembly of mobile phones for different brands",
      "Supports the Government of Pakistan’s “Made in Pakistan” initiative",
      "Strategic partners include HMD, Nokia, Zentality and Deploy",
    ],
    next: { label: "Make a manufacturing enquiry", enquiry: "manufacturing" },
    detailHref: "/manufacturing",
  },
  {
    id: "retail",
    title: "Retail & E-commerce",
    kicker: "Roots in Pakistan’s retail market",
    summary:
      "Siccotel began in retail in 2001 and still reaches customers directly — through its retail partners, its own online store and leading e-commerce platforms.",
    audience: "Dealers, retailers and online marketplaces",
    points: [
      "Retail heritage dating back to the company’s founding years (2001–2006)",
      "Sicco Store, the company’s own online store",
      "E-commerce clients include Daraz, PriceOye and foodpanda, among others",
      "Own mobile phone brand, HIQO, launched in 2011",
    ],
    next: { label: "Become a dealer or retail partner", enquiry: "dealer" },
    detailHref: "/business#retail",
  },
];

export const afterSales = {
  title: "SiccoCare after-sales support",
  text: "Customer service is a core value at Siccotel. The company supports customers after purchase, with after-sales service centres in major cities of Pakistan, and points them to the right warranty check for their device.",
};
