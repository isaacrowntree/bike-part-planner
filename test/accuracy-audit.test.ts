/**
 * Accuracy audit — pins the encoded real-world standards and the exact
 * pass→warn→block boundaries, so a future edit that silently shifts a
 * threshold or a standard's value fails loudly. This is deliberately separate
 * from the per-module happy-path tests: those prove the logic runs; this proves
 * the NUMBERS are right and the transitions land on the correct side.
 */
import { describe, it, expect } from "vitest";
import {
  BSD, NATIVE_SPINDLE, THREADED_BB, isThreadedBB, chainlineTarget, chainlineFromOffset,
  type BBStandard,
} from "../src/standards.js";
import { checkEbikeLegal } from "../src/ebikeLegal.js";
import { checkConversionSuitability, type ConvFrame, type ConvKit } from "../src/frameConversion.js";
import { checkRotorFit, type CaliperMount } from "../src/rotor.js";
import { checkDropperFit, type SeatTube } from "../src/dropper.js";
import { checkTireFit, type FrameTireClearance } from "../src/tire.js";
import { MEASUREMENTS } from "../src/measure.js";

const sev = (f: { reasons: readonly { category: string; severity: string }[] }, cat: string) =>
  f.reasons.find((r) => r.category === cat)?.severity;

/* ================= standards constants ================= */

describe("standards: bead-seat diameters", () => {
  it("match ISO", () => {
    expect(BSD).toMatchObject({ "26": 559, "27.5": 584, "29": 622, "700c": 622 });
  });
});

describe("standards: BB shell native spindle + threading", () => {
  it("native spindle per shell", () => {
    expect(NATIVE_SPINDLE).toMatchObject({
      bsa: "24", "bsa-eccentric": "24", italian: "24", t47: "30",
      pf30: "30", bb30: "30", bb86: "24", bb92: "24",
    });
  });
  it("only BSA/BSA-ecc/Italian/T47 are threaded", () => {
    expect([...THREADED_BB].sort()).toEqual(["bsa", "bsa-eccentric", "italian", "t47"]);
    for (const s of ["pf30", "bb30", "bb86", "bb92"] as BBStandard[]) expect(isThreadedBB(s)).toBe(false);
    for (const s of ["bsa", "t47"] as BBStandard[]) expect(isThreadedBB(s)).toBe(true);
  });
});

describe("standards: chainline", () => {
  it("Boost (≥148) → 52 mm, else 49 mm — boundary at 148", () => {
    expect(chainlineTarget(142)).toBe(49);
    expect(chainlineTarget(147)).toBe(49);
    expect(chainlineTarget(148)).toBe(52);
    expect(chainlineTarget(157)).toBe(52);
  });
  it("direct-mount offset → chainline: 6→49, 3→52, 0→55", () => {
    expect(chainlineFromOffset(6)).toBe(49);
    expect(chainlineFromOffset(3)).toBe(52);
    expect(chainlineFromOffset(0)).toBe(55);
  });
});

/* ================= ebike legality boundaries ================= */

describe("ebike legality: EU/AU 250 W / 25 km/h boundaries", () => {
  const base = { assistCutoffKmh: 25, hasThrottle: false };
  it("250 W legal, 251 W not", () => {
    expect(checkEbikeLegal("eu", { ...base, motorNominalW: 250 }).fits).toBe(true);
    expect(checkEbikeLegal("eu", { ...base, motorNominalW: 251 }).fits).toBe(false);
  });
  it("25 km/h legal, 26 km/h not", () => {
    expect(checkEbikeLegal("au", { motorNominalW: 250, hasThrottle: false, assistCutoffKmh: 25 }).fits).toBe(true);
    expect(checkEbikeLegal("au", { motorNominalW: 250, hasThrottle: false, assistCutoffKmh: 26 }).fits).toBe(false);
  });
});

describe("ebike legality: US 750 W + class speeds", () => {
  it("750 W legal, 751 W → motor vehicle", () => {
    expect(checkEbikeLegal("us", { motorNominalW: 750, assistCutoffKmh: 32, hasThrottle: true }).fits).toBe(true);
    const over = checkEbikeLegal("us", { motorNominalW: 751, assistCutoffKmh: 32, hasThrottle: true });
    expect(over.fits).toBe(false);
    expect(over.classification).toContain("motor vehicle");
  });
  it("pedal-assist 28 mph (45 km/h) is Class 3; throttle at 45 is out of class", () => {
    expect(checkEbikeLegal("us", { motorNominalW: 500, assistCutoffKmh: 45, hasThrottle: false }).classification).toContain("Class 3");
    expect(checkEbikeLegal("us", { motorNominalW: 500, assistCutoffKmh: 45, hasThrottle: true }).fits).toBe(false);
  });
});

/* ================= frame-conversion thresholds ================= */

const steelHardtail: ConvFrame = {
  material: "steel", style: "hardtail", brake: "hydraulic-disc", fork: "rigid",
  axle: "qr", threadedBB: true, batteryFitsTriangle: true,
};
const hub = (motorW: number, extra: Partial<ConvKit> = {}): ConvKit =>
  ({ type: "hub-rear", motorW, motorTorqueNm: 45, systemAddedKg: 8, riderPlusCargoKg: 90, ...extra });

describe("frame-conversion: torque-arm thresholds (250/500/750 W)", () => {
  it("steel rear hub: optional ≤250 W, advised ≥500 W", () => {
    expect(sev(checkConversionSuitability(steelHardtail, hub(250)), "torque-arm")).toBe("ok");
    expect(sev(checkConversionSuitability(steelHardtail, hub(500)), "torque-arm")).toBe("warn");
    expect(sev(checkConversionSuitability(steelHardtail, hub(750)), "torque-arm")).toBe("warn");
  });
  it("aluminium dropouts want a torque arm even at low power", () => {
    const alloy = { ...steelHardtail, material: "alloy" as const };
    expect(sev(checkConversionSuitability(alloy, hub(250)), "torque-arm")).toBe("warn");
  });
});

describe("frame-conversion: carbon + mid-drive torque wall (80 Nm)", () => {
  const mid = (torque: number): ConvKit => ({ type: "mid-drive", motorW: 500, motorTorqueNm: torque, systemAddedKg: 10, riderPlusCargoKg: 90 });
  const carbon = { ...steelHardtail, material: "carbon" as const };
  it("≥80 Nm blocks, <80 Nm is a (softer) material warning not a hard material block", () => {
    expect(sev(checkConversionSuitability(carbon, mid(80)), "material")).toBe("block");
    expect(sev(checkConversionSuitability(carbon, mid(79)), "material")).toBe("warn");
  });
});

describe("frame-conversion: rim-brake power boundary (500 W)", () => {
  const rim = { ...steelHardtail, brake: "rim" as const };
  it("<500 W warns, ≥500 W blocks", () => {
    expect(sev(checkConversionSuitability(rim, hub(499)), "brakes")).toBe("warn");
    expect(sev(checkConversionSuitability(rim, hub(500)), "brakes")).toBe("block");
  });
});

/* ================= rotor adapter boundaries ================= */

describe("rotor: native / +adapter / min / max boundaries", () => {
  const pm160: CaliperMount = { type: "post", nativeSizeMm: 160, maxRotorMm: 203, hubInterface: "6-bolt" };
  const rotor = (sizeMm: number) => ({ label: `${sizeMm}`, sizeMm, brand: "shimano" as const, interface: "6-bolt" as const });
  it("at native = no adapter; above = adapter warn; below native / above max = block", () => {
    expect(sev(checkRotorFit(pm160, rotor(160)), "adapter")).toBe("ok");
    expect(sev(checkRotorFit(pm160, rotor(180)), "adapter")).toBe("warn");
    expect(sev(checkRotorFit(pm160, rotor(140)), "min-size")).toBe("block");
    expect(sev(checkRotorFit(pm160, rotor(203)), "adapter")).toBe("warn"); // exactly max is allowed
    expect(sev(checkRotorFit(pm160, rotor(220)), "max-size")).toBe("block");
  });
});

/* ================= dropper shim direction ================= */

describe("dropper: diameter shims UP only", () => {
  const tube: SeatTube = { idMm: 31.6, maxInsertMm: 230, routing: "internal" };
  const post = (diameterMm: 30.9 | 31.6 | 34.9) => ({ label: "", diameterMm, travelMm: 150, insertionLengthMm: 180, routing: "internal" as const });
  it("30.9→31.6 shim (warn), 31.6 exact (ok), 34.9 in 31.6 (block)", () => {
    expect(sev(checkDropperFit(tube, post(30.9)), "diameter")).toBe("warn");
    expect(sev(checkDropperFit(tube, post(31.6)), "diameter")).toBe("ok");
    expect(sev(checkDropperFit(tube, post(34.9)), "diameter")).toBe("block");
  });
});

/* ================= tire mounted-width model ================= */

describe("tire: mounted width grows on a wide rim", () => {
  it("a 61 mm-label tire measures ~63 mm on a 30 mm internal rim", () => {
    // 30 mm rim leaves exactly 63 mm clearance → mounted ~63 → 0 mm spare → warn (not block)
    const frame: FrameTireClearance = { wheel: "29", maxTireWidthMm: 63, rimInternalWidthMm: 30 };
    expect(sev(checkTireFit(frame, { label: "", wheel: "29", widthMm: 61 }), "clearance")).toBe("warn");
    // one more mm of label width and it fouls
    const f2 = checkTireFit(frame, { label: "", wheel: "29", widthMm: 62 });
    expect(sev(f2, "clearance")).toBe("block");
  });
});

/* ================= guided-measurement ↔ engine consistency ================= */

describe("measure: choice options stay in sync with the engine", () => {
  const opts = (key: string) => MEASUREMENTS.find((m) => m.key === key)!.options!;
  it("bbStandard options exactly equal the shells the engine knows", () => {
    expect([...opts("bbStandard")].sort()).toEqual(Object.keys(NATIVE_SPINDLE).sort());
  });
  it("every measurement has at least one feed and (for choices) options", () => {
    for (const m of MEASUREMENTS) {
      expect(m.feeds.length).toBeGreaterThan(0);
      if (m.kind === "choice") expect((m.options ?? []).length).toBeGreaterThan(0);
    }
  });
  it("feed tokens are exact — 'chain' must not pull in 'chainring' keys", () => {
    const chainKeys = MEASUREMENTS.filter((m) => m.feeds.includes("chain")).map((m) => m.key);
    const chainringKeys = MEASUREMENTS.filter((m) => m.feeds.includes("chainring")).map((m) => m.key);
    expect(chainKeys).not.toContain("currentCrankMount"); // a chainring-only key
    expect(chainringKeys).toContain("currentCrankMount");
  });
});
