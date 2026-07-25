import { describe, it, expect } from "vitest";
import { checkBBFit, checkChainline, type Shell, type CrankSpec } from "../src/bottombracket.js";

const bsa: Shell = { standard: "bsa", widthMm: 73 };

describe("checkBBFit", () => {
  it("24 mm Shimano crank in a BSA shell is native", () => {
    const f = checkBBFit(bsa, { label: "XT", spindle: "24" });
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "bb-match")?.severity).toBe("ok");
  });
  it("DUB spindle warns and always needs a DUB BB", () => {
    const f = checkBBFit(bsa, { label: "GX DUB", spindle: "dub" });
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "bb-match")?.severity).toBe("warn");
    expect(f.notes.join(" ")).toContain("DUB");
  });
  it("24 mm crank in a 30 mm-native PF30 shell needs a reducer BB", () => {
    const f = checkBBFit({ standard: "pf30", widthMm: 68 }, { label: "Shimano", spindle: "24" });
    expect(f.reasons.find((r) => r.category === "bb-match")?.severity).toBe("warn");
    expect(f.notes.join(" ")).toContain("reducer");
  });
});

describe("checkChainline", () => {
  it("52 mm chainline suits Boost (148) spacing", () => {
    expect(checkChainline(148, 52).fits).toBe(true);
  });
  it("49 mm chainline suits non-Boost (142)", () => {
    expect(checkChainline(142, 49).fits).toBe(true);
  });
  it("non-Boost crank on a Boost frame warns", () => {
    const f = checkChainline(148, 49);
    expect(f.reasons[0].severity).toBe("warn");
  });
});
