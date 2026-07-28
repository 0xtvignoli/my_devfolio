import type { Incident } from '@/lib/types';

/**
 * Turns a Lab session into the incident postmortem an on-call engineer would
 * actually write: summary, timeline, raw log tape, follow-ups per failure mode.
 *
 * The doc is English on purpose — postmortems are written in English even on
 * Italian teams, and it's the artefact a reviewer reads, not site copy.
 */

export type PostmortemInput = {
  incidents: Incident[];
  logs: string[];
  /** ISO timestamp for the header; passed in so the output is testable. */
  generatedAt: string;
  successfulDeploys?: number;
};

/** What to check next, per failure mode. Generic on purpose — no fake specifics. */
const FOLLOW_UPS: Record<Incident['type'], string[]> = {
  'Pod Failure': [
    'Review the liveness/readiness probe thresholds — did the restart happen before or after traffic was shifted away?',
    'Confirm PodDisruptionBudget keeps at least one replica serving during a single-pod loss.',
  ],
  'API Latency': [
    'Check the client timeout and retry budget against the observed p95 — retries on a slow path amplify load.',
    'Decide whether the latency SLO needs a burn-rate alert rather than a static threshold.',
  ],
  'CPU Spike': [
    'Compare CPU requests/limits with the spike ceiling — throttling looks like latency to the caller.',
    'Check whether HPA reacted, and how long it took to add capacity.',
  ],
};

function timeOf(timestamp: Date): string {
  // ISO slice, not toLocaleTimeString: the doc must not change with the reader's locale.
  return new Date(timestamp).toISOString().slice(11, 19);
}

export function buildPostmortem({
  incidents,
  logs,
  generatedAt,
  successfulDeploys,
}: PostmortemInput): string {
  const resolved = incidents.filter((i) => i.status === 'Resolved');
  const open = incidents.filter((i) => i.status !== 'Resolved');

  const lines: string[] = [
    '# Incident postmortem — Lab session',
    '',
    `**Generated:** ${generatedAt}`,
    '**Environment:** simulated DevOps lab — no production system was involved.',
    ...(successfulDeploys !== undefined ? [`**Deploys in session:** ${successfulDeploys}`] : []),
    '',
    '## Summary',
    '',
  ];

  if (incidents.length === 0) {
    lines.push(
      'No incidents were recorded in this session. Run a chaos experiment (pod failure,',
      'latency injection, CPU spike) to generate a timeline worth reviewing.',
      ''
    );
  } else {
    const durations = resolved
      .map((i) => parseFloat(i.duration))
      .filter((d) => Number.isFinite(d));
    const longest = durations.length ? Math.max(...durations) : null;
    lines.push(
      `${incidents.length} incident(s): ${resolved.length} resolved, ${open.length} still open.` +
        (longest !== null ? ` Longest time to recovery: ${longest.toFixed(1)}s.` : ''),
      '',
      '## Timeline',
      '',
      '| Time (UTC) | Incident | Status | Duration |',
      '|------------|----------|--------|----------|'
    );
    // Oldest first — a timeline reads forward, the UI list is newest-first.
    for (const incident of [...incidents].reverse()) {
      lines.push(
        `| ${timeOf(incident.timestamp)} | ${incident.type} | ${incident.status} | ${incident.duration} |`
      );
    }
    lines.push('');
  }

  if (logs.length > 0) {
    lines.push(`## Runtime log (${logs.length} lines)`, '', '```text', ...logs, '```', '');
  }

  const seen = new Set<Incident['type']>();
  const followUps = incidents.flatMap((i) => {
    if (seen.has(i.type)) return [];
    seen.add(i.type);
    return FOLLOW_UPS[i.type] ?? [];
  });

  if (followUps.length > 0) {
    lines.push('## Follow-ups', '', ...followUps.map((f) => `- [ ] ${f}`), '');
  }

  return lines.join('\n');
}
