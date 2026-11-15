/**
 * Cities marked on Siccotel’s regional map with coloured region outlines
 * (src/assets/company/pakistan-regional-map-outlined.png, supplied by the client
 * on 14 November 2026). `x`/`y` are the centres of the city dots, in percent,
 * measured on the supplied 478 × 412 file. The stored file is an exact 8×
 * super-resolution (EDSR) of it at 3824 × 3296, so the percentages still match.
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
  { id: "peshawar", name: "Peshawar", x: 59.29, y: 25.83 },
  { id: "rawalpindi", name: "Rawalpindi", x: 67.28, y: 30.02 },
  { id: "sialkot", name: "Sialkot", x: 73.6, y: 36.53 },
  { id: "gujranwala", name: "Gujranwala", x: 71.86, y: 38.88 },
  { id: "lahore", name: "Lahore", x: 73.81, y: 42.84 },
  { id: "faisalabad", name: "Faisalabad", x: 66.61, y: 44.37 },
  { id: "multan", name: "Multan", x: 58.74, y: 52.79 },
  { id: "quetta", name: "Quetta", x: 34.67, y: 52.16 },
  { id: "sukkur", name: "Sukkur", x: 47.59, y: 69.51 },
  { id: "karachi", name: "Karachi", x: 36.76, y: 85.29 },
];

export const hqCityId = "karachi";
