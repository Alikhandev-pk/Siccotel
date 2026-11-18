import type { StaticImageData } from "next/image";
import { asset } from "@/content/asset-manifest";

const infinix = asset("logos/infinix.png");
const itel = asset("logos/itel.png");
const tecno = asset("logos/tecno.png");
const samsung = asset("logos/samsung.png");
const nokia = asset("logos/nokia.png");
const realme = asset("logos/realme.png");
const hmd = asset("logos/hmd.png");
const zteNubia = asset("logos/zte-nubia.png");
const hmdLight = asset("logos/hmd-light.png");
const nokiaLight = asset("logos/nokia-light.png");
const zentalityLight = asset("logos/zentality-light.png");
const deployLight = asset("logos/deploy-light.png");

export type Partner = {
  name: string;
  logo?: StaticImageData;
  /** Relationship exactly as supported by the source material. */
  relationship: string;
  /** Distribution periods, from the Siccotel journey graphic unless noted. */
  details: string[];
  /** Visual weight tweak so logos read at a consistent optical size. */
  logoScale?: number;
};

/**
 * Device brands. Relationship wording is deliberately specific: only ZTE nubia
 * is described as "exclusive", and only Apple as "Authorized Reseller",
 * because that is what the sources say.
 */
export const brandPartners: Partner[] = [
  {
    name: "Infinix",
    logo: infinix,
    relationship: "Distribution",
    details: ["Smartphones since 2016", "Accessories since 2021", "TVs since 2024"],
  },
  {
    name: "ZTE nubia",
    logo: zteNubia,
    relationship: "Exclusive distributor & strategic partner",
    details: ["Partnership announced 2025"],
    logoScale: 1.1,
  },
  {
    name: "itel",
    logo: itel,
    relationship: "Distribution",
    details: ["Devices since 2021", "Accessories since 2024"],
    logoScale: 1.1,
  },
  {
    name: "Tecno",
    logo: tecno,
    relationship: "Distribution",
    details: ["Devices since 2022", "Accessories since 2024"],
  },
  {
    name: "Samsung",
    logo: samsung,
    relationship: "Distribution",
    details: ["Since 2022"],
  },
  {
    name: "realme",
    logo: realme,
    relationship: "Distribution",
    details: ["Since 2022"],
  },
  {
    name: "Nokia",
    logo: nokia,
    relationship: "Distribution",
    details: ["Since 2021"],
  },
  {
    name: "HMD",
    logo: hmd,
    relationship: "Distribution",
    details: ["Since 2025"],
    logoScale: 1.35,
  },
];

export const appleRelationship = {
  name: "Apple",
  relationship: "Authorized Reseller partner",
  note: "Siccotel’s About page describes its Apple relationship as an Authorized Reseller partnership — a different arrangement from the distribution relationships above.",
};

export const accessoryPartners = [
  { name: "oraimo", detail: "Accessories distribution since 2024" },
  { name: "Energizer", detail: "Distribution since 2024" },
];

export const earlierPartners = [
  { name: "Alcatel", detail: "Distribution, 2014" },
  { name: "TCL", detail: "Distribution, 2018" },
];

/** Listed as "Strategic Partners" on siccoteltelecom.com. */
export const manufacturingPartners: Partner[] = [
  { name: "HMD (Human Mobile Devices)", logo: hmdLight, relationship: "Strategic partner of Siccotel Telecom", details: [] },
  { name: "Nokia", logo: nokiaLight, relationship: "Strategic partner of Siccotel Telecom", details: [], logoScale: 0.9 },
  { name: "Zentality", logo: zentalityLight, relationship: "Strategic partner of Siccotel Telecom", details: [] },
  { name: "Deploy", logo: deployLight, relationship: "Strategic partner of Siccotel Telecom", details: [], logoScale: 1.1 },
];
