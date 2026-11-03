export type HeroBanner = {
  id: string;
  src: string;
  /** The artwork's text is part of the image, so the alt text repeats it. */
  alt: string;
  /** Matches the artwork's edges, for the space beside it on very wide screens. */
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
    src: "/assets/banners/samsung-galaxy-a57-a37-campaign.jpg",
    alt: "Samsung campaign: “Awesome Is For Everyone!” Galaxy A57 5G and A37 5G, “A Bigger View For Everything”, with two navy phones shown front and back.",
    background: "#fafafa",
    brand: "Samsung",
    title: "Galaxy A57 5G & A37 5G",
    link: { label: "View on Sicco Store", href: "https://siccostore.pk/product/samsung-galaxy-a57-5g/" },
  },
  {
    id: "infinix",
    src: "/assets/banners/infinix-note-hot-smart-campaign.jpg",
    alt: "Infinix campaign: “Defining the Future”, Note, Hot and Smart series, with five phones in orange, black, grey, blue and silver.",
    background: "#e9e9e9",
    brand: "Infinix",
    title: "Note, Hot & Smart series",
    link: { label: "View on Sicco Store", href: "https://siccostore.pk/product-category/smartphones/?e-filter-a31e8d7-product_brand=infinix" },
  },
  {
    id: "redmagic",
    src: "/assets/banners/redmagic-11-pro-campaign.jpg",
    alt: "REDMAGIC and nubia campaign: REDMAGIC 11 Pro, “Ignite the Next-Gen”, “Exclusively available at www.siccostore.pk”, with a silver phone beside a model.",
    background: "#efefef",
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
  action: { label: "Explore Our Business", href: "/business" },
  /** Phones have no header button, so the hero carries the partnership route there. */
  partner: { label: "Partner With Us", href: "/contact#enquiry" },
} as const;
