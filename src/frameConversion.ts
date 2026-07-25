/**
 * Frame conversion suitability — "is THIS frame a good ebike-conversion
 * candidate?" A holistic gate that sits above the component checks in motor.ts
 * / battery.ts and answers the question a rider asks BEFORE buying a kit.
 *
 * The hard deal-breakers (block): carbon + high-torque mid-drive; a front hub
 * on a suspension fork with alloy/cast dropouts; a press-fit shell for a
 * threaded mid-drive; a slotted hub kit on a thru-axle frame; no room for a
 * battery. The rest are ranked WARNINGS grounded in practitioner consensus
 * (Grin, ebikeschool, Endless Sphere) rather than certified limits — torque-arm
 * thresholds by power, aluminium fatigue, rim-brake adequacy, mid-drive
 * drivetrain wear, spoke gauge.
 *
 * Numbers are practitioner rules of thumb, labelled as such — solid to gate on,
 * not certified engineering limits.
 *
 * ADVISORY, like ebikeLegal. `block` reasons here are strong SAFETY warnings,
 * but the app surfaces them as dismissible — a rider can acknowledge the risk
 * and proceed (and buy). The severity communicates how serious the warning is,
 * not a hard stop on the funnel.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";
import type { FrameMaterial } from "./motor.js";

export type ConversionType = "hub-front" | "hub-rear" | "mid-drive";
export type FrameStyle =
  | "rigid" | "hardtail" | "full-suspension" | "road-gravel"
  | "cargo" | "fat" | "folding" | "step-through" | "bmx-dj";
export type BrakeType = "rim" | "mechanical-disc" | "hydraulic-disc";
export type ForkType = "rigid" | "suspension";
export type Axle = "qr" | "thru";

export interface ConvFrame {
  material: FrameMaterial;
  style: FrameStyle;
  brake: BrakeType;
  fork: ForkType;
  axle: Axle;
  threadedBB: boolean; // BSA/T47 threaded shell (mid-drive needs this)
  batteryFitsTriangle: boolean;
  weightLimitKg?: number; // manufacturer rating, if known
}
export interface ConvKit {
  type: ConversionType;
  motorW: number;
  motorTorqueNm: number;
  systemAddedKg: number; // motor + battery + controller
  riderPlusCargoKg: number;
}

/** Torque-arm need by power (practitioner rule of thumb). */
function torqueArm(reasons: Reason[], notes: string[], kit: ConvKit, frame: ConvFrame): void {
  if (kit.type === "mid-drive") return; // mid-drive reacts on the BB, not the dropout
  const alloyish = frame.material === "alloy" || frame.material === "carbon";
  if (kit.motorW >= 750) {
    reasons.push(warn("torque-arm", `${kit.motorW} W hub — a torque arm is near-mandatory (two on any front/alloy build)`));
  } else if (kit.motorW >= 500 || alloyish) {
    reasons.push(warn("torque-arm", `${kit.motorW} W hub on ${frame.material} dropouts — fit a torque arm to stop the dropout spreading`));
  } else {
    reasons.push(pass("torque-arm", `${kit.motorW} W on ${frame.material} — a torque arm is optional at this power`));
  }
}

export function checkConversionSuitability(frame: ConvFrame, kit: ConvKit): Fitment & { tier: "good" | "marginal" | "unsuitable" } {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  /* ---- hard deal-breakers ---- */
  if (frame.material === "carbon" && kit.type === "mid-drive" && kit.motorTorqueNm >= 80) {
    reasons.push(block("material", `carbon frame + ${kit.motorTorqueNm} Nm mid-drive — the carbon BB junction is load-critical and fails catastrophically; universally voids warranty`));
    notes.push("Carbon is brittle — it cracks without warning. A high-torque mid-drive reacting against a carbon BB shell is a hard no.");
  } else if (frame.material === "carbon") {
    reasons.push(warn("material", `carbon frame — brittle, fails without warning; distribute any clamp load and never over-torque. A rear hub + torque arm is the least-bad carbon conversion`));
  } else if (frame.material === "alloy") {
    reasons.push(warn("material", `aluminium has no fatigue limit — added conversion mass shortens frame life over years; inspect the head tube / downtube junctions`));
  } else {
    reasons.push(pass("material", `${frame.material} is a strong conversion material (bends before it breaks; ${frame.material === "steel" ? "cold-set-able" : "fatigue-resistant"})`));
  }

  if (kit.type === "hub-front" && frame.fork === "suspension" && (frame.material === "alloy" || frame.material === "carbon")) {
    reasons.push(block("front-hub-fork", `front hub on a suspension fork with ${frame.material} dropouts — the #1 dangerous build; the dropout can snap and eject the wheel. Use a steel rigid fork + dual torque arms, or a rear/mid drive instead`));
  }

  if (kit.type === "mid-drive" && !frame.threadedBB) {
    reasons.push(block("bb-shell", `mid-drive needs a threaded BSA/T47 shell — a press-fit shell isn't natively compatible and creaks/eggs out`));
  }

  if ((kit.type === "hub-front" || kit.type === "hub-rear") && frame.axle === "thru") {
    reasons.push(block("axle", `thru-axle frame with a slotted hub kit — most cheap kits are QR/slotted; you need a thru-axle-capable motor (e.g. Grin All-Axle) or it won't fit`));
  }

  if (!frame.batteryFitsTriangle) {
    const sev = frame.style === "full-suspension" ? warn : block;
    reasons.push(sev("battery-space", `no room for a downtube battery${frame.style === "full-suspension" ? " (shock fills the triangle) — a small pack or rack mount only, which raises the centre of gravity" : " — this frame can't take a proper pack"}`));
  } else {
    reasons.push(pass("battery-space", `front triangle has room for a downtube pack`));
  }

  /* ---- ranked warnings ---- */
  torqueArm(reasons, notes, kit, frame);

  if (frame.brake === "rim") {
    const sev = kit.motorW >= 500 ? block : warn;
    reasons.push(sev("brakes", `rim brakes with a ${kit.motorW} W assist — added mass + speed outrun rim braking, useless in the wet. Convert to discs or drop the power`));
  } else if (frame.brake === "mechanical-disc" && kit.motorW >= 750) {
    reasons.push(warn("brakes", `mechanical discs at ${kit.motorW} W — adequate but a hydraulic 4-piston + bigger rotor is the real fix`));
  } else {
    reasons.push(pass("brakes", `${frame.brake} brakes suit the added mass`));
  }

  if (kit.type === "mid-drive") {
    reasons.push(warn("drivetrain-wear", `mid-drives push motor power through the chain — expect chain wear every ~1,000–2,000 mi and cogs ~2,000–4,000 mi. A gear/shift sensor and easing off while shifting saves the drivetrain`));
  }

  if (kit.motorTorqueNm >= 80 || kit.riderPlusCargoKg + kit.systemAddedKg >= 136) {
    reasons.push(warn("spokes", `high torque / system weight — rebuild the motor wheel with 12g (2.6 mm) spokes and more crosses; thin spokes fatigue and break under motor torque`));
  }

  if (frame.weightLimitKg !== undefined) {
    const total = kit.riderPlusCargoKg + kit.systemAddedKg;
    if (total > frame.weightLimitKg) {
      reasons.push(block("weight-limit", `rider + kit + cargo ≈ ${total} kg exceeds the frame's ${frame.weightLimitKg} kg rating`));
    } else {
      reasons.push(pass("weight-limit", `${total} kg within the ${frame.weightLimitKg} kg frame rating`));
    }
  }

  const fit = resolve(reasons, notes);
  const warnCount = reasons.filter((r) => r.severity === "warn").length;
  const tier = !fit.fits ? "unsuitable" : warnCount >= 3 ? "marginal" : "good";
  return { ...fit, tier };
}
