import { describe, it, expect } from "vitest";
import { checkRotorFit, type CaliperMount, type RotorSpec } from "../src/rotor.js";

const pm160: CaliperMount = { type: "post", nativeSizeMm: 160, maxRotorMm: 203, hubInterface: "6-bolt" };
const shimano180: RotorSpec = { label: "RT66 180", sizeMm: 180, brand: "shimano", interface: "6-bolt" };

describe("checkRotorFit", () => {
  it("native-size rotor on a post mount needs no adapter", () => {
    const f = checkRotorFit(pm160, { ...shimano180, sizeMm: 160 });
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "adapter")?.detail).toContain("no adapter");
  });
  it("larger rotor gets a +20 adapter (warn, still fits)", () => {
    const f = checkRotorFit(pm160, shimano180);
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "adapter")?.severity).toBe("warn");
  });
  it("rotor over the fork rating blocks", () => {
    const f = checkRotorFit(pm160, { ...shimano180, sizeMm: 223 });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "max-size")?.severity).toBe("block");
  });
  it("below native size blocks", () => {
    const f = checkRotorFit(pm160, { ...shimano180, sizeMm: 140 });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "min-size")?.severity).toBe("block");
  });
  it("IS mount always needs an adapter", () => {
    const f = checkRotorFit({ ...pm160, type: "is" }, { ...shimano180, sizeMm: 160 });
    expect(f.reasons.find((r) => r.category === "adapter")?.severity).toBe("warn");
  });
  it("a SRAM-size rotor with the wrong-brand assumption warns", () => {
    const f = checkRotorFit({ ...pm160, maxRotorMm: 220 }, { label: "SRAM 200", sizeMm: 200, brand: "shimano", interface: "6-bolt" });
    expect(f.reasons.find((r) => r.category === "brand-adapter")?.severity).toBe("warn");
  });
  it("centerlock rotor on a 6-bolt hub warns", () => {
    const f = checkRotorFit(pm160, { ...shimano180, interface: "centerlock" });
    expect(f.reasons.find((r) => r.category === "hub-interface")?.severity).toBe("warn");
  });
});
