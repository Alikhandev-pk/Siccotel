import type { StaticImageData } from "next/image";
import siccotel from "@/assets/brand/siccotel-logo.png";
import alcatel from "@/assets/partners/alcatel.png";
import energizer from "@/assets/partners/energizer.png";
import hiqo from "@/assets/partners/hiqo.png";
import hmd from "@/assets/partners/hmd.png";
import infinix from "@/assets/partners/infinix.png";
import itel from "@/assets/partners/itel.png";
import nokia from "@/assets/partners/nokia.png";
import oraimo from "@/assets/partners/oraimo.png";
import realme from "@/assets/partners/realme.png";
import samsung from "@/assets/partners/samsung.png";
import tcl from "@/assets/partners/tcl.png";
import tecno from "@/assets/partners/tecno.png";
import zteNubia from "@/assets/partners/zte-nubia.png";

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
   * (src/assets/company/distribution-journey-graphic.png); the rest are the partner logos.
   */
  brands: { name: string; logo?: StaticImageData }[];
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
    title: "itel, Nokia and Infinix Accessories",
    description: "Distribution of itel and Nokia devices and Infinix accessories begins.",
    highlight: true,
    brands: [
      { name: "itel", logo: itel },
      { name: "Nokia", logo: nokia },
      { name: "Infinix", logo: infinix },
    ],
  },
  {
    period: "2022",
    title: "Tecno, Samsung and realme",
    description: "Three more global brands join the distribution portfolio.",
    highlight: true,
    brands: [
      { name: "Tecno", logo: tecno },
      { name: "Samsung", logo: samsung },
      { name: "realme", logo: realme },
    ],
  },
  {
    period: "2024",
    title: "Accessories and TVs",
    description: "Distribution of Infinix TVs, Energizer, and oraimo, itel and Tecno accessories.",
    brands: [
      { name: "Infinix", logo: infinix },
      { name: "Energizer", logo: energizer },
      { name: "oraimo", logo: oraimo },
    ],
  },
  {
    period: "2025",
    title: "HMD and ZTE nubia",
    description: "HMD distribution begins, and Siccotel becomes ZTE nubia’s exclusive distributor and strategic partner.",
    highlight: true,
    brands: [
      { name: "HMD", logo: hmd },
      { name: "ZTE nubia", logo: zteNubia },
    ],
  },
];
