// mini-lab: a tiny backend that lets a browser terminal run a CURATED set of
// commands against a shared floci (local AWS emulator), isolated per session by
// a 12-digit account id. No arbitrary command execution: the client only sends
// an `action` key from the allowlist; commands run via spawn() (no shell).
//
// Deploy on a host you own (Fly.io/VPS) — NOT on Vercel (needs a long-lived
// process + reachable floci). Everything hits floci only; no real cloud, no
// cloud spend, no credentials.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { ACTIONS } from './actions.mjs';

const PORT = Number(process.env.PORT) || 8080;
const FLOCI_ENDPOINT = process.env.FLOCI_ENDPOINT || 'http://localhost:4566';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const CMD_TIMEOUT_MS = Number(process.env.CMD_TIMEOUT_MS) || 30_000;
const RATE_LIMIT = Number(process.env.RATE_LIMIT) || 30; // requests / window / ip
const RATE_WINDOW_MS = 60_000;
const MAX_HEAVY = Number(process.env.MAX_HEAVY) || 3; // concurrent heavy (k3s) actions

// Global guard for `heavy` actions (each spins a real k3s container) so a public
// deployment can't be exhausted. ponytail: single counter; add per-IP heavy caps
// + idle cluster reaping if this ever runs hot.
let heavyRunning = 0;

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function sendJson(res, code, obj) {
  cors(res);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 4096) req.destroy(); // hard cap; body is tiny
    });
    req.on('end', () => resolve(data));
  });
}

// A session's isolated (emulated) account: any 12-digit id maps to its own
// isolated AWS state inside floci. Math.random is fine here (backend, not a
// security token — it only namespaces emulated state).
function newAccountId() {
  let s = String(1 + Math.floor(Math.random() * 8)); // 1-8, avoid leading zero
  for (let i = 0; i < 11; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function runStep(step, env, res, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(step[0], step.slice(1), { env });
    const timer = setTimeout(() => {
      res.write('\n[timed out]\n');
      child.kill('SIGKILL');
    }, timeoutMs);
    child.stdout.on('data', (d) => res.write(d));
    child.stderr.on('data', (d) => res.write(d));
    child.on('error', (e) => res.write(`\n[error] ${e.message}\n`));
    child.on('close', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

const server = createServer(async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const url = (req.url || '').split('?')[0];

  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    return res.end();
  }
  if (url === '/health') return sendJson(res, 200, { ok: true });
  if (url === '/actions') {
    return sendJson(res, 200, Object.fromEntries(
      Object.entries(ACTIONS).map(([k, v]) => [k, v.label])
    ));
  }
  if (rateLimited(ip)) return sendJson(res, 429, { error: 'rate limit reached, slow down' });

  if (url === '/session' && req.method === 'POST') {
    return sendJson(res, 200, { accountId: newAccountId() });
  }

  if (url === '/run' && req.method === 'POST') {
    let payload;
    try {
      payload = JSON.parse(await readBody(req) || '{}');
    } catch {
      return sendJson(res, 400, { error: 'invalid JSON' });
    }
    const { accountId, action } = payload;
    if (!/^\d{12}$/.test(String(accountId || ''))) {
      return sendJson(res, 400, { error: 'accountId must be 12 digits' });
    }
    const act = ACTIONS[action];
    if (!act) return sendJson(res, 400, { error: 'unknown action' });
    if (act.heavy && heavyRunning >= MAX_HEAVY) {
      return sendJson(res, 429, { error: 'lab at capacity for heavy actions, try again shortly' });
    }

    cors(res);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    const env = {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      AWS_ENDPOINT_URL: FLOCI_ENDPOINT,
      AWS_ACCESS_KEY_ID: accountId,
      AWS_SECRET_ACCESS_KEY: 'x',
      AWS_REGION: 'us-east-1',
      AWS_DEFAULT_REGION: 'us-east-1',
      AWS_PAGER: '',
    };
    const timeoutMs = act.timeoutMs || CMD_TIMEOUT_MS;
    // Script actions run a FIXED bundled script (no user input); argv actions run
    // fixed argv arrays. Either way nothing user-controlled reaches the command.
    const steps = act.script
      ? [['bash', new URL(`./${act.script}`, import.meta.url).pathname]]
      : act.steps;

    if (act.heavy) heavyRunning++;
    try {
      for (const step of steps) {
        if (!act.script) res.write(`$ ${step.join(' ')}\n`);
        await runStep(step, env, res, timeoutMs);
      }
    } finally {
      if (act.heavy) heavyRunning--;
    }
    return res.end();
  }

  sendJson(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`mini-lab listening on :${PORT} → floci ${FLOCI_ENDPOINT}`);
});
