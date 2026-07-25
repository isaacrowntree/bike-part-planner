/**
 * Front derailleur fitment (2x/3x). Crisp, checkable inputs: how it mounts
 * (clamp diameter vs braze-on vs direct-mount), cable pull direction (top /
 * bottom / dual), the largest chainring it can throw over, total capacity
 * (double vs triple), and speed.
 */
import { block, warn, pass, resolve, type Fitment, type Reason } from "./fit.js";

export type FDMount = "clamp-28.6" | "clamp-31.8" | "clamp-34.9" | "braze-on" | "direct-mount";
export type Pull = "top" | "bottom" | "dual";

export interface FrameFDMount {
  mount: FDMount;
  pull: Pull; // routing the frame presents
}
export interface FrontDerailleurSpec {
  label: string;
  mount: FDMount;
  pull: Pull;
  maxChainringT: number;
  capacityT: number; // big-small ring difference it can handle
  speed: number;
}
export interface FrontDrivetrain {
  bigRingT: number;
  smallRingT: number;
  speed: number;
}

export function checkFrontDerailleurFit(frame: FrameFDMount, fd: FrontDerailleurSpec, dt: FrontDrivetrain): Fitment {
  const reasons: Reason[] = [];
  const notes: string[] = [];

  if (fd.mount === frame.mount) {
    reasons.push(pass("mount", `${fd.mount} matches the frame`));
  } else {
    reasons.push(block("mount", `${fd.mount} derailleur won't fit a ${frame.mount} frame — mount interface is fixed`));
  }

  if (fd.pull === frame.pull || fd.pull === "dual") {
    reasons.push(pass("pull", `${fd.pull}-pull suits the frame's ${frame.pull} routing`));
  } else {
    reasons.push(block("pull", `${fd.pull}-pull derailleur on ${frame.pull}-pull routing — cable will run the wrong way`));
  }

  if (dt.bigRingT <= fd.maxChainringT) {
    reasons.push(pass("max-ring", `${dt.bigRingT}T big ring within the ${fd.maxChainringT}T limit`));
  } else {
    reasons.push(block("max-ring", `${dt.bigRingT}T big ring exceeds the derailleur's ${fd.maxChainringT}T max`));
  }

  const diff = dt.bigRingT - dt.smallRingT;
  if (diff <= fd.capacityT) {
    reasons.push(pass("capacity", `${diff}T ring difference within ${fd.capacityT}T capacity`));
  } else {
    reasons.push(warn("capacity", `${diff}T ring jump exceeds ${fd.capacityT}T — front shifts will be sluggish/imprecise`));
  }

  if (fd.speed === dt.speed) {
    reasons.push(pass("speed", `${fd.speed}-speed matches`));
  } else {
    reasons.push(warn("speed", `${fd.speed}-speed FD on a ${dt.speed}-speed drivetrain — cage width is tuned per speed; shifting may rub`));
  }

  return resolve(reasons, notes);
}
