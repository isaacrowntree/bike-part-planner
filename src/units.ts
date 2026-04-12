export const INCH_TO_MM = 25.4;
export const LB_PER_IN_TO_N_PER_MM = 0.175126835;
export const KG_TO_LB = 2.20462262;

export const inch = (i: number): number => i * INCH_TO_MM;
export const mm = (m: number): number => m;
export const lbIn = (r: number): number => r;
export const nMm = (r: number): number => r / LB_PER_IN_TO_N_PER_MM;

export const approxEqual = (a: number, b: number, tolerance: number): boolean =>
  Math.abs(a - b) <= tolerance;

export const withinRange = (value: number, min: number, max: number): boolean =>
  value >= min && value <= max;
