import { describe, it, expect } from "vitest";
import { checkBatteryFit, whPerKm, estimateRangeKm, recommendPack, type FrameTriangle, type BatterySpec } from "../src/battery.js";

const pack: BatterySpec = { label: "52V 14Ah", form: "downtube", lengthMm: 360, mountBosses: 2, capacityWh: 728, voltage: 52, weightKg: 4.6 };
const hardtail: FrameTriangle = { suspension: "hardtail", downtubeUsableMm: 420, bottleBosses: 2 };

describe("checkBatteryFit", () => {
  it("fits a hardtail with room + bosses", () => {
    expect(checkBatteryFit(hardtail, pack).fits).toBe(true);
  });
  it("blocks when the case is longer than the downtube run", () => {
    const f = checkBatteryFit({ ...hardtail, downtubeUsableMm: 300 }, pack);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "length")?.severity).toBe("block");
  });
  it("warns (not blocks) when bosses are missing", () => {
    const f = checkBatteryFit({ ...hardtail, bottleBosses: 0 }, pack);
    expect(f.fits).toBe(true);
    expect(f.reasons.find((r) => r.category === "mount")?.severity).toBe("warn");
  });
  it("full-sus with tight shock clearance blocks with a warning note", () => {
    const f = checkBatteryFit({ suspension: "full", downtubeUsableMm: 420, bottleBosses: 2, shockClearanceMm: 10 }, pack);
    expect(f.fits).toBe(false);
    expect(f.reasons.find((r) => r.category === "shock-clearance")?.severity).toBe("block");
  });
  it("full-sus with enough clearance fits", () => {
    const f = checkBatteryFit({ suspension: "full", downtubeUsableMm: 420, bottleBosses: 2, shockClearanceMm: 40 }, pack);
    expect(f.fits).toBe(true);
  });
  it("a rear-rack pack sidesteps the triangle entirely", () => {
    expect(checkBatteryFit({ suspension: "full", downtubeUsableMm: 200, bottleBosses: 0 }, { ...pack, form: "rear-rack" }).fits).toBe(true);
  });
});

describe("range sizing", () => {
  const ride = { riderKg: 100, terrain: "hilly" as const, assist: "trail" as const };
  it("consumption rises with terrain and assist", () => {
    expect(whPerKm({ ...ride, terrain: "flat" })).toBeLessThan(whPerKm({ ...ride, terrain: "mountain" }));
    expect(whPerKm({ ...ride, assist: "eco" })).toBeLessThan(whPerKm({ ...ride, assist: "boost" }));
  });
  it("more Wh = more range", () => {
    expect(estimateRangeKm(500, ride)).toBeLessThan(estimateRangeKm(1000, ride));
  });
  it("recommends the smallest pack that reaches the target", () => {
    const packs = [500, 728, 960];
    const rec = recommendPack(40, packs, ride);
    expect(rec).not.toBeNull();
    expect(estimateRangeKm(rec!, ride)).toBeGreaterThanOrEqual(40);
    // and it's the smallest that qualifies
    const smaller = packs.filter((w) => w < rec!);
    expect(smaller.every((w) => estimateRangeKm(w, ride) < 40)).toBe(true);
  });
  it("returns null when no pack reaches an extreme target", () => {
    expect(recommendPack(9999, [500, 728], ride)).toBeNull();
  });
});
