import { describe, it, expect } from "vitest";
import { checkMidDriveFit, checkHubFit, type MidDriveSpec, type FrameBB, type HubMotorSpec, type FrameDropout } from "../src/motor.js";

const bbs02: MidDriveSpec = { label: "Bafang BBS02", fitsBB: ["bsa", "t47"], shellWidthMm: [68, 73], powerW: 750, torqueNm: 120 };
const threadedBB: FrameBB = { standard: "bsa", shellWidthMm: 73, material: "alloy" };

describe("checkMidDriveFit", () => {
  it("threaded BSA 73 mm alloy shell takes the BBS02 directly", () => {
    const f = checkMidDriveFit(threadedBB, bbs02);
    expect(f.fits).toBe(true);
  });
  it("press-fit shell blocks (needs adapter / may be impossible)", () => {
    const f = checkMidDriveFit({ standard: "bb92", shellWidthMm: 92, material: "alloy" }, bbs02);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "bb-standard")?.severity).toBe("block");
  });
  it("unsupported shell width blocks", () => {
    const f = checkMidDriveFit({ ...threadedBB, shellWidthMm: 100 }, bbs02);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "shell-width")?.severity).toBe("block");
  });
  it("carbon shell + high-torque mid-drive warns but does not block", () => {
    const f = checkMidDriveFit({ ...threadedBB, material: "carbon" }, bbs02);
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "frame-load")?.severity).toBe("warn");
    expect(f.notes.length).toBeGreaterThan(0);
  });
});

const rearHub: HubMotorSpec = { label: "500 W rear hub", position: "rear", dropoutWidthMm: 135, axle: "qr9", wheelSize: "27.5", powerW: 500 };
const rearDropout: FrameDropout = { position: "rear", widthMm: 135, axle: "qr9", wheelSize: "27.5", material: "alloy" };

describe("checkHubFit", () => {
  it("matching rear hub fits, torque arm advised at 500 W", () => {
    const f = checkHubFit(rearDropout, rearHub);
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "torque-arm")?.severity).toBe("warn");
  });
  it("dropout-width mismatch blocks", () => {
    const f = checkHubFit({ ...rearDropout, widthMm: 148 }, rearHub);
    expect(f.fits).toBe(false);
  });
  it("wheel-size mismatch warns (re-lace), does not block", () => {
    const f = checkHubFit({ ...rearDropout, wheelSize: "29" }, rearHub);
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "wheel")?.severity).toBe("warn");
  });
  it("front hub on alloy suspension fork gets the strong dropout-failure warning", () => {
    const frontHub: HubMotorSpec = { ...rearHub, position: "front", powerW: 350 };
    const frontDrop: FrameDropout = { ...rearDropout, position: "front", widthMm: 100, axle: "qr9" };
    const f = checkHubFit(frontDrop, { ...frontHub, dropoutWidthMm: 100 });
    expect(f.reasons.find((r) => r.category === "torque-arm")?.severity).toBe("warn");
    expect(f.notes.join(" ")).toContain("failure point");
  });
});
