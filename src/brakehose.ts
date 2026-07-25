/**
 * Brake hose / line fitment — a real blocker after a bar, fork, or frame swap.
 * The fluid must match the caliper (DOT in a mineral-oil system, or vice-versa,
 * destroys the seals — a hard block), the hose fitting must match (banjo vs
 * straight/compression), and the hose has to actually be long enough for the
 * routing.
 */
import { block, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type Fluid = "mineral" | "dot";
export type Fitting = "banjo" | "straight" | "compression";

export interface CaliperHydraulic {
  label: string;
  fluid: Fluid;
  fitting: Fitting;
}
export interface HoseSpec {
  label: string;
  fluid: Fluid;
  fitting: Fitting;
  lengthMm: number;
}

export function checkBrakeHose(caliper: CaliperHydraulic, hose: HoseSpec, requiredLengthMm: number): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (hose.fluid === caliper.fluid) {
    reasons.push(pass("fluid", `${hose.fluid} hose matches the ${caliper.fluid} system`));
  } else {
    reasons.push(block("fluid", `${hose.fluid} hose in a ${caliper.fluid} brake — mixing fluids destroys the seals`));
    notes.push("Never mix DOT and mineral oil. Shimano/Magura are mineral; SRAM/Hayes are DOT — match the whole system to the caliper.");
  }

  if (hose.fitting === caliper.fitting) {
    reasons.push(pass("fitting", `${hose.fitting} fitting matches the caliper`));
  } else {
    reasons.push(block("fitting", `${hose.fitting} hose end won't seal on a ${caliper.fitting} caliper port`));
  }

  if (hose.lengthMm >= requiredLengthMm) {
    reasons.push(pass("length", `${hose.lengthMm} mm hose covers the ${requiredLengthMm} mm routing`));
  } else {
    reasons.push(block("length", `${hose.lengthMm} mm hose is too short for the ${requiredLengthMm} mm routing after the swap`));
  }

  return resolve(reasons, notes);
}
