import type { FrameShockSlot, ShockSpec } from "./shock.js";

/**
 * OEM stock shock for the 2013 Trek Fuel EX 5.
 *
 * Primary source: Trek's "Rear Shock Fitment Chart 1997-2022" PDF, row
 * "Fuel EX / 2013-2014 / 5 & Higher":
 *     Wheel 26"   Eye-to-eye × Stroke 7.25" × 2.0" = 184 × 50
 *     Upper 39.89mm × 10mm "Trunnion"
 *     Lower 39.89mm × 8mm Pin
 *
 * Trek's chart labels the upper as "Trunnion", but 39.89mm (1.570") is the
 * standard imperial pin-mount eyelet width — not a trunnion body width. The
 * 2013 Fuel EX 5's upper is actually a proprietary Trek Full Floater pin
 * mount: a 39.89mm-wide eye running a 10mm bolt via reducer bushings. The
 * lower is standard imperial 39.89mm × 8mm pin.
 *
 * Stock shock model: **RockShox Monarch RL** (confirmed by Trek 2013
 * archive specs and retailer listings — not a Fox Float; Fox DRCV shocks
 * shipped only on the Fuel EX 7/8/9/9.8 trims).
 *
 * Stroke discrepancy: the Trek fitment chart lists 50mm, but aftermarket
 * retailers commonly stock 184×44 and 184×48 Monarchs for this era. The
 * 184×50 value in the Trek chart is kept as primary here — it is Trek's
 * own service document — but physically measure the stock shock eye-to-eye
 * (unweighted) and stroke (from fully extended to fully compressed) before
 * ordering a replacement. See README for the rabbit hole.
 */
export const FUEL_EX_5_2013_STOCK_SHOCK: ShockSpec = {
  label: "RockShox Monarch RL (Trek OEM) — Fuel EX 5 2013",
  eyeToEyeMm: 184,
  /** Measured on Isaac's dead Monarch: bore label reads "184x51".
   *  51mm = 2.008" ≈ 2.0" imperial. Nominal is 50.8mm; Trek rounds to 50,
   *  RockShox labels 51. Both are the same 2.0" imperial stroke. */
  strokeMm: 50.8,
  upperMount: {
    eyeletWidthMm: 39.89,
    hardwareBoltMm: 10,
    style: "pin",
  },
  lowerMount: {
    eyeletWidthMm: 39.89,
    hardwareBoltMm: 8,
    style: "pin",
  },
  springType: "air",
  notes:
    "Upper mount is a proprietary Trek Full Floater pin mount (39.89mm " +
    "imperial eyelet, 10mm through-bolt) — NOT a trunnion despite Trek's " +
    "own fitment chart label. Lower is standard imperial 39.89mm × 8mm.",
};

/**
 * Rear-triangle clearance envelope for the 2013 Fuel EX 5. Numbers are the
 * practical limits measured/documented by the community for dropping a coil
 * shock into this frame: the seat tube sits very close to the shock body at
 * sag, which is the reason coil conversions are fiddly on this platform.
 *
 * These are conservative starting values — verify on the actual frame before
 * ordering a shock. They exist so the test suite can reject obviously-bad
 * candidates (huge piggyback reservoirs, oversized coil bodies, etc.).
 */
export const FUEL_EX_5_2013_CLEARANCE = {
  maxBodyLengthMm: 140,
  maxBodyDiameterMm: 42,
  piggybackOk: false,
} as const;

export interface BikeSuspension {
  model: string;
  year: number;
  wheelSize: '"' | "27.5" | "29";
  rearWheelTravelMm: number;
  /**
   * Average leverage ratio (rear wheel travel / shock stroke). For the 2013
   * Fuel EX 5 this is 120/50 = 2.40. The Full Floater linkage is mildly
   * progressive; the ratio at sag is close to 2.35 and drops toward ~2.1 at
   * bottom-out. This value is used by the spring rate calculator below.
   */
  averageLeverageRatio: number;
  /** Progression (ratio_start / ratio_end), rough estimate. >1 = progressive. */
  progression: number;
  stockShock: ShockSpec;
  /**
   * Count of publicly documented coil conversion builds on this exact
   * frame generation. If zero, `recommendCoilConversion()` will return
   * every candidate flagged with an "experimental — uncharted territory"
   * warning. Do not increment this lightly: the forum research pass found
   * *zero* completed builds on the 2013-2016 Fuel EX DRCV Full Floater
   * frame despite many "thinking about it" threads.
   */
  documentedCoilBuildsOnFrame: number;
}

/**
 * 2013 was a ground-up Fuel EX redesign — Trek bumped rear travel from
 * 120mm to **130mm** and moved the "5 & Higher" trims onto the wider
 * Full Floater upper mount they had introduced on the DRCV-era 7/8/9.
 * Leverage with 50mm stroke = 2.60; with 48mm stroke = 2.71; with 44mm
 * stroke = 2.95. Progression is gentle (~12–15%), tuned specifically for
 * a DRCV-style air shock — a purely linear coil spring will feel harsh
 * at bottom-out on this frame without a progressive spring.
 */
export const FUEL_EX_5_2013: BikeSuspension = {
  model: "Trek Fuel EX 5",
  year: 2013,
  wheelSize: '"',
  rearWheelTravelMm: 130,
  averageLeverageRatio: 130 / 50,
  progression: 1.13,
  stockShock: FUEL_EX_5_2013_STOCK_SHOCK,
  documentedCoilBuildsOnFrame: 0,
};

export const FUEL_EX_5_2013_SLOT: FrameShockSlot = {
  required: FUEL_EX_5_2013_STOCK_SHOCK,
  clearance: FUEL_EX_5_2013_CLEARANCE,
};
