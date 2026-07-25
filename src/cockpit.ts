/**
 * Stem + handlebar fitment. The dominant mismatch is bar bore: 31.8 vs 35 mm
 * are visually similar and physically incompatible — there is NO shim for it
 * (unlike seatposts). The stem's steerer clamp must match the fork steerer,
 * and a carbon bar needs a carbon-rated (burr-free, torque-limited) clamp.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type BarBore = 25.4 | 31.8 | 35;
export type SteererClamp = 28.6 | 38.1; // 1-1/8" or 1.5"

export interface StemSpec {
  label: string;
  barBoreMm: BarBore;
  steererClampMm: SteererClamp;
  carbonRated: boolean;
}
export interface BarSpec {
  label: string;
  clampMm: BarBore;
  material: "alloy" | "carbon";
}

export function checkCockpitFit(stem: StemSpec, bar: BarSpec, forkSteererMm: SteererClamp): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (stem.barBoreMm === bar.clampMm) {
    reasons.push(pass("bar-bore", `${bar.clampMm} mm bar in a ${stem.barBoreMm} mm stem`));
  } else {
    reasons.push(block("bar-bore", `${bar.clampMm} mm bar will not fit a ${stem.barBoreMm} mm stem — there's no shim for bar bore`));
  }

  if (stem.steererClampMm === forkSteererMm) {
    reasons.push(pass("steerer", `${stem.steererClampMm} mm steerer clamp matches the fork`));
  } else {
    reasons.push(block("steerer", `${stem.steererClampMm} mm stem clamp on a ${forkSteererMm} mm steerer`));
  }

  if (bar.material === "carbon" && !stem.carbonRated) {
    reasons.push(warn("carbon", `carbon bar in a stem not rated for carbon — crush risk; use a carbon-rated, torque-limited clamp`));
    notes.push("Carbon bars need a burr-free, carbon-rated stem and a torque wrench. Over-clamping crushes the bar.");
  } else {
    reasons.push(pass("carbon", `${bar.material} bar is fine in this stem`));
  }

  return resolve(reasons, notes);
}
