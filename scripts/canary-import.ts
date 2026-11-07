#!/usr/bin/env bun
/**
 * Folds a canarytokens.org history export into src/data/canaries.ts.
 *
 *   bun scripts/canary-import.ts docker ~/Downloads/<token>.json [more.json …]
 *
 * [SEC] Reads only time_of_hit and the CloudTrail eventName from each hit. The
 * export also carries the caller's IP, geo and user agent: none of it is kept.
 * Several exports of the same token merge. An export holds the last 50 hits
 * at most, so `hits` is a floor and the page says "at least".
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { CANARY_CALLS, CANARY_CHANNELS, callOf, type CanaryChannelId } from '../src/data/canaries';

type Hit = { time_of_hit: number; additional_info?: { aws_key_log_data?: { eventName?: string[] } } };

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
const hits = [...seen.values()];
if (!hits.length) throw new Error('no hits in the export');

const first = new Date(Math.min(...hits.map((h) => h.time_of_hit)) * 1000).toISOString().replace(/\.\d+Z$/, 'Z');
const found = new Set(hits.flatMap((h) => (h.additional_info?.aws_key_log_data?.eventName ?? []).map(callOf)));
const calls = CANARY_CALLS.filter((c) => found.has(c));

const path = new URL('../src/data/canaries.ts', import.meta.url);
const src = readFileSync(path, 'utf8');
const line = new RegExp(`(\\{ id: '${channel}', plantedAt: [^,]+, )firstUseAt: [^,]+, calls: \\[[^\\]]*\\](?:, hits: \\d+)?`);
if (!line.test(src)) throw new Error(`no entry for ${channel} in canaries.ts`);
// Keep an earlier first use if the new export no longer reaches back that far.
const prev = src.match(new RegExp(`id: '${channel}'[^\\n]*firstUseAt: '([^']+)'`))?.[1];
const firstUse = prev && prev < first ? prev : first;
writeFileSync(path, src.replace(line, `$1firstUseAt: '${firstUse}', calls: [${calls.map((c) => `'${c}'`).join(', ')}], hits: ${hits.length}`));
console.log(`${channel}: first use ${firstUse}, ${hits.length} calls, ${calls.join(' · ')}`);
