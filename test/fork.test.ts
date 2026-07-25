import { describe, it, expect } from "vitest";
import { checkForkFit, type FrameFrontEnd, type ForkSpec } from "../src/fork.js";

const frame: FrameFrontEnd = {
  steerer: "tapered",
  headTubeLenMm: 100,
  designAxleToCrownMm: 531, // ~130 mm 29er
  maxTravelMm: 140,
  wheelSize: "29",
  axle: "boost15x110",
  brakeMount: "post",
};

const stockFork: ForkSpec = {
  label: "RockShox Recon 130",
  steerer: "tapered",
  travelMm: 130,
  axleToCrownMm: 531,
  wheelSize: "29",
  axle: "boost15x110",
  brakeMount: "post",
};

describe("checkForkFit", () => {
  it("a matching fork fits cleanly", () => {
    const f = checkForkFit(frame, stockFork);
    expect(f.fits).toBe(true);
    expect(f.reasons.every((r) => r.severity !== "block")).toBe(true);
    expect(f.headAngleDeltaDeg).toBe(0);
  });

  it("a tapered steerer cannot go in a straight head tube", () => {
    const straightFrame = { ...frame, steerer: "straight" as const };
    const f = checkForkFit(straightFrame, { ...stockFork, steerer: "tapered" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "steerer")?.severity).toBe("block");
  });

  it("a straight steerer in a tapered head tube warns (needs reducer), still fits", () => {
    const f = checkForkFit(frame, { ...stockFork, steerer: "straight" });
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "steerer")?.severity).toBe("warn");
  });

  it("overforking past the frame's max travel blocks", () => {
    const f = checkForkFit(frame, { ...stockFork, travelMm: 170 });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "travel")?.severity).toBe("block");
  });

  it("axle mismatch blocks", () => {
    const f = checkForkFit(frame, { ...stockFork, axle: "qr9" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "axle")?.severity).toBe("block");
  });

  it("wheel-size mismatch blocks", () => {
    const f = checkForkFit(frame, { ...stockFork, wheelSize: "26" });
    expect(f.fits).toBe(false);
  });

  it("a longer fork reports a slacker head angle and warns on geometry", () => {
    const f = checkForkFit(frame, { ...stockFork, travelMm: 140, axleToCrownMm: 551 }); // +20 mm A-C
    expect(f.fits).toBe(true); // 140 == max, still allowed
    expect(f.headAngleDeltaDeg).toBeLessThan(0); // slacker
    expect(f.reasons.find((r) => r.category === "geometry")?.severity).toBe("warn");
  });

  it("brake-mount mismatch warns (adapter) rather than blocks", () => {
    const f = checkForkFit(frame, { ...stockFork, brakeMount: "flat" });
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "brake-mount")?.severity).toBe("warn");
  });
});
