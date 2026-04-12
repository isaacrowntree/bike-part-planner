import { describe, it, expect } from "vitest";
import { FUEL_EX_5_2013 } from "../src/bike.js";
import {
  BAFANG_BBS02_52V_15AH,
  ISAAC_96KG_EBIKE,
  effectiveLoadKg,
} from "../src/rider.js";
import { estimateSpringRate, fromRiderProfile } from "../src/springRate.js";
import { COIL_SHOCK_CATALOG, SPRING_CATALOG } from "../src/catalog.js";
import { recommendCoilConversion } from "../src/conversion.js";
import { fuelExInputs } from "./_helpers.js";

describe("Isaac's 96kg Bafang Fuel EX 5 rider profile", () => {
  it("captures rider weight, gear, and the ebike conversion", () => {
    expect(ISAAC_96KG_EBIKE.riderKg).toBe(96);
    expect(ISAAC_96KG_EBIKE.ebike).toBeDefined();
    expect(ISAAC_96KG_EBIKE.ebike?.motorKg).toBeGreaterThan(3);
    expect(ISAAC_96KG_EBIKE.ebike?.batteryKg).toBeGreaterThan(4);
    expect(ISAAC_96KG_EBIKE.ebike?.motorTorqueNm).toBeGreaterThanOrEqual(100);
  });

  it("returns rear-wheel mass (includes ebike contribution and torque bump)", () => {
    const effective = effectiveLoadKg(ISAAC_96KG_EBIKE);
    const riderOnlyRear = (ISAAC_96KG_EBIKE.riderKg + ISAAC_96KG_EBIKE.gearKg) * 0.58;
    expect(effective).toBeGreaterThan(riderOnlyRear);
  });

  it("applies the 3kg high-torque correction when torque ≥ 100 Nm", () => {
    const withHighTorque = effectiveLoadKg(ISAAC_96KG_EBIKE);
    const withLowTorque = effectiveLoadKg({
      ...ISAAC_96KG_EBIKE,
      ebike: {
        ...BAFANG_BBS02_52V_15AH,
        motorTorqueNm: 60,
      },
    });
    expect(withHighTorque).toBeGreaterThan(withLowTorque);
    expect(withHighTorque - withLowTorque).toBeCloseTo(3, 1);
  });
});

describe("ebike spring rate targeting", () => {
  it("targets ~630 lb/in for Isaac's 96kg Bafang build", () => {
    const inputs = fromRiderProfile(ISAAC_96KG_EBIKE, 0.3);
    const est = estimateSpringRate(FUEL_EX_5_2013, inputs);
    expect(est.practicalLbIn).toBeGreaterThanOrEqual(580);
    expect(est.practicalLbIn).toBeLessThanOrEqual(680);
  });

  it("a 96kg ebike needs a stiffer spring than an 80kg trail rider", () => {
    const ebike = estimateSpringRate(
      FUEL_EX_5_2013,
      fromRiderProfile(ISAAC_96KG_EBIKE, 0.3),
    );
    const trail = estimateSpringRate(FUEL_EX_5_2013, { riderKg: 80 });
    expect(ebike.practicalLbIn).toBeGreaterThan(trail.practicalLbIn);
    expect(ebike.practicalLbIn - trail.practicalLbIn).toBeGreaterThan(100);
  });
});

describe("real-world April 2026 stock status", () => {
  it("only Push ElevenSix is marked inProduction in imperial 7.25×2.0", () => {
    const imperialNew = COIL_SHOCK_CATALOG.filter(
      (s) =>
        s.inProduction &&
        s.eyeToEyeMm === 184 &&
        s.strokeMm === 50 &&
        s.upperMount.eyeletWidthMm === 39.89,
    );
    expect(imperialNew).toHaveLength(1);
    expect(imperialNew[0].label.toLowerCase()).toContain("push");
  });

  it("Push ElevenSix exists as a catalog entry for the ebike build", () => {
    const push = COIL_SHOCK_CATALOG.find((s) =>
      s.label.toLowerCase().includes("push"),
    );
    expect(push).toBeDefined();
    expect(push?.approxUsd).toBeGreaterThan(1000);
    expect(push?.auVendors.some((v) => v.toLowerCase().includes("push"))).toBe(
      true,
    );
  });

  it("VALT Progressive is correctly modelled at 45mm stroke (not 50mm)", () => {
    const progressive = SPRING_CATALOG.filter((s) => s.progressive);
    expect(progressive.length).toBeGreaterThan(0);
    for (const s of progressive) {
      expect(s.strokeMm).toBe(45);
      expect(s.fits50mmShock).toBe(true);
    }
  });

  it("Sprindex 55mm is flagged as not fitting a 50mm shock", () => {
    const sprindex = SPRING_CATALOG.find((s) =>
      s.label.toLowerCase().includes("sprindex"),
    );
    expect(sprindex).toBeDefined();
    expect(sprindex?.fits50mmShock).toBe(false);
  });

  it("at least one spring in the 550–700 lb/in window fits a 50mm shock", () => {
    const usable = SPRING_CATALOG.filter(
      (s) =>
        s.fits50mmShock && s.rateLbIn >= 550 && s.rateLbIn <= 700,
    );
    expect(usable.length).toBeGreaterThan(0);
  });
});

describe("full ebike pipeline", () => {
  it("Push ElevenSix fits the Fuel EX 5 after imperial conversion kit", () => {
    const recs = recommendCoilConversion(
      fuelExInputs(fromRiderProfile(ISAAC_96KG_EBIKE, 0.3)),
    );
    const push = recs.find((r) => r.shock.label.toLowerCase().includes("push"));
    expect(push).toBeDefined();
    expect(push?.fit.fits).toBe(true);
    expect(push?.kit).not.toBeNull();
  });

  it("ebike rider's target spring falls inside Push ElevenSix's rated range", () => {
    const recs = recommendCoilConversion(
      fuelExInputs(fromRiderProfile(ISAAC_96KG_EBIKE, 0.3)),
    );
    const push = recs.find((r) => r.shock.label.toLowerCase().includes("push"));
    expect(push?.springInRange).toBe(true);
  });
});
