import type { StaticImageData } from "next/image";
import { asset } from "@/content/asset-manifest";

const aura2 = asset("products/hmd-aura-2.jpg");
const b105 = asset("products/zentality-b105.jpg");
const b106 = asset("products/zentality-b106.jpg");
const b220 = asset("products/zentality-b220.jpg");
const b3310 = asset("products/zentality-b3310.jpg");

export type AssembledDevice = { name: string; img: StaticImageData };

/** Devices listed under "Our Products" on the Siccotel Telecom website. */
export const assembledDevices: AssembledDevice[] = [
  { img: aura2, name: "HMD Aura 2" },
  { img: b105, name: "Zentality B105" },
  { img: b106, name: "Zentality B106" },
  { img: b220, name: "Zentality B220" },
  { img: b3310, name: "Zentality B3310" },
];
