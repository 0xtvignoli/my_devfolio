import { describe, expect, test } from 'bun:test';
import { computeErrorBudget, DEFAULT_SLO } from './error-budget';
import type { Incident } from './types';

const NOW = new Date('2026-07-27T10:10:00Z').getTime();

const incident = (over: Partial<Incident> = {}): Incident => ({
  id: 'inc-1',
  type: 'API Latency',
  status: 'Resolved',
  duration: '60.0s',
  timestamp: new Date('2026-07-27T10:00:00Z'),
  ...over,
});

describe('computeErrorBudget', () => {
  test('99.9% over 30 days is 43.2 minutes of budget', () => {
    const budget = computeErrorBudget({ incidents: [], latencyMs: 100, observedMinutes: 10, now: NOW });
    expect(budget.budgetMinutes).toBeCloseTo(43.2, 5);
    expect(budget.remainingPct).toEqual(100);
    expect(budget.status).toEqual('healthy');
    expect(budget.exhaustsInHours).toEqual(null);
  });

  test('a resolved incident consumes its own duration', () => {
    const budget = computeErrorBudget({
      incidents: [incident({ duration: '60.0s' })],
      latencyMs: 100,
      observedMinutes: 10,
      now: NOW,
    });
    expect(budget.consumedMinutes).toBeCloseTo(1, 5);
    expect(budget.remainingMinutes).toBeCloseTo(42.2, 5);
  });

  test('an unresolved incident keeps burning from its timestamp', () => {
    const budget = computeErrorBudget({
      incidents: [incident({ status: 'Investigating', duration: '—' })],
      latencyMs: 100,
      observedMinutes: 10,
      now: NOW,
    });
    // Opened at 10:00, now 10:10.
    expect(budget.consumedMinutes).toBeCloseTo(10, 5);
  });

  test('burn rate above 1 warns, and projects an exhaustion time', () => {
    const budget = computeErrorBudget({
      incidents: [incident({ duration: '60.0s' })],
      latencyMs: 100,
      observedMinutes: 10,
      now: NOW,
    });
    // 1 min lost in 10 observed = 10% unavailability vs 0.1% allowed → 100x.
    expect(budget.burnRate).toBeCloseTo(100, 5);
    expect(budget.status).toEqual('warning');
    expect(budget.exhaustsInHours).toBeGreaterThan(0);
  });

  test('exhausted budget reports 0% and never goes negative', () => {
    const budget = computeErrorBudget({
      incidents: [incident({ duration: '9000.0s' })],
      latencyMs: 100,
      observedMinutes: 200,
      now: NOW,
    });
    expect(budget.remainingMinutes).toEqual(0);
    expect(budget.remainingPct).toEqual(0);
    expect(budget.status).toEqual('exhausted');
  });

  test('latency compliance follows the objective', () => {
    const base = { incidents: [], observedMinutes: 10, now: NOW };
    expect(computeErrorBudget({ ...base, latencyMs: DEFAULT_SLO.latencyTargetMs }).latencyCompliant).toEqual(true);
    expect(computeErrorBudget({ ...base, latencyMs: DEFAULT_SLO.latencyTargetMs + 1 }).latencyCompliant).toEqual(false);
  });

  test('a zero-length observation window does not divide by zero', () => {
    const budget = computeErrorBudget({ incidents: [], latencyMs: 100, observedMinutes: 0, now: NOW });
    expect(budget.burnRate).toEqual(0);
    expect(Number.isFinite(budget.remainingPct)).toEqual(true);
  });
});
