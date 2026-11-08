#!/usr/bin/env bun
/**
 * Folds canarytokens.org history exports into src/data/canaries.ts, the
 * baseline the page starts from (it also fetches live exports, see
 * src/lib/canaries-live.ts, but those hold only the last 50 hits).
 *
 *   bun scripts/canary-import.ts docker ~/Downloads/<token>.json [more.json …]
 *
 * [SEC] foldHits keeps only times, call kinds and the quarantine flag.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { CANARIES, CANARY_CHANNELS, foldHits, type Canary, type CanaryHit } from '../src/data/canaries';

const [channel, ...files] = process.argv.slice(2);
const base = CANARIES.find((c) => c.id === channel);
if (!base || !files.length) {
  console.error(`usage: canary-import.ts <${CANARY_CHANNELS.join('|')}> <export.json…>`);
  process.exit(1);
}
const hits = files.flatMap((f) => (JSON.parse(readFileSync(f, 'utf8')) as { hits: CanaryHit[] }).hits);
if (!hits.length) throw new Error('no hits in the export');
const c = foldHits(base, hits);

const q = (s: string | null) => (s ? `'${s}'` : 'null');
const lit = (x: Canary) =>
  `{ id: '${x.id}', plantedAt: ${q(x.plantedAt)}, firstUseAt: ${q(x.firstUseAt)}, calls: [${x.calls.map((k) => `'${k}'`).join(', ')}]` +
  `${x.hits ? `, hits: ${x.hits}` : ''}${x.quarantinedAt ? `, quarantinedAt: '${x.quarantinedAt}'` : ''}${x.blocked ? ', blocked: true' : ''} }`;
const path = new URL('../src/data/canaries.ts', import.meta.url);
writeFileSync(path, readFileSync(path, 'utf8').replace(new RegExp(`\\{ id: '${channel}',[^\\n]*\\}`), lit(c)));
console.log(`${channel}: first use ${c.firstUseAt ?? '—'}, ${c.hits ?? 0} calls${c.quarantinedAt ? `, quarantined ${c.quarantinedAt}` : ''}`);
