/**
 * Pivot hardware and rebuild guidance for the 2013-14 Trek Fuel EX 5/6/7.
 *
 * Source: docs/2013_fuel_ex_5_6_7.pdf (Trek Service Information, Suspension
 * Assembly). All part numbers, bearing sizes, and torque values here are
 * copied directly from that service document.
 *
 * You do NOT need to rebuild pivots to swap the shock — it is independent
 * maintenance. But on a 13-year-old frame being converted to an ebike,
 * the bearing loads increase materially and failed pivots will destroy
 * the new shock's eye hardware. Run the health check below before
 * committing. If any step fails, rebuild before the ebike build.
 */

export interface BearingSpec {
  designation: string;
  idMm: number;
  odMm: number;
  widthMm: number;
  /** Quantity used on the frame. */
  qty: number;
}

export interface PivotPart {
  trekPartNumber: string;
  description: string;
  qty: number;
  torque?: string;
}

export const FUEL_EX_5_2013_BEARINGS: readonly BearingSpec[] = [
  { designation: "6903-2RS", idMm: 17, odMm: 30, widthMm: 7, qty: 2 },
  { designation: "6800-2RS", idMm: 10, odMm: 19, widthMm: 5, qty: 4 },
  { designation: "6900-2RS", idMm: 10, odMm: 22, widthMm: 6, qty: 2 },
  { designation: "MR1728LLU", idMm: 17, odMm: 28, widthMm: 6, qty: 2 },
];

export const FUEL_EX_5_2013_PIVOT_PARTS: readonly PivotPart[] = [
  {
    trekPartNumber: "W282876",
    description: "Bolt, M8×1.25×54mm",
    qty: 1,
    torque: "85 in-lb",
  },
  {
    trekPartNumber: "W290375",
    description: "Axle, M10×1.5×73.6mm, 17mm OD shaft (main pivot)",
    qty: 1,
  },
  {
    trekPartNumber: "W290376",
    description: "Nut, M16×1.5, 7mm thick (main pivot)",
    qty: 1,
    torque: "300 in-lb",
  },
  {
    trekPartNumber: "W291021",
    description: "Axle, M10×1.5×84mm (rocker pivot)",
    qty: 1,
  },
  {
    trekPartNumber: "W301451",
    description: "Bolt, M10×1.0×18mm (rocker to seat stay)",
    qty: 2,
    torque: "17 Nm",
  },
  {
    trekPartNumber: "W284029",
    description: "Nut, M10×1.5, 7mm thick",
    qty: 1,
    torque: "150 in-lb",
  },
  {
    trekPartNumber: "W291639",
    description: "Nut, M10×1.5, 7.5mm thick (mates to seat stay)",
    qty: 2,
    torque: "90 in-lb",
  },
  {
    trekPartNumber: "W292129",
    description: "Axle, M10×1.0×17mm",
    qty: 2,
    torque: "10 Nm",
  },
];

export const FUEL_EX_5_2013_PIVOT_KITS = {
  mainPivot: {
    trekPartNumber: "427337",
    description:
      "Technical Trail / All Mountain Main Pivot Kit — main pivot axle, nut, 2× 6903-2RS bearings, washers",
    approxUsd: 45,
  },
  abpConvert: {
    trekPartNumber: "427344",
    description:
      "ABP Convert 135×5 Pivot Kit — ABP pivot bolts, nut, 2× MR1728LLU bearings, washers",
    approxUsd: 65,
  },
  abpConvertAlt: {
    trekPartNumber: "427343",
    description: "ABP Convert Pivot Kit (alternate configuration)",
  },
} as const;

export interface PivotHealthCheckStep {
  step: number;
  action: string;
  failSignal: string;
}

/**
 * The four-step test to decide whether you need a pivot rebuild before
 * the shock swap + ebike build. Run all four with the bike on a stand.
 */
export const PIVOT_HEALTH_CHECK: readonly PivotHealthCheckStep[] = [
  {
    step: 1,
    action:
      "Remove the rear shock (upper M10 + lower M8 bolts — torque values in FUEL_EX_5_2013_PIVOT_PARTS)",
    failSignal: "bolts are seized or rounded — stop and lubricate before proceeding",
  },
  {
    step: 2,
    action:
      "With the shock removed, cycle the rear triangle through full travel by hand",
    failSignal:
      "grinding, binding, stiction, or a 'notchy' feel anywhere in the stroke → pivot bearings are shot",
  },
  {
    step: 3,
    action:
      "Grab the rear wheel with the frame held still, push/pull laterally",
    failSignal:
      "audible clunk or visible side-to-side play → bearings have radial wear or axles loose",
  },
  {
    step: 4,
    action:
      "Lift the bike by the saddle, rock it, bounce on the pedals while watching/listening",
    failSignal:
      "creaks, chirps, or dry squeaks under load → bearings are running dry",
  },
];

/**
 * Threshold rule: zero failures → ride it, monitor. One or more failures
 * on an ebike-destined frame → rebuild with 427337 + 427344 kits before
 * installing the new shock.
 */
export const shouldRebuildPivots = (failedSteps: number, ebike: boolean): boolean => {
  if (ebike) return failedSteps >= 1;
  return failedSteps >= 2;
};
