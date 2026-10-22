/**
 * Cities marked on Siccotel’s published regional network map
 * (src/assets/company/pakistan-regional-network-map.png, from siccotel.com).
 * `x`/`y` are the marker positions on that 1080 × 843 image, in percent.
 *
 * The map marks these cities but does not say what operates in each one, so
 * only Karachi — where the head office and assembly plant addresses are
 * published — carries facility details. Do not add cities or facilities that
 * are not in the source material.
 */
export type NetworkCity = {
  id: string;
  name: string;
  x: number;
  y: number;
};

export const networkCities: NetworkCity[] = [
  { id: "peshawar", name: "Peshawar", x: 49.4, y: 29.3 },
  { id: "rawalpindi", name: "Rawalpindi", x: 55.3, y: 33.5 },
  { id: "sialkot", name: "Sialkot", x: 61.3, y: 38.9 },
  { id: "gujranwala", name: "Gujranwala", x: 59.6, y: 40.3 },
  { id: "lahore", name: "Lahore", x: 61.2, y: 44.6 },
  { id: "faisalabad", name: "Faisalabad", x: 55.6, y: 46.1 },
  { id: "multan", name: "Multan", x: 49.2, y: 53.3 },
  { id: "quetta", name: "Quetta", x: 29.5, y: 52.9 },
  { id: "sukkur", name: "Sukkur", x: 39.4, y: 68.6 },
  { id: "karachi", name: "Karachi", x: 31.3, y: 82.7 },
];

export const hqCityId = "karachi";
