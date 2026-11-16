/**
 * Content shapes shared by the public site, the admin editors and the website
 * import. Images are plain objects so they serialise into the database and
 * through `use cache`.
 */

export type CmsImage = {
  /** A site-relative path: bundled (/_next/static/…, /assets/…) or uploaded (/media/…). */
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL?: string;
  /** Set when the image comes from the media library, so deletion can be blocked. */
  assetId?: string;
};

export type Figure = { image: CmsImage; caption: string };
export type Stat = { value: string; label: string };
export type Hero = { eyebrow: string; title: string; intro: string };
export type SectionCopy = { eyebrow: string; title: string; intro: string };

/* Collections ---------------------------------------------------------------------- */

export type Banner = {
  brand: string;
  title: string;
  desktop: CmsImage;
  /** Optional art for phones; the desktop image is used when it is missing. */
  mobile: CmsImage | null;
  /** Matches the artwork's edges, for the space beside it on very wide screens. */
  background: string;
  ctaLabel: string;
  ctaHref: string;
};

export type Product = {
  name: string;
  brand: string;
  category: string;
  description: string;
  images: CmsImage[];
  storeUrl: string;
  /** Assembled locally by Siccotel Telecom. Others appear in the /products catalogue. */
  assembled: boolean;
  /** Featured on the Assembly page and the homepage manufacturing band. */
  showOnAssembly: boolean;
};

export type Article = {
  title: string;
  /** Only set when the article itself names the event or period. */
  context: string;
  /** Excerpt shown on cards and under the title. */
  summary: string;
  /**
   * Plain text. Blank lines separate paragraphs; lines starting "- " form a list;
   * a paragraph starting "> " is a quotation.
   */
  body: string;
  cover: CmsImage | null;
  /** CSS object-position for crops of the cover, e.g. "50% 20%". Centred when empty. */
  coverPosition: string;
  /** Optional display date, YYYY-MM-DD. The original articles publish no dates. */
  date: string;
  /** Keywords for admin search and filtering. */
  tags: string[];
  gallery: CmsImage[];
};

export type CollectionMap = { banners: Banner; products: Product; news: Article };
export type CollectionName = keyof CollectionMap;

/** A published entry as public pages receive it. */
export type Published<T> = T & { id: string; slug: string };

/* Documents -------------------------------------------------------------------------- */

export type Logo = { name: string; logo: CmsImage; url: string; serveAsIs: boolean };
export type BrandPartner = { name: string; logo: CmsImage; relationship: string; details: string[]; logoScale: number };
export type MapCity = { id: string; name: string; x: number; y: number };

export type SettingsDoc = {
  email: string;
  topBarPhoneDisplay: string;
  topBarPhoneHref: string;
  headOffice: { label: string; lines: string[]; street: string; locality: string };
  factory: { label: string; lines: string[]; emails: { label: string; value: string }[] };
  social: { label: string; href: string; icon: "facebook" | "instagram" }[];
  links: { siccoStore: string; siccotelTelecom: string; ptaDirbs: string; carlcareWarranty: string; appleCoverage: string };
};

export type HomeDoc = {
  hero: { eyebrow: string; headline1: string; headline2: string; description: string; actionLabel: string; actionHref: string };
  partnerStripTitle: string;
  glance: {
    eyebrow: string;
    title: string;
    lead: string;
    body: string;
    assurances: string[];
    photos: Figure[];
    stats: Stat[];
  };
  business: { eyebrow: string; title: string; intro: string; cardImages: { image: CmsImage; position: string }[] };
  retail: SectionCopy & { introShort: string; clientsTitle: string };
  clients: Logo[];
  reach: SectionCopy & {
    map: CmsImage;
    /** The coordinate space the city percentages were measured in (the map's proportions). */
    layoutWidth: number;
    layoutHeight: number;
    /**
     * Fingerprint ("sha256:…") of the map file the city markers were measured on.
     * Set by the server when markers are saved; markers only show on that file.
     */
    markersArtwork: string;
    cities: MapCity[];
  };
  manufacturing: SectionCopy & { figure: string; figureLabel: string; photo: Figure; chain: string[]; productsTitle: string };
  journey: SectionCopy;
  newsTitle: SectionCopy;
  enquiry: { title: string; intro: string };
};

export type Milestone = { period: string; title: string; description: string; highlight: boolean };

export type AboutDoc = {
  hero: Hero;
  intro: string[];
  lookingAhead: string;
  photos: Figure[];
  stats: Stat[];
  mission: { eyebrow: string; title: string; text: string };
  values: SectionCopy & { items: string[] };
  presence: { eyebrow: string; title: string; text: string; map: CmsImage };
  journey: SectionCopy & { milestones: Milestone[] };
};

export type ServiceActivity = {
  id: "distribution" | "manufacturing" | "retail";
  kicker: string;
  title: string;
  summary: string;
  audience: string;
  points: string[];
  photo: Figure;
  cta: string;
};

export type ServicesDoc = {
  hero: Hero;
  activities: ServiceActivity[];
  afterSales: { eyebrow: string; title: string; short: string; text: string };
};

export type AssemblyDoc = {
  hero: Hero;
  overview: { eyebrow: string; title: string; paragraphs: string[]; facts: { label: string; value: string }[] };
  photos: Figure[];
  chain: SectionCopy & { steps: { title: string; text: string }[] };
  chairman: { photo: CmsImage; quote: string; body: string; attribution: string };
  products: SectionCopy;
  partners: { eyebrow: string; title: string; logos: { name: string; logo: CmsImage; logoScale: number }[]; plans: string };
  contact: SectionCopy;
};

export type PartnersDoc = {
  hero: Hero;
  brandsSection: { eyebrow: string; title: string; note: string };
  brands: BrandPartner[];
  apple: { name: string; relationship: string; note: string };
  accessories: { name: string; detail: string }[];
  accessoriesNote: string;
  earlier: { name: string; detail: string }[];
  manufacturingSection: SectionCopy;
  cta: SectionCopy;
};

export type NewsPageDoc = { hero: Hero; footnote: string };
export type ContactDoc = { hero: Hero; formTitle: string; detailsTitle: string; supportTitle: string };
/** The Products page is a heading over the published products. */
export type ProductsPageDoc = {
  title: string;
};

export type DocMap = {
  settings: SettingsDoc;
  home: HomeDoc;
  about: AboutDoc;
  services: ServicesDoc;
  assembly: AssemblyDoc;
  partners: PartnersDoc;
  newsPage: NewsPageDoc;
  contact: ContactDoc;
  productsPage: ProductsPageDoc;
};
export type DocKey = keyof DocMap;
export const DOC_KEYS: DocKey[] = ["home", "about", "services", "assembly", "productsPage", "partners", "newsPage", "contact", "settings"];
