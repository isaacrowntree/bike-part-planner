/**
 * Rear derailleur ↔ drivetrain fitment.
 *
 * Three hard gates: the biggest cog can't exceed the derailleur's rated max
 * cog; the total wrap (cassette range + chainring range) can't exceed its
 * capacity; and the shifter's actuation ratio must match the derailleur or it
 * simply won't index — the deep gotcha that kills most cross-brand mixes
 * (11-speed Shimano ROAD and MTB even differ from each other). Plus the mount:
 * SRAM Transmission (T-Type) bolts to a UDH frame with no hanger.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type Actuation =
  | "shimano-mtb-11" | "shimano-mtb-12" | "shimano-road-11"
  | "sram-exact" | "sram-x-actuation" | "sram-eagle" | "sram-t-type";
export type FrameMount = "hanger" | "udh";

export interface DerailleurSpec {
  label: string;
  maxCogT: number;
  capacityT: number;
  actuation: Actuation;
  mount: FrameMount; // t-type derailleurs are "udh"
}
export interface Drivetrain {
  bigCogT: number;
  smallCogT: number;
  bigRingT?: number; // 2x only
  smallRingT?: number;
  shifterActuation: Actuation;
  frameMount: FrameMount;
}

export function checkDerailleurFit(rd: DerailleurSpec, dt: Drivetrain): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (dt.bigCogT <= rd.maxCogT) {
    reasons.push(pass("max-cog", `${dt.bigCogT}T big cog is within the ${rd.maxCogT}T limit`));
  } else {
    reasons.push(block("max-cog", `${dt.bigCogT}T cog exceeds the derailleur's ${rd.maxCogT}T max — it can't wrap the big gear`));
  }

  const wrap = (dt.bigCogT - dt.smallCogT) + ((dt.bigRingT ?? 0) - (dt.smallRingT ?? 0));
  if (wrap <= rd.capacityT) {
    reasons.push(pass("capacity", `${wrap}T total wrap within ${rd.capacityT}T capacity`));
  } else {
    reasons.push(warn("capacity", `${wrap}T wrap exceeds ${rd.capacityT}T capacity — chain slack in cross gears; a longer cage or narrower range is safer`));
  }

  if (dt.shifterActuation === rd.actuation) {
    reasons.push(pass("actuation", `${rd.actuation} shifter and derailleur speak the same pull ratio`));
  } else {
    reasons.push(block("actuation", `${dt.shifterActuation} shifter can't index a ${rd.actuation} derailleur — actuation ratios differ`));
    notes.push("Shifter and derailleur must share an actuation ratio. Cross-brand (and even Shimano road vs MTB at the same speed count) will not index.");
  }

  if (rd.mount === "udh" && dt.frameMount !== "udh") {
    reasons.push(block("mount", `this derailleur is direct-mount (UDH / Transmission) — the frame needs a UDH dropout, not a hanger`));
  } else if (rd.mount === "hanger" && dt.frameMount === "udh") {
    reasons.push(pass("mount", `hanger derailleur on a UDH frame — fine with the replaceable UDH hanger fitted`));
  } else {
    reasons.push(pass("mount", `${rd.mount} mount matches the frame`));
  }

  return resolve(reasons, notes);
}
