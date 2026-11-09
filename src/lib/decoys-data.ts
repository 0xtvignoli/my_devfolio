import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseDecoys, type Decoys } from '@/lib/decoys';

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
      // no-store: a fetch cached for the same hour as the page is stale at every
      // regeneration, so the page would lag one window behind. The page's
      // revalidate (force-static keeps it ISR) still limits this to once an hour.
      const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
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
