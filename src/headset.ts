/**
 * Headset fitment via SHIS (Standardized Headset Identification System). The
 * top and bottom are independent specs — a modern tapered bike mixes them
 * (e.g. ZS44/28.6 up top, ZS56/40 down below). Two headsets with the same
 * SHIS interoperate regardless of brand. The classic error is a lower cup /
 * crown race that doesn't match the fork's steerer taper: a tapered fork needs
 * a 40 mm crown-race seat, a straight fork 30 mm.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";
import type { SteererType } from "./fork.js";

export interface FrameHeadtube {
  topShis: string; // e.g. "ZS44/28.6"
  bottomShis: string; // e.g. "ZS56/40"
}
export interface HeadsetSpec {
  label: string;
  topShis: string;
  bottomShis: string;
  crownRaceSeatMm: 30 | 40; // 40 = tapered lower / 1.5"; 30 = straight 1-1/8"
}

/** A tapered fork seats a 40 mm crown race; a straight fork 30 mm. */
const seatFor = (steerer: SteererType): 30 | 40 => (steerer === "tapered" ? 40 : 30);

export function checkHeadsetFit(frame: FrameHeadtube, headset: HeadsetSpec, forkSteerer: SteererType): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (headset.topShis === frame.topShis) {
    reasons.push(pass("top", `top ${headset.topShis} matches the head tube`));
  } else {
    reasons.push(block("top", `top cup ${headset.topShis} ≠ frame ${frame.topShis} — SHIS must match`));
  }

  if (headset.bottomShis === frame.bottomShis) {
    reasons.push(pass("bottom", `bottom ${headset.bottomShis} matches the head tube`));
  } else {
    reasons.push(block("bottom", `bottom cup ${headset.bottomShis} ≠ frame ${frame.bottomShis} — SHIS must match`));
  }

  const need = seatFor(forkSteerer);
  if (headset.crownRaceSeatMm === need) {
    reasons.push(pass("crown-race", `${headset.crownRaceSeatMm} mm crown race suits a ${forkSteerer} steerer`));
  } else {
    reasons.push(block("crown-race", `${headset.crownRaceSeatMm} mm crown race but a ${forkSteerer} fork needs ${need} mm`));
    notes.push("The lower crown race must match the fork's steerer: tapered = 40 mm, straight 1-1/8\" = 30 mm.");
  }

  return resolve(reasons, notes);
}
