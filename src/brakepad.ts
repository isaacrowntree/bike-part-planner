/**
 * Brake pad fitment. The gate is pad SHAPE, which is caliper-specific — a
 * 2-piston Shimano pad won't fit a 4-piston Shimano caliper. Compound is
 * free to choose EXCEPT against resin-only rotors, which warp under sintered
 * pads.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type Compound = "resin" | "sintered" | "semi-metallic";

export interface CaliperSpec {
  label: string;
  padShape: string; // e.g. "shimano-b01s", "shimano-n-4pot", "sram-guide", "magura-8"
  pistons: 2 | 4;
  rotorResinOnly?: boolean; // the fitted rotor is rated resin-only
}
export interface PadSpec {
  label: string;
  shape: string;
  pistons: 2 | 4;
  compound: Compound;
}

export function checkBrakePadFit(caliper: CaliperSpec, pad: PadSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (pad.shape === caliper.padShape) {
    reasons.push(pass("shape", `${pad.shape} backplate matches the caliper`));
  } else {
    reasons.push(block("shape", `${pad.shape} pad does not fit a ${caliper.padShape} caliper — pad shape is caliper-specific`));
  }

  if (pad.pistons === caliper.pistons) {
    reasons.push(pass("pistons", `${pad.pistons}-piston pad matches`));
  } else {
    reasons.push(block("pistons", `${pad.pistons}-piston pad in a ${caliper.pistons}-piston caliper — wrong size`));
  }

  if (caliper.rotorResinOnly && pad.compound !== "resin") {
    reasons.push(block("compound", `${pad.compound} pads on a resin-only rotor will overheat and warp it — use resin pads`));
    notes.push("Your rotor is rated resin-only (common on Shimano RT/entry rotors). Fit resin/organic pads or change to a sintered-rated rotor.");
  } else {
    reasons.push(pass("compound", `${pad.compound} compound is fine for this rotor`));
  }

  return resolve(reasons, notes);
}
