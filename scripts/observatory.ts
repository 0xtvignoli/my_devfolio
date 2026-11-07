#!/usr/bin/env bun
/**
 * Builds src/data/observatory.json from Cloudflare's HTTP analytics.
 *
 *   CLOUDFLARE_ANALYTICS_TOKEN=… CLOUDFLARE_ZONE_ID=… bun scripts/observatory.ts
 *
 * Token: one permission only, Zone → Analytics → Read, on this zone.
 * Runs before every `next build`; .github/workflows/observatory.yml triggers a
 * daily rebuild through a Vercel deploy hook. Without the variables (local
 * builds, previews) it keeps the committed file, so the page always renders.
 * A Cloudflare failure keeps it too: stale data never blocks a deploy, and the
 * page shows its own "updated" date.
 *
 * [SEC] Privacy and injection, both handled here and nowhere else:
 *   - no IPs are queried, let alone written; countries and client families only
 *   - paths and user agents are reduced to labels from lib/observatory/classify,
 *     so nothing an attacker typed reaches the published file
 */
import { writeFileSync } from 'node:fs';
import { CATEGORIES, classifyClient, classifyRequest, countryCode, type Category } from '../src/lib/observatory/classify';
import type { Observatory } from '../src/lib/observatory/types';

const TOKEN = process.env.CLOUDFLARE_ANALYTICS_TOKEN;
const ZONE = process.env.CLOUDFLARE_ZONE_ID;
if (!TOKEN || !ZONE) {
  console.log('observatory: no Cloudflare credentials, keeping the committed data');
  process.exit(0);
}

// Free plan: 14 days of history. The window ends at the last UTC midnight, so it
// holds 13 complete days whatever hour the build runs (the daily one is 00:01).
const DAYS = 13;
const LIMIT = 10_000;
const now = new Date();
const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const from = new Date(to.getTime() - DAYS * 86_400_000);

type Row = { count: number; dimensions: Record<string, string | number> };

async function query(dimensions: string, filter = ''): Promise<Row[]> {
  const body = {
    query: `query($z:String!,$s:Time!,$u:Time!){viewer{zones(filter:{zoneTag:$z}){
      httpRequestsAdaptiveGroups(limit:${LIMIT},filter:{datetime_geq:$s,datetime_lt:$u${filter}}){count dimensions{${dimensions}}}}}}`,
    variables: { z: ZONE, s: from.toISOString(), u: to.toISOString() },
  };
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { data?: { viewer: { zones: { httpRequestsAdaptiveGroups: Row[] }[] } }; errors?: { message: string }[] };
  if (!res.ok || json.errors?.length) throw new Error(`Cloudflare GraphQL: ${json.errors?.[0]?.message ?? res.status}`);
  const rows = json.data!.viewer.zones[0].httpRequestsAdaptiveGroups;
  // A full page means groups were cut: the totals would be silently low.
  if (rows.length === LIMIT) throw new Error(`query hit the ${LIMIT}-group limit: ${dimensions}`);
  return rows;
}

const add = (map: Map<string, number>, key: string, n: number) => map.set(key, (map.get(key) ?? 0) + n);
const top = (map: Map<string, number>, n: number) =>
  [...map].sort((a, b) => b[1] - a[1]).slice(0, n);

const DEFENSE_LAYER: Record<string, string> = {
  firewallManaged: 'Cloudflare managed rules',
  firewallCustom: 'Custom WAF rule',
  botFight: 'Bot Fight Mode',
  linkMaze: 'AI Labyrinth',
};

const results = await Promise.all([
  query('date securityAction securitySource edgeResponseStatus'),
  query('date clientRequestPath clientRequestHTTPMethodName clientCountryName userAgent edgeResponseStatus', ',edgeResponseStatus_geq:400'),
  query(
    'date clientRequestPath clientRequestHTTPMethodName clientCountryName userAgent edgeResponseStatus',
    ',edgeResponseStatus_lt:400,clientRequestHTTPMethodName_in:["POST","PUT","PATCH","DELETE"]',
  ),
]).catch((error: unknown) => {
  console.warn(`observatory: ${error instanceof Error ? error.message : error}; keeping the committed data`);
  process.exit(0);
});
const [overview, failed, writes] = results;

const requestsByDay = new Map<string, number>();
const hostileByDay = new Map<string, number>();
const defenses = new Map<string, number>();
let requests = 0;
let stopped = 0;
let maze = 0;

for (const { count, dimensions: d } of overview) {
  requests += count;
  add(requestsByDay, String(d.date), count);
  const layer = DEFENSE_LAYER[String(d.securitySource)];
  if (layer) add(defenses, layer, count);
  if (d.securitySource === 'linkMaze') maze += count;
  else if (d.securityAction === 'block' || String(d.securityAction).includes('challenge') || d.edgeResponseStatus === 403) stopped += count;
}

const categories = new Map<string, number>();
const categoryByDay = new Map<string, Map<string, number>>();
const targets = new Map<string, number>();
const targetCategory = new Map<string, Category>();
const countries = new Map<string, number>();
const clients = new Map<string, number>();
// Same three lists, split by category, for the filter on /lab.
const split = new Map<Category, { targets: Map<string, number>; countries: Map<string, number>; clients: Map<string, number> }>();
let hostile = 0;

for (const { count, dimensions: d } of [...failed, ...writes]) {
  // Cloudflare's own Early Hints prefetches replay the visitor's path and often
  // time out (504): internal traffic, and counting it would double each probe.
  if (/early hints$/i.test(String(d.userAgent))) continue;
  const { category, target } = classifyRequest(String(d.clientRequestHTTPMethodName), String(d.clientRequestPath));
  // Unclassified failures are mostly broken links and timeouts, not attacks —
  // unless the edge refused them.
  if (category === 'other' && d.edgeResponseStatus !== 403) continue;
  hostile += count;
  add(hostileByDay, String(d.date), count);
  add(categories, category, count);
  if (!categoryByDay.has(category)) categoryByDay.set(category, new Map());
  add(categoryByDay.get(category)!, String(d.date), count);
  if (category !== 'other') {
    add(targets, target, count);
    targetCategory.set(target, category);
  }
  const code = countryCode(String(d.clientCountryName));
  if (code) add(countries, code, count);
  const client = classifyClient(String(d.userAgent));
  add(clients, client, count);
  if (!split.has(category)) split.set(category, { targets: new Map(), countries: new Map(), clients: new Map() });
  const s = split.get(category)!;
  if (category !== 'other') add(s.targets, target, count);
  if (code) add(s.countries, code, count);
  add(s.clients, client, count);
}

const out: Observatory = {
  generatedAt: now.toISOString(),
  from: from.toISOString().slice(0, 10),
  // Last day in the window, not the exclusive midnight bound.
  to: new Date(to.getTime() - 1).toISOString().slice(0, 10),
  totals: { requests, hostile, stopped, maze },
  daily: [...requestsByDay.keys()].sort().map((date) => ({
    date,
    requests: requestsByDay.get(date) ?? 0,
    hostile: hostileByDay.get(date) ?? 0,
  })),
  // Per-category daily counts, aligned with `daily`, for the trend lines.
  categoryDaily: CATEGORIES.filter((c) => categoryByDay.has(c)).map((category) => ({
    category,
    counts: [...requestsByDay.keys()].sort().map((date) => categoryByDay.get(category)?.get(date) ?? 0),
  })),
  categories: CATEGORIES.map((category) => ({ category, count: categories.get(category) ?? 0 })).filter((c) => c.count > 0),
  targets: top(targets, 10).map(([target, count]) => ({ target, category: targetCategory.get(target)!, count })),
  byCategory: CATEGORIES.filter((c) => split.has(c)).map((category) => {
    const s = split.get(category)!;
    return {
      category,
      targets: top(s.targets, 5).map(([target, count]) => ({ target, count })),
      countries: top(s.countries, 5).map(([code, count]) => ({ code, count })),
      clients: top(s.clients, 5).map(([label, count]) => ({ label, count })),
    };
  }),
  countries: top(countries, 10).map(([code, count]) => ({ code, count })),
  clients: top(clients, 8).map(([label, count]) => ({ label, count })),
  defenses: top(defenses, 10).map(([layer, count]) => ({ layer, count })),
};

writeFileSync(new URL('../src/data/observatory.json', import.meta.url), `${JSON.stringify(out, null, 2)}\n`);
console.log(`observatory: ${requests} requests, ${hostile} hostile, ${stopped} stopped, ${out.from} → ${out.to}`);
