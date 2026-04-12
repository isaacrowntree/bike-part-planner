import { FUEL_EX_5_2013, FUEL_EX_5_2013_SLOT } from "../src/bike.js";
import { COIL_SHOCK_CATALOG } from "../src/catalog.js";
import type { RecommendationInputs } from "../src/conversion.js";
import { CONVERSION_KITS } from "../src/conversion.js";
import type { SpringRateInputs } from "../src/springRate.js";

export const fuelExInputs = (rider: SpringRateInputs): RecommendationInputs => ({
  bike: FUEL_EX_5_2013,
  slot: FUEL_EX_5_2013_SLOT,
  rider,
  shocks: COIL_SHOCK_CATALOG,
  kits: CONVERSION_KITS,
});
