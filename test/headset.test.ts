import { describe, it, expect } from "vitest";
import { checkHeadsetFit, type FrameHeadtube, type HeadsetSpec } from "../src/headset.js";

const frame: FrameHeadtube = { topShis: "ZS44/28.6", bottomShis: "ZS56/40" };
const headset: HeadsetSpec = { label: "Cane Creek 40", topShis: "ZS44/28.6", bottomShis: "ZS56/40", crownRaceSeatMm: 40 };

describe("checkHeadsetFit", () => {
  it("matching SHIS top/bottom + tapered fork fits", () => {
    expect(checkHeadsetFit(frame, headset, "tapered").fits).toBe(true);
  });
  it("wrong bottom SHIS blocks", () => {
    const f = checkHeadsetFit(frame, { ...headset, bottomShis: "EC44/40" }, "tapered");
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "bottom")?.severity).toBe("block");
  });
  it("40 mm crown race with a straight fork blocks", () => {
    const f = checkHeadsetFit(frame, headset, "straight");
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "crown-race")?.severity).toBe("block");
  });
  it("wrong top SHIS blocks", () => {
    const f = checkHeadsetFit(frame, { ...headset, topShis: "EC34/28.6" }, "tapered");
    expect(f.fits).toBe(false);
  });
});
