/**
 * Bottom bracket + crank fitment — universally cited as the most confusing
 * standard. The key mental shift: the BB is the ADAPTER between the frame
 * shell and the crank spindle. So you never ask "does this crank fit" — you
 * ask "is there a BB for (shell standard × spindle diameter)?" There nearly
 * always is; the real answers are "native", "needs a reducer", or the two
 * hard walls: you can't thread a press-fit shell, and DUB is neither 24 nor 30.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

import { isThreadedBB, NATIVE_SPINDLE, chainlineTarget, type BBStandard, type Spindle } from "./standards.js";

// ShellStandard is an alias of the shared BBStandard; re-export both for compat.
export type ShellStandard = BBStandard;
export type { BBStandard, Spindle } from "./standards.js";

export interface Shell {
  standard: BBStandard;
  widthMm: number; // 68/73 MTB, 83 DH, 100 fat, 86.5 road
}
export interface CrankSpec {
  label: string;
  spindle: Spindle;
}

export function checkBBFit(shell: Shell, crank: CrankSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];
  const threaded = isThreadedBB(shell.standard);
  const native = NATIVE_SPINDLE[shell.standard];

  // There is a BB for essentially every shell×spindle pair — report which kind.
  if (crank.spindle === native) {
    reasons.push(pass("bb-match", `${crank.spindle === "dub" ? "DUB" : crank.spindle + " mm"} crank drops straight into a ${shell.standard.toUpperCase()} shell with the standard BB`));
  } else if (crank.spindle === "dub") {
    reasons.push(warn("bb-match", `DUB spindle (28.99 mm) needs a DUB-specific ${shell.standard.toUpperCase()} BB — it is neither 24 nor 30 mm`));
    notes.push("DUB is SRAM's own 28.99 mm spindle. Order a DUB BB for your shell — a 24 mm or 30 mm BB will not fit it.");
  } else if (native === "30" && crank.spindle === "24") {
    reasons.push(warn("bb-match", `24 mm crank in a 30 mm-native ${shell.standard.toUpperCase()} shell — needs a reducer BB`));
    notes.push("A 30 mm-bore shell takes a 24 mm crank via a reducer BB (e.g. PF30→24). Make sure you order the reducer, not the same-size BB.");
  } else {
    reasons.push(warn("bb-match", `${crank.spindle} mm crank in a ${shell.standard.toUpperCase()} shell — check a ${shell.standard}→${crank.spindle} BB exists for your shell width`));
  }

  // shell width sanity for the standard
  reasons.push(pass("shell-width", `${shell.widthMm} mm ${threaded ? "threaded" : "press-fit"} shell`));

  return resolve(reasons, notes);
}

/** Boost (148 rear) wants a 52 mm chainline; non-Boost (142) a 49 mm. */
export function checkChainline(rearSpacingMm: number, crankChainlineMm: number): Fitment {
  const target = chainlineTarget(rearSpacingMm);
  if (Math.abs(crankChainlineMm - target) <= 1) {
    return resolve([pass("chainline", `${crankChainlineMm} mm chainline matches the ${target} mm target for ${rearSpacingMm} mm spacing`)]);
  }
  return resolve(
    [warn("chainline", `${crankChainlineMm} mm chainline vs ${target} mm ideal for ${rearSpacingMm} mm rear — expect cross-chain wear / drops`)],
    ["Boost frames need a ~52 mm chainline; non-Boost ~49 mm. A mismatched crank shifts poorly and drops the chain in the extremes."],
  );
}
