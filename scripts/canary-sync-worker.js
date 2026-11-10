// Cloudflare Worker with a cron trigger "*/5 * * * *": pings the canary sync every 5 minutes.
// It holds no secret: the sync runs on Vercel, where the canary credentials live.
const worker = {
  async scheduled(_event, _env, ctx) {
    ctx.waitUntil(fetch('https://tvignoli.com/api/canaries/sync', { headers: { 'User-Agent': 'tvignoli-canary-sync' } }));
  },
};
export default worker;
