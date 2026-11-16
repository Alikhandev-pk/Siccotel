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
};

export const milestones: Milestone[] = [
  {
    period: "2001–2006",
    title: "Founded and Retail Expansion",
    description: "Siccotel is established in Karachi in 2001 and expands its retail business.",
    highlight: true,
  },
  {
    period: "2007–2010",
    title: "Nationwide Distribution",
    description: "The business grows from retail into distribution across Pakistan.",
    highlight: true,
  },
  {
    period: "2011",
    title: "Own Brand: HIQO",
    description: "Siccotel launches its own mobile phone brand, HIQO, in Pakistan.",
    highlight: true,
  },
  {
    period: "2014",
    title: "Alcatel Distribution",
    description: "Distribution of Alcatel devices.",
  },
  {
    period: "2016",
    title: "Infinix Distribution",
    description: "Start of Infinix distribution, which continues today.",
    highlight: true,
  },
  {
    period: "2018",
    title: "TCL Distribution",
    description: "Distribution of TCL devices.",
  },
  {
    period: "2021",
    title: "itel, Nokia and Infinix Accessories",
    description: "Distribution of itel and Nokia devices and Infinix accessories begins.",
    highlight: true,
  },
  {
    period: "2022",
    title: "Tecno, Samsung and realme",
    description: "Three more global brands join the distribution portfolio.",
    highlight: true,
  },
  {
    period: "2024",
    title: "Accessories and TVs",
    description: "Distribution of Infinix TVs, Energizer, and oraimo, itel and Tecno accessories.",
  },
  {
    period: "2025",
    title: "HMD and ZTE nubia",
    description: "HMD distribution begins, and Siccotel becomes ZTE nubia’s exclusive distributor and strategic partner.",
    highlight: true,
  },
];
