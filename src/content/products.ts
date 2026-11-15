import type { StaticImageData } from "next/image";
import aura2 from "@/assets/products/hmd-aura-2.jpg";
import b105 from "@/assets/products/zentality-b105.jpg";
import b106 from "@/assets/products/zentality-b106.jpg";
import b220 from "@/assets/products/zentality-b220.jpg";
import b3310 from "@/assets/products/zentality-b3310.jpg";

export type AssembledDevice = { name: string; img: StaticImageData };

/** Devices listed under "Our Products" on the Siccotel Telecom website. */
export const assembledDevices: AssembledDevice[] = [
  { img: aura2, name: "HMD Aura 2" },
  { img: b105, name: "Zentality B105" },
  { img: b106, name: "Zentality B106" },
  { img: b220, name: "Zentality B220" },
  { img: b3310, name: "Zentality B3310" },
];
