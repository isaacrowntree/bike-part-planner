import { describe, it, expect } from "vitest";
import { checkConversionSuitability, type ConvFrame, type ConvKit } from "../src/frameConversion.js";

const steelHardtail: ConvFrame = {
  material: "steel", style: "hardtail", brake: "hydraulic-disc", fork: "rigid",
  axle: "qr", threadedBB: true, batteryFitsTriangle: true, weightLimitKg: 140,
};
const midKit: ConvKit = { type: "mid-drive", motorW: 500, motorTorqueNm: 95, systemAddedKg: 10, riderPlusCargoKg: 90 };

describe("checkConversionSuitability", () => {
  it("steel hardtail + mid-drive is a good candidate", () => {
    const r = checkConversionSuitability(steelHardtail, midKit);
    expect(r.fits).toBe(true);
    expect(r.tier).toBe("good");
  });

  it("carbon frame + high-torque mid-drive is a hard block", () => {
    const r = checkConversionSuitability({ ...steelHardtail, material: "carbon" }, midKit);
    expect(r.fits).toBe(false);
    expect(r.tier).toBe("unsuitable");
    expect(r.reasons.find((x) => x.category === "material")?.severity).toBe("block");
  });

  it("front hub on an alloy suspension fork is a hard block (dangerous)", () => {
    const frame: ConvFrame = { ...steelHardtail, material: "alloy", fork: "suspension" };
    const kit: ConvKit = { type: "hub-front", motorW: 500, motorTorqueNm: 45, systemAddedKg: 8, riderPlusCargoKg: 90 };
    const r = checkConversionSuitability(frame, kit);
    expect(r.fits).toBe(false);
    expect(r.reasons.find((x) => x.category === "front-hub-fork")?.severity).toBe("block");
  });

  it("mid-drive needs a threaded BB shell", () => {
    const r = checkConversionSuitability({ ...steelHardtail, threadedBB: false }, midKit);
    expect(r.fits).toBe(false);
    expect(r.reasons.find((x) => x.category === "bb-shell")?.severity).toBe("block");
  });

  it("slotted hub kit on a thru-axle frame blocks", () => {
    const kit: ConvKit = { type: "hub-rear", motorW: 500, motorTorqueNm: 45, systemAddedKg: 8, riderPlusCargoKg: 90 };
    const r = checkConversionSuitability({ ...steelHardtail, axle: "thru" }, kit);
    expect(r.fits).toBe(false);
    expect(r.reasons.find((x) => x.category === "axle")?.severity).toBe("block");
  });

  it("full-suspension with no triangle room warns (rack mount), not blocks", () => {
    const r = checkConversionSuitability(
      { ...steelHardtail, style: "full-suspension", batteryFitsTriangle: false },
      midKit,
    );
    expect(r.reasons.find((x) => x.category === "battery-space")?.severity).toBe("warn");
  });

  it("rim brakes at high power block", () => {
    const r = checkConversionSuitability({ ...steelHardtail, brake: "rim" }, midKit);
    expect(r.fits).toBe(false);
    expect(r.reasons.find((x) => x.category === "brakes")?.severity).toBe("block");
  });

  it("rider + kit over the frame weight limit blocks", () => {
    const r = checkConversionSuitability(
      { ...steelHardtail, weightLimitKg: 95 },
      { ...midKit, riderPlusCargoKg: 100, systemAddedKg: 12 },
    );
    expect(r.fits).toBe(false);
    expect(r.reasons.find((x) => x.category === "weight-limit")?.severity).toBe("block");
  });

  it("a mid-drive always warns about drivetrain wear", () => {
    const r = checkConversionSuitability(steelHardtail, midKit);
    expect(r.reasons.find((x) => x.category === "drivetrain-wear")?.severity).toBe("warn");
  });
});
