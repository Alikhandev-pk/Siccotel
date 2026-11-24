/**
 * The website's current content, expressed in CMS shapes.
 *
 * Two jobs: it is what public pages render until the website import has run
 * (so routes keep working during setup), and it is the source the import copies
 * into the database. After the import, the database is authoritative; editing
 * this file no longer changes the live site.
 */
import type { StaticImageData } from "next/image";
import { asset } from "@/content/asset-manifest";
import { aboutIntro, contact, coreValues, coreValuesIntro, externalLinks, futurePlans, growthText, homeStats, mission, presenceText, social, topBarPhone } from "@/content/company";
import { heroBanners, heroIntro } from "@/content/hero";
import { milestones } from "@/content/milestones";
import { news } from "@/content/news";
import { accessoryPartners, appleRelationship, brandPartners, earlierPartners, manufacturingPartners } from "@/content/partners";
import { assembledDevices } from "@/content/products";
import { homepageClients, retail } from "@/content/retail";
import { networkCities } from "@/content/locations";
import { REGIONAL_MAP_FINGERPRINT } from "@/content/reach-artwork";
import { afterSales, businessActivities } from "@/content/business";
import type { Article, Banner, CmsImage, DocMap, Product } from "./types";

const telecomLogoLight = asset("logos/siccotel-telecom-logo-light.png");
const chairman = asset("website/siccotel-telecom-chairmans-message.jpg");
const assemblyFloor = asset("website/siccotel-telecom-assembly-floor.jpg");
const factoryExterior = asset("website/siccotel-telecom-factory-exterior.jpg");
const distributionThumbsUp = asset("website/distribution-trade-show-thumbs-up-enhanced.jpg");
const retailSmartphones = asset("website/retail-ecommerce-smartphones.png");
const assemblyLine = asset("website/assembly-line-workers.jpg");
const outlinedMap = asset("website/pakistan-regional-map-outlined.png");
const ecommerceClientsArt = asset("website/ecommerce-clients.png");
const hmdMeeting = asset("articles/hmd-global-meeting-china.jpg");
const partnershipCeremony = asset("articles/zte-nubia-partnership-ceremony.jpg");
const partnershipSigning = asset("articles/zte-nubia-partnership-signing.jpg");
const transsionVisitThumbsUp = asset("website/transsion-visit-thumbs-up.png");
const aura2 = asset("products/hmd-aura-2.jpg");

/** A static import as a CMS image. */
export function img(file: StaticImageData, alt: string): CmsImage {
  return { src: file.src, width: file.width, height: file.height, alt, blurDataURL: file.blurDataURL };
}

/* Collections ---------------------------------------------------------------------------- */

export type SeedEntry<T> = { seedKey: string; slug: string; data: T };

export const defaultBanners: SeedEntry<Banner>[] = heroBanners.map((b) => ({
  seedKey: `banner:${b.id}`,
  slug: b.id,
  data: {
    brand: b.brand,
    title: b.title,
    // The campaign originals are 4267 × 1531 PNGs, stored unmodified.
    desktop: { src: b.src, width: 4267, height: 1531, alt: b.alt },
    mobile: null,
    background: b.background,
    ctaLabel: b.link.label,
    ctaHref: b.link.href,
  },
}));

const productFacts: Record<string, { brand: string; category: string }> = {
  "HMD Aura 2": { brand: "HMD", category: "Smartphone" },
  "Zentality B105": { brand: "Zentality", category: "Feature phone" },
  "Zentality B106": { brand: "Zentality", category: "Feature phone" },
  "Zentality B220": { brand: "Zentality", category: "Feature phone" },
  "Zentality B3310": { brand: "Zentality", category: "Feature phone" },
};

/** The homepage manufacturing band shows these three, in this order. */
const homepageFeatured = ["HMD Aura 2", "Zentality B220", "Zentality B3310"];

export const defaultProducts: SeedEntry<Product>[] = assembledDevices.map((d) => {
  const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    seedKey: `product:${slug}`,
    slug,
    data: {
      name: d.name,
      brand: productFacts[d.name]?.brand ?? "",
      category: productFacts[d.name]?.category ?? "",
      description: "Listed under “Our Products” on the Siccotel Telecom website.",
      images: [img(d.img, d.name)],
      storeUrl: "",
      assembled: true,
      showOnAssembly: true,
    },
  };
});
/** Order shown on /products and /assembly: the homepage three first, then the rest. */
defaultProducts.sort((a, b) => rank(a.data.name) - rank(b.data.name));
function rank(name: string) {
  const i = homepageFeatured.indexOf(name);
  return i === -1 ? 10 + assembledDevices.findIndex((d) => d.name === name) : i;
}

/** The structured article body, as the plain-text format the editor uses. */
function bodyText(blocks: (typeof news)[number]["body"]): string {
  return blocks
    .map((block) => {
      if (typeof block === "string") return block;
      if ("list" in block) return block.list.map((li) => `- ${li}`).join("\n");
      return `> ${block.quote}`;
    })
    .join("\n\n");
}

/** Cover crops that need a non-centred focal point (verified against the cards). */
const coverPositions: Record<string, string> = {
  // A near-square group photo: anchoring higher keeps every face inside the 16:10 cards.
  "accelerating-5g-device-adoption-in-pakistan": "50% 20%",
};

export const defaultNews: SeedEntry<Article>[] = news.map((a) => {
  const [cover, ...gallery] = a.images.map((i) => img(i.src, i.alt));
  return {
    seedKey: `news:${a.slug}`,
    slug: a.slug,
    data: {
      title: a.title,
      context: a.context ?? "",
      summary: a.summary,
      body: bodyText(a.body),
      cover: cover ?? null,
      coverPosition: coverPositions[a.slug] ?? "50% 50%",
      date: "",
      tags: [],
      gallery,
    },
  };
});

/* Documents ------------------------------------------------------------------------------ */

/** The same photos the CMS publishes; an empty slot would show its card without a picture. */
const businessCardImages = {
  distribution: { image: img(distributionThumbsUp, "Three executives giving a thumbs-up at a trade show stand"), position: "50% 50%" },
  manufacturing: {
    image: img(factoryExterior, "The Siccotel Telecom assembly plant building at Korangi Creek Industrial Park, Karachi"),
    position: "50% 30%",
  },
  // Left-aligned crop keeps the shopping-bag logo at the artwork's left edge whole.
  retail: { image: img(retailSmartphones, "Three smartphones, including an HMD phone, on a red background with a shopping-bag logo"), position: "0% 50%" },
};

const servicePhotos = {
  distribution: { image: img(partnershipCeremony, "Siccotel and ZTE nubia teams at the partnership ceremony"), caption: "Siccotel and ZTE nubia mark their distribution partnership." },
  manufacturing: { image: img(aura2, "HMD Aura 2 smartphone in teal"), caption: "HMD Aura 2, featured by Siccotel Telecom." },
  retail: {
    image: img(
      ecommerceClientsArt,
      "Logos of e-commerce clients: Ufone, Alfamall, Standard Chartered, Daraz, JazzCash, PriceOye, Faysal Bank, Meezan Bank, foodpanda, Bykea, easypaisa and Kistpay",
    ),
    caption: "E-commerce clients, as listed by Siccotel.",
  },
};

export const defaultDocs: DocMap = {
  settings: {
    email: contact.email,
    topBarPhoneDisplay: topBarPhone.display,
    topBarPhoneHref: topBarPhone.href,
    headOffice: { ...contact.headOffice, lines: [...contact.headOffice.lines] },
    factory: { label: contact.factory.label, lines: [...contact.factory.lines], emails: contact.factory.emails.map((e) => ({ ...e })) },
    social: social.map((s) => ({ ...s })),
    links: { ...externalLinks },
  },

  home: {
    hero: {
      eyebrow: heroIntro.eyebrow,
      headline1: heroIntro.headline[0],
      headline2: heroIntro.headline[1],
      description: heroIntro.description,
      actionLabel: heroIntro.action.label,
      actionHref: heroIntro.action.href,
    },
    partnerStripTitle: "Trusted by Global Device Brands",
    glance: {
      eyebrow: "Get To Know Us",
      title: "Pakistan’s Largest Smartphone Distributors",
      lead: "Founded in Karachi in 2001, Siccotel is a smartphone distributor, manufacturer and retailer with after-sales support in major cities across Pakistan. It is the official partner of leading global brands including Infinix, Samsung, itel, Nokia, realme, Tecno and ZTE nubia.",
      body: growthText,
      assurances: ["Authorized distribution", "Official warranty", "Genuine stock"],
      photos: [
        { image: img(transsionVisitThumbsUp, "Siccotel representatives and Transsion hosts giving a thumbs-up in front of the Transsion sign outside the company’s offices"), caption: "" },
        { image: img(hmdMeeting, "Siccotel and HMD Global representatives at HMD’s offices"), caption: "" },
      ],
      stats: homeStats.map((s) => ({ ...s })),
    },
    business: {
      eyebrow: "Our business",
      title: "From Global Brands to Everyday Connections",
      intro: "",
      cardImages: [businessCardImages.distribution, businessCardImages.manufacturing, businessCardImages.retail],
    },
    retail: {
      eyebrow: "Retail & e-commerce",
      title: "Shop, Get Support or Become a Partner",
      intro: retail.intro,
      introShort: retail.introShort,
      clientsTitle: "Corporate & E-commerce Clients",
    },
    clients: homepageClients.map((c) => ({ name: c.name, logo: img(c.logo, c.name), url: c.url ?? "", serveAsIs: Boolean(c.serveAsIs) })),
    reach: {
      eyebrow: "Nationwide reach",
      title: "A Network That Reaches Every Region",
      intro: "Siccotel’s sales and support network spans Pakistan’s north, central and south regions from its base in Karachi.",
      map: img(
        outlinedMap,
        "Map of Pakistan divided into Siccotel's south, central and north regions, outlined in red, blue and green, with a legend. Marked cities: Peshawar, Rawalpindi, Sialkot, Gujranwala, Lahore, Faisalabad, Multan, Quetta, Sukkur and Karachi, with Kashmir labelled.",
      ),
      layoutWidth: 478,
      layoutHeight: 412,
      markersArtwork: REGIONAL_MAP_FINGERPRINT,
      cities: networkCities.map((c) => ({ ...c })),
    },
    manufacturing: {
      eyebrow: "Manufacturing",
      title: "Made In Pakistan!",
      intro: "Siccotel Telecom (Pvt) Ltd is the group’s mobile phone assembly plant in Korangi Creek Industrial Park, Karachi — built to assemble devices for different brands under the Government’s “Made in Pakistan” initiative.",
      figure: "120,000",
      figureLabel: "sq. ft. of operational space at KCIP, Karachi",
      // Without an image the band would show its text across the full width.
      photo: { image: img(assemblyLine, "Workers in white caps and coats at the benches of a mobile phone assembly line, under a Pakistan flag"), caption: "" },
      chain: ["Component Sourcing", "Assembly", "Nationwide Distribution", "Service Centres"],
      productsTitle: "Featured by Siccotel Telecom",
    },
    journey: {
      eyebrow: "Company journey",
      title: "Two Decades of Steady Progress",
      intro: "From a Karachi retail business to a nationwide distributor and manufacturer.",
    },
    newsTitle: { eyebrow: "News & media", title: "Latest from Siccotel", intro: "" },
    enquiry: {
      title: "Partner with Siccotel",
      intro: "Brands, dealers and manufacturing partners — tell us what you need and your enquiry will reach the right team.",
    },
  },

  about: {
    hero: {
      eyebrow: "About Siccotel",
      title: "Building Pakistan’s Access to Technology",
      intro: "",
    },
    intro: [...aboutIntro],
    lookingAhead: "",
    photos: [
      { image: img(partnershipSigning, "Siccotel and ZTE nubia teams at the partnership signing"), caption: "Signing the ZTE nubia partnership, 2025." },
    ],
    stats: homeStats.map((s) => ({ ...s })),
    mission: { eyebrow: "Our mission", title: "Technology, Summed Up in One Word", text: mission },
    values: { eyebrow: "Core values", title: "What We Stand For", intro: coreValuesIntro, items: [...coreValues] },
    presence: {
      eyebrow: "Our presence",
      title: "Affordable Technology for Every Household",
      text: presenceText,
      map: img(
        outlinedMap,
        "Map of Pakistan divided into Siccotel's south, central and north regions, outlined in red, blue and green, with a legend. Marked cities: Peshawar, Rawalpindi, Sialkot, Gujranwala, Lahore, Faisalabad, Multan, Quetta, Sukkur and Karachi, with Kashmir labelled.",
      ),
    },
    journey: {
      eyebrow: "Our journey",
      title: "Documented Milestones",
      intro: "Milestones as published in Siccotel’s journey timeline.",
      milestones: milestones.map((m) => ({
        ...m,
        highlight: Boolean(m.highlight),
        brands: m.brands.map((b) => ({ name: b.name, title: b.title ?? "", logo: b.logo ? img(b.logo, b.name) : null })),
      })),
    },
  },

  services: {
    hero: {
      eyebrow: "Services",
      title: "One Partner, from Import to the Final Sale",
      intro: "Siccotel combines distribution, local manufacturing and retail. Each part of the business serves a different audience — here is what we do and how to work with us.",
    },
    activities: businessActivities.map((a) => ({
      id: a.id as "distribution" | "manufacturing" | "retail",
      kicker: a.kicker,
      title: a.title,
      summary: a.summary,
      audience: a.audience,
      points: [...a.points],
      photo: servicePhotos[a.id as keyof typeof servicePhotos],
      cta: a.next.label,
    })),
    afterSales: { eyebrow: "For customers", title: afterSales.title, short: afterSales.short, text: afterSales.text },
  },

  assembly: {
    hero: {
      eyebrow: "Assembly",
      title: "Assembling Devices in Pakistan, for Pakistan",
      intro: "Siccotel moved into local manufacturing by setting up Siccotel Telecom (Pvt) Ltd — an assembly plant in Korangi Creek Industrial Park, Karachi, supporting the Government of Pakistan’s “Made in Pakistan” initiative.",
    },
    overview: {
      eyebrow: "Facility overview",
      title: "Siccotel Telecom",
      paragraphs: [
        "Siccotel Telecom is the group’s assembly plant in Korangi Creek Industrial Park, Karachi, with a 120,000 sq. ft. operational space and room for multiple production and packing lines.",
        "It extends an end-to-end service delivery infrastructure — from component sourcing and assembly to nationwide distribution and service centres — that underpins Siccotel’s commitment to excellence.",
        "The plant contributes to the local economy through employment and localisation under the “Made in Pakistan” initiative.",
      ],
      facts: [
        { label: "Facility", value: "Siccotel Telecom (Pvt) Ltd" },
        { label: "Location", value: "Korangi Creek Industrial Park, Karachi" },
        { label: "Operational space", value: "120,000 sq. ft." },
        { label: "Focus", value: "Mobile phone assembly for different brands" },
      ],
    },
    photos: [
      { image: img(assemblyFloor, "Mobile phone assembly floor shown by Siccotel Telecom"), caption: "Assembly operations, from Siccotel Telecom’s official photography." },
      { image: img(factoryExterior, "Siccotel Telecom factory exterior with Siccotel signage"), caption: "The Siccotel Telecom facility in Karachi." },
    ],
    chain: {
      eyebrow: "How it fits together",
      title: "An End-to-End Chain",
      intro: "Manufacturing connects directly to Siccotel’s distribution and after-sales network.",
      steps: [
        { title: "Component Sourcing", text: "Sourcing components for assembly." },
        { title: "Assembly", text: "Assembling mobile phones for partner brands in Karachi." },
        { title: "Nationwide Distribution", text: "Moving devices through regional hubs to wholesalers and retailers." },
        { title: "Service Centres", text: "After-sales support for customers once devices are sold." },
      ],
    },
    chairman: {
      photo: img(chairman, "Portrait accompanying the Chairman’s message on the Siccotel Telecom website"),
      quote: "Our new facility symbolises more than masonry and equipment; it represents our commitment to evolving the technology landscape, local economic activity and excellence.",
      body: "We envision Pakistan not merely as a consumer of technology but as a meaningful participant in global innovation — and Siccotel Telecom will do its part with pride, while boosting the local economy through employment and localisation under the Made in Pakistan initiative.",
      attribution: "From the Chairman’s message, Siccotel Telecom.",
    },
    products: { eyebrow: "Products", title: "Featured by Siccotel Telecom", intro: "Devices listed under “Our Products” on the Siccotel Telecom website." },
    partners: {
      eyebrow: "Strategic partners",
      title: "Partners of Siccotel Telecom",
      logos: manufacturingPartners.map((p) => ({ name: p.name, logo: img(p.logo!, p.name), logoScale: p.logoScale ?? 1 })),
      plans: futurePlans,
    },
    contact: {
      eyebrow: "Work with us",
      title: "Talk to Us About Local Assembly",
      intro: "Brands and manufacturing partners can send an enquiry, or contact Siccotel Telecom directly.",
    },
  },

  partners: {
    hero: {
      eyebrow: "Partners",
      title: "Partnerships with Global Device Brands",
      intro: "Siccotel’s relationships differ from brand to brand. Each one is described here as published by Siccotel — whether distribution, exclusive distribution, authorized reselling or a manufacturing partnership.",
    },
    brandsSection: {
      eyebrow: "Device brands",
      title: "Distribution Partnerships",
      note: "Start years are taken from Siccotel’s published journey timeline. ZTE nubia’s exclusive distribution was announced on Siccotel’s News & Media page.",
    },
    brands: brandPartners.map((p) => ({ name: p.name, logo: img(p.logo!, p.name), relationship: p.relationship, details: [...p.details], logoScale: p.logoScale ?? 1 })),
    apple: { ...appleRelationship },
    accessories: accessoryPartners.map((p) => ({ ...p })),
    accessoriesNote: "Siccotel also distributes Infinix, itel and Tecno accessories.",
    earlier: earlierPartners.map((p) => ({ ...p })),
    manufacturingSection: {
      eyebrow: "Manufacturing",
      title: "Strategic Partners of Siccotel Telecom",
      intro: "Listed as strategic partners by Siccotel Telecom, the group’s assembly plant in Karachi.",
    },
    cta: { eyebrow: "For brands", title: "Bring Your Brand to Pakistan with Siccotel", intro: "Talk to us about distribution, retail reach and local assembly." },
  },

  newsPage: {
    hero: { eyebrow: "News & media", title: "Unlocking IT and Telecom Opportunities", intro: "Partnerships, industry events and milestones from Siccotel — most recent first." },
    footnote: "Articles are republished from Siccotel’s News & Media page, which does not list publication dates. Event dates are shown only where an article states them.",
  },

  contact: {
    hero: {
      eyebrow: "Contact",
      title: "Partner with Siccotel",
      intro: "Dealers, brands, manufacturing partners and customers — tell us what you need and we’ll route your enquiry to the right team.",
    },
    formTitle: "Send an Enquiry",
    detailsTitle: "Contact Details",
    supportTitle: "Customer Support",
  },

  productsPage: {
    title: "Products",
  },
};

/** The Siccotel Telecom wordmark is part of the site design, not editable content. */
export const telecomLogo = telecomLogoLight;
