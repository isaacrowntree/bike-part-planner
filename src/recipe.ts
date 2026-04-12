import type { BikeSuspension, FrameShockSlot } from "./bike.js";
import type { CatalogAirShock, CatalogShock, CatalogSpring } from "./catalog.js";
import type { ConversionKit } from "./conversion.js";
import type { RiderProfile } from "./rider.js";
import type { Reference } from "./references.js";

/**
 * A Recipe is a self-contained configuration describing one bike + rider
 * + the candidate parts and kits to evaluate. The engine
 * (`recommendCoilConversion`, `checkShockFit`, `estimateSpringRate`) is
 * generic — it takes a Recipe and produces fit reports.
 *
 * Add a new recipe by creating a `recipes/<name>/recipe.ts` that exports
 * a `Recipe` conforming to this interface. The CLI auto-discovers
 * recipes by directory name or loads a default.
 */
export interface Recipe {
  /** Human label for this build (shown in CLI header). */
  name: string;
  /** Short slug used as directory name under recipes/. */
  slug: string;
  /** Freeform notes about the build motivation, caveats, etc. */
  description: string;

  bike: BikeSuspension;
  frameSlot: FrameShockSlot;
  rider: RiderProfile;

  /** Coil shocks to evaluate against the frame slot. */
  coilShocks: readonly CatalogShock[];
  /** Air shocks to surface as an alternative path. */
  airShocks: readonly CatalogAirShock[];
  /** Springs to recommend for coil conversions. */
  springs: readonly CatalogSpring[];
  /** Conversion kits that can bridge mounting mismatches. */
  conversionKits: readonly ConversionKit[];

  /** Verified reference links for this build. */
  references?: readonly Reference[];

  /** Sag target for spring rate calculations. */
  targetSagFraction: number;
}
