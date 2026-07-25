/**
 * Tire fitment — the highest-volume "will it fit" question.
 *
 * The hard gate is bead-seat diameter: a 29" (622) tire will never mount a
 * 27.5" (584) rim. After that it's two soft checks — the frame/fork must
 * clear the tire's REAL mounted width (wider than the label on a wide rim),
 * and the tire width should sit in the rim's sensible envelope so it doesn't
 * light-bulb (too wide) or square off (too narrow).
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";
import type { WheelSize } from "./fork.js";

/** Bead-seat / ISO diameter for each wheel family. */
export const BSD: Record<WheelSize, number> = { "26": 559, "27.5": 584, "29": 622, "700c": 622 };

export interface FrameTireClearance {
  wheel: WheelSize;
  maxTireWidthMm: number; // measured gap at the tightest of chainstay / seatstay / arch
  rimInternalWidthMm: number;
}

export interface TireSpec {
  label: string;
  wheel: WheelSize;
  widthMm: number; // labelled width
}

/** Tires measure wider than the label on a wide rim: ~ +0.4 mm per mm of rim over 25 mm. */
function mountedWidthMm(tire: TireSpec, rimInternalMm: number): number {
  return Math.round(tire.widthMm + Math.max(0, rimInternalMm - 25) * 0.4);
}

export function checkTireFit(frame: FrameTireClearance, tire: TireSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (BSD[tire.wheel] === BSD[frame.wheel]) {
    reasons.push(pass("diameter", `${tire.wheel}" (${BSD[tire.wheel]}) matches the wheel`));
  } else {
    reasons.push(block("diameter", `a ${tire.wheel}" (${BSD[tire.wheel]}) tire cannot mount a ${frame.wheel}" (${BSD[frame.wheel]}) rim`));
    return resolve(reasons, notes); // diameter is a hard gate — no point checking width
  }

  const mounted = mountedWidthMm(tire, frame.rimInternalWidthMm);
  const gap = frame.maxTireWidthMm - mounted;
  if (gap < 0) {
    reasons.push(block("clearance", `mounts ~${mounted} mm wide (label ${tire.widthMm}) but the frame clears only ${frame.maxTireWidthMm} mm`));
  } else if (gap < 4) {
    reasons.push(warn("clearance", `~${mounted} mm mounted leaves only ${gap} mm — tight for mud; expect rub with build-up`));
    notes.push("Tires run wider than labelled on wide rims. With under 4 mm spare, mud and flex will rub. Size down or run a narrower rim.");
  } else {
    reasons.push(pass("clearance", `~${mounted} mm mounted, ${gap} mm spare in the frame`));
  }

  // rim envelope: sensible tire width ≈ 1.8–2.5× internal rim width
  const lo = Math.round(frame.rimInternalWidthMm * 1.8);
  const hi = Math.round(frame.rimInternalWidthMm * 2.5);
  if (tire.widthMm < lo) {
    reasons.push(warn("rim-pairing", `${tire.widthMm} mm tire is narrow for a ${frame.rimInternalWidthMm} mm rim — it'll square off (best ${lo}–${hi} mm)`));
  } else if (tire.widthMm > hi) {
    reasons.push(warn("rim-pairing", `${tire.widthMm} mm tire is wide for a ${frame.rimInternalWidthMm} mm rim — light-bulb profile, burp risk (best ${lo}–${hi} mm)`));
  } else {
    reasons.push(pass("rim-pairing", `${tire.widthMm} mm suits a ${frame.rimInternalWidthMm} mm rim`));
  }

  return resolve(reasons, notes);
}
