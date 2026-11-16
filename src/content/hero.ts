export type HeroBanner = {
  id: string;
  src: string;
  /** The artwork's text is part of the image, so the alt text repeats it. */
  alt: string;
  /** Matches the artwork's left edge; shown behind the banner while the image loads. */
  background: string;
  brand: string;
  title: string;
  /** A verified destination for this product; the banner image itself is not a link. */
  link: { label: string; href: string };
};

/**
 * Campaign banners from the siccotel.com homepage slider, in display order.
 * Files are the unscaled originals, stored unmodified in public/assets/banners;
 * source URLs are in docs/CONTENT_AUDIT.md. Replace or remove entries here when
 * a campaign ends, and re-check each link against the Sicco Store listing.
 */
export const heroBanners: HeroBanner[] = [
  {
    id: "samsung",
    src: "/assets/banners/samsung-galaxy-s26-series-campaign.png",
    alt: "Samsung campaign: Galaxy S26 Series, “Galaxy AI is here”, “Get Yours Now!”, with the S26 FE, S26, S26+ and S26 Ultra fanned out in mint, white, blue and violet.",
    background: "#e6f0f0",
    brand: "Samsung",
    title: "Galaxy S26 Series",
    link: { label: "View on Sicco Store", href: "https://siccostore.pk/product-category/smartphones/?e-filter-a31e8d7-product_brand=samsung" },
  },
  {
    id: "infinix",
    src: "/assets/banners/infinix-hot-70-pro-campaign.png",
    alt: "Infinix campaign: HOT 70 Pro, “Be HOT. Be Different.”, 8GB RAM and 128GB storage, 50MP HOT camera, MediaTek Dimensity 7100 processor and 6.76-inch 144Hz LCD display, with three phones in white, teal and peach.",
    background: "#fdf8f0",
    brand: "Infinix",
    title: "HOT 70 Pro",
    link: { label: "View on Sicco Store", href: "https://siccostore.pk/product/infinix-hot-70-2/" },
  },
  {
    id: "redmagic",
    src: "/assets/banners/redmagic-11-pro-campaign.png",
    alt: "REDMAGIC and nubia campaign: REDMAGIC 11 Pro, “Ignite the Next-Gen”, “Exclusively available at www.siccostore.pk”, with a silver phone beside a model.",
    background: "#ebe8e8",
    brand: "REDMAGIC by nubia",
    title: "REDMAGIC 11 Pro",
    link: { label: "View on Sicco Store", href: "https://siccostore.pk/product/zte-nubia-redmagic-11-pro/" },
  },
];

/** The company statement under the banners, which stays the same across slides. */
export const heroIntro = {
  eyebrow: "Distribution · Manufacturing · Retail",
  headline: ["Connecting Pakistan.", "Powering Possibility."],
  description: "Bringing global device brands to Pakistan through nationwide distribution, local assembly and retail.",
  action: { label: "Explore Our Business", href: "/services" },
  /** Phones have no header button, so the hero carries the partnership route there. */
  partner: { label: "Partner With Us", href: "/contact#enquiry" },
} as const;
