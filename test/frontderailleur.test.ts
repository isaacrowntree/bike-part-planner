import { describe, it, expect } from "vitest";
import { checkFrontDerailleurFit, type FrameFDMount, type FrontDerailleurSpec, type FrontDrivetrain } from "../src/frontderailleur.js";

const frame: FrameFDMount = { mount: "braze-on", pull: "top" };
const fd: FrontDerailleurSpec = { label: "Deore 2x", mount: "braze-on", pull: "top", maxChainringT: 38, capacityT: 16, speed: 10 };
const dt: FrontDrivetrain = { bigRingT: 36, smallRingT: 26, speed: 10 };

describe("checkFrontDerailleurFit", () => {
  it("matching mount/pull/ring/speed fits", () => {
    expect(checkFrontDerailleurFit(frame, fd, dt).fits).toBe(true);
  });
  it("wrong mount blocks", () => {
    const f = checkFrontDerailleurFit({ ...frame, mount: "clamp-34.9" }, fd, dt);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "mount")?.severity).toBe("block");
  });
  it("wrong pull blocks", () => {
    const f = checkFrontDerailleurFit({ ...frame, pull: "bottom" }, fd, dt);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "pull")?.severity).toBe("block");
  });
  it("dual-pull suits either routing", () => {
    expect(checkFrontDerailleurFit({ ...frame, pull: "bottom" }, { ...fd, pull: "dual" }, dt).fits).toBe(true);
  });
  it("big ring over max blocks", () => {
    const f = checkFrontDerailleurFit(frame, fd, { ...dt, bigRingT: 44 });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "max-ring")?.severity).toBe("block");
  });
});
