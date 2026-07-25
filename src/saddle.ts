/**
 * Saddle ↔ seatpost rail fitment. A seatpost head accepts specific rail shapes:
 * round 7 mm (steel/alloy/ti), oval 7×9 mm alloy, and larger 7×9 / 7×10 mm
 * carbon ovals that need a carbon-specific clamp. A round-rail clamp won't hold
 * an oval carbon rail and vice-versa — the common overlooked blocker.
 */
import { block, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type Rail = "round-7" | "oval-7x9-alloy" | "oval-7x9-carbon" | "oval-7x10-carbon";

export interface SeatpostHead {
  label: string;
  accepts: Rail[];
}
export interface SaddleSpec {
  label: string;
  rail: Rail;
}

export function checkSaddleFit(post: SeatpostHead, saddle: SaddleSpec): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];
  if (post.accepts.includes(saddle.rail)) {
    reasons.push(pass("rail", `${saddle.rail} rail fits this seatpost head`));
  } else {
    reasons.push(block("rail", `${saddle.rail} rail isn't accepted by this post (takes ${post.accepts.join(", ")})`));
    if (saddle.rail.includes("carbon")) {
      notes.push("Carbon oval rails need a clamp shaped and rated for them — a round-rail or alloy clamp can crush or slip on carbon.");
    }
  }
  return resolve(reasons, notes);
}
