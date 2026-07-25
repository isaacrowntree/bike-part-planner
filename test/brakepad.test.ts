import { describe, it, expect } from "vitest";
import { checkBrakePadFit, type CaliperSpec, type PadSpec } from "../src/brakepad.js";

const caliper: CaliperSpec = { label: "Shimano SLX 4-pot", padShape: "shimano-n-4pot", pistons: 4 };
const pad: PadSpec = { label: "N03A resin", shape: "shimano-n-4pot", pistons: 4, compound: "resin" };

describe("checkBrakePadFit", () => {
  it("matching shape + pistons fits", () => {
    expect(checkBrakePadFit(caliper, pad).fits).toBe(true);
  });
  it("wrong pad shape blocks", () => {
    const f = checkBrakePadFit(caliper, { ...pad, shape: "shimano-b01s" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "shape")?.severity).toBe("block");
  });
  it("2-piston pad in a 4-piston caliper blocks", () => {
    const f = checkBrakePadFit(caliper, { ...pad, pistons: 2 });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "pistons")?.severity).toBe("block");
  });
  it("sintered pads on a resin-only rotor block", () => {
    const f = checkBrakePadFit({ ...caliper, rotorResinOnly: true }, { ...pad, compound: "sintered" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "compound")?.severity).toBe("block");
  });
});
