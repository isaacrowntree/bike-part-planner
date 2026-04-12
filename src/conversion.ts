import type { BikeSuspension, FrameShockSlot } from "./bike.js";
import type { AuAvailability, CatalogShock } from "./catalog.js";
import type { FitResult, ShockSpec } from "./shock.js";
import { checkShockFit } from "./shock.js";
import {
  estimateSpringRate,
  snapToAvailableSpring,
  type SpringRateInputs,
} from "./springRate.js";

/**
 * A "conversion kit" on a Fuel EX 5 means the reducer bushings + hardware
 * needed to adapt a standard-imperial coil shock (39.89mm eye / 8mm bolt
 * both ends) to the Trek Full Floater frame whose upper mount takes a
 * 10mm bolt.
 *
 * There is no Trek-sold coil conversion kit for this bike. The realistic
 * paths are:
 *   1. Swap in an imperial coil shock in 184×50 AND replace the upper
 *      reducer bushing with one sized for 10mm ID / 39.89mm OD.
 *   2. Use an aftermarket upper hardware set (Burgtec, RWC, Huber
 *      Bushings) that makes the 10mm-bolt reduction.
 *   3. For modern metric coil shocks there is no direct conversion —
 *      184×50 imperial is not the same as any metric standard.
 */
export type KitFamily = "imperial-to-trek" | "metric-to-trek";

export interface ConversionKit {
  label: string;
  family: KitFamily;
  /** What the kit does. */
  description: string;
  /**
   * Hardware the kit supplies — enough to normalize mounting. When applied,
   * these widths/IDs overwrite the candidate shock's eyelet widths and bolt
   * IDs. For metric-to-imperial kits this captures the side spacers that
   * widen a narrow metric 22.2mm eye into the Trek 39.89mm clevis.
   */
  providesUpperReducer: { idMm: number; odMm: number; widthMm: number };
  providesLowerReducer: { idMm: number; odMm: number; widthMm: number };
  /**
   * Eye-to-eye adjustment (mm) applied by the kit when mounted. A 185mm
   * metric shock in a 184mm frame can be compensated by a -1mm kit.
   * Positive = longer, negative = shorter.
   */
  eyeToEyeAdjustmentMm?: number;
  /** Part numbers / vendors where known. */
  vendors: readonly string[];
  /** Verified live product URL, if one exists. */
  productUrl?: string;
  approxUsd?: number;
  approxAud?: number;
  auAvailability: AuAvailability;
  /**
   * Vendor advertises this kit for COIL shocks specifically? Offset and
   * Shockcraft's published Trek DRCV kits are advertised for AIR shocks
   * — the vendor has not documented or warranted coil use. Setting this
   * false triggers an "experimental" warning in the recommendation.
   */
  documentedForCoil: boolean;
  /**
   * Is this a real, published vendor SKU we linked to, or a speculative
   * "they COULD machine this on request" entry? Forum research found zero
   * vendor advertising metric-to-Trek spacer kits, so those entries are
   * flagged `false` — email the shop directly for a one-off quote.
   */
  publishedSku: boolean;
}

export const CONVERSION_KITS: readonly ConversionKit[] = [
  {
    label:
      "Offset Bushings — Trek DRCV / RE:aktiv Conversion Kit (Fuel/Remedy/Slash 2016 and earlier)",
    family: "imperial-to-trek",
    description:
      "THE published product for this frame. Brass + aluminium spacer + " +
      "igus DU bush assembly that outputs 39.9×10mm upper and 39.9×8mm " +
      "lower. Offset's page advertises it as an AIR shock compatibility " +
      "kit that lets you drop a standard imperial air shock into a Trek " +
      "DRCV mount. **Vendor does NOT mention coil use** — coil requires " +
      "contacting them first. Kit is well-documented working for air.",
    providesUpperReducer: { idMm: 10, odMm: 15.875, widthMm: 39.89 },
    providesLowerReducer: { idMm: 8, odMm: 15.875, widthMm: 39.89 },
    vendors: ["Offset Bushings (offsetbushings.com/products/trek-conversion-kit)"],
    productUrl: "https://www.offsetbushings.com/products/trek-conversion-kit",
    approxUsd: 50,
    approxAud: 85,
    auAvailability: "import-only",
    documentedForCoil: false,
    publishedSku: true,
  },
  {
    label: 'Shockcraft NZ — "Deaktiv" Trek DRCV conversion',
    family: "imperial-to-trek",
    description:
      "NZ-made Trek DRCV replacement kit, similar concept to Offset: " +
      "supplies the 39.9×10 upper and 39.9×8 lower hardware needed to " +
      "run a standard imperial shock. **Published for air, not coil.** " +
      "Closest region to Australia — ships cheaply. Email info@shockcraft.co.nz " +
      "to confirm coil compatibility and request a one-off quote.",
    providesUpperReducer: { idMm: 10, odMm: 15.875, widthMm: 39.89 },
    providesLowerReducer: { idMm: 8, odMm: 15.875, widthMm: 39.89 },
    vendors: ["Shockcraft (shockcraft.co.nz/rear-shocks/shock-conversions/deaktiv)"],
    productUrl:
      "https://www.shockcraft.co.nz/shockcraft-trek-fuel-remedy-slash-deaktiv-m10x1-0-pin-kit.html",
    approxUsd: 70,
    approxAud: 115,
    auAvailability: "import-only",
    documentedForCoil: false,
    publishedSku: true,
  },
  {
    label: "Huber Bushings (US) — custom imperial 39.89mm → Trek 10mm",
    family: "imperial-to-trek",
    description:
      "Not a published Trek-specific SKU — Huber machines to custom specs " +
      "on request. Email chris@huberbushings.com with frame model, target " +
      "shock, and coil-use intent. Ships from US; LVI GST only under $1000.",
    providesUpperReducer: { idMm: 10, odMm: 15.875, widthMm: 39.89 },
    providesLowerReducer: { idMm: 8, odMm: 15.875, widthMm: 39.89 },
    vendors: ["Huber Bushings (huberbushings.com)"],
    approxUsd: 60,
    approxAud: 95,
    auAvailability: "import-only",
    documentedForCoil: false,
    publishedSku: false,
  },
  {
    label: "SPECULATIVE — Shockcraft NZ metric 22.2mm → Trek 39.89mm spacer kit",
    family: "metric-to-trek",
    description:
      "NOT A PUBLISHED PRODUCT. Forum research found zero vendors " +
      "advertising metric-to-Trek spacer kits and zero completed builds " +
      "documenting this path on a 2013-16 Fuel EX. Included so the " +
      "model can reason about it, but treat as experimental: email " +
      "Shockcraft asking them to machine 2× ~8.85mm side spacers + 10mm " +
      "upper reducer + 8mm lower reducer with -1mm eye-to-eye comp. " +
      "Blocker: no current-production metric 185×50 PIN-mount coil exists " +
      "that would actually bolt into the resulting kit.",
    providesUpperReducer: { idMm: 10, odMm: 22.2, widthMm: 39.89 },
    providesLowerReducer: { idMm: 8, odMm: 22.2, widthMm: 39.89 },
    eyeToEyeAdjustmentMm: -1,
    vendors: ["Shockcraft (shockcraft.co.nz) — email info@shockcraft.co.nz"],
    approxUsd: 95,
    approxAud: 150,
    auAvailability: "import-only",
    documentedForCoil: false,
    publishedSku: false,
  },
];

/**
 * Apply a conversion kit to a candidate shock, returning a *new* shock spec
 * with the upper/lower reducer hardware overridden by what the kit supplies.
 * This lets fit-checking work against a catalog shock as-it-would-be-fitted.
 */
export const applyConversionKit = (
  shock: ShockSpec,
  kit: ConversionKit,
): ShockSpec => ({
  ...shock,
  eyeToEyeMm: shock.eyeToEyeMm + (kit.eyeToEyeAdjustmentMm ?? 0),
  upperMount: {
    ...shock.upperMount,
    eyeletWidthMm: kit.providesUpperReducer.widthMm,
    hardwareBoltMm: kit.providesUpperReducer.idMm,
  },
  lowerMount: {
    ...shock.lowerMount,
    eyeletWidthMm: kit.providesLowerReducer.widthMm,
    hardwareBoltMm: kit.providesLowerReducer.idMm,
  },
});

export interface ConversionRecommendation {
  shock: CatalogShock;
  kit: ConversionKit | null;
  fit: FitResult;
  targetSpringRateLbIn: number;
  nearestAvailableSpringLbIn: number;
  springInRange: boolean;
  auAvailable: boolean;
  notes: string[];
}

export interface RecommendationInputs {
  bike: BikeSuspension;
  slot: FrameShockSlot;
  rider: SpringRateInputs;
  shocks: readonly CatalogShock[];
  kits: readonly ConversionKit[];
}

export const recommendCoilConversion = (
  inputs: RecommendationInputs,
): ConversionRecommendation[] => {
  const { bike, slot, rider, shocks, kits } = inputs;
  const rate = estimateSpringRate(bike, rider);
  const target = rate.practicalLbIn;
  const nearestSpring = snapToAvailableSpring(target);

  return shocks.map((shock) => {
    const notes: string[] = [];

    const rawFit = checkShockFit(
      slot,
      shock,
      shock.bodyLengthMm,
      shock.bodyDiameterMm,
      shock.hasPiggyback,
    );

    let finalFit = rawFit;
    let chosenKit: ConversionKit | null = null;

    if (!rawFit.fits) {
      for (const kit of kits) {
        const adapted = applyConversionKit(shock, kit);
        const adaptedFit = checkShockFit(
          slot,
          adapted,
          shock.bodyLengthMm,
          shock.bodyDiameterMm,
          shock.hasPiggyback,
        );
        if (adaptedFit.fits) {
          finalFit = adaptedFit;
          chosenKit = kit;
          notes.push(`conversion kit required: ${kit.label}`);
          break;
        }
      }
    } else {
      notes.push("drop-in hardware match (no kit required)");
    }

    if (!shock.inProduction) {
      notes.push("discontinued — may need to source used");
    }
    if (shock.hasPiggyback && !slot.clearance.piggybackOk) {
      notes.push(
        "piggyback reservoir likely to foul the Fuel EX seat tube — measure before buying",
      );
    }
    if (bike.progression < 1.2) {
      notes.push(
        "Full Floater linkage is only ~13% progressive — Trek tuned it " +
          "around DRCV air shocks. A linear coil will bottom harshly; use a " +
          "progressive coil spring (Cane Creek VALT progressive, MRP progressive)",
      );
    }

    const [min, max] = shock.coilSpringRateLbInRange ?? [0, 0];
    const springInRange = nearestSpring >= min && nearestSpring <= max;
    if (!springInRange) {
      notes.push(
        `target ${nearestSpring} lb/in spring outside shock's rated ${min}-${max} lb/in window`,
      );
    }

    if (bike.documentedCoilBuildsOnFrame === 0) {
      notes.push(
        "⚠  EXPERIMENTAL: zero completed coil builds are documented on the " +
          "2013-2016 Fuel EX DRCV Full Floater frame. Every 'Fuel EX coil' " +
          "build online is either pre-2010 (standard 12.7mm bushings) or " +
          "Gen 5 2020+ (metric trunnion) — NOT this frame. You would be " +
          "the first publicly-documented builder. Budget for custom tuning.",
      );
    }
    if (chosenKit && !chosenKit.documentedForCoil) {
      notes.push(
        `kit "${chosenKit.label}" is advertised for AIR shocks — vendor has ` +
          "not documented coil use. Email the shop before ordering.",
      );
    }
    if (chosenKit && !chosenKit.publishedSku) {
      notes.push(
        "no published SKU for this kit — it's a speculative/custom-machined path",
      );
    }

    const auAvailable = shock.auAvailability !== "unobtainable";
    if (shock.auAvailability === "used-au") {
      notes.push(
        `AU sourcing: used market only (${shock.auVendors.slice(0, 2).join(", ")})`,
      );
    } else if (shock.auAvailability === "import-only") {
      notes.push(
        `AU sourcing: import only (${shock.auVendors.slice(0, 2).join(", ")})`,
      );
    } else if (shock.auAvailability === "new-au-retail") {
      notes.push(
        `AU sourcing: new at ${shock.auVendors.slice(0, 2).join(", ")}`,
      );
    }

    return {
      shock,
      kit: chosenKit,
      fit: finalFit,
      targetSpringRateLbIn: target,
      nearestAvailableSpringLbIn: nearestSpring,
      springInRange,
      auAvailable,
      notes,
    };
  });
};
