/**
 * Dropper seatpost fitment — the most-asked non-suspension upgrade.
 *
 * Three things sink a dropper choice: the wrong diameter, not enough seat
 * tube to swallow the post's insertion length (the classic "I bought 170 mm
 * travel and it won't go down far enough on a size S"), and routing the frame
 * can't take. Diameter can be shimmed UP a step (30.9 post in a 31.6 tube),
 * never down. Insertion is the hard limit.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type SeatTubeId = 27.2 | 30.9 | 31.6 | 34.9;
export type Routing = "internal" | "external";

export interface SeatTube {
  idMm: SeatTubeId;
  /** Usable straight insertion depth: collar down to the first kink / bottle
   *  boss / pivot / bend that stops the post. The real limiter on small frames. */
  maxInsertMm: number;
  routing: Routing;
}

export interface DropperSpec {
  label: string;
  diameterMm: SeatTubeId;
  travelMm: number;
  /** Total length collar-to-bottom the frame must swallow at full insertion. */
  insertionLengthMm: number;
  routing: Routing;
}

/** Shim steps that exist as off-the-shelf parts (post Ø → tube Ø). */
const SHIMMABLE: Record<number, SeatTubeId[]> = {
  27.2: [30.9, 31.6],
  30.9: [31.6, 34.9],
  31.6: [34.9],
};

export function checkDropperFit(frame: SeatTube, post: DropperSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (post.diameterMm === frame.idMm) {
    reasons.push(pass("diameter", `${post.diameterMm} mm post matches the seat tube`));
  } else if ((SHIMMABLE[post.diameterMm] ?? []).includes(frame.idMm)) {
    reasons.push(warn("diameter", `${post.diameterMm} mm post in a ${frame.idMm} mm tube — needs a ${post.diameterMm}→${frame.idMm} shim`));
  } else {
    reasons.push(block("diameter", `${post.diameterMm} mm post will not fit a ${frame.idMm} mm seat tube (can't shim down)`));
  }

  if (post.insertionLengthMm <= frame.maxInsertMm) {
    reasons.push(pass("insertion", `needs ${post.insertionLengthMm} mm insertion, frame gives ${frame.maxInsertMm} mm`));
  } else {
    reasons.push(block("insertion", `needs ${post.insertionLengthMm} mm insertion but the seat tube only offers ${frame.maxInsertMm} mm`));
    notes.push(`Drop to a shorter-travel dropper: at roughly ${Math.max(0, frame.maxInsertMm)} mm usable insertion, a lower-travel post (e.g. ${suggestTravel(post, frame)} mm) is the fit.`);
  }

  if (post.routing === "external" || frame.routing === "internal") {
    reasons.push(pass("routing", `${post.routing} post works with ${frame.routing} routing`));
  } else {
    // internal post on an external-only frame — no port to run the cable in
    reasons.push(block("routing", `internal-routed post but the frame has no internal port — needs an externally-routed dropper`));
  }

  return resolve(reasons, notes);
}

/** Crude "what travel would fit" hint: assume ~ each 30 mm of travel adds ~30 mm insertion. */
function suggestTravel(post: DropperSpec, frame: SeatTube): number {
  const overshootMm = post.insertionLengthMm - frame.maxInsertMm;
  const steps = Math.ceil(overshootMm / 30) * 30;
  return Math.max(0, post.travelMm - steps);
}
