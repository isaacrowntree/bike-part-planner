import { describe, it, expect } from "vitest";
import { spokeLengthMm, type SpokeInputs } from "../src/spoke.js";

// A typical 32h 29er rear, drive side.
const base: SpokeInputs = { erdMm: 602, flangePcdMm: 45, flangeOffsetMm: 20, spokeCount: 32, cross: 3 };

describe("spokeLengthMm", () => {
  it("gives a plausible spoke length for a real wheel", () => {
    const l = spokeLengthMm(base);
    expect(l).toBeGreaterThan(280);
    expect(l).toBeLessThan(310);
  });
  it("radial (0-cross) is shorter than 3-cross", () => {
    expect(spokeLengthMm({ ...base, cross: 0 })).toBeLessThan(spokeLengthMm({ ...base, cross: 3 }));
  });
  it("a larger ERD needs longer spokes", () => {
    expect(spokeLengthMm({ ...base, erdMm: 560 })).toBeLessThan(spokeLengthMm({ ...base, erdMm: 602 }));
  });
  it("more flange offset (more dish) lengthens the spoke slightly", () => {
    expect(spokeLengthMm({ ...base, flangeOffsetMm: 15 })).toBeLessThanOrEqual(spokeLengthMm({ ...base, flangeOffsetMm: 30 }));
  });
});
