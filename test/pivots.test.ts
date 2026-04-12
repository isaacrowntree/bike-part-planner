import { describe, it, expect } from "vitest";
import {
  FUEL_EX_5_2013_BEARINGS,
  FUEL_EX_5_2013_PIVOT_KITS,
  FUEL_EX_5_2013_PIVOT_PARTS,
  PIVOT_HEALTH_CHECK,
  shouldRebuildPivots,
} from "../src/pivots.js";

/**
 * These assertions encode the pivot hardware documented in Trek's
 * service PDF (docs/2013_fuel_ex_5_6_7.pdf). If any fail, the PDF and
 * the code have drifted — re-read the PDF.
 */
describe("Trek Fuel EX 5 (2013) pivot hardware from service PDF", () => {
  it("documents the four bearing sizes used in the rear triangle", () => {
    const designations = FUEL_EX_5_2013_BEARINGS.map((b) => b.designation);
    expect(designations).toContain("6903-2RS");
    expect(designations).toContain("6800-2RS");
    expect(designations).toContain("6900-2RS");
    expect(designations).toContain("MR1728LLU");
  });

  it("6903-2RS is 17×30×7mm (main pivot bearing)", () => {
    const b = FUEL_EX_5_2013_BEARINGS.find((x) => x.designation === "6903-2RS");
    expect(b).toBeDefined();
    expect(b?.idMm).toBe(17);
    expect(b?.odMm).toBe(30);
    expect(b?.widthMm).toBe(7);
  });

  it("captures the main pivot kit (Trek 427337) and ABP kit (427344)", () => {
    expect(FUEL_EX_5_2013_PIVOT_KITS.mainPivot.trekPartNumber).toBe("427337");
    expect(FUEL_EX_5_2013_PIVOT_KITS.abpConvert.trekPartNumber).toBe("427344");
  });

  it("documents torque specs for every bolted pivot part", () => {
    const bolted = FUEL_EX_5_2013_PIVOT_PARTS.filter((p) =>
      p.description.toLowerCase().startsWith("bolt") ||
      p.description.toLowerCase().startsWith("nut"),
    );
    const withTorque = bolted.filter((p) => p.torque);
    expect(withTorque.length).toBeGreaterThan(0);
  });

  it("includes the rocker-to-seat-stay bolt at 17 Nm (W301451)", () => {
    const w = FUEL_EX_5_2013_PIVOT_PARTS.find(
      (p) => p.trekPartNumber === "W301451",
    );
    expect(w).toBeDefined();
    expect(w?.torque).toBe("17 Nm");
  });
});

describe("pivot health check procedure", () => {
  it("has four steps with concrete actions and fail signals", () => {
    expect(PIVOT_HEALTH_CHECK).toHaveLength(4);
    for (const step of PIVOT_HEALTH_CHECK) {
      expect(step.action.length).toBeGreaterThan(10);
      expect(step.failSignal.length).toBeGreaterThan(10);
    }
  });

  it("steps are numbered 1..4 in order", () => {
    expect(PIVOT_HEALTH_CHECK.map((s) => s.step)).toEqual([1, 2, 3, 4]);
  });
});

describe("shouldRebuildPivots — ebike-aware threshold", () => {
  it("zero failures: don't rebuild (either build type)", () => {
    expect(shouldRebuildPivots(0, false)).toBe(false);
    expect(shouldRebuildPivots(0, true)).toBe(false);
  });

  it("one failure on non-ebike: don't rebuild (yet)", () => {
    expect(shouldRebuildPivots(1, false)).toBe(false);
  });

  it("one failure on ebike: REBUILD (stricter threshold)", () => {
    expect(shouldRebuildPivots(1, true)).toBe(true);
  });

  it("two failures: rebuild regardless of build type", () => {
    expect(shouldRebuildPivots(2, false)).toBe(true);
    expect(shouldRebuildPivots(2, true)).toBe(true);
  });
});
