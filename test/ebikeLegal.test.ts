import { describe, it, expect } from "vitest";
import { checkEbikeLegal, type EbikeSetup } from "../src/ebikeLegal.js";

const legalEu: EbikeSetup = { motorNominalW: 250, assistCutoffKmh: 25, hasThrottle: false };

describe("checkEbikeLegal — EU/AU", () => {
  it("250 W / 25 km/h / no throttle is EPAC-compliant", () => {
    const r = checkEbikeLegal("eu", legalEu);
    expect(r.fits).toBe(true);
    expect(r.classification).toBe("EPAC-compliant");
  });
  it("500 W blocks in the EU", () => {
    const r = checkEbikeLegal("eu", { ...legalEu, motorNominalW: 500 });
    expect(r.fits).toBe(false);
    expect(r.reasons.find((x) => x.category === "power")?.severity).toBe("block");
  });
  it("a throttle blocks EPAC compliance", () => {
    const r = checkEbikeLegal("au", { ...legalEu, hasThrottle: true });
    expect(r.fits).toBe(false);
    expect(r.reasons.find((x) => x.category === "throttle")?.severity).toBe("block");
  });
  it("assist over 25 km/h blocks", () => {
    const r = checkEbikeLegal("au", { ...legalEu, assistCutoffKmh: 32 });
    expect(r.fits).toBe(false);
  });
});

describe("checkEbikeLegal — US", () => {
  it("750 W throttle at 20 mph is Class 2", () => {
    const r = checkEbikeLegal("us", { motorNominalW: 750, assistCutoffKmh: 32, hasThrottle: true });
    expect(r.fits).toBe(true);
    expect(r.classification).toContain("Class 2");
  });
  it("pedal-assist 28 mph is Class 3", () => {
    const r = checkEbikeLegal("us", { motorNominalW: 500, assistCutoffKmh: 45, hasThrottle: false });
    expect(r.fits).toBe(true);
    expect(r.classification).toContain("Class 3");
  });
  it("over 750 W is a motor vehicle", () => {
    const r = checkEbikeLegal("us", { motorNominalW: 1000, assistCutoffKmh: 32, hasThrottle: true });
    expect(r.fits).toBe(false);
    expect(r.classification).toContain("motor vehicle");
  });
  it("throttle above 20 mph exceeds class ceiling", () => {
    const r = checkEbikeLegal("us", { motorNominalW: 750, assistCutoffKmh: 45, hasThrottle: true });
    expect(r.fits).toBe(false);
  });
});
