/**
 * Recipe: 2013 Trek Fuel EX 5 — Bafang BBS02 ebike coil/air conversion.
 *
 * This is the original build that started the project. Isaac's 96kg rider
 * profile with a Bafang BBS02 1000W mid-drive, 52V 15Ah 780Wh battery,
 * replacing a dead stock RockShox Monarch RL air shock.
 *
 * Fork this file to create your own recipe for a different bike.
 */

import { FUEL_EX_5_2013, FUEL_EX_5_2013_SLOT } from "../../src/bike.js";
import {
  AIR_SHOCK_CATALOG,
  COIL_SHOCK_CATALOG,
  SPRING_CATALOG,
} from "../../src/catalog.js";
import { CONVERSION_KITS } from "../../src/conversion.js";
import type { Recipe } from "../../src/recipe.js";
import { ISAAC_96KG_EBIKE } from "../../src/rider.js";

export const recipe: Recipe = {
  name: "Isaac's 2013 Trek Fuel EX 5 — Bafang BBS02 ebike",
  slug: "fuel-ex-5-2013-ebike",
  description:
    "96kg rider on a 2013 Trek Fuel EX 5 (26\", 130mm, Full Floater DRCV) " +
    "converted to a Bafang BBS02 1000W mid-drive ebike with 52V/15Ah/780Wh " +
    "battery. Stock RockShox Monarch RL air shock is dead — evaluating coil " +
    "conversion vs modern air replacement via Offset Bushings / Shockcraft " +
    "Deaktiv conversion kit. Zero documented coil builds on this frame " +
    "generation — air path is proven, coil is experimental.",

  bike: FUEL_EX_5_2013,
  frameSlot: FUEL_EX_5_2013_SLOT,
  rider: ISAAC_96KG_EBIKE,

  coilShocks: COIL_SHOCK_CATALOG,
  airShocks: AIR_SHOCK_CATALOG,
  springs: SPRING_CATALOG,
  conversionKits: CONVERSION_KITS,

  targetSagFraction: 0.3,
};

export default recipe;
