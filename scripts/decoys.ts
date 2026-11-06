#!/usr/bin/env bun
/**
 * Builds src/data/decoys.json from the decoy VM's daily aggregate (Lab phase 2).
 *
 *   DECOYS_URL=<read-only pre-authenticated link to decoys.json> bun scripts/decoys.ts
 *
 * Like the Observatory: without the variable, or when the download or the
 * validation fails, the committed file stays and the deploy goes on.
 * [SEC] The file is written by a machine that invites attackers in, so it is
 * parsed by lib/decoys and only that clean copy is written.
 */
import { writeFileSync } from 'node:fs';
import { parseDecoys } from '../src/lib/decoys';

const url = process.env.DECOYS_URL;
if (!url) {
  console.log('decoys: no DECOYS_URL, keeping the committed data');
  process.exit(0);
}

try {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (text.length > 200_000) throw new Error('file too large');
  const data = parseDecoys(JSON.parse(text));
  if (!data) throw new Error('file out of shape');
  writeFileSync(new URL('../src/data/decoys.json', import.meta.url), `${JSON.stringify(data, null, 2)}\n`);
  console.log(`decoys: ${data.ssh.sessions} SSH sessions, ${data.http.requests} HTTP requests (${data.from} → ${data.to})`);
} catch (e) {
  console.warn(`decoys: keeping the committed data (${e instanceof Error ? e.message : e})`);
}
