/**
 * Field definitions for the admin editors. One generic form renders every page,
 * banner, product and article from these, so the editors stay structured
 * (labelled fields, fixed sections) rather than free-form JSON.
 */
import type { CollectionName, DocKey } from "./types";

export type Field =
  | { type: "text" | "textarea" | "url" | "color"; key: string; label: string; help?: string }
  | { type: "number"; key: string; label: string; help?: string; step?: number }
  | { type: "boolean"; key: string; label: string; help?: string }
  | { type: "image"; key: string; label: string; help?: string; optional?: boolean }
  | { type: "images"; key: string; label: string; help?: string }
  | { type: "date"; key: string; label: string; help?: string }
  | { type: "tags"; key: string; label: string; help?: string }
  | { type: "focal"; key: string; label: string; help?: string; imageKey: string }
  | { type: "strings"; key: string; label: string; help?: string; item?: string; fixed?: boolean }
  | { type: "list"; key: string; label: string; help?: string; item: string; fields: Field[]; fixed?: boolean; titleKey?: string }
  | { type: "group"; key: string; label: string; help?: string; fields: Field[] };

const t = (key: string, label: string, help?: string): Field => ({ type: "text", key, label, help });
const ta = (key: string, label: string, help?: string): Field => ({ type: "textarea", key, label, help });
const url = (key: string, label: string, help?: string): Field => ({ type: "url", key, label, help });
const image = (key: string, label: string, help?: string): Field => ({ type: "image", key, label, help });
const group = (key: string, label: string, fields: Field[], help?: string): Field => ({ type: "group", key, label, fields, help });
const hero = group("hero", "Page header", [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("intro", "Introduction")]);
const section = (key: string, label: string, extra: Field[] = []) => group(key, label, [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("intro", "Introduction"), ...extra]);
const figure = (key: string, label: string, item: string): Field => ({
  type: "list",
  key,
  label,
  item,
  fixed: true,
  fields: [image("image", "Photo (with alt text)"), t("caption", "Visible caption")],
});
const stats = (key: string, label: string): Field => ({ type: "list", key, label, item: "Stat", fixed: true, fields: [t("value", "Figure", "Figures ending in + count up on screen."), t("label", "Label")] });

export const docSchemas: Record<DocKey, { title: string; description: string; path: string; fields: Field[] }> = {
  home: {
    title: "Homepage",
    description: "Headings, copy, photos, statistics, logo grids and the Nationwide Reach map. Banners are managed under Banners.",
    path: "/",
    fields: [
      group("hero", "Hero text (under the banners)", [t("eyebrow", "Eyebrow"), t("headline1", "Headline, line 1"), t("headline2", "Headline, line 2"), ta("description", "Description"), t("actionLabel", "Button label"), url("actionHref", "Button link")]),
      t("partnerStripTitle", "Brand logo strip heading", "The logos themselves come from Partners → Device brands."),
      group("glance", "Company at a Glance", [
        t("eyebrow", "Eyebrow"),
        t("title", "Heading"),
        ta("lead", "Lead paragraph"),
        ta("body", "Second paragraph"),
        { type: "strings", key: "assurances", label: "Trust labels", item: "Label", fixed: true },
        figure("photos", "Photos", "Photo"),
        stats("stats", "Statistics (homepage only; the About page has its own)"),
      ]),
      group("business", "Our business cards", [
        t("eyebrow", "Eyebrow"),
        t("title", "Heading"),
        ta("intro", "Introduction"),
        { type: "list", key: "cardImages", label: "Card photos (Distribution, Manufacturing, Retail)", item: "Card photo", fixed: true, fields: [image("image", "Photo"), t("position", "Crop focus", "CSS object-position, e.g. 50% 30%.")] },
      ], "Card titles and text come from the Services page."),
      section("retail", "Retail & e-commerce", [ta("introShort", "Short introduction (phones)"), t("clientsTitle", "Client logos heading")]),
      {
        type: "list",
        key: "clients",
        label: "Corporate & E-commerce client logos",
        item: "Client",
        titleKey: "name",
        fields: [t("name", "Company name (alt text)"), image("logo", "Logo"), url("url", "Link (optional)", "Leave empty for a static tile."), { type: "boolean", key: "serveAsIs", label: "Small file: serve without optimisation" }],
      },
      section("reach", "Nationwide Reach", [
        image(
          "map",
          "Map image",
          "Region outlines and city markers belong to the exact map file they were measured on. A different file shows without them: re-measure the city positions below and save, and the markers return on the new map. Clickable regions for a new map are traced by a developer (scripts/trace-map-regions.mjs).",
        ),
        { type: "number", key: "layoutWidth", label: "Layout width", help: "The proportions the city positions are measured against. Change only for a new layout." },
        { type: "number", key: "layoutHeight", label: "Layout height" },
        {
          type: "list",
          key: "cities",
          label: "City markers",
          item: "City",
          titleKey: "name",
          help: "x and y are percentages across and down the map image, at the centre of the city’s dot. Saving changed markers ties them to the map image selected above. Each city is listed under the region whose outline its dot is drawn in.",
          fields: [t("id", "ID"), t("name", "Name"), { type: "number", key: "x", label: "x (%)", step: 0.01 }, { type: "number", key: "y", label: "y (%)", step: 0.01 }],
        },
      ]),
      section("manufacturing", "Manufacturing band", [
        t("figure", "Figure"),
        t("figureLabel", "Figure label"),
        group("photo", "Photo", [image("image", "Photo"), t("caption", "Caption")]),
        { type: "strings", key: "chain", label: "Service delivery chain", item: "Step" },
        t("productsTitle", "Featured products heading", "Products come from Products (marked for Assembly)."),
      ]),
      section("journey", "Company journey heading", []),
      section("newsTitle", "News heading", []),
      group("enquiry", "Enquiry section", [t("title", "Heading"), ta("intro", "Introduction")]),
    ],
  },
  about: {
    title: "About Us",
    description: "Page copy, photos, About statistics, mission, values, presence map and milestones.",
    path: "/about",
    fields: [
      hero,
      { type: "strings", key: "intro", label: "Introduction paragraphs", item: "Paragraph" },
      ta("lookingAhead", "Looking ahead (stated plan)"),
      figure("photos", "Photos", "Photo"),
      stats("stats", "About page statistics"),
      group("mission", "Mission", [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("text", "Mission statement")]),
      section("values", "Core values", [{ type: "strings", key: "items", label: "Values", item: "Value" }]),
      group("presence", "Our presence", [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("text", "Text"), image("map", "Map image")]),
      section("journey", "Journey", [
        {
          type: "list",
          key: "milestones",
          label: "Milestones",
          item: "Milestone",
          titleKey: "period",
          fields: [t("period", "Period"), t("title", "Title"), ta("description", "Description"), { type: "boolean", key: "highlight", label: "Show on the homepage timeline" }],
        },
      ]),
    ],
  },
  services: {
    title: "Services",
    description: "The three businesses (also used on the homepage cards) and SiccoCare after-sales support.",
    path: "/services",
    fields: [
      hero,
      {
        type: "list",
        key: "activities",
        label: "Businesses (anchors #distribution, #manufacturing, #retail stay fixed)",
        item: "Business",
        fixed: true,
        titleKey: "title",
        fields: [t("kicker", "Kicker"), t("title", "Title"), ta("summary", "Summary"), t("audience", "Who it’s for"), { type: "strings", key: "points", label: "Points", item: "Point" }, group("photo", "Photo", [image("image", "Photo"), t("caption", "Caption")]), t("cta", "Enquiry button label")],
      },
      group("afterSales", "SiccoCare after-sales (#after-sales)", [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("short", "Short text (homepage phones)"), ta("text", "Text")]),
    ],
  },
  assembly: {
    title: "Assembly",
    description: "Facility copy and photos. Products shown here are chosen in Products.",
    path: "/assembly",
    fields: [
      hero,
      group("overview", "Facility overview", [t("eyebrow", "Eyebrow"), t("title", "Heading"), { type: "strings", key: "paragraphs", label: "Paragraphs", item: "Paragraph" }, { type: "list", key: "facts", label: "Facts", item: "Fact", fields: [t("label", "Label"), t("value", "Value")] }]),
      figure("photos", "Facility photos", "Photo"),
      section("chain", "End-to-end chain", [{ type: "list", key: "steps", label: "Steps", item: "Step", titleKey: "title", fields: [t("title", "Title"), ta("text", "Text")] }]),
      group("chairman", "Chairman’s message", [image("photo", "Photo"), ta("quote", "Quotation"), ta("body", "Second paragraph"), t("attribution", "Attribution")]),
      section("products", "Products section heading (#products)"),
      group("partners", "Strategic partners", [t("eyebrow", "Eyebrow"), t("title", "Heading"), { type: "list", key: "logos", label: "Partner logos", item: "Partner", titleKey: "name", fields: [t("name", "Name"), image("logo", "Logo (light, for a dark background)"), { type: "number", key: "logoScale", label: "Logo scale", step: 0.05 }] }, ta("plans", "Stated plans")]),
      section("contact", "Contact section"),
    ],
  },
  productsPage: {
    title: "Products page",
    description: "The page heading. The product cards under it are managed in Products.",
    path: "/products",
    fields: [t("title", "Heading")],
  },
  partners: {
    title: "Partners",
    description: "Device brands (also the homepage logo strip and the Products page), Apple, accessories and manufacturing partners.",
    path: "/partners",
    fields: [
      hero,
      group("brandsSection", "Device brands section", [t("eyebrow", "Eyebrow"), t("title", "Heading"), ta("note", "Footnote")]),
      {
        type: "list",
        key: "brands",
        label: "Device brands",
        item: "Brand",
        titleKey: "name",
        fields: [t("name", "Name (alt text)"), image("logo", "Logo"), t("relationship", "Relationship"), { type: "strings", key: "details", label: "Details", item: "Detail" }, { type: "number", key: "logoScale", label: "Logo scale", step: 0.05 }],
      },
      group("apple", "Apple", [t("name", "Name"), t("relationship", "Relationship"), ta("note", "Note")]),
      { type: "list", key: "accessories", label: "Accessory partners", item: "Partner", titleKey: "name", fields: [t("name", "Name"), t("detail", "Detail")] },
      t("accessoriesNote", "Accessories note"),
      { type: "list", key: "earlier", label: "Earlier milestones", item: "Partner", titleKey: "name", fields: [t("name", "Name"), t("detail", "Detail")] },
      section("manufacturingSection", "Manufacturing partners section", []),
      section("cta", "Call to action"),
    ],
  },
  newsPage: {
    title: "News & Media page",
    description: "Page copy only. Articles are managed under News.",
    path: "/news",
    fields: [hero, ta("footnote", "Footnote")],
  },
  contact: {
    title: "Contact Us",
    description: "Page copy. Addresses and emails are in Settings; the enquiry form itself is unchanged.",
    path: "/contact",
    fields: [hero, t("formTitle", "Form heading"), t("detailsTitle", "Contact details heading"), t("supportTitle", "Customer support heading")],
  },
  settings: {
    title: "Settings",
    description: "Public contact details and links used across the header, footer and pages.",
    path: "/contact",
    fields: [
      t("email", "Sales email"),
      t("topBarPhoneDisplay", "Header top bar phone (as shown)", "Shown only in the desktop header top bar."),
      url("topBarPhoneHref", "Header top bar phone link", "e.g. tel:+923268400903"),
      group("headOffice", "Head office", [t("label", "Label"), { type: "strings", key: "lines", label: "Address lines", item: "Line" }, t("street", "Street (structured data)"), t("locality", "City (structured data)")]),
      group("factory", "Assembly plant", [t("label", "Label"), { type: "strings", key: "lines", label: "Address lines", item: "Line" }, { type: "list", key: "emails", label: "Emails", item: "Email", fields: [t("label", "Label"), t("value", "Address")] }]),
      { type: "list", key: "social", label: "Social links", item: "Link", titleKey: "label", fields: [t("label", "Label"), url("href", "URL"), t("icon", "Icon (facebook or instagram)")] },
      group("links", "Links", [url("siccoStore", "Sicco Store"), url("siccotelTelecom", "Siccotel Telecom website"), url("ptaDirbs", "PTA DIRBS check"), url("carlcareWarranty", "Carlcare warranty check"), url("appleCoverage", "Apple coverage check")]),
    ],
  },
};

export const collectionSchemas: Record<CollectionName, { title: string; singular: string; titleKey: string; description: string; fields: Field[]; empty: Record<string, unknown> }> = {
  banners: {
    title: "Banners",
    singular: "Banner",
    titleKey: "title",
    description: "Homepage hero slides. Published slides rotate in the order shown.",
    fields: [
      t("brand", "Brand"),
      t("title", "Title"),
      image("desktop", "Desktop image (alt text should repeat the artwork's text)"),
      { type: "image", key: "mobile", label: "Mobile image (optional)", optional: true, help: "Shown on phones. Without one, phones show the desktop image." },
      { type: "color", key: "background", label: "Side colour", help: "Fills the space beside the artwork on very wide screens." },
      t("ctaLabel", "Button label (optional)"),
      url("ctaHref", "Button link (optional)"),
    ],
    empty: { brand: "", title: "New banner", desktop: null, mobile: null, background: "#ffffff", ctaLabel: "", ctaHref: "" },
  },
  products: {
    title: "Products",
    singular: "Product",
    titleKey: "name",
    description: "Every published product appears on /products: assembled devices under “Assembled in Karachi”, others in the catalogue. “Feature on Assembly” adds one to /assembly and the homepage.",
    fields: [
      t("name", "Name"),
      t("brand", "Brand"),
      t("category", "Category"),
      ta("description", "Description"),
      { type: "images", key: "images", label: "Images", help: "The first image is the main one." },
      url("storeUrl", "Sicco Store link (optional)"),
      { type: "boolean", key: "assembled", label: "Assembled locally by Siccotel Telecom", help: "On: listed under “Assembled in Karachi”. Off: listed in the catalogue section of /products." },
      { type: "boolean", key: "showOnAssembly", label: "Feature on the Assembly page and homepage", help: "Controls only those featured placements. Every published product appears on /products." },
    ],
    empty: { name: "New product", brand: "", category: "", description: "", images: [], storeUrl: "", assembled: false, showOnAssembly: false },
  },
  news: {
    title: "News",
    singular: "Article",
    titleKey: "title",
    description: "Articles on /news. The first published article leads the page.",
    fields: [
      t("title", "Title"),
      ta("summary", "Excerpt", "Shown on cards and under the title."),
      { type: "date", key: "date", label: "Display date (optional)", help: "Shown on the article and its cards. Leave empty to show no date." },
      t("context", "Event or period label (optional)", "e.g. Q4 2025. Shown above the title."),
      { type: "image", key: "cover", label: "Cover image (with alt text)", optional: true },
      { type: "focal", key: "coverPosition", label: "Cover crop position", imageKey: "cover", help: "Click the photo or use the sliders to choose what stays in view when the cover is cropped on cards." },
      { type: "textarea", key: "body", label: "Article body", help: "Blank lines separate paragraphs. Start lines with “- ” for a list, or a paragraph with “> ” for a quotation." },
      { type: "tags", key: "tags", label: "Keywords / tags", help: "Used for admin search and filtering. Press Enter or comma to add." },
      { type: "images", key: "gallery", label: "Gallery" },
    ],
    empty: { title: "New article", context: "", summary: "", body: "", date: "", cover: null, coverPosition: "50% 50%", tags: [], gallery: [] },
  },
};
