import { describe, it, expect } from "vitest";
import { checkShifterFit, type ShifterSpec, type DerailleurMatch } from "../src/shifter.js";

describe("checkShifterFit", () => {
  it("matching mechanical actuation + speed fits", () => {
    const s: ShifterSpec = { label: "GX", protocol: "mechanical", actuation: "sram-eagle", speed: 12 };
    const rd: DerailleurMatch = { protocol: "mechanical", actuation: "sram-eagle", speed: 12 };
    expect(checkShifterFit(s, rd).fits).toBe(true);
  });
  it("mismatched actuation blocks (won't index)", () => {
    const s: ShifterSpec = { label: "XT", protocol: "mechanical", actuation: "shimano-mtb-12", speed: 12 };
    const rd: DerailleurMatch = { protocol: "mechanical", actuation: "sram-eagle", speed: 12 };
    const f = checkShifterFit(s, rd);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "actuation")?.severity).toBe("block");
  });
  it("AXS shifter can't drive a Di2 derailleur", () => {
    const s: ShifterSpec = { label: "AXS", protocol: "sram-axs", speed: 12 };
    const rd: DerailleurMatch = { protocol: "shimano-di2", speed: 12 };
    const f = checkShifterFit(s, rd);
    expect(f.fits).toBe(false);
    expect(f.notes.join(" ")).toContain("don't talk");
  });
  it("native AXS mullet (road shifter + MTB derailleur) pairs", () => {
    const s: ShifterSpec = { label: "Force AXS", protocol: "sram-axs", speed: 12 };
    const rd: DerailleurMatch = { protocol: "sram-axs", speed: 12 };
    expect(checkShifterFit(s, rd).fits).toBe(true);
  });
  it("speed mismatch blocks", () => {
    const s: ShifterSpec = { label: "11s", protocol: "mechanical", actuation: "sram-eagle", speed: 11 };
    const rd: DerailleurMatch = { protocol: "mechanical", actuation: "sram-eagle", speed: 12 };
    expect(checkShifterFit(s, rd).fits).toBe(false);
  });
});
