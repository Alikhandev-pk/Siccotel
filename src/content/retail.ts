import type { StaticImageData } from "next/image";
import banner from "@/assets/retail/official-partner-banner.jpg";
import v80Max from "@/assets/retail/sicco-store-zte-nubia-v80-max.jpg";
import nokia105 from "@/assets/retail/sicco-store-nokia-105.jpg";
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
import { externalLinks } from "./company";

/**
 * Sources:
 * - siccotel.com home and About: network figures, after-sales centres, HIQO.
 * - Journey Timeline graphic: "Retail Expansion 2001–2006", "Own Brand HIQO 2011".
 * - siccotel.com/our-ecommerce-clients/: the twelve logos under "Our Ecommerce Client".
 *   The page gives no further relationship detail, so none is claimed here.
 * - siccostore.pk: tagline, service promises, product categories and product photos.
 * - Banner "Official Partner — Premium Products, Genuine Stock!" from the siccotel.com home page.
 */
export const retail = {
  eyebrow: "Retail & E-commerce",
  heading: "Retail & E-commerce",
  intro:
    "Siccotel began as a retail business in Karachi and still reaches customers directly. Its products are sold through a nationwide network of wholesalers and retailers, through Sicco Store — its own online store — and through e-commerce clients across Pakistan.",
  physical: {
    label: "Physical retail",
    title: "A nationwide retail network",
    summary:
      "Retail is where Siccotel started: the company expanded its retail business from 2001 to 2006 before moving into nationwide distribution.",
    facts: [
      { value: "4,500+", label: "Retailers" },
      { value: "800+", label: "Wholesalers" },
      { value: "6+", label: "Regional hubs & offices" },
    ],
    points: [
      "After-sales support service centres in all major cities of Pakistan",
      "Official warranty and genuine stock from authorized distribution",
      "Own mobile phone brand, HIQO, launched in 2011",
    ],
  },
  online: {
    label: "Online commerce",
    title: "Sicco Store",
    tagline: "Pakistan’s authorized and trusted mobile store, powered by Siccotel.",
    url: externalLinks.siccoStore,
    points: [
      "Nationwide shipping across Pakistan",
      "100% original products covered by brand warranty",
      "1-year official brand warranty on PTA-approved products",
    ],
    categories: ["Smartphones", "Feature phones", "Tablets", "Audio", "Smart wearables", "Accessories"],
  },
  images: {
    banner: {
      src: banner,
      alt: "Siccotel banner reading “Official Partner — Premium Products, Genuine Stock!” beside Nokia, Tecno, itel and Samsung phones and a laptop",
      caption: "Official partner banner, siccotel.com",
    },
    products: [
      { src: v80Max, name: "ZTE nubia V80 Max", alt: "ZTE nubia V80 Max smartphone, front and back" },
      { src: nokia105, name: "Nokia 105", alt: "Nokia 105 feature phone, front and back" },
    ] satisfies { src: StaticImageData; name: string; alt: string }[],
    productsCaption: "Listed on Sicco Store",
  },
  sourceNote:
    "Siccotel lists all twelve companies as e-commerce clients. Groupings describe each company’s sector, not the terms of its relationship with Siccotel.",
};

export type EcommerceClient = {
  name: string;
  /** What the company is. The relationship itself is “e-commerce client”, as published. */
  sector: string;
  url: string;
  logo: StaticImageData;
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
      { name: "Standard Chartered", sector: "Bank", url: "https://www.sc.com/pk/", logo: standardChartered },
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
