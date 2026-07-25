/**
 * Pedal + cleat fitment. Two gates: the pedal axle thread must match the crank
 * (9/16" for modern 3-piece cranks; 1/2" only on old one-piece cranks), and the
 * shoe's cleat drilling must match the pedal system — 2-bolt (SPD/Crankbrothers)
 * vs 3-bolt (SPD-SL/Look) vs 4-bolt (Speedplay). A 2-bolt shoe won't take a
 * 3-bolt road cleat without an adapter.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type PedalThread = "9/16" | "1/2";
export type CleatSystem = "spd" | "spd-sl" | "look" | "crankbrothers" | "speedplay" | "flat";
export type Drilling = "2-bolt" | "3-bolt" | "4-bolt" | "flat";

const DRILLING: Record<CleatSystem, Drilling> = {
  spd: "2-bolt", crankbrothers: "2-bolt", "spd-sl": "3-bolt", look: "3-bolt", speedplay: "4-bolt", flat: "flat",
};

export interface CrankThread { thread: PedalThread }
export interface PedalSpec { label: string; thread: PedalThread; system: CleatSystem }
export interface ShoeSpec { label: string; drilling: Drilling }

export function checkPedalFit(crank: CrankThread, pedal: PedalSpec, shoe: ShoeSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (pedal.thread === crank.thread) {
    reasons.push(pass("thread", `${pedal.thread}" pedal thread matches the crank`));
  } else {
    reasons.push(block("thread", `${pedal.thread}" pedal won't thread into a ${crank.thread}" crank`));
  }

  if (pedal.system === "flat") {
    reasons.push(pass("cleat", `flat pedals — any shoe works`));
    return resolve(reasons, notes);
  }

  const need = DRILLING[pedal.system];
  if (shoe.drilling === need) {
    reasons.push(pass("cleat", `${shoe.drilling} shoe takes a ${pedal.system} cleat`));
  } else if (shoe.drilling === "4-bolt" && need === "3-bolt") {
    reasons.push(warn("cleat", `4-bolt Speedplay shoe on a ${pedal.system} pedal — needs the Speedplay 3-bolt base adapter`));
  } else {
    reasons.push(block("cleat", `${shoe.drilling} shoe can't mount a ${pedal.system} (${need}) cleat — different drilling`));
  }

  return resolve(reasons, notes);
}
