import { takeSyncTurn } from '@/lib/canary-store';
import { liveCanaries } from '@/lib/canaries-live';

/**
 * Called every minute by a Cloudflare cron Worker (scripts/canary-sync-worker.js), so the
 * store sees every hit before canarytokens.org drops it (it keeps 50 per key). Public and
 * GET on purpose: the edge refuses POST outside the contact form, and takeSyncTurn caps it
 * to one run per 50 s whoever calls. Returns no data, only whether this call did the sync.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await takeSyncTurn())) return Response.json({ synced: false }, { headers: { 'Cache-Control': 'no-store' } });
  await liveCanaries();
  return Response.json({ synced: true }, { headers: { 'Cache-Control': 'no-store' } });
}
