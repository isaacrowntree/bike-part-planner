/**
 * Chain fitment — speed compatibility + length. The foundational drivetrain
 * check. Chain WIDTH is speed-specific (a 12-speed chain is too narrow to run
 * reliably on an 8-speed setup and vice-versa), and LENGTH derives from the
 * big-big + 2 rule (rear-derailleur wrap method). Cross-brand at the same
 * speed count usually works mechanically but is a known tolerance risk on 12s.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type ChainBrand = "shimano" | "sram" | "campagnolo" | "kmc" | "other";

export interface ChainSpec {
  label: string;
  speed: number;
  brand: ChainBrand;
}
export interface DrivetrainChain {
  speed: number;
  brand: ChainBrand;
}

export function checkChainFit(dt: DrivetrainChain, chain: ChainSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (chain.speed === dt.speed) {
    reasons.push(pass("speed", `${chain.speed}-speed chain matches the drivetrain`));
  } else if (Math.abs(chain.speed - dt.speed) <= 1 && chain.speed >= 8 && dt.speed >= 8) {
    reasons.push(warn("speed", `${chain.speed}-speed chain on a ${dt.speed}-speed drivetrain — one step off; shifting will be imprecise, match the speed`));
  } else {
    reasons.push(block("speed", `${chain.speed}-speed chain is the wrong width for a ${dt.speed}-speed drivetrain`));
  }

  // cross-brand tolerance: fine ≤11s; a real risk at 12s (Eagle vs HG+ vs Flattop)
  if (chain.brand === dt.brand || chain.brand === "kmc" || chain.brand === "other") {
    reasons.push(pass("brand", `${chain.brand} chain works with the ${dt.brand} drivetrain`));
  } else if (dt.speed >= 12) {
    reasons.push(warn("brand", `${chain.brand} chain on a ${dt.brand} 12-speed drivetrain — tooth/chain mesh is tuned per brand; expect noisier shifting`));
  } else {
    reasons.push(pass("brand", `${chain.brand} chain is fine cross-brand at ${dt.speed}-speed`));
  }

  return resolve(reasons, notes);
}

export interface ChainLengthInputs {
  bigChainringT: number;
  bigCogT: number;
  chainstayMm: number;
  fullSuspension?: boolean; // measure at max chainstay (fully compressed)
}

/**
 * Chain length in whole links via the "big-big + 2" rule (rounded up to an
 * even link count). L(inches) ≈ 2·(CS/25.4) + (F/4 + R/4) + 1.
 */
export function chainLengthLinks(i: ChainLengthInputs): number {
  const csIn = i.chainstayMm / 25.4;
  const inches = 2 * csIn + i.bigChainringT / 4 + i.bigCogT / 4 + 1;
  const links = Math.ceil(inches * 2) ; // 2 half-links (1 inner + 1 outer) per inch
  return links % 2 === 0 ? links : links + 1; // chains join in even links
}
