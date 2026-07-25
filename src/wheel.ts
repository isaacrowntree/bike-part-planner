/**
 * Wheel / hub fitment. The dominant real-world mismatch is Boost vs non-Boost
 * — 110×15 / 148×12 against 100×15 / 142×12. Endcaps sometimes convert a hub,
 * but on a mismatched FRAME the rotor line and chainline won't follow, so we
 * treat a spacing mismatch as a block. Axle diameter and wheel diameter are
 * the other two hard gates; the rotor interface (6-bolt vs Center Lock) is a
 * warn — an adapter exists.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";
import type { WheelSize, AxleType } from "./fork.js";
import { BSD } from "./tire.js";
import type { HubInterface } from "./standards.js";

// re-export so importers (e.g. rotor.ts) can keep sourcing this from wheel.js
export type { HubInterface } from "./standards.js";

export interface DropoutTarget {
  position: "front" | "rear";
  oldMm: number; // over-locknut dimension / spacing: 100/110/142/148/157
  axle: AxleType;
  wheel: WheelSize;
  hubInterface: HubInterface;
}
export interface WheelSpec {
  label: string;
  oldMm: number;
  axle: AxleType;
  wheel: WheelSize;
  hubInterface: HubInterface;
}

export function checkWheelFit(frame: DropoutTarget, wheel: WheelSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (wheel.oldMm === frame.oldMm) {
    reasons.push(pass("spacing", `${wheel.oldMm} mm hub spacing matches the ${frame.position} dropouts`));
  } else {
    const boostGap = Math.abs(wheel.oldMm - frame.oldMm);
    reasons.push(block("spacing", `${wheel.oldMm} mm hub in ${frame.oldMm} mm dropouts${boostGap === 6 || boostGap === 8 ? " (Boost / non-Boost mismatch)" : ""}`));
    notes.push("Hub spacing must match the frame. Endcaps can sometimes re-space a hub, but on a mismatched frame the rotor and chainline won't line up — this is not a fit.");
  }

  if (wheel.axle === frame.axle) {
    reasons.push(pass("axle", `${wheel.axle} axle matches`));
  } else {
    reasons.push(block("axle", `${wheel.axle} axle ≠ frame ${frame.axle}`));
  }

  if (BSD[wheel.wheel] === BSD[frame.wheel]) {
    reasons.push(pass("diameter", `${wheel.wheel}" wheel fits`));
  } else {
    reasons.push(block("diameter", `${wheel.wheel}" wheel where the frame/fork is built for ${frame.wheel}"`));
  }

  if (wheel.hubInterface === frame.hubInterface) {
    reasons.push(pass("rotor-interface", `${wheel.hubInterface} rotor interface matches your rotors`));
  } else {
    reasons.push(warn("rotor-interface", `${wheel.hubInterface} hub vs ${frame.hubInterface} rotors — use a ${wheel.hubInterface}→${frame.hubInterface} adapter or matching rotors`));
  }

  return resolve(reasons, notes);
}
