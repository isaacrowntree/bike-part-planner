import { describe, it, expect } from "vitest";
import { checkBrakeHose, type CaliperHydraulic, type HoseSpec } from "../src/brakehose.js";

const caliper: CaliperHydraulic = { label: "Shimano SLX", fluid: "mineral", fitting: "banjo" };
const hose: HoseSpec = { label: "Shimano hose", fluid: "mineral", fitting: "banjo", lengthMm: 1000 };

describe("checkBrakeHose", () => {
  it("matching fluid + fitting + long enough fits", () => {
    expect(checkBrakeHose(caliper, hose, 850).fits).toBe(true);
  });
  it("DOT hose in a mineral system is a hard block", () => {
    const f = checkBrakeHose(caliper, { ...hose, fluid: "dot" }, 850);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "fluid")?.severity).toBe("block");
  });
  it("wrong fitting blocks", () => {
    const f = checkBrakeHose(caliper, { ...hose, fitting: "straight" }, 850);
    expect(f.fits).toBe(false);
  });
  it("too-short hose blocks", () => {
    const f = checkBrakeHose(caliper, { ...hose, lengthMm: 700 }, 850);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "length")?.severity).toBe("block");
  });
});
