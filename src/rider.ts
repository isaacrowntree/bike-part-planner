/**
 * Rider profiles. Add your own here and feed them into
 * recommendCoilConversion() — the spring rate calculator will pick the
 * right coil for the rider + build combination.
 */

export interface EbikeConversion {
  /** Motor kit mass in kg. */
  motorKg: number;
  /** Battery + mount mass in kg. */
  batteryKg: number;
  /** Display, wiring loom, controller add-ons. */
  ancillariesKg: number;
  /**
   * Torque rating at the motor output in Nm. Ebikes loaded through the
   * drivetrain apply spikes through the rear suspension on hard climbs
   * and tech features, so a high-torque motor needs a slightly stiffer
   * spring to avoid excessive dynamic sag.
   */
  motorTorqueNm: number;
  label: string;
}

export interface RiderProfile {
  label: string;
  riderKg: number;
  /** Riding kit: helmet, pack, shoes, hydration, tools. */
  gearKg: number;
  ebike?: EbikeConversion;
}

export const BAFANG_BBS02_52V_15AH: EbikeConversion = {
  label:
    "Bafang BBS02 mid-drive + 52V 15Ah / 780Wh (Polly PVC, 21700 cells, 35A BMS)",
  motorKg: 4.1,
  batteryKg: 4.8,
  ancillariesKg: 0.6,
  motorTorqueNm: 120,
};

export const ISAAC_96KG_EBIKE: RiderProfile = {
  label: "Isaac — 96kg rider on Bafang BBS02 ebike Fuel EX 5",
  riderKg: 96,
  gearKg: 4,
  ebike: BAFANG_BBS02_52V_15AH,
};

/**
 * Rear-wheel static load seen by the rear shock (kg).
 *
 * For non-ebike riders, the formula would simply be
 *     rider × rearWeightShare
 * and the spring rate calculator would apply that share. But for ebike
 * builds the ebike mass has a DIFFERENT rear-weight distribution than
 * the rider (motor at BB ≈ 50%, battery on downtube ≈ 35%, rider
 * ≈ 58%), so we can't use a single rearShare multiplier on the total.
 *
 * Instead, this function pre-computes the actual rear-wheel load:
 *   - rider+gear × 0.58 (trail-bike rider rear weight share)
 *   - ebike mass × 0.45 (motor near BB + battery slightly forward)
 *   - +3 kg for high-torque mid-drives (chainline shock loading)
 *
 * The caller (`fromRiderProfile`) passes `rearWeightDistribution: 1.0`
 * to the spring rate calculator, preventing a double multiplication.
 */
const RIDER_REAR_SHARE = 0.58;
const EBIKE_REAR_SHARE = 0.45;
const HIGH_TORQUE_BUMP_KG = 3;
const HIGH_TORQUE_THRESHOLD_NM = 100;

export const effectiveLoadKg = (rider: RiderProfile): number => {
  const riderRear = (rider.riderKg + rider.gearKg) * RIDER_REAR_SHARE;
  if (!rider.ebike) return riderRear;

  const ebikeMass =
    rider.ebike.motorKg + rider.ebike.batteryKg + rider.ebike.ancillariesKg;
  const ebikeRear = ebikeMass * EBIKE_REAR_SHARE;
  const torqueBump =
    rider.ebike.motorTorqueNm >= HIGH_TORQUE_THRESHOLD_NM
      ? HIGH_TORQUE_BUMP_KG
      : 0;
  return riderRear + ebikeRear + torqueBump;
};
