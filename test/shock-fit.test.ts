import { describe, it, expect } from "vitest";
import { FUEL_EX_5_2013_SLOT, FUEL_EX_5_2013_STOCK_SHOCK } from "../src/bike.js";
import { checkShockFit, type ShockSpec } from "../src/shock.js";

const clone = (s: ShockSpec): ShockSpec => ({
  ...s,
  upperMount: { ...s.upperMount },
  lowerMount: { ...s.lowerMount },
});

describe("checkShockFit — dimensional tolerance enforcement", () => {
  it("accepts the OEM shock as a drop-in", () => {
    const result = checkShockFit(FUEL_EX_5_2013_SLOT, FUEL_EX_5_2013_STOCK_SHOCK);
    expect(result.fits).toBe(true);
    expect(result.dropIn).toBe(true);
  });

  it("rejects a shock that is the wrong eye-to-eye length", () => {
    const wrong = clone(FUEL_EX_5_2013_STOCK_SHOCK);
    wrong.eyeToEyeMm = 190;
    const result = checkShockFit(FUEL_EX_5_2013_SLOT, wrong);
    expect(result.fits).toBe(false);
    expect(result.reasons.find((r) => r.category === "eye-to-eye")?.ok).toBe(false);
  });

  it("rejects a shock with the wrong stroke", () => {
    const wrong = clone(FUEL_EX_5_2013_STOCK_SHOCK);
    wrong.strokeMm = 47.5;
    const result = checkShockFit(FUEL_EX_5_2013_SLOT, wrong);
    expect(result.fits).toBe(false);
    expect(result.reasons.find((r) => r.category === "stroke")?.ok).toBe(false);
  });

  it("tolerates eye-to-eye within ±0.5mm (machining noise)", () => {
    const a = clone(FUEL_EX_5_2013_STOCK_SHOCK);
    a.eyeToEyeMm = 184.4;
    expect(checkShockFit(FUEL_EX_5_2013_SLOT, a).fits).toBe(true);
    a.eyeToEyeMm = 183.6;
    expect(checkShockFit(FUEL_EX_5_2013_SLOT, a).fits).toBe(true);
  });

  it("rejects metric-pin mounting (8mm upper bolt instead of 10mm)", () => {
    const wrong = clone(FUEL_EX_5_2013_STOCK_SHOCK);
    wrong.upperMount.hardwareBoltMm = 8;
    const result = checkShockFit(FUEL_EX_5_2013_SLOT, wrong);
    expect(result.fits).toBe(false);
    expect(
      result.reasons.find((r) => r.category === "upper-hardware")?.ok,
    ).toBe(false);
  });

  it("rejects a trunnion-mount shock (upper style mismatch)", () => {
    const wrong = clone(FUEL_EX_5_2013_STOCK_SHOCK);
    wrong.upperMount.style = "trunnion";
    const result = checkShockFit(FUEL_EX_5_2013_SLOT, wrong);
    expect(result.fits).toBe(false);
    expect(result.reasons.find((r) => r.category === "upper-style")?.ok).toBe(false);
  });

  it("rejects an oversized body that won't clear the seat tube", () => {
    const shock = clone(FUEL_EX_5_2013_STOCK_SHOCK);
    const result = checkShockFit(FUEL_EX_5_2013_SLOT, shock, 200, 40, false);
    expect(result.fits).toBe(false);
    expect(result.reasons.find((r) => r.category === "body-length")?.ok).toBe(false);
  });

  it("rejects a piggyback-reservoir shock when the frame has no clearance", () => {
    const shock = clone(FUEL_EX_5_2013_STOCK_SHOCK);
    const result = checkShockFit(FUEL_EX_5_2013_SLOT, shock, 140, 40, true);
    expect(result.fits).toBe(false);
    expect(result.reasons.find((r) => r.category === "reservoir")?.ok).toBe(false);
  });
});

/**
 * This is the test that lets the user feed real dimensions scraped from
 * a manufacturer's spec sheet and get a pass/fail. Treat it as a template
 * — copy the block, paste real numbers, run `npm test`.
 */
describe("example: plugging in real aftermarket shock dimensions", () => {
  it("(template) Marzocchi Bomber CR 184x50 — standard imperial pin", () => {
    const candidate: ShockSpec = {
      label: "Marzocchi Bomber CR 7.25x2.0 (as shipped)",
      eyeToEyeMm: 184,
      strokeMm: 50,
      upperMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
      lowerMount: { eyeletWidthMm: 39.89, hardwareBoltMm: 8, style: "pin" },
      springType: "coil",
    };

    const result = checkShockFit(FUEL_EX_5_2013_SLOT, candidate, 135, 40, false);

    expect(result.fits).toBe(false);
    expect(
      result.reasons.find((r) => r.category === "upper-hardware")?.ok,
    ).toBe(false);
  });
});
