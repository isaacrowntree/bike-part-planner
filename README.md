# bike-part-planner

A **test-driven, code-as-data** engine for the question every rider Googles before spending money: **will this part actually fit my bike?**

It answers that for real per-component fitment — suspension, ebike drive systems, drivetrain, brakes, wheels and tyres, and the contact points — not with a black-box yes/no, but with a **verdict and its reasons**: what passes, what needs an adapter, and what won't work, each spelled out. It started as one question ("can I fit a coil shock to my 2013 Trek Fuel EX 5 ebike conversion?" — hence the original `bike-shock-planner` name) and generalised into a framework any bike and any part category can plug into.

## Design principles

These are the parts that don't change as the catalog grows:

- **Deterministic core, AI at the edges.** Every fitment tolerance is computed by tested TypeScript. AI is used only to *read* messy inputs (a spec-sheet PDF, a typed description) into structured data — it never decides whether a part fits. The maths is auditable; the LLM is not in the loop for the answer.
- **Code-as-data.** Bikes, parts, and standards are TypeScript, not a database or a PDF. That means the test suite can assert invariants ("no reservoir clash on any frame", "every catalog link is HTTPS", "the guided-measurement options match what the engine accepts") and a contributor can submit a pull request against a fact.
- **Verdicts, not booleans.** A check returns a `Fitment`: a list of `Reason`s each tagged `block` / `warn` / `pass`, plus notes. "It fits" and "it fits *with a +20 mm adapter*" and "it will physically mount but is a known failure risk" are different answers, and the engine keeps them different.
- **Interfaces as adapter problems.** The recurring shape — bottom bracket, freehub, rotor mount, headset — is `frame-side standard × part-side standard → native | needs-adapter | incompatible`, not a flat compatibility flag. Modelling it that way captures most real-world questions deterministically.
- **Honest about provenance.** Some numbers are hard standards (ISO bead-seat diameters, thread pitches); others are practitioner rules of thumb (torque-arm wattages, conversion loads). The engine labels which is which rather than presenting folklore as spec.
- **The test suite is the schema.** Adding a bike, part, or module with a missing or impossible field breaks a test, loudly, at author time — not during a build two weeks before a trip.

## What it covers

Coverage is organised as one self-contained module per part category, and grows over time — see `src/` for the current set. Broadly: rear shocks (fitment, coil/air conversions, spring rates), forks, ebike drive (mid-drive and hub motors) and batteries with range estimation, drivetrain (cassette/freehub, derailleurs, chainrings, chain, bottom bracket), brakes (rotors and mounts, pads, hoses), wheels and tyres, the cockpit and contact points (dropper, headset, stem/bar, saddle, pedals), plus whole-bike concerns: **ebike-conversion frame suitability** and region-aware **legality** (advisory).

Each module is small, independently tested, and follows the same shape, so the list above will be out of date the moment a new one lands — the source and its tests are the source of truth.

## How a fitment check works

Every check, whatever the part, has the same signature and result shape:

```ts
import { checkForkFit } from "./src/fork.js";

const verdict = checkForkFit(frame, fork);
// → { fits: boolean, reasons: Reason[], notes: string[], ... }
// Reason = { category, severity: "block" | "warn" | "pass", detail }
```

The shared vocabulary lives in `src/fit.ts` (the `Fitment` / `Reason` result types and the `block` / `warn` / `pass` / `resolve` helpers) and `src/standards.ts` (the cross-cutting bike standards — wheel sizes, axle types, BB shells, chainline, actuation ratios — defined once so no two modules can disagree). A UI can render any module's result identically because they all speak `Fitment`.

## Guided measurement + AI

Manufacturers reliably publish *geometry* but often omit the *interface standards* a fitment check needs (BB shell type, dropout spacing, seat-tube inner diameter, brake-mount native size). Two things fill that gap:

- **AI extraction** turns a spec-sheet PDF or a typed description into a structured bike record — reading, not deciding.
- **Guided measurement** (`src/measure.ts`) asks the rider for the missing facts with plain-language how-to and validation that rejects impossible values, so a mistyped "40 mm BB shell" can't poison the shared record. Each measurement declares which checks it feeds, so the UI asks only what a given part actually needs.

## Running

```bash
npm install
npm test          # run the full suite
npx tsx src/cli.ts   # human-readable report for the default profile
```

`npm test` is the fastest way to see what the engine currently guarantees — the test names read as a spec of the encoded behaviour, and `test/accuracy-audit.test.ts` in particular pins the real-world standards and the exact pass/warn/block boundaries.

## Extending it

The model is designed to be forked and extended. To add a part category:

1. Add `src/<part>.ts` exporting a `check<Part>Fit(frame, part): Fitment`, built from the shared helpers in `fit.ts` and the standards in `standards.ts`.
2. Add `test/<part>.test.ts` covering the fits / warns / blocks cases — and, for any hard number, an assertion in the accuracy audit so a future edit can't silently move it.
3. If the check needs frame data a spec sheet won't have, add the measurement(s) to `src/measure.ts` with a how-to, validation, and the `feeds` tag naming the new check.

To add a bike or a part to an existing catalog, add the typed record and run the tests — they enforce the required fields.

A bike shop can fork this, replace the catalog with current inventory, and run the checks programmatically against a customer's frame to power a "will this fit your bike?" widget with the full test suite's dimensional enforcement behind it.

## Disclaimers

- This is a tool to *inform*, not a guarantee. Tolerances, leverage ratios, and clearance envelopes are reasonable defaults — **verify on your actual frame before ordering parts.**
- Numbers come from manufacturer service documents, product pages, standards references, and cross-checked practitioner research; where a figure is a rule of thumb rather than a certified limit, the engine says so.
- Ebike-conversion loads on a frame not designed for them are outside the manufacturer's engineering envelope. You take responsibility for the consequences, including frame or component failure. Heed the conversion-suitability warnings; consider insurance.
- Road-legality output is advisory and region-dependent — confirm your local rules before riding on public land.

## License

MIT.
