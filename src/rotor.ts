/**
 * Brake rotor + caliper-mount fitment — a pure interface/adapter problem.
 *
 * A caliper mount has a NATIVE rotor size (the smallest it runs with no
 * adapter). You go UP with a +20 mm adapter, never below native. IS mounts
 * always need an adapter, even at native. The fork/frame has a rated max
 * rotor. And the brand trap: SRAM uses 200/220, Shimano 203/223 — a 200 rotor
 * with a "203" adapter mis-aligns and rubs, so the adapter must match the rotor.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";
import type { HubInterface } from "./wheel.js";

export type MountType = "post" | "is" | "flat";

export interface CaliperMount {
  type: MountType;
  nativeSizeMm: number; // smallest rotor with no adapter (post mounts); IS always needs one
  maxRotorMm: number; // fork/frame rating
  hubInterface: HubInterface;
}
export interface RotorSpec {
  label: string;
  sizeMm: number;
  brand: "sram" | "shimano" | "other";
  interface: HubInterface;
}

const SRAM_SIZES = new Set([180, 200, 220]);
const SHIMANO_SIZES = new Set([180, 203, 223]);

export function checkRotorFit(mount: CaliperMount, rotor: RotorSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (rotor.sizeMm > mount.maxRotorMm) {
    reasons.push(block("max-size", `${rotor.sizeMm} mm exceeds the ${mount.maxRotorMm} mm rating for this fork/frame`));
  } else if (rotor.sizeMm < mount.nativeSizeMm) {
    reasons.push(block("min-size", `${rotor.sizeMm} mm is smaller than the ${mount.nativeSizeMm} mm native mount — you can't go below native`));
  } else if (mount.type === "is") {
    reasons.push(warn("adapter", `IS mount always needs an adapter — fit an IS→${rotor.sizeMm} mm bracket`));
  } else if (rotor.sizeMm === mount.nativeSizeMm) {
    reasons.push(pass("adapter", `${rotor.sizeMm} mm bolts to the native ${mount.type}-mount — no adapter`));
  } else {
    const step = rotor.sizeMm - mount.nativeSizeMm;
    reasons.push(warn("adapter", `${rotor.sizeMm} mm needs a +${step} mm ${mount.type}-mount adapter over the ${mount.nativeSizeMm} mm native`));
  }

  // brand/size alignment: a same-nominal SRAM vs Shimano adapter offsets by ~3 mm
  const isSramSize = SRAM_SIZES.has(rotor.sizeMm);
  const isShimanoSize = SHIMANO_SIZES.has(rotor.sizeMm);
  if (rotor.brand === "shimano" && isSramSize && !isShimanoSize) {
    reasons.push(warn("brand-adapter", `${rotor.sizeMm} mm is a SRAM size — use a SRAM-matched adapter or the rotor edge won't sit centred`));
  } else if (rotor.brand === "sram" && isShimanoSize && !isSramSize) {
    reasons.push(warn("brand-adapter", `${rotor.sizeMm} mm is a Shimano size — match the adapter brand to avoid a 3 mm offset`));
  } else {
    reasons.push(pass("brand-adapter", `use a ${rotor.brand} adapter to match the ${rotor.sizeMm} mm rotor`));
  }

  if (rotor.interface === mount.hubInterface) {
    reasons.push(pass("hub-interface", `${rotor.interface} rotor matches the hub`));
  } else {
    reasons.push(warn("hub-interface", `${rotor.interface} rotor on a ${mount.hubInterface} hub — needs a ${rotor.interface}↔${mount.hubInterface} adapter`));
  }

  return resolve(reasons, notes);
}
