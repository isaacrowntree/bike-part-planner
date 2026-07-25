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
    how: "A lever you flip open = quick-release. A bolt you thread through = thru-axle (note the diameter stamped on it).", feeds: "hub motor / fork wheel" },
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
  { key: "seatTubeIdMm", label: "Seat tube inner diameter", kind: "choice", options: ["27.2", "30.9", "31.6", "34.9"],
    how: "Pull the seatpost and read the size etched on it, or caliper the inside of the seat tube.", feeds: "dropper" },
  { key: "seatTubeMaxInsertMm", label: "Usable seat tube insertion", kind: "number", unit: "mm", min: 80, max: 320,
    how: "Drop a tape into the open seat tube from the collar until it stops (a kink, bottle boss, or the suspension pivot) — that's how much post the frame can swallow.", feeds: "dropper" },
  { key: "seatpostRouting", label: "Seatpost cable routing", kind: "choice", options: ["internal", "external"],
    how: "Look for a cable port on the frame near the seat tube / down tube: a hole the dropper cable disappears into = internal; no port = external.", feeds: "dropper" },

  // tire clearance
  { key: "rimInternalWidthMm", label: "Rim internal width", kind: "number", unit: "mm", min: 15, max: 60,
    how: "Caliper across the inside of the rim bed, between the bead walls (not the outer edge).", feeds: "tire" },
  { key: "frameMaxTireWidthMm", label: "Frame tire clearance", kind: "number", unit: "mm", min: 25, max: 120,
    how: "Measure the gap between the tire and the tightest point of the frame/fork (chainstay bridge, seatstay, or fork arch), then add it to your current tire's measured width.", feeds: "tire" },

  // brake rotor / caliper mount
  { key: "caliperMountType", label: "Caliper mount type", kind: "choice", options: ["post", "is", "flat"],
    how: "Post-mount: bolts thread vertically into the frame/fork tabs. IS: two horizontal bolts through a bracket. Flat-mount: small road/gravel interface.", feeds: "rotor" },
  { key: "caliperNativeRotorMm", label: "Native (no-adapter) rotor size", kind: "number", unit: "mm", min: 140, max: 203,
    how: "The smallest rotor the mount takes with no adapter — often printed near the caliper tabs, or check the fork/frame spec.", feeds: "rotor" },
  { key: "maxRotorMm", label: "Max rotor rating", kind: "number", unit: "mm", min: 140, max: 230,
    how: "The largest rotor the fork/frame is rated for — from the fork lowers or the maker's spec.", feeds: "rotor" },
  { key: "hubInterface", label: "Rotor hub interface", kind: "choice", options: ["6-bolt", "centerlock"],
    how: "Six small bolts holding the rotor = 6-bolt. A single splined lockring = Center Lock.", feeds: "rotor wheel" },

  // wheel / hub
  { key: "rearSpacingMm", label: "Rear hub spacing (OLD)", kind: "number", unit: "mm", min: 100, max: 200,
    how: "With the rear wheel out, caliper the inside gap between the dropout faces (over-locknut dimension).", feeds: "wheel" },

  // cockpit
  { key: "stemBarBoreMm", label: "Stem bar clamp bore", kind: "choice", options: ["25.4", "31.8", "35"],
    how: "Caliper the centre clamp of your current bar where the stem grips it: 31.8 or 35 mm on modern bikes.", feeds: "cockpit" },
  { key: "steererClampMm", label: "Steerer clamp diameter", kind: "choice", options: ["28.6", "38.1"],
    how: "Almost always 28.6 mm (1-1/8\") on modern bikes; 38.1 mm (1.5\") only on some old/DH frames.", feeds: "cockpit" },

  // saddle / seatpost head
  { key: "seatpostAcceptsRail", label: "Seatpost rail clamp", kind: "choice", options: ["round-7", "oval-7x9-alloy", "oval-7x9-carbon"],
    how: "Look at your seatpost head: a round cradle = round-7; an oval cradle marked for carbon rails = carbon oval. Alloy oval otherwise.", feeds: "saddle" },

  // drivetrain (current setup, for a part-vs-part check)
  { key: "currentFreehubDriver", label: "Current freehub driver", kind: "choice", options: ["hg", "hg-11road", "xd", "xdr", "microspline", "campagnolo"],
    how: "The splined body the cassette slides onto: plain splines = HG; a smooth threaded core = SRAM XD/XDR; fine tall splines = Shimano Micro Spline.", feeds: "cassette" },
  { key: "currentDrivetrainSpeed", label: "Current drivetrain speed", kind: "number", unit: "-", min: 6, max: 13,
    how: "Count the cogs on your cassette, or read it off the shifter (e.g. '12-speed').", feeds: "cassette chain" },
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
