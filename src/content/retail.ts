import type { StaticImageData } from "next/image";
import { asset } from "@/content/asset-manifest";
import { externalLinks } from "./company";

const ufone = asset("logos/ufone.png");
const alfamall = asset("logos/alfamall.png");
const standardChartered = asset("logos/standard-chartered.png");
const daraz = asset("logos/daraz.png");
const jazzcash = asset("logos/jazzcash.png");
const priceoye = asset("logos/priceoye.png");
const faysalBank = asset("logos/faysal-bank.png");
const meezanBank = asset("logos/meezan-bank.png");
const foodpanda = asset("logos/foodpanda.png");
const bykea = asset("logos/bykea.png");
const easypaisa = asset("logos/easypaisa.png");
const kistpay = asset("logos/kistpay.png");
const ebm = asset("logos/ebm.png");
const candyland = asset("logos/candyland.png");
const cocaCola = asset("logos/coca-cola.png");
const jsBank = asset("logos/js-bank.png");
const dalda = asset("logos/dalda.png");
const youngs = asset("logos/youngs.png");
const pharmevo = asset("logos/pharmevo.png");
const martinDow = asset("logos/martin-dow.png");
const hbl = asset("logos/hbl.png");
const gsk = asset("logos/gsk.png");
const khaadi = asset("logos/khaadi.png");
const dpWorld = asset("logos/dp-world.png");
const imtiaz = asset("logos/imtiaz.png");
const alif = asset("logos/alif.png");
const airlift = asset("logos/airlift.png");
const ismailIndustries = asset("logos/ismail-industries.png");
const ibexGlobal = asset("logos/ibex-global.png");
const nationalFoods = asset("logos/national-foods.png");
const shan = asset("logos/shan.png");
const engro = asset("logos/engro.png");

/**
 * Sources:
 * - siccotel.com home and About: network figures, after-sales centres, HIQO.
 * - Journey Timeline graphic: "Retail Expansion 2001–2006", "Own Brand HIQO 2011".
 * - siccotel.com/our-ecommerce-clients/: the twelve logos under "Our Ecommerce Client".
 *   The page gives no further relationship detail, so none is claimed here.
 * - siccostore.pk: tagline and service promises.
 */
export const retail = {
  /** For phones, where the card below each route already carries the detail. */
  introShort: "Buy from Sicco Store, find after-sales support through SiccoCare, or join the dealer network.",
  intro:
    "Siccotel began as a retail business in Karachi and still reaches customers directly. Its products are sold through a nationwide network of wholesalers and retailers, through Sicco Store — its own online store — and through e-commerce clients across Pakistan.",
  physical: {
    title: "A Nationwide Retail Network",
    summary:
      "Retail is where Siccotel started: the company expanded its retail business from 2001 to 2006 before moving into nationwide distribution.",
    points: [
      "Official warranty and genuine stock from authorized distribution",
      "Connected to 6+ regional hubs, 800+ wholesalers, and over 4,500 retail partners across Pakistan.",
    ],
  },
  online: {
    title: "Sicco Store",
    tagline: "Pakistan’s authorized and trusted mobile store, powered by Siccotel.",
    url: externalLinks.siccoStore,
    points: [
      "Nationwide shipping across Pakistan",
      "100% original products covered by brand warranty",
      "1-year official brand warranty on PTA-approved products",
    ],
  },
};

export type EcommerceClient = {
  name: string;
  /** What the company is. The relationship itself is “e-commerce client”, as published. */
  sector: string;
  url: string;
  logo: StaticImageData;
  serveAsIs?: boolean;
};

export type ClientGroup = { title: string; clients: EcommerceClient[] };

export const ecommerceClientGroups: ClientGroup[] = [
  {
    title: "Marketplaces & delivery platforms",
    clients: [
      { name: "Daraz", sector: "Online marketplace", url: "https://www.daraz.pk/", logo: daraz },
      { name: "PriceOye", sector: "Online electronics store", url: "https://priceoye.pk/", logo: priceoye },
      { name: "foodpanda", sector: "Delivery platform", url: "https://www.foodpanda.pk/", logo: foodpanda },
      { name: "Bykea", sector: "Delivery & mobility app", url: "https://www.bykea.com/", logo: bykea },
    ],
  },
  {
    title: "Banks",
    clients: [
      { name: "Alfamall", sector: "Online mall by Bank Alfalah", url: "https://alfamall.com/", logo: alfamall },
      { name: "Standard Chartered", sector: "Bank", url: "https://www.sc.com/pk/", logo: standardChartered, serveAsIs: true },
      { name: "Faysal Bank", sector: "Bank", url: "https://www.faysalbank.com/", logo: faysalBank },
      { name: "Meezan Bank", sector: "Islamic bank", url: "https://www.meezanbank.com/", logo: meezanBank },
    ],
  },
  {
    title: "Wallets, telecom & instalments",
    clients: [
      { name: "JazzCash", sector: "Mobile wallet", url: "https://www.jazzcash.com.pk/", logo: jazzcash },
      { name: "easypaisa", sector: "Mobile wallet", url: "https://easypaisa.com.pk/", logo: easypaisa },
      { name: "Ufone", sector: "Mobile network", url: "https://www.ufone.com/", logo: ufone },
      { name: "Kistpay", sector: "Smartphone instalment platform", url: "https://kistpay.pk/", logo: kistpay },
    ],
  },
];

export const ecommerceClients = ecommerceClientGroups.flatMap((group) => group.clients);

/** A logo tile. Tiles without an approved `url` are shown without a link. */
export type ClientLogo = {
  name: string;
  logo: StaticImageData;
  url?: string;
  sector?: string;
  /**
   * Serve the file without image optimisation. Used for small client-supplied
   * files (under ~80px tall), which the optimiser would otherwise size for a
   * wider candidate than the file holds, rendering them below the tile's logo height.
   */
  serveAsIs?: boolean;
};

/**
 * Corporate clients added at the client's request (November 2026), in the
 * order of their brief. Logos come from each company's own website, its archived
 * official website or its annual report; see docs/CONTENT_AUDIT.md for sources.
 */
export const corporateClients: ClientLogo[] = [
  { name: "Alif", logo: alif },
  { name: "Airlift", logo: airlift },
  { name: "EBM (English Biscuit Manufacturers)", logo: ebm },
  { name: "CandyLand", logo: candyland },
  { name: "Coca-Cola", logo: cocaCola },
  { name: "Ismail Industries Limited", logo: ismailIndustries },
  { name: "IBEX Global", logo: ibexGlobal },
  { name: "National Foods", logo: nationalFoods, serveAsIs: true },
  { name: "JS Bank", logo: jsBank },
  { name: "Dalda", logo: dalda },
  { name: "Shan", logo: shan },
  { name: "Young’s", logo: youngs },
  { name: "PharmEvo", logo: pharmevo },
  { name: "Martin Dow", logo: martinDow },
  { name: "HBL", logo: hbl },
  { name: "GSK", logo: gsk, serveAsIs: true },
  { name: "Khaadi", logo: khaadi },
  { name: "Engro", logo: engro },
  { name: "DP World", logo: dpWorld },
  { name: "Imtiaz", logo: imtiaz },
];

/** The homepage "Corporate & E-commerce Clients" grid: the original twelve first, then corporate clients. */
export const homepageClients: ClientLogo[] = [...ecommerceClients, ...corporateClients];
