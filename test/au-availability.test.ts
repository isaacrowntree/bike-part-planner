import { describe, it, expect } from "vitest";
import { COIL_SHOCK_CATALOG, SPRING_CATALOG } from "../src/catalog.js";
import { CONVERSION_KITS, recommendCoilConversion } from "../src/conversion.js";
import { fuelExInputs } from "./_helpers.js";

describe("Australian sourcing", () => {
  it("every catalog shock declares AU availability and at least one vendor", () => {
    for (const s of COIL_SHOCK_CATALOG) {
      expect(s.auAvailability).toBeDefined();
      expect(s.auVendors.length).toBeGreaterThan(0);
    }
  });

  it("no imperial 184×50 coil shock is available new from an AU retailer", () => {
    const newInAu = COIL_SHOCK_CATALOG.filter(
      (s) => s.auAvailability === "new-au-retail",
    );
    expect(newInAu).toHaveLength(0);
  });

  it("at least one shock path is reachable (used or import) in AU", () => {
    const reachable = COIL_SHOCK_CATALOG.filter(
      (s) =>
        s.auAvailability === "used-au" || s.auAvailability === "import-only",
    );
    expect(reachable.length).toBeGreaterThan(0);
  });

  it("at least one conversion kit ships to AU (NZ / UK / US)", () => {
    const shipping = CONVERSION_KITS.filter(
      (k) => k.auAvailability === "import-only",
    );
    expect(shipping.length).toBeGreaterThanOrEqual(3);
  });

  it("offers both imperial and metric family conversion kits", () => {
    const imperial = CONVERSION_KITS.filter(
      (k) => k.family === "imperial-to-trek",
    );
    const metric = CONVERSION_KITS.filter(
      (k) => k.family === "metric-to-trek",
    );
    expect(imperial.length).toBeGreaterThan(0);
    expect(metric.length).toBeGreaterThan(0);
  });

  it("metric conversion kits include a negative eye-to-eye compensation", () => {
    const metric = CONVERSION_KITS.filter(
      (k) => k.family === "metric-to-trek",
    );
    for (const k of metric) {
      expect(k.eyeToEyeAdjustmentMm).toBeDefined();
      expect(k.eyeToEyeAdjustmentMm).toBeLessThan(0);
    }
  });

  it("includes Shockcraft NZ as the closest-region reducer source", () => {
    const shockcraft = CONVERSION_KITS.find((k) =>
      k.vendors.some((v) => v.toLowerCase().includes("shockcraft")),
    );
    expect(shockcraft).toBeDefined();
  });

  it("VALT progressive spring is stocked new at AU retail", () => {
    const auSprings = SPRING_CATALOG.filter(
      (s) => s.auAvailability === "new-au-retail" && s.progressive,
    );
    expect(auSprings.length).toBeGreaterThan(0);
    expect(
      auSprings.every((s) =>
        s.auVendors.some((v) => /MTB Direct|Dirt Works|Empire/i.test(v)),
      ),
    ).toBe(true);
  });

  it("every recommendation is flagged auAvailable unless genuinely unobtainable", () => {
    const recs = recommendCoilConversion(fuelExInputs({ riderKg: 80 }));
    for (const r of recs) {
      if (r.shock.auAvailability === "unobtainable") {
        expect(r.auAvailable).toBe(false);
      } else {
        expect(r.auAvailable).toBe(true);
      }
    }
  });

  it("at least one fitting recommendation is AU-reachable for a typical rider", () => {
    const recs = recommendCoilConversion(fuelExInputs({ riderKg: 80 }));
    const usable = recs.filter(
      (r) => r.fit.fits && r.springInRange && r.auAvailable,
    );
    expect(usable.length).toBeGreaterThan(0);
  });
});
