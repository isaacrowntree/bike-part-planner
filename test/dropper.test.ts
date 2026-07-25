import { describe, it, expect } from "vitest";
import { checkDropperFit, type SeatTube, type DropperSpec } from "../src/dropper.js";

const frame: SeatTube = { idMm: 31.6, maxInsertMm: 230, routing: "internal" };
const post: DropperSpec = { label: "OneUp V2 150", diameterMm: 31.6, travelMm: 150, insertionLengthMm: 200, routing: "internal" };

describe("checkDropperFit", () => {
  it("matching diameter, enough insertion, internal routing → fits", () => {
    expect(checkDropperFit(frame, post).fits).toBe(true);
  });
  it("undersized post shims up (warn, still fits)", () => {
    const f = checkDropperFit(frame, { ...post, diameterMm: 30.9 });
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "diameter")?.severity).toBe("warn");
  });
  it("oversized post can't shim down → blocks", () => {
    const f = checkDropperFit(frame, { ...post, diameterMm: 34.9 });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "diameter")?.severity).toBe("block");
  });
  it("too much insertion for a short seat tube → blocks with a shorter-travel note", () => {
    const f = checkDropperFit({ ...frame, maxInsertMm: 150 }, { ...post, travelMm: 210, insertionLengthMm: 260 });
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "insertion")?.severity).toBe("block");
    expect(f.notes.join(" ")).toContain("shorter-travel");
  });
  it("internal post on an external-only frame → blocks", () => {
    const f = checkDropperFit({ ...frame, routing: "external" }, post);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "routing")?.severity).toBe("block");
  });
  it("external post on an internal frame is fine", () => {
    expect(checkDropperFit(frame, { ...post, routing: "external" }).fits).toBe(true);
  });
});
