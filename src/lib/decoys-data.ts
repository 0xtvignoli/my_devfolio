import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseDecoys, type Decoys } from '@/lib/decoys';

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
