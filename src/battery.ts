/**
 * Ebike battery fitment + sizing.
 *
 * A downtube battery fits when the case is shorter than the downtube's usable
 * run, its mount matches the frame's bottle bosses, and — on a full-suspension
 * frame — it clears the rear shock / linkage. Capacity is a sizing question,
 * not a fitment one: the range calculator turns Wh into real-world km so the
 * rider can pick the pack that reaches their ride.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";
import type { FrameMaterial } from "./motor.js";

export type BatteryForm = "downtube" | "in-frame" | "rear-rack" | "triangle-bag";

export interface BatterySpec {
  label: string;
  form: BatteryForm;
  lengthMm: number;
  mountBosses: number; // bottle bosses the mount uses (2 typical)
  capacityWh: number;
  voltage: number;
  weightKg: number;
}

export interface FrameTriangle {
  suspension: "full" | "hardtail" | "rigid";
  downtubeUsableMm: number; // usable straight run for a case
  bottleBosses: number;
  /** Full-sus only: clearance from the downtube boss line to the shock/linkage. */
  shockClearanceMm?: number;
}

export function checkBatteryFit(frame: FrameTriangle, battery: BatterySpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (battery.form === "downtube" || battery.form === "in-frame") {
    if (battery.lengthMm <= frame.downtubeUsableMm) {
      reasons.push(pass("length", `${battery.lengthMm} mm case fits the ${frame.downtubeUsableMm} mm downtube run`));
    } else {
      reasons.push(block("length", `${battery.lengthMm} mm case is longer than the ${frame.downtubeUsableMm} mm downtube run`));
    }

    if (frame.bottleBosses >= battery.mountBosses) {
      reasons.push(pass("mount", `${battery.mountBosses} bottle bosses present`));
    } else {
      reasons.push(warn("mount", `needs ${battery.mountBosses} bosses, frame has ${frame.bottleBosses} — use clamp/strap mounts`));
    }

    if (frame.suspension === "full") {
      const clr = frame.shockClearanceMm ?? 0;
      if (clr < 25) {
        reasons.push(block("shock-clearance", `only ${clr} mm to the rear shock/linkage — the battery will foul it`));
        notes.push("Full-sus triangles are tight around the shock. Measure clearance before ordering; a shorter case or a rear-rack pack may be the only fit.");
      } else {
        reasons.push(pass("shock-clearance", `${clr} mm clearance to the shock/linkage`));
      }
    }
  } else {
    reasons.push(pass("mount", `${battery.form} pack — mounts outside the front triangle`));
  }

  return resolve(reasons, notes);
}

export type Terrain = "flat" | "rolling" | "hilly" | "mountain";
export type Assist = "eco" | "trail" | "boost";

export interface RideInputs {
  riderKg: number; // rider + gear + bike, effective
  terrain: Terrain;
  assist: Assist;
}

/** Rough Wh-per-km consumption model for a mid-drive trail ebike. */
export function whPerKm(r: RideInputs): number {
  const terrain: Record<Terrain, number> = { flat: 6, rolling: 9, hilly: 13, mountain: 18 };
  const assist: Record<Assist, number> = { eco: 0.7, trail: 1.0, boost: 1.4 };
  const weight = 1 + Math.max(0, r.riderKg - 90) * 0.004; // heavier rider draws more
  return Math.round(terrain[r.terrain] * assist[r.assist] * weight * 10) / 10;
}

/** Estimate real-world range (km) from a pack's Wh. Reserves 10% (never run flat). */
export function estimateRangeKm(capacityWh: number, r: RideInputs): number {
  return Math.round((capacityWh * 0.9) / whPerKm(r));
}

/** Smallest catalog pack (by Wh) that reaches the target range. */
export function recommendPack(targetKm: number, packsWh: number[], r: RideInputs): number | null {
  const sorted = [...packsWh].sort((a, b) => a - b);
  for (const wh of sorted) if (estimateRangeKm(wh, r) >= targetKm) return wh;
  return null;
}
