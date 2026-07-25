/**
 * Guided measurement — the frame/setup data manufacturers rarely publish, that
 * the component fitment modules need. Each entry is a question the UI/AI can ask
 * a rider: what to measure, how, the unit, an acceptable range, and (where it
 * applies) the discrete options to choose from. Validation rejects impossible
 * values so a mistyped "40 mm BB shell" never poisons the catalog.
 *
 * `feeds` is an exact-match list of the component checks a measurement supplies
 * (was a substring string; that let "chain" match "chainring" — an accuracy
 * bug, now fixed by exact array membership).
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
  /** Exact component-check tokens this measurement feeds. */
  feeds: readonly string[];
}

const YES_NO = ["yes", "no"] as const;

export const MEASUREMENTS: readonly MeasureSpec[] = [
  // ---- bottom bracket / crank ----
  { key: "bbShellWidthMm", label: "BB shell width", kind: "number", unit: "mm", min: 60, max: 130,
    how: "Take the wheels off and caliper across the bare bottom-bracket shell, face to face.", feeds: ["mid-drive motor", "crank"] },
  { key: "bbStandard", label: "BB standard", kind: "choice", options: ["bsa", "bsa-eccentric", "italian", "t47", "pf30", "bb30", "bb86", "bb92"],
    how: "Threaded (you can see thread on the shell faces) = BSA/T47. Smooth bore the bearings press into = press-fit.", feeds: ["mid-drive motor", "crank"] },
  { key: "crankThread", label: "Pedal thread", kind: "choice", options: ["9/16", "1/2"],
    how: "Modern 3-piece cranks are 9/16\"; 1/2\" is only on old one-piece cranks.", feeds: ["pedal"] },

  // ---- hub / axle / wheel ----
  { key: "dropoutWidthMm", label: "Rear dropout spacing", kind: "number", unit: "mm", min: 100, max: 200,
    how: "With the rear wheel out, caliper the inside gap between the dropout faces.", feeds: ["hub motor"] },
  { key: "axleType", label: "Axle type", kind: "choice", options: ["qr9", "thru15", "boost15x110", "qr15"],
    how: "A lever you flip open = quick-release. A bolt you thread through = thru-axle (note the diameter stamped on it).", feeds: ["hub motor", "fork", "wheel", "conversion"] },
  { key: "rearSpacingMm", label: "Rear hub spacing (OLD)", kind: "number", unit: "mm", min: 100, max: 200,
    how: "With the rear wheel out, caliper the inside gap between the dropout faces (over-locknut dimension).", feeds: ["wheel", "chainring"] },
  { key: "hubInterface", label: "Rotor hub interface", kind: "choice", options: ["6-bolt", "centerlock"],
    how: "Six small bolts holding the rotor = 6-bolt. A single splined lockring = Center Lock.", feeds: ["rotor", "wheel"] },

  // ---- fork / front end ----
  { key: "steererType", label: "Steerer / head tube", kind: "choice", options: ["straight", "tapered"],
    how: "Look at the fork steerer where it enters the frame: one diameter = straight (1-1/8\"); wider at the bottom = tapered (1.5\").", feeds: ["fork", "headset"] },
  { key: "headTubeLenMm", label: "Head tube length", kind: "number", unit: "mm", min: 80, max: 200,
    how: "Measure the head tube itself, top face to bottom face (not including the headset cups).", feeds: ["fork"] },
  { key: "axleToCrownMm", label: "Fork axle-to-crown", kind: "number", unit: "mm", min: 400, max: 620,
    how: "Measure from the front axle centre up to the underside of the fork crown, fork uncompressed.", feeds: ["fork"] },
  { key: "headtubeTopShis", label: "Head tube top (SHIS)", kind: "choice", options: ["ZS44/28.6", "EC34/28.6", "IS42/28.6", "EC44/28.6"],
    how: "The top headset standard, e.g. ZS44/28.6 — from the frame's spec or stamped near the head tube.", feeds: ["headset"] },
  { key: "headtubeBottomShis", label: "Head tube bottom (SHIS)", kind: "choice", options: ["ZS56/40", "EC44/40", "IS52/40", "ZS44/30", "EC44/30"],
    how: "The bottom headset standard, e.g. ZS56/40 for a tapered lower.", feeds: ["headset"] },

  // ---- rear shock ----
  { key: "shockE2EMm", label: "Rear shock eye-to-eye", kind: "number", unit: "mm", min: 100, max: 260,
    how: "Centre of the upper shock eye to centre of the lower eye — or read it off the current shock (e.g. 210).", feeds: ["rear-shock"] },
  { key: "shockStrokeMm", label: "Rear shock stroke", kind: "number", unit: "mm", min: 30, max: 75,
    how: "The shock's rated stroke, stamped on the body or in the spec (e.g. 55). Length×stroke like 210×55.", feeds: ["rear-shock"] },

  // ---- battery ----
  { key: "downtubeUsableMm", label: "Usable downtube length", kind: "number", unit: "mm", min: 150, max: 650,
    how: "Measure the straight run of the downtube where a battery case could sit, between the head tube and the BB.", feeds: ["battery"] },
  { key: "shockClearanceMm", label: "Battery-to-shock clearance", kind: "number", unit: "mm", min: 0, max: 200,
    how: "Full-sus only: measure the gap from the downtube bottle-boss line to the nearest part of the rear shock or linkage.", feeds: ["battery"] },

  // ---- dropper ----
  { key: "seatTubeIdMm", label: "Seat tube inner diameter", kind: "choice", options: ["27.2", "30.9", "31.6", "34.9"],
    how: "Pull the seatpost and read the size etched on it, or caliper the inside of the seat tube.", feeds: ["dropper"] },
  { key: "seatTubeMaxInsertMm", label: "Usable seat tube insertion", kind: "number", unit: "mm", min: 80, max: 320,
    how: "Drop a tape into the open seat tube from the collar until it stops (a kink, bottle boss, or the suspension pivot) — that's how much post the frame can swallow.", feeds: ["dropper"] },
  { key: "seatpostRouting", label: "Seatpost cable routing", kind: "choice", options: ["internal", "external"],
    how: "Look for a cable port near the seat tube / down tube: a hole the dropper cable disappears into = internal; no port = external.", feeds: ["dropper"] },
  { key: "seatpostAcceptsRail", label: "Seatpost rail clamp", kind: "choice", options: ["round-7", "oval-7x9-alloy", "oval-7x9-carbon"],
    how: "Look at your seatpost head: a round cradle = round-7; an oval cradle marked for carbon rails = carbon oval. Alloy oval otherwise.", feeds: ["saddle"] },

  // ---- tire ----
  { key: "rimInternalWidthMm", label: "Rim internal width", kind: "number", unit: "mm", min: 15, max: 60,
    how: "Caliper across the inside of the rim bed, between the bead walls (not the outer edge).", feeds: ["tire"] },
  { key: "frameMaxTireWidthMm", label: "Frame tire clearance", kind: "number", unit: "mm", min: 25, max: 120,
    how: "Measure the gap between the tire and the tightest point of the frame/fork, then add it to your current tire's measured width.", feeds: ["tire"] },

  // ---- brake rotor / caliper mount ----
  { key: "caliperMountType", label: "Caliper mount type", kind: "choice", options: ["post", "is", "flat"],
    how: "Post-mount: bolts thread vertically into the tabs. IS: two horizontal bolts through a bracket. Flat-mount: small road/gravel interface.", feeds: ["rotor"] },
  { key: "caliperNativeRotorMm", label: "Native (no-adapter) rotor size", kind: "number", unit: "mm", min: 140, max: 203,
    how: "The smallest rotor the mount takes with no adapter — often printed near the caliper tabs, or check the fork/frame spec.", feeds: ["rotor"] },
  { key: "maxRotorMm", label: "Max rotor rating", kind: "number", unit: "mm", min: 140, max: 230,
    how: "The largest rotor the fork/frame is rated for — from the fork lowers or the maker's spec.", feeds: ["rotor"] },

  // ---- brake pads ----
  { key: "caliperPadShape", label: "Caliper pad shape", kind: "choice", options: ["shimano-b01s", "shimano-g-2pot", "shimano-n-4pot", "sram-guide", "sram-code", "magura", "tektro-trp"],
    how: "Identify the caliper model printed on the body — the pad shape follows from it.", feeds: ["brakepad"] },
  { key: "caliperPistons", label: "Caliper piston count", kind: "choice", options: ["2", "4"],
    how: "Count the pistons per side (open the caliper): usually 2 (trail) or 4 (gravity).", feeds: ["brakepad"] },
  { key: "rotorResinOnly", label: "Rotor rated resin-only?", kind: "choice", options: YES_NO,
    how: "Read the rotor: many Shimano RT / entry rotors are marked 'resin pad only'.", feeds: ["brakepad"] },

  // ---- brake hose ----
  { key: "caliperFluid", label: "Brake fluid type", kind: "choice", options: ["mineral", "dot"],
    how: "Shimano/Magura are mineral oil; SRAM/Hayes are DOT — check your caliper/lever or the fill port cap.", feeds: ["brakehose"] },
  { key: "caliperFitting", label: "Hose fitting type", kind: "choice", options: ["banjo", "straight", "compression"],
    how: "Look at where the hose enters the caliper: an angled bolt-on = banjo; a straight threaded insert = straight/compression.", feeds: ["brakehose"] },
  { key: "hoseRequiredMm", label: "Hose length needed", kind: "number", unit: "mm", min: 400, max: 2200,
    how: "Route a string/tape along the intended hose path from lever to caliper and measure it.", feeds: ["brakehose"] },

  // ---- tubeless ----
  { key: "rimTubelessReady", label: "Rim tubeless-ready?", kind: "choice", options: YES_NO,
    how: "Check the rim/wheel spec for TLR / TCS / Tubeless Ready.", feeds: ["tubeless"] },
  { key: "rimHookless", label: "Hookless rim?", kind: "choice", options: YES_NO,
    how: "Look at the rim bead wall in cross-section: no inward hook lip = hookless.", feeds: ["tubeless"] },
  { key: "rimDepthMm", label: "Rim depth", kind: "number", unit: "mm", min: 15, max: 90,
    how: "Measure the rim profile depth the valve has to pass through.", feeds: ["tubeless"] },
  { key: "valveLengthMm", label: "Tubeless valve length", kind: "number", unit: "mm", min: 30, max: 90,
    how: "The valve stem length you have or plan to buy.", feeds: ["tubeless"] },

  // ---- cockpit ----
  { key: "stemBarBoreMm", label: "Stem bar clamp bore", kind: "choice", options: ["25.4", "31.8", "35"],
    how: "Caliper the centre clamp of your current bar where the stem grips it: 31.8 or 35 mm on modern bikes.", feeds: ["cockpit"] },
  { key: "steererClampMm", label: "Steerer clamp diameter", kind: "choice", options: ["28.6", "38.1"],
    how: "Almost always 28.6 mm (1-1/8\") on modern bikes; 38.1 mm (1.5\") only on some old/DH frames.", feeds: ["cockpit"] },
  { key: "barClampMm", label: "Handlebar grip-clamp diameter", kind: "choice", options: ["22.2", "31.8"],
    how: "Caliper the bar where the grips/levers clamp: 22.2 mm at the grips.", feeds: ["display"] },

  // ---- drivetrain: cassette / chain / shifter / front derailleur / chainring ----
  { key: "currentFreehubDriver", label: "Current freehub driver", kind: "choice", options: ["hg", "hg-11road", "xd", "xdr", "microspline", "campagnolo"],
    how: "The splined body the cassette slides onto: plain splines = HG; a smooth threaded core = SRAM XD/XDR; fine tall splines = Shimano Micro Spline.", feeds: ["cassette"] },
  { key: "currentDrivetrainSpeed", label: "Current drivetrain speed", kind: "number", unit: "-", min: 6, max: 13,
    how: "Count the cogs on your cassette, or read it off the shifter (e.g. '12-speed').", feeds: ["cassette", "chain", "shifter"] },
  { key: "currentDerailleurProtocol", label: "Derailleur protocol", kind: "choice", options: ["mechanical", "sram-axs", "shimano-di2"],
    how: "Cable to the derailleur = mechanical; a battery on the derailleur = electronic (SRAM AXS or Shimano Di2).", feeds: ["shifter"] },
  { key: "currentActuation", label: "Derailleur actuation", kind: "choice",
    options: ["shimano-mtb-11", "shimano-mtb-12", "shimano-road-11", "sram-exact", "sram-x-actuation", "sram-eagle", "sram-t-type"],
    how: "The cable-pull family of your current mechanical derailleur (from its model/group).", feeds: ["shifter"] },
  { key: "fdMount", label: "Front derailleur mount", kind: "choice", options: ["clamp-28.6", "clamp-31.8", "clamp-34.9", "braze-on", "direct-mount"],
    how: "A band around the seat tube = clamp (caliper its diameter); a small tab on the frame = braze-on / direct-mount.", feeds: ["frontderailleur"] },
  { key: "fdPull", label: "Front derailleur cable pull", kind: "choice", options: ["top", "bottom", "dual"],
    how: "Cable comes from above (down tube/headset routing) = top-pull; from below the BB = bottom-pull.", feeds: ["frontderailleur"] },
  { key: "currentCrankMount", label: "Chainring mount interface", kind: "choice",
    options: ["bcd-104", "bcd-96-shimano", "bcd-110-4", "bcd-107-sram", "dm-sram-3bolt", "dm-sram-8bolt", "dm-raceface-cinch", "dm-shimano"],
    how: "Bolts through a spider = BCD (measure the bolt circle); the ring mounts straight to the crank = direct-mount (note the pattern).", feeds: ["chainring"] },

  // ---- ebike conversion frame profile ----
  { key: "convMaterial", label: "Frame material", kind: "choice", options: ["alloy", "steel", "titanium", "carbon"],
    how: "Check the frame or maker's spec: aluminium/alloy, steel, titanium, or carbon.", feeds: ["conversion"] },
  { key: "convStyle", label: "Frame style", kind: "choice",
    options: ["rigid", "hardtail", "full-suspension", "road-gravel", "cargo", "fat", "folding", "step-through", "bmx-dj"],
    how: "The frame type you're converting.", feeds: ["conversion"] },
  { key: "convBrake", label: "Brake type", kind: "choice", options: ["rim", "mechanical-disc", "hydraulic-disc"],
    how: "Pads squeezing the rim = rim brakes; a rotor at the hub = disc (cable = mechanical, hose = hydraulic).", feeds: ["conversion"] },
  { key: "convFork", label: "Fork type", kind: "choice", options: ["rigid", "suspension"],
    how: "A solid fork = rigid; stanchions/telescoping legs = suspension.", feeds: ["conversion"] },
  { key: "convThreadedBB", label: "Threaded BB shell?", kind: "choice", options: YES_NO,
    how: "Threaded BSA/T47 shell (thread visible on the faces) is needed for a mid-drive; smooth press-fit isn't.", feeds: ["conversion"] },
  { key: "convBatterySpace", label: "Room for a downtube battery?", kind: "choice", options: YES_NO,
    how: "Is there a clear run on the downtube (or space in the front triangle) for a battery pack?", feeds: ["conversion"] },
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
