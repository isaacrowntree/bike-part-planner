import { describe, it, expect } from "vitest";
import { checkTireFit, BSD, type FrameTireClearance, type TireSpec } from "../src/tire.js";

const frame: FrameTireClearance = { wheel: "29", maxTireWidthMm: 68, rimInternalWidthMm: 30 };
const tire: TireSpec = { label: "Maxxis DHF 2.4", wheel: "29", widthMm: 61 };

describe("checkTireFit", () => {
  it("has correct bead-seat diameters", () => {
    expect(BSD["29"]).toBe(622);
    expect(BSD["27.5"]).toBe(584);
    expect(BSD["26"]).toBe(559);
  });
  it("matching diameter + clearance + rim pairing → fits", () => {
    expect(checkTireFit(frame, tire).fits).toBe(true);
  });
  it("wrong wheel diameter is a hard block and short-circuits", () => {
    const f = checkTireFit(frame, { ...tire, wheel: "27.5" });
    expect(f.fits).toBe(false);
    expect(f.reasons).toHaveLength(1);
    expect(f.reasons[0].category).toBe("diameter");
  });
  it("a tire wider than frame clearance blocks", () => {
    const f = checkTireFit({ ...frame, maxTireWidthMm: 60 }, { ...tire, widthMm: 64 });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "clearance")?.severity).toBe("block");
  });
  it("under 4 mm spare warns about mud clearance", () => {
    const f = checkTireFit({ ...frame, maxTireWidthMm: 63 }, tire); // 61 mounts ~63 on 30mm rim
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "clearance")?.severity).toBe("warn");
  });
  it("a narrow tire on a wide rim warns (squares off)", () => {
    const f = checkTireFit({ ...frame, maxTireWidthMm: 90 }, { ...tire, widthMm: 48 });
    expect(f.reasons.find((r) => r.category === "rim-pairing")?.severity).toBe("warn");
  });
});
