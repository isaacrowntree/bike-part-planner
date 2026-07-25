/**
 * Guided measurement — the frame data manufacturers rarely publish, that the
 * component fitment modules need. Each entry is a question the UI/AI can ask a
 * rider: what to measure, how, the unit, an acceptable range, and (where it
 * applies) the discrete options to choose from. Validation rejects impossible
 * values so a mistyped "40 mm BB shell" never poisons the catalog.
 */
export type MeasureKind = "number" | "choice";

export interface MeasureSpec {
  key: string;
  label: string;
  kind: MeasureKind;
  unit?: string;
  /** Plain-language how-to for the rider (calipers / tape / photo). */
  how: string;
  min?: number;
  max?: number;
  options?: readonly string[];
  /** Which component fitment this measurement feeds. */
  feeds: string;
}

export const MEASUREMENTS: readonly MeasureSpec[] = [
  { key: "bbShellWidthMm", label: "BB shell width", kind: "number", unit: "mm", min: 60, max: 130,
    how: "Take the wheels off and caliper across the bare bottom-bracket shell, face to face.", feeds: "mid-drive motor" },
  { key: "bbStandard", label: "BB standard", kind: "choice", options: ["bsa", "bsa-eccentric", "t47", "pf30", "bb92", "bb30"],
    how: "Threaded (you can see thread on the shell faces) = BSA/T47. Smooth bore that the bearings press into = press-fit.", feeds: "mid-drive motor" },
  { key: "dropoutWidthMm", label: "Rear dropout spacing", kind: "number", unit: "mm", min: 100, max: 200,
    how: "With the rear wheel out, caliper the inside gap between the dropout faces.", feeds: "hub motor" },
  { key: "axleType", label: "Axle type", kind: "choice", options: ["qr9", "thru15", "boost15x110", "qr15"],
    how: "A lever you flip open = quick-release. A bolt you thread through = thru-axle (note the diameter stamped on it).", feeds: "hub motor / fork" },
  { key: "steererType", label: "Steerer / head tube", kind: "choice", options: ["straight", "tapered"],
    how: "Look at the fork steerer where it enters the frame: one diameter = straight (1-1/8\"); wider at the bottom = tapered (1.5\").", feeds: "fork" },
  { key: "headTubeLenMm", label: "Head tube length", kind: "number", unit: "mm", min: 80, max: 200,
    how: "Measure the head tube itself, top face to bottom face (not including the headset cups).", feeds: "fork" },
  { key: "axleToCrownMm", label: "Fork axle-to-crown", kind: "number", unit: "mm", min: 400, max: 620,
    how: "Measure from the front axle centre up to the underside of the fork crown, fork uncompressed.", feeds: "fork geometry" },
  { key: "downtubeUsableMm", label: "Usable downtube length", kind: "number", unit: "mm", min: 150, max: 650,
    how: "Measure the straight run of the downtube where a battery case could sit, between the head tube and the BB.", feeds: "battery" },
  { key: "shockClearanceMm", label: "Battery-to-shock clearance", kind: "number", unit: "mm", min: 0, max: 200,
    how: "Full-sus only: measure the gap from the downtube bottle-boss line to the nearest part of the rear shock or linkage.", feeds: "battery" },
  { key: "barClampMm", label: "Handlebar clamp diameter", kind: "choice", options: ["22.2", "31.8"],
    how: "Caliper the bar where the grips/levers clamp: 22.2 mm at the grips; 31.8 mm at the stem centre.", feeds: "display / levers" },
  { key: "rotorSizeMm", label: "Current brake rotor size", kind: "number", unit: "mm", min: 140, max: 220,
    how: "Read the size printed on the rotor, or measure its diameter.", feeds: "brakes" },
] as const;

export const measurementByKey = (key: string): MeasureSpec | undefined =>
  MEASUREMENTS.find((m) => m.key === key);

export interface Validation { ok: boolean; message?: string; value?: number | string }

/** Validate a rider's answer against the spec — reject the impossible. */
export function validateMeasurement(key: string, raw: unknown): Validation {
  const spec = measurementByKey(key);
  if (!spec) return { ok: false, message: `unknown measurement "${key}"` };
  if (spec.kind === "choice") {
    const v = String(raw);
    return spec.options!.includes(v)
      ? { ok: true, value: v }
      : { ok: false, message: `choose one of: ${spec.options!.join(", ")}` };
  }
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!isFinite(n)) return { ok: false, message: "enter a number" };
  if (spec.min !== undefined && n < spec.min) return { ok: false, message: `${n}${spec.unit ?? ""} is below the plausible minimum (${spec.min}${spec.unit ?? ""}) — re-measure` };
  if (spec.max !== undefined && n > spec.max) return { ok: false, message: `${n}${spec.unit ?? ""} is above the plausible maximum (${spec.max}${spec.unit ?? ""}) — re-measure` };
  return { ok: true, value: n };
}

/** Which measurements a given component check still needs, given what's known. */
export function missingFor(feed: string, known: Record<string, unknown>): MeasureSpec[] {
  return MEASUREMENTS.filter((m) => m.feeds.includes(feed) && (known[m.key] === undefined || known[m.key] === null));
}
