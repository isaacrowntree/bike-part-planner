/**
 * Chainring fitment. Two current traps: SRAM 3-bolt and 8-bolt direct mount
 * are NOT interchangeable, and offset sets chainline — a non-Boost (6 mm /
 * 49 mm) ring on a Boost frame drops the chain. Tooth profile is chain-specific
 * (an Eagle ring and a Hyperglide+ chain mesh imperfectly).
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type RingMount =
  | "bcd-104" | "bcd-96-shimano" | "bcd-110-4" | "bcd-107-sram"
  | "dm-sram-3bolt" | "dm-sram-8bolt" | "dm-raceface-cinch" | "dm-shimano";
export type ChainProfile = "sram-eagle" | "shimano-hg+" | "sram-flattop" | "standard";

export interface CrankInterface {
  label: string;
  mount: RingMount;
  rearSpacingMm: number; // 142 non-Boost, 148 Boost
}
export interface ChainringSpec {
  label: string;
  mount: RingMount;
  offsetMm: number; // 6→49 mm, 3→52 mm (Boost), 0→55 mm chainline
  toothCount: number;
  profile: ChainProfile;
}

const chainlineFromOffset = (offsetMm: number) => 55 - offsetMm; // 6→49, 3→52, 0→55

export function checkChainringFit(crank: CrankInterface, ring: ChainringSpec, chain: ChainProfile): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (ring.mount === crank.mount) {
    reasons.push(pass("mount", `${ring.mount} ring matches the crank interface`));
  } else {
    reasons.push(block("mount", `${ring.mount} ring will not fit a ${crank.mount} crank`));
    if (ring.mount.startsWith("dm-sram") && crank.mount.startsWith("dm-sram")) {
      notes.push("SRAM 3-bolt and 8-bolt direct mount look similar but are not interchangeable — match the exact standard.");
    }
  }

  const chainline = chainlineFromOffset(ring.offsetMm);
  const target = crank.rearSpacingMm >= 148 ? 52 : 49;
  if (Math.abs(chainline - target) <= 1) {
    reasons.push(pass("chainline", `${ring.offsetMm} mm offset → ${chainline} mm chainline, right for ${crank.rearSpacingMm} mm spacing`));
  } else {
    reasons.push(warn("chainline", `${ring.offsetMm} mm offset → ${chainline} mm chainline vs ${target} mm ideal — cross-chain wear / chain drop`));
  }

  if (ring.profile === chain || ring.profile === "standard" || chain === "standard") {
    reasons.push(pass("chain-profile", `${ring.profile} teeth suit the ${chain} chain`));
  } else {
    reasons.push(warn("chain-profile", `${ring.profile} ring with a ${chain} chain — narrow-wide mesh is imperfect; pair the ring to your chain`));
  }

  return resolve(reasons, notes);
}
