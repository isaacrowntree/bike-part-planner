/**
 * Shared bike standards — the single source of truth for the cross-cutting
 * interface types every fitment module reads from. Before this file, wheel
 * sizes, axle types, BB shells, frame materials, hub interfaces, actuation
 * ratios and chainline maths were re-declared per module — and had drifted
 * (the press-fit 92 mm shell was "bb92" in one file and "pf92" in another).
 * Encode a standard once, here, and import it everywhere so a fix lands in one
 * place and can't disagree with itself.
 */

/* ---------------- wheels & front end ---------------- */

export type WheelSize = "26" | "27.5" | "29" | "700c";
/** Bead-seat / ISO diameter (mm) per wheel family. 700c shares 29"'s 622. */
export const BSD: Record<WheelSize, number> = { "26": 559, "27.5": 584, "29": 622, "700c": 622 };

export type SteererType = "straight" | "tapered"; // straight 1-1/8"; tapered 1.5"→1-1/8"
export type AxleType = "qr9" | "thru15" | "boost15x110" | "qr15";
export type BrakeMount = "post" | "flat" | "is";

/* ---------------- bottom bracket ---------------- */

export type BBStandard =
  | "bsa" | "bsa-eccentric" | "italian" | "t47" // threaded
  | "pf30" | "bb30" | "bb86" | "bb92"; // press-fit (bb92 === PF92, 41 mm bore)
export type Spindle = "24" | "30" | "dub" | "gxp";

export const THREADED_BB: readonly BBStandard[] = ["bsa", "bsa-eccentric", "italian", "t47"];
export const isThreadedBB = (s: BBStandard): boolean => THREADED_BB.includes(s);

/** Spindle a shell was designed around (no reducer BB needed). */
export const NATIVE_SPINDLE: Record<BBStandard, Spindle> = {
  bsa: "24", "bsa-eccentric": "24", italian: "24", t47: "30",
  pf30: "30", bb30: "30", bb86: "24", bb92: "24",
};

/* ---------------- frame & hub interfaces ---------------- */

export type FrameMaterial = "alloy" | "steel" | "titanium" | "carbon";
export type HubInterface = "6-bolt" | "centerlock";

/* ---------------- drivetrain actuation ---------------- */

export type Actuation =
  | "shimano-mtb-11" | "shimano-mtb-12" | "shimano-road-11"
  | "sram-exact" | "sram-x-actuation" | "sram-eagle" | "sram-t-type";

/* ---------------- chainline ---------------- */

/** Target chainline (mm) for a rear hub spacing: Boost (≥148) 52, else 49. */
export const chainlineTarget = (rearSpacingMm: number): 49 | 52 => (rearSpacingMm >= 148 ? 52 : 49);
/** A direct-mount ring's chainline from its offset: 6→49, 3→52, 0→55. */
export const chainlineFromOffset = (offsetMm: number): number => 55 - offsetMm;
