import { describe, expect, test } from 'bun:test';
import { buildPostmortem } from './postmortem';
import type { Incident } from './types';

const at = (iso: string): Date => new Date(iso);

const incident = (over: Partial<Incident> = {}): Incident => ({
  id: 'inc-1',
  type: 'API Latency',
  status: 'Resolved',
  duration: '8.0s',
  timestamp: at('2026-07-27T10:00:01Z'),
  ...over,
});

describe('buildPostmortem', () => {
  test('says so plainly when nothing happened', () => {
    const md = buildPostmortem({ incidents: [], logs: [], generatedAt: '2026-07-27T10:05:00Z' });
    expect(md).toMatch(/No incidents were recorded/);
    expect(md).not.toMatch(/## Timeline/);
  });

  test('summarises, orders the timeline oldest-first, and adds per-type follow-ups', () => {
    const md = buildPostmortem({
      // UI order is newest-first; the doc must flip it.
      incidents: [
        incident({ id: 'inc-2', type: 'Pod Failure', status: 'Investigating', duration: '—', timestamp: at('2026-07-27T10:00:30Z') }),
        incident(),
      ],
      logs: ['10:00:01: 💥 chaos latency', '10:00:09: ✅ recovered'],
      generatedAt: '2026-07-27T10:05:00Z',
      successfulDeploys: 3,
    });

    expect(md).toMatch(/2 incident\(s\): 1 resolved, 1 still open/);
    expect(md).toMatch(/Longest time to recovery: 8\.0s/);
    expect(md).toMatch(/\*\*Deploys in session:\*\* 3/);
    // API Latency (10:00:01) must precede Pod Failure (10:00:30).
    expect(md.indexOf('API Latency')).toBeLessThan(md.indexOf('Pod Failure'));
    expect(md).toMatch(/Runtime log \(2 lines\)/);
    expect(md).toMatch(/- \[ \] Check the client timeout/);
    expect(md).toMatch(/- \[ \] Review the liveness/);
  });

  test('emits UTC times, not the reader locale', () => {
    const md = buildPostmortem({
      incidents: [incident()],
      logs: [],
      generatedAt: '2026-07-27T10:05:00Z',
    });
    expect(md).toMatch(/\| 10:00:01 \| API Latency \| Resolved \| 8\.0s \|/);
  });

  test('does not repeat follow-ups for repeated incident types', () => {
    const md = buildPostmortem({
      incidents: [incident({ id: 'a' }), incident({ id: 'b' })],
      logs: [],
      generatedAt: '2026-07-27T10:05:00Z',
    });
    expect(md.match(/Check the client timeout/g)?.length).toEqual(1);
  });
});
