/**
 * Region-aware ebike legality — a compatibility dimension few tools model.
 * A motor/controller that's legal in one market is illegal on public roads in
 * another, and a conversion can quietly turn a bike into an unregistered motor
 * vehicle. This gates the motor/controller BUY step, not just the fit.
 *
 * Limits (public-road, pedal bikes):
 *  - EU  (EN 15194 / EPAC): ≤250 W continuous, assist cuts at 25 km/h, pedal
 *        assist only — a throttle makes it non-compliant even if disabled.
 *  - AU  (EPAC, mirrors EN 15194): ≤250 W, assist stops at 25 km/h.
 *  - US  (federal ≤750 W + 3-class state system): Class 1 pedal-assist 20 mph,
 *        Class 2 throttle 20 mph, Class 3 pedal-assist 28 mph. Over 750 W or
 *        over class speed → motor vehicle (registration/licence).
 *
 * ADVISORY, NOT A GATE. `fits`/`block` here describe road-legality only — the
 * app surfaces this as dismissible information and must let the rider proceed
 * (and buy) regardless. Plenty of legitimate use is off-road / private land.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type Region = "eu" | "au" | "us";

export interface EbikeSetup {
  motorNominalW: number;
  assistCutoffKmh: number; // speed at which assist stops
  hasThrottle: boolean;
}

export interface LegalResult extends Fitment {
  region: Region;
  classification: string; // e.g. "EPAC-compliant", "US Class 3", "motor vehicle"
}

const MPH = 1.60934;

export function checkEbikeLegal(region: Region, s: EbikeSetup): LegalResult {
  const reasons: Reason[] = [];
  const notes: string[] = [];
  let classification: string;

  if (region === "eu" || region === "au") {
    const std = region === "eu" ? "EN 15194 (EU EPAC)" : "AU EPAC (250 W / 25 km/h)";
    const wattOk = s.motorNominalW <= 250;
    const speedOk = s.assistCutoffKmh <= 25;
    reasons.push(wattOk
      ? pass("power", `${s.motorNominalW} W within the 250 W continuous limit`)
      : block("power", `${s.motorNominalW} W exceeds the 250 W legal limit for road use under ${std}`));
    reasons.push(speedOk
      ? pass("speed", `assist cuts at ${s.assistCutoffKmh} km/h (≤25 km/h)`)
      : block("speed", `assist to ${s.assistCutoffKmh} km/h exceeds the 25 km/h cutoff`));
    if (s.hasThrottle) {
      reasons.push(block("throttle", `a throttle makes it non-compliant under ${std} — remove it physically (disabling in software isn't enough)`));
      notes.push("EU/AU pedelec law is pedal-assist only. A fitted throttle voids EPAC compliance even if software-disabled — the safe path is physical removal.");
    } else {
      reasons.push(pass("throttle", `pedal-assist only — compliant`));
    }
    const compliant = wattOk && speedOk && !s.hasThrottle;
    classification = compliant ? "EPAC-compliant" : "not road-legal (EPAC)";
  } else {
    // US: federal ≤750 W + class speeds
    const wattOk = s.motorNominalW <= 750;
    reasons.push(wattOk
      ? pass("power", `${s.motorNominalW} W within the 750 W federal limit`)
      : block("power", `${s.motorNominalW} W exceeds the 750 W federal ebike limit — this is a motor vehicle`));

    const kmh = s.assistCutoffKmh;
    const c1c2 = 20 * MPH; // ~32.2
    const c3 = 28 * MPH; // ~45.1
    if (kmh <= c1c2 + 0.5) {
      classification = s.hasThrottle ? "US Class 2 (throttle, 20 mph)" : "US Class 1 (pedal-assist, 20 mph)";
      reasons.push(pass("speed", `${kmh} km/h (≈${Math.round(kmh / MPH)} mph) — within Class ${s.hasThrottle ? "2" : "1"}`));
    } else if (kmh <= c3 + 0.5 && !s.hasThrottle) {
      classification = "US Class 3 (pedal-assist, 28 mph)";
      reasons.push(pass("speed", `${kmh} km/h (≈${Math.round(kmh / MPH)} mph) — Class 3; note bike-path restrictions`));
      notes.push("Class 3 is often barred from multi-use paths and may require a helmet/age minimum by state.");
    } else {
      classification = "motor vehicle (out of class)";
      reasons.push(block("speed", `${kmh} km/h (≈${Math.round(kmh / MPH)} mph)${s.hasThrottle ? " with throttle" : ""} exceeds the class-3 ceiling — reclassed as a motor vehicle`));
    }
    if (!wattOk) classification = "motor vehicle (over 750 W)";
  }

  return { ...resolve(reasons, notes), region, classification };
}
