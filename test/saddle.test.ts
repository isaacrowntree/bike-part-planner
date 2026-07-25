import { describe, it, expect } from "vitest";
import { checkSaddleFit, type SeatpostHead, type SaddleSpec } from "../src/saddle.js";

const post: SeatpostHead = { label: "alloy 2-bolt", accepts: ["round-7", "oval-7x9-alloy"] };

describe("checkSaddleFit", () => {
  it("accepts a round-rail saddle", () => {
    expect(checkSaddleFit(post, { label: "steel", rail: "round-7" }).fits).toBe(true);
  });
  it("blocks a carbon oval rail the post can't clamp", () => {
    const f = checkSaddleFit(post, { label: "carbon", rail: "oval-7x9-carbon" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "rail")?.severity).toBe("block");
    expect(f.notes.join(" ")).toContain("Carbon");
  });
  it("a carbon-capable post accepts the carbon rail", () => {
    const carbonPost: SeatpostHead = { label: "carbon head", accepts: ["oval-7x9-carbon", "oval-7x10-carbon", "round-7"] };
    expect(checkSaddleFit(carbonPost, { label: "carbon", rail: "oval-7x10-carbon" }).fits).toBe(true);
  });
});
