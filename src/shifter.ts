/**
 * Shifter ↔ derailleur compatibility — the most common drivetrain-mismatch
 * question. Mechanical groups must share a cable-pull (actuation) ratio; a
 * road shifter won't index an MTB derailleur even at the same speed count.
 * Electronic groups must share a protocol: SRAM AXS and Shimano Di2 do NOT
 * intercommunicate. Within a brand, a native "mullet" is allowed (SRAM Eagle
 * AXS derailleur + road AXS shifter; Shimano wireless Di2 MTB + Di2 road).
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";
import type { Actuation } from "./derailleur.js";

export type Protocol = "mechanical" | "sram-axs" | "shimano-di2";

export interface ShifterSpec {
  label: string;
  protocol: Protocol;
  actuation?: Actuation; // mechanical only
  speed: number;
}
export interface DerailleurMatch {
  protocol: Protocol;
  actuation?: Actuation;
  speed: number;
}

export function checkShifterFit(shifter: ShifterSpec, rd: DerailleurMatch): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (shifter.protocol !== rd.protocol) {
    reasons.push(block("protocol", `${shifter.protocol} shifter can't drive a ${rd.protocol} derailleur`));
    if (shifter.protocol !== "mechanical" && rd.protocol !== "mechanical") {
      notes.push("SRAM AXS and Shimano Di2 are separate wireless ecosystems — they don't talk to each other.");
    }
    return resolve(reasons, notes);
  }

  if (shifter.protocol === "mechanical") {
    if (shifter.actuation === rd.actuation) {
      reasons.push(pass("actuation", `${shifter.actuation} pull ratio matches`));
    } else {
      reasons.push(block("actuation", `${shifter.actuation} shifter can't index a ${rd.actuation} derailleur — actuation ratios differ`));
      notes.push("Cable-pull ratio must match. Cross-brand, and even Shimano road vs MTB at the same speed, will not index.");
    }
  } else {
    reasons.push(pass("protocol", `${shifter.protocol} shifter and derailleur pair natively (brand mullet OK)`));
  }

  if (shifter.speed === rd.speed) {
    reasons.push(pass("speed", `${shifter.speed}-speed matches`));
  } else {
    reasons.push(block("speed", `${shifter.speed}-speed shifter with a ${rd.speed}-speed derailleur — cog pitch differs, won't index`));
  }

  return resolve(reasons, notes);
}
