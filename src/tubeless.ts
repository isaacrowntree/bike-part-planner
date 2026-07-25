/**
 * Tubeless setup fitment + safety. Both rim and tire must be tubeless-ready or
 * the bead can blow off under pressure — a genuine safety block, not a warn.
 * Hookless rims add a hard pressure ceiling and an approved-tire requirement.
 * The valve must be long enough to clear the rim depth, and sealant volume
 * scales with tire size.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export interface RimTubeless {
  tubelessReady: boolean;
  hookless: boolean;
  internalWidthMm: number;
  depthMm: number; // rim profile depth the valve must clear
  hooklessMaxPsi?: number;
}
export interface TireTubeless {
  label: string;
  tubelessReady: boolean;
  widthMm: number;
  hooklessApproved?: boolean;
}
export interface ValveSpec {
  lengthMm: number;
}

export interface TubelessResult extends Fitment {
  recommendedSealantMl: number;
}

/** Rough sealant volume: ~30 ml + ~1 ml per mm of tire width over 40 mm. */
function sealantMl(tireWidthMm: number): number {
  return Math.round(30 + Math.max(0, tireWidthMm - 40));
}

export function checkTubeless(rim: RimTubeless, tire: TireTubeless, valve: ValveSpec): TubelessResult {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (rim.tubelessReady && tire.tubelessReady) {
    reasons.push(pass("bead", `tubeless-ready rim + tire — the bead will seat and hold`));
  } else {
    reasons.push(block("bead", `${!rim.tubelessReady ? "rim" : "tire"} is not tubeless-ready — the bead can blow off under pressure`));
    notes.push("Running a non-tubeless bead tubeless is a safety risk: it can unseat explosively. Use a TLR/TC rim and tire.");
  }

  if (rim.hookless) {
    if (!tire.hooklessApproved) {
      reasons.push(block("hookless", `hookless rim needs a hookless-approved tire — an unapproved tire can roll off the bead`));
    } else {
      const cap = rim.hooklessMaxPsi ?? 30;
      reasons.push(warn("hookless", `hookless rim — keep pressure under ${cap} psi and only run approved tires`));
    }
  } else {
    reasons.push(pass("hookless", `hooked rim — standard tubeless pressures`));
  }

  // valve must clear the rim and leave thread for the core/nut
  if (valve.lengthMm >= rim.depthMm + 10) {
    reasons.push(pass("valve", `${valve.lengthMm} mm valve clears the ${rim.depthMm} mm rim`));
  } else {
    reasons.push(warn("valve", `${valve.lengthMm} mm valve is short for a ${rim.depthMm} mm rim — you'll struggle to thread the nut / inflate`));
  }

  return { ...resolve(reasons, notes), recommendedSealantMl: sealantMl(tire.widthMm) };
}
