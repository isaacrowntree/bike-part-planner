import { describe, it, expect } from "vitest";
import {
  FUEL_EX_5_2013,
  FUEL_EX_5_2013_STOCK_SHOCK,
  FUEL_EX_5_2013_SLOT,
} from "../src/bike.js";

/**
 * These assertions encode the OEM rear shock specification for the
 * 2013 Trek Fuel EX 5 exactly as Trek publishes it in their "Rear Shock
 * Fitment Chart 1997-2022". If any of these fail, the model is wrong.
 */
describe("Trek Fuel EX 5 (2013) — OEM rear shock specification", () => {
  it("is a 26-inch bike with 130mm of rear wheel travel (2013 redesign)", () => {
    expect(FUEL_EX_5_2013.wheelSize).toBe('"');
    expect(FUEL_EX_5_2013.rearWheelTravelMm).toBe(130);
  });

  it("uses a 184mm eye-to-eye × 50.8mm stroke (bore label reads '184x51' = 2.0 inches)", () => {
    expect(FUEL_EX_5_2013_STOCK_SHOCK.eyeToEyeMm).toBe(184);
    expect(FUEL_EX_5_2013_STOCK_SHOCK.strokeMm).toBeCloseTo(50.8, 1);
  });

  it("has an average leverage ratio of 2.60:1 (130mm travel / 50mm stroke)", () => {
    expect(FUEL_EX_5_2013.averageLeverageRatio).toBeCloseTo(2.6, 2);
  });

  it("ships as a RockShox Monarch RT3 from the factory (not a Fox)", () => {
    expect(FUEL_EX_5_2013_STOCK_SHOCK.label.toLowerCase()).toContain(
      "monarch",
    );
  });

  it("has a 39.89mm (1.570\") upper eyelet with a 10mm mounting bolt", () => {
    const upper = FUEL_EX_5_2013_STOCK_SHOCK.upperMount;
    expect(upper.eyeletWidthMm).toBeCloseTo(39.89, 2);
    expect(upper.hardwareBoltMm).toBe(10);
    expect(upper.style).toBe("pin");
  });

  it("has a 39.89mm (1.570\") lower eyelet with an 8mm mounting bolt", () => {
    const lower = FUEL_EX_5_2013_STOCK_SHOCK.lowerMount;
    expect(lower.eyeletWidthMm).toBeCloseTo(39.89, 2);
    expect(lower.hardwareBoltMm).toBe(8);
    expect(lower.style).toBe("pin");
  });

  it("ships as an air shock from the factory", () => {
    expect(FUEL_EX_5_2013_STOCK_SHOCK.springType).toBe("air");
  });

  it("exposes a frame slot with documented clearance limits", () => {
    const c = FUEL_EX_5_2013_SLOT.clearance;
    expect(c.maxBodyLengthMm).toBeGreaterThan(0);
    expect(c.maxBodyDiameterMm).toBeGreaterThan(0);
    expect(typeof c.piggybackOk).toBe("boolean");
  });
});
