import { describe, it, expect } from "vitest";
import { checkForkFit, type ForkSpec, type FrameFrontEnd } from "./fork.js";

const frame = (over: Partial<FrameFrontEnd> = {}): FrameFrontEnd => ({
  steerer: "tapered", headTubeLenMm: 110, designAxleToCrownMm: 551,
  maxTravelMm: 140, wheelSize: "29", axle: "boost15x110", brakeMount: "post", ...over,
});
const fork = (over: Partial<ForkSpec> = {}): ForkSpec => ({
  label: "Fork", steerer: "tapered", travelMm: 160, axleToCrownMm: 571,
  wheelSize: "29", axle: "boost15x110", brakeMount: "post", ...over,
});

describe("checkForkFit — travel ceiling", () => {
  it("blocks an overforking fork when the frame's max travel is known", () => {
    const r = checkForkFit(frame({ maxTravelMm: 120 }), fork({ travelMm: 160 }));
    expect(r.reasons.find((x) => x.category === "travel")!.severity).toBe("block");
    expect(r.fits).toBe(false);
  });
  it("passes when travel is within the known max", () => {
    const r = checkForkFit(frame({ maxTravelMm: 170 }), fork({ travelMm: 160 }));
    expect(r.reasons.find((x) => x.category === "travel")!.severity).toBe("ok");
  });
  it("does NOT emit a false travel pass when the frame max travel is unknown", () => {
    const r = checkForkFit(frame({ maxTravelMm: undefined }), fork({ travelMm: 200 }));
    expect(r.reasons.some((x) => x.category === "travel")).toBe(false); // unevaluated, not a green pass
    expect(r.notes.join(" ")).toMatch(/travel/i);
  });
});

describe("checkForkFit — brake mount", () => {
  it("warns on a mount mismatch when the frame mount is known", () => {
    const r = checkForkFit(frame({ brakeMount: "flat" }), fork({ brakeMount: "post" }));
    expect(r.reasons.find((x) => x.category === "brake-mount")!.severity).toBe("warn");
  });
  it("does not verify the mount when the frame's mount is unknown (no false pass)", () => {
    const r = checkForkFit(frame({ brakeMount: undefined }), fork({ brakeMount: "post" }));
    expect(r.reasons.some((x) => x.category === "brake-mount")).toBe(false);
    expect(r.notes.join(" ")).toMatch(/brake mount/i);
  });
});
