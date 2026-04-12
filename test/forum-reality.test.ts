import { describe, it, expect } from "vitest";
import { FUEL_EX_5_2013 } from "../src/bike.js";
import { AIR_SHOCK_CATALOG } from "../src/catalog.js";
import { CONVERSION_KITS, recommendCoilConversion } from "../src/conversion.js";
import { ISAAC_96KG_EBIKE } from "../src/rider.js";
import { fromRiderProfile } from "../src/springRate.js";
import { fuelExInputs } from "./_helpers.js";

/**
 * These assertions encode the brutal reality discovered during forum
 * research: nobody has documented a completed coil conversion on the
 * 2013-2016 Trek Fuel EX DRCV Full Floater frame. The code should
 * reflect this and warn the user loudly.
 */
describe("real-world forum evidence (2013-2016 Fuel EX DRCV frame)", () => {
  it("tracks zero documented coil builds on this frame generation", () => {
    expect(FUEL_EX_5_2013.documentedCoilBuildsOnFrame).toBe(0);
  });

  it("every coil recommendation carries an EXPERIMENTAL warning", () => {
    const recs = recommendCoilConversion(
      fuelExInputs(fromRiderProfile(ISAAC_96KG_EBIKE, 0.3)),
    );
    for (const r of recs) {
      expect(
        r.notes.some((n) => n.toLowerCase().includes("experimental")),
      ).toBe(true);
    }
  });

  it("Offset Bushings Trek DRCV kit is a published SKU", () => {
    const offset = CONVERSION_KITS.find((k) =>
      k.vendors.some((v) => v.toLowerCase().includes("offsetbushings")),
    );
    expect(offset).toBeDefined();
    expect(offset?.publishedSku).toBe(true);
  });

  it("Shockcraft Deaktiv kit is a published SKU", () => {
    const shockcraft = CONVERSION_KITS.find((k) =>
      k.label.toLowerCase().includes("deaktiv"),
    );
    expect(shockcraft).toBeDefined();
    expect(shockcraft?.publishedSku).toBe(true);
  });

  it("published kits are all flagged as NOT documented for coil use", () => {
    const published = CONVERSION_KITS.filter((k) => k.publishedSku);
    expect(published.length).toBeGreaterThan(0);
    for (const k of published) {
      expect(k.documentedForCoil).toBe(false);
    }
  });

  it("metric-to-trek kits are flagged as speculative (no published vendor SKU)", () => {
    const metric = CONVERSION_KITS.filter((k) => k.family === "metric-to-trek");
    expect(metric.length).toBeGreaterThan(0);
    for (const k of metric) {
      expect(k.publishedSku).toBe(false);
    }
  });

  it("fitting recommendations with published kits still surface the coil-undocumented warning", () => {
    const recs = recommendCoilConversion(
      fuelExInputs(fromRiderProfile(ISAAC_96KG_EBIKE, 0.3)),
    );
    const withPublished = recs.filter(
      (r) => r.fit.fits && r.kit && r.kit.publishedSku,
    );
    for (const r of withPublished) {
      expect(
        r.notes.some((n) => n.toLowerCase().includes("advertised for air")),
      ).toBe(true);
    }
  });
});

describe("documented-working air shock alternative path", () => {
  it("exists as a separate catalog", () => {
    expect(AIR_SHOCK_CATALOG.length).toBeGreaterThan(0);
  });

  it("all air shocks are sized to the stock 184×50 imperial mount", () => {
    for (const s of AIR_SHOCK_CATALOG) {
      expect(s.eyeToEyeMm).toBe(184);
      expect(s.strokeMm).toBe(50);
      expect(s.upperMount.eyeletWidthMm).toBeCloseTo(39.89, 2);
      expect(s.springType).toBe("air");
    }
  });

  it("at least one inline (no piggyback) air shock exists for tight tunnels", () => {
    const inline = AIR_SHOCK_CATALOG.filter((s) => !s.hasPiggyback);
    expect(inline.length).toBeGreaterThan(0);
  });

  it("includes Fox Float X2, RS Super Deluxe, and Marzocchi Bomber Air", () => {
    const labels = AIR_SHOCK_CATALOG.map((s) => s.label.toLowerCase());
    expect(labels.some((l) => l.includes("float x2"))).toBe(true);
    expect(labels.some((l) => l.includes("super deluxe"))).toBe(true);
    expect(labels.some((l) => l.includes("bomber air"))).toBe(true);
  });
});
