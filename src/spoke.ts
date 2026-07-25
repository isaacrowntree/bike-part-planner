/**
 * Spoke length calculator — high "calculator" search intent, distinct from
 * wheelset fitment. Uses the standard geometric formula from the effective rim
 * diameter (ERD), the hub flange PCD and its offset from centre, the spoke
 * count, and the cross pattern. A wheel is laced per-side (left/right differ on
 * a dished wheel), so this computes one side at a time.
 */
export interface SpokeInputs {
  erdMm: number; // effective rim diameter
  flangePcdMm: number; // pitch circle diameter of the flange holes
  flangeOffsetMm: number; // centre-of-hub to this flange
  spokeCount: number; // total spokes in the wheel (e.g. 32)
  cross: number; // lacing cross (0–4)
  spokeHoleDiaMm?: number; // rim eyelet hole, default 2.6
}

/** Spoke length (mm) for one flange, rounded to the nearest mm. */
export function spokeLengthMm(i: SpokeInputs): number {
  const r = i.flangePcdMm / 2;
  const R = i.erdMm / 2;
  const f = i.flangeOffsetMm;
  const holesPerSide = i.spokeCount / 2;
  const angle = (2 * Math.PI * i.cross) / holesPerSide;
  const l = Math.sqrt(r * r + R * R + f * f - 2 * r * R * Math.cos(angle)) - (i.spokeHoleDiaMm ?? 2.6) / 2;
  return Math.round(l);
}
