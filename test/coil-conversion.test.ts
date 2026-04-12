import { describe, it, expect } from "vitest";
import { FUEL_EX_5_2013, FUEL_EX_5_2013_SLOT } from "../src/bike.js";
import { COIL_SHOCK_CATALOG } from "../src/catalog.js";
import {
  CONVERSION_KITS,
  applyConversionKit,
  recommendCoilConversion,
} from "../src/conversion.js";
import { checkShockFit } from "../src/shock.js";
import { estimateSpringRate, snapToAvailableSpring } from "../src/springRate.js";
import { fuelExInputs } from "./_helpers.js";

describe("spring rate estimator", () => {
  it("produces a higher quick rate than practical rate (formula sanity)", () => {
    const est = estimateSpringRate(FUEL_EX_5_2013, { riderKg: 80 });
    expect(est.quickLbIn).toBeGreaterThan(est.practicalLbIn);
  });

  it("snaps to 25 lb/in increments", () => {
    expect(snapToAvailableSpring(412)).toBe(400);
    expect(snapToAvailableSpring(413)).toBe(425);
    expect(snapToAvailableSpring(438)).toBe(450);
  });

  it("scales linearly with rider weight", () => {
    const light = estimateSpringRate(FUEL_EX_5_2013, { riderKg: 60 });
    const heavy = estimateSpringRate(FUEL_EX_5_2013, { riderKg: 100 });
    expect(heavy.practicalLbIn).toBeGreaterThan(light.practicalLbIn);
    const ratio = heavy.practicalLbIn / light.practicalLbIn;
    expect(ratio).toBeCloseTo(100 / 60, 1);
  });

  it("recommends a spring within 400–550 lb/in for a typical 80kg trail rider", () => {
    const est = estimateSpringRate(FUEL_EX_5_2013, { riderKg: 80 });
    const snapped = snapToAvailableSpring(est.practicalLbIn);
    expect(snapped).toBeGreaterThanOrEqual(400);
    expect(snapped).toBeLessThanOrEqual(550);
  });
});

describe("applyConversionKit — rehardware a catalog shock for Trek upper", () => {
  it("rewrites the upper hardware to 10mm to match the Fuel EX 5 frame", () => {
    const [marzocchi] = COIL_SHOCK_CATALOG;
    const [huber] = CONVERSION_KITS;
    const adapted = applyConversionKit(marzocchi, huber);
    expect(adapted.upperMount.hardwareBoltMm).toBe(10);
    expect(adapted.lowerMount.hardwareBoltMm).toBe(8);
  });

  it("makes an imperial coil shock fit the 2013 Fuel EX 5 frame slot", () => {
    const [marzocchi] = COIL_SHOCK_CATALOG;
    const [huber] = CONVERSION_KITS;
    const adapted = applyConversionKit(marzocchi, huber);
    const fit = checkShockFit(
      FUEL_EX_5_2013_SLOT,
      adapted,
      marzocchi.bodyLengthMm,
      marzocchi.bodyDiameterMm,
      marzocchi.hasPiggyback,
    );
    expect(fit.fits).toBe(true);
  });
});

describe("recommendCoilConversion — full pipeline", () => {
  it("returns one recommendation per catalog entry", () => {
    const recs = recommendCoilConversion(fuelExInputs({ riderKg: 80 }));
    expect(recs).toHaveLength(COIL_SHOCK_CATALOG.length);
  });

  it("flags reservoir-equipped shocks as problematic on this tight frame", () => {
    const recs = recommendCoilConversion(fuelExInputs({ riderKg: 80 }));
    const withPiggyback = recs.filter((r) => r.shock.hasPiggyback);
    expect(withPiggyback.length).toBeGreaterThan(0);
    for (const r of withPiggyback) {
      expect(r.notes.some((n) => n.toLowerCase().includes("piggyback"))).toBe(true);
    }
  });

  it("finds at least one drop-in-with-kit option for a typical rider", () => {
    const recs = recommendCoilConversion(fuelExInputs({ riderKg: 80 }));
    const fitting = recs.filter((r) => r.fit.fits && r.springInRange);
    expect(fitting.length).toBeGreaterThan(0);
  });

  it("every fitting recommendation has a conversion kit (no bare drop-ins)", () => {
    const recs = recommendCoilConversion(fuelExInputs({ riderKg: 80 }));
    const fitting = recs.filter((r) => r.fit.fits);
    for (const r of fitting) {
      expect(r.kit).not.toBeNull();
    }
  });
});
