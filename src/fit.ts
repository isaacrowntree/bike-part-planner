/**
 * Shared fitment result shape for all component modules (fork, motor,
 * battery, brakes…). The rear-shock checker predates this and keeps its
 * own richer FitReason; new modules use this generic form.
 *
 * severity: "block" = cannot fit; "warn" = fits but has a consequence.
 */
export interface Reason {
  category: string;
  ok: boolean;
  severity: "block" | "warn" | "ok";
  detail: string;
}

export interface Fitment {
  fits: boolean; // true when no "block" reasons remain
  reasons: readonly Reason[];
  notes: readonly string[];
}

export const block = (category: string, detail: string): Reason => ({ category, ok: false, severity: "block", detail });
export const warn = (category: string, detail: string): Reason => ({ category, ok: true, severity: "warn", detail });
export const pass = (category: string, detail: string): Reason => ({ category, ok: true, severity: "ok", detail });

export const resolve = (reasons: Reason[], notes: string[] = []): Fitment => ({
  fits: !reasons.some((r) => r.severity === "block"),
  reasons,
  notes,
});
