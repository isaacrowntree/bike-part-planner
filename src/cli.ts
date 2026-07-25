import { FUEL_EX_5_2013, FUEL_EX_5_2013_SLOT } from "./bike.js";
import { AIR_SHOCK_CATALOG, COIL_SHOCK_CATALOG, SPRING_CATALOG } from "./catalog.js";
import { CONVERSION_KITS, recommendCoilConversion } from "./conversion.js";
import { PIVOT_HEALTH_CHECK, FUEL_EX_5_2013_PIVOT_KITS } from "./pivots.js";
import { ALL_REFERENCES } from "./references.js";
import { ISAAC_96KG_EBIKE } from "./rider.js";
import { fromRiderProfile } from "./springRate.js";

const riderKg = Number(process.argv[2] ?? ISAAC_96KG_EBIKE.riderKg);
const sag = Number(process.argv[3] ?? 0.3);
const useProfile = !process.argv[2];

const results = recommendCoilConversion({
  bike: FUEL_EX_5_2013,
  slot: FUEL_EX_5_2013_SLOT,
  rider: useProfile
    ? fromRiderProfile(ISAAC_96KG_EBIKE, sag)
    : { riderKg, targetSagFraction: sag },
  shocks: COIL_SHOCK_CATALOG,
  kits: CONVERSION_KITS,
});

console.log(
  `\nbike-part-planner report — ${
    useProfile
      ? `${ISAAC_96KG_EBIKE.label}`
      : `rider ${riderKg}kg`
  } @ ${Math.round(sag * 100)}% sag\n`,
);

for (const r of results) {
  const fitMark = r.fit.fits ? "✓" : "✗";
  const auMark =
    r.shock.auAvailability === "new-au-retail"
      ? "[AU NEW]"
      : r.shock.auAvailability === "used-au"
        ? "[AU USED]"
        : r.shock.auAvailability === "import-only"
          ? "[IMPORT]"
          : "[UNOBTAINABLE]";
  console.log(`${fitMark} ${auMark}  ${r.shock.label}`);
  console.log(`   kit:     ${r.kit ? r.kit.label : "— none (drop-in)"}`);
  if (r.kit?.approxAud) {
    console.log(`   kit $:   ~AUD ${r.kit.approxAud}`);
  }
  console.log(
    `   shock $: ~AUD ${r.shock.approxAud ?? "?"} (${r.shock.auAvailability})`,
  );
  console.log(
    `   spring:  ${r.nearestAvailableSpringLbIn} lb/in (target ${r.targetSpringRateLbIn}, ${
      r.springInRange ? "in range" : "OUT OF RANGE"
    })`,
  );
  for (const n of r.notes) console.log(`   note:    ${n}`);
  if (!r.fit.fits) {
    for (const reason of r.fit.reasons.filter((x) => !x.ok)) {
      console.log(`   blocker: ${reason.category} — ${reason.detail}`);
    }
  }
  console.log();
}

console.log("Springs — current production, AU-sourceable:");
for (const s of SPRING_CATALOG) {
  const fitTag = s.fits50mmShock ? "✓ fits 50mm shock" : "✗ doesn't fit 50mm";
  console.log(
    `  • ${s.label}\n      ${fitTag} — ~AUD ${s.approxAud} — ${s.auVendors.join(", ")}`,
  );
  if (s.notes) console.log(`      ${s.notes}`);
}
console.log();

console.log("Documented-working AIR shock alternative path:");
for (const s of AIR_SHOCK_CATALOG) {
  console.log(
    `  • ${s.label} — ~AUD ${s.approxAud} (${s.auAvailability})${
      s.productUrl ? `\n      ${s.productUrl}` : ""
    }`,
  );
}
console.log();

console.log("Pivot health check (run BEFORE committing to ebike build):");
for (const step of PIVOT_HEALTH_CHECK) {
  console.log(`  ${step.step}. ${step.action}`);
  console.log(`      FAIL if: ${step.failSignal}`);
}
console.log(
  `  Rebuild kits if needed: Trek ${FUEL_EX_5_2013_PIVOT_KITS.mainPivot.trekPartNumber} (main) + ${FUEL_EX_5_2013_PIVOT_KITS.abpConvert.trekPartNumber} (ABP)`,
);
console.log();

console.log("Key references (run `npx tsx src/references.ts` for all):");
console.log(`  Conversion kits: ${ALL_REFERENCES.conversionKits.length} links`);
console.log(`  Air shock brands: ${ALL_REFERENCES.airShockBrands.length} links`);
console.log(`  Retailers: ${ALL_REFERENCES.retailers.length} links`);
console.log(`  Used market: ${ALL_REFERENCES.usedMarket.length} links`);
console.log(`  Reference docs: ${ALL_REFERENCES.referenceDocs.length} links`);
console.log();
