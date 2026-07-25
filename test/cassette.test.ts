import { describe, it, expect } from "vitest";
import { checkCassetteFit, type FreehubSpec, type CassetteSpec } from "../src/cassette.js";

describe("checkCassetteFit", () => {
  it("matching driver + speed fits", () => {
    const hub: FreehubSpec = { driver: "xd", speed: 12 };
    const cas: CassetteSpec = { label: "Eagle 10-52", driver: "xd", speed: 12, largestCogT: 52 };
    expect(checkCassetteFit(hub, cas).fits).toBe(true);
  });
  it("Eagle (XD) on an HG body blocks with driver advice", () => {
    const f = checkCassetteFit({ driver: "hg", speed: 12 }, { label: "Eagle", driver: "xd", speed: 12, largestCogT: 52 });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "driver")?.severity).toBe("block");
    expect(f.notes.join(" ")).toContain("XD");
  });
  it("Micro Spline on an HG body blocks", () => {
    const f = checkCassetteFit({ driver: "hg", speed: 11 }, { label: "XT 12s", driver: "microspline", speed: 12, largestCogT: 51 });
    expect(f.fits).toBe(false);
  });
  it("11-speed road on a plain HG body warns (needs spacer)", () => {
    const f = checkCassetteFit({ driver: "hg", speed: 11 }, { label: "105 11s", driver: "hg-11road", speed: 11, largestCogT: 32 });
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "driver")?.severity).toBe("warn");
  });
  it("speed mismatch warns about shifter/chain", () => {
    const f = checkCassetteFit({ driver: "hg", speed: 10 }, { label: "HG 11s", driver: "hg", speed: 11, largestCogT: 42 });
    expect(f.reasons.find((r) => r.category === "speed")?.severity).toBe("warn");
  });
});
