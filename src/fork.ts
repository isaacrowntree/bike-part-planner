/**
 * Front-shock (suspension fork) fitment — the same rigor as the rear shock.
 *
 * A fork bolts up when the steerer matches the frame's head tube, the axle
 * and wheel match, and the brake mount matches. Beyond bolt-up, axle-to-crown
 * (A-C) length changes the bike's geometry — a longer fork slackens the head
 * angle and raises the BB — so we report the geometry delta, and warn when a
 * fork's travel exceeds what the frame was designed around.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";
import type { SteererType, WheelSize, AxleType, BrakeMount } from "./standards.js";

// re-export so existing importers can keep sourcing these from fork.js
export type { SteererType, WheelSize, AxleType, BrakeMount } from "./standards.js";

export interface ForkSpec {
  label: string;
  steerer: SteererType;
  travelMm: number;
  axleToCrownMm: number;
  wheelSize: WheelSize;
  axle: AxleType;
  brakeMount: BrakeMount;
  offsetMm?: number;
}

export interface FrameFrontEnd {
  /** Head tube accepts this steerer. A tapered head tube also accepts a straight steerer via a reducer crown race, but not vice-versa. */
  steerer: SteererType;
  headTubeLenMm: number;
  /** The A-C the frame was designed around (stock fork). */
  designAxleToCrownMm: number;
  /** Manufacturer's max recommended fork travel for this frame. Optional: when
   *  unknown, overforking cannot be evaluated (and must NOT report a false pass). */
  maxTravelMm?: number;
  wheelSize: WheelSize;
  axle: AxleType;
  /** Frame caliper mount standard. Optional: unknown → the match can't be checked. */
  brakeMount?: BrakeMount;
}

/** ≈ how much head angle changes per mm of axle-to-crown, for a typical trail bike. */
const DEG_PER_MM_AC = 1 / 18; // ~1° slacker per ~18 mm longer fork

export function checkForkFit(frame: FrameFrontEnd, fork: ForkSpec): Fitment & { headAngleDeltaDeg: number } {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  // steerer: tapered frame accepts straight (with reducer); straight frame rejects tapered
  if (frame.steerer === fork.steerer) {
    reasons.push(pass("steerer", `${fork.steerer} steerer matches the head tube`));
  } else if (frame.steerer === "tapered" && fork.steerer === "straight") {
    reasons.push(warn("steerer", "straight steerer in a tapered head tube — needs a reducer crown race / shim"));
  } else {
    reasons.push(block("steerer", "tapered steerer will not fit a straight (1-1/8\") head tube"));
  }

  if (frame.wheelSize === fork.wheelSize) {
    reasons.push(pass("wheel", `${fork.wheelSize}" wheel matches`));
  } else {
    reasons.push(block("wheel", `fork is ${fork.wheelSize}" but the frame runs ${frame.wheelSize}"`));
  }

  if (frame.axle === fork.axle) {
    reasons.push(pass("axle", `${fork.axle} axle matches the hub/frame`));
  } else {
    reasons.push(block("axle", `fork axle ${fork.axle} ≠ frame ${frame.axle} — hub/axle mismatch`));
  }

  if (frame.brakeMount === undefined) {
    notes.push(`Frame brake mount isn't on file — verify the caliper standard matches the ${fork.brakeMount} fork before buying.`);
  } else if (frame.brakeMount === fork.brakeMount) {
    reasons.push(pass("brake-mount", `${fork.brakeMount} brake mount matches`));
  } else {
    reasons.push(warn("brake-mount", `fork is ${fork.brakeMount}, frame caliper expects ${frame.brakeMount} — needs an adapter`));
  }

  // travel ceiling — only when the frame's max recommended travel is known;
  // never fabricate it (that would turn overforking into a false green pass)
  if (frame.maxTravelMm === undefined) {
    notes.push(`Frame's max fork travel isn't on file — can't check overforking for the ${fork.travelMm} mm fork; confirm the frame's ceiling with the manufacturer.`);
  } else if (fork.travelMm > frame.maxTravelMm) {
    reasons.push(block("travel", `${fork.travelMm} mm exceeds the frame's ${frame.maxTravelMm} mm max — overforking risks the warranty and handling`));
  } else {
    reasons.push(pass("travel", `${fork.travelMm} mm within the ${frame.maxTravelMm} mm max`));
  }

  // geometry delta from axle-to-crown
  const acDelta = fork.axleToCrownMm - frame.designAxleToCrownMm;
  const headAngleDeltaDeg = Math.round(-acDelta * DEG_PER_MM_AC * 10) / 10 + 0; // longer A-C = slacker (negative); +0 normalizes -0
  if (Math.abs(acDelta) >= 8) {
    const dir = acDelta > 0 ? "slacker + higher BB" : "steeper + lower BB";
    reasons.push(warn("geometry", `A-C ${acDelta > 0 ? "+" : ""}${acDelta} mm vs stock → ~${Math.abs(headAngleDeltaDeg)}° ${dir}`));
    notes.push(`Geometry shift: head angle ~${headAngleDeltaDeg > 0 ? "+" : ""}${headAngleDeltaDeg}° from the axle-to-crown change.`);
  } else {
    reasons.push(pass("geometry", "axle-to-crown close to stock — geometry unchanged"));
  }

  return { ...resolve(reasons, notes), headAngleDeltaDeg };
}
