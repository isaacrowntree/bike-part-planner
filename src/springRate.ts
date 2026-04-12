import type { BikeSuspension } from "./bike.js";
import type { RiderProfile } from "./rider.js";
import { effectiveLoadKg } from "./rider.js";
import { INCH_TO_MM, KG_TO_LB } from "./units.js";

export interface SpringRateInputs {
  /** Rider weight in kg, fully kitted (helmet, pack, shoes). */
  riderKg: number;
  /** Desired sag as fraction of stroke. 0.28 – 0.32 is typical for trail. */
  targetSagFraction?: number;
  /**
   * Fraction of the rider's static weight that sits on the rear wheel at
   * neutral, flat-ground stance. Trail bikes are roughly 0.55–0.62. This is
   * the factor most quick calculators omit, and it is the reason the
   * textbook formula overshoots real-world spring choices by ~40%.
   */
  rearWeightDistribution?: number;
  /**
   * Optional full rider profile. If supplied, rider mass + ebike mass
   * correction overrides `riderKg`. Use `fromRiderProfile()` as a helper.
   */
  profile?: RiderProfile;
}

/**
 * Build SpringRateInputs from a full rider profile. When a profile has
 * an ebike conversion, `effectiveLoadKg()` already computes the true
 * rear-wheel mass (applying per-component rear shares), so we set
 * `rearWeightDistribution: 1.0` to prevent the spring rate formula from
 * applying the share a second time.
 */
export const fromRiderProfile = (
  profile: RiderProfile,
  targetSagFraction = 0.3,
): SpringRateInputs => ({
  riderKg: effectiveLoadKg(profile),
  profile,
  targetSagFraction,
  rearWeightDistribution: profile.ebike ? 1.0 : undefined,
});

export interface SpringRateEstimate {
  /** Theoretical rate using the "Fox quick" formula (usually too stiff). */
  quickLbIn: number;
  /** More realistic rate using rear-weight-distribution correction. */
  practicalLbIn: number;
  /** ±15% window for picking an off-the-shelf spring. */
  acceptableRangeLbIn: readonly [number, number];
  /** Assumptions used. */
  assumptions: {
    riderLb: number;
    sagFraction: number;
    leverageRatio: number;
    rearWeightDistribution: number;
    strokeIn: number;
  };
}

export const estimateSpringRate = (
  bike: BikeSuspension,
  inputs: SpringRateInputs,
): SpringRateEstimate => {
  const sag = inputs.targetSagFraction ?? 0.3;
  const rearShare = inputs.rearWeightDistribution ?? 0.58;
  const effectiveKg = inputs.profile
    ? effectiveLoadKg(inputs.profile)
    : inputs.riderKg;
  const riderLb = effectiveKg * KG_TO_LB;
  const strokeIn = bike.stockShock.strokeMm / INCH_TO_MM;
  const leverage = bike.averageLeverageRatio;

  const quickLbIn = (riderLb * leverage) / (strokeIn * sag);
  const practicalLbIn = (riderLb * rearShare * leverage) / (strokeIn * sag);

  const min = Math.round(practicalLbIn * 0.85);
  const max = Math.round(practicalLbIn * 1.15);

  return {
    quickLbIn: Math.round(quickLbIn),
    practicalLbIn: Math.round(practicalLbIn),
    acceptableRangeLbIn: [min, max],
    assumptions: {
      riderLb: Math.round(riderLb),
      sagFraction: sag,
      leverageRatio: leverage,
      rearWeightDistribution: rearShare,
      strokeIn: Math.round(strokeIn * 100) / 100,
    },
  };
};

/**
 * Common coil spring rates are produced in 25 or 50 lb/in steps.
 * Snap a calculated rate to the nearest available spring so we can
 * recommend something the user can actually buy.
 */
export const snapToAvailableSpring = (lbIn: number): number => {
  const step = 25;
  return Math.round(lbIn / step) * step;
};
