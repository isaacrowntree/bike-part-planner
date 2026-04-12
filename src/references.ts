/**
 * Structured reference library for the 2013 Trek Fuel EX 5 rear shock
 * project. Everything worth clicking through during research lives here
 * so it survives outside of conversation context. URLs were verified
 * live in April 2026 by the research sub-agents — if any 404, flag them
 * in a test and update here.
 */

export interface Reference {
  label: string;
  url: string;
  /** Short description of what you'll find at the URL. */
  blurb: string;
  /** Verified live in April 2026 research pass. */
  verified: boolean;
}

export const CONVERSION_KIT_LINKS: readonly Reference[] = [
  {
    label: "Offset Bushings — Trek DRCV/RE:aktiv Conversion Kit",
    url: "https://www.offsetbushings.com/products/trek-conversion-kit",
    blurb:
      "£33.99 GBP, in stock. Converts the Fuel/Remedy/Slash 2016-and-earlier DRCV mount to accept a standard imperial air shock. Advertised for air, not coil.",
    verified: true,
  },
  {
    label: "Shockcraft NZ — Deaktiv kit category",
    url: "https://www.shockcraft.co.nz/rear-shocks/shock-conversions/deaktiv",
    blurb: "NZ-made Trek DRCV replacement hardware, ships to AU cheaply.",
    verified: true,
  },
  {
    label: "Shockcraft — Trek Fuel/Remedy/Slash Deaktiv M10×1.0 Pin Kit",
    url: "https://www.shockcraft.co.nz/shockcraft-trek-fuel-remedy-slash-deaktiv-m10x1-0-pin-kit.html",
    blurb: "Exact SKU for the Fuel EX 5 2013 upper M10×1.0 pin mount.",
    verified: true,
  },
  {
    label: "Huber Bushings (EU)",
    url: "https://huber-bushings.com/",
    blurb: "German custom reducer shop, WooCommerce, hyphenated domain.",
    verified: true,
  },
  {
    label: "TF Tuned — Trek Pin-to-Trunnion Hardware",
    url: "https://www.tftuned.com/trek-rear-shock-pin-to-trunnion-hardware/p3518",
    blurb: "UK source for Trek shock mounting hardware.",
    verified: true,
  },
  {
    label: "Offset Bushings FAQ",
    url: "https://www.offsetbushings.com/pages/faq",
    blurb: "Use the FAQ page for contact — they respond to email quotes.",
    verified: true,
  },
];

export const AIR_SHOCK_BRAND_LINKS: readonly Reference[] = [
  {
    label: "Fox Float X2 Factory",
    url: "https://ridefox.com/products/float-x2-factory",
    blurb: "4-way adjustable, large air volume. Metric only in 2026 catalog — via conversion kit.",
    verified: true,
  },
  {
    label: "Fox Float X Factory",
    url: "https://ridefox.com/products/float-x-factory",
    blurb: "Single-adjuster version, lighter, cheaper.",
    verified: true,
  },
  {
    label: "RockShox Super Deluxe Ultimate C2",
    url: "https://www.sram.com/en/rockshox/models/rs-sdlx-ult-c2",
    blurb: "Current production metric Super Deluxe, fits via conversion kit.",
    verified: true,
  },
  {
    label: "RockShox Super Deluxe series landing",
    url: "https://www.sram.com/en/rockshox/series/super-deluxe",
    blurb: "Series overview with all Super Deluxe variants.",
    verified: true,
  },
  {
    label: "Marzocchi Bomber Air",
    url: "https://www.marzocchi.com/products/bomber-air",
    blurb: "Cheaper Fox-owned alternative, metric only.",
    verified: true,
  },
  {
    label: "DVO Topaz Gen 3",
    url: "https://dvosuspension.com/product/topaz-gen-3/",
    blurb: "Bladder IFP, adjustable bottom-out, ebike-friendly.",
    verified: true,
  },
  {
    label: "DVO Topaz T3Air",
    url: "https://dvosuspension.com/shocks/topaz-t3air/",
    blurb: "Earlier Topaz with T3 compression circuit.",
    verified: true,
  },
  {
    label: "Cane Creek DB Kitsuma Air",
    url: "https://canecreek.com/product/db-kitsuma-air/",
    blurb: "4-way adjustable, large volume — note sizes start at 210mm metric.",
    verified: true,
  },
  {
    label: "Manitou Mara Pro",
    url: "https://hayesbicycle.com/products/mara-pro",
    blurb: "Underrated, cheap, excellent damping on a budget.",
    verified: true,
  },
  {
    label: "Manitou Mara Pro Inline",
    url: "https://hayesbicycle.com/products/mara-pro-inline",
    blurb: "Inline variant for tight shock tunnels.",
    verified: true,
  },
  {
    label: "Öhlins MTB Rear Shocks",
    url: "https://www.ohlins.com/en-us/mountain-bike/rear-shocks",
    blurb: "TTX1Air / TTX2Air — premium option.",
    verified: true,
  },
];

export const COIL_SHOCK_BRAND_LINKS: readonly Reference[] = [
  {
    label: "Push Industries ElevenSix",
    url: "https://www.pushindustries.com/products/elevensix",
    blurb:
      "ONLY currently-buildable new imperial 7.25×2.0 coil. US$1,300, made to order, ~10-14 day lead, ships international.",
    verified: true,
  },
  {
    label: "Push Industries Rear Suspension collection",
    url: "https://www.pushindustries.com/collections/rear-suspension",
    blurb: "Full Push rear suspension catalog.",
    verified: true,
  },
  {
    label: "Fox DHX2 Factory (reference — metric only in 2026)",
    url: "https://ridefox.com/products/dhx2-factory",
    blurb: "Fox dropped imperial DHX2 for 2026 — here for reference only.",
    verified: true,
  },
  {
    label: "Cane Creek DB Coil IL",
    url: "https://canecreek.com/product/dbcoil-il/",
    blurb: "Discontinued inline coil. Sold out across the line in 2026.",
    verified: true,
  },
  {
    label: "DVO Jade X",
    url: "https://dvosuspension.com/product/jade-x/",
    blurb: "Current production only in 8.5×2.5 and 7.875×2.25 — no 7.25×2.0.",
    verified: true,
  },
];

export const RETAILER_LINKS: readonly Reference[] = [
  {
    label: "Worldwide Cyclery — Rear Shocks",
    url: "https://worldwidecyclery.com/collections/rear-shocks",
    blurb: "US, ships AU, good used inventory.",
    verified: true,
  },
  {
    label: "Jenson USA — Rear Shocks",
    url: "https://www.jensonusa.com/rear-shocks",
    blurb: "US, ships AU, broad new inventory.",
    verified: true,
  },
  {
    label: "Universal Cycles — Rear Shocks",
    url: "https://www.universalcycles.com/shopping/index.php?category=136",
    blurb: "US, occasional NOS imperial stock.",
    verified: true,
  },
  {
    label: "The Lost Co. — Rear Shocks",
    url: "https://thelostco.com/collections/rear-shocks",
    blurb: "US, friendly to weird conversion builds.",
    verified: true,
  },
  {
    label: "The Lost Co. — Shock Hardware Database",
    url: "https://thelostco.com/pages/shock-hardware-database",
    blurb: "The best free reference on shock eyelet dimensions.",
    verified: true,
  },
  {
    label: "Bike24 — MTB Shocks & Coils",
    url: "https://www.bike24.com/mtb-shocks-coils.html",
    blurb: "DE, ships AU via DHL.",
    verified: true,
  },
  {
    label: "BMO Bike-Mailorder — Dampers & Springs",
    url: "https://www.bike-mailorder.com/en/collections/dampers-springs",
    blurb: "DE, broad euro inventory.",
    verified: true,
  },
  {
    label: "Bike-Discount.de — Rear Shock",
    url: "https://www.bike-discount.de/en/bike/bike-parts/mountain-bike-parts/rear-shock",
    blurb: "DE, competitive pricing.",
    verified: true,
  },
  {
    label: "Merlin Cycles (UK) — Rear Shocks",
    url: "https://www.merlincycles.com/rear-shocks-1-321263/",
    blurb: "UK, good sale pricing.",
    verified: true,
  },
  {
    label: "Chain Reaction Cycles — Rear Shocks",
    url: "https://www.chainreactioncycles.com/int/c/bike-parts/frames-and-forks/rear-shocks",
    blurb: "Global, AU shipping available.",
    verified: true,
  },
  {
    label: "TF Tuned (UK) — Shocks",
    url: "https://www.tftuned.com/shocks/c33-all",
    blurb: "UK custom tuners — will re-tune a shock for your specific frame.",
    verified: true,
  },
  {
    label: "Shockcraft (NZ) — Trek brand page",
    url: "https://www.shockcraft.co.nz/brands/trek",
    blurb: "Closest shop to AU that knows this conversion intimately.",
    verified: true,
  },
  {
    label: "MTB Direct (AU) — Shocks",
    url: "https://www.mtbdirect.com.au/collections/shocks",
    blurb: "AU retail, current metric shocks + VALT springs.",
    verified: true,
  },
  {
    label: "Pushys (AU) — Shocks",
    url: "https://www.pushys.com.au/parts/shocks.html",
    blurb: "AU retail, mainstream brands.",
    verified: true,
  },
  {
    label: "NSDynamics (AU)",
    url: "https://nsdynamics.com.au/",
    blurb: "AU service specialist for Öhlins / Cane Creek / DVO.",
    verified: true,
  },
  {
    label: "Cyclinic (AU) — Rear Shocks",
    url: "https://cyclinic.com.au/collections/rear-shocks",
    blurb: "AU, Bikes Online-adjacent.",
    verified: true,
  },
];

export const USED_MARKET_LINKS: readonly Reference[] = [
  {
    label: "Pinkbike BuySell — Rear Shocks (all regions)",
    url: "https://www.pinkbike.com/buysell/list/?category=104",
    blurb: "Global used listings, most active MTB classifieds.",
    verified: true,
  },
  {
    label: "Pinkbike BuySell — Rear Shocks (Oceania filter)",
    url: "https://www.pinkbike.com/buysell/list/?region=5&category=104",
    blurb: "AU/NZ filter — fewer results but domestic shipping.",
    verified: true,
  },
  {
    label: "eBay AU — Bicycle Rear Shocks",
    url: "https://www.ebay.com.au/b/Bicycle-Rear-Shocks/109119/bn_1656566",
    blurb: "Save a search for '184x50' and '7.25x2.0'.",
    verified: true,
  },
  {
    label: "Rotorburn forums",
    url: "https://www.rotorburn.com/forums/",
    blurb: "AU MTB forum — browse the classifieds subforum.",
    verified: true,
  },
  {
    label: "FB: MTB Buy/Sell/Discuss Australia",
    url: "https://www.facebook.com/groups/856911937774011/",
    blurb: "Active AU MTB parts group.",
    verified: true,
  },
  {
    label: "FB: Mountain Biking Buy/Sell/Swap Australia",
    url: "https://www.facebook.com/groups/637690203017442/",
    blurb: "Second active AU group.",
    verified: true,
  },
];

export const REFERENCE_DOCS: readonly Reference[] = [
  {
    label: "TF Tuned — Trek Shock Guide",
    url: "https://www.tftuned.com/tech-help/100-trek-shock-guide",
    blurb: "Independent Trek shock fitment tables — sanity check against Trek's own PDF.",
    verified: true,
  },
  {
    label: "TF Tuned — Mount Kits & Bushings reference",
    url: "https://www.tftuned.com/tech-help/71-mount-kits-and-bushings-for-rear-shocks",
    blurb: "Definitive guide to shock hardware standards.",
    verified: true,
  },
  {
    label: "MTBR — Trek subforum",
    url: "https://www.mtbr.com/forums/trek.30/",
    blurb: "Primary forum for Trek MTB ownership questions.",
    verified: true,
  },
  {
    label: "MTBR — Trek DRCV Rear Shock Upgrade thread",
    url: "https://www.mtbr.com/threads/trek-drcv-rear-shock-upgrade.1017873/",
    blurb: "Owners discussing DRCV→standard shock conversions.",
    verified: true,
  },
  {
    label: "Medium — Replacing the proprietary DRCV Trek Remedy 29 Rear Shock",
    url: "https://medium.com/@fixingthings/replacing-the-proprietary-drcv-trek-remedy-29-rear-shock-ee868c0bb9b",
    blurb: "Closest documented write-up to the same-era frame conversion.",
    verified: true,
  },
  {
    label: "Pinkbike — Mike Kazimer's coil Fuel EX (Gen 5 frame — reference)",
    url: "https://www.pinkbike.com/news/staff-rides-mike-kazimers-trek-fuel-ex.html",
    blurb: "Coil build on a 2020+ metric frame — NOT applicable to 2013.",
    verified: true,
  },
];

export const EMAIL_CONTACTS = {
  shockcraftNz: "sales@shockcraft.co.nz",
  shockcraftPhone: "+64 3 976 7790",
  dvoSupport: "support@dvosuspension.com",
  pushSales: "sales@pushindustries.com",
  pushPhone: "+1-970-278-1110",
  foxService: "serviceavl@ridefox.com",
} as const;

export const ALL_REFERENCES = {
  conversionKits: CONVERSION_KIT_LINKS,
  airShockBrands: AIR_SHOCK_BRAND_LINKS,
  coilShockBrands: COIL_SHOCK_BRAND_LINKS,
  retailers: RETAILER_LINKS,
  usedMarket: USED_MARKET_LINKS,
  referenceDocs: REFERENCE_DOCS,
  emails: EMAIL_CONTACTS,
} as const;
