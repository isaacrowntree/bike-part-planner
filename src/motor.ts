/**
 * Ebike motor fitment — mid-drive and hub.
 *
 * Mid-drive fits by the bottom-bracket shell: a threaded BSA shell of the
 * right width takes a BBS02/BBSHD directly; a press-fit shell needs an
 * adapter or is a non-starter. Hub motors fit by dropout width, axle type,
 * and wheel size, and above a power threshold need a torque arm. Torque vs
 * frame material is an advisory: carbon frames + a high-torque mid-drive is
 * a known risk.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";
import type { WheelSize, AxleType } from "./fork.js";
import { isThreadedBB, type BBStandard, type FrameMaterial } from "./standards.js";

// re-export so existing importers keep sourcing these from motor.js
export type { BBStandard, FrameMaterial } from "./standards.js";

export interface MidDriveSpec {
  label: string;
  fitsBB: BBStandard[]; // shells this motor natively fits
  shellWidthMm: number[]; // widths supported (68/73/100/120…)
  powerW: number;
  torqueNm: number;
}

export interface FrameBB {
  standard: BBStandard;
  shellWidthMm: number;
  material: FrameMaterial;
}

export function checkMidDriveFit(bb: FrameBB, motor: MidDriveSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  const threaded = isThreadedBB(bb.standard);
  if (motor.fitsBB.includes(bb.standard)) {
    reasons.push(pass("bb-standard", `${bb.standard} shell is directly supported`));
  } else if (!threaded) {
    reasons.push(block("bb-standard", `press-fit ${bb.standard} shell — a threaded-BB adapter is required, and not all frames can take one`));
  } else {
    reasons.push(warn("bb-standard", `${bb.standard} not on the motor's list — verify shell threading before ordering`));
  }

  if (motor.shellWidthMm.includes(bb.shellWidthMm)) {
    reasons.push(pass("shell-width", `${bb.shellWidthMm} mm shell width supported`));
  } else {
    reasons.push(block("shell-width", `${bb.shellWidthMm} mm shell not supported (motor takes ${motor.shellWidthMm.join("/")} mm)`));
  }

  if (bb.material === "carbon" && motor.torqueNm >= 100) {
    reasons.push(warn("frame-load", `${motor.torqueNm} Nm mid-drive on a carbon BB shell — high clamping + torque risk; many makers void warranty`));
    notes.push("Carbon + high-torque mid-drive is a known failure risk. Consider a lower-torque motor or a hub drive.");
  } else {
    reasons.push(pass("frame-load", `${bb.material} frame handles the ${motor.torqueNm} Nm drive load`));
  }

  return resolve(reasons, notes);
}

export type HubPosition = "rear" | "front";

export interface HubMotorSpec {
  label: string;
  position: HubPosition;
  dropoutWidthMm: number;
  axle: AxleType;
  wheelSize: WheelSize;
  powerW: number;
  freehub?: string; // e.g. "shimano-hg"
}

export interface FrameDropout {
  position: HubPosition;
  widthMm: number;
  axle: AxleType;
  wheelSize: WheelSize;
  material: FrameMaterial;
}

/** Torque arms become mandatory above this power (dropout torque exceeds design). */
const TORQUE_ARM_W = 500;

export function checkHubFit(dropout: FrameDropout, hub: HubMotorSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (dropout.widthMm === hub.dropoutWidthMm) {
    reasons.push(pass("dropout-width", `${hub.dropoutWidthMm} mm dropout spacing matches`));
  } else {
    reasons.push(block("dropout-width", `hub is ${hub.dropoutWidthMm} mm but the frame is ${dropout.widthMm} mm`));
  }

  if (dropout.axle === hub.axle) {
    reasons.push(pass("axle", `${hub.axle} axle matches`));
  } else {
    reasons.push(block("axle", `hub axle ${hub.axle} ≠ frame ${dropout.axle}`));
  }

  if (dropout.wheelSize === hub.wheelSize) {
    reasons.push(pass("wheel", `laced into a ${hub.wheelSize}" wheel to match`));
  } else {
    reasons.push(warn("wheel", `re-lace the ${hub.wheelSize}" hub into a ${dropout.wheelSize}" wheel to match the frame`));
  }

  if (hub.powerW >= TORQUE_ARM_W || dropout.position === "front") {
    const both = dropout.position === "front";
    reasons.push(warn("torque-arm", `${hub.powerW} W ${dropout.position} hub — torque arm${both ? "s (both sides on a suspension fork)" : ""} required; dropout torque exceeds design`));
    notes.push(dropout.position === "front" && dropout.material === "alloy"
      ? "Front hub on alloy suspension-fork dropouts is the #1 failure point — keep power modest and use two torque arms."
      : "Fit a torque arm to protect the dropouts.");
  }

  return resolve(reasons, notes);
}
