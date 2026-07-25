import { describe, it, expect } from "vitest";
import { checkCockpitFit, type StemSpec, type BarSpec } from "../src/cockpit.js";

const stem: StemSpec = { label: "50 mm", barBoreMm: 35, steererClampMm: 28.6, carbonRated: true };
const bar: BarSpec = { label: "carbon 800", clampMm: 35, material: "carbon" };

describe("checkCockpitFit", () => {
  it("matching 35 mm bore + steerer + carbon-rated fits", () => {
    expect(checkCockpitFit(stem, bar, 28.6).fits).toBe(true);
  });
  it("31.8 bar in a 35 stem blocks (no shim)", () => {
    const f = checkCockpitFit(stem, { ...bar, clampMm: 31.8 }, 28.6);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "bar-bore")?.severity).toBe("block");
  });
  it("steerer clamp mismatch blocks", () => {
    const f = checkCockpitFit(stem, bar, 38.1);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "steerer")?.severity).toBe("block");
  });
  it("carbon bar in a non-carbon-rated stem warns", () => {
    const f = checkCockpitFit({ ...stem, carbonRated: false }, bar, 28.6);
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "carbon")?.severity).toBe("warn");
  });
});
