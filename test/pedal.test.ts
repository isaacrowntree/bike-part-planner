import { describe, it, expect } from "vitest";
import { checkPedalFit, type CrankThread, type PedalSpec, type ShoeSpec } from "../src/pedal.js";

const crank: CrankThread = { thread: "9/16" };

describe("checkPedalFit", () => {
  it("SPD pedal + 2-bolt shoe + right thread fits", () => {
    const pedal: PedalSpec = { label: "XT SPD", thread: "9/16", system: "spd" };
    const shoe: ShoeSpec = { label: "MTB", drilling: "2-bolt" };
    expect(checkPedalFit(crank, pedal, shoe).fits).toBe(true);
  });
  it("wrong thread blocks", () => {
    const pedal: PedalSpec = { label: "old", thread: "1/2", system: "spd" };
    const f = checkPedalFit(crank, pedal, { label: "MTB", drilling: "2-bolt" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "thread")?.severity).toBe("block");
  });
  it("2-bolt shoe can't take a 3-bolt road cleat", () => {
    const pedal: PedalSpec = { label: "SPD-SL", thread: "9/16", system: "spd-sl" };
    const f = checkPedalFit(crank, pedal, { label: "MTB", drilling: "2-bolt" });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "cleat")?.severity).toBe("block");
  });
  it("Speedplay 4-bolt shoe on a 3-bolt pedal warns (adapter)", () => {
    const pedal: PedalSpec = { label: "Look", thread: "9/16", system: "look" };
    const f = checkPedalFit(crank, pedal, { label: "road", drilling: "4-bolt" });
    expect(f.reasons.find((r) => r.category === "cleat")?.severity).toBe("warn");
  });
  it("flat pedals take any shoe", () => {
    const pedal: PedalSpec = { label: "flats", thread: "9/16", system: "flat" };
    expect(checkPedalFit(crank, pedal, { label: "any", drilling: "flat" }).fits).toBe(true);
  });
});
