import { describe, it, expect } from "vitest";
import { checkWheelFit, type DropoutTarget, type WheelSpec } from "../src/wheel.js";

const boostRear: DropoutTarget = { position: "rear", oldMm: 148, axle: "boost15x110", wheel: "29", hubInterface: "centerlock" };
// note: rear axle would really be a rear type, but AxleType is shared; use boost marker for the test
const wheel: WheelSpec = { label: "DT 350 Boost", oldMm: 148, axle: "boost15x110", wheel: "29", hubInterface: "centerlock" };

describe("checkWheelFit", () => {
  it("matching Boost wheel fits", () => {
    expect(checkWheelFit(boostRear, wheel).fits).toBe(true);
  });
  it("non-Boost hub in a Boost frame blocks (spacing)", () => {
    const f = checkWheelFit(boostRear, { ...wheel, oldMm: 142 });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "spacing")?.severity).toBe("block");
    expect(f.notes.join(" ")).toContain("chainline");
  });
  it("wrong wheel diameter blocks", () => {
    const f = checkWheelFit(boostRear, { ...wheel, wheel: "27.5" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "diameter")?.severity).toBe("block");
  });
  it("6-bolt hub vs centerlock rotors only warns (adapter)", () => {
    const f = checkWheelFit(boostRear, { ...wheel, hubInterface: "6-bolt" });
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "rotor-interface")?.severity).toBe("warn");
  });
});
