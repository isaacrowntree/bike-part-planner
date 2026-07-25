import { describe, it, expect } from "vitest";
import { checkChainFit, chainLengthLinks, type DrivetrainChain, type ChainSpec } from "../src/chain.js";

const dt: DrivetrainChain = { speed: 12, brand: "sram" };

describe("checkChainFit", () => {
  it("matching speed + brand fits", () => {
    expect(checkChainFit(dt, { label: "GX Eagle", speed: 12, brand: "sram" }).fits).toBe(true);
  });
  it("far-off speed count blocks (wrong width)", () => {
    const f = checkChainFit(dt, { label: "8s", speed: 8, brand: "kmc" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "speed")?.severity).toBe("block");
  });
  it("one-step-off speed warns", () => {
    const f = checkChainFit({ speed: 11, brand: "shimano" }, { label: "12s", speed: 12, brand: "shimano" });
    expect(f.reasons.find((r) => r.category === "speed")?.severity).toBe("warn");
  });
  it("cross-brand at 12-speed warns", () => {
    const f = checkChainFit(dt, { label: "XT", speed: 12, brand: "shimano" });
    expect(f.reasons.find((r) => r.category === "brand")?.severity).toBe("warn");
  });
  it("KMC is treated as universal", () => {
    expect(checkChainFit(dt, { label: "KMC X12", speed: 12, brand: "kmc" }).fits).toBe(true);
  });
});

describe("chainLengthLinks", () => {
  it("returns an even link count", () => {
    const links = chainLengthLinks({ bigChainringT: 32, bigCogT: 52, chainstayMm: 435 });
    expect(links % 2).toBe(0);
    expect(links).toBeGreaterThan(100);
    expect(links).toBeLessThan(130);
  });
  it("a longer chainstay needs more links", () => {
    const short = chainLengthLinks({ bigChainringT: 32, bigCogT: 52, chainstayMm: 420 });
    const long = chainLengthLinks({ bigChainringT: 32, bigCogT: 52, chainstayMm: 460 });
    expect(long).toBeGreaterThanOrEqual(short);
  });
});
