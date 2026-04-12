import { describe, it, expect } from "vitest";
import { FUEL_EX_5_2013, FUEL_EX_5_2013_SLOT } from "../src/bike.js";
import { AIR_SHOCK_CATALOG } from "../src/catalog.js";
import { checkShockFit, type ShockSpec } from "../src/shock.js";

const shorterStrokeShocks = AIR_SHOCK_CATALOG.filter(
  (s) => s.strokeMm < 50 && s.eyeToEyeMm === 184,
);

describe("shorter-stroke air shocks (184×44) — the pragmatic path", () => {
  it("catalog includes at least one 184×44 air shock", () => {
    expect(shorterStrokeShocks.length).toBeGreaterThan(0);
    for (const s of shorterStrokeShocks) {
      expect(s.strokeMm).toBe(44);
      expect(s.eyeToEyeMm).toBe(184);
    }
  });

  it("184×44 shocks are more available than 184×50 on the used AU market", () => {
    const shortStroke = shorterStrokeShocks.filter(
      (s) => s.auAvailability === "used-au",
    );
    expect(shortStroke.length).toBeGreaterThan(0);
    for (const s of shortStroke) {
      expect(s.auVendors.length).toBeGreaterThan(0);
    }
  });

  it("184×44 FAILS the standard fit check (stroke too short for OEM spec)", () => {
    const [shock] = shorterStrokeShocks;
    const result = checkShockFit(FUEL_EX_5_2013_SLOT, shock);
    expect(result.fits).toBe(false);
    expect(
      result.reasons.find((r) => r.category === "stroke")?.ok,
    ).toBe(false);
  });

  it("184×44 PASSES with allowShorterStroke: true", () => {
    const [shock] = shorterStrokeShocks;
    const result = checkShockFit(
      FUEL_EX_5_2013_SLOT,
      shock,
      shock.bodyLengthMm,
      shock.bodyDiameterMm,
      shock.hasPiggyback,
      { allowShorterStroke: true },
    );
    const strokeReason = result.reasons.find((r) => r.category === "stroke");
    expect(strokeReason?.ok).toBe(true);
    expect(strokeReason?.detail).toContain("shorter");
  });

  it("still rejects the upper 8mm bolt mismatch (needs Deaktiv kit)", () => {
    const [shock] = shorterStrokeShocks;
    const result = checkShockFit(
      FUEL_EX_5_2013_SLOT,
      shock,
      shock.bodyLengthMm,
      shock.bodyDiameterMm,
      shock.hasPiggyback,
      { allowShorterStroke: true },
    );
    expect(
      result.reasons.find((r) => r.category === "upper-hardware")?.ok,
    ).toBe(false);
  });

  it("calculates reduced travel correctly", () => {
    const leverage = FUEL_EX_5_2013.averageLeverageRatio;
    const reducedTravelMm = 44 * leverage;
    expect(reducedTravelMm).toBeGreaterThanOrEqual(110);
    expect(reducedTravelMm).toBeLessThanOrEqual(120);
  });

  it("Fox Float CTD DRCV 184×44 is the cheapest option (~AUD 250)", () => {
    const fox = shorterStrokeShocks.find((s) =>
      s.label.toLowerCase().includes("fox"),
    );
    expect(fox).toBeDefined();
    expect(fox?.approxAud).toBeLessThanOrEqual(300);
  });

  it("all shorter-stroke shocks have compact bodies that fit the Fuel EX tunnel", () => {
    for (const s of shorterStrokeShocks) {
      expect(s.bodyLengthMm).toBeLessThanOrEqual(
        FUEL_EX_5_2013_SLOT.clearance.maxBodyLengthMm,
      );
      expect(s.bodyDiameterMm).toBeLessThanOrEqual(
        FUEL_EX_5_2013_SLOT.clearance.maxBodyDiameterMm,
      );
      expect(s.hasPiggyback).toBe(false);
    }
  });
});
