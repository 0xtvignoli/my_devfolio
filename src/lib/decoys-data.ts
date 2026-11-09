import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseDecoys, type Decoys } from '@/lib/decoys';

/** The VM aggregates every hour (:05 UTC); pages that read it regenerate at most this often. */
export const DECOYS_REVALIDATE = 3600;
const MAX_BYTES = 200_000;

/**
 * decoys.json straight from the VM's bucket, re-read at most every hour, so the
 * decoy pages don't wait for the nightly build. Falls back to the copy written at
 * build when DECOYS_URL is missing (local, previews) or the fetch or the file fails.
 * [SEC] Same rules as the build: size cap, then parseDecoys field by field. The
 * URL is a read-only link that stays server-side; the VM never learns anything of Vercel.
 */
export async function liveDecoys(): Promise<Decoys | null> {
  const url = process.env.DECOYS_URL;
  if (url) {
    try {
      const res = await fetch(url, { next: { revalidate: DECOYS_REVALIDATE }, signal: AbortSignal.timeout(10_000) });
      const text = res.ok ? await res.text() : '';
      const data = text && text.length <= MAX_BYTES ? parseDecoys(JSON.parse(text)) : null;
      if (data) return data;
    } catch {
      // fall through to the build copy
    }
  }
  return readDecoys();
}

/**
 * src/data/decoys.json is written by scripts/decoys.ts at build time when
 * DECOYS_URL is set, and is not in git. Pages read it at build: null when the
 * file is missing (local builds, no data yet) or out of shape.
 */
export function readDecoys(): Decoys | null {
  try {
    return parseDecoys(JSON.parse(readFileSync(join(process.cwd(), 'src/data/decoys.json'), 'utf8')));
  } catch {
    return null;
  }
}
