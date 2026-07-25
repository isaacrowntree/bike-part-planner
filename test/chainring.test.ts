import { describe, it, expect } from "vitest";
import { checkChainringFit, type CrankInterface, type ChainringSpec } from "../src/chainring.js";

const boostCrank: CrankInterface = { label: "GX DUB", mount: "dm-sram-3bolt", rearSpacingMm: 148 };
const boostRing: ChainringSpec = { label: "32T 3mm", mount: "dm-sram-3bolt", offsetMm: 3, toothCount: 32, profile: "sram-eagle" };

describe("checkChainringFit", () => {
  it("matching 3-bolt Boost ring fits", () => {
    expect(checkChainringFit(boostCrank, boostRing, "sram-eagle").fits).toBe(true);
  });
  it("SRAM 8-bolt ring on a 3-bolt crank blocks", () => {
    const f = checkChainringFit(boostCrank, { ...boostRing, mount: "dm-sram-8bolt" }, "sram-eagle");
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "mount")?.severity).toBe("block");
    expect(f.notes.join(" ")).toContain("3-bolt and 8-bolt");
  });
  it("non-Boost offset on a Boost crank warns (chainline)", () => {
    const f = checkChainringFit(boostCrank, { ...boostRing, offsetMm: 6 }, "sram-eagle");
    expect(f.reasons.find((r) => r.category === "chainline")?.severity).toBe("warn");
  });
  it("Eagle ring with an HG+ chain warns", () => {
    const f = checkChainringFit(boostCrank, boostRing, "shimano-hg+");
    expect(f.reasons.find((r) => r.category === "chain-profile")?.severity).toBe("warn");
  });
});
