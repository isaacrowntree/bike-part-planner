import type { ShockSpec } from "./shock.js";

/**
 * Aftermarket coil shocks that have been produced in 184 × 50 imperial
 * sizing (the OEM eye-to-eye × stroke for the 2013 Fuel EX 5). Not all
 * are still in production — a few are only available second-hand. Data
 * taken from manufacturer service sheets and shock fitment databases.
 *
 * Every entry defaults to standard imperial pin-mount hardware (39.89mm
 * eyelet width, 8mm bolt). The upper mount is the tricky one on Fuel
 * EX because the Full Floater rocker uses a 10mm bolt — a conversion
 * kit must re-reduce the upper eye to the Trek-specific 10mm hardware.
 */
export type AuAvailability =
  | "new-au-retail"
  | "used-au"
  | "import-only"
  | "unobtainable";

export interface CatalogShock extends ShockSpec {
  /** Manufacturer SKU or part number where published. */
  sku?: string;
  /** Still in production in this eye-to-eye × stroke size? */
  inProduction: boolean;
  /** Physical dimensions that matter for frame clearance. */
  bodyLengthMm: number;
  bodyDiameterMm: number;
  hasPiggyback: boolean;
  /** Approximate street price in USD, for sanity. */
  approxUsd?: number;
  /** Australia-specific sourcing status (researched Apr 2026). */
  auAvailability: AuAvailability;
  /** Known AU or AU-shipping vendors. */
  auVendors: readonly string[];
  /** Expected landed price in AUD. */
  approxAud?: number;
  /** Verified live product URL, if one exists. */
  productUrl?: string;
}

/** Helper to build an imperial coil shock entry with sensible defaults. */
const coilImperialPin = (
  partial: Pick<
    CatalogShock,
    | "label"
    | "sku"
    | "bodyLengthMm"
    | "bodyDiameterMm"
    | "hasPiggyback"
    | "inProduction"
    | "approxUsd"
    | "notes"
    | "auAvailability"
    | "auVendors"
    | "approxAud"
  > & { coilSpringRateLbInRange: readonly [number, number] },
): CatalogShock => ({
  eyeToEyeMm: 184,
  strokeMm: 50,
  upperMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
  lowerMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
  springType: "coil",
  ...partial,
});

/**
 * Metric pin-mount coil shocks have a 22.2mm-wide eye and a native 8mm
 * bolt reducer. They do NOT drop into the Trek 39.89mm Full Floater
 * clevis on their own — you need a metric-to-Trek conversion kit (Huber,
 * Shockcraft, Offset Bushings). The kit provides 2× side spacers that
 * fill the clevis gap plus a -1mm eye-to-eye compensation so 185mm
 * metric acts as 184mm. Every entry here assumes that kit is fitted.
 */
const coilMetricPin = (
  partial: Pick<
    CatalogShock,
    | "label"
    | "sku"
    | "bodyLengthMm"
    | "bodyDiameterMm"
    | "hasPiggyback"
    | "inProduction"
    | "approxUsd"
    | "notes"
    | "auAvailability"
    | "auVendors"
    | "approxAud"
  > & {
    eyeToEyeMm: number;
    strokeMm: number;
    coilSpringRateLbInRange: readonly [number, number];
  },
): CatalogShock => ({
  upperMount: { eyeletWidthMm: 22.2, hardwareBoltMm: 8, style: "pin" },
  lowerMount: { eyeletWidthMm: 22.2, hardwareBoltMm: 8, style: "pin" },
  springType: "coil",
  ...partial,
});

/**
 * Catalog of coil shocks considered for a 2013 Fuel EX 5 build, verified
 * against live retailer pages in April 2026.
 *
 * **Hard reality:** 184mm × 50mm / 7.25" × 2.0" imperial pin-mount is NOT
 * a current production size from any mainstream brand.
 *   - Fox DHX2 Factory 2026 — metric-only, smallest 210×50
 *   - Marzocchi Bomber CR — smallest imperial is 7.5"×2.0" (190×50)
 *   - DVO Jade X — 8.5×2.5 and 7.875×2.25 only
 *   - Cane Creek DB Coil IL — sold out everywhere
 *   - RockShox Super Deluxe Coil — metric only
 *   - Öhlins TTX22M.2 — 7.87×2.0 is the closest imperial
 *
 * **The only currently-buildable new option is Push Industries ElevenSix**,
 * built to order per frame. Everything else is used-market.
 *
 * 185×50 metric pin-mount coil doesn't meaningfully exist in the current
 * production catalogue either, so the metric-to-Trek conversion kit
 * (which IS a real product from Huber/Shockcraft) currently has no
 * compatible modern shock to mount to. Path is noted in code but flagged
 * as "no new shock available" until a brand releases 185×50 metric pin.
 */
export const COIL_SHOCK_CATALOG: readonly CatalogShock[] = [
  {
    label: "Push Industries ElevenSix S-series (custom build, imperial 7.25×2.0)",
    sku: "PUSH-1156-S-184x50",
    eyeToEyeMm: 184,
    strokeMm: 50,
    upperMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    lowerMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    springType: "coil",
    bodyLengthMm: 136,
    bodyDiameterMm: 40,
    hasPiggyback: false,
    inProduction: true,
    approxUsd: 1300,
    approxAud: 2100,
    auAvailability: "import-only",
    auVendors: [
      "Push Industries direct (push-ind.com) — sales@pushindustries.com",
    ],
    productUrl: "https://www.pushindustries.com/products/elevensix",
    coilSpringRateLbInRange: [300, 700],
    notes:
      "ONLY currently-buildable new coil in imperial 7.25×2.0. Made to " +
      "order, hand-tuned per frame and rider. ~10–14 day lead time, ships " +
      "international. Email Push with frame year/model, rider weight, and " +
      "use case (ebike: flag this — Push tunes differently for high-torque " +
      "mid-drives). Still requires a Trek 10mm upper reducer kit.",
  },
  coilImperialPin({
    label: "Marzocchi Bomber CR (imperial 7.25×2.0)",
    sku: "MZ-BomberCR-184x50",
    bodyLengthMm: 135,
    bodyDiameterMm: 40,
    hasPiggyback: false,
    inProduction: false,
    approxUsd: 320,
    approxAud: 450,
    coilSpringRateLbInRange: [300, 600],
    auAvailability: "used-au",
    auVendors: [
      "Pinkbike BuySell (Oceania filter)",
      "eBay AU",
      "Rotorburn classifieds",
      "Facebook: MTB Australia Buy Swap Sell",
    ],
    notes:
      "One of the last OEM-style imperial coil shocks. No piggyback. " +
      "Inline body fits tight shock tunnels that reject reservoir shocks.",
  }),
  coilImperialPin({
    label: "Fox DHX2 Factory (imperial 7.25×2.0)",
    sku: "FOX-DHX2-184x50",
    bodyLengthMm: 150,
    bodyDiameterMm: 48,
    hasPiggyback: true,
    inProduction: false,
    approxUsd: 700,
    approxAud: 1050,
    coilSpringRateLbInRange: [300, 650],
    auAvailability: "used-au",
    auVendors: [
      "MTB Direct (metric only — imperial is used-only)",
      "Pushys (metric only — imperial is used-only)",
      "Pinkbike BuySell Oceania",
      "eBay AU",
    ],
    notes: "4-way adjustable. Piggyback reservoir may foul Fuel EX seat tube.",
  }),
  coilImperialPin({
    label: "DVO Jade X (imperial 7.25×2.0)",
    sku: "DVO-JadeX-184x50",
    bodyLengthMm: 148,
    bodyDiameterMm: 46,
    hasPiggyback: true,
    inProduction: false,
    approxUsd: 650,
    approxAud: 950,
    coilSpringRateLbInRange: [300, 600],
    auAvailability: "used-au",
    auVendors: ["Pinkbike BuySell Oceania", "eBay AU"],
    notes:
      "DVO's current Jade X catalog (verified April 2026) only offers " +
      "8.5×2.5 and 7.875×2.25 — NOT 7.25×2.0. Used-market only.",
  }),
  coilImperialPin({
    label: "MRP Hazzard Coil (imperial 7.25×2.0)",
    sku: "MRP-Hazzard-184x50",
    bodyLengthMm: 138,
    bodyDiameterMm: 42,
    hasPiggyback: false,
    inProduction: false,
    approxUsd: 450,
    approxAud: 600,
    coilSpringRateLbInRange: [300, 550],
    auAvailability: "used-au",
    auVendors: [
      "Pinkbike BuySell Oceania",
      "eBay AU",
      "Facebook: MTB Australia Buy Swap Sell",
    ],
    notes:
      "Inline piggyback-less design. Good option for tight Trek shock tunnels.",
  }),
  coilImperialPin({
    label: "Cane Creek DB Coil IL (imperial 7.25×2.0)",
    sku: "CC-DBCoilIL-184x50",
    bodyLengthMm: 140,
    bodyDiameterMm: 44,
    hasPiggyback: false,
    inProduction: false,
    approxUsd: 600,
    approxAud: 850,
    coilSpringRateLbInRange: [300, 600],
    auAvailability: "used-au",
    auVendors: ["Pinkbike BuySell Oceania", "eBay AU"],
    notes:
      "4-way adjustable inline coil, no piggyback. Historically one of " +
      "the best matches for tight Trek tunnels but discontinued.",
  }),
];

/**
 * Coil springs that can be used on a 50mm stroke shock. Two important
 * footnotes, both verified live in April 2026:
 *
 *  1. **Cane Creek VALT Progressive is made in 45mm / 55mm / 65mm stroke,
 *     NOT 50mm.** This is fine — a 45mm VALT Progressive physically fits
 *     inside a 50mm stroke shock body and runs without issue; the shock
 *     just extends 5mm past the spring's active range at topout, which
 *     doesn't affect ride (you are never at topout under load).
 *  2. **Sprindex adjustable is 55mm stroke only.** A 55mm Sprindex does
 *     NOT fit a 50mm shock (coil would overrun the spring retainer). Only
 *     usable if a 50mm variant appears in the catalog.
 *
 * For a 50mm stroke shock, the practical progressive options are VALT
 * Progressive 45mm (primary) and plain linear VALT steel 2.0"/50mm.
 */
export interface CatalogSpring {
  label: string;
  rateLbIn: number;
  strokeMm: number;
  progressive: boolean;
  /** True if this spring fits inside a 50mm stroke shock body. */
  fits50mmShock: boolean;
  auAvailability: AuAvailability;
  auVendors: readonly string[];
  approxAud?: number;
  notes?: string;
}

/**
 * Modern air shocks that are the **documented-working alternative path**
 * for this frame. Offset Bushings and Shockcraft explicitly publish Trek
 * DRCV conversion kits for running a standard imperial air shock in this
 * mount — this is the proven path, unlike coil which has zero documented
 * completions. Listed here for completeness so the planner can compare.
 *
 * Ebikes with Bafang mid-drives load the rear shock harder than trail use,
 * so choose an air shock with a large air can and reservoir (Float X2,
 * DHX2 Air, Marzocchi Bomber Air) to keep heat out of the damper.
 */
export interface CatalogAirShock extends ShockSpec {
  bodyLengthMm: number;
  bodyDiameterMm: number;
  hasPiggyback: boolean;
  inProduction: boolean;
  approxUsd?: number;
  approxAud?: number;
  auAvailability: AuAvailability;
  auVendors: readonly string[];
  notes?: string;
  productUrl?: string;
}

export const AIR_SHOCK_CATALOG: readonly CatalogAirShock[] = [
  {
    label: "Fox Float X2 Factory (imperial 7.25×2.0)",
    eyeToEyeMm: 184,
    strokeMm: 50,
    upperMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    lowerMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    springType: "air",
    bodyLengthMm: 140,
    bodyDiameterMm: 42,
    hasPiggyback: true,
    inProduction: false,
    approxUsd: 650,
    approxAud: 950,
    auAvailability: "used-au",
    auVendors: ["Pinkbike BuySell Oceania", "eBay AU", "MTB Direct (metric only new)"],
    notes:
      "4-way adjustable, large air volume — handles ebike heat well. " +
      "Imperial 7.25×2.0 is used-market only (Fox DHX2/X2 2026 are metric).",
    productUrl: "https://ridefox.com/products/float-x2-factory",
  },
  {
    label: "RockShox Super Deluxe Ultimate RCT (imperial 7.25×2.0)",
    eyeToEyeMm: 184,
    strokeMm: 50,
    upperMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    lowerMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    springType: "air",
    bodyLengthMm: 138,
    bodyDiameterMm: 40,
    hasPiggyback: true,
    inProduction: false,
    approxUsd: 450,
    approxAud: 700,
    auAvailability: "used-au",
    auVendors: ["Pinkbike BuySell Oceania", "eBay AU"],
    notes:
      "DebonAir + MegNeg air can — very active, handles ebike weight well. " +
      "Used-only in imperial; current production is metric.",
    productUrl: "https://www.sram.com/en/rockshox/models/rs-sdlx-ult-c2",
  },
  {
    label: "Marzocchi Bomber Air (imperial 7.25×2.0)",
    eyeToEyeMm: 184,
    strokeMm: 50,
    upperMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    lowerMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    springType: "air",
    bodyLengthMm: 136,
    bodyDiameterMm: 40,
    hasPiggyback: false,
    inProduction: false,
    approxUsd: 300,
    approxAud: 475,
    auAvailability: "used-au",
    auVendors: ["Pinkbike BuySell Oceania", "eBay AU"],
    notes:
      "Inline, no piggyback — fits tight Trek tunnels. Cheaper option for " +
      "an ebike build where damper adjustability is less critical.",
    productUrl: "https://www.marzocchi.com/products/bomber-air",
  },
  {
    label: "Fox Float CTD DRCV (imperial 7.25×1.75 — shorter stroke)",
    eyeToEyeMm: 184,
    strokeMm: 44,
    upperMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    lowerMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    springType: "air",
    bodyLengthMm: 132,
    bodyDiameterMm: 40,
    hasPiggyback: false,
    inProduction: false,
    approxUsd: 150,
    approxAud: 250,
    auAvailability: "used-au",
    auVendors: [
      "eBay AU (common — OEM fitment on 2010-2014 Fuel EX 7/8/9)",
      "Pinkbike BuySell Oceania",
      "FB: MTB Australia Buy Swap Sell",
    ],
    notes:
      "MOST AVAILABLE option. Stock on thousands of 2010-2014 Fuel EX 7/8/9 " +
      "and Remedy builds. Same 184mm eye-to-eye, shorter 44mm stroke = " +
      "~113mm rear travel instead of 130mm. Firmer feel, less sag. Cheaper " +
      "and far easier to find than 184×50. Excellent match for an ebike " +
      "build where the extra weight already compresses the shock more.",
  },
  {
    label: "RockShox Monarch RT3 (imperial 7.25×1.75 — shorter stroke)",
    eyeToEyeMm: 184,
    strokeMm: 44,
    upperMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    lowerMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
    springType: "air",
    bodyLengthMm: 130,
    bodyDiameterMm: 38,
    hasPiggyback: false,
    inProduction: false,
    approxUsd: 120,
    approxAud: 200,
    auAvailability: "used-au",
    auVendors: [
      "eBay AU",
      "Pinkbike BuySell Oceania",
      "FB: MTB Australia Buy Swap Sell",
    ],
    notes:
      "DebonAir version is preferable (more air volume = better small bump). " +
      "Very common used — these were OEM on 2012-2015 Trek trail bikes. " +
      "Compact inline body fits the tight Fuel EX shock tunnel easily.",
  },
];

export const SPRING_CATALOG: readonly CatalogSpring[] = [
  {
    label: 'Cane Creek VALT Light Progressive 500–610 lb/in × 1.75" (45mm stroke)',
    rateLbIn: 555,
    strokeMm: 45,
    progressive: true,
    fits50mmShock: true,
    auAvailability: "new-au-retail",
    auVendors: ["MTB Direct", "Dirt Works Australia (distributor)", "Empire Cycles AU"],
    approxAud: 155,
    notes:
      "PRIMARY recommendation for 96kg ebike rider. 45mm spring fits fine " +
      "inside a 50mm shock body — loses 5mm of nothing at topout.",
  },
  {
    label: 'Cane Creek VALT Light Progressive 550–670 lb/in × 1.75" (45mm stroke)',
    rateLbIn: 610,
    strokeMm: 45,
    progressive: true,
    fits50mmShock: true,
    auAvailability: "new-au-retail",
    auVendors: ["MTB Direct", "Dirt Works Australia (distributor)", "Empire Cycles AU"],
    approxAud: 155,
    notes:
      "Heavier option if 555 feels too soft under mid-drive torque loads.",
  },
  {
    label: 'Cane Creek VALT Steel Linear 600 lb/in × 2.0" (50mm stroke)',
    rateLbIn: 600,
    strokeMm: 50,
    progressive: false,
    fits50mmShock: true,
    auAvailability: "new-au-retail",
    auVendors: ["MTB Direct", "Empire Cycles AU", "The Lost Co. (US, ships AU)"],
    approxAud: 95,
    notes:
      "Cheaper linear backup if Progressive is unavailable. Will bottom " +
      "more harshly on Full Floater linkage since the frame itself is only " +
      "~13% progressive — not recommended unless you're running a shock " +
      "with strong hydraulic bottom-out (DHX2, Jade X).",
  },
  {
    label: "Sprindex Adjustable 490–560 / 550–610 / 610–690 lb/in × 55mm",
    rateLbIn: 600,
    strokeMm: 55,
    progressive: false,
    fits50mmShock: false,
    auAvailability: "import-only",
    auVendors: ["Sprindex direct (sprindex.com, USD $160, ships AU)"],
    approxAud: 260,
    notes:
      "Adjustable-rate spring — tune on the fly. BUT only made in 55mm " +
      "stroke, which is too long for a 50mm stroke shock. Listed here as " +
      "a 'watch for 50mm variant' placeholder.",
  },
];
