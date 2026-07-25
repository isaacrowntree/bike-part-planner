import { describe, it, expect } from "vitest";
import { checkMulletGeometry } from "../src/mullet.js";

describe("checkMulletGeometry", () => {
  it("no change when wheels are unchanged", () => {
    const r = checkMulletGeometry({ front: "29", rear: "29" }, { front: "29", rear: "29" }, false);
    expect(r.bbHeightDeltaMm).toBe(0);
    expect(r.headAngleDeltaDeg).toBe(0);
    expect(r.reasons[0].category).toBe("geometry");
    expect(r.reasons[0].severity).toBe("ok");
  });
  it("going mullet (29 → 27.5 rear) lowers the BB and slackens the head angle", () => {
    const r = checkMulletGeometry({ front: "29", rear: "29" }, { front: "29", rear: "27.5" }, false);
    expect(r.bbHeightDeltaMm).toBeLessThan(0); // lower
    expect(r.headAngleDeltaDeg).toBeLessThan(0); // slacker
    expect(r.fits).toBe(true); // advisory, never blocks
  });
  it("mentions the flip-chip when the frame has one and BB drops", () => {
    const r = checkMulletGeometry({ front: "29", rear: "29" }, { front: "29", rear: "27.5" }, true);
    expect(r.notes.join(" ")).toContain("flip-chip");
  });
  it("a bigger front (27.5 → 29) slackens the head angle (raises the front)", () => {
    const r = checkMulletGeometry({ front: "27.5", rear: "27.5" }, { front: "29", rear: "27.5" }, false);
    expect(r.headAngleDeltaDeg).toBeLessThan(0); // slacker
  });
  it("a smaller front steepens the head angle", () => {
    const r = checkMulletGeometry({ front: "29", rear: "29" }, { front: "27.5", rear: "29" }, false);
    expect(r.headAngleDeltaDeg).toBeGreaterThan(0); // steeper
  });
});
