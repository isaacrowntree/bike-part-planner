import { approxEqual, withinRange } from "./units.js";

export type MountStyle = "pin" | "trunnion";

export interface EyeletSpec {
  /** Outer width of the shock eye (bushing housing) in mm. */
  eyeletWidthMm: number;
  /** ID of the mounting hardware (bolt passing through the eye) in mm. */
  hardwareBoltMm: number;
  /** Pin vs trunnion mount style. */
  style: MountStyle;
}

export interface ShockSpec {
  /** Manufacturer + model label. */
  label: string;
  /** Eye-to-eye length in mm (center of upper eye to center of lower eye). */
  eyeToEyeMm: number;
  /** Rated stroke in mm. */
  strokeMm: number;
  upperMount: EyeletSpec;
  lowerMount: EyeletSpec;
  /** "air" or "coil". */
  springType: "air" | "coil";
  /** Coil shocks only: usable spring rate window for typical sag, in lb/in. */
  coilSpringRateLbInRange?: readonly [number, number];
  /** Notes for humans. */
  notes?: string;
}

/**
 * Acceptable mounting tolerances. Rear shocks are machined/anodized to very
 * tight tolerances at the factory, but bushings + reducers add compliance.
 * These numbers follow Trek service manuals and aftermarket bushing guides.
 */
export const TOLERANCES = {
  eyeToEyeMm: 0.5,
  strokeMm: 0.5,
  eyeletWidthMm: 0.25,
  hardwareBoltMm: 0.1,
} as const;

export interface FrameShockSlot {
  /** What the frame requires (OEM spec). */
  required: ShockSpec;
  /**
   * Physical rear-triangle clearance envelope between the upper and lower
   * shock mounts at full extension (including any piggyback / reservoir
   * clearance in mm at the widest point of the shock body).
   * Used to reject coil shocks whose body or reservoir fouls the frame.
   */
  clearance: {
    /**
     * Maximum length of a shock body (body + can, NOT eye-to-eye) that will
     * clear the seat tube at sag. Measured on a real frame.
     */
    maxBodyLengthMm: number;
    /** Max diameter around the shock body including reservoir offset. */
    maxBodyDiameterMm: number;
    /** Whether a piggyback reservoir will fit without fouling the frame. */
    piggybackOk: boolean;
  };
}

export interface FitReason {
  category:
    | "eye-to-eye"
    | "stroke"
    | "upper-eyelet-width"
    | "upper-hardware"
    | "upper-style"
    | "lower-eyelet-width"
    | "lower-hardware"
    | "lower-style"
    | "body-length"
    | "body-diameter"
    | "reservoir";
  ok: boolean;
  detail: string;
}

export interface FitResult {
  fits: boolean;
  dropIn: boolean;
  reasons: readonly FitReason[];
}

export const checkShockFit = (
  slot: FrameShockSlot,
  candidate: ShockSpec,
  candidateBodyLengthMm?: number,
  candidateBodyDiameterMm?: number,
  candidateHasPiggyback: boolean = false,
): FitResult => {
  const reasons: FitReason[] = [];
  const req = slot.required;

  reasons.push({
    category: "eye-to-eye",
    ok: approxEqual(candidate.eyeToEyeMm, req.eyeToEyeMm, TOLERANCES.eyeToEyeMm),
    detail: `${candidate.eyeToEyeMm}mm vs required ${req.eyeToEyeMm}mm (±${TOLERANCES.eyeToEyeMm})`,
  });

  reasons.push({
    category: "stroke",
    ok: approxEqual(candidate.strokeMm, req.strokeMm, TOLERANCES.strokeMm),
    detail: `${candidate.strokeMm}mm vs required ${req.strokeMm}mm (±${TOLERANCES.strokeMm})`,
  });

  reasons.push({
    category: "upper-style",
    ok: candidate.upperMount.style === req.upperMount.style,
    detail: `${candidate.upperMount.style} vs required ${req.upperMount.style}`,
  });
  reasons.push({
    category: "upper-eyelet-width",
    ok: approxEqual(
      candidate.upperMount.eyeletWidthMm,
      req.upperMount.eyeletWidthMm,
      TOLERANCES.eyeletWidthMm,
    ),
    detail: `${candidate.upperMount.eyeletWidthMm}mm vs required ${req.upperMount.eyeletWidthMm}mm`,
  });
  reasons.push({
    category: "upper-hardware",
    ok: approxEqual(
      candidate.upperMount.hardwareBoltMm,
      req.upperMount.hardwareBoltMm,
      TOLERANCES.hardwareBoltMm,
    ),
    detail: `${candidate.upperMount.hardwareBoltMm}mm bolt vs required ${req.upperMount.hardwareBoltMm}mm`,
  });

  reasons.push({
    category: "lower-style",
    ok: candidate.lowerMount.style === req.lowerMount.style,
    detail: `${candidate.lowerMount.style} vs required ${req.lowerMount.style}`,
  });
  reasons.push({
    category: "lower-eyelet-width",
    ok: approxEqual(
      candidate.lowerMount.eyeletWidthMm,
      req.lowerMount.eyeletWidthMm,
      TOLERANCES.eyeletWidthMm,
    ),
    detail: `${candidate.lowerMount.eyeletWidthMm}mm vs required ${req.lowerMount.eyeletWidthMm}mm`,
  });
  reasons.push({
    category: "lower-hardware",
    ok: approxEqual(
      candidate.lowerMount.hardwareBoltMm,
      req.lowerMount.hardwareBoltMm,
      TOLERANCES.hardwareBoltMm,
    ),
    detail: `${candidate.lowerMount.hardwareBoltMm}mm bolt vs required ${req.lowerMount.hardwareBoltMm}mm`,
  });

  if (candidateBodyLengthMm !== undefined) {
    reasons.push({
      category: "body-length",
      ok: candidateBodyLengthMm <= slot.clearance.maxBodyLengthMm,
      detail: `body ${candidateBodyLengthMm}mm vs frame max ${slot.clearance.maxBodyLengthMm}mm`,
    });
  }
  if (candidateBodyDiameterMm !== undefined) {
    reasons.push({
      category: "body-diameter",
      ok: candidateBodyDiameterMm <= slot.clearance.maxBodyDiameterMm,
      detail: `body ⌀${candidateBodyDiameterMm}mm vs frame max ⌀${slot.clearance.maxBodyDiameterMm}mm`,
    });
  }
  if (candidateHasPiggyback) {
    reasons.push({
      category: "reservoir",
      ok: slot.clearance.piggybackOk,
      detail: slot.clearance.piggybackOk
        ? "piggyback reservoir clears the frame"
        : "piggyback reservoir will foul the frame",
    });
  }

  const fits = reasons.every((r) => r.ok);
  const dropIn =
    fits &&
    candidate.upperMount.eyeletWidthMm === req.upperMount.eyeletWidthMm &&
    candidate.upperMount.hardwareBoltMm === req.upperMount.hardwareBoltMm &&
    candidate.lowerMount.eyeletWidthMm === req.lowerMount.eyeletWidthMm &&
    candidate.lowerMount.hardwareBoltMm === req.lowerMount.hardwareBoltMm &&
    candidate.eyeToEyeMm === req.eyeToEyeMm &&
    candidate.strokeMm === req.strokeMm;

  return { fits, dropIn, reasons };
};

export const coilRateInRange = (
  shock: ShockSpec,
  desiredLbIn: number,
): boolean => {
  if (shock.springType !== "coil" || !shock.coilSpringRateLbInRange) {
    return false;
  }
  const [min, max] = shock.coilSpringRateLbInRange;
  return withinRange(desiredLbIn, min, max);
};
