import { describe, it, expect } from "vitest";
import { checkTubeless, type RimTubeless, type TireTubeless, type ValveSpec } from "../src/tubeless.js";

const rim: RimTubeless = { tubelessReady: true, hookless: false, internalWidthMm: 30, depthMm: 20 };
const tire: TireTubeless = { label: "Aggressor TLR", tubelessReady: true, widthMm: 61 };
const valve: ValveSpec = { lengthMm: 44 };

describe("checkTubeless", () => {
  it("TLR rim + tire + hooked + long valve fits, recommends sealant", () => {
    const r = checkTubeless(rim, tire, valve);
    expect(r.fits).toBe(true);
    expect(r.recommendedSealantMl).toBeGreaterThan(30);
  });
  it("a non-TLR tire is a safety block", () => {
    const r = checkTubeless(rim, { ...tire, tubelessReady: false }, valve);
    expect(r.fits).toBe(false);
    expect(r.reasons.find((x) => x.category === "bead")?.severity).toBe("block");
  });
  it("hookless rim + unapproved tire blocks", () => {
    const r = checkTubeless({ ...rim, hookless: true }, tire, valve);
    expect(r.fits).toBe(false);
    expect(r.reasons.find((x) => x.category === "hookless")?.severity).toBe("block");
  });
  it("hookless rim + approved tire warns about pressure", () => {
    const r = checkTubeless({ ...rim, hookless: true, hooklessMaxPsi: 30 }, { ...tire, hooklessApproved: true }, valve);
    expect(r.fits).toBe(true);
    expect(r.reasons.find((x) => x.category === "hookless")?.severity).toBe("warn");
  });
  it("a short valve warns", () => {
    const r = checkTubeless({ ...rim, depthMm: 40 }, tire, { lengthMm: 44 });
    expect(r.reasons.find((x) => x.category === "valve")?.severity).toBe("warn");
  });
});
