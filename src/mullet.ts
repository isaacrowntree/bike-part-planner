/**
 * Mixed-wheel ("mullet") geometry side-effects. Changing a wheel size isn't
 * just "does it fit the frame" — it moves the axle height at one or both ends,
 * which lowers the BB and rotates the head/seat angles. This is advisory: it
 * always "fits", but it warns about the geometry drift and whether a flip-chip
 * exists to claw it back. Deltas are approximations from rolling-radius change,
 * labelled as such.
 */
import { warn, pass, resolve, type Fitment, type Reason } from "./fit.js";
import type { WheelSize } from "./fork.js";

/** Approximate rolling radius (mm) with a ~2.4" trail tire fitted. */
const ROLLING_RADIUS: Record<WheelSize, number> = { "26": 340, "27.5": 353, "29": 372, "700c": 355 };

export interface WheelPair {
  front: WheelSize;
  rear: WheelSize;
}
export interface MulletResult extends Fitment {
  bbHeightDeltaMm: number; // negative = lower BB
  headAngleDeltaDeg: number; // negative = slacker
}

export function checkMulletGeometry(original: WheelPair, next: WheelPair, hasFlipChip: boolean): MulletResult {
  const dFront = ROLLING_RADIUS[next.front] - ROLLING_RADIUS[original.front];
  const dRear = ROLLING_RADIUS[next.rear] - ROLLING_RADIUS[original.rear];

  const bbHeightDeltaMm = Math.round((dFront + dRear) / 2);
  // slacker when the rear drops relative to the front (~0.5° per ~19 mm)
  const headAngleDeltaDeg = Math.round(((dRear - dFront) / 33) * 10) / 10 + 0;

  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (bbHeightDeltaMm === 0 && headAngleDeltaDeg === 0) {
    reasons.push(pass("geometry", `same rolling radius — no geometry change`));
  } else {
    const bbTxt = bbHeightDeltaMm <= 0 ? `${-bbHeightDeltaMm} mm lower BB` : `${bbHeightDeltaMm} mm higher BB`;
    const haTxt = headAngleDeltaDeg <= 0 ? `${Math.abs(headAngleDeltaDeg)}° slacker` : `${headAngleDeltaDeg}° steeper`;
    reasons.push(warn("geometry", `≈ ${bbTxt}, head angle ≈ ${haTxt} — expect more pedal strikes if lower, altered handling`));
    if (bbHeightDeltaMm < 0) {
      notes.push(hasFlipChip
        ? "Your frame has a flip-chip — set it to the high position to recover most of the lost BB height."
        : "No flip-chip on this frame, so the lower BB and slacker angle are permanent with this wheel combo.");
    }
  }

  return { ...resolve(reasons, notes), bbHeightDeltaMm, headAngleDeltaDeg };
}
