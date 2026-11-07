#!/usr/bin/env bun
/**
 * Folds a canarytokens.org history export into src/data/canaries.ts.
 *
 *   bun scripts/canary-import.ts docker ~/Downloads/<token>.json [more.json …]
 *
 * [SEC] Reads only time_of_hit and the CloudTrail eventName from each hit, plus
 * whether the user agent is "AWS Internal". The export also carries the caller's
 * IP, geo and user agent: none of it is kept.
 *
 * AWS itself attaching AWSCompromisedKeyQuarantine (GitHub reported the key) is
 * not a use: it goes to quarantinedAt.
 * Several exports of the same token merge. An export holds the last 50 hits
 * at most, so `hits` is a floor and the page says "at least".
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { CANARY_CALLS, CANARY_CHANNELS, callOf, type CanaryChannelId } from '../src/data/canaries';

type Hit = { time_of_hit: number; useragent?: string; additional_info?: { aws_key_log_data?: { eventName?: string[] } } | null };

const [channel, ...files] = process.argv.slice(2);
if (!CANARY_CHANNELS.includes(channel as CanaryChannelId) || !files.length) {
  console.error(`usage: canary-import.ts <${CANARY_CHANNELS.join('|')}> <export.json…>`);
  process.exit(1);
}

const seen = new Map<string, Hit>();
for (const f of files) {
  for (const h of (JSON.parse(readFileSync(f, 'utf8')) as { hits: Hit[] }).hits) {
    const events = h.additional_info?.aws_key_log_data?.eventName ?? [];
    seen.set(`${h.time_of_hit}|${events.join(',')}`, h);
  }
}
const iso = (s: number) => new Date(s * 1000).toISOString().replace(/\.\d+Z$/, 'Z');
const all = [...seen.values()];
const isQuarantine = (h: Hit) => h.useragent === 'AWS Internal';
const quarantine = all.filter(isQuarantine).map((h) => h.time_of_hit);
const hits = all.filter((h) => !isQuarantine(h));
if (!all.length) throw new Error('no hits in the export');

const first = hits.length ? iso(Math.min(...hits.map((h) => h.time_of_hit))) : null;
const path = new URL('../src/data/canaries.ts', import.meta.url);
const src = readFileSync(path, 'utf8');
// Merge with what is already recorded: an export only holds the last 50 hits.
const entry = src.match(new RegExp(`\\{ id: '${channel}',[^\\n]*`))?.[0] ?? '';
const prevCalls = [...(entry.match(/calls: \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
const prevHits = Number(entry.match(/hits: (\d+)/)?.[1] ?? 0);
const found = new Set([...prevCalls, ...hits.flatMap((h) => (h.additional_info?.aws_key_log_data?.eventName ?? []).map(callOf))]);
const calls = CANARY_CALLS.filter((c) => found.has(c));
const count = Math.max(prevHits, hits.length);
const line = new RegExp(`(\\{ id: '${channel}', plantedAt: [^,]+, )firstUseAt: [^,]+, calls: \\[[^\\]]*\\](?:, hits: \\d+)?(?:, quarantinedAt: '[^']+')?`);
if (!line.test(src)) throw new Error(`no entry for ${channel} in canaries.ts`);
// Keep an earlier first use if the new export no longer reaches back that far.
const prev = src.match(new RegExp(`id: '${channel}'[^\\n]*firstUseAt: '([^']+)'`))?.[1];
const firstUse = prev && (!first || prev < first) ? prev : first;
const q = quarantine.length ? `, quarantinedAt: '${iso(Math.min(...quarantine))}'` : '';
const use = firstUse ? `'${firstUse}'` : 'null';
writeFileSync(path, src.replace(line, `$1firstUseAt: ${use}, calls: [${calls.map((c) => `'${c}'`).join(', ')}]${count ? `, hits: ${count}` : ''}${q}`));
console.log(`${channel}: first use ${firstUse ?? '—'}, ${count} calls${q && `, quarantined ${iso(Math.min(...quarantine))}`}`);
