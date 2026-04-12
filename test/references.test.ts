import { describe, it, expect } from "vitest";
import {
  ALL_REFERENCES,
  AIR_SHOCK_BRAND_LINKS,
  COIL_SHOCK_BRAND_LINKS,
  CONVERSION_KIT_LINKS,
  EMAIL_CONTACTS,
  REFERENCE_DOCS,
  RETAILER_LINKS,
  USED_MARKET_LINKS,
} from "../src/references.js";
import type { Reference } from "../src/references.js";

const httpsUrl = /^https:\/\/[^\s]+$/;

const assertAllLinksSane = (group: readonly Reference[], min: number) => {
  expect(group.length).toBeGreaterThanOrEqual(min);
  for (const ref of group) {
    expect(ref.label).toBeTruthy();
    expect(ref.url).toMatch(httpsUrl);
    expect(ref.blurb.length).toBeGreaterThan(10);
    expect(ref.verified).toBe(true);
  }
};

describe("research references — structured link library", () => {
  it("has at least one conversion kit link, all HTTPS and verified", () => {
    assertAllLinksSane(CONVERSION_KIT_LINKS, 3);
  });

  it("includes the Offset Bushings Trek DRCV kit", () => {
    const offset = CONVERSION_KIT_LINKS.find((r) =>
      r.url.includes("offsetbushings.com/products/trek-conversion-kit"),
    );
    expect(offset).toBeDefined();
  });

  it("includes the Shockcraft Deaktiv pin kit exact SKU", () => {
    const sc = CONVERSION_KIT_LINKS.find((r) =>
      r.url.toLowerCase().includes("deaktiv-m10"),
    );
    expect(sc).toBeDefined();
  });

  it("air-shock brand links cover the major manufacturers", () => {
    assertAllLinksSane(AIR_SHOCK_BRAND_LINKS, 8);
    const urls = AIR_SHOCK_BRAND_LINKS.map((r) => r.url);
    expect(urls.some((u) => u.includes("ridefox.com"))).toBe(true);
    expect(urls.some((u) => u.includes("sram.com"))).toBe(true);
    expect(urls.some((u) => u.includes("marzocchi.com"))).toBe(true);
    expect(urls.some((u) => u.includes("dvosuspension.com"))).toBe(true);
    expect(urls.some((u) => u.includes("canecreek.com"))).toBe(true);
    expect(urls.some((u) => u.includes("hayesbicycle.com"))).toBe(true);
    expect(urls.some((u) => u.includes("ohlins.com"))).toBe(true);
  });

  it("coil-shock brand links include Push ElevenSix", () => {
    assertAllLinksSane(COIL_SHOCK_BRAND_LINKS, 2);
    const push = COIL_SHOCK_BRAND_LINKS.find((r) =>
      r.url.includes("pushindustries.com"),
    );
    expect(push).toBeDefined();
  });

  it("retailer links span US, EU, UK, NZ, and AU", () => {
    assertAllLinksSane(RETAILER_LINKS, 10);
    const urls = RETAILER_LINKS.map((r) => r.url);
    expect(urls.some((u) => u.includes(".com.au"))).toBe(true);
    expect(urls.some((u) => u.includes(".co.nz"))).toBe(true);
    expect(urls.some((u) => u.includes(".de"))).toBe(true);
    expect(urls.some((u) => /merlincycles|tftuned|chainreaction/.test(u))).toBe(
      true,
    );
  });

  it("used-market links cover Pinkbike BuySell and AU platforms", () => {
    assertAllLinksSane(USED_MARKET_LINKS, 4);
    const urls = USED_MARKET_LINKS.map((r) => r.url);
    expect(urls.some((u) => u.includes("pinkbike.com/buysell"))).toBe(true);
    expect(urls.some((u) => u.includes("ebay.com.au"))).toBe(true);
    expect(urls.some((u) => u.includes("facebook.com/groups"))).toBe(true);
    expect(urls.some((u) => u.includes("rotorburn"))).toBe(true);
  });

  it("reference docs include TF Tuned Trek guide and MTBR forum", () => {
    assertAllLinksSane(REFERENCE_DOCS, 4);
    const urls = REFERENCE_DOCS.map((r) => r.url);
    expect(urls.some((u) => u.includes("tftuned.com/tech-help"))).toBe(true);
    expect(urls.some((u) => u.includes("mtbr.com"))).toBe(true);
  });

  it("exposes email contacts for the key vendors", () => {
    expect(EMAIL_CONTACTS.shockcraftNz).toMatch(/@shockcraft\.co\.nz$/);
    expect(EMAIL_CONTACTS.pushSales).toMatch(/@pushindustries\.com$/);
    expect(EMAIL_CONTACTS.dvoSupport).toMatch(/@dvosuspension\.com$/);
  });

  it("ALL_REFERENCES aggregates every link group", () => {
    expect(ALL_REFERENCES.conversionKits).toBe(CONVERSION_KIT_LINKS);
    expect(ALL_REFERENCES.airShockBrands).toBe(AIR_SHOCK_BRAND_LINKS);
    expect(ALL_REFERENCES.coilShockBrands).toBe(COIL_SHOCK_BRAND_LINKS);
    expect(ALL_REFERENCES.retailers).toBe(RETAILER_LINKS);
    expect(ALL_REFERENCES.usedMarket).toBe(USED_MARKET_LINKS);
    expect(ALL_REFERENCES.referenceDocs).toBe(REFERENCE_DOCS);
  });

  it("no duplicate URLs across any group", () => {
    const all = [
      ...CONVERSION_KIT_LINKS,
      ...AIR_SHOCK_BRAND_LINKS,
      ...COIL_SHOCK_BRAND_LINKS,
      ...RETAILER_LINKS,
      ...USED_MARKET_LINKS,
      ...REFERENCE_DOCS,
    ].map((r) => r.url);
    const unique = new Set(all);
    expect(unique.size).toBe(all.length);
  });
});

describe("product URLs on catalog entries", () => {
  it("Push ElevenSix catalog entry links to its product page", async () => {
    const { COIL_SHOCK_CATALOG, AIR_SHOCK_CATALOG } = await import(
      "../src/catalog.js"
    );
    const push = COIL_SHOCK_CATALOG.find((s) =>
      s.label.toLowerCase().includes("push"),
    );
    expect(push?.productUrl).toContain("pushindustries.com");

    for (const s of AIR_SHOCK_CATALOG) {
      expect(s.productUrl).toBeDefined();
      expect(s.productUrl).toMatch(httpsUrl);
    }
  });

  it("every published-SKU conversion kit has a productUrl", async () => {
    const { CONVERSION_KITS } = await import("../src/conversion.js");
    const published = CONVERSION_KITS.filter((k) => k.publishedSku);
    for (const k of published) {
      expect(k.productUrl).toBeDefined();
      expect(k.productUrl).toMatch(httpsUrl);
    }
  });
});
