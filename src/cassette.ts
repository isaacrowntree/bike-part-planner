/**
 * Cassette ↔ freehub fitment.
 *
 * A cassette mounts only on its matching freehub driver body. The recurring
 * trap: "12-speed" is ambiguous — Shimano 12 = Micro Spline, SRAM Eagle 12 =
 * XD, and neither drops onto a standard HG body. SRAM 10/11/12-speed MTB
 * cassettes DO cantilever onto an HG body except Eagle (needs XD). 11-speed
 * road on a 10-speed HG body needs a 1.85 mm spacer.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type Driver = "hg" | "hg-11road" | "xd" | "xdr" | "microspline" | "campagnolo";

export interface FreehubSpec {
  driver: Driver;
  speed: number; // shifter/drivetrain speed the wheel is built around
}

export interface CassetteSpec {
  label: string;
  driver: Driver;
  speed: number;
  largestCogT: number;
}

/** HG-family bodies that interoperate with a plain HG cassette. */
const HG_FAMILY: Driver[] = ["hg", "hg-11road"];

export function checkCassetteFit(hub: FreehubSpec, cassette: CassetteSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (cassette.driver === hub.driver) {
    reasons.push(pass("driver", `${cassette.driver} cassette on a matching ${hub.driver} body`));
  } else if (HG_FAMILY.includes(cassette.driver) && HG_FAMILY.includes(hub.driver)) {
    // both HG-family: works, but 11-speed road needs the spacer on a plain HG body
    if (cassette.driver === "hg-11road" && hub.driver === "hg") {
      reasons.push(warn("driver", `11-speed road cassette on a standard HG body — needs the 1.85 mm spacer`));
    } else {
      reasons.push(pass("driver", `HG-family cassette on an HG body`));
    }
  } else {
    reasons.push(block("driver", `${cassette.driver} cassette will not mount a ${hub.driver} freehub — swap the driver body`));
    notes.push(driverAdvice(cassette.driver));
  }

  if (cassette.speed === hub.speed) {
    reasons.push(pass("speed", `${cassette.speed}-speed matches the wheel's drivetrain`));
  } else {
    reasons.push(warn("speed", `${cassette.speed}-speed cassette on a ${hub.speed}-speed setup — your shifter and chain must also be ${cassette.speed}-speed or indexing breaks`));
  }

  return resolve(reasons, notes);
}

function driverAdvice(d: Driver): string {
  switch (d) {
    case "xd": return "SRAM Eagle (10-50/10-52) needs a SRAM XD driver — most hubs sell an XD swap kit.";
    case "xdr": return "SRAM XDR is 1.85 mm longer than XD (road/gravel) — needs an XDR driver.";
    case "microspline": return "Shimano 12-speed needs a Micro Spline driver — check your hub brand offers one.";
    case "campagnolo": return "Campagnolo cassettes need a Campagnolo freehub body.";
    default: return "Swap to a driver body that matches the cassette.";
  }
}
