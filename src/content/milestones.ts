import type { StaticImageData } from "next/image";
import { asset } from "@/content/asset-manifest";

const siccotel = asset("logos/siccotel-logo.png");
const alcatel = asset("logos/alcatel.png");
const energizer = asset("logos/energizer.png");
const hiqo = asset("logos/hiqo.png");
const hmd = asset("logos/hmd.png");
const infinix = asset("logos/infinix.png");
const itel = asset("logos/itel.png");
const nokia = asset("logos/nokia.png");
const oraimo = asset("logos/oraimo.png");
const realme = asset("logos/realme.png");
const samsung = asset("logos/samsung.png");
const tcl = asset("logos/tcl.png");
const tecno = asset("logos/tecno.png");
const zteNubia = asset("logos/zte-nubia.png");

/**
 * Milestones from the "Siccotel Journey Timeline" graphic on siccotel.com
 * (wp-content/uploads/2025/10/Untitled-1-01.png) plus the founding year from
 * the About page and the ZTE nubia announcement on News & Media.
 */
export type Milestone = {
  period: string;
  title: string;
  description: string;
  /** Shown in the condensed home-page timeline. */
  highlight?: boolean;
  /**
   * Logos above the milestone's dot on the homepage timeline. HIQO, Alcatel, TCL,
   * Energizer and oraimo are cut, unaltered, from Siccotel's own journey graphic
   * (public/assets/website/distribution-journey-graphic.png); the rest are the partner logos.
   *
   * A milestone with several brands lists them under its year as dots of their own, each with
   * its logo and title; the pinned timeline activates them one short scroll step at a time,
   * in this order.
   */
  brands: { name: string; logo?: StaticImageData; title?: string }[];
};

export const milestones: Milestone[] = [
  {
    period: "2001–2006",
    title: "Founded and Retail Expansion",
    description: "Siccotel is established in Karachi in 2001 and expands its retail business.",
    highlight: true,
    brands: [{ name: "Siccotel", logo: siccotel }],
  },
  {
    period: "2007–2010",
    title: "Nationwide Distribution",
    description: "The business grows from retail into distribution across Pakistan.",
    highlight: true,
    brands: [{ name: "Siccotel", logo: siccotel }],
  },
  {
    period: "2011",
    title: "Own Brand: HIQO",
    description: "Siccotel launches its own mobile phone brand, HIQO, in Pakistan.",
    highlight: true,
    brands: [{ name: "HIQO", logo: hiqo }],
  },
  {
    period: "2014",
    title: "Alcatel Distribution",
    description: "Distribution of Alcatel devices.",
    brands: [{ name: "Alcatel", logo: alcatel }],
  },
  {
    period: "2016",
    title: "Infinix Distribution",
    description: "Start of Infinix distribution, which continues today.",
    highlight: true,
    brands: [{ name: "Infinix", logo: infinix }],
  },
  {
    period: "2018",
    title: "TCL Distribution",
    description: "Distribution of TCL devices.",
    brands: [{ name: "TCL", logo: tcl }],
  },
  {
    period: "2021",
    title: "itel, Infinix Accessories and Nokia",
    description: "Distribution of itel devices, Infinix accessories and Nokia devices begins.",
    highlight: true,
    brands: [
      { name: "itel", logo: itel, title: "itel Distribution" },
      { name: "Infinix", logo: infinix, title: "Infinix Accessories" },
      { name: "Nokia", logo: nokia, title: "Nokia Distribution" },
    ],
  },
  {
    period: "2022",
    title: "Tecno, Samsung and realme",
    description: "Three more global brands join the distribution portfolio.",
    highlight: true,
    brands: [
      { name: "Tecno", logo: tecno, title: "Tecno Distribution" },
      { name: "Samsung", logo: samsung, title: "Samsung Distribution" },
      { name: "realme", logo: realme, title: "realme Distribution" },
    ],
  },
  {
    period: "2024",
    title: "Accessories and TVs",
    description: "Distribution of Infinix TVs, Energizer, and oraimo, itel and Tecno accessories.",
    brands: [
      { name: "Infinix", logo: infinix, title: "Infinix TVs" },
      { name: "Energizer", logo: energizer, title: "Energizer Distribution" },
      { name: "oraimo", logo: oraimo, title: "oraimo, itel and Tecno Accessories" },
    ],
  },
  {
    period: "2025",
    title: "HMD and ZTE nubia",
    description: "HMD distribution begins, and Siccotel becomes ZTE nubia’s exclusive distributor and strategic partner.",
    highlight: true,
    brands: [
      { name: "HMD", logo: hmd, title: "HMD Distribution" },
      { name: "ZTE nubia", logo: zteNubia, title: "ZTE nubia Partnership" },
    ],
  },
];
