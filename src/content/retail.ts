import type { StaticImageData } from "next/image";
import ufone from "@/assets/retail/clients/ufone.png";
import alfamall from "@/assets/retail/clients/alfamall.png";
import standardChartered from "@/assets/retail/clients/standard-chartered.png";
import daraz from "@/assets/retail/clients/daraz.png";
import jazzcash from "@/assets/retail/clients/jazzcash.png";
import priceoye from "@/assets/retail/clients/priceoye.png";
import faysalBank from "@/assets/retail/clients/faysal-bank.png";
import meezanBank from "@/assets/retail/clients/meezan-bank.png";
import foodpanda from "@/assets/retail/clients/foodpanda.png";
import bykea from "@/assets/retail/clients/bykea.png";
import easypaisa from "@/assets/retail/clients/easypaisa.png";
import kistpay from "@/assets/retail/clients/kistpay.png";
import ebm from "@/assets/retail/clients/ebm.png";
import candyland from "@/assets/retail/clients/candyland.png";
import cocaCola from "@/assets/retail/clients/coca-cola.png";
import jsBank from "@/assets/retail/clients/js-bank.png";
import dalda from "@/assets/retail/clients/dalda.png";
import youngs from "@/assets/retail/clients/youngs.png";
import pharmevo from "@/assets/retail/clients/pharmevo.png";
import martinDow from "@/assets/retail/clients/martin-dow.png";
import hbl from "@/assets/retail/clients/hbl.png";
import gsk from "@/assets/retail/clients/gsk.png";
import khaadi from "@/assets/retail/clients/khaadi.png";
import dpWorld from "@/assets/retail/clients/dp-world.png";
import imtiaz from "@/assets/retail/clients/imtiaz.png";
import alif from "@/assets/retail/clients/alif.png";
import airlift from "@/assets/retail/clients/airlift.png";
import ismailIndustries from "@/assets/retail/clients/ismail-industries.png";
import ibexGlobal from "@/assets/retail/clients/ibex-global.png";
import nationalFoods from "@/assets/retail/clients/national-foods.png";
import shan from "@/assets/retail/clients/shan.png";
import engro from "@/assets/retail/clients/engro.png";
import { externalLinks } from "./company";

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
    title: "A nationwide retail network",
    summary:
      "Retail is where Siccotel started: the company expanded its retail business from 2001 to 2006 before moving into nationwide distribution.",
    points: [
      "Official warranty and genuine stock from authorized distribution",
      "Own mobile phone brand, HIQO, launched in 2011",
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
