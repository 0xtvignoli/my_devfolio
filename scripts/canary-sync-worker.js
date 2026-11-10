// Cloudflare Worker "canary-sync" with a cron trigger "*/5 * * * *": pings the canary sync every
// 5 minutes. It holds no secret: the sync runs on Vercel, where the canary credentials live.
// workers.dev and preview URLs are disabled: it only runs on the cron. The log line shows up in
// the Worker's Observability → Logs ("sync 200 {"synced":true}" when it did the sync).
const worker = {
  async scheduled(_event, _env, ctx) {
    ctx.waitUntil(
      fetch('https://tvignoli.com/api/canaries/sync', { headers: { 'User-Agent': 'tvignoli-canary-sync' } })
        .then(async (r) => console.log('sync', r.status, (await r.text()).slice(0, 120)))
        .catch((e) => console.log('sync error', String(e))),
    );
  },
};
export default worker;
