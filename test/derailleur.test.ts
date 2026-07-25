import { describe, it, expect } from "vitest";
import { checkDerailleurFit, type DerailleurSpec, type Drivetrain } from "../src/derailleur.js";

const gxEagle: DerailleurSpec = { label: "GX Eagle", maxCogT: 52, capacityT: 42, actuation: "sram-eagle", mount: "hanger" };
const eagleDt: Drivetrain = { bigCogT: 52, smallCogT: 10, shifterActuation: "sram-eagle", frameMount: "hanger" };

describe("checkDerailleurFit", () => {
  it("matching 1x12 Eagle drivetrain fits", () => {
    expect(checkDerailleurFit(gxEagle, eagleDt).fits).toBe(true);
  });
  it("a cog bigger than the max blocks", () => {
    const f = checkDerailleurFit({ ...gxEagle, maxCogT: 50 }, eagleDt);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "max-cog")?.severity).toBe("block");
  });
  it("mismatched actuation ratio blocks (won't index)", () => {
    const f = checkDerailleurFit(gxEagle, { ...eagleDt, shifterActuation: "shimano-mtb-12" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "actuation")?.severity).toBe("block");
  });
  it("T-Type (UDH) derailleur on a hanger frame blocks", () => {
    const f = checkDerailleurFit({ ...gxEagle, actuation: "sram-t-type", mount: "udh" }, { ...eagleDt, shifterActuation: "sram-t-type", frameMount: "hanger" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "mount")?.severity).toBe("block");
  });
  it("over-capacity wrap warns but does not block", () => {
    const f = checkDerailleurFit(gxEagle, { bigCogT: 50, smallCogT: 10, bigRingT: 36, smallRingT: 24, shifterActuation: "sram-eagle", frameMount: "hanger" });
    expect(f.reasons.find((r) => r.category === "capacity")?.severity).toBe("warn");
  });
});
