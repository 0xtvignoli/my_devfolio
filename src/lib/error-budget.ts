import type { Incident } from '@/lib/types';

/**
 * Error-budget maths for the lab's SLO panel. The point isn't the numbers —
 * it's showing the reasoning an SRE actually applies: a budget, what ate it,
 * and how fast. Burn rate over a short session is deliberately dramatic; that's
 * what a burn-rate alert is for.
 */

export type Slo = {
  /** Compliance window in days. */
  windowDays: number;
  /** Availability target, e.g. 99.9 (%). */
  availabilityTarget: number;
  /** p95 latency objective in ms. */
  latencyTargetMs: number;
};

export const DEFAULT_SLO: Slo = {
  windowDays: 30,
  availabilityTarget: 99.9,
  latencyTargetMs: 250,
};

export type ErrorBudget = {
  /** Minutes of downtime the objective permits across the window. */
  budgetMinutes: number;
  consumedMinutes: number;
  remainingMinutes: number;
  remainingPct: number;
  /** Multiples of the sustainable consumption rate. 1 = exactly on budget. */
  burnRate: number;
  /** Hours until the budget is gone at the current rate; null when not burning. */
  exhaustsInHours: number | null;
  latencyCompliant: boolean;
  status: 'healthy' | 'warning' | 'exhausted';
};

/** Incident durations are display strings like "8.0s" — "—" while unresolved. */
function resolvedMinutes(incident: Incident): number {
  const seconds = parseFloat(incident.duration);
  return Number.isFinite(seconds) ? seconds / 60 : 0;
}

export function computeErrorBudget({
  incidents,
  latencyMs,
  observedMinutes,
  now,
  slo = DEFAULT_SLO,
}: {
  incidents: Incident[];
  latencyMs: number;
  /** How long this session has been observed — the denominator of the burn rate. */
  observedMinutes: number;
  now: number;
  slo?: Slo;
}): ErrorBudget {
  const windowMinutes = slo.windowDays * 24 * 60;
  const budgetMinutes = windowMinutes * (1 - slo.availabilityTarget / 100);

  const consumedMinutes = incidents.reduce((total, incident) => {
    if (incident.status === 'Resolved') return total + resolvedMinutes(incident);
    // Still burning: count the time elapsed since it opened.
    return total + Math.max(0, (now - new Date(incident.timestamp).getTime()) / 60_000);
  }, 0);

  const remainingMinutes = Math.max(0, budgetMinutes - consumedMinutes);
  const remainingPct = budgetMinutes > 0 ? (remainingMinutes / budgetMinutes) * 100 : 0;

  // Burn rate = observed unavailability / the rate the objective allows.
  const allowedFraction = 1 - slo.availabilityTarget / 100;
  const observedFraction = observedMinutes > 0 ? consumedMinutes / observedMinutes : 0;
  const burnRate = allowedFraction > 0 ? observedFraction / allowedFraction : 0;

  const minutesPerHour = burnRate * allowedFraction * 60;
  const exhaustsInHours = minutesPerHour > 0 ? remainingMinutes / minutesPerHour : null;

  const status = remainingPct <= 0 ? 'exhausted' : burnRate > 1 || remainingPct < 25 ? 'warning' : 'healthy';

  return {
    budgetMinutes,
    consumedMinutes,
    remainingMinutes,
    remainingPct,
    burnRate,
    exhaustsInHours,
    latencyCompliant: latencyMs <= slo.latencyTargetMs,
    status,
  };
}
