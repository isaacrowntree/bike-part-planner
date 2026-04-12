# bike-shock-planner

A **test-driven, code-as-data** planner for mountain bike rear shock replacements, coil conversions, and ebike suspension builds. It started as a personal project to figure out whether I could fit a coil shock (or even just a modern air shock) to my 2013 Trek Fuel EX 5 ebike conversion, and it grew into a reusable framework that models rear suspension geometry, shock fitment, spring rates, frame clearance, conversion hardware, and global sourcing paths for **any** bike.

It is **not** a bike-specific script. The Fuel EX 5 model is just the first "recipe" — a self-contained configuration that describes one bike, one rider, and one set of candidate parts. Everything is written so you can drop in a new recipe for your own bike and the same fit-check and spring-rate logic runs against it.

## Who this is for

- **DIY mechanics** restoring an old MTB frame and trying to work out whether a modern shock will actually bolt up.
- **Ebike converters** putting a mid-drive motor on a non-ebike frame, needing to recalculate spring rates for the extra mass and torque.
- **Frame hunters** cross-checking a secondhand frame's shock spec against catalog reality before buying.
- **Bike shops** who want a reusable, forkable, extendable model of rear shock dimensions and fitment rules — the catalog is just TypeScript, extend it for whatever you stock and rerun the test suite to lint your inventory against real frames.
- **Anyone** who has spent hours in a Trek fitment PDF trying to figure out whether a shock advertised as "7.25×2.0 imperial" actually fits their old DRCV mount (spoiler: only via a conversion kit).

## What it does

- Models a bike's rear suspension: eye-to-eye, stroke, mount styles, eyelet widths, bolt sizes, leverage ratio, progression, and frame clearance envelope.
- Models aftermarket shocks as code — with body dimensions, piggyback status, coil spring rate range, Australian sourcing notes, and verified product URLs.
- Runs a **fit check** between a frame slot and a candidate shock, reporting each dimensional mismatch separately (eye-to-eye, stroke, upper/lower eyelet width, upper/lower bolt, upper/lower mount style, body length, body diameter, reservoir clearance).
- Models conversion kits that rewrite a shock's mounting hardware on mount — so you can ask "does this imperial shock fit if I use the Shockcraft Deaktiv kit?" and get a yes/no.
- Estimates required coil spring rate using a **practical** formula that accounts for rear weight distribution — not the theoretical Fox "quick formula" that overshoots real-world spring picks by 40%.
- Applies an **ebike load correction** for mid-drive conversions, weighting 40% of battery + motor mass onto the rear shock and adding a high-torque correction for ≥100 Nm motors.
- Flags whether the frame's linkage even _wants_ a coil at all — e.g. Trek's Full Floater is only ~13% progressive and is tuned for a DRCV air spring, so a linear coil will bottom harshly.
- Flags whether any documented builds exist on this exact frame generation — if not, every candidate gets an **experimental** warning.
- Captures a researched **reference library** of conversion kits, manufacturer product pages, global retailers, used-market venues, forum threads, and vendor email contacts — with tests enforcing that every link is HTTPS and every group is populated.
- Captures the **pivot bearing hardware** and a 4-step health check so you can decide whether a frame rebuild is required alongside the shock swap.

## Status — what's in the catalog today

This is primarily a **2013 Trek Fuel EX 5** model right now. The bike is present as `FUEL_EX_5_2013`, its stock shock is `FUEL_EX_5_2013_STOCK_SHOCK`, and its OEM pivot hardware is captured in `pivots.ts` directly from Trek's service PDF.

The rider `ISAAC_96KG_EBIKE` is the current primary rider profile — 96kg rider with a Bafang BBS02 + 52V / 15Ah / 780Wh pack. Change this, or add more profiles, in `src/rider.ts`.

The coil catalog includes Push ElevenSix (the only currently-buildable imperial 7.25×2.0 coil in April 2026), plus historical Marzocchi Bomber CR, Fox DHX2, DVO Jade X, MRP Hazzard Coil, and Cane Creek DB Coil IL entries marked as used-market-only. The air catalog includes Fox Float X2, RS Super Deluxe Ultimate, and Marzocchi Bomber Air. The spring catalog uses real VALT Progressive sizes (45mm stroke that fits inside a 50mm shock) and flags Sprindex 55mm as not-fitting.

The conversion kit catalog has real published SKUs for **Offset Bushings** and **Shockcraft Deaktiv**, plus an unpublished custom-machine path for Huber Bushings, plus a speculative metric-to-Trek kit that is flagged `publishedSku: false` so the test suite warns about it.

## Project layout

```
src/
  bike.ts           Bike suspension model (frame geometry, leverage, stock shock)
  rider.ts          Rider + ebike conversion profiles
  shock.ts          ShockSpec type + checkShockFit() engine
  springRate.ts     Spring rate calculator with ebike corrections
  catalog.ts        COIL_SHOCK_CATALOG, AIR_SHOCK_CATALOG, SPRING_CATALOG
  conversion.ts     CONVERSION_KITS + applyConversionKit() + recommendCoilConversion()
  pivots.ts         OEM bearing/bolt spec + pivot health check
  references.ts     Verified research links (conversion kits, brands, retailers, forums, emails)
  cli.ts            Human-readable conversion report
  units.ts          Inch/mm, lb·in⁻¹/N·mm⁻¹, kg/lb helpers

test/
  bike.test.ts              OEM spec assertions
  shock-fit.test.ts         Fit-check tolerance tests
  coil-conversion.test.ts   Kit application, spring rate math, pipeline
  au-availability.test.ts   Australian sourcing constraints
  ebike.test.ts             Ebike load, 96kg rider profile
  forum-reality.test.ts     Documented-build flag + air-shock alternative path
  pivots.test.ts            Bearing designations, Trek part numbers, health check
  references.test.ts        Every link HTTPS, unique, verified

docs/
  2013_fuel_ex_5_6_7.pdf             Trek suspension assembly service info
  trek_rearShock_fitment_1997_2022.pdf  Trek rear shock fitment chart (all models)
```

## Running

```bash
npm install
npm test                           # run all tests (84+)
npx tsx src/cli.ts                 # human report for the default ebike profile
npx tsx src/cli.ts 80 0.3          # override rider weight (kg) and sag fraction
```

The CLI output covers:
- Each coil shock in the catalog with fit verdict, conversion kit required, spring rate target vs range, and AU sourcing notes
- Current-production air shocks that fit via the Offset/Shockcraft kit
- Available coil springs with fit-to-stroke checks
- The 4-step pivot health check
- A summary of how many research links exist in each category

## Extending it for your bike

The model is designed to be extended. Typical additions:

1. **A new bike**: add a `BikeSuspension` + `ShockSpec` + `FrameShockSlot` in `src/bike.ts`. Fill in the wheel size, rear travel, leverage ratio, stock shock dimensions, and clearance envelope.
2. **A new rider**: add a `RiderProfile` in `src/rider.ts`. If it's an ebike build, include the motor/battery mass and torque rating so `effectiveLoadKg()` can apply the correction.
3. **A new shock**: add to `COIL_SHOCK_CATALOG` or `AIR_SHOCK_CATALOG` in `src/catalog.ts`. Fill in dimensions, hardware, piggyback status, price, AU availability, and — ideally — a verified `productUrl`.
4. **A new conversion kit**: add to `CONVERSION_KITS` in `src/conversion.ts`. Set `family`, `publishedSku`, `documentedForCoil`, reducer dimensions, and optional `eyeToEyeAdjustmentMm` for kits that compensate for length mismatches.
5. **A new research link**: add to the relevant group in `src/references.ts`. The test suite will lint that the URL is HTTPS, unique, and marked verified.
6. **A new frame generation's pivot hardware**: add to `src/pivots.ts` with part numbers and torques from your service PDF.

The test suite doubles as schema enforcement — run `npm test` after any extension and it'll flag missing required fields, malformed URLs, impossible rider profiles, or clearance mismatches.

## Shop use

Because the catalog is code, a bike shop can fork this, replace the catalog with their current inventory, and run `recommendCoilConversion()` programmatically against a customer's frame to generate a fitment quote. Extend `AU_AVAILABILITY` with `in-shop-stock`, wire your PoS inventory into the catalog, and you have a customer-facing "will this shock fit your bike" widget with 84 tests worth of dimensional enforcement behind it.

## Why test-driven

Because rear shock hardware is a minefield of published specs that disagree with each other. Trek's own service chart disagreed with retailer listings on the stroke of the Fuel EX 5 stock shock. Manufacturers quietly drop imperial sizes between catalog years. Forum advice generalises across frame generations that share a model name but have completely different linkages. Tests let me encode "at least one AU-reachable shock must exist for this frame" as an invariant that breaks loudly when it stops being true — rather than me discovering it during a bike build two weeks before a trip.

## Disclaimers

- This is a hobbyist tool I use on my own bike. Numbers come from Trek service PDFs, manufacturer product pages, forum research, and bushing vendor documentation — all cross-checked and linked in `references.ts` and dated April 2026.
- Tolerances, leverage ratios, and clearance envelopes are reasonable defaults — **verify on your actual frame** before ordering parts.
- Ebike conversion loads on a non-ebike frame are outside the manufacturer's engineering envelope. You are taking responsibility for the consequences, including frame or pivot failure. Run the pivot health check. Consider insurance.
- Forum research found **zero documented coil conversions** on the 2013-2016 Fuel EX DRCV Full Floater frame — if you proceed on coil, you are the first publicly-documented builder. The air path via Offset Bushings or Shockcraft Deaktiv is the proven alternative.

## License

MIT.
